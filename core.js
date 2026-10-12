(function (root) {
  'use strict';
  const conditionCatalog = typeof module !== 'undefined' && module.exports ? require('./recruitment-catalog.js') : null;
  const regionCatalog = typeof module !== 'undefined' && module.exports ? require('./china-regions.js') : null;
  const normalize = value => String(value ?? '').trim().toLocaleLowerCase();
  const normalizeDepartment = value => normalize(value).replace(/^(?:市场)?销售(?:部)?$/, '市场销售');
  const DEPARTMENTS = Object.freeze(['前厅', '餐饮', '厨房', '客房', '市场销售', '人力资源', '财务', '预订', '康体', '工程', '安保', '其他']);
  // Both sides choose from the same vocabulary; a hotel requirement never
  // silently upgrades a student's self-described qualification.
  const EDUCATION_LEVELS = Object.freeze(['中职 / 中专', '高职 / 专科', '本科', '硕士及以上', '其他']);
  const ENGLISH_LEVELS = Object.freeze(['基础交流：能进行简单日常对话', '熟练沟通：能处理日常服务交流', '流利交流：能独立应对复杂沟通']);
  const INTERNSHIP_MONTH_OPTIONS = Object.freeze(['不限', ...Array.from({length: 12}, (_, index) => `至少${index + 1}个月`)]);
  function hotelGroupOptions(groups = []) {
    const seen = new Set();
    const options = (Array.isArray(groups) ? groups : []).filter(group => group && typeof group.id === 'string' && typeof group.name === 'string' && group.id !== 'independent' && !seen.has(group.id) && seen.add(group.id)).map(({ id, name }) => ({ id, name }));
    return [...options, { id: 'independent', name: '独立酒店 / 其他集团' }];
  }
  // An explicit negative or zero is useful information. Placeholder prose is not.
  function answered(value) {
    if (typeof value === 'boolean') return true;
    if (typeof value === 'number') return Number.isFinite(value) && value >= 0;
    if (Array.isArray(value)) return value.some(answered);
    if (typeof value !== 'string') return false;
    const text = value.trim();
    return Boolean(text) && !/^(?:待|等待)(?!遇|客)/.test(text)
      && !/(?:待确认|待核实|待补充|待填写|待定|未知|未填写|未提供|未明确|暂无|另议|面议|请输入|请填写|请选择|(?:例如|例)[:：]|示例[:：]|模板占位|根据实际情况|按酒店规定)/i.test(text)
      && !/^(?:[-—_…\s]+|n\/?a|null|undefined|unknown|tbd)$/i.test(text);
  }
  function jobCompleteness(job = {}) {
    const snapshot = job.conditionSnapshot || {}, v = snapshot.conditions?.values || {};
    const first = (...values) => values.find(answered);
    const numeric = value => value !== null && value !== undefined && String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0;
    if (snapshot.conditions?.formVersion === '5.6-simple') {
      const keys = (root.JiulvRecruitmentCatalog || conditionCatalog)?.SIMPLE_CONDITION_KEYS || [];
      const numerical = new Set(['stipendFirst6','stipendFrom7','dormOccupancy','commuteMinutes','mealsPerDay']);
      const facts = [first(snapshot.role,job.role,job.departments),first(snapshot.demand,job.demand),first(snapshot.startMonth,snapshot.startDate,job.startMonth,job.startDate),first(snapshot.durationMonths,snapshot.endDate,job.durationMonths,job.duration)];
      // Only fields in this version count. Formatted summaries and preserved old fields
      // do not fill gaps or award a second point for the same answer.
      for (const key of keys) facts.push(numerical.has(key) ? numeric(v[key]) ? true : undefined : v[key]);
      return facts.filter(answered).length;
    }
    // Count comparable answers once; amount, brand popularity and descriptive length
    // never earn extra points. Published snapshots outrank formatted fallback prose.
    const facts = [
      first(snapshot.role, job.role, job.departments), first(snapshot.demand, job.demand),
      first(snapshot.startDate, job.startDate), first(snapshot.endDate, job.endDate, job.duration),
      numeric(v.stipend) || numeric(job.salaryMin) ? true : undefined,
      v.payDay, first(v.language, job.languages), first(v.education, job.education),
      first(v.workHours, job.schedule), v.daysOff, first(v.rotationType, job.rotation),
      v.overtime, v.liabilityInsurance, v.internshipInsurance, v.supplementalMedicalInsurance,
      first(v.dormAvailable, job.dorm), first(v.commuteMinutes, job.commute),
      first(v.mealsPerDay, job.meals), v.dayOffMeals, v.mealCost
    ];
    // When no dorm is provided these follow-up details are inapplicable, not missing.
    const noDorm = v.dormAvailable === '不提供住宿';
    facts.push(noDorm ? true : v.dormOccupancy, noDorm ? true : v.dormCost,
      noDorm ? true : v.privateBathroom, noDorm ? true : v.commuteMode);
    return facts.filter(answered).length;
  }
  function filterJobs(jobs, filters = {}) {
    const query = normalize(filters.query);
    const values = value => Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];
    const cities = values(filters.cities || filters.city), departments = values(filters.departments || filters.department);
    const groups = values(filters.groups);
    const regions = root.JiulvRegions || regionCatalog;
    const sameCity = (actual, selected) => regions?.matchesCity
      ? regions.matchesCity(actual, selected)
      : normalize(actual).replace(/市$/, '') === normalize(selected).replace(/市$/, '');
    const result = jobs.filter(job => (!cities.length || cities.some(city => sameCity(job.city, city)))
      && (!departments.length || departments.some(value => (job.departments || []).some(department => normalizeDepartment(department) === normalizeDepartment(value))))
      && (!groups.length || groups.includes(job.groupId))
      && (!query || normalize([job.name, job.english, job.role, job.city, job.district, job.groupName, job.brandName, ...(job.departments || []), ...(job.departments || []).map(normalizeDepartment)].join(' ')).includes(query)));
    // registeredHotel is supplied only after the calling catalog checks the account
    // and its published snapshot. A plan ID alone is never evidence of registration.
    return result.map((job, index) => ({ job, index, completeness: jobCompleteness(job) }))
      .sort((a, b) => Number(b.job.registeredHotel === true) - Number(a.job.registeredHotel === true)
        || b.completeness - a.completeness || a.index - b.index).map(item => item.job);
  }
  function toggleCompare(ids, id, max = 3) {
    if (ids.includes(id)) return { ids: ids.filter(x => x !== id), limited: false };
    if (ids.length >= max) return { ids: [...ids], limited: true };
    return { ids: [...ids, id], limited: false };
  }
  function validIds(value, jobs) {
    return Array.isArray(value) ? [...new Set(value.filter(id => jobs.some(job => job.id === id)))] : [];
  }
  const api = { filterJobs, jobCompleteness, toggleCompare, validIds, DEPARTMENTS, EDUCATION_LEVELS, ENGLISH_LEVELS, INTERNSHIP_MONTH_OPTIONS, hotelGroupOptions };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.JiulvCore = api;
})(typeof window !== 'undefined' ? window : this);
