(function () {
  'use strict';
  const api = window.JiulvDemo, core = window.JiulvMatch, e = value => api.e(String(value ?? ''));
  const SNAPSHOT = '2026-09-26', LEGACY_SCOPE = 'employer:demo-hotel:', LEGACY_OWNER = 'employer:legacy-owner:v54';
  const roles = window.JiulvCore?.DEPARTMENTS || ['前厅', '餐饮', '厨房', '客房', '市场销售', '人力资源', '财务', '预订', '康体', '工程', '安保', '其他'], cities = ['上海', '杭州', '苏州', '嘉兴', '广州'];
  const candidates = [
    { id: 'c01', conversionIntent: 'open', internshipExperience: 'yes', internshipExperienceNote: '曾有2个月前厅实习经历，主要协助接待与宾客咨询。', alias: '候选人 A01', cities: ['上海'], roles: ['前厅'], startDate: '2026-10-01', endDate: '2027-03-31', englishLevel: 2, minStipend: 2800, lastActive: '2026-09-26', intentConfirmed: '2026-09-25', skills: ['宾客接待课程', '基础办公软件'], summary: '希望从前台接待开始，学习完整的宾客服务流程。', preferences: '关注宿舍人数、夜班班车与带教安排。' },
    { id: 'c02', conversionIntent: 'internship-only', internshipExperience: 'no', internshipExperienceNote: '目前为首次实习，餐饮经历来自课程实训。', alias: '候选人 A02', cities: ['上海', '苏州'], roles: ['餐饮', '前厅'], startDate: '2026-10-01', endDate: '2027-02-28', englishLevel: 1, minStipend: 3000, lastActive: '2026-09-24', intentConfirmed: '2026-09-22', skills: ['餐厅服务实训', '宴会准备'], summary: '偏好餐饮服务，返校时间已明确。', preferences: '希望先确认基础津贴与休息日供餐。' },
    { id: 'c03', conversionIntent: 'open', internshipExperience: 'yes', internshipExperienceNote: '曾有3个月餐饮服务实习经历，愿意了解跨部门学习机会。', alias: '候选人 A03', cities: ['上海', '杭州'], roles: ['前厅', '餐饮'], startDate: '2026-09-28', endDate: '2027-06-30', englishLevel: 3, minStipend: 2800, lastActive: '2026-09-25', intentConfirmed: '2026-09-25', skills: ['英语工作交流', '服务情景实训'], summary: '可配合较长实习周期，重视部门培训与复盘。', preferences: '轮岗可申请即可，希望有明确考核条件。' },
    { id: 'c04', conversionIntent: 'unknown', internshipExperience: 'unknown', internshipExperienceNote: '实习经历尚未补充。', alias: '候选人 A04', cities: ['上海'], roles: ['前厅'], startDate: '', endDate: '', englishLevel: null, minStipend: null, lastActive: '2026-09-23', intentConfirmed: '', skills: ['酒店运营课程'], summary: '正在与学校确认实习起止时间。', preferences: '时间与津贴意向仍需本人补充确认。' },
    { id: 'c05', conversionIntent: 'open', internshipExperience: 'yes', internshipExperienceNote: '曾有2个月客房实习经历，具体职责可在沟通时确认。', alias: '候选人 A05', cities: ['广州'], roles: ['前厅', '客房'], startDate: '2026-10-01', endDate: '2027-06-30', englishLevel: 2, minStipend: 2600, lastActive: '2026-09-20', intentConfirmed: '2026-09-19', skills: ['房务实训', '宾客沟通'], summary: '目前仅考虑广州的实习机会。', preferences: '希望住宿与酒店位于步行通勤范围。' },
    { id: 'c06', conversionIntent: 'unknown', internshipExperience: 'no', internshipExperienceNote: '目前为首次实习，厨房技能来自课程训练。', alias: '候选人 A06', cities: ['上海', '苏州'], roles: ['厨房'], startDate: '2026-10-15', endDate: '2027-04-30', englishLevel: 1, minStipend: 2800, lastActive: '2026-09-25', intentConfirmed: '2026-09-24', skills: ['基础西餐制作', '食品安全课程'], summary: '希望在厨房积累基础操作经验。', preferences: '关注每日工时、加班安排与员工餐。' },
    { id: 'c07', conversionIntent: 'internship-only', internshipExperience: 'unknown', internshipExperienceNote: '实习经历尚待本人确认。', alias: '候选人 A07', cities: ['上海'], roles: ['前厅'], startDate: '2027-01-01', endDate: '2027-06-30', englishLevel: 2, minStipend: 3000, lastActive: '2026-09-10', intentConfirmed: '2026-08-28', skills: ['前厅情景训练', '办公软件'], summary: '计划参加下一学期实习，需重新确认意向。', preferences: '关注学校三方协议与实习考核配合。' },
    { id: 'c08', conversionIntent: 'open', internshipExperience: 'no', internshipExperienceNote: '目前为首次实习，中西餐服务为校内实训经历。', alias: '候选人 A08', cities: ['上海', '嘉兴'], roles: ['餐饮'], startDate: '2026-10-01', endDate: '2027-06-30', englishLevel: 2, minStipend: 2700, lastActive: '2026-09-26', intentConfirmed: '2026-09-26', skills: ['中西餐服务', '宴会实训'], summary: '偏好餐厅或宴会服务，愿意了解多个酒店。', preferences: '看重4人以内宿舍与休息日餐食安排。' }
  ].map((candidate, index) => ({ ...candidate, discoverable: true, discoveryConsent: 'demo-authorized', fictional: true,
    startMonth:candidate.startDate.slice(0,7),endMonth:candidate.endDate.slice(0,7),
    resumeSnapshot:{name:candidate.alias,school:'星湾旅游职业学院（虚构）',major:'酒店管理与数字化运营',degree:'大专',enrollment:'2024-09',graduation:'2027-06',educationSummary:'示例课程：前厅服务、酒店运营、餐饮服务与礼仪。',objective:candidate.summary,experience:candidate.internshipExperienceNote,experienceLevel:candidate.internshipExperience==='yes'?'有实习经历':candidate.internshipExperience==='no'?'暂无相关经历':'',clubs:'2025年，校园迎新志愿者（虚构）：参与来宾指引、物资准备与现场协作。',languages:candidate.englishLevel===3?'英语熟练交流':candidate.englishLevel===2?'英语日常交流':candidate.englishLevel===1?'英语基础交流':'',skills:candidate.skills.join('、'),intentionCities:candidate.cities.join('、'),intentionRoles:candidate.roles.join('、'),startMonth:candidate.startDate.slice(0,7),endMonth:candidate.endDate.slice(0,7),startDate:candidate.startDate,endDate:candidate.endDate,height:index===3?'':String(165+index),weight:index===3?'':String(52+index),conversionIntent:candidate.conversionIntent==='open'?'可衔接转正':candidate.conversionIntent==='internship-only'?'仅实习':''}
  }));
  const defaultBatches = [
    { id: 'batch1', name: '秋季前厅补充', role: '前厅', startDate: '2026-10-01', endDate: '2027-03-31', demand: 8, confirmed: 5, arrived: 0, note: '虚构计划：优先补齐可连续实习6个月的人选。' },
    { id: 'batch2', name: '餐饮旺季储备', role: '餐饮', startDate: '2026-10-15', endDate: '2027-04-14', demand: 12, confirmed: 7, arrived: 0, note: '虚构计划：先完成宿舍及供餐条件确认。' },
    { id: 'batch3', name: '春季前厅实习', role: '前厅', startDate: '2027-01-10', endDate: '2027-07-09', demand: 10, confirmed: 3, arrived: 0, note: '虚构计划：与学校核对返校时间。' }
  ];
  const stages = ['意向待确认', '条件待补全', '面试推进', '到岗准备'];
  const promises = [['stipend', '津贴与发薪'], ['dorm', '住宿与通勤'], ['meals', '供餐与收费'], ['rotation', '岗位与轮岗']];
  const defaultFollowups = [
    { id: 'follow1', candidateId: 'c01', stage: '到岗准备', nextDate: '2026-09-28', note: '演示记录：宿舍照片已准备，夜班班车时刻仍需确认。', commitment: { stipend: true, dorm: false, meals: true, rotation: true } },
    { id: 'follow2', candidateId: 'c02', stage: '条件待补全', nextDate: '2026-09-27', note: '演示记录：核对5个月实习周期能否满足本批次要求。', commitment: { stipend: false, dorm: true, meals: false, rotation: true } },
    { id: 'follow3', candidateId: 'c03', stage: '意向待确认', nextDate: '2026-09-29', note: '演示记录：准备意向确认问题，尚未发送。', commitment: { stipend: true, dorm: false, meals: false, rotation: false } },
    { id: 'follow4', candidateId: 'c08', stage: '面试推进', nextDate: '2026-09-28', note: '演示记录：拟确认到岗日期和面试方便时段。', commitment: { stipend: true, dorm: true, meals: true, rotation: false } }
  ];
  const defaultJob = { city: '上海', role: '前厅', startDate: '2026-10-01', endDate: '2027-03-31', minMonths: '6', minEnglish: '2', stipend: '3000' };
  let workspace = 'talent', recruitmentTab = 'home', filters = {}, talentSource = 'auto', activeTalentRegion = '31';
  // Registration establishes non-contact resume visibility for hotel accounts.
  // Contacts remain a separate per-application grant; private files are never read here.
  function localCandidates() {
    if (!api.getHotelAccount?.()) return [];
    const students = api.getAccounts?.()?.students || [], seen = new Set(), C = window.JiulvOutreachCore;
    const list = value => (Array.isArray(value) ? value : String(value || '').split(/[,，、;；\n]+/)).map(value=>String(value).trim()).filter(Boolean);
    return students.filter(student => student && typeof student.id === 'string' && student.id && student.demoVerified === true && [student.name,student.school,student.major].every(value => typeof value === 'string' && value.trim()) && !seen.has(student.id) && seen.add(student.id)).map(student => {
      const stored = api.read(`resumeDraft:${student.id}`, {});
      const draft = stored && typeof stored === 'object' && !Array.isArray(stored) && (!stored.accountId || stored.accountId === student.id) ? stored : {};
      const snapshot = window.JiulvFeatures.resume?.getHotelSnapshot?.(student.id) || C?.sanitizeSnapshot({...draft,name:student.name,school:student.school,major:student.major}) || {};
      const date = value => core.dateValid(value) ? value : '';
      const rawRoles = list(snapshot.intentionRoles);
      const declaredRoles = rawRoles.flatMap(value=>/^(市场)?销售(部)?$/.test(value)?'市场销售':roles.find(role=>value.includes(role)) || value);
      return {
        id: `student:${student.id}`, studentId: student.id, fictional: false, discoverable: true, discoveryConsent: 'demo-authorized',
        alias: snapshot.name || '实习同学', cities: list(snapshot.intentionCities).map(value=>window.JiulvRegions?.normalizeCity(value)||value), roles: declaredRoles,
        startDate: date(snapshot.startDate), endDate: date(snapshot.endDate), ...core.candidateMonths(snapshot),
        englishLevel: [1,2,3].includes(Number(draft.englishLevel)) ? Number(draft.englishLevel) : null, minStipend: null,
        conversionIntent: snapshot.conversionIntent === '可衔接转正' ? 'open' : snapshot.conversionIntent === '仅实习' ? 'internship-only' : 'unknown',
        internshipExperience: snapshot.experienceLevel === '有实习经历' ? 'yes' : snapshot.experienceLevel === '暂无相关经历' ? 'no' : 'unknown',
        experienceLevel: snapshot.experienceLevel || '',
        internshipExperienceNote: snapshot.experience || '', skills: list(snapshot.skills),
        summary: [snapshot.school, snapshot.major, snapshot.objective].filter(Boolean).join(' · ') || '学生正在准备第一份简历。',
        preferences: snapshot.languages || '', resumePrepared: Boolean(draft.savedAt), resumeSnapshot: snapshot,
        lastActive: date(String(draft.savedAt || '').slice(0,10)),
        intentConfirmed: date(String(draft.intentConfirmedAt || '').slice(0,10))
      };
    });
  }
  const candidatePool = () => [...localCandidates(), ...candidates];
  const validCandidate = id => candidatePool().find(candidate => candidate.id === id && core.discoverable(candidate));
  const sourceName = () => (talentSource === 'auto' ? localCandidates().length > 0 : talentSource === 'local') ? 'local' : 'sample';
  const sourceCandidates = () => sourceName() === 'local' ? localCandidates() : candidates;
  const filterDate = candidate => candidate?.fictional ? SNAPSHOT : new Date().toISOString().slice(0, 10);
  const hotelId = () => { const id = api.getHotelAccount?.()?.id; return typeof id === 'string' && id ? id : null; };
  const hotelScope = id => `employer:hotel:${encodeURIComponent(id)}:`;
  const storedKeys = ['shortlist', 'batches', 'followups', 'invites', 'job'];
  let loadedHotelId = null;
  let shortlist = [], batches = [], followups = [], invites = [], job = { ...defaultJob };
  function migrateLegacy(id) {
    const legacy = Object.fromEntries(storedKeys.map(key => [key, api.read(LEGACY_SCOPE + key, null)]));
    if (!Object.values(legacy).some(value => value !== null)) return;
    let owner = api.read(LEGACY_OWNER, null);
    // Reserve ownership before any copy; partial saves can retry only for this account.
    if (owner === null) { if (!api.save(LEGACY_OWNER, id)) return; owner = id; }
    if (owner !== id) return;
    for (const [key, value] of Object.entries(legacy)) {
      if (value !== null && api.read(hotelScope(id) + key, null) === null) api.save(hotelScope(id) + key, value);
    }
  }
  function syncHotelState(refresh = false) {
    const id = hotelId(), accountChanged = id !== loadedHotelId;
    if (!accountChanged && !refresh) return Boolean(id);
    if (accountChanged) { if (loadedHotelId) closeModal(); filters = {}; recruitmentTab = 'home'; talentSource = 'auto'; }
    loadedHotelId = id;
    shortlist = []; batches = []; followups = []; invites = []; job = { ...defaultJob };
    if (!id) return false;
    migrateLegacy(id);
    const stored = (key, fallback) => api.read(hotelScope(id) + key, fallback);
    const savedList = stored('shortlist', []);
    shortlist = Array.isArray(savedList) ? savedList.filter(value => validCandidate(value)) : [];
    batches = stored('batches', defaultBatches);
    if (!Array.isArray(batches)) batches = defaultBatches;
    batches = batches.filter(item => item && typeof item === 'object' && typeof item.id === 'string');
    followups = stored('followups', defaultFollowups);
    if (!Array.isArray(followups)) followups = defaultFollowups;
    followups = followups.filter(item => item && validCandidate(item.candidateId) && stages.includes(item.stage));
    invites = stored('invites', []);
    if (!Array.isArray(invites)) invites = [];
    invites = invites.filter(item => item && validCandidate(item.candidateId) && typeof item.text === 'string');
    const storedJob = stored('job', defaultJob);
    if (storedJob && typeof storedJob === 'object' && !Array.isArray(storedJob)) job = { ...defaultJob, ...Object.fromEntries(Object.keys(defaultJob).map(key => [key, String(storedJob[key] ?? defaultJob[key])])) };
    return true;
  }
  const put = (key, value) => Boolean(loadedHotelId && hotelId() === loadedHotelId && api.save(hotelScope(loadedHotelId) + key, value));
  const options = (items, selected, placeholder = '全部') => `<option value="">${e(placeholder)}</option>${items.map(item => `<option value="${e(item)}" ${item === selected ? 'selected' : ''}>${e(item)}</option>`).join('')}`;
  const english = level => level === null || level === undefined ? '英语待确认' : ['', '基础交流', '日常工作交流', '熟练工作交流'][level] || '英语待确认';
  const signalLabels = {
    conversionIntent: { open: '可衔接转正 · 有意向', 'internship-only': '目前仅考虑实习', unknown: '转正意向待确认' },
    internshipExperience: { yes: '有实习经历', 'part-time': '有兼职经历', no: '暂无实习经历', unknown: '经历待补充' }
  };
  const experienceSignal = candidate => candidate.experienceLevel === '有兼职经历' ? 'part-time' : core.candidateSignals(candidate).internshipExperience;
  function candidateTags(candidate) {
    const signals = { ...core.candidateSignals(candidate), internshipExperience: experienceSignal(candidate) };
    const explicit = candidate.resumeSnapshot || {}, measurements = [['height','身高','cm'],['weight','体重','kg']].filter(([key])=>/^\d+(\.\d+)?$/.test(String(explicit[key]||''))&&Number(explicit[key])>0).map(([key,label,unit])=>`<span class="employer-signal employer-signal-neutral">${label} ${e(explicit[key])} ${unit}</span>`).join('');
    return `<div class="employer-candidate-signals" aria-label="候选人意向与经历">${explicit.degree?`<span class="employer-signal employer-signal-neutral">${e(explicit.degree)}</span>`:''}${measurements}${Object.entries(signals).filter(([,value])=>value!=='unknown').map(([key, value]) => `<span class="employer-signal employer-signal-${value === 'unknown' ? 'unknown' : value === 'open' || value === 'yes' || value === 'part-time' ? 'positive' : 'neutral'}">${e(key === 'internshipExperience' && candidate.experienceLevel === '暂无相关经历' ? '暂无相关经历' : signalLabels[key][value])}</span>`).join('')}</div>`;
  }
  const countPromises = item => promises.filter(([key]) => item.commitment?.[key] === true).length;
  const monthLabel = month => core.monthValid(month) ? month.replace('-', '年')+'月' : '待确认';
  const cityLabel = value => window.JiulvRegions?.formatCity?.(value) || window.JiulvRegions?.normalizeCity(value) || value;
  function recentLabel(date, candidate) { const days = core.daysSince(date, filterDate(candidate)); return days === null ? '尚未记录' : days === 0 ? candidate?.fictional ? '快照当日' : '今天' : `${days}天前`; }
  function render() {
    if (!syncHotelState()) return;
    if (workspace === 'recruitment') return renderRecruitment();
    if (workspace === 'planning') return window.JiulvFeatures.hotel?.renderPlans?.();
    if (workspace === 'followup') return window.JiulvFeatures.workflow?.render();
    const root = document.querySelector('#employer-view'); if (!root) return;
    root.innerHTML = `<div class="employer-shell employer-discovery"><header class="employer-header employer-welcome"><div class="employer-welcome-copy"><p class="employer-welcome-slogan">下一位伙伴，<br>值得认真相遇<span class="employer-motto-star" aria-hidden="true">✧</span></p><h1>实习机会</h1><p class="employer-welcome-description">让同学先认识酒店，了解实习生活。<br>通用条件填写一次，各部门招聘都能用。</p><div class="employer-welcome-benefits"><span>酒店展示</span><span>条件共用</span><span>沟通更省心</span></div><button class="employer-btn employer-btn-light employer-welcome-cta" data-employer-action="edit-information">实习机会 <span aria-hidden="true">↗</span></button></div><div class="employer-welcome-art" aria-hidden="true"><span class="employer-welcome-star">✧</span><div class="employer-condition-sheet"><small>OUR NEXT CHAPTER</small><strong>让实习生活看得见</strong><span class="employer-sheet-rule"></span><div><b>酒店与环境</b><i></i><i></i></div><div><b>津贴与福利</b><i></i><i></i></div><div><b>住宿与通勤</b><i></i><i></i></div><span class="employer-sheet-stamp">让期待，有迹可循</span></div></div></header><section class="employer-discovery-content" aria-label="发现实习人才"><div class="section-heading"><div><span class="overline">FIND YOUR NEXT TEAMMATE</span><h2>发现合适的实习生</h2></div><span class="sample-label">${sourceName() === 'local' ? '本机学生简历' : '虚构人才样例'}</span></div>${talentPanel()}</section></div>`;
  }
  function renderTalent() { workspace = 'talent'; render(); }
  function openForPlan(plan) {
    if (!syncHotelState()) return false;
    const snap=plan?.conditionSnapshot || plan || {};
    filters=discoveryFilters({city:plan?.city?[plan.city]:[],role:plan?.departments || (snap.department?[snap.department]:[]),startMonth:snap.startMonth || (core.dateValid(snap.startDate)?snap.startDate.slice(0,7):'')});
    workspace='talent';api.showView('employer');return true;
  }
  function renderRecruitment() {
    if (!syncHotelState()) return;
    workspace = 'recruitment';
    const root = document.querySelector('#recruitment-view'); if (!root) return;
    const currentHotelName = api.getHotelAccount?.()?.hotelName;
    const tools = `<section class="employer-recruitment-tools" aria-labelledby="recruitment-tools-title"><h2 id="recruitment-tools-title">招聘工具</h2><div>${[['employer', '人才发现', 'search', '找到合适的同学'], ['hotel', '实习机会', 'hotels', '展示酒店，共用实习条件'], ['workflow', '招聘计划', 'applications', '按部门招聘，跟进候选人']].map(([view, title, icon, description]) => `<button class="employer-recruitment-tool" data-view="${view}"><span class="employer-tool-icon" aria-hidden="true">${window.JiulvIcons?.svg(icon) || '↗'}</span><strong>${title}</strong><small>${description}</small><span class="employer-tool-arrow" aria-hidden="true">↗</span></button>`).join('')}</div></section>`;
    const cards = `${tools}<div class="employer-recruitment-cards" aria-label="我的招聘功能"><button class="employer-visitor-entry" data-view="visitors"><span class="employer-visitor-symbol" aria-hidden="true">${window.JiulvIcons?.svg('students') || '↗'}</span><span><strong>谁看过我</strong><small>了解实习生对酒店的关注</small></span><b aria-hidden="true">↗</b></button><button class="employer-visitor-entry" data-employer-action="recruitment-tab" data-tab="saved"><span class="employer-visitor-symbol" aria-hidden="true">${window.JiulvIcons?.svg('star') || '☆'}</span><span><strong>我收藏的人才</strong><small>${shortlist.length} 位已收藏 · 留下值得继续了解的同学</small></span><b aria-hidden="true">↗</b></button><button class="employer-visitor-entry" data-employer-action="recruitment-tab" data-tab="analytics"><span class="employer-visitor-symbol" aria-hidden="true">${window.JiulvIcons?.svg('overview') || '↗'}</span><span><strong>招聘数据</strong><small>看岗位关注与沟通变化，为下次招聘做准备</small></span><b aria-hidden="true">↗</b></button></div>`;
    const content = recruitmentTab === 'saved' ? savedPanel() : recruitmentTab === 'analytics' ? (window.JiulvGrowth?.analyticsHTML() || '<p class="employer-empty">统计模块正在准备，请稍后重试。</p>') : cards;
    root.innerHTML = `<div class="employer-shell employer-recruitment"><header class="employer-recruitment-header"><div><span class="employer-eyebrow">YOUR RECRUITMENT, IN ONE PLACE</span><h1>我的招聘</h1><p>${currentHotelName ? e(currentHotelName) : '酒店招聘管理'} · 从安排招聘，到了解每一份关注。</p></div></header>${recruitmentTab !== 'home' ? '<button class="employer-link employer-recruitment-back" data-employer-action="recruitment-tab" data-tab="home">← 返回我的招聘</button>' : ''}<div class="employer-content">${content}</div><aside class="employer-recruitment-materials"><div><strong>材料知识库</strong><p>实习协议、材料清单和参考文件，按需查阅。</p></div><button class="employer-link" data-view="library">打开材料知识库 ↗</button></aside><p class="employer-recruitment-note">收藏为本机记录；统计中的虚构样例与本机操作分开呈现。</p></div>`;
  }
  function legacyPlanRows() { if (!syncHotelState()) return []; return JSON.parse(JSON.stringify(batches)); }
  function planRows() { return window.JiulvFeatures.hotel?.plans?.() || legacyPlanRows(); }
  function recruitmentTasks() {
    if (!syncHotelState(true)) return { followups: [], drafts: [] };
    const withCandidate = record => ({ ...record, candidateAlias: validCandidate(record.candidateId)?.alias || '候选人待确认', candidateRoles: validCandidate(record.candidateId)?.roles || [], fictional: true });
    return JSON.parse(JSON.stringify({ followups: followups.map(withCandidate), drafts: invites.map(withCandidate) }));
  }
  function followOptions() { return { stages: [...stages], promises: promises.map(item => [...item]) }; }
  function openRecruitmentTask(kind, id = '', planId = '') {
    if (!syncHotelState(true)) return false;
    if (kind === 'followup' && (!id || followups.some(item => item.id === id))) { workspace = 'followup'; followForm(id,planId); return true; }
    const draft = kind === 'draft' && invites.find(item => item.id === id);
    if (draft) { workspace = 'followup'; inviteForm(draft.candidateId); return true; }
    return false;
  }
  function savedPanel() {
    const saved = shortlist.map(validCandidate).filter(Boolean);
    return `<div class="employer-section-top"><div><h2>把值得继续了解的同学，留在这里</h2><p>收藏仅为酒店自己的记录，不会向学生发出邀请，也不代表对方已接受意向。</p></div><button class="employer-link" data-view="employer">继续发现人才 ↗</button></div><div class="employer-candidate-grid">${saved.length ? saved.map(candidate => candidateCard(candidate)).join('') : '<div class="employer-empty employer-saved-empty"><h3>还没有收藏的人才</h3><p>在人才发现中点亮候选人卡片上的星星，再回到这里比较实习时间与意向。</p><button class="employer-btn employer-btn-primary" data-view="employer">去发现合适的实习生 ↗</button></div>'}</div>`;
  }
  function openCandidateDraft(candidateId) {
    if (!syncHotelState(true) || validCandidate(candidateId)?.fictional !== true) return false;
    if (document.querySelector('#workflow-view')?.hidden === false) workspace = 'followup';
    inviteForm(candidateId); return true;
  }
  function candidateActions(candidate) {
    const saved = shortlist.includes(candidate.id);
    return `<div class="employer-candidate-quick-actions" aria-label="候选人操作"><button type="button" class="employer-candidate-icon employer-save ${saved ? 'employer-saved' : ''}" data-employer-action="save-candidate" data-id="${e(candidate.id)}" aria-pressed="${saved}" aria-label="${saved ? '取消收藏' : '收藏'}${e(candidate.alias)}">${window.JiulvIcons?.svg('star') || '<span aria-hidden="true">☆</span>'}<small>${saved ? '已收藏' : '收藏'}</small></button><button type="button" class="employer-candidate-icon employer-invite" data-employer-action="invite" data-id="${e(candidate.id)}" aria-label="${candidate.fictional ? '为' + e(candidate.alias) + '创建未发送邀请草稿' : '邀请' + e(candidate.alias) + '沟通实习意向'}">${window.JiulvIcons?.svg('invite') || '<span aria-hidden="true">✉</span>'}<small>邀请</small></button></div>`;
  }
  function candidateCard(candidate, compact = false) {
    const months = core.candidateMonths(candidate);
    return `<article class="employer-candidate ${compact ? 'employer-candidate-compact' : ''}"><div class="employer-candidate-head"><span class="employer-avatar">${e(candidate.fictional ? candidate.alias.slice(-3) : '同学')}</span><div><h3>${e(candidate.alias)}</h3><p>${e(candidate.roles.join(' · ') || '岗位待确认')} <span>/</span> ${e(candidate.cities.map(cityLabel).join('、') || '城市待确认')}</p></div>${candidateActions(candidate)}</div><div class="employer-tags"><span>${candidate.fictional ? '虚构 · 匿名样例' : '本机注册 · 联系方式隐藏'}</span><span>${candidate.fictional ? '虚构资料' : candidate.resumePrepared ? '简历已准备' : '简历待完善'}</span>${candidate.fictional ? `<span>${e(english(candidate.englishLevel))}</span>` : ''}</div>${candidateTags(candidate)}<div class="employer-window"><span>可实习窗口</span><strong>${e(monthLabel(months.startMonth))} <i>→</i> ${e(monthLabel(months.endMonth))}</strong></div><p class="employer-summary">${e(candidate.summary)}</p><div class="employer-freshness"><span>${candidate.fictional ? '最近活动' : '简历更新'} <b>${e(recentLabel(candidate.lastActive, candidate))}</b></span></div><div class="employer-card-actions"><button class="employer-btn employer-btn-outline" data-employer-action="candidate" data-id="${e(candidate.id)}">查看完整简历</button></div></article>`;
  }
  const selectedValues = key => Array.isArray(filters[key]) ? filters[key] : filters[key] ? [String(filters[key])] : [];
  const discoveryFilters = source => ({city:Array.isArray(source.city)?source.city:source.city?[source.city]:[],role:Array.isArray(source.role)?source.role:source.role?[source.role]:[],startMonth:String(source.startMonth||'')});
  const talentRegions = () => window.JiulvRegions?.regions || [];
  function cityMenu() {
    const regions=talentRegions(),current=regions.find(region=>region.id===activeTalentRegion)||regions[0],chosen=selectedValues('city');
    if(!current)return '<p>城市目录暂未加载，请刷新页面。</p>';
    activeTalentRegion=current.id;
    return `<div class="job-filter-menu city-filter-menu employer-city-menu"><div class="city-picker"><nav class="city-provinces" aria-label="选择省级地区">${regions.map(region=>{const count=region.cities.filter(city=>chosen.includes(city.label)).length;return `<button type="button" data-employer-action="city-region" data-region="${e(region.id)}" aria-current="${region.id===current.id}"><span>${e(region.label)}</span><b>${count||''}</b></button>`;}).join('')}</nav><div class="city-options"><p class="city-region-heading">${e(current.name)}</p>${current.cities.length>1?`<label class="city-select-all"><input type="checkbox" data-employer-region-all="${e(current.id)}" ${current.cities.every(city=>chosen.includes(city.label))?'checked':''}><span>全选${e(current.label)}</span></label>`:''}<div class="city-options-grid">${current.cities.map(city=>`<label><input type="checkbox" name="city" data-employer-filter="city" value="${e(city.label)}" ${chosen.includes(city.label)?'checked':''}><span>${e(city.label)}</span></label>`).join('')}</div></div></div><footer class="filter-menu-actions"><button type="button" data-employer-action="clear-cities">清空城市</button><button type="button" data-employer-action="finish-filter">完成选择 ✓</button></footer></div>`;
  }
  function talentFilterChips() {
    const regions=talentRegions(),selected=selectedValues('city'),whole=regions.filter(region=>region.cities.length>1&&region.cities.every(city=>selected.includes(city.label))),covered=new Set(whole.flatMap(region=>region.cities.map(city=>city.label)));
    const items=[...whole.map(region=>({key:'city',value:'region:'+region.id,label:region.label+'全域'})),...selected.filter(value=>!covered.has(value)).map(value=>({key:'city',value,label:cityLabel(value)})),...selectedValues('role').map(value=>({key:'role',value,label:value})),...(filters.startMonth?[{key:'startMonth',value:filters.startMonth,label:monthLabel(filters.startMonth)+'可到岗'}]:[])];
    return items.length?`<div class="selected-job-filters employer-selected-filters" aria-label="已选人才条件">${items.map(item=>`<button type="button" data-employer-action="remove-filter" data-filter="${item.key}" data-value="${e(item.value)}">${e(item.label)} <span aria-hidden="true">×</span></button>`).join('')}</div>`:'';
  }
  function talentPanel() {
    const source=sourceName(),pool=sourceCandidates();filters=discoveryFilters(filters);
    const visible=core.filterDiscoveryCandidates(pool,filters),chosenCities=selectedValues('city'),chosenRoles=selectedValues('role');
    const sourceSwitch=`<div class="employer-talent-sources" role="group" aria-label="演示数据来源"><button type="button" data-employer-action="talent-source" data-source="local" aria-pressed="${source==='local'}">本机学生简历 <span>${localCandidates().length}</span></button><button type="button" data-employer-action="talent-source" data-source="sample" aria-pressed="${source==='sample'}">虚构样例 <span>${candidates.length}</span></button></div>`;
    return `${sourceSwitch}<form id="employer-filter-form" class="employer-talent-form"><div class="employer-simple-filters" aria-label="人才筛选"><details class="job-filter" data-employer-panel="city"><summary><span>意向城市</span><b>${chosenCities.length?'已选 '+chosenCities.length+' 城':'不限'}</b><i aria-hidden="true">⌄</i></summary>${cityMenu()}</details><details class="job-filter" data-employer-panel="role"><summary><span>意向岗位</span><b>${chosenRoles.length?'已选 '+chosenRoles.length+' 项':'不限'}</b><i aria-hidden="true">⌄</i></summary><div class="job-filter-menu"><div>${roles.map(value=>`<label><input type="checkbox" name="role" data-employer-filter="role" value="${e(value)}" ${chosenRoles.includes(value)?'checked':''}><span>${e(value)}</span></label>`).join('')}</div><footer class="filter-menu-actions"><button type="button" data-employer-action="finish-filter">完成选择 ✓</button></footer></div></details><label class="employer-month-filter"><span>实习可开始时间</span><input type="month" name="startMonth" data-employer-month value="${e(filters.startMonth)}" aria-label="实习可开始时间（年月）"></label></div>${talentFilterChips()}</form><div class="results-toolbar"><p><strong>${visible.length}</strong> 位符合筛选 <span>· ${source==='local'?'本机学生简历':'虚构样例'}</span></p><button class="employer-link" data-employer-action="reset-filters">清空筛选</button></div><div class="employer-candidate-grid">${visible.length?visible.map(candidate=>candidateCard(candidate)).join(''):'<div class="employer-empty"><h3>暂时没有符合这些条件的人才</h3><p>试试调整城市、岗位或实习可开始时间。</p><button class="employer-btn employer-btn-outline" data-employer-action="reset-filters">清空筛选条件</button></div>'}</div><p class="employer-signal-note">城市和岗位可多选。实习可开始时间按月份筛选，具体到岗安排由双方确认。</p><p class="employer-discovery-note">${source==='sample'?'虚构人才样例 · 不含真实简历或联系方式':'本机学生资料 · 电话、邮箱等联系方式保持隐藏，双方在对应申请确认后按授权开放。'}</p>`;
  }
  function showCandidate(id) {
    const candidate = validCandidate(id); if (!candidate) { closeModal(); api.toast('这位学生的账户或简历已变化，请重新查看人才列表。'); return; }
    if (!candidate.fictional) window.JiulvGrowth?.recordStudentView?.(candidate.studentId, '学生简历');
    const snapshot = window.JiulvOutreachCore?.sanitizeSnapshot(candidate.resumeSnapshot||{}) || {};
    snapshot.example = candidate.fictional === true;
    snapshot.contactRedacted = true;
    if (candidate.fictional) snapshot.intentionCities = candidate.cities.map(cityLabel).join('、');
    const fullResume = `<section class="employer-full-resume"><p class="employer-note">${candidate.fictional?'虚构简历样例，用于了解展示效果。':'以下为学生已保存的简历。'}电话、邮箱及微信号已隐藏。</p><div class="resume-preview">${window.JiulvFeatures.resume?.renderSnapshot?.(snapshot) || `<dl class="employer-detail">${Object.entries(snapshot).filter(([key])=>window.JiulvOutreachCore?.fieldLabels[key]).map(([key,value])=>`<div><dt>${e(window.JiulvOutreachCore.fieldLabels[key])}</dt><dd>${e(value)}</dd></div>`).join('')}</dl>`}</div></section>`;
    api.modal(`<div class="employer-modal" data-candidate-detail="${e(candidate.id)}"><div class="employer-candidate-detail-head"><div><h2 id="modal-title">${e(candidate.alias)}</h2><p class="employer-small">${candidate.fictional ? '虚构候选人 · 无真实联系方式' : '学生完整简历 · 联系方式隐藏'}</p></div>${candidateActions(candidate)}</div>${candidateTags(candidate)}${fullResume}<p class="employer-note">资料由学生填写，经历和技能待沟通核实。邀请只是表达意向，由学生自行决定是否接受。</p></div>`, 'CANDIDATE / 学生简历');
  }

  function inviteForm(id) {
    const candidate = validCandidate(id); if (!candidate) return api.toast('这位学生的账户或简历已变化，请重新查看人才列表。');
    if (!candidate.fictional) { if (window.JiulvWorkflow?.inviteFromCandidate) return window.JiulvWorkflow.inviteFromCandidate(candidate); return api.toast('招聘流程正在准备，请稍后重试。'); }
    const existing = invites.find(item => item.candidateId === id), availablePlans = planRows();
    const planSelect = `<label>关联招聘计划（选填）<select name="planId"><option value="">暂不关联</option>${availablePlans.map(plan => `<option value="${e(plan.id)}" ${existing?.planId === plan.id ? 'selected' : ''}>${e(plan.name)} · ${e(plan.role)}</option>`).join('')}${existing?.planId && !availablePlans.some(plan => plan.id === existing.planId) ? `<option value="${e(existing.planId)}" selected disabled>原招聘计划不可用，请重新选择</option>` : ''}</select><small class="employer-form-hint">招聘计划中会显示对应岗位的进展；选择计划不会改动你已写好的邀请。</small></label>`;
    const text = existing?.text || `${candidate.alias}，你好：\n\n想邀请你进一步了解我们的${candidate.roles.join(' / ')}实习机会。\n\n在继续沟通前，希望确认你的意向城市、可实习区间，以及学校实习手续要求。具体岗位、津贴、住宿、通勤和餐食安排，可依据酒店招聘计划逐项说明。\n\n如你愿意，再共同确认方便沟通的时间。\n\n【本机虚构候选人邀请草稿，未发送；不代表录用或待遇承诺】`;
    api.modal(`<div class="employer-modal"><h2 id="modal-title">给 ${e(candidate.alias)} 的邀请草稿</h2><p class="employer-note">这是一位虚构人才样例。邀请仅保存为此人的本机草稿，不发送，也不替换成其他注册学生。</p><form id="employer-invite-form" class="employer-modal-form" data-hotel-id="${e(loadedHotelId)}"><input type="hidden" name="candidateId" value="${e(id)}">${planSelect}<label>拟沟通内容<textarea name="text" id="employer-invite-text" required minlength="10" maxlength="3000" rows="13">${e(text)}</textarea></label><div class="employer-modal-actions"><button type="submit" class="employer-btn employer-btn-primary">保存本机草稿</button><button type="button" class="employer-btn employer-btn-outline" data-employer-action="download-invite">导出 TXT</button></div></form></div>`, 'INVITATION DRAFT / 不发送');
  }
  function followForm(id,planId='') {
    const item = followups.find(record => record.id === id) || { id: '', planId:planRows().some(plan=>plan.id===planId)?planId:'', candidateId: 'c01', stage: stages[0], nextDate: '2026-09-28', note: '', commitment: {} };
    api.modal(`<div class="employer-modal"><h2 id="modal-title">记录条件与下一步</h2><p class="employer-note">这里的勾选是酒店内部演示记录，不代表候选人已确认或平台核验。</p><form id="employer-follow-form" class="employer-modal-form"><input name="recordId" type="hidden" value="${e(item.id)}"><input name="planId" type="hidden" value="${e(item.planId||'')}"><label>候选人<select name="candidateId">${candidates.map(candidate => `<option value="${candidate.id}" ${candidate.id === item.candidateId ? 'selected' : ''}>${e(candidate.alias)} · ${e(candidate.roles.join(' / '))}</option>`).join('')}</select></label><div class="employer-two"><label>当前阶段<select name="stage">${options(stages, item.stage, '请选择')}</select></label><label>下次跟进年月<input name="nextMonth" type="month" required value="${e(item.nextMonth || item.nextDate?.slice(0,7) || '')}"></label></div><fieldset class="employer-fieldset"><legend>已准备好明确说明的条件</legend>${promises.map(([key, label]) => `<label class="employer-check"><input type="checkbox" name="${key}" ${item.commitment?.[key] ? 'checked' : ''}>${label}</label>`).join('')}</fieldset><label>问题、反馈与下步安排<textarea name="note" required maxlength="500" rows="4" placeholder="记录未确认的条件、意向变化及准备采取的行动">${e(item.note)}</textarea></label><div class="employer-modal-actions"><button class="employer-btn employer-btn-primary" type="submit">保存跟进记录</button>${item.id ? `<button type="button" class="employer-link employer-danger" data-employer-action="delete-follow" data-id="${e(item.id)}">删除此记录</button>` : ''}</div></form></div>`, 'FOLLOW THROUGH / 条件确认');
  }
  function closeModal() { document.querySelector('#modal')?.close(); }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-employer-action]'); if (!button) return;
    if (!syncHotelState()) return;
    const { employerAction: action, id } = button.dataset;
    if (document.querySelector('#workflow-view')?.hidden === false && ['follow', 'invite', 'delete-follow', 'download-invite'].includes(action)) workspace = 'followup';
    if (action === 'recruitment-tab' && ['home', 'analytics', 'saved'].includes(button.dataset.tab)) { recruitmentTab = button.dataset.tab; renderRecruitment(); }
    else if (action === 'finish-filter') { const panel = button.closest?.('.job-filter'); if (panel) { panel.open = false; panel.querySelector('summary')?.focus(); } }
    else if (action === 'remove-filter' && ['city','role','startMonth'].includes(button.dataset.filter)) { const key=button.dataset.filter,value=button.dataset.value;if(key==='startMonth')filters.startMonth='';else if(key==='city'&&value.startsWith('region:')){const region=talentRegions().find(row=>row.id===value.slice(7));filters.city=selectedValues('city').filter(city=>!region?.cities.some(row=>row.label===city));}else filters[key]=selectedValues(key).filter(item=>item!==value);render(); }
    else if (action === 'city-region') { if(talentRegions().some(region=>region.id===button.dataset.region)){activeTalentRegion=button.dataset.region;render();const panel=document.querySelector('[data-employer-panel="city"]');if(panel)panel.open=true;} }
    else if (action === 'clear-cities') { filters.city=[];render();const panel=document.querySelector('[data-employer-panel="city"]');if(panel)panel.open=true; }
    else if (action === 'edit-information') { closeModal(); api.showView('hotel'); }
    else if (action === 'create-plan') { closeModal(); window.JiulvFeatures.hotel?.newPlan?.(); }
    else if (action === 'view-workflow') { closeModal(); if(window.JiulvFeatures.hotel?.openPlanFlow)window.JiulvFeatures.hotel.openPlanFlow(button.dataset.planId||'__legacy__');else api.showView('workflow'); }
    else if (action === 'talent-source' && ['local', 'sample'].includes(button.dataset.source)) { talentSource = button.dataset.source; render(); }
    else if (action === 'reset-filters') { filters = {}; render(); }
    else if (action === 'candidate') showCandidate(id);
    else if (action === 'invite') inviteForm(id);
    else if (action === 'follow') followForm(id);
    else if (action === 'save-candidate') {
      if (!validCandidate(id)) return;
      const next = shortlist.includes(id) ? shortlist.filter(value => value !== id) : [...shortlist, id];
      if (!put('shortlist', next)) return; shortlist = next; render(); if (button.closest?.('[data-candidate-detail]')) showCandidate(id); api.toast(shortlist.includes(id) ? '已加入本机候选收藏。' : '已取消候选收藏。');
    } else if (action === 'download-invite') {
      const text = document.querySelector('#employer-invite-text')?.value; if (!text?.trim()) return api.toast('请先填写草稿。');
      api.download('酒旅之星-虚构候选邀请草稿.txt', text, 'text/plain;charset=utf-8'); api.toast('已请求导出草稿，未发送。');
    } else if (action === 'delete-follow') {
      const next = followups.filter(item => item.id !== id); if (!put('followups', next)) return; followups = next; closeModal(); render(); api.toast('已删除本机跟进记录。');
    }
  });
  document.addEventListener('change', event => {
    const node=event.target,key=node.dataset?.employerFilter,regionId=node.dataset?.employerRegionAll;
    if (!key&&!regionId&&!node.matches?.('[data-employer-month]'))return;
    if(!syncHotelState())return;
    if(regionId){const region=talentRegions().find(row=>row.id===regionId);if(!region)return;const values=region.cities.map(city=>city.label);filters.city=node.checked?[...new Set([...selectedValues('city'),...values])]:selectedValues('city').filter(value=>!values.includes(value));}
    else if(key&&['city','role'].includes(key)){const value=node.value,valid=key==='city'?talentRegions().some(region=>region.cities.some(city=>city.label===value)):roles.includes(value);if(!valid)return;filters[key]=node.checked?[...new Set([...selectedValues(key),value])]:selectedValues(key).filter(item=>item!==value);}
    else if(node.matches?.('[data-employer-month]')){if(node.value&&!core.monthValid(node.value))return api.toast('请选择有效的实习可开始时间（年月）。');filters.startMonth=node.value;}
    render();if(key||regionId){const panel=document.querySelector(`[data-employer-panel="${regionId?'city':key}"]`);if(panel)panel.open=true;}
  });
  document.addEventListener('submit', event => {
    const form = event.target, formId = form.getAttribute?.('id');
    if (!['employer-filter-form', 'employer-follow-form', 'employer-invite-form'].includes(formId)) return;
    event.preventDefault(); if (!syncHotelState() || !form.reportValidity()) return;
    const formData = new FormData(form), data = Object.fromEntries(formData);
    if (formId === 'employer-filter-form') { const read=key=>formData.getAll?formData.getAll(key):Array.from(formData).filter(([name])=>name===key).map(([,value])=>value);filters=discoveryFilters({city:[...selectedValues('city')],role:read('role'),startMonth:data.startMonth||''});render(); }
    else if (formId === 'employer-follow-form') {
      if (!validCandidate(data.candidateId) || !stages.includes(data.stage) || !String(data.note || '').trim()) return api.toast('请选择有效阶段并填写跟进说明。');
      if (!core.monthValid(String(data.nextMonth||data.nextDate||'').slice(0,7))) return api.toast('请选择有效的跟进年月。');
      const existingFollow=followups.find(record=>record.id===data.recordId), planId=existingFollow?existingFollow.planId||'':planRows().some(plan=>plan.id===data.planId)?data.planId:'';
      const item = { id: data.recordId || crypto.randomUUID(), planId, candidateId: data.candidateId, stage: data.stage, nextDate: existingFollow?.nextDate || '', nextMonth: String(data.nextMonth||data.nextDate||'').slice(0,7), note: data.note.trim(), commitment: Object.fromEntries(promises.map(([key]) => [key, data[key] === 'on'])) };
      const next = data.recordId ? followups.map(record => record.id === data.recordId ? item : record) : [...followups, item];
      if (!put('followups', next)) return; followups = next; closeModal(); render(); api.toast('跟进已保存；未联系候选人。');
    } else if (formId === 'employer-invite-form') {
      if (form.dataset?.hotelId && form.dataset.hotelId !== loadedHotelId) return api.toast('酒店账号已变化，请重新打开候选人的邀请。');
      if (validCandidate(data.candidateId)?.fictional !== true || String(data.text || '').trim().length < 10) return api.toast('请填写至少10字的邀请内容。');
      const existing = invites.find(invite => invite.candidateId === data.candidateId);
      const planId = String(data.planId ?? existing?.planId ?? ''), selectedPlan = planId ? planRows().find(plan => plan.id === planId) : null;
      if (planId && !selectedPlan) return api.toast('关联的招聘计划已不可用，请重新选择或取消关联。');
      const draft = { id: existing?.id || crypto.randomUUID(), candidateId: data.candidateId, planId, planName: selectedPlan?.name || '', position: selectedPlan?.role || '', text: data.text.trim(), createdAt: existing?.createdAt || new Date().toISOString(), status: 'draft-not-sent' };
      const next = [...invites.filter(invite => invite.candidateId !== draft.candidateId), draft];
      if (!put('invites', next)) return; invites = next; render(); api.modal(`<div class="employer-modal"><h2 id="modal-title">邀请草稿已保存</h2><p class="employer-note">给 ${e(validCandidate(draft.candidateId).alias)} 的虚构邀请已保存在本机，尚未发送；没有创建其他学生的邀请。</p><div class="employer-modal-actions"><button class="employer-btn employer-btn-primary" data-employer-action="view-workflow" data-plan-id="${e(draft.planId||'')}">查看招聘计划与进展 ↗</button><button class="employer-link" data-employer-action="invite" data-id="${e(draft.candidateId)}">继续修改草稿</button></div></div>`, 'INVITATION DRAFT / 未发送'); api.toast('邀请草稿已保存，没有发送任何消息。');
    }
  });
  document.addEventListener('jiulv:accountchange', () => {
    if (!syncHotelState() || document.body?.dataset?.perspective !== 'employer') return;
    if (document.querySelector('[data-candidate-detail]')) closeModal();
    if (document.querySelector('#employer-view')?.hidden === false) renderTalent();
    else if (document.querySelector('#recruitment-view')?.hidden === false) renderRecruitment();
  });
  window.addEventListener?.('storage', event => {
    if (!event.key || (!event.key.endsWith('accounts:v4') && !event.key.includes('resumeDraft:'))) return;
    if (document.body?.dataset?.perspective !== 'employer' || !syncHotelState(true)) return;
    if (document.querySelector('[data-candidate-detail]')) closeModal();
    if (document.querySelector('#employer-view')?.hidden === false) renderTalent();
    else if (document.querySelector('#recruitment-view')?.hidden === false) renderRecruitment();
  });
  window.JiulvFeatures = window.JiulvFeatures || {};
  window.JiulvFeatures.employer = { render: renderTalent, openForPlan, planRows, legacyPlanRows, recruitmentTasks, followOptions, openRecruitmentTask, openCandidateDraft, candidates: () => hotelId() ? JSON.parse(JSON.stringify(candidatePool())) : [] };
  window.JiulvFeatures.recruitment = { render: renderRecruitment };
})();
