(function (root) {
  'use strict';
  const CITY_NAMES = ['上海', '杭州', '苏州', '嘉兴', '广州', '北京', '深圳', '成都', '重庆', '南京', '天津', '武汉', '西安', '长沙', '厦门', '青岛', '宁波', '无锡', '三亚', '海口', '郑州', '济南', '合肥', '福州', '泉州', '昆明', '南宁', '南昌', '贵阳', '哈尔滨', '长春', '沈阳', '大连', '石家庄', '太原', '珠海', '佛山', '东莞', '中山', '惠州', '温州', '绍兴', '湖州', '金华', '常州', '扬州', '南通', '桂林', '丽江', '大理', '拉萨'];
  const ROLE_ALIASES = { '前厅': ['前厅', '前台', '礼宾', '宾客服务'], '餐饮': ['餐饮', '餐厅', '宴会'], '厨房': ['厨房', '厨师', '饼房'], '客房': ['客房', '房务'] };
  const FIELDS = ['region', 'city', 'role', 'arrivalStart', 'arrivalEnd', 'endDate', 'minMonths', 'minEnglish', 'stipend', 'activeWithin', 'confirmedWithin'];
  const LABELS = { region: '意向地区（非学校所在地）', city: '意向城市', role: '意向岗位', arrivalStart: '到岗窗口', endDate: '须能实习至', minMonths: '连续实习', minEnglish: '岗位英语', stipend: '酒店基础津贴', activeWithin: '最近活动', confirmedWithin: '意向确认' };
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const pad = value => String(value).padStart(2, '0');
  const unique = list => [...new Set(list)];
  function dateValid(value) {
    if (typeof value !== 'string' || !/^(?:20|21)\d{2}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T00:00:00Z');
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
  function numeric(value) {
    if (/^\d+$/.test(value)) return Number(value);
    if (value === '半') return .5;
    const digits = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
    if (value === '十') return 10;
    if (value.includes('十')) { const [left, right] = value.split('十'); return (left ? digits[left] : 1) * 10 + (right ? digits[right] : 0); }
    return digits[value];
  }
  function recognize(criteria) {
    return Object.keys(LABELS).filter(key => Object.hasOwn(criteria, key)).map(key => {
      let value = criteria[key];
      if (key === 'arrivalStart') value = criteria.arrivalStart === criteria.arrivalEnd ? criteria.arrivalStart : `${criteria.arrivalStart} — ${criteria.arrivalEnd}`;
      else if (key === 'minMonths') value = `至少 ${value} 个月`;
      else if (key === 'minEnglish') value = ['不限', '基础交流', '日常工作交流', '熟练工作交流'][value];
      else if (key === 'stipend') value = `${value} 元/月`;
      else if (key === 'activeWithin' || key === 'confirmedWithin') value = `${value} 天内`;
      return { key, label: LABELS[key], value: String(value) };
    });
  }
  function validateCriteria(raw) {
    if (!isObject(raw) || Object.keys(raw).some(key => !FIELDS.includes(key))) throw new Error('criteria_schema');
    const criteria = {};
    for (const [key, value] of Object.entries(raw)) {
      if (key === 'region') { if (!['江浙沪'].includes(value)) throw new Error('region_invalid'); }
      else if (key === 'city') { if (typeof value !== 'string' || !/^[\u3400-\u9fffA-Za-z· -]{1,30}$/.test(value) || value !== value.trim()) throw new Error('city_invalid'); }
      else if (key === 'role') { if (!Object.hasOwn(ROLE_ALIASES, value)) throw new Error('role_invalid'); }
      else if (['arrivalStart', 'arrivalEnd', 'endDate'].includes(key)) { if (!dateValid(value)) throw new Error('date_invalid'); }
      else {
        const bounds = { minMonths: [1, 24], minEnglish: [0, 3], stipend: [0, 20000], activeWithin: [1, 365], confirmedWithin: [1, 365] }[key];
        if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value) || value < bounds[0] || value > bounds[1]) throw new Error('number_invalid');
      }
      criteria[key] = value;
    }
    if (Boolean(criteria.arrivalStart) !== Boolean(criteria.arrivalEnd) || (criteria.arrivalStart && criteria.arrivalStart > criteria.arrivalEnd)) throw new Error('arrival_invalid');
    if (criteria.arrivalStart && criteria.endDate && criteria.endDate < criteria.arrivalStart) throw new Error('interval_invalid');
    return criteria;
  }
  function validateExtraction(raw, options = {}) {
    if (!isObject(raw) || Object.keys(raw).some(key => !['criteria', 'clarifications', 'unsupported'].includes(key))) throw new Error('extraction_schema');
    const criteria = validateCriteria(raw.criteria);
    const list = key => {
      if (!Array.isArray(raw[key]) || raw[key].length > 16 || raw[key].some(value => typeof value !== 'string' || !value.trim() || value.length > 240)) throw new Error('message_schema');
      return unique(raw[key].map(value => value.trim()));
    };
    const clarifications = list('clarifications'), unsupported = list('unsupported');
    if (typeof options.query === 'string' && /转正|留用|实习经历|实习经验/.test(options.query)) unsupported.push('转正意向与实习经历请使用下方对应的手工筛选；当前语句查询尚未接入这两项，不会忽略后直接查询。');
    if (typeof options.query === 'string' && /性别|男生|女生|男性|女性|年龄|岁以下|岁以上|籍贯|户籍|民族|身高|颜值|婚育|残疾/.test(options.query)) unsupported.push('性别、年龄、籍贯、外貌等个人背景不进入人才筛选，请改为与岗位有关的要求。');
    if (typeof options.query === 'string' && options.verifyQuery !== false) {
      const baseline = parse(options.query, { verifyQuery: false });
      clarifications.push(...baseline.clarifications);
      for (const [key, value] of Object.entries(baseline.criteria)) {
        if (!Object.hasOwn(criteria, key) || criteria[key] !== value) clarifications.push(`语句中明确的“${LABELS[key] || (key === 'arrivalEnd' ? '到岗窗口结束' : key)}”未被一致提取，请检查识别条件后改写。`);
      }
      if (/学历|本科|大专|高职|硕士|经验|证书|CET|四六级|四级|六级|宿舍|轮岗|夜班|早班|酒店管理专业|人数|名额/.test(options.query)) unsupported.push('语句含当前人才字段未支持的要求（如学历、经验、证书、住宿或轮岗等），请另行确认或从本次查询中明确移除。');
    }
    if (!Object.keys(criteria).length && !clarifications.length) clarifications.push('尚未识别到可检索条件，请补充城市、岗位或到岗时间。');
    const recognized = recognize(criteria);
    return { criteria, recognized, clarifications: unique(clarifications), unsupported: unique(unsupported), summary: recognized.length ? `识别到 ${recognized.length} 项条件${clarifications.length || unsupported.length ? '，补充说明后再查询' : '，可查询已授权的虚构人才样例'}` : '请进一步说明招聘要求' };
  }
  function parse(query, options = {}) {
    if (typeof query !== 'string' || !query.trim() || query.length > 1000) throw new Error('query_invalid');
    const source = query.normalize('NFKC').trim(), mask = Array(source.length).fill(false), criteria = {}, clarifications = [], unsupported = [];
    const mark = (start, length) => { for (let i = start; i < start + length; i++) mask[i] = true; };
    const scan = regex => [...source.matchAll(regex)].filter(match => !mask.slice(match.index, match.index + match[0].length).some(Boolean));
    const putSingle = (key, matches, convert, label) => {
      const values = [];
      for (const match of matches) { mark(match.index, match[0].length); values.push(convert(match)); }
      const choices = unique(values);
      if (choices.length === 1) criteria[key] = choices[0];
      else if (choices.length > 1) clarifications.push(`${label}出现多个不同条件，当前一次查询请明确一个${label}。`);
    };
    if (/不要|排除|不考虑|不接受|不能|除.+之外|(?<!不)非(?:上海|杭州|苏州|前厅|餐饮|厨房|客房)/.test(source)) clarifications.push('检测到排除或否定条件；本地解析暂不执行反向筛选，请改写为明确需要的条件。');
    for (const m of scan(/江浙沪/g)) { mark(m.index, m[0].length); criteria.region = '江浙沪'; }
    if (/学校所在地|当地高校|本地高校|生源地|江浙沪高校/.test(source)) clarifications.push('当前地区按学生意向工作城市检索，不含学校所在地，请明确是否按意向地区查询。');
    putSingle('city', scan(new RegExp(CITY_NAMES.join('|'), 'g')), match => match[0], '城市');
    const roleMatches = scan(new RegExp(Object.values(ROLE_ALIASES).flat().join('|'), 'g'));
    putSingle('role', roleMatches, match => Object.keys(ROLE_ALIASES).find(key => ROLE_ALIASES[key].includes(match[0])), '岗位');
    const dates = [];
    for (const match of scan(/((?:20|21)\d{2})(?:年|[-/])(\d{1,2})(?:月|[-/])(\d{1,2})(?:日|号)?/g)) {
      const value = `${match[1]}-${pad(match[2])}-${pad(match[3])}`; mark(match.index, match[0].length);
      if (!dateValid(value)) clarifications.push(`日期“${match[0]}”无效，请检查月份和天数。`);
      else dates.push({ start: value, end: value, index: match.index, length: match[0].length });
    }
    for (const match of scan(/((?:20|21)\d{2})(?:年|[-/])(\d{1,2})月?/g)) {
      const value = `${match[1]}-${pad(match[2])}-01`; mark(match.index, match[0].length);
      if (!dateValid(value)) clarifications.push(`月份“${match[0]}”无效，请填写1至12月。`);
      else { const last = new Date(Date.UTC(Number(match[1]), Number(match[2]), 0)).getUTCDate(); dates.push({ start: value, end: `${match[1]}-${pad(match[2])}-${pad(last)}`, index: match.index, length: match[0].length }); }
    }
    dates.sort((a, b) => a.index - b.index);
    if (dates.length > 2) clarifications.push('检测到多组日期，请明确一个到岗窗口和一个结束日期。');
    else if (dates.length === 2) {
      criteria.arrivalStart = dates[0].start; criteria.arrivalEnd = dates[0].end; criteria.endDate = dates[1].end;
      const between = source.slice(dates[0].index + dates[0].length, dates[1].index);
      if (!/到|至|结束/.test(between)) clarifications.push('两组日期的关系不明确，请写成“某日到岗，实习至某日”。');
    } else if (dates.length === 1) {
      const date = dates[0], before = source.slice(Math.max(0, date.index - 5), date.index), after = source.slice(date.index + date.length, date.index + date.length + 4);
      if (/实习至|实习到|结束于|截止到|结束日期/.test(before) || /^结束|^返校/.test(after)) criteria.endDate = date.end;
      else { criteria.arrivalStart = date.start; criteria.arrivalEnd = date.end; }
      if (/^前|^之前|^以前|^以后|^之后|^后/.test(after)) clarifications.push('“某日前后”范围未明确，请填写具体日期或完整到岗月份。');
    }
    for (const match of scan(/([0-9一二两三四五六七八九十]+)月(?:初|中|底)?(?:到岗|入职|开始)/g)) {
      mark(match.index, match[0].length); clarifications.push('到岗月份缺少年份，请填写例如“2027年1月到岗”。');
    }
    const numPattern = '[0-9一二两三四五六七八九十]+';
    const months = scan(new RegExp(`(?:至少|最少|可|能|需要|要求)?(?:连续)?(?:实习)?\\s*(${numPattern})\\s*个?月(?:以上|起)?`, 'g'));
    for (const match of scan(/(?:连续|实习|可|能|至少|最少)?(?:半年|一年)/g)) months.push(Object.assign([match[0], /半年/.test(match[0]) ? '6' : '12'], { index: match.index }));
    putSingle('minMonths', months, match => numeric(match[1]), '连续月数');
    for (const [key, suffix] of [['activeWithin', '(?:有)?(?:活动|活跃|登录)'], ['confirmedWithin', '(?:已)?(?:确认意向|意向确认)']]) {
      putSingle(key, scan(new RegExp(`(?:最近|近)?(${numPattern})\\s*天(?:内)?(?:有|已)?${suffix}`, 'g')), match => numeric(match[1]), key === 'activeWithin' ? '活动天数' : '意向确认天数');
    }
    const englishMatches = scan(/(?:英语|英文)(?:要求|能力|水平|可|能|可以|能够|达到|需|要)?(?:不限|无要求|熟练(?:工作)?交流|流利(?:工作)?交流|日常工作交流|工作交流|日常交流|基础交流|简单交流)/g);
    putSingle('minEnglish', englishMatches, match => /不限|无要求/.test(match[0]) ? 0 : /熟练|流利/.test(match[0]) ? 3 : /工作交流/.test(match[0]) ? 2 : 1, '英语要求');
    const payMatches = scan(/(?:酒店(?:提供)?|基础)?(?:津贴|补贴|月薪|薪资|预算)(?:是|为|每月|约|可提供|提供)?\s*(\d+(?:\.\d+)?)\s*([kK千])?\s*(?:元|块)?(?:\/月|每月)?/g);
    putSingle('stipend', payMatches, match => Number(match[1]) * (match[2] ? 1000 : 1), '津贴');
    if (/(?:津贴|补贴|月薪|薪资|预算)[^，,；;。]{0,15}(?:以上|以下|左右|之间)/.test(source)) clarifications.push('津贴范围尚未明确，请填写可承诺的固定基础津贴。');
    if (payMatches.some(match => /约/.test(match[0]))) clarifications.push('津贴“约”多少尚不明确，请填写可承诺的固定基础津贴。');
    const remainder = source.split('').map((char, index) => mask[index] ? ' ' : char).join('')
      .replace(/地区|范围|帮我|请帮忙|请|寻找|想找|找一些|找|筛选|招聘|招|需要|想要|希望|我要|实习生|候选人|同学|学生|的人|人员|意向城市|意向岗位|岗位|城市|部门|实习周期|可实习|实习|到岗|入职|开始|连续|至少|最少|以上|市|的|在|可|能|为|与|和|及|从|至|到|有|都|并且|我/g, ' ')
      .replace(/[\s,，。.;；、:：!?！？()（）]+/g, ' ').trim();
    if (remainder) unsupported.push(`尚未处理：“${remainder.slice(0, 180)}”。请明确这些要求；当前不会忽略它们后自动查询。`);
    if (/明年|今年|下个月|下月|月底|月初|尽快|随时|左右|大概|差不多|英语好|英文好|英语不错/.test(source)) clarifications.push('相对时间、模糊程度或能力描述需要明确，请填写完整年份、月份/日期或明确英语等级。');
    try { return validateExtraction({ criteria, clarifications, unsupported }, { ...options, query, verifyQuery: false }); }
    catch (error) {
      if (error.message === 'interval_invalid') { delete criteria.endDate; clarifications.push('结束日期早于到岗窗口，请调整。'); }
      else if (error.message === 'number_invalid') { for (const key of ['minMonths', 'minEnglish', 'stipend', 'activeWithin', 'confirmedWithin']) { if (Object.hasOwn(criteria, key)) { try { validateCriteria({ [key]: criteria[key] }); } catch (_) { delete criteria[key]; } } } clarifications.push('数值超出当前支持范围：月数1—24，津贴0—20000，活动/确认天数1—365。'); }
      else throw error;
      return validateExtraction({ criteria, clarifications, unsupported }, { ...options, query, verifyQuery: false });
    }
  }
  const api = { parse, validateExtraction, validateCriteria, recognize, dateValid };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.JiulvTalentQuery = api;
})(typeof window !== 'undefined' ? window : this);
