/* One saved publication is the source of both the public opportunity and an invitation.
   Local demo only: no network, account verification or cross-device publication. */
(function (root) {
  'use strict';
  const SIMPLE_FORM_VERSION = '5.6-simple';
  const SIMPLE_CONDITION_KEYS = Object.freeze(['educationRequirement', 'minimumDurationMonths', 'englishRequirement', 'heightRequirement', 'halalMeals', 'workHours', 'rotationType', 'stipendFirst6', 'stipendFrom7', 'otherSubsidies', 'completionBonus', 'payDay', 'liabilityInsurance', 'otherInsurance', 'dormOccupancy', 'dormUtilities', 'dormFacilities', 'dormCommonFacilities', 'commuteMinutes', 'commuteMode', 'mealsPerDay']);
  const CONDITION_PHOTO_LIMITS = Object.freeze({accommodation:5,dormCommon:5,meals:3,commute:3});
  const CONDITION_PHOTO_LABELS = Object.freeze({accommodation:'宿舍',dormCommon:'宿舍公区',meals:'员工餐厅',commute:'通勤'});
  const SNAPSHOT_VALUE_KEYS = ['language', 'workHours', 'daysOff', 'rotationType', 'education', 'rotationConditions', 'positionNotes', 'stipend', 'payDay', 'overtime', 'liabilityInsurance', 'internshipInsurance', 'supplementalMedicalInsurance', 'otherInsurance', 'stipendConditions', 'overtimeDetails', 'insuranceDetails', 'dormAvailable', 'dormOccupancy', 'dormCost', 'commuteKm', 'commuteMinutes', 'commuteMode', 'mealsPerDay', 'dayOffMeals', 'mealCost', 'privateBathroom', 'dormFacilities', 'dormNotes', 'commuteNotes', 'nightMeals', 'mealHours', 'mealNotes', 'validUntil', 'hotelAddress', ...SIMPLE_CONDITION_KEYS.filter(key => !['workHours','rotationType','payDay','liabilityInsurance','otherInsurance','dormOccupancy','dormFacilities','commuteMinutes','commuteMode','mealsPerDay'].includes(key))];
  const text = (value, length = 1500) => typeof value === 'string' ? value.trim().slice(0, length) : '';
  const clone = value => JSON.parse(JSON.stringify(value));
  const validMonth = value => /^\d{4}-(0[1-9]|1[0-2])$/.test(value || '');
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  function scheduleOf(source = {}) {
    const monthMode = source.schedulePrecision === 'month' || Object.hasOwn(source, 'startMonth') || Object.hasOwn(source, 'durationMonths');
    if (!monthMode) return { schedulePrecision: 'day', startDate: text(source.startDate, 10), endDate: text(source.endDate, 10) };
    const startMonth = text(source.startMonth, 7), durationMonths = String(source.durationMonths ?? '');
    const validDuration = durationMonths === 'unlimited' || /^(?:[1-9]|1[0-2])$/.test(durationMonths);
    let endDate = '';
    if (validMonth(startMonth) && validDuration && durationMonths !== 'unlimited') {
      const [year, month] = startMonth.split('-').map(Number);
      endDate = new Date(Date.UTC(year, month - 1 + Number(durationMonths), 0)).toISOString().slice(0, 10);
    }
    return { schedulePrecision: 'month', startMonth, durationMonths, startDate: validMonth(startMonth) ? `${startMonth}-01` : '', endDate };
  }
  function normalizeHotelProfile(source) {
    if (!source || typeof source !== 'object') return null;
    const out = {};
    for (const key of ['intro', 'roomCount', 'restaurants', 'spa', 'highlights']) out[key] = text(source[key]);
    try { const url = new URL(source.officialUrl); out.officialUrl = ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { out.officialUrl = ''; }
    out.photos = (Array.isArray(source.photos) ? source.photos : []).filter(p => typeof p?.dataUrl === 'string' && /^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(p.dataUrl) && p.dataUrl.length < 2850000).slice(0, 6).map(p => ({name: text(p.name, 180), dataUrl: p.dataUrl}));
    out.revision = Math.max(0, Math.floor(Number(source.revision) || 0));
    out.savedAt = text(source.savedAt, 40); out.publishedAt = text(source.publishedAt, 40);
    return out;
  }
  function savedHotelProfile(accountId, read) {
    const record = read(`hotel:information:${accountId}`, null);
    if (!accountId || record?.accountId !== accountId || !record.publishedProfile?.publishedAt) return null;
    return normalizeHotelProfile(record.publishedProfile);
  }
  const idFor = (accountId, planId) => `plan-job:${accountId}:${planId}`;
  function normalizeSnapshot(source) {
    if (!source || typeof source !== 'object' || !source.planId || !source.hotelAccountId) return null;
    const values = {}, photos = {};
    for (const key of SNAPSHOT_VALUE_KEYS) if (typeof source.conditions?.values?.[key] === 'string') values[key] = text(source.conditions.values[key]);
    for (const group of ['accommodation', 'commute', 'meals', ...(source.conditions?.formVersion === SIMPLE_FORM_VERSION || Array.isArray(source.conditions?.photos?.dormCommon) ? ['dormCommon'] : [])]) photos[group] = (Array.isArray(source.conditions?.photos?.[group]) ? source.conditions.photos[group] : []).filter(p => typeof p?.dataUrl === 'string' && /^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(p.dataUrl) && p.dataUrl.length < 2850000).slice(0, CONDITION_PHOTO_LIMITS[group] || 3).map(p => ({ name: text(p.name, 180), dataUrl: p.dataUrl }));
    const snapshot = { schemaVersion: '5.5-plan-snapshot', planId: text(source.planId, 120), hotelAccountId: text(source.hotelAccountId, 120), hotelId: text(source.hotelId || source.hotelAccountId, 120), planRevision: Math.max(0, Math.floor(Number(source.planRevision ?? source.revision) || 0)), hotelName: text(source.hotelName, 200), hotelCity: text(source.hotelCity, 100), name: text(source.name, 80), role: text(source.role, 100), demand: Number.isInteger(Number(source.demand)) && Number(source.demand) > 0 ? Number(source.demand) : '', ...scheduleOf(source), department: text(source.department, 40), note: text(source.note), brandId: text(source.brandId, 100), groupId: text(source.groupId, 100), conditions: { values, photos, revision: Math.max(0, Math.floor(Number(source.conditions?.revision) || 0)), savedAt: text(source.conditions?.savedAt, 40) }, publishedAt: text(source.publishedAt, 40) };
    if (source.conditions?.formVersion === SIMPLE_FORM_VERSION) snapshot.conditions.formVersion = SIMPLE_FORM_VERSION;
    snapshot.revision = snapshot.planRevision;
    snapshot.jobId = idFor(snapshot.hotelAccountId, snapshot.planId);
    return snapshot;
  }
  function makeSnapshot(plan, account, now = new Date().toISOString()) {
    return normalizeSnapshot({ ...plan, planId: plan.id, planRevision: plan.revision, hotelAccountId: account.id, hotelId: account.hotelId || account.id, hotelName: account.hotelName, hotelCity: account.hotelCity, groupId: account.groupId || plan.groupId, brandId: Object.hasOwn(account, 'brandId') ? account.brandId : plan.brandId, publishedAt: now });
  }
  function publicationError(plan, account) {
    if (!account?.id || !text(account.hotelName) || !text(account.hotelCity)) return '酒店名称或城市待补全，请联系酒旅之星协助修改账户资料。';
    if (!text(plan?.name) || !text(plan?.role)) return '发布前请填写计划名称和招聘岗位。';
    if (!Number.isInteger(Number(plan.demand)) || Number(plan.demand) < 1 || Number(plan.demand) > 9999) return '发布前请填写招聘人数。';
    const schedule = scheduleOf(plan);
    if (schedule.schedulePrecision === 'month') {
      if (!validMonth(schedule.startMonth) || !/^(?:[1-9]|1[0-2]|unlimited)$/.test(schedule.durationMonths)) return '发布前请选择实习开始年月与实习时长。';
    } else if (!validDate(schedule.startDate) || !validDate(schedule.endDate) || schedule.startDate > schedule.endDate) return '发布前请填写有效的实习起止日期。';
    const minimum = plan.conditions?.formVersion === SIMPLE_FORM_VERSION ? plan.conditions.values?.minimumDurationMonths : '';
    if (schedule.schedulePrecision === 'month' && /^(?:[1-9]|1[0-2])$/.test(String(minimum ?? '')) && /^(?:[1-9]|1[0-2])$/.test(schedule.durationMonths) && Number(schedule.durationMonths) < Number(minimum)) return `当前计划为${schedule.durationMonths}个月，短于酒店最低实习时长（至少${minimum}个月）。请调整计划时长，或前往实习机会中的实习信息修改最低要求后再发布。`;
    if (plan.conditions?.formVersion !== SIMPLE_FORM_VERSION && plan.conditions?.values?.validUntil && !validDate(plan.conditions.values.validUntil)) return '请核对招聘信息有效日期。';
    return '';
  }
  function activeSnapshot(plan, account, today = new Date().toISOString().slice(0, 10)) {
    if (plan?.publication?.state !== 'published') return null;
    const snap = normalizeSnapshot(plan.publication.snapshot);
    if (!snap || snap.planId !== plan.id || snap.hotelAccountId !== account.id || publicationError(snap, account)) return null;
    if ((snap.endDate && snap.endDate < today) || (snap.conditions.formVersion !== SIMPLE_FORM_VERSION && snap.conditions.values.validUntil && snap.conditions.values.validUntil < today)) return null;
    return snap;
  }
  const displayValue = value => value === null || value === undefined || String(value).trim() === '' ? '待确认' : String(value).trim();
  const withUnit = (value, unit) => /^\d+(?:\.\d+)?$/.test(String(value ?? '').trim()) ? `${String(value).trim()} ${unit}` : displayValue(value);
  const allowanceAmount = value => /^\d+(?:\.\d+)?$/.test(String(value ?? '').trim()) && Number.isFinite(Number(value)) ? Number(value) : null;
  const minimumDurationLabel = value => value === '不限' ? '不限' : /^(?:[1-9]|1[0-2])$/.test(String(value ?? '')) ? `至少${value}个月` : '待确认';
  function conditionDisplayGroups(conditions = {}) {
    const v = conditions.values || {}, simple = conditions.formVersion === SIMPLE_FORM_VERSION;
    const specs = simple ? [
      ['work','岗位要求', [['educationRequirement','学历要求'],['minimumDurationMonths','最低实习时长'],['englishRequirement','英语要求'],['heightRequirement','身高要求'],['workHours','排班方式'],['rotationType','是否提供轮岗']]],
      ['pay','津贴与保险', [['stipendFirst6','前6个月基础津贴','元 / 月'],['stipendFrom7','第7个月起基础津贴','元 / 月'],['otherSubsidies','其他补贴'],['completionBonus','一次性奖励金'],['payDay','发薪日期'],['liabilityInsurance','是否提供雇主责任险'],['otherInsurance','其他补充保险']]],
      ['dorm','宿舍与设施', [['dormOccupancy','每间宿舍人数','人'],['dormUtilities','宿舍水电费'],['dormFacilities','宿舍内设施'],['dormCommonFacilities','宿舍公区设施']]],
      ['life','通勤与餐食', [['commuteMinutes','单程通勤时间','分钟'],['commuteMode','通勤交通方式'],['mealsPerDay','每日供餐次数','餐'],['halalMeals','是否有清真餐']]]
    ] : [
      ['work','岗位与安排', [['language','语言要求'],['workHours','每日工时 / 排班方式'],['daysOff','月休天数','天'],['rotationType','轮岗安排'],['education','学历与专业要求'],['rotationConditions','轮岗条件 / 部门 / 时间'],['positionNotes','学校手续、带教等补充']]],
      ['pay','津贴与保险', [['stipend','基础津贴','元 / 月'],['payDay','发薪日期与对应月份'],['overtime','加班安排'],['liabilityInsurance','雇主责任险'],['internshipInsurance','实习险'],['supplementalMedicalInsurance','补充医疗险'],['otherInsurance','其他保险'],['stipendConditions','津贴调整条件与扣费'],['overtimeDetails','加班计价 / 调休规则'],['insuranceDetails','承保期间、范围等补充']]],
      ['dorm','住宿条件', [['dormAvailable','住宿安排'],['dormOccupancy','每间宿舍人数','人'],['dormCost','住宿、水电与押金费用'],['privateBathroom','独立卫浴'],['dormFacilities','宿舍设施'],['dormNotes','住宿备注与照片说明']]],
      ['commute','通勤条件', [['commuteKm','宿舍到酒店距离','公里'],['commuteMinutes','单程通勤时间','分钟'],['commuteMode','主要交通方式'],['commuteNotes','通勤备注与路线说明']]],
      ['meals','员工餐食', [['mealsPerDay','工作日每日供餐次数','餐'],['dayOffMeals','休息日供餐'],['mealCost','餐食费用'],['nightMeals','夜班餐食安排'],['mealHours','供餐时段 / 特殊饮食'],['mealNotes','餐食备注与照片说明']]],
      ['information','补充信息', [['hotelAddress','酒店地址'],['validUntil','招聘信息预计有效至']]]
    ];
    return specs.map(([id,title,fields]) => ({id,title,rows:fields.filter(([key]) => simple || (v[key] !== undefined && v[key] !== null && String(v[key]).trim() !== '')).map(([key,label,unit]) => [label,key === 'minimumDurationMonths' ? minimumDurationLabel(v[key]) : unit ? withUnit(v[key],unit) : displayValue(v[key])])})).filter(group => group.rows.length);
  }
  function toJob(snapshot, groups = []) {
    const snap = normalizeSnapshot(snapshot); if (!snap) return null;
    const v = snap.conditions.values, simple = snap.conditions.formVersion === SIMPLE_FORM_VERSION, known = value => value || '待确认';
    const group = groups.find(g => g.id === snap.groupId) || (!snap.groupId ? groups.find(g => g.brands?.some(b => b.id === snap.brandId)) : null);
    const brand = group?.brands?.find(b => b.id === snap.brandId);
    const amount = simple ? allowanceAmount(v.stipendFirst6) : v.stipend !== undefined && v.stipend !== '' && Number.isFinite(Number(v.stipend)) ? Number(v.stipend) : null;
    const district = snap.hotelCity.split(/[·,，/\s]+/).map(x => x.trim()), city = (district[0] || snap.hotelCity).replace(/市$/, '');
    const departments = ['前厅', '餐饮', '厨房', '客房', '人力资源', '财务', '市场销售', '预订', '康体', '工程', '安保', '其他'].filter(item => snap.department === item || snap.role.includes(item));
    if (!departments.length && /前台|礼宾|宾客关系/.test(snap.role)) departments.push('前厅');
    if (!departments.length) departments.push(snap.role);
    const dorm = simple ? (Number.isInteger(allowanceAmount(v.dormOccupancy)) && allowanceAmount(v.dormOccupancy) > 0 ? `${v.dormOccupancy}人间` : '') : [v.dormAvailable, v.dormOccupancy ? `${v.dormOccupancy}人间` : ''].filter(Boolean).join(' · ');
    const commute = [simple ? (allowanceAmount(v.commuteMinutes) !== null ? `约${v.commuteMinutes}分钟` : '') : v.commuteMinutes ? `约${v.commuteMinutes}分钟` : '', v.commuteMode].filter(Boolean).join(' · ');
    const meals = [simple ? (Number.isInteger(allowanceAmount(v.mealsPerDay)) ? `每日${v.mealsPerDay}餐` : '') : v.mealsPerDay ? `每日${v.mealsPerDay}餐` : '', simple ? '' : v.mealCost].filter(Boolean).join(' · ');
    const phases = simple ? {allowancePhases:[{label:'前6个月',amount:allowanceAmount(v.stipendFirst6)},{label:'第7个月起',amount:allowanceAmount(v.stipendFrom7)}]} : {};
    return { id: snap.jobId, hotelId: snap.hotelId, hotelAccountId: snap.hotelAccountId, planId: snap.planId, planRevision: snap.planRevision, conditionSnapshot: snap, localPublication: true, name: snap.hotelName, english: brand?.english || '', city, district: district.slice(1).join(' · ') || '区域待确认', role: snap.role, departments, groupId: group?.id || snap.groupId || '', groupName: group?.name || (snap.groupId === 'independent' ? '独立酒店 / 其他集团' : '酒店集团待确认'), brandId: brand?.id || '', brandName: brand?.name || '独立酒店 / 品牌待确认', salaryMin: amount, salaryMax: amount, ...phases, salaryNote: simple ? '前6个月基础津贴' : known(v.stipendConditions || v.payDay), duration: snap.schedulePrecision === 'month' ? `${snap.startMonth} 起 · ${snap.durationMonths === 'unlimited' ? '时长不限' : `${snap.durationMonths}个月`}` : `${snap.startDate.slice(0,7)} 至 ${snap.endDate.slice(0,7)}`, startMonth: snap.startMonth || '', durationMonths: snap.durationMonths || '', schedulePrecision: snap.schedulePrecision, startDate: snap.startDate, endDate: snap.endDate, demand: snap.demand, education: known(simple ? v.educationRequirement : v.education), educationRequirement: simple ? (v.educationRequirement || '') : '', minimumDurationMonths: simple ? (v.minimumDurationMonths || '') : '', minimumDuration: simple ? minimumDurationLabel(v.minimumDurationMonths) : '待确认', languages: known(simple ? v.englishRequirement : v.language), dorm: known(dorm), meals: known(meals), commute: known(commute), rotation: simple ? (v.rotationType === '是' ? '提供轮岗' : v.rotationType === '否' ? '不提供轮岗' : '待确认') : known(v.rotationType), schedule: known(v.workHours), notes: [snap.note, simple ? '' : v.positionNotes].filter(Boolean), evidenceStatus: '酒店填报 · 本机演示', sourceName: '酒店招聘计划', sourceId: snap.planId, checkedAt: snap.publishedAt.slice(0, 10), recruitmentStatus: 'published' };
  }
  function publishedJobs(accounts, read, groups = [], today) {
    const result = [], seen = new Set();
    for (const account of Array.isArray(accounts) ? accounts : []) {
      if (!account?.id || seen.has(account.id)) continue; seen.add(account.id);
      const library = read(`hotel:plans:${account.id}`, null);
      if (library?.accountId !== account.id || !Array.isArray(library.plans)) continue;
      const plans = new Set();
      for (const plan of library.plans) { if (!plan?.id || plans.has(plan.id)) continue; plans.add(plan.id); const snapshot = activeSnapshot(plan, account, today); if (snapshot) result.push({ ...toJob(snapshot, groups), hotelProfile: savedHotelProfile(account.id, read) }); }
    }
    return result;
  }
  const runtime = () => root.JiulvDemo;
  function getPublishedJobs() { const demo = runtime(); if (!demo) return []; return publishedJobs(demo.getAccounts?.().hotels || [], demo.read, root.JIULV_HOTEL_GROUPS || []); }
  function getPlanSnapshot(planId, hotelAccountId) {
    const demo = runtime(), id = hotelAccountId || demo?.getHotelAccount?.()?.id;
    const job = getPublishedJobs().find(item => item.hotelAccountId === id && item.planId === planId);
    return job ? clone(job.conditionSnapshot) : null;
  }
  function getHotelProfile(accountId) { const demo = runtime(); return demo && accountId ? savedHotelProfile(accountId, demo.read) : null; }
  function getInvitePlans() { const id = runtime()?.getHotelAccount?.()?.id; return id ? getPublishedJobs().filter(job => job.hotelAccountId === id) : []; }
  const api = { SIMPLE_FORM_VERSION, SIMPLE_CONDITION_KEYS, CONDITION_PHOTO_LIMITS, CONDITION_PHOTO_LABELS, conditionDisplayGroups, validMonth, scheduleOf, normalizeHotelProfile, savedHotelProfile, getHotelProfile, SNAPSHOT_VALUE_KEYS, idFor, normalizeSnapshot, makeSnapshot, publicationError, activeSnapshot, toJob, publishedJobs, getPublishedJobs, getPlanSnapshot, getInvitePlans };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.JiulvRecruitmentCatalog = api;
})(typeof window !== 'undefined' ? window : this);
