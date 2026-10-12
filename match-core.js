(function (root) {
  'use strict';
  const DAY = 86400000;
  const regionCatalog = typeof module !== 'undefined' && module.exports ? require('./china-regions.js') : null;
  function dateValid(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
    const date = new Date(value + 'T00:00:00Z');
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
  const stamp = value => dateValid(value) ? Date.parse(value + 'T00:00:00Z') : NaN;
  function fullMonths(start, end) {
    if (!dateValid(start) || !dateValid(end) || start > end) return null;
    const from = new Date(stamp(start)), exclusiveEnd = new Date(stamp(end) + DAY);
    let months = (exclusiveEnd.getUTCFullYear() - from.getUTCFullYear()) * 12 + exclusiveEnd.getUTCMonth() - from.getUTCMonth();
    if (exclusiveEnd.getUTCDate() < from.getUTCDate()) months -= 1;
    return Math.max(0, months);
  }
  function daysSince(value, today) {
    if (!dateValid(value) || !dateValid(today) || value > today) return null;
    return Math.floor((stamp(today) - stamp(value)) / DAY);
  }
  const discoverable = candidate => Boolean(candidate && candidate.discoverable === true && candidate.discoveryConsent === 'demo-authorized');
  const entries = value => Array.isArray(value) ? value : [];
  const number = value => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)) ? Number(value) : null;
  function candidateSignals(candidate = {}) {
    // Explicit student declarations only; dates, courses and free text do not establish these facts.
    return {
      conversionIntent: ['open', 'internship-only'].includes(candidate.conversionIntent) ? candidate.conversionIntent : 'unknown',
      internshipExperience: ['yes', 'no'].includes(candidate.internshipExperience) ? candidate.internshipExperience : 'unknown'
    };
  }
  const monthValid = value => typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) && !value.startsWith('0000');
  function candidateMonths(candidate = {}) {
    const startMonth = Object.hasOwn(candidate,'startMonth') ? (monthValid(candidate.startMonth) ? candidate.startMonth : '') : dateValid(candidate.startDate) ? candidate.startDate.slice(0,7) : '';
    const endMonth = Object.hasOwn(candidate,'endMonth') ? (monthValid(candidate.endMonth) ? candidate.endMonth : '') : dateValid(candidate.endDate) ? candidate.endDate.slice(0,7) : '';
    return {startMonth,endMonth};
  }
  // The public discovery UI has exactly three criteria. Older rules remain below
  // for historical matching helpers, but cannot silently narrow this result set.
  function filterDiscoveryCandidates(candidates, filters = {}) {
    const selected = value => (Array.isArray(value) ? value : value ? [value] : []).map(String).filter(Boolean);
    const cities = selected(filters.city), roles = selected(filters.role), month = String(filters.startMonth || '');
    if (month && !monthValid(month)) return [];
    const regions = root.JiulvRegions || regionCatalog;
    const sameCity = (actual, expected) => regions?.matchesCity ? regions.matchesCity(actual, expected) : actual === expected;
    const department = value => String(value).replace(/^(?:市场)?销售(?:部)?$/, '市场销售');
    return entries(candidates).filter(candidate => {
      if (!discoverable(candidate)) return false;
      if (cities.length && !cities.some(city => entries(candidate.cities).some(value => sameCity(value,city)))) return false;
      if (roles.length && !roles.some(role => entries(candidate.roles).some(value => department(value) === department(role)))) return false;
      if (month) {
        const range = candidateMonths(candidate);
        if (!range.startMonth || !range.endMonth || range.startMonth > range.endMonth || range.startMonth > month || range.endMonth < month) return false;
      }
      return true;
    });
  }
  function filterCandidates(candidates, filters = {}, today) {
    const selected = value => (Array.isArray(value) ? value : value === undefined || value === null || value === '' ? [] : [value]).map(String).filter(Boolean);
    const anySelected = (value, predicate) => { const options = selected(value); return !options.length || options.some(predicate); };
    const recent = (date, value) => {
      const age = daysSince(date, today);
      return value === 'unknown' ? age === null : Number(value) > 0 && age !== null && age <= Number(value);
    };
    const minimumMonths = number(filters.minMonths), maximumStipend = number(filters.maxStipend);
    const arrivalMonth = String(filters.startMonth || '');
    if (arrivalMonth && (!/^\d{4}-\d{2}$/.test(arrivalMonth) || !dateValid(arrivalMonth + '-01'))) return [];
    const planMonths = filters.durationMonths === 'unlimited' ? null : number(filters.durationMonths);
    if (filters.durationMonths && filters.durationMonths !== 'unlimited' && (!Number.isInteger(planMonths) || planMonths < 1 || planMonths > 12)) return [];
    const monthFirst = arrivalMonth ? arrivalMonth + '-01' : '';
    const monthLast = arrivalMonth ? new Date(Date.UTC(Number(arrivalMonth.slice(0, 4)), Number(arrivalMonth.slice(5)), 0)).toISOString().slice(0, 10) : '';
    if ((filters.startDate && !dateValid(filters.startDate)) || (filters.endDate && !dateValid(filters.endDate)) || (filters.startDate && filters.endDate && filters.startDate > filters.endDate)) return [];
    if (filters.minMonths !== undefined && filters.minMonths !== '' && (minimumMonths === null || minimumMonths < 1 || minimumMonths > 24)) return [];
    if (filters.maxStipend !== undefined && filters.maxStipend !== '' && (maximumStipend === null || maximumStipend < 0 || maximumStipend > 20000)) return [];
    const keywords = String(filters.keyword || '').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return entries(candidates).filter(candidate => {
      if (!discoverable(candidate)) return false;
      if (!anySelected(filters.city, value => entries(candidate.cities).includes(value))) return false;
      if (!anySelected(filters.role, value => entries(candidate.roles).includes(value))) return false;
      const signals = candidateSignals(candidate);
      if (!anySelected(filters.conversionIntent, value => signals.conversionIntent === value)) return false;
      if (!anySelected(filters.internshipExperience, value => signals.internshipExperience === value)) return false;
      const englishLevel = [1, 2, 3].includes(number(candidate.englishLevel)) ? String(number(candidate.englishLevel)) : 'unknown';
      if (!anySelected(filters.englishLevel, value => englishLevel === value)) return false;
      if (keywords.length) {
        const text = [candidate.alias, ...entries(candidate.cities), ...entries(candidate.roles), ...entries(candidate.skills), candidate.summary, candidate.preferences].join(' ').toLocaleLowerCase();
        if (!keywords.every(keyword => text.includes(keyword))) return false;
      }
      if (filters.startDate && (!dateValid(candidate.startDate) || !dateValid(candidate.endDate) || candidate.startDate > filters.startDate || candidate.endDate < filters.startDate)) return false;
      if (filters.endDate && (!dateValid(candidate.startDate) || !dateValid(candidate.endDate) || candidate.endDate < filters.endDate || candidate.startDate > filters.endDate)) return false;
      // A selected month is an arrival window, never a promise to start on day 1.
      if (arrivalMonth) {
        if (!dateValid(candidate.startDate) || !dateValid(candidate.endDate) || candidate.startDate > candidate.endDate) return false;
        const availableStart = candidate.startDate > monthFirst ? candidate.startDate : monthFirst;
        if (availableStart > monthLast || candidate.endDate < availableStart) return false;
        if (planMonths !== null && fullMonths(availableStart, candidate.endDate) < planMonths) return false;
      } else if (planMonths !== null && (fullMonths(candidate.startDate, candidate.endDate) ?? -1) < planMonths) return false;
      const months = fullMonths(candidate.startDate, candidate.endDate);
      if (minimumMonths > 0 && (months === null || months < minimumMonths)) return false;
      if (maximumStipend !== null && (number(candidate.minStipend) === null || number(candidate.minStipend) > maximumStipend)) return false;
      if (!anySelected(filters.activeWithin, value => recent(candidate.lastActive, value))) return false;
      if (!anySelected(filters.confirmedWithin, value => recent(candidate.intentConfirmed, value))) return false;
      if (filters.savedOnly && !entries(filters.savedIds).includes(candidate.id)) return false;
      return true;
    });
  }
  function matchCandidate(candidate, job = {}) {
    const checks = [];
    const add = (key, label, state, reason) => checks.push({ key, label, state, reason });
    if (!discoverable(candidate)) return { candidateId: candidate?.id, status: 'unavailable', checks: [], passed: 0, total: 0, unknown: 0, conflicts: 0, coverage: 0 };
    for (const [key, label, value, list] of [['city', '意向城市', job.city, candidate.cities], ['role', '意向岗位', job.role, candidate.roles]]) {
      if (!value) continue;
      add(key, label, !entries(list).length ? 'unknown' : list.includes(value) ? 'pass' : 'fail', !entries(list).length ? '候选人尚未确认该意向' : list.includes(value) ? `意向包含${value}` : `当前意向为${list.join('、')}，不包含${value}`);
    }
    if (job.startDate || job.endDate) {
      if (!dateValid(job.startDate) || !dateValid(job.endDate) || job.startDate > job.endDate) add('dates', '完整到岗区间', 'unknown', '岗位须填写有效的开始和结束日期');
      else if (!dateValid(candidate.startDate) || !dateValid(candidate.endDate) || candidate.startDate > candidate.endDate) add('dates', '完整到岗区间', 'unknown', '候选人可实习日期待确认');
      else {
        const covers = candidate.startDate <= job.startDate && candidate.endDate >= job.endDate;
        add('dates', '完整到岗区间', covers ? 'pass' : 'fail', covers ? '可实习时间覆盖整个岗位区间' : `可实习区间 ${candidate.startDate} 至 ${candidate.endDate}，无法完整覆盖`);
      }
    }
    if (Number(job.minMonths) > 0) {
      const months = fullMonths(candidate.startDate, candidate.endDate);
      add('months', '连续实习时长', months === null ? 'unknown' : months >= Number(job.minMonths) ? 'pass' : 'fail', months === null ? '缺少完整日期，无法计算可实习月数' : `日期区间包含 ${months} 个完整月；要求至少 ${Number(job.minMonths)} 个月`);
    }
    if (Number(job.minEnglish) > 0) {
      const rawLevel = number(candidate.englishLevel), level = [0, 1, 2, 3].includes(rawLevel) ? rawLevel : null, required = Number(job.minEnglish);
      add('english', '岗位英语要求', level === null ? 'unknown' : level >= required ? 'pass' : 'fail', level === null ? '英语能力尚未填写' : `${['不限', '基础交流', '日常工作交流', '熟练工作交流'][level] || '待确认'}（自述，仍需面试确认）`);
    }
    if (number(job.stipend) !== null && Number(job.stipend) >= 0) {
      const desired = number(candidate.minStipend);
      add('stipend', '津贴意向', desired === null ? 'unknown' : Number(job.stipend) >= desired ? 'pass' : 'fail', desired === null ? '最低津贴意向待确认' : `期望至少 ${desired} 元/月；岗位基础津贴 ${Number(job.stipend)} 元/月`);
    }
    const passed = checks.filter(check => check.state === 'pass').length;
    const unknown = checks.filter(check => check.state === 'unknown').length;
    const conflicts = checks.filter(check => check.state === 'fail').length;
    return { candidateId: candidate.id, status: conflicts ? 'conflict' : unknown || !checks.length ? 'confirm' : 'meets', checks, passed, total: checks.length, unknown, conflicts, coverage: checks.length ? Math.round((checks.length - unknown) / checks.length * 100) : 0 };
  }
  function rankCandidates(candidates, job) {
    const order = { meets: 0, confirm: 1, conflict: 2 };
    return entries(candidates).filter(discoverable).map(candidate => ({ candidate, match: matchCandidate(candidate, job) })).sort((a, b) => order[a.match.status] - order[b.match.status] || b.match.passed - a.match.passed || String(a.candidate.id).localeCompare(String(b.candidate.id)));
  }
  function queryCandidate(candidate, criteria = {}, today) {
    const base = matchCandidate(candidate, { city: criteria.city, role: criteria.role, minEnglish: criteria.minEnglish, stipend: criteria.stipend });
    if (base.status === 'unavailable') return base;
    const checks = base.checks.slice();
    const add = (key, label, state, reason) => checks.push({ key, label, state, reason });
    if (criteria.region === '江浙沪') { const regionCities = ['上海','南京','无锡','徐州','常州','苏州','南通','连云港','淮安','盐城','扬州','镇江','泰州','宿迁','杭州','宁波','温州','嘉兴','湖州','绍兴','金华','衢州','舟山','台州','丽水']; const hit = entries(candidate.cities).filter(c => regionCities.includes(c.replace(/市$/, ''))); add('region','意向地区 · 江浙沪', !entries(candidate.cities).length ? 'unknown' : hit.length ? 'pass' : 'fail', hit.length ? `意向城市包含 ${hit.join('、')}；按上海、江苏、浙江检索` : '当前意向城市未包含江浙沪，学校所在地不参与推断'); }
    const datesKnown = dateValid(candidate.startDate) && dateValid(candidate.endDate) && candidate.startDate <= candidate.endDate;
    let availableStart = datesKnown ? candidate.startDate : null, canArrive = null;
    if (criteria.arrivalStart || criteria.arrivalEnd) {
      const windowValid = dateValid(criteria.arrivalStart) && dateValid(criteria.arrivalEnd) && criteria.arrivalStart <= criteria.arrivalEnd;
      if (!windowValid || !datesKnown) add('arrival', '到岗窗口', 'unknown', !windowValid ? '到岗窗口尚未明确' : '候选人可实习日期尚未确认');
      else {
        availableStart = candidate.startDate > criteria.arrivalStart ? candidate.startDate : criteria.arrivalStart;
        const latest = candidate.endDate < criteria.arrivalEnd ? candidate.endDate : criteria.arrivalEnd;
        canArrive = availableStart <= latest;
        add('arrival', '到岗窗口', canArrive ? 'pass' : 'fail', canArrive ? `在所需窗口内最早可于 ${availableStart} 到岗（需本人确认）` : `可实习 ${candidate.startDate} 至 ${candidate.endDate}，与到岗窗口不重合`);
      }
    }
    if (Number(criteria.minMonths) > 0) {
      const months = datesKnown && availableStart ? fullMonths(availableStart, candidate.endDate) : null;
      const state = !datesKnown ? 'unknown' : canArrive === false ? 'fail' : months !== null && months >= criteria.minMonths ? 'pass' : 'fail';
      add('months', '到岗后的连续时长', state, !datesKnown ? '缺少完整实习日期，不能推定时长满足' : canArrive === false ? '无法在指定窗口内到岗，不能满足该批次的连续时长' : `从 ${availableStart} 起至 ${candidate.endDate} 可覆盖 ${months ?? 0} 个完整月；要求至少 ${criteria.minMonths} 个月`);
    }
    if (criteria.endDate) {
      const valid = dateValid(criteria.endDate), covered = datesKnown && availableStart <= criteria.endDate && candidate.endDate >= criteria.endDate;
      add('endDate', '须实习至指定日期', !valid || !datesKnown ? 'unknown' : covered ? 'pass' : 'fail', !valid || !datesKnown ? '结束日期或候选人实习区间尚未明确' : covered ? `可覆盖至 ${criteria.endDate}` : `可实习结束于 ${candidate.endDate}，无法覆盖所需结束日`);
    }
    for (const [key, field, label] of [['activeWithin', 'lastActive', '最近活动'], ['confirmedWithin', 'intentConfirmed', '意向确认']]) {
      if (!Number(criteria[key])) continue;
      const age = daysSince(candidate[field], today);
      add(key, label, age === null ? 'unknown' : age <= criteria[key] ? 'pass' : 'fail', age === null ? '尚无有效确认日期，不能推定近期活跃' : `${age === 0 ? '快照当日' : `${age} 天前`}，要求 ${criteria[key]} 天内；数据快照 ${today}`);
    }
    if (criteria.minEnglish === 0) add('english', '岗位英语要求', 'pass', '本次未设英语门槛');
    const passed = checks.filter(check => check.state === 'pass').length, unknown = checks.filter(check => check.state === 'unknown').length, conflicts = checks.filter(check => check.state === 'fail').length;
    return { candidateId: candidate.id, status: conflicts ? 'conflict' : unknown || !checks.length ? 'confirm' : 'meets', checks, passed, total: checks.length, unknown, conflicts, coverage: checks.length ? Math.round((checks.length - unknown) / checks.length * 100) : 0 };
  }
  function runTalentQuery(candidates, extraction, today) {
    const parser = typeof module !== 'undefined' && module.exports ? require('./talent-query.js') : root.JiulvTalentQuery;
    const value = parser.validateExtraction({ criteria: extraction.criteria, clarifications: extraction.clarifications, unsupported: extraction.unsupported });
    if (value.clarifications.length || value.unsupported.length) return { blocked: true, results: [], totals: { meets: 0, confirm: 0, conflict: 0 } };
    const order = { meets: 0, confirm: 1, conflict: 2 }, totals = { meets: 0, confirm: 0, conflict: 0 };
    const results = entries(candidates).filter(discoverable).map(candidate => ({ candidate, match: queryCandidate(candidate, value.criteria, today) })).sort((a, b) => order[a.match.status] - order[b.match.status] || String(a.candidate.id).localeCompare(String(b.candidate.id)));
    results.forEach(result => { totals[result.match.status]++; });
    return { blocked: false, results, totals };
  }
  function batchMetrics(batches) {
    return entries(batches).reduce((result, batch) => {
      const demand = Math.max(0, number(batch.demand) || 0), confirmed = Math.max(0, number(batch.confirmed) || 0), arrived = Math.max(0, number(batch.arrived) || 0);
      result.demand += demand; result.confirmed += confirmed; result.arrived += arrived;
      result.gap += Math.max(0, demand - confirmed); result.awaitingArrival += Math.max(0, confirmed - arrived);
      return result;
    }, { demand: 0, confirmed: 0, arrived: 0, gap: 0, awaitingArrival: 0 });
  }
  const api = { dateValid, monthValid, candidateMonths, filterDiscoveryCandidates, fullMonths, daysSince, discoverable, candidateSignals, filterCandidates, matchCandidate, rankCandidates, batchMetrics, queryCandidate, runTalentQuery };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.JiulvMatch = api;
})(typeof window !== 'undefined' ? window : this);
