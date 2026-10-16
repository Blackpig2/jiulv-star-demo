/* 酒旅之星：按酒店演示账号隔离的本机条件问卷。无网络提交。 */
(() => {
  'use strict';
  const api = () => window.JiulvDemo;
  const catalog = () => window.JiulvRecruitmentCatalog;
  const e = value => api().e(String(value ?? ''));
  const byId = id => document.getElementById(id);
  const draftKey = account => `hotel:draft:${account.id}`;
  const libraryKey = account => `hotel:conditions:${account.id}`;
  const yesNo = ['是', '否', '待确认'];
  const legacySections = [
    { id: 'position', title: '岗位与安排', caption: '先写清岗位、到岗时间与实习周期。', fields: [
      ['jobTitle', '招聘岗位 / 部门', 'text', { required: true, placeholder: '例如：前厅部实习生' }],
      ['headcount', '招聘人数', 'number', { min: 1, max: 9999 }],
      ['startDate', '预计开始日期', 'date'], ['durationMonths', '要求实习周期（月）', 'number', { min: 1, max: 36 }],
      ['language', '语言要求', 'text', { placeholder: '例如：可进行基础英语交流' }],
      ['workHours', '每日工时 / 排班方式', 'text', { placeholder: '例如：8小时，需轮班' }],
      ['daysOff', '月休天数', 'number', { min: 0, max: 31 }],
      ['rotationType', '轮岗安排', 'select', { options: ['固定岗位，不安排轮岗', '可申请轮岗，不保证', '保证轮岗，具体安排见补充', '待确认'] }],
      ['education', '学历与专业要求', 'text', { optional: true }],
      ['rotationConditions', '轮岗条件 / 部门 / 时间', 'textarea', { full: true, optional: true }],
      ['positionNotes', '学校手续、带教等补充', 'textarea', { full: true, optional: true }]
    ] },
    { id: 'pay', title: '津贴与保险', caption: '基础津贴与额外奖励分开填写，保险项目分别说明。', fields: [
      ['stipend', '基础津贴（元 / 月）', 'number', { min: 0, max: 100000 }],
      ['payDay', '发薪日期与对应月份', 'text', { placeholder: '例如：每月15日发上月津贴' }],
      ['overtime', '加班安排', 'select', { options: ['另行支付加班费', '安排调休', '加班费与调休结合', '不安排加班', '待确认'] }],
      ['liabilityInsurance', '雇主责任险', 'select', { options: yesNo }],
      ['internshipInsurance', '实习险', 'select', { options: yesNo }],
      ['supplementalMedicalInsurance', '补充医疗险', 'select', { options: yesNo }],
      ['otherInsurance', '其他保险', 'text', { placeholder: '保险名称；无 / 待确认' }],
      ['stipendConditions', '津贴调整条件与扣费', 'textarea', { full: true, optional: true }],
      ['overtimeDetails', '加班计价 / 调休规则', 'text', { optional: true }],
      ['insuranceDetails', '承保期间、范围等补充', 'textarea', { full: true, optional: true, placeholder: '请勿填写保单证件号' }]
    ] },
    { id: 'life', title: '住宿、通勤与餐食', caption: '把“包吃住”展开为可比较的实际条件。', fields: [
      ['dormAvailable', '住宿安排', 'select', { options: ['提供免费住宿', '提供收费住宿', '可申请，视床位情况', '不提供住宿', '待确认'] }],
      ['dormOccupancy', '每间宿舍人数', 'number', { min: 1, max: 30 }],
      ['dormCost', '住宿、水电与押金费用', 'text', { full: true, placeholder: '注明计费周期；免费也请明确' }],
      ['commuteKm', '宿舍到酒店距离（公里）', 'number', { min: 0, max: 500, step: 0.1 }],
      ['commuteMinutes', '单程通勤时间（分钟）', 'number', { min: 0, max: 600 }],
      ['commuteMode', '主要交通方式', 'text', { placeholder: '例如：步行 / 骑行 / 公交 / 地铁' }],
      ['mealsPerDay', '工作日每日供餐次数', 'number', { min: 0, max: 6 }],
      ['dayOffMeals', '休息日供餐', 'select', { options: ['供餐', '不供餐', '部分时段供餐', '待确认'] }],
      ['mealCost', '餐食费用', 'text', { placeholder: '免费 / 每餐费用 / 补贴方式' }],
      ['privateBathroom', '独立卫浴', 'select', { optional: true, options: ['有', '无，共用卫浴', '部分房型有', '待确认'] }],
      ['dormFacilities', '宿舍设施', 'textarea', { full: true, optional: true }],
      ['dormNotes', '住宿备注与照片说明', 'textarea', { full: true, optional: true }],
      ['commuteNotes', '通勤备注与路线说明', 'textarea', { full: true, optional: true }],
      ['nightMeals', '夜班餐食安排', 'text', { optional: true }],
      ['mealHours', '供餐时段 / 特殊饮食', 'textarea', { full: true, optional: true }],
      ['mealNotes', '餐食备注与照片说明', 'textarea', { full: true, optional: true }]
    ], photos: true },
    { id: 'contact', title: '确认展示范围', caption: '保存仅形成此账号的本机草稿，不会自动公开。', fields: [
      ['contactVisibility', '允许对外展示的联系方式', 'select', { options: ['仅用于平台联系，不公开', '可公开招聘邮箱', '可公开招聘电话 / 微信', '可公开上述招聘联系方式', '待确认'] }],
      ['validUntil', '招聘信息预计有效至', 'date'],
      ['hotelAddress', '酒店地址', 'text', { optional: true, full: true }],
      ['reporterRole', '填报人职务', 'text', { optional: true }],
      ['contactName', '其他招聘联系人', 'text', { optional: true }],
      ['contactPhone', '招聘电话 / 微信（选填）', 'text', { optional: true }],
      ['applicationEmail', '其他申请邮箱（选填）', 'email', { optional: true, placeholder: '留空时以账号 HR 工作邮箱联系' }],
      ['contactNotes', '联系时段与其他说明', 'textarea', { optional: true, full: true }]
    ] }
  ];
  const englishOptions = window.JiulvCore?.ENGLISH_LEVELS || ['基础交流：能进行简单日常对话', '熟练沟通：能处理日常服务交流', '流利交流：能独立应对复杂沟通'];
  const educationOptions = ['不限', ...(window.JiulvCore?.EDUCATION_LEVELS || ['中职 / 中专','高职 / 专科','本科','硕士及以上','其他'])];
  const minimumDurationLabels = window.JiulvCore?.INTERNSHIP_MONTH_OPTIONS || ['不限', ...Array.from({length:12},(_,i)=>`至少${i+1}个月`)];
  const minimumDurationOptions = minimumDurationLabels.map(label => label === '不限' ? label : label.match(/\d+/)?.[0]).filter(Boolean);
  const minimumDurationOptionLabels = Object.fromEntries(minimumDurationOptions.map((value,index)=>[value,minimumDurationLabels[index]]));
  const sections = [
    {id:'position',title:'岗位要求',fields:[
      ['educationRequirement','学历要求','select',{options:educationOptions}],
      ['minimumDurationMonths','最低实习时长','select',{options:minimumDurationOptions,optionLabels:minimumDurationOptionLabels}],
      ['englishRequirement','英语要求','select',{options:englishOptions}],
      ['heightRequirement','身高要求（若有）','text',{placeholder:'例：男，需180 cm以上'}],
      ['workHours','排班方式','text',{placeholder:'例如：做五休二，需轮班'}],
      ['rotationType','是否提供轮岗','select',{options:['是','否']}]
    ]},
    {id:'pay',title:'津贴与保险',fields:[
      ['stipendFirst6','前6个月基础津贴（元 / 月）','number',{min:0,max:100000}],
      ['stipendFrom7','第7个月起基础津贴（元 / 月）','number',{min:0,max:100000}],
      ['otherSubsidies','其他补贴（若有）','text',{placeholder:'交通补贴、水电费、班次津贴等'}],
      ['completionBonus','一次性奖励金（若有）','text',{placeholder:'完成前三个月实习奖励500元'}],
      ['payDay','发薪日期','text',{placeholder:'例如：每月最后一个工作日 / 每月15日'}],
      ['liabilityInsurance','是否提供雇主责任险','select',{options:['是','否']}],
      ['otherInsurance','其他补充保险（若有）','text',{full:true,placeholder:'例如：补充医疗商业保险'}]
    ]},
    {id:'life',title:'住宿、通勤与餐食',fields:[
      ['dormOccupancy','每间宿舍人数','number',{min:1,max:30}],
      ['dormUtilities','宿舍水电费','select',{options:['学生平摊','免费']}],
      ['dormFacilities','宿舍内设施','textarea',{full:true}],
      ['dormCommonFacilities','宿舍公区设施','textarea',{full:true}],
      ['commuteMinutes','单程通勤时间（分钟）','number',{min:0,max:600}],
      ['commuteMode','通勤交通方式','text',{placeholder:'例如：步行 / 地铁 / 酒店班车'}],
      ['mealsPerDay','每日供餐次数','number',{min:0,max:6}],
      ['halalMeals','是否有清真餐','select',{options:['是','否']}]
    ]}
  ];
  const formFields = sections.flatMap(section=>section.fields);
  const baseLabels = { hotelName: '酒店中文名称', hotelCity: '城市', reporterName: '历史填报人', hrEmail: 'HR 工作邮箱' };
  const photoLabels = { accommodation: '宿舍内设施', dormCommon: '宿舍公区设施', commute: '通勤', meals: '餐食' };
  const photoLimit = group => ['accommodation','dormCommon'].includes(group) ? 5 : group === 'hotel' ? 6 : 3;
  const oldPositionKeys = new Set(['jobTitle', 'headcount', 'startDate', 'durationMonths']);
  const allFields = [...legacySections.flatMap(section => section.fields), ...formFields];
  const conditionFields = [...new Map(allFields.filter(([key])=>!oldPositionKeys.has(key)).map(item=>[item[0],item])).values()];
  const informationKey = account => `hotel:information:${account.id}`;
  const departments = () => window.JiulvCore?.DEPARTMENTS || ['前厅', '餐饮', '厨房', '客房', '市场销售', '人力资源', '财务', '预订', '康体', '工程', '安保', '其他'];
  const planKey = account => `hotel:plans:${account.id}`;
  const clone = value => JSON.parse(JSON.stringify(value));
  const emptyConditions = () => ({ values: {}, photos: { accommodation: [], dormCommon: [], commute: [], meals: [] }, savedAt: null });
  const validImage = value => typeof value === 'string' && /^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(value) && value.length < 2850000;
  let loadedAccountId = null, records = [], mode = 'list', editor = null, photoTask = null, photoToken = 0, canonicalSeen = false, pendingPublication = null;
  const drafts = new Map();
  let infoEditor = null, informationSection = 'profile', selectedFlowPlan = '';
  const cleanProfile = source => ({...(catalog()?.normalizeHotelProfile(source || {}) || {highlights:'',officialUrl:'',photos:[],revision:0}),intro:typeof source?.intro === 'string' ? source.intro : ''});
  const numberOrBlank = value => value === '' || value === null || value === undefined || !Number.isFinite(Number(value)) ? '' : Number(value);
  function sanitizeConditions(source, account) {
    const result = emptyConditions();
    conditionFields.forEach(([key]) => { if (typeof source?.values?.[key] === 'string') result.values[key] = source.values[key].slice(0, 1500); });
    Object.keys(baseLabels).forEach(key => result.values[key] = account[key] || '');
    Object.keys(photoLabels).forEach(group => result.photos[group] = (Array.isArray(source?.photos?.[group]) ? source.photos[group] : []).filter(photo => validImage(photo?.dataUrl)).slice(0, photoLimit(group)).map(photo => ({ name: String(photo.name || '图片').slice(0, 180), dataUrl: photo.dataUrl })));
    result.savedAt = typeof source?.savedAt === 'string' ? source.savedAt : null;
    result.revision = Math.max(0, Number(source?.revision) || 0);
    if (source?.formVersion === '5.6-simple') result.formVersion = '5.6-simple';
    if (source?.legacyValues && typeof source.legacyValues === 'object') result.legacyValues = Object.fromEntries(conditionFields.map(([key])=>key).filter(key=>typeof source.legacyValues[key] === 'string').map(key=>[key,source.legacyValues[key].slice(0,1500)]));
    return result;
  }
  function sanitizePlan(source, account) {
    const plan = { id: String(source.id).slice(0, 120), name: String(source.name || '').slice(0, 80), role: String(source.role || '').slice(0, 100), startDate: String(source.startDate || '').slice(0, 10), endDate: String(source.endDate || '').slice(0, 10), demand: numberOrBlank(source.demand), confirmed: Math.max(0, Number(source.confirmed) || 0), arrived: Math.max(0, Number(source.arrived) || 0), note: String(source.note || '').slice(0, 1500), brandId: String(source.brandId || '').slice(0, 100), groupId: String(source.groupId || '').slice(0, 100), status: source.status === 'ready' ? 'ready' : 'draft', revision: Math.max(0, Number(source.revision) || 0), conditions: sanitizeConditions(source.conditions, account), savedAt: typeof source.savedAt === 'string' ? source.savedAt : null, ...(source.legacy && typeof source.legacy === 'object' ? { legacy: clone(source.legacy) } : {}), ...(source.copiedFrom ? { copiedFrom: String(source.copiedFrom).slice(0, 120) } : {}) };
    plan.department = String(source.department || departments().find(department => plan.role.includes(department)) || (/销售/.test(plan.role) ? '市场销售' : '')).slice(0,40);
    if (source.schedulePrecision === 'month' || Object.hasOwn(source, 'startMonth')) Object.assign(plan, catalog()?.scheduleOf(source) || source);
    plan.groupId = account.groupId || plan.groupId;
    plan.brandId = Object.hasOwn(account, 'brandId') ? account.brandId : plan.brandId;
    const snapshot = catalog()?.normalizeSnapshot(source.publication?.snapshot);
    if (snapshot && snapshot.planId === plan.id && snapshot.hotelAccountId === account.id && ['published', 'paused', 'closed'].includes(source.publication.state)) plan.publication = { state: source.publication.state, snapshot, updatedAt: String(source.publication.updatedAt || '') };
    return plan;
  }
  function hasConditions(draft) { return conditionFields.some(([key]) => Boolean(draft?.values?.[key])) || Object.keys(photoLabels).some(group => draft?.photos?.[group]?.length); }
  function migratePlans(account) {
    const rawLibrary = api().read(libraryKey(account), null), rawDraft = api().read(draftKey(account), null);
    const library = rawLibrary && (!rawLibrary.accountId || rawLibrary.accountId === account.id) ? rawLibrary : null;
    const oldDraft = rawDraft && (!rawDraft.accountId || rawDraft.accountId === account.id) ? rawDraft : null;
    const originalValues = draft => Object.fromEntries([...allFields.map(([key]) => key), ...Object.keys(baseLabels)].filter(key => typeof draft?.values?.[key] === 'string').map(key => [key, draft.values[key].slice(0, 1500)]));
    const profiles = (Array.isArray(library?.profiles) ? library.profiles : []).filter(profile => profile && typeof profile.id === 'string');
    if (!profiles.some(profile => profile.id === 'default')) profiles.unshift({ id: 'default', name: '原实习条件', draft: oldDraft });
    const batches = window.JiulvFeatures.employer?.legacyPlanRows?.() || [];
    const used = new Set(), migrated = [];
    batches.forEach((batch, index) => {
      const profileId = batch.conditionProfileId || 'default', profile = profiles.find(item => item.id === profileId);
      used.add(profileId);
      migrated.push(sanitizePlan({ ...batch, id: String(batch.id || `legacy-plan-${index + 1}`), conditions: profile?.draft, legacy: { batchId: batch.id || null, conditionProfileId: profileId, missingCondition: !profile, originalValues: originalValues(profile?.draft) } }, account));
    });
    profiles.filter(profile => !used.has(profile.id) && (hasConditions(profile.draft) || profile.draft?.values?.jobTitle)).forEach((profile, index) => {
      const values = profile.draft?.values || {};
      migrated.push(sanitizePlan({ id: `retained-${profile.id}`.slice(0, 120), name: values.jobTitle ? `${values.jobTitle}计划` : profile.name || `保留的招聘计划 ${index + 1}`, role: values.jobTitle || '', demand: values.headcount || '', startDate: values.startDate || '', endDate: '', note: values.durationMonths ? `原草稿实习周期：${values.durationMonths}个月，请确认起止日期。` : '', conditions: profile.draft, legacy: { conditionProfileId: profile.id, retainedConditions: true, originalValues: originalValues(profile.draft) } }, account));
    });
    return migrated;
  }
  function canonicalPlans(account) {
    const saved = api().read(planKey(account), null);
    return saved?.accountId === account.id && Array.isArray(saved.plans) ? saved.plans.filter(row => row && typeof row.id === 'string').map(row => sanitizePlan(row, account)) : null;
  }
  function refreshSavedPlans(account) {
    const latest = canonicalPlans(account);
    if (latest) { records = latest; canonicalSeen = true; }
    else if (canonicalSeen) records = [];
  }
  function fingerprint(plan) {
    if (!plan) return null;
    const copy = clone(plan);
    // Hotel account edits do not change this plan's independently edited terms.
    Object.keys(baseLabels).forEach(key => delete copy.conditions.values[key]);
    return JSON.stringify(copy);
  }
  function editState(plan, isPersisted) { return { plan: clone(plan), dirty: false, baseSnapshot: fingerprint(plan), basePersisted: isPersisted }; }
  function ensureAccount() {
    const account = api().getHotelAccount();
    if (!account) return null;
    if (account.id === loadedAccountId) { refreshSavedPlans(account); return account; }
    invalidatePhotos(); drafts.clear(); editor = null; infoEditor = null; selectedFlowPlan = ''; mode = 'list'; loadedAccountId = account.id; canonicalSeen = false;
    const saved = canonicalPlans(account);
    records = saved || migratePlans(account); canonicalSeen = saved !== null;
    const seen = new Set(); records = records.filter(row => { if (seen.has(row.id)) return false; seen.add(row.id); return true; });
    return account;
  }
  function currentForm() {
    const account = api().getHotelAccount(), form = byId('hotel-questionnaire-form');
    return account && account.id === loadedAccountId && editor && form?.dataset.accountId === account.id && form.dataset.planId === editor.plan.id ? form : null;
  }
  function capture() {
    const form = currentForm(); if (!form) return false;
    const data = new FormData(form), fields = { planName: 'name', jobTitle: 'role', headcount: 'demand', startDate: 'startDate', endDate: 'endDate', planNote: 'note', brandId: 'brandId', department: 'department', startMonth: 'startMonth', durationMonths: 'durationMonths' };
    Object.entries(fields).forEach(([key, target]) => { const value = data.get(key); if (value !== null && value !== undefined) editor.plan[target] = target === 'demand' ? numberOrBlank(value) : String(value).trim().slice(0, target === 'note' ? 1500 : target === 'name' ? 80 : 100); });
    if (data.get('department') !== null && data.get('department') !== undefined) {
      editor.plan.role = editor.plan.department ? `${editor.plan.department}实习生` : '';
      editor.plan.name = [editor.plan.startMonth, editor.plan.department ? `${editor.plan.department}实习计划` : '新实习计划'].filter(Boolean).join(' ');
      Object.assign(editor.plan, catalog().scheduleOf({...editor.plan,schedulePrecision:'month'}));
    }
    editor.plan.brandId = Object.hasOwn(api().getHotelAccount(), 'brandId') ? api().getHotelAccount().brandId : editor.plan.brandId;
    editor.plan.groupId = api().getHotelAccount().groupId || (window.JIULV_HOTEL_GROUPS || []).find(group => group.brands.some(brand => brand.id === editor.plan.brandId))?.id || editor.plan.groupId || '';
    Object.keys(baseLabels).forEach(key => editor.plan.conditions.values[key] = api().getHotelAccount()[key] || '');
    drafts.set(editor.plan.id, editor); return true;
  }
  function invalidatePhotos() {
    photoToken++; photoTask = null;
    const form = byId('hotel-questionnaire-form');
    if (form) { form.removeAttribute('aria-busy'); form.querySelectorAll('[data-hotel-busy]').forEach(button => button.disabled = false); }
  }
  function status() { const node = byId('hotel-draft-status'); if (node) node.textContent = photoTask ? '正在读取图片，请稍候。' : editor?.dirty ? '有未保存的修改；返回列表后可以继续编辑。' : editor?.plan.savedAt ? `保存于 ${new Date(editor.plan.savedAt).toLocaleString('zh-CN')}，仅保存在本机。` : '尚未保存，填写后即可保留这份招聘计划。'; }
  function field([key, label, type, config = {}], value = editor?.plan.conditions.values[key] || '') {
    const examples = {stipendFirst6:'2800',stipendFrom7:'3200',dormOccupancy:'4',commuteMinutes:'15',mealsPerDay:'3',dormFacilities:'空调、独立卫浴、储物柜',dormCommonFacilities:'洗衣房、公共厨房、活动室',headcount:'5',startMonth:'2027-01',officialUrl:'https://www.hotel.com'};
    const hint = type === 'select' ? '' : `例：${String(config.placeholder || examples[key] || '请填写具体内容').replace(/^(?:例如|例)[:：]\s*/, '')}`;
    const attributes = `id="hotel-${e(key)}" name="${e(key)}" ${config.required ? 'required' : ''} ${hint ? `placeholder="${e(hint)}"` : ''}`;
    const control = type === 'select' ? `<select ${attributes}><option value="">请选择</option>${config.options.map(option => `<option value="${e(option)}" ${value === option ? 'selected' : ''}>${e(config.optionLabels?.[option] || option)}</option>`).join('')}</select>` : type === 'textarea' ? `<textarea ${attributes} rows="${config.rows || 3}" maxlength="${config.maxLength || 1500}">${e(value)}</textarea>` : `<input ${attributes} type="${type}" value="${e(value)}" ${type === 'number' ? `min="${config.min ?? 0}" max="${config.max ?? 100000}" step="${config.step ?? 1}" inputmode="decimal"` : `maxlength="${key === 'planName' ? 80 : key === 'jobTitle' ? 100 : 200}"` }>`;
    return `<label class="hotel-field ${config.full ? 'hotel-full' : ''}" for="hotel-${e(key)}"><span>${e(label)}${config.required ? ' <i>*</i>' : ''}</span>${control}</label>`;
  }
  function renderedPlans() {
    const rows = records.map(plan => drafts.get(plan.id)?.dirty ? drafts.get(plan.id) : { plan, dirty: false });
    drafts.forEach(value => { if (value.dirty && !records.some(plan => plan.id === value.plan.id)) rows.push(value); });
    return rows;
  }
  function publicationLabel(plan) {
    if (!plan.publication) return plan.status === 'ready' ? '草稿 · 可发布' : '草稿 · 待完善';
    const label = { published: '展示中', paused: '已暂停', closed: '已招满 / 关闭' }[plan.publication.state];
    if ((plan.publication.snapshot.endDate && plan.publication.snapshot.endDate < new Date().toISOString().slice(0, 10)) || (plan.publication.snapshot.conditions.formVersion !== '5.6-simple' && plan.publication.snapshot.conditions.values.validUntil && plan.publication.snapshot.conditions.values.validUntil < new Date().toISOString().slice(0, 10))) return '已到有效期 · 请更新';
    return label + (plan.revision > plan.publication.snapshot.planRevision ? ' · 有待发布修改' : '');
  }
  function publicationActions(plan) {
    if (!plan.publication) return `<button type="button" class="secondary" data-hotel-action="prepare-publish" data-id="${e(plan.id)}">发布岗位</button>`;
    return `${plan.revision > plan.publication.snapshot.planRevision ? `<button type="button" class="secondary" data-hotel-action="prepare-publish" data-id="${e(plan.id)}">发布修改</button>` : ''}${plan.publication.state === 'published' ? `<button type="button" class="hotel-text-button" data-hotel-action="pause-plan" data-id="${e(plan.id)}">暂停</button>` : `<button type="button" class="hotel-text-button" data-hotel-action="resume-plan" data-id="${e(plan.id)}">重新开放</button>`}${plan.publication.state !== 'closed' ? `<button type="button" class="hotel-text-button" data-hotel-action="close-plan" data-id="${e(plan.id)}">招满关闭</button>` : ''}`;
  }
  function scheduleLabel(plan) {
    if (plan.schedulePrecision === 'month') return `${plan.startMonth || '开始年月待填'} 起 · ${plan.durationMonths === 'unlimited' ? '时长不限' : plan.durationMonths ? `${plan.durationMonths}个月` : '时长待填'}`;
    return `${(plan.startDate || '').slice(0,7) || '开始年月待确认'} → ${(plan.endDate || '').slice(0,7) || '结束年月待确认'}`;
  }
  function stipendSummary(conditions) {
    const values = conditions.values || {};
    if (conditions.formVersion === '5.6-simple') return [['前6个月',values.stipendFirst6],['第7个月起',values.stipendFrom7]].filter(([,value])=>value !== '' && value !== undefined).map(([label,value])=>`${label} ¥${value}/月`).join(' · ');
    return values.stipend !== '' && values.stipend !== undefined ? `津贴 ¥${values.stipend}/月（原条件）` : '';
  }
  function dormSummary(conditions) {
    const values = conditions.values || {};
    if (conditions.formVersion === '5.6-simple') return [values.dormOccupancy ? `${values.dormOccupancy}人间` : '', values.dormUtilities ? `水电${values.dormUtilities}` : ''].filter(Boolean).join(' · ');
    return values.dormAvailable || '';
  }
  function listHTML() {
    const items = renderedPlans();
    return `<header class="hotel-simple-heading"><div><span class="overline">YOUR RECRUITMENT PLANS</span><h1>招聘计划</h1><p>按部门安排岗位与时间，实习条件直接复用。收到的申请和回应，也在这里继续。</p></div><div class="hotel-plan-heading-actions"><button type="button" class="primary" data-hotel-action="new-plan">＋ 新建部门计划</button><button type="button" class="secondary" data-hotel-action="flow-plan" data-id="">处理申请 ↓</button></div></header><div class="hotel-plan-list">${items.length ? items.map(({ plan, dirty: changed }) => {
      const facts = [stipendSummary(plan.conditions),dormSummary(plan.conditions)].filter(Boolean);
      return `<article class="hotel-plan-card ${selectedFlowPlan === plan.id ? 'is-selected' : ''}"><div class="hotel-plan-card-top"><span>${changed ? '未保存的修改' : publicationLabel(plan)}</span><small>实习信息 ${plan.conditions.revision ? `V${e(plan.conditions.revision)}` : '旧版 / 待填'}</small></div><h2>${e(plan.department || plan.role || '部门待选择')}</h2><p class="hotel-plan-role">${plan.demand === '' ? '人数待填写' : `计划招募 ${e(plan.demand)} 人`}</p><p class="hotel-plan-time">${e(scheduleLabel(plan))}</p>${facts.length ? `<div class="hotel-plan-facts">${facts.map(fact=>`<span>${e(fact)}</span>`).join('')}</div>` : ''}<div class="hotel-plan-card-actions"><button type="button" class="primary" data-hotel-action="flow-plan" data-id="${e(plan.id)}">查看申请与回应</button><button type="button" class="secondary" data-hotel-action="edit-plan" data-id="${e(plan.id)}">${changed ? '继续编辑' : '编辑计划'}</button><button type="button" class="hotel-text-button" data-hotel-action="copy-plan" data-id="${e(plan.id)}">复制</button><button type="button" class="hotel-text-button" data-hotel-action="preview-plan" data-id="${e(plan.id)}">学生预览</button></div><div class="hotel-publication-actions">${publicationActions(plan)}</div></article>`;
    }).join('') : '<div class="hotel-plan-empty"><h2>下一位伙伴，从一个部门计划开始</h2><p>选择部门、人数和实习时间；已填好的实习信息会一起带入。</p><button type="button" class="secondary" data-hotel-action="information">前往实习机会</button></div>'}</div><section class="hotel-flow-section" id="hotel-flow-section"><div class="hotel-flow-heading"><div><span class="overline">APPLICATIONS & RESPONSES</span><h2>申请与回应</h2></div><label class="hotel-field"><span>查看招聘计划</span><select id="hotel-flow-plan"><option value="" ${selectedFlowPlan === '' ? 'selected' : ''}>全部申请</option>${selectedFlowPlan && selectedFlowPlan !== '__legacy__' && !records.some(plan=>plan.id===selectedFlowPlan) ? `<option value="${e(selectedFlowPlan)}" selected>历史部门计划</option>` : ''}${records.map(plan => `<option value="${e(plan.id)}" ${selectedFlowPlan === plan.id ? 'selected' : ''}>${e(plan.name || plan.role || '未命名计划')}</option>`).join('')}<option value="__legacy__" ${selectedFlowPlan === '__legacy__' ? 'selected' : ''}>历史未关联计划</option></select></label></div><div id="recruitment-flow-root"></div></section><p class="hotel-plan-demo">本机演示 · 发布与回应仅在此浏览器保存，暂不跨设备同步或发送邮件。</p>`;
  }
  function formHTML(account) {
    const plan = editor.plan;
    const options = departments().map(item => `<option value="${e(item)}" ${plan.department === item ? 'selected' : ''}>${e(item)}</option>`).join('');
    const durationOptions = Array.from({length:12},(_,i)=>`<option value="${i+1}" ${String(plan.durationMonths) === String(i+1) ? 'selected' : ''}>${i+1}个月</option>`).join('');
    return `<header class="hotel-simple-heading hotel-plan-edit-heading"><div><button type="button" class="hotel-back" data-hotel-action="list-plans">← 招聘计划</button><h1>${records.some(row => row.id === plan.id) ? '编辑部门计划' : '新建部门计划'}</h1><p>岗位与时间分别安排，实习待遇统一复用。</p></div></header><form id="hotel-questionnaire-form" class="hotel-form" data-account-id="${e(account.id)}" data-plan-id="${e(plan.id)}"><section class="ft-card hotel-section"><h2>岗位与时间</h2><div class="hotel-grid"><label class="hotel-field"><span>岗位部门 <i>*</i></span><select name="department" required><option value="">请选择部门</option>${options}</select></label>${field(['headcount','招聘人数','number',{required:true,min:1,max:9999}],plan.demand)}${field(['startMonth','实习开始年月','month',{required:true}],plan.startMonth || plan.startDate?.slice(0,7) || '')}<label class="hotel-field"><span>实习时长 <i>*</i></span><select name="durationMonths" required><option value="">请选择时长</option>${durationOptions}<option value="unlimited" ${plan.durationMonths === 'unlimited' ? 'selected' : ''}>不限</option></select></label>${field(['planNote','部门具体岗位说明（选填）','textarea',{full:true,placeholder:'例：餐饮部西餐厅、酒吧、宴会；前厅部礼宾、前台'}],plan.note)}</div></section><div class="hotel-bottom-bar ft-card"><p id="hotel-draft-status" role="status"></p><div class="hotel-actions"><button type="submit" class="primary" formnovalidate data-hotel-busy>保存草稿</button><button type="button" class="secondary" data-hotel-action="publish-current" data-hotel-busy>${plan.publication ? '预览并发布修改' : '预览并发布岗位'}</button><button type="button" class="hotel-text-button" data-hotel-action="preview-current" data-hotel-busy>学生视角预览</button><button type="button" class="hotel-text-button" data-hotel-action="copy-current" data-hotel-busy>复制当前计划</button></div><small>未填完整也可保存。确认发布后，同学可以按部门筛选这份岗位；已发出的申请保留原实习条件。</small></div></form>`;
  }
  function renderPlans(preserve = true) {
    const root = byId('workflow-view'); if (!root || !api()) return;
    if (preserve) capture();
    const account = ensureAccount();
    if (!account) { root.innerHTML = '<section class="hotel-plan-empty"><h1>登录酒店账号后管理招聘计划</h1><button class="primary" data-hotel-action="register">酒店注册 / 登录</button></section>'; return; }
    root.innerHTML = mode === 'form' && editor ? formHTML(account) : listHTML(); status();
    if (mode !== 'form') window.JiulvFeatures.workflow?.renderEmbedded?.({planId:selectedFlowPlan,mountId:'recruitment-flow-root'});
  }
  function render() { renderInformation(); }
  function navigate() { if (byId('workflow-view')?.hidden !== false) api().showView?.('workflow'); }
  function scrollToTop() { window.scrollTo?.({ top: 0, behavior: 'instant' }); }
  function guardPhoto() { if (!photoTask) return false; api().toast('图片正在读取，请完成后再切换计划。'); return true; }
  function openPlan(id) {
    if (guardPhoto()) return; capture(); const account = ensureAccount(); if (!account) return api().requireHotelAccount(() => openPlan(id));
    let selected = drafts.get(id)?.dirty ? drafts.get(id) : null; const saved = records.find(plan => plan.id === id);
    if (!selected && saved) selected = editState(sanitizePlan(saved, account), canonicalSeen);
    if (!selected) return api().toast('这份计划已不可用，请返回列表。');
    if (selected.plan.schedulePrecision !== 'month') {
      const start = selected.plan.startDate, end = selected.plan.endDate;
      const count = start && end ? (Number(end.slice(0,4)) - Number(start.slice(0,4))) * 12 + Number(end.slice(5,7)) - Number(start.slice(5,7)) + 1 : 0;
      selected.plan.startMonth = start.slice(0,7); selected.plan.durationMonths = count >= 1 && count <= 12 ? String(count) : '';
      selected.plan.schedulePrecision = 'month';
    }
    if (inheritCurrentConditions(selected.plan, account)) selected.dirty = true;
    editor = selected; drafts.set(id, editor); mode = 'form'; navigate(); renderPlans(false); scrollToTop();
  }
  function currentSharedConditions(account) {
    const source = api().read(informationKey(account), null);
    // Legacy hotels may have different plan conditions. Only a deliberately saved
    // common form supersedes them; merely saving the hotel introduction does not.
    return source?.accountId === account.id && source.conditions?.savedAt && source.conditions?.revision > 0 ? sanitizeConditions(source.conditions, account) : null;
  }
  function inheritCurrentConditions(plan, account) {
    const current = currentSharedConditions(account);
    if (!current || JSON.stringify(current) === JSON.stringify(plan.conditions)) return false;
    plan.conditions = current;
    return true;
  }
  function newPlan() {
    if (guardPhoto()) return; capture(); const account = ensureAccount(); if (!account) return api().requireHotelAccount(newPlan);
    editor = { plan: sanitizePlan({ id: `plan-${crypto.randomUUID()}`, name: '', role: '', demand: '', department:'', startMonth:'',durationMonths:'',schedulePrecision:'month', conditions: savedInformation(account).conditions }, account), dirty: true, baseSnapshot: null, basePersisted: false };
    drafts.set(editor.plan.id, editor); mode = 'form'; navigate(); renderPlans(false); scrollToTop();
  }
  function copyPlan(id = editor?.plan.id) {
    if (guardPhoto()) return; capture(); const account = ensureAccount(); if (!account) return;
    const source = drafts.get(id)?.dirty ? drafts.get(id).plan : records.find(plan => plan.id === id); if (!source) return;
    const copied = sanitizePlan(source, account); copied.id = `plan-${crypto.randomUUID()}`; copied.name = `${source.name || '招聘计划'} · 副本`.slice(0, 80); copied.confirmed = 0; copied.arrived = 0; copied.savedAt = null; copied.copiedFrom = source.id; delete copied.legacy; delete copied.publication; copied.status = 'draft';
    inheritCurrentConditions(copied, account);
    copied.revision = 0; editor = { plan: copied, dirty: true, baseSnapshot: null, basePersisted: false }; drafts.set(copied.id, editor); mode = 'form'; navigate(); renderPlans(false); scrollToTop(); api().toast('已复制成独立计划，调整后保存即可。');
  }
  function showPlans() { if (guardPhoto()) return; capture(); mode = 'list'; navigate(); renderPlans(false); scrollToTop(); }
  function completePlan(plan) { return !catalog()?.publicationError(plan, api().getHotelAccount()); }
  function validatePlan(plan) {
    if (plan.department && !departments().includes(plan.department)) return '请从岗位部门列表中选择。';
    if (plan.demand !== '' && (!Number.isInteger(Number(plan.demand)) || Number(plan.demand) < 1 || Number(plan.demand) > 9999)) return '招聘人数需为 1 至 9999 的整数；暂不确定可以留空。';
    const validDate = value => !value || (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value);
    if (plan.schedulePrecision === 'month' && ((plan.startMonth && !catalog()?.validMonth(plan.startMonth)) || (plan.durationMonths && !/^(?:[1-9]|1[0-2]|unlimited)$/.test(plan.durationMonths)))) return '请选择有效的开始年月与实习时长。';
    if (!validDate(plan.startDate) || !validDate(plan.endDate)) return '请填写有效的实习日期。';
    if (plan.startDate && plan.endDate && plan.startDate > plan.endDate) return '实习开始日期不能晚于结束日期。';
    for (const [key, label, type, config = {}] of formFields) {
      const value = plan.conditions.values[key];
      if (type === 'number' && value && (!Number.isFinite(Number(value)) || Number(value) < (config.min ?? 0) || Number(value) > (config.max ?? 100000) || (!config.step && !Number.isInteger(Number(value))))) return `${label}超出可填写范围，请核对。`;
    }
    return '';
  }
  function savePlan(quiet = false) {
    if (guardPhoto()) return false;
    const form = currentForm(); if (!form || !capture()) return false;
    if (inheritCurrentConditions(editor.plan, api().getHotelAccount())) editor.dirty = true;
    const error = validatePlan(editor.plan); if (error) { api().toast(error); return false; }
    const account = api().getHotelAccount(), latest = canonicalPlans(account);
    const latestRow = latest?.find(row => row.id === editor.plan.id);
    const conflict = editor.baseSnapshot === null ? Boolean(latestRow) : latestRow ? fingerprint(latestRow) !== editor.baseSnapshot : editor.basePersisted;
    if (conflict) {
      editor.dirty = true; status();
      api().toast('这份计划已在其他页面更新或删除。你的填写内容仍保留，可复制当前计划另存，避免覆盖他人的修改。');
      return false;
    }
    const now = new Date().toISOString(), saved = sanitizePlan(editor.plan, account);
    saved.savedAt = now; saved.status = completePlan(saved) ? 'ready' : 'draft'; saved.revision = (latestRow?.revision || 0) + 1;
    const baseline = latest || (canonicalSeen ? [] : records);
    const next = baseline.some(row => row.id === saved.id) ? baseline.map(row => row.id === saved.id ? saved : row) : [...baseline, saved];
    if (!api().save(planKey(account), { schemaVersion: '5.5-plans', accountId: account.id, plans: next, savedAt: now })) { api().toast('保存未完成，当前填写内容与照片仍保留，可稍后重试。'); return false; }
    records = next; canonicalSeen = true; editor = editState(saved, true); drafts.set(saved.id, editor); renderPlans(false); announcePlans(); if (!quiet) api().toast(saved.publication ? '修改已保存为草稿；学生端仍展示上一次确认发布的条件。' : saved.status === 'draft' ? '已保存为待完善草稿，之后可以继续填写。' : '草稿已保存，预览并发布后可在学生端展示。'); return true;
  }
  function announcePlans() {
    if (typeof CustomEvent !== 'undefined') document.dispatchEvent?.(new CustomEvent('jiulv:planschange'));
  }
  function writePublication(plan, publication, updatedPlan = plan) {
    const account = api().getHotelAccount(), latest = canonicalPlans(account);
    const stored = latest?.find(row => row.id === plan.id);
    if (!stored || fingerprint(stored) !== fingerprint(plan)) return api().toast('计划已在其他页面更新，请重新预览后操作。');
    const nextPlan = { ...stored, ...updatedPlan, publication }, now = new Date().toISOString();
    const next = latest.map(row => row.id === plan.id ? nextPlan : row);
    if (!api().save(planKey(account), { schemaVersion: '5.5-plans', accountId: account.id, plans: next, savedAt: now })) return false;
    if (editor?.plan.id === plan.id && editor.baseSnapshot === fingerprint(stored)) { editor.baseSnapshot = fingerprint(nextPlan); editor.plan = clone(nextPlan); drafts.set(plan.id, editor); }
    records = next; canonicalSeen = true; pendingPublication = null; document.querySelector?.('#modal')?.close?.(); renderPlans(false); announcePlans(); return true;
  }
  function preparePublish(id) {
    if (guardPhoto()) return; capture(); const account = ensureAccount();
    const plan = records.find(row => row.id === id);
    if (!plan || drafts.get(id)?.dirty) return api().toast('请先保存当前草稿，再预览发布。');
    const candidate = sanitizePlan(plan, account);
    if (inheritCurrentConditions(candidate, account)) candidate.revision += 1;
    const error = validatePlan(candidate) || catalog()?.publicationError(candidate, account);
    if (error) { api().toast(error); openPlan(id); return; }
    if (!catalog()) return api().toast('岗位展示模块尚未加载，请刷新后重试。');
    if ((candidate.endDate && candidate.endDate < new Date().toISOString().slice(0, 10)) || (candidate.conditions.formVersion !== '5.6-simple' && candidate.conditions.values.validUntil && candidate.conditions.values.validUntil < new Date().toISOString().slice(0, 10))) { api().toast('实习安排或招聘有效期已过，请更新后再发布。'); openPlan(id); return; }
    pendingPublication = { accountId: account.id, id, fingerprint: fingerprint(plan), commonFingerprint: JSON.stringify(currentSharedConditions(account)), plan: candidate };
    previewPlan(id, true, candidate);
  }
  function publishPlan(id) {
    const account = ensureAccount(), plan = records.find(row => row.id === id);
    if (!account || !plan || pendingPublication?.accountId !== account.id || pendingPublication.id !== id || pendingPublication.fingerprint !== fingerprint(plan) || drafts.get(id)?.dirty || pendingPublication.commonFingerprint !== JSON.stringify(currentSharedConditions(account))) return api().toast('计划内容已变化，请重新保存并预览后再发布。');
    const candidate = pendingPublication.plan;
    const error = validatePlan(candidate) || catalog().publicationError(candidate, account); if (error) return api().toast(error);
    const now = new Date().toISOString();
    candidate.status = 'ready'; if (candidate.revision !== plan.revision) candidate.savedAt = now;
    const snapshot = catalog().makeSnapshot(candidate, account, now);
    if (writePublication(plan, { state: 'published', snapshot, updatedAt: now }, candidate)) api().toast('岗位已在本机演示中展示，学生端可查看并申请。');
  }
  function changePublication(id, state) {
    if (guardPhoto()) return; capture(); const account = ensureAccount(), plan = records.find(row => row.id === id);
    if (!account || !plan?.publication) return;
    if (state === 'published' && ((plan.publication.snapshot.endDate && plan.publication.snapshot.endDate < new Date().toISOString().slice(0, 10)) || (plan.publication.snapshot.conditions.formVersion !== '5.6-simple' && plan.publication.snapshot.conditions.values.validUntil && plan.publication.snapshot.conditions.values.validUntil < new Date().toISOString().slice(0, 10)))) return api().toast('展示版本已过有效期，请更新草稿并重新发布。');
    if (writePublication(plan, { ...plan.publication, state, updatedAt: new Date().toISOString() })) api().toast(state === 'published' ? '已重新开放原展示版本；待发布修改不会自动展示。' : state === 'paused' ? '已暂停新的申请与邀请，已有申请继续保留。' : '岗位已关闭，已有申请与条件版本继续保留。');
  }
  function exportPlan(plan) {
    const account = api().getHotelAccount(), now = new Date().toISOString();
    return {schemaVersion:'5.6-public-plan',type:'hotel-recruitment-plan',identity:{hotelName:account?.hotelName || '',hotelCity:account?.hotelCity || ''},status:'本机演示 · '+publicationLabel(plan),generatedAt:now,plan:catalog()?.makeSnapshot(plan,account,now) || null};
  }
  function previewPlan(id = editor?.plan.id, publishing = false, preview = null) {
    if (guardPhoto()) return; capture();
    if (!publishing) pendingPublication = null;
    const plan = preview || (drafts.get(id)?.dirty ? drafts.get(id).plan : records.find(row => row.id === id)); if (!plan) return;
    const groups = catalog()?.conditionDisplayGroups?.(plan.conditions) || [];
    const labels = catalog()?.CONDITION_PHOTO_LABELS || photoLabels;
    api().modal(`<h2 id="modal-title">${e(plan.name || '招聘计划预览')}</h2><p class="hotel-preview-hotel">${e(api().getHotelAccount().hotelName)} · ${e(window.JiulvRegions?.formatCity?.(api().getHotelAccount().hotelCity) || api().getHotelAccount().hotelCity)}</p><p class="ft-notice">学生视角预览 · 空白项目为待确认。${publishing ? '确认发布后，同一浏览器的学生端可查看并申请。' : '当前草稿未自动替换已展示版本。'}</p><div class="hotel-preview"><section><h3>岗位与时间</h3><dl>${[['岗位', plan.role], ['招聘人数', plan.demand], ['实习时间', scheduleLabel(plan)], ['部门具体岗位说明', plan.note]].map(([label, value]) => `<div><dt>${label}</dt><dd>${e(value === '' ? '待确认' : value)}</dd></div>`).join('')}</dl></section>${groups.map(group=>`<section><h3>${e(group.title)}</h3><dl>${group.rows.map(([label,value])=>`<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`).join('')}</dl></section>`).join('')}${Object.keys(labels).filter(group=>plan.conditions.photos[group]?.length).map(group=>`<section><h3>${e(labels[group])}照片</h3><div class="hotel-preview-photos">${plan.conditions.photos[group].map(photo=>`<img src="${e(photo.dataUrl)}" alt="${e(photo.name)}">`).join('')}</div></section>`).join('')}</div><div class="hotel-preview-actions">${publishing ? `<button type="button" class="primary" data-hotel-action="confirm-publish" data-id="${e(plan.id)}">确认发布${plan.publication ? '修改' : '岗位'}（本机演示）</button>` : ''}<button type="button" class="secondary" data-hotel-action="export-plan" data-id="${e(plan.id)}">下载计划信息</button></div>`, 'STUDENT PREVIEW / 学生视角');
  }
  function savedInformation(account) {
    const source = api().read(informationKey(account), null);
    if (source?.accountId === account.id) return { schemaVersion:'5.6-hotel-information', accountId:account.id, profile:cleanProfile(source.profile), publishedProfile:source.publishedProfile?.publishedAt ? cleanProfile(source.publishedProfile) : null, conditions:sanitizeConditions(source.conditions,account), savedAt:source.savedAt || '' };
    const canonical = canonicalPlans(account);
    const candidate = (canonical === null ? records : canonical).find(plan => hasConditions(plan.conditions));
    const legacy = api().read(draftKey(account), null);
    const conditions = candidate?.conditions || (canonical === null && (!legacy?.accountId || legacy.accountId === account.id) ? legacy : null);
    return {schemaVersion:'5.6-hotel-information',accountId:account.id,profile:cleanProfile({}),publishedProfile:null,conditions:sanitizeConditions(conditions,account),savedAt:''};
  }
  function informationDraft(account) {
    if (infoEditor?.accountId === account.id) return infoEditor;
    const value = savedInformation(account);
    infoEditor = {accountId:account.id,value,base:JSON.stringify(value),dirty:false};
    return infoEditor;
  }
  function captureInformation() {
    const form = byId('hotel-information-form'), account = api().getHotelAccount();
    if (!form || !infoEditor || !account || form.dataset.accountId !== account.id || infoEditor.accountId !== account.id) return false;
    const data = new FormData(form);
    if (informationSection === 'profile') {
      for (const key of ['intro','highlights','officialUrl']) { const value = data.get(key); if (value !== null && value !== undefined) infoEditor.value.profile[key] = key === 'intro' ? String(value).trim() : String(value).trim().slice(0,1500); }
    } else for (const [key] of formFields) { const value = data.get(key); if (value !== null && value !== undefined) infoEditor.value.conditions.values[key] = String(value).trim().slice(0,1500); }
    return true;
  }
  function infoPhotos(group, title, list, max) {
    return `<div class="hotel-photo-block hotel-full"><div class="hotel-photo-heading"><b>${e(title)}（选填）</b><span>${list.length} / ${max} 张</span></div><p class="ft-muted">JPG / PNG / WebP，每张不超过 2 MB；请使用可公开展示的酒店图片。</p><div class="hotel-photo-list">${list.map((photo,index)=>`<figure class="hotel-photo"><img src="${e(photo.dataUrl)}" alt="${e(photo.name || title)}"><figcaption>${e(photo.name)}</figcaption><button type="button" class="hotel-photo-remove" data-information-action="remove-photo" data-group="${group}" data-index="${index}" aria-label="移除照片">×</button></figure>`).join('')}</div><label class="hotel-upload"><span>＋ 上传${e(title)}</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple data-information-photo="${group}" ${list.length >= max ? 'disabled' : ''}></label></div>`;
  }
  function informationHTML(account) {
    const record = informationDraft(account).value, profile = record.profile, conditions = record.conditions;
    const profileForm = `<section class="ft-card hotel-section"><div class="hotel-information-caption"><h2>让同学先认识酒店</h2><p>${e(account.hotelName)} · ${e(window.JiulvRegions?.formatCity?.(account.hotelCity) || account.hotelCity)}</p></div><div class="hotel-grid">${field(['intro','酒店简介','textarea',{full:true,rows:5,maxLength:300,placeholder:'用一段话介绍酒店基本信息，300字以内'}],profile.intro)}${profile.intro.length > 300 ? '<p class="hotel-form-note hotel-full">原简介超过300字，请自行精简后再保存。原内容仍保留。</p>' : ''}${field(['officialUrl','酒店官方网站（选填）','url',{full:true,placeholder:'https://www.hotel.com'}],profile.officialUrl)}${field(['highlights','酒店亮点与实习优势（选填）','textarea',{full:true,placeholder:'例如：国际宾客服务机会、部门带教或交通优势'}],profile.highlights)}${infoPhotos('hotel','酒店照片',profile.photos,6)}</div></section>`;
    const simpleField = item => field(item, conditions.values[item[0]] || '');
    const byKey = key => simpleField(formFields.find(item=>item[0] === key));
    const legacyNotice = conditions.formVersion !== '5.6-simple' && hasConditions(conditions) ? `<p class="hotel-form-note">已保留原有条件。${conditions.values.stipend ? '原津贴未自动拆分，请分别核对前6个月与第7个月起金额。' : '请按当前表单核对后保存。'}${conditions.values.rotationType && !['是','否'].includes(conditions.values.rotationType) ? '轮岗安排请重新选择是或否。' : ''}</p>` : '';
    const conditionsForm = legacyNotice + sections.filter(section=>section.id !== 'life').map(section=>`<section class="ft-card hotel-section"><h2>${e(section.title)}</h2><div class="hotel-grid">${section.fields.map(simpleField).join('')}</div></section>`).join('') + `<section class="ft-card hotel-section hotel-life-simple"><h2>住宿、通勤与餐食</h2><div class="hotel-life-block"><h3>宿舍</h3><div class="hotel-grid">${byKey('dormOccupancy')}${byKey('dormUtilities')}${byKey('dormFacilities')}${infoPhotos('accommodation','宿舍内设施照片',conditions.photos.accommodation,photoLimit('accommodation'))}${byKey('dormCommonFacilities')}${infoPhotos('dormCommon','宿舍公区设施照片',conditions.photos.dormCommon,photoLimit('dormCommon'))}</div></div><div class="hotel-life-block"><h3>通勤</h3><div class="hotel-grid">${byKey('commuteMinutes')}${byKey('commuteMode')}</div></div><div class="hotel-life-block"><h3>员工餐</h3><div class="hotel-grid">${byKey('mealsPerDay')}${byKey('halalMeals')}${infoPhotos('meals','员工餐照片',conditions.photos.meals,3)}</div></div></section>`;
    return `<header class="hotel-simple-heading"><div><span class="overline">YOUR HOTEL & INTERNSHIP</span><h1>实习机会</h1><p>让酒店被看见，让实习生活更清楚。填好一次，部门招聘计划直接复用。</p></div></header><nav class="hotel-information-tabs" aria-label="实习机会栏目"><button type="button" data-information-action="tab" data-tab="profile" class="${informationSection === 'profile' ? 'active' : ''}" aria-pressed="${informationSection === 'profile'}"><span class="hotel-info-icon" aria-hidden="true">${hotelInfoIcon('hotel')}</span><strong>酒店简介</strong><small>展示酒店特色与环境</small></button><button type="button" data-information-action="tab" data-tab="conditions" class="${informationSection === 'conditions' ? 'active' : ''}" aria-pressed="${informationSection === 'conditions'}"><span class="hotel-info-icon" aria-hidden="true">${hotelInfoIcon('conditions')}</span><strong>实习信息</strong><small>各部门共用的实习条件</small></button></nav><form id="hotel-information-form" class="hotel-form" data-account-id="${e(account.id)}">${informationSection === 'profile' ? profileForm : conditionsForm}<div class="hotel-bottom-bar ft-card"><p class="hotel-information-status" role="status">${infoEditor.dirty ? '有尚未保存的修改。' : informationSection === 'profile' ? record.publishedProfile ? `已有酒店展示页 · V${e(record.publishedProfile.revision)}` : '酒店资料尚未公开，保存草稿后也可继续完善。' : conditions.revision > 0 && conditions.savedAt ? `已保存实习信息 V${e(conditions.revision)}，新建计划将直接复用。` : hasConditions(conditions) ? '已带入原有条件，请核对后保存。' : '尚未保存实习信息，新建计划前可以先在这里完善。'}</p><div class="hotel-actions"><button type="submit" class="primary" data-information-busy>${informationSection === 'profile' ? '保存酒店资料' : '保存实习信息'}</button>${informationSection === 'profile' ? `<button type="button" class="secondary" data-information-action="publish" data-information-busy>预览并发布酒店展示页</button>` : `<button type="button" class="secondary" data-information-action="create-plan" data-information-busy>保存并新建部门计划</button>`}</div><small>${informationSection === 'profile' ? '只有确认发布后的介绍与照片会展示给实习生，之后仍可修改并重新发布。' : '新建或编辑计划会自动带入已保存的实习信息。确认发布后更新学生岗位；已发出的申请保留原条件。'}本机演示，图片和资料暂不跨设备同步。</small></div>${informationSection === 'conditions' && conditions.revision > 0 && conditions.savedAt && JSON.stringify(conditions) === JSON.stringify(savedInformation(account).conditions) ? `<section class="hotel-information-next" aria-label="保存后的下一步"><div><small>实习信息已保存</small><h2>下一步，创建部门招聘计划</h2><p>只需选择部门、人数与实习时间，刚才的条件会直接带入。</p></div><button type="button" class="primary" data-information-action="next-plan">创建部门计划 →</button></section>` : ''}</form>`;
  }
  function hotelInfoIcon(kind) {
    const content = kind === 'hotel' ? '<path d="M5 21V4h14v17M2 21h20M9 21v-5h6v5M9 8h1m4 0h1M9 12h1m4 0h1"/>' : '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h4"/>';
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;
  }
  function renderInformation(preserve = true) {
    const root = byId('hotel-view'); if (!root || !api()) return;
    if (preserve) captureInformation();
    const account = ensureAccount();
    if (!account) { root.innerHTML = '<section class="hotel-plan-empty"><h1>登录酒店账户后管理实习机会</h1><button class="primary" data-hotel-action="register">酒店注册 / 登录</button></section>'; return; }
    informationDraft(account); root.innerHTML = informationHTML(account);
  }
  function showInformation(section = 'profile') {
    if (guardPhoto()) return;
    capture(); captureInformation(); const account = ensureAccount(); if (!account) return api().requireHotelAccount(()=>showInformation(section));
    informationSection = section === 'conditions' ? 'conditions' : 'profile';
    api().showView?.('hotel'); renderInformation(false); scrollToTop();
  }
  function openPlanFlow(planId = '') {
    if (guardPhoto()) return;
    capture(); const account = ensureAccount(); if (!account) return api().requireHotelAccount(()=>openPlanFlow(planId));
    selectedFlowPlan = typeof planId === 'string' ? planId : ''; mode = 'list'; navigate(); renderPlans(false);
    byId('hotel-flow-section')?.scrollIntoView?.({block:'start',behavior:'smooth'});
  }
  function saveInformation(quiet = false) {
    if (guardPhoto() || !captureInformation()) return false;
    const account = api().getHotelAccount(), current = savedInformation(account);
    if (JSON.stringify(current) !== infoEditor.base) { api().toast('酒店信息已在其他页面更新，当前内容已保留，请刷新后核对再保存。'); return false; }
    const profile = infoEditor.value.profile;
    if (informationSection === 'profile' && profile.intro.length > 300) { api().toast('酒店简介请控制在300字以内，原内容仍保留，请核对后自行精简。'); return false; }
    if (informationSection === 'profile' && profile.officialUrl && !cleanProfile(profile).officialUrl) { api().toast('官网链接请以 https:// 或 http:// 开头。'); return false; }
    const conditionError = informationSection === 'conditions' ? validatePlan({demand:'',startDate:'',endDate:'',conditions:infoEditor.value.conditions}) : '';
    if (conditionError) { api().toast(conditionError); return false; }
    if (informationSection === 'conditions') for (const [key,label,type,config] of formFields) {
      const value = infoEditor.value.conditions.values[key];
      if (type === 'select' && value && !config.options.includes(value)) { api().toast(`请从选项中选择${label}。`); return false; }
    }
    const now = new Date().toISOString(), localValue = clone(infoEditor.value), next = clone(current);
    if (informationSection === 'profile') { next.profile = {...cleanProfile(profile),revision:(current.profile.revision || 0)+1,savedAt:now}; }
    else { next.conditions = sanitizeConditions(localValue.conditions,account); next.conditions.formVersion = '5.6-simple'; if (current.conditions.formVersion !== '5.6-simple') next.conditions.legacyValues = Object.fromEntries(conditionFields.map(([key])=>key).filter(key=>typeof current.conditions.values[key] === 'string').map(key=>[key,current.conditions.values[key]])); next.conditions.revision = (current.conditions.revision || 0)+1; next.conditions.savedAt = now; }
    next.savedAt = now;
    if (!api().save(informationKey(account),next)) { api().toast('保存未完成，填写内容仍保留，请稍后重试。'); return false; }
    const local = {...next, ...(informationSection === 'profile' ? {conditions:localValue.conditions} : {profile:localValue.profile})};
    infoEditor = {accountId:account.id,value:local,base:JSON.stringify(next),dirty:JSON.stringify(local) !== JSON.stringify(next)}; renderInformation(false); announcePlans();
    if (!quiet) api().toast(informationSection === 'profile' ? '酒店资料已保存，确认发布后会出现在学生酒店详情。' : '实习信息已保存，新建部门计划会直接复用。');
    return true;
  }
  let pendingProfilePublication = null;
  function prepareProfilePublication() {
    if (!saveInformation(true)) return;
    const account = api().getHotelAccount(), profile = infoEditor.value.profile;
    if (!profile.intro && !profile.highlights && !profile.photos.length) return api().toast('请先补充酒店简介、亮点或照片，让同学对酒店有一个实际印象。');
    pendingProfilePublication = {accountId:account.id,base:infoEditor.base};
    api().modal(`<h2 id="modal-title">${e(account.hotelName)}</h2><p>${e(window.JiulvRegions?.formatCity?.(account.hotelCity) || account.hotelCity)}</p><div class="hotel-preview"><section><h3>认识这家酒店</h3><p>${e(profile.intro || '简介待补充')}</p><dl>${[['酒店亮点',profile.highlights]].filter(([,value])=>value).map(([key,value])=>`<div><dt>${key}</dt><dd>${e(value)}</dd></div>`).join('')}</dl>${profile.officialUrl ? `<a class="text-link" href="${e(profile.officialUrl)}" target="_blank" rel="noopener noreferrer">走进酒店官网 ↗</a>` : ''}</section><div class="hotel-preview-photos">${profile.photos.map(photo=>`<img src="${e(photo.dataUrl)}" alt="${e(photo.name)}">`).join('')}</div></div><p class="ft-muted">发布后，这些内容将出现在学生端该酒店的岗位详情。</p><button type="button" class="primary" data-information-action="confirm-publish">确认发布酒店展示页（本机演示）</button>`,'HOTEL PREVIEW / 酒店展示');
  }
  function publishProfile() {
    const account = api().getHotelAccount(); if (!account || pendingProfilePublication?.accountId !== account.id) return;
    const current = savedInformation(account);
    if (JSON.stringify(current) !== pendingProfilePublication.base) return api().toast('酒店资料已经变化，请重新预览后发布。');
    const next = {...current,publishedProfile:{...cleanProfile(current.profile),publishedAt:new Date().toISOString()}};
    if (!api().save(informationKey(account),next)) return;
    const local = {...next,conditions:infoEditor.value.conditions};
    infoEditor = {accountId:account.id,value:local,base:JSON.stringify(next),dirty:JSON.stringify(local) !== JSON.stringify(next)}; pendingProfilePublication = null;
    document.querySelector?.('#modal')?.close?.(); renderInformation(false); announcePlans(); api().toast('酒店展示页已发布，可在学生端的酒店详情中查看。');
  }
  document.addEventListener('input', event => {
    if (event.target.closest('#hotel-questionnaire-form') && event.target.type !== 'file' && capture()) { editor.dirty = true; status(); }
    if (event.target.closest('#hotel-information-form') && event.target.type !== 'file' && captureInformation()) { infoEditor.dirty = true; const node = document.querySelector?.('.hotel-information-status'); if (node) node.textContent = '有尚未保存的修改。'; }
  });
  document.addEventListener('submit', event => {
    if (event.target.id === 'hotel-questionnaire-form') { event.preventDefault(); savePlan(); }
    if (event.target.id === 'hotel-information-form') { event.preventDefault(); saveInformation(); }
  });
  document.addEventListener('change', async event => {
    if (event.target.id === 'hotel-flow-plan') { selectedFlowPlan = event.target.value; window.JiulvFeatures.workflow?.renderEmbedded?.({planId:selectedFlowPlan,mountId:'recruitment-flow-root'}); return; }
    if (event.target.closest?.('#hotel-questionnaire-form') && event.target.type !== 'file' && capture()) { editor.dirty = true; status(); }
    if (event.target.closest?.('#hotel-information-form') && event.target.type !== 'file' && captureInformation()) infoEditor.dirty = true;
    const group = event.target.dataset.informationPhoto;
    if (group !== 'hotel' && !Object.hasOwn(photoLabels,group || '')) return;
    const form = byId('hotel-information-form'), account = api().getHotelAccount();
    if (!form?.isConnected || !account || !infoEditor || photoTask || form.dataset.accountId !== account.id || infoEditor.accountId !== account.id) return;
    const files = Array.from(event.target.files || []); if (!files.length) return;
    captureInformation();
    const list = group === 'hotel' ? infoEditor.value.profile.photos : infoEditor.value.conditions.photos[group], max = photoLimit(group);
    if (list.length + files.length > max) { event.target.value = ''; return api().toast(`最多上传 ${max} 张图片。`); }
    const task = {token:++photoToken,accountId:account.id,form}; photoTask = task;
    form.setAttribute('aria-busy','true'); form.querySelectorAll('[data-information-busy]').forEach(button=>button.disabled=true);
    const current = ()=>photoTask === task && photoToken === task.token && form.isConnected && byId('hotel-information-form') === form && api().getHotelAccount()?.id === task.accountId && infoEditor?.accountId === task.accountId;
    try {
      const added = [];
      for (const file of files) { const dataUrl = await api().readImage(file); if (!current()) return; if (!validImage(dataUrl)) throw new Error('请选择有效的 JPG、PNG 或 WebP 图片。'); added.push({name:file.name,dataUrl}); }
      if (!current()) return; list.push(...added); infoEditor.dirty = true; photoTask = null; renderInformation(false); api().toast('照片已加入，保存后即可保留。');
    } catch (error) { if (current()) { photoTask = null; renderInformation(false); api().toast(error.message || '读取图片失败，请重试。'); } }
    finally { if (photoTask === task) { photoTask = null; form.removeAttribute('aria-busy'); form.querySelectorAll('[data-information-busy]').forEach(button=>button.disabled=false); } }
  });
  document.addEventListener('click', event => {
    const infoButton = event.target.closest('[data-information-action]');
    if (infoButton) {
      const account = ensureAccount(); if (!account) return api().requireHotelAccount(render);
      const action = infoButton.dataset.informationAction;
      if (action === 'tab') showInformation(infoButton.dataset.tab);
      else if (action === 'publish') prepareProfilePublication();
      else if (action === 'confirm-publish') publishProfile();
      else if (action === 'create-plan') { if (saveInformation(true)) newPlan(); }
      else if (action === 'next-plan') { if (JSON.stringify(infoEditor?.value.conditions) !== JSON.stringify(savedInformation(account).conditions)) { api().toast('还有未保存的修改，请先保存实习信息。'); return; } newPlan(); }
      else if (action === 'remove-photo' && !guardPhoto() && captureInformation()) {
        const group = infoButton.dataset.group, index = Number(infoButton.dataset.index);
        const list = group === 'hotel' ? infoEditor.value.profile.photos : infoEditor.value.conditions.photos[group];
        if (!Array.isArray(list) || !Number.isInteger(index) || index < 0 || index >= list.length) return;
        list.splice(index,1); infoEditor.dirty = true; renderInformation(false);
      }
      return;
    }
    const button = event.target.closest('[data-hotel-action]'); if (!button) return;
    const action = button.dataset.hotelAction, id = button.dataset.id;
    if (action === 'register') return api().requireHotelAccount(render);
    if (!ensureAccount()) return api().requireHotelAccount(render);
    if (action === 'new-plan') newPlan(); else if (action === 'edit-plan') openPlan(id); else if (action === 'copy-plan') copyPlan(id); else if (action === 'list-plans') showPlans(); else if (action === 'copy-current') copyPlan();
    else if (action === 'flow-plan') openPlanFlow(id);
    else if (action === 'information') showInformation('conditions');
    else if (action === 'preview-plan') previewPlan(id); else if (action === 'preview-current') previewPlan();
    else if (action === 'publish-current') { if (savePlan(true)) preparePublish(editor.plan.id); }
    else if (action === 'prepare-publish') preparePublish(id); else if (action === 'confirm-publish') publishPlan(id);
    else if (action === 'pause-plan') changePublication(id, 'paused'); else if (action === 'resume-plan') changePublication(id, 'published'); else if (action === 'close-plan') changePublication(id, 'closed');
    else if (action === 'export-plan') { const plan = pendingPublication?.id === id && pendingPublication.accountId === api().getHotelAccount().id ? pendingPublication.plan : drafts.get(id)?.dirty ? drafts.get(id).plan : records.find(row => row.id === id); if (plan) api().download('酒旅之星-招聘计划.json', JSON.stringify(exportPlan(plan), null, 2), 'application/json'); }

  });
  document.addEventListener('jiulv:accountchange', () => {
    const account = api().getHotelAccount(), root = byId('hotel-view'), plansRoot = byId('workflow-view');
    if (account && account.id === loadedAccountId) { capture(); drafts.forEach(value => Object.keys(baseLabels).forEach(key => value.plan.conditions.values[key] = account[key] || '')); if (root && !root.hidden && !photoTask) render(); if (plansRoot && !plansRoot.hidden && !photoTask) renderPlans(); return; }
    invalidatePhotos(); loadedAccountId = null; records = []; editor = null; infoEditor = null; selectedFlowPlan = ''; drafts.clear(); mode = 'list'; canonicalSeen = false; pendingPublication = null; if (root && !root.hidden) render(); if (plansRoot && !plansRoot.hidden) renderPlans();
  });
  function getSavedDraft() { const account = api().getHotelAccount(); return account ? sanitizeConditions(savedInformation(account).conditions, account) : null; }
  window.JiulvFeatures = window.JiulvFeatures || {};
  window.JiulvFeatures.hotel = { render, renderPlans, showInformation, openPlanFlow, selectPlan: openPlanFlow, plans: () => ensureAccount() ? clone(records) : [], openPlan, newPlan, copyPlan, showPlans, getDraft: getSavedDraft, getPublishedJobs: () => catalog()?.getPublishedJobs() || [], getPlanSnapshot: (id, accountId) => catalog()?.getPlanSnapshot(id, accountId) || null, getInvitePlans: () => catalog()?.getInvitePlans() || [] };
  window.addEventListener?.('storage', event => { if (event.key === `jiulv:v2:hotel:plans:${loadedAccountId}`) { if (byId('workflow-view')?.hidden === false && !photoTask) renderPlans(); announcePlans(); } });
})();
