/* 酒旅之星：本机模板简历与逐次授权演示。此文件不发起任何网络投递。 */
(() => {
  'use strict';

  const api = () => window.JiulvDemo;
  const e = value => api().e(String(value ?? ''));
  const byId = id => document.getElementById(id);
  const draftKey = account => `resumeDraft:${account.id}`;
  let activeAccountId = null;
  let currentPhoto = '';
  let latestSnapshot = null;
  let pendingDelivery = null;
  let applicationTarget = null;
  let previewCanDeliver = true;
  let imageRequest = 0;
  let pendingImage = null;
  let activeTab = 'profile';
  let autoSaveTimer = null, queuedDraft = null;
  const profileKeys = ['name', 'school', 'major'];
  let profileSyncAccountId = null, editableProfileAccountId = null, profileBaseline = '';
  const educationLevels = () => window.JiulvCore?.EDUCATION_LEVELS || [];
  const englishLevels = () => window.JiulvCore?.ENGLISH_LEVELS || [];
  const departments = () => window.JiulvCore?.DEPARTMENTS || [];
  const optionalFields = new Set(['email', 'educationSummary', 'clubs']);
  const experienceLevels = ['有实习经历', '有兼职经历', '暂无相关经历'];
  const conversionIntents = ['可衔接转正', '仅实习', '待考虑'];
  const profileSignature = account => JSON.stringify(profileKeys.map(key => String(account?.[key] || '').trim()));
  function validateProfile(data = {}) {
    return profileKeys.every(key => String(data?.[key] || '').trim()) ? { ok: true } : { ok: false, error: '生成或投递简历前，请填写姓名、学校和专业。' };
  }
  function syncProfile(accountId, draft) {
    const account = api().getAccount();
    if (!account || account.id !== accountId || editableProfileAccountId !== accountId || !validateProfile(draft).ok || profileSignature(account) === profileSignature(draft)) return true;
    // Never overwrite account details changed elsewhere while this first resume is open.
    if (profileSignature(account) !== profileBaseline) return false;
    profileSyncAccountId = accountId;
    try {
      const saved = api().saveAccount?.({ ...account, ...Object.fromEntries(profileKeys.map(key => [key, draft[key]])) });
      if (!saved) return false;
      profileBaseline = profileSignature(draft);
      return true;
    } finally { profileSyncAccountId = null; }
  }
  function resumeChanged() { if (typeof CustomEvent === 'function') document.dispatchEvent?.(new CustomEvent('jiulv:resumechange')); }
  function flushDraft() {
    if (autoSaveTimer && typeof clearTimeout === 'function') clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
    const queued = queuedDraft;
    if (!queued) return true;
    const savedAt = new Date().toISOString();
    if (!api().save(`resumeDraft:${queued.accountId}`, { ...queued.data, savedAt })) {
      const status = byId('resume-save-status');
      if (status && api().getAccount()?.id === queued.accountId) status.textContent = '草稿未能保存，请检查浏览器存储空间后重试。';
      return false;
    }
    queuedDraft = null;
    const profileSaved = syncProfile(queued.accountId, queued.data);
    resumeChanged();
    const status = byId('resume-save-status');
    if (status && api().getAccount()?.id === queued.accountId) status.textContent = profileSaved ? `已自动保存 · ${dateLabel(savedAt)} · 仅此浏览器` : '简历草稿已保存，账号资料同步失败；请重试保存草稿。';
    return profileSaved;
  }
  function queueDraft() {
    const data = draftFromForm(), account = api().getAccount();
    if (!data || !account || pendingImage) return;
    queuedDraft = { accountId: account.id, data };
    const status = byId('resume-save-status');
    if (status) status.textContent = '正在保存草稿…';
    if (autoSaveTimer && typeof clearTimeout === 'function') clearTimeout(autoSaveTimer);
    if (typeof setTimeout === 'function') autoSaveTimer = setTimeout(flushDraft, 500); else flushDraft();
  }
  function monthValue(value) {
    const text = String(value || '');
    if (/^\d{4}-(?:0[1-9]|1[0-2])$/.test(text)) return text;
    if (!/^\d{4}-(?:0[1-9]|1[0-2])-\d{2}$/.test(text)) return '';
    const date = new Date(`${text}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === text ? text.slice(0, 7) : '';
  }
  function durationSuggestion(start, end) {
    const first = monthValue(start), last = monthValue(end);
    if (!first || !last || last < first) return '';
    const [sy, sm] = first.split('-').map(Number), [ey, em] = last.split('-').map(Number);
    return `约${(ey - sy) * 12 + em - sm + 1}个月`;
  }
  function validateTiming(data = {}) {
    const start = monthValue(data.startMonth || data.startDate), end = monthValue(data.endMonth || data.endDate);
    if (!start || !end || !String(data.duration || '').trim()) return { ok: false, error: '投递或接受邀请前，请补齐简历中的开始年月、结束年月和实习周期。' };
    if (end < start) return { ok: false, error: '请核对实习年月，结束月份不能早于开始月份。' };
    return { ok: true };
  }
  const regionDirectory = () => window.JiulvRegions;
  function citySelection(raw = '', storedIds = []) {
    const regions = regionDirectory();
    if (!regions) return {ids:[], labels:[], legacy:String(raw || '')};
    const ids = [], legacy = [];
    for (const id of Array.isArray(storedIds) ? storedIds : []) { const city=regions.findCity(id); if(city&&!ids.includes(city.id))ids.push(city.id); }
    for (const text of String(raw || '').split(/[、,，;；\n]+/).map(value=>value.trim()).filter(Boolean)) {
      let city=regions.findCity(text);
      if (!city) city=regions.cities.find(item=>[item.name,item.label].some(name=>text.startsWith(name)&&/^(?:市)?(?:\s*[·/\s]\s*)?[^、,，]*[区县镇街道]/.test(text.slice(name.length))));
      if (city && !ids.includes(city.id)) ids.push(city.id);
      if (!city || ![city.name,city.label].includes(text)) legacy.push(text);
    }
    return {ids,labels:ids.map(id=>regions.findCity(id).label),legacy:legacy.join('、')};
  }
  function cityOptions(regionId, ids) {
    const directory=regionDirectory(), region=directory?.regions.find(item=>item.id===regionId) || directory?.regions[0];
    if (!region) return '<p class="muted">城市目录暂未加载，请刷新页面。</p>';
    return `<p class="resume-city-region-name">${e(region.name)}</p>${region.cities.length > 1 ? `<label class="resume-city-select-all"><input type="checkbox" data-resume-city-all="${e(region.id)}" ${region.cities.every(city=>ids.includes(city.id))?'checked':''}>全选${e(region.label)}</label>`:''}<div class="resume-city-options">${region.cities.map(city=>`<label><input type="checkbox" data-resume-city="${e(city.id)}" ${ids.includes(city.id)?'checked':''}><span>${e(city.label)}</span></label>`).join('')}</div>`;
  }
  function cityChips(ids) { return ids.map(id=>{const city=regionDirectory()?.findCity(id);return city?`<button type="button" data-resume-action="city-remove" data-city-id="${e(id)}" aria-label="移除${e(city.label)}">${e(city.label)} <span aria-hidden="true">×</span></button>`:'';}).join(''); }
  function cityPicker(data) {
    const selected=citySelection(data.intentionCities,data.intentionCityIds), directory=regionDirectory(), regionId=directory?.findCity(selected.ids[0])?.regionId || directory?.regions[0]?.id || '';
    return `<div class="field resume-field full resume-city-field"><span>意向城市 <b aria-hidden="true">*</b> <small>可多选</small></span><input name="intentionCities" type="hidden" value="${e(directory?selected.labels.join('、'):data.intentionCities)}"><input name="intentionCityIds" type="hidden" value="${e(selected.ids.join(','))}"><details class="resume-city-picker"><summary>选择省 / 市 <b id="resume-city-count">${selected.ids.length?`已选 ${selected.ids.length} 个城市`:'请选择城市'}</b></summary><label class="resume-city-province"><span>省 / 直辖市 / 港澳台</span><select id="resume-city-region" data-resume-region>${(directory?.regions||[]).map(region=>`<option value="${e(region.id)}" ${region.id===regionId?'selected':''}>${e(region.name)}</option>`).join('')}</select></label><div id="resume-city-options">${cityOptions(regionId,selected.ids)}</div><button type="button" class="resume-text-button" data-resume-action="city-clear">清空已选城市</button></details><div id="resume-city-selected" class="resume-city-selected">${cityChips(selected.ids)}</div>${selected.legacy?'<small class="muted">旧资料中的具体地址已保留，请按当前意向核对所选城市。</small>':''}</div>`;
  }
  function updateCitySelection(ids) {
    const form=byId('resume-form'); if(!form || form.dataset.accountId!==api().getAccount()?.id)return;
    const selected=citySelection('',ids);
    const field=form.elements.namedItem('intentionCities'), stored=form.elements.namedItem('intentionCityIds');
    if(field)field.value=selected.labels.join('、');if(stored)stored.value=selected.ids.join(',');
    const count=byId('resume-city-count');if(count)count.textContent=selected.ids.length?`已选 ${selected.ids.length} 个城市`:'请选择城市';
    const chips=byId('resume-city-selected');if(chips)chips.innerHTML=cityChips(selected.ids);
    const options=byId('resume-city-options');if(options)options.innerHTML=cityOptions(byId('resume-city-region')?.value,selected.ids);
    queueDraft();
  }
  function currentCityIds() { return String(byId('resume-form')?.elements.namedItem('intentionCityIds')?.value || '').split(',').filter(Boolean); }
  function explicitIntent(account = api().getAccount()) {
    const intent = api().read('intent:v5', null);
    return intent && (!intent.accountId || intent.accountId === account?.id) ? intent : null;
  }


  function hasSavedResume() {
    const account = api()?.getAccount();
    if (!account) return false;
    const draft = api().read(draftKey(account), null);
    return Boolean(draft?.savedAt && (!draft.accountId || draft.accountId === account.id));
  }
  function applyToJob(jobId) {
    if (!api().getAccount()) return api().requireAccount(() => applyToJob(jobId));
    const account = api().getAccount();
    if (!flushDraft()) return;
    const job = deliveryJobs().find(item => item.id === jobId);
    if (!job) return api().toast('这个岗位已暂停或关闭，请重新选择。');
    const previous = applicationTarget?.jobId === jobId && applicationTarget?.accountId === account.id ? applicationTarget : {};
    applicationTarget = { ...previous, jobId, accountId: account.id };
    if (!hasSavedResume()) {
      byId('modal')?.close?.(); activeTab = 'profile'; api().showView('resume'); return;
    }
    const draft = normalizeDraft(api().read(draftKey(account), {}), account);
    if (!validateComplete(draft).ok) {
      api().toast(validateComplete(draft).error);
      byId('modal')?.close?.(); activeTab = 'profile'; api().showView('resume'); return;
    }
    latestSnapshot = { ...draft, accountId: account.id, version: `R${new Date(draft.savedAt).getTime() || Date.now()}`, generatedAt: draft.savedAt };
    previewCanDeliver = true;
    const roles = deliveryRoles(job);
    const position = roles.includes(previous.position) ? previous.position : roles.includes(job.role) ? job.role : roles.length === 1 ? roles[0] : '';
    reviewDelivery({ hotelId: jobId, position, question: previous.question ?? window.JiulvWorkflow?.getQuestion?.()?.question ?? '', transferPreference: previous.transferPreference });
  }
  function editApplicationResume() {
    if (!applicationTarget || applicationTarget.accountId !== api().getAccount()?.id) return;
    const form = byId('resume-authorize-form');
    if (form) {
      const data = new FormData(form);
      applicationTarget.question = String(data.get('question') || '');
      applicationTarget.position = String(data.get('position') || pendingDelivery?.role || '');
      applicationTarget.transferPreference = pendingDelivery ? {
        jobId: pendingDelivery.jobId, hotelId: pendingDelivery.hotelId, hotelAccountId: pendingDelivery.hotelAccountId,
        position: applicationTarget.position, acceptsTransfer: data.get('acceptsTransfer') === 'on', departments: [...pendingTransferOptions]
      } : null;
    }
    byId('modal')?.close?.(); activeTab = 'profile'; pendingDelivery = null; api().showView('resume');
  }

  function setPhotoReading(form, busy, message) {
    if (!form) return;
    form.querySelectorAll('button[type="submit"], [data-resume-action="save"]').forEach(button => { button.disabled = busy; });
    form.setAttribute('aria-busy', String(busy));
    const status = form.querySelector('#resume-photo-status');
    if (status) status.textContent = message || 'JPG / PNG / WebP，最大 2 MB。';
  }
  function invalidatePhotoRead() {
    imageRequest++;
    const previous = pendingImage;
    pendingImage = null;
    if (previous?.form.isConnected) setPhotoReading(previous.form, false);
  }
  function isCurrentPhotoTask(task) {
    return pendingImage === task && task.token === imageRequest && task.form.isConnected &&
      byId('resume-form') === task.form && api().getAccount()?.id === task.accountId;
  }

  const labels = {
    name: '姓名', gender: '性别', birthMonth: '出生年月', birthplace: '出生地',
    height: '身高（cm）', weight: '体重（kg）', school: '学校', major: '专业',
    enrollment: '入学年月', graduation: '预计毕业年月', degree: '学历', educationSummary: '主修课程 / 学业表现', phone: '联系电话', email: '联系邮箱',
    skills: '技能与证书', experience: '实习与兼职经历', clubs: '校园与社团经历',
    intentionCities: '意向城市', intentionRoles: '意向岗位', experienceLevel: '相关经历', conversionIntent: '实习后转正意向', languages: '原外语说明', englishLevel: '外语能力（英语）', startDate: '原到岗日期', endDate: '原结束日期', startMonth: '最早开始年月', endMonth: '最晚结束年月', duration: '可实习周期', objective: '自我介绍'
  };
  const fieldKeys = Object.keys(labels);
  const dateLabel = value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '时间未记录' : date.toLocaleString('zh-CN', { hour12: false });
  };
  const validImage = value => typeof value === 'string' && /^data:image\/(?:png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(value) && value.length < 2850000;
  const monthNow = () => `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  function approximateAge(month) {
    if (!/^\d{4}-\d{2}$/.test(month || '')) return '';
    const [year, birthMonth] = month.split('-').map(Number);
    const now = new Date();
    if (birthMonth < 1 || birthMonth > 12 || year < 1900 || month > monthNow()) return '';
    const age = now.getFullYear() - year - (now.getMonth() + 1 < birthMonth ? 1 : 0);
    return `${age}岁（按月份估算）`;
  }
  function retainLegacyChoice(previous, value, choices) {
    const saved = typeof previous === 'string' ? previous : '';
    const original = typeof value === 'string' ? value.trim() : '';
    if (!original || choices.includes(original) || saved === original || saved.split('\n').includes(original)) return saved;
    return [saved, original].filter(Boolean).join('\n');
  }
  function normalizeDraft(raw, account) {
    const data = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const clean = {};
    fieldKeys.forEach(key => { clean[key] = typeof data[key] === 'string' ? data[key].slice(0, 2400) : ''; });
    profileKeys.forEach(key => { clean[key] = clean[key] || account[key] || ''; });
    ['phone', 'email'].forEach(key => { clean[key] = Object.hasOwn(data, key) ? String(data[key] || '').trim() : account[key] || ''; });
    clean.legacyDegree = retainLegacyChoice(data.legacyDegree, clean.degree, educationLevels());
    clean.legacyEnglishLevel = retainLegacyChoice(data.legacyEnglishLevel, clean.englishLevel, englishLevels());
    // Legacy descriptions require an explicit new selection, never an inferred
    // qualification. Their original wording survives later autosaves.
    if (!educationLevels().includes(clean.degree)) clean.degree = '';
    if (!englishLevels().includes(clean.englishLevel)) clean.englishLevel = '';
    clean.startMonth = monthValue(clean.startMonth || clean.startDate);
    clean.endMonth = monthValue(clean.endMonth || clean.endDate);
    const selected=citySelection(clean.intentionCities,data.intentionCityIds);
    clean.intentionCityIds=selected.ids;
    if(regionDirectory())clean.intentionCities=selected.labels.join('、');
    clean.legacyIntentionCities=String(data.legacyIntentionCities || selected.legacy || '');
    clean.legacyIntentionRoles=String(data.legacyIntentionRoles || (selectedRoles(clean.intentionRoles).join('、')!==clean.intentionRoles ? clean.intentionRoles : '') || '');
    clean.photo = validImage(data.photo) ? data.photo : '';
    clean.generatedAt = typeof data.generatedAt === 'string' ? data.generatedAt : '';
    clean.savedAt = typeof data.savedAt === 'string' ? data.savedAt : '';
    return clean;
  }
  function fieldMark(key) { return optionalFields.has(key) ? ' <small>选填</small>' : ' <b aria-hidden="true">*</b>'; }
  function input(data, key, type = 'text', extra = '') {
    return `<label class="field resume-field"><span>${e(labels[key])}${fieldMark(key)}</span><input name="${key}" type="${type}" value="${e(data[key])}" ${optionalFields.has(key) ? '' : 'required'} ${extra}></label>`;
  }
  function textarea(data, key, placeholder) {
    const required = !optionalFields.has(key) && !(key === 'experience' && data.experienceLevel === '暂无相关经历');
    return `<label class="field full resume-field" ${key === 'experience' ? 'id="resume-experience-field"' : ''}><span>${e(labels[key])}${key === 'experience' ? (required ? ' <b aria-hidden="true">*</b>' : ' <small>已选择暂无相关经历，无需填写</small>') : fieldMark(key)}</span><textarea name="${key}" rows="3" maxlength="1800" ${required ? 'required' : ''} placeholder="${e(placeholder)}">${e(data[key])}</textarea></label>`;
  }
  function select(data, key, values, placeholder) {
    const original = key === 'degree' ? data.legacyDegree : key === 'englishLevel' ? [...new Set([data.legacyEnglishLevel, data.languages].filter(Boolean))].join('；') : '';
    const note = original && !data[key] ? `<small class="muted resume-field-hint">${key === 'degree' ? '已保留原学历' : '已保留你原来填写的外语说明'}：${e(original)}。请重新选择当前选项。</small>` : '';
    return `<label class="field resume-field"><span>${e(labels[key])}${fieldMark(key)}</span><select name="${key}" required><option value="">${e(placeholder)}</option>${values.map(value=>`<option value="${e(value)}" ${data[key] === value ? 'selected' : ''}>${e(value)}</option>`).join('')}</select>${note}</label>`;
  }
  function selectedRoles(value) { return String(value || '').split(/[、,，;；]+/).map(value=>value.trim()).filter(value=>departments().includes(value)); }
  function rolePicker(data) {
    const selected = selectedRoles(data.intentionRoles);
    return `<div class="field resume-field full"><span>意向岗位部门 <b aria-hidden="true">*</b></span><input name="intentionRoles" type="hidden" value="${e(selected.join('、'))}"><div class="resume-department-options" role="group" aria-label="意向岗位部门，可多选">${departments().map(role=>`<label><input type="checkbox" data-resume-role="${e(role)}" ${selected.includes(role) ? 'checked' : ''}><span>${e(role)}</span></label>`).join('')}</div></div>`;
  }
  function validateComplete(data = {}) {
    const missing = [], invalid = [];
    const required = ['name','phone','height','weight','school','major','degree','enrollment','graduation','startMonth','endMonth','duration','intentionCities','intentionRoles','experienceLevel','conversionIntent','englishLevel','skills','objective','gender','birthMonth','birthplace'];
    const values = { ...data, startMonth: monthValue(data.startMonth || data.startDate), endMonth: monthValue(data.endMonth || data.endDate) };
    for (const key of required) if (!String(values[key] || '').trim()) missing.push(key);
    if (!validImage(data.photo)) missing.push('photo');
    if (values.experienceLevel !== '暂无相关经历' && !String(values.experience || '').trim()) missing.push('experience');
    const check = (key, valid) => { if (String(values[key] || '').trim() && !valid) invalid.push(key); };
    check('phone', /^\+?\d{7,15}$/.test(String(data.phone || '').replace(/[\s()-]/g,'')));
    check('email', !data.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email));
    check('height', Number(data.height)>0 && Number(data.height)<=300);
    check('weight', Number(data.weight)>0 && Number(data.weight)<=500);
    check('degree', educationLevels().includes(data.degree));
    check('englishLevel', englishLevels().includes(data.englishLevel));
    check('experienceLevel', experienceLevels.includes(data.experienceLevel));
    check('conversionIntent', conversionIntents.includes(data.conversionIntent));
    check('gender', ['女','男','不愿透露'].includes(data.gender));
    for (const key of ['enrollment','graduation','birthMonth']) check(key, !!monthValue(data[key]));
    check('birthMonth', !!approximateAge(data.birthMonth));
    if (data.enrollment && data.graduation && data.graduation < data.enrollment) invalid.push('graduation');
    if (values.startMonth && values.endMonth && values.endMonth < values.startMonth) invalid.push('endMonth');
    check('intentionCities', regionDirectory() ? citySelection(data.intentionCities,data.intentionCityIds).ids.length>0 : !!data.intentionCities);
    check('intentionRoles', selectedRoles(data.intentionRoles).length>0);
    const names = keys => keys.map(key=>key==='photo'?'头像照片':labels[key] || key).join('、');
    if (missing.length) return {ok:false,missing,invalid,error:`请先补齐${names(missing)}，再生成或申请；未完成的内容可保存草稿。`};
    if (invalid.length) return {ok:false,missing,invalid,error:`请核对${names([...new Set(invalid)])}。`};
    return {ok:true,missing:[],invalid:[]};
  }
  function validateCurrentResume() {
    const account=api().getAccount();
    if (!account) return {ok:false,missing:[],error:'请先登录实习生账户。'};
    if (!flushDraft()) return {ok:false,missing:[],error:'草稿尚未保存成功，请重试。'};
    return validateComplete(normalizeDraft(api().read(draftKey(account),{}),account));
  }
  function draftFromForm() {
    const form = byId('resume-form');
    if (!form || form.dataset.accountId !== api().getAccount()?.id) return null;
    const data = Object.fromEntries(new FormData(form).entries());
    const clean = {};
    fieldKeys.forEach(key => { clean[key] = String(data[key] || '').trim().slice(0, 2400); });
    const account = api().getAccount();
    profileKeys.forEach(key => { if (editableProfileAccountId !== account.id || !Object.hasOwn(data, key)) clean[key] = account[key] || ''; });
    ['phone', 'email'].forEach(key => { clean[key] = Object.hasOwn(data, key) ? String(data[key] || '').trim() : account[key] || ''; });
    clean.generatedAt = api().read(draftKey(account), {})?.generatedAt || '';
    const previous = api().read(draftKey(account), {}) || {};
    clean.legacyDegree = retainLegacyChoice(previous.legacyDegree, previous.degree, educationLevels());
    clean.legacyEnglishLevel = retainLegacyChoice(previous.legacyEnglishLevel, previous.englishLevel, englishLevels());
    clean.languages = String(previous.languages || '').slice(0,2400);
    clean.intentionRoles = selectedRoles(clean.intentionRoles).join('、');
    clean.legacyIntentionRoles=String(previous.legacyIntentionRoles || (selectedRoles(previous.intentionRoles).join('、')!==String(previous.intentionRoles || '') ? previous.intentionRoles || '' : ''));
    const monthly = Object.hasOwn(data,'startMonth') || Object.hasOwn(data,'endMonth');
    if(monthly) {
      clean.startMonth=monthValue(data.startMonth);clean.endMonth=monthValue(data.endMonth);
      clean.startDate=clean.startMonth&&monthValue(previous.startDate)===clean.startMonth?previous.startDate:clean.startMonth?`${clean.startMonth}-01`:'';
      if(clean.endMonth&&monthValue(previous.endDate)===clean.endMonth)clean.endDate=previous.endDate;else if(clean.endMonth){const [year,month]=clean.endMonth.split('-').map(Number);clean.endDate=new Date(Date.UTC(year,month,0)).toISOString().slice(0,10);}else clean.endDate='';
    } else { clean.startMonth=monthValue(clean.startDate);clean.endMonth=monthValue(clean.endDate); }
    const selected=citySelection(clean.intentionCities,String(data.intentionCityIds || '').split(','));
    clean.intentionCityIds=selected.ids;
    if(regionDirectory())clean.intentionCities=selected.labels.join('、');
    clean.legacyIntentionCities=String(previous.legacyIntentionCities || citySelection(previous.intentionCities,previous.intentionCityIds).legacy || '');
    clean.photo = validImage(currentPhoto) ? currentPhoto : '';
    return clean;
  }
  function accountRecords(account) {
    const records = api().read('deliveries:v5', []), legacy = api().read('deliveries', []);
    return [...(Array.isArray(legacy) ? legacy.map(r => ({ ...r, legacy: true })) : []), ...(Array.isArray(records) ? records : [])].filter(record => record && record.accountId === account.id);
  }
  function workspaceHeader() {
    return `${activeTab === 'applications' ? '<header class="resume-progress-heading"><span class="resume-eyebrow">MY INTERNSHIP</span><h1>我的实习</h1></header>' : '<div class="ft-header resume-heading"><span class="resume-eyebrow">YOUR NEXT CHAPTER</span><h1>下一站，<em>由你出发。</em></h1><p>准备好自己的故事，也随时看看每份申请走到了哪里。</p></div>'}
      <div class="resume-workspace-nav"><div class="resume-tabs" role="tablist" aria-label="我的实习：简历与申请"><button id="resume-profile-tab" type="button" role="tab" tabindex="${activeTab === 'profile' ? 0 : -1}" aria-selected="${activeTab === 'profile'}" aria-controls="resume-profile-panel" data-resume-tab="profile" class="${activeTab === 'profile' ? 'active' : ''}">我的简历</button><button id="resume-applications-tab" type="button" role="tab" tabindex="${activeTab === 'applications' ? 0 : -1}" aria-selected="${activeTab === 'applications'}" aria-controls="resume-applications-panel" data-resume-tab="applications" class="${activeTab === 'applications' ? 'active' : ''}">申请进度</button></div><div class="resume-shortcuts" aria-label="我的记录"><button type="button" data-view="visitors">谁看过我 <span aria-hidden="true">↗</span></button><button type="button" data-view="favorites">收藏岗位 <span aria-hidden="true">♡</span></button></div></div>`;
  }
  function open(tab = 'profile') {
    const next = tab === 'applications' ? 'applications' : 'profile';
    api().requireAccount(() => { activeTab = next; api().showView('resume'); });
  }
  function openTab(tab) {
    const next = tab === 'applications' ? 'applications' : 'profile';
    if (!api().getAccount()) { open(next); return false; }
    if (activeTab === 'profile') {
      if (pendingImage) { api().toast('头像仍在读取，请稍候或先移除。'); return false; }
      // Only input/change events enqueue edits. Merely returning to this page must
      // not write an untouched hidden form over a newer draft saved in another tab.
      if (!flushDraft()) return false;
    }
    activeTab = next;
    render();
    return true;
  }
  function render() {
    const host = byId('resume-view');
    if (!host || !api()) return;
    flushDraft();
    invalidatePhotoRead();
    const account = api().getAccount();
    if (!account) {
      activeAccountId = null; currentPhoto = ''; latestSnapshot = null; pendingDelivery = null;
      host.innerHTML = '';
      if (!host.hidden) open(activeTab);
      return;
    }
    if (activeTab === 'applications') {
      host.innerHTML = `${workspaceHeader()}<section id="resume-applications-panel" role="tabpanel" aria-labelledby="resume-applications-tab"></section>`;
      window.JiulvFeatures.workflow?.render(byId('resume-applications-panel'));
      return;
    }
    if (activeAccountId !== account.id) { latestSnapshot = null; pendingDelivery = null; }
    activeAccountId = account.id;
    const data = normalizeDraft(api().read(draftKey(account), {}), account);
    editableProfileAccountId = account.id;
    profileBaseline = profileSignature(account);
    const basicProfile = `<fieldset><legend>01 · 个人信息</legend><p class="muted resume-field-hint">带 * 的项目需填写，未完成可先保存草稿。简历联系电话可独立填写，不会修改登录账号。</p><div class="grid resume-fields">${input(data, 'name', 'text', 'maxlength="40" autocomplete="name" placeholder="例：林星禾"')}${input(data, 'phone', 'tel', 'maxlength="24" autocomplete="tel" placeholder="例：13800000000"')}${input(data, 'email', 'email', 'maxlength="160" autocomplete="email" placeholder="例：student@example.com"')}${input(data, 'height', 'number', 'min="1" max="300" step="0.1" placeholder="例：168"')}${input(data, 'weight', 'number', 'min="1" max="500" step="0.1" placeholder="例：55"')}</div></fieldset><fieldset><legend>02 · 教育背景</legend><div class="grid resume-fields">${input(data, 'school', 'text', 'maxlength="100" placeholder="例：星河文旅学院"')}${input(data, 'major', 'text', 'maxlength="100" placeholder="例：酒店管理与数字化运营"')}${select(data,'degree',educationLevels(),'请选择学历')}${input(data, 'enrollment', 'month', 'min="1900-01"')}${input(data, 'graduation', 'month', 'min="1900-01"')}${textarea(data, 'educationSummary', '例：主修前厅服务、餐饮服务与酒店英语；获得校级奖学金。')}</div></fieldset>`;
    currentPhoto = data.photo;
    const intent = explicitIntent(account), referral = window.JiulvGrowth?.referral?.();
    if (intent && !intent.accountId) api().save('intent:v5', { ...intent, accountId: account.id });
    const target = intent ? deliveryJobs().find(job => job.id === intent.jobId || (!intent.jobId && (job.hotelId || job.id) === intent.hotelId)) : null;
    const context = target ? `<div class="resume-intent-banner"><span>正在为这份机会准备简历</span><strong>${e(target.name)} · ${e(intent.position || target.role)}</strong><small>${applicationTarget?.accountId === account.id ? '修改后保存并核对申请，所选酒店和岗位会保留。' : '生成后核对酒店、岗位与分享内容，再确认投递。'}</small></div>` : '';
    const buddy = (!intent || intent.source === 'buddy') && referral?.month ? `<div class="resume-intent-banner"><span>朋友的同行建议</span><strong>${e(referral.month)} 开始 · ${e(referral.months)}个月</strong><small>仅作参考，不会自动改变你的实习时间。</small><button type="button" class="text-button" data-resume-action="adopt-buddy">采用这个时间建议</button></div>` : '';
    host.innerHTML = `${workspaceHeader()}<section id="resume-profile-panel" role="tabpanel" aria-labelledby="resume-profile-tab">${context}${buddy}
      <div class="notice resume-demo-notice"><strong>本机演示</strong><span>手机号验证为模拟，并非真实实名核验。简历和授权只保存在此浏览器，不会实际发送。</span></div>
      <div class="resume-workspace"><section class="card resume-editor"><div class="resume-editor-top"><div><span class="resume-eyebrow">01 / YOUR RESUME</span><h2>写下你的潜力</h2></div><button class="secondary resume-small" type="button" data-resume-action="example">填入虚构示例</button></div>
      <form id="resume-form" class="form resume-form" data-account-id="${e(account.id)}">${basicProfile}
      <fieldset><legend>03 · 实习意向</legend><p class="muted resume-field-hint">选择希望实习的时间、城市和部门。信息完整后可生成简历或申请岗位。</p><div class="grid resume-fields">
      ${input(data, 'startMonth', 'month', 'min="1900-01"')}${input(data, 'endMonth', 'month', 'min="1900-01"')}
      ${input(data, 'duration', 'text', 'maxlength="60" placeholder="例：6个月"')}<p class="muted resume-field-hint full" id="resume-duration-hint">${durationSuggestion(data.startMonth, data.endMonth) ? `按月份估算${e(durationSuggestion(data.startMonth, data.endMonth))}，可按学校要求调整。` : '选好开始和结束年月后会建议实习周期，可按学校要求调整。'}</p>
      ${cityPicker(data)}${rolePicker(data)}
      ${select(data,'experienceLevel',experienceLevels,'请选择经历情况')}${select(data,'conversionIntent',conversionIntents,'请选择转正意向')}
            </div></fieldset><fieldset><legend>04 · 实习与校园经历</legend><p class="muted resume-field-hint">从最近的经历开始写。没有实习或兼职经历，请在上方选择“暂无相关经历”，无需编造；校园活动单独填写。</p><div class="grid resume-fields">
      ${textarea(data, 'experience', '例：2026.05 - 2026.08 · 星湾酒店 · 前厅实习生\n协助迎宾、整理交接记录，学习确认宾客需求。')}
      ${textarea(data, 'clubs', '例：2025.09 - 2026.06 · 校园服务社 · 活动组成员\n参与开放日的报名整理、路线指引和轮班安排。')}
      </div></fieldset><fieldset><legend>05 · 能力与自我介绍</legend><div class="grid resume-fields">${select(data,'englishLevel',englishLevels(),'请选择英语交流能力')}${textarea(data, 'skills', '例：会使用Excel整理清单，完成餐饮摆台实训。暂无技能证书，正在学习咖啡制作。')}${textarea(data, 'objective', '例：做事细心，习惯先确认需求再记录；希望在前厅实习中学习宾客接待和团队协作。')}
      </div></fieldset><fieldset><legend>06 · 照片与补充资料</legend><div class="grid resume-fields">
      ${select(data,'gender',['女','男','不愿透露'],'请选择，也可选择不愿透露')}
      ${input(data, 'birthMonth', 'month', `min="1900-01" max="${monthNow()}"`)}
      <div class="field resume-field"><span>年龄</span><output id="resume-age" class="resume-age">${e(approximateAge(data.birthMonth) || '填写出生年月后估算')}</output></div>
      ${input(data, 'birthplace', 'text', 'maxlength="60" placeholder="例：浙江杭州"')}
      <div class="field resume-field full"><span>头像照片 <b aria-hidden="true">*</b></span><div class="resume-photo-upload"><div id="resume-photo-preview">${currentPhoto ? `<img src="${e(currentPhoto)}" alt="个人头像预览">` : '<span aria-hidden="true">＋</span>'}</div><label class="secondary resume-small resume-upload-label">选择图片<input id="resume-photo" type="file" accept="image/jpeg,image/png,image/webp" aria-label="上传头像照片"></label><button type="button" class="resume-text-button" data-resume-action="remove-photo">移除</button></div><small id="resume-photo-status" class="muted" role="status">JPG / PNG / WebP，最大 2 MB。</small></div>
      </div></fieldset><div class="actions resume-form-actions"><button class="primary" type="submit">${applicationTarget?.accountId === account.id ? '保存并核对申请' : '生成简历预览'} ↗</button><button class="secondary" type="button" data-resume-action="save">保存草稿</button><button class="resume-text-button" type="button" data-resume-action="clear">清除草稿</button></div><p id="resume-save-status" class="muted resume-footnote" role="status">${data.savedAt ? `草稿保存于 ${e(dateLabel(data.savedAt))}；仅此浏览器可见。` : '填写时自动保存草稿；仅此浏览器保留，不会自动投递。'}</p></form></section>
      <aside class="resume-sidebar"><div class="card resume-tips"><h3>让合适的酒店看见你</h3><p>注册并上传营业执照的酒店可查看已保存的简历，电话、邮箱和微信号始终隐藏。只有你确认本次投递或接受邀请，并进入面试联系后，才向对应酒店开放联系方式。</p></div><div class="card resume-process"><span class="resume-eyebrow">SHARE WITH INTENTION</span><h2>把选择权<br>留在自己手里</h2><ol><li><b>填写与生成</b><span>模板整理经历，未完成的内容可先存草稿。</span></li><li><b>核对分享内容</b><span>指定酒店和岗位，核对完整的脱敏简历。</span></li><li><b>逐次确认授权</b><span>每份记录保存当时的简历快照，后续改稿不会改变它。</span></li></ol><p class="resume-side-note">本演示支持 HTML 下载和浏览器打印 / 保存 PDF。真实投递功能尚未接入。</p></div><div class="card resume-tips"><h3>让每句话都有依据</h3><p>“参与200人活动签到与引导”比“沟通能力优秀”更具体。不要编造经历，也不必为了填满模板暴露无关资料。</p><p class="muted">下载文件会包含你填写的资料，请自行决定保存和分享对象。</p></div></aside></div>
      </section>`;
  }

  function lines(value) { return e(value).replace(/\n/g, '<br>'); }
  function resumeDocument(snapshot) {
    if (window.JiulvResumeTemplate) return window.JiulvResumeTemplate.render(snapshot);
    const data = snapshot || {};
    const personal = [data.gender, data.birthMonth && `出生年月 ${data.birthMonth}`, approximateAge(data.birthMonth), data.birthplace && `出生地 ${data.birthplace}`, data.height && `身高 ${data.height} cm`, data.weight && `体重 ${data.weight} kg`].filter(Boolean);
    const sections = [['意向城市与岗位', [data.intentionCities, data.intentionRoles].filter(Boolean).join(' · ')], ['相关经历与转正意向', [data.experienceLevel, data.conversionIntent].filter(Boolean).join(' · ')], ['实习意向', data.objective], ['兼职与实习经历', data.experience], ['社团与校园经历', data.clubs], ['外语能力', data.englishLevel || data.languages], ['技能与证书', data.skills]].filter(([, value]) => value);
    return `<article class="resume-sheet"><header class="resume-sheet-header"><div><p class="resume-sheet-kicker">酒店与旅游 · 实习申请简历</p><h1>${e(data.name || '未填写姓名')}</h1><p class="resume-sheet-role">${e([data.school, data.major].filter(Boolean).join(' · '))}</p><p class="resume-sheet-contact">${e([data.phone, data.email].filter(Boolean).join(' / '))}</p></div>${validImage(data.photo) ? `<img class="resume-sheet-photo" src="${e(data.photo)}" alt="${e(data.name || '学生')}的头像">` : '<span class="resume-sheet-star" aria-hidden="true">✦</span>'}</header><div class="resume-sheet-plan"><div><span>可到岗时间</span><b>${e(monthValue(data.startMonth || data.startDate) || '待沟通')}${data.endMonth || data.endDate ? ` 至 ${e(monthValue(data.endMonth || data.endDate))}` : ''}</b></div><div><span>可实习周期</span><b>${e(data.duration || '待沟通')}</b></div><div><span>入学时间</span><b>${e(data.enrollment || '未填写')}</b></div></div>${personal.length ? `<p class="resume-sheet-personal">${e(personal.join(' · '))}</p>` : ''}<div class="resume-sheet-content">${sections.length ? sections.map(([label, value]) => `<section><h2>${label}</h2><p>${lines(value)}</p></section>`).join('') : '<section><h2>个人经历</h2><p>暂未填写相关经历，可在面试时进一步介绍。</p></section>'}</div><footer class="resume-sheet-footer"><span>由本人填写 · 内容真实性待接收方核实</span><span>酒旅之星 · ${e(data.version || '简历预览')}</span></footer></article>`;
  }
  const sheetStyles = `
    *{box-sizing:border-box}body{margin:0;background:#edf1ee;color:#243e38;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;line-height:1.7}.resume-sheet{width:100%;max-width:800px;min-height:950px;margin:auto;background:#fff;padding:48px 52px;box-shadow:0 10px 40px #1233240d}.resume-sheet-header{display:flex;justify-content:space-between;gap:24px;padding-bottom:25px;border-bottom:3px solid #23594e}.resume-sheet-kicker{font-size:11px;letter-spacing:2px;margin:0 0 14px;color:#66867a}.resume-sheet h1{font-size:38px;letter-spacing:3px;line-height:1.3;margin:0 0 10px;overflow-wrap:anywhere}.resume-sheet-role,.resume-sheet-contact{font-size:13px;margin:5px 0;overflow-wrap:anywhere}.resume-sheet-photo{width:91px;height:122px;object-fit:cover;border-radius:3px;flex-shrink:0}.resume-sheet-star{font-size:67px;line-height:1.4;color:#b9965b}.resume-sheet-plan{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;padding:21px 0;border-bottom:1px solid #dfe8e1}.resume-sheet-plan span{display:block;font-size:10px;letter-spacing:1px;color:#7d8c86}.resume-sheet-plan b{font-size:13px;font-weight:600;overflow-wrap:anywhere}.resume-sheet-personal{font-size:11px;color:#64746d;line-height:1.8;margin:18px 0 0}.resume-sheet-content{padding-top:6px}.resume-sheet-content section{margin-top:24px;break-inside:avoid}.resume-sheet-content h2{font-size:14px;letter-spacing:2px;margin:0 0 9px;display:flex;align-items:center;gap:12px}.resume-sheet-content h2:after{content:"";height:1px;background:#e3e9e4;flex:1}.resume-sheet-content p{font-size:13px;line-height:1.9;color:#3e534a;margin:0;overflow-wrap:anywhere}.resume-sheet-footer{border-top:1px solid #e3e9e4;display:flex;justify-content:space-between;gap:18px;font-size:9px;color:#89958e;margin-top:42px;padding-top:15px;overflow-wrap:anywhere}.resume-standalone-toolbar{max-width:800px;margin:20px auto;padding:0 15px;color:#52675e;font-size:12px}.resume-standalone-toolbar button{border:0;background:#25574b;color:white;padding:12px 20px;border-radius:8px;font:inherit;cursor:pointer;margin-right:15px}@media(max-width:600px){.resume-sheet{padding:30px 24px;min-height:800px}.resume-sheet h1{font-size:30px}.resume-sheet-photo{width:76px;height:102px}.resume-sheet-plan{gap:10px}.resume-sheet-plan b{font-size:12px}.resume-sheet-footer{flex-direction:column;gap:4px}}@page{size:A4;margin:15mm}@media print{body{background:white}.resume-standalone-toolbar{display:none!important}.resume-sheet{max-width:none;min-height:0;padding:0;box-shadow:none}.resume-sheet-header{break-inside:avoid}.resume-sheet-footer{break-inside:avoid}.resume-sheet-content section{break-inside:auto}.resume-sheet-content h2{break-after:avoid}.resume-sheet-plan{break-inside:avoid}.resume-sheet *{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  `;
  function standalone(snapshot) {
    return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(snapshot.name || '学生')}的实习简历 · 酒旅之星</title><style>${window.JiulvResumeTemplate?.styles || sheetStyles}</style></head><body><div class="resume-standalone-toolbar"><button type="button" onclick="window.print()">打印 / 保存为 PDF</button><span>此文件仅包含当前简历。浏览器打印时可选择“另存为 PDF”。</span></div>${resumeDocument(snapshot)}</body></html>`;
  }
  function preview(snapshot, canDeliver = true) {
    latestSnapshot = snapshot;
    previewCanDeliver = canDeliver;
    api().modal(`<h2 id="modal-title">${canDeliver ? '核对你的简历' : '当时授权的简历快照'}</h2><p class="muted resume-modal-intro">版本 ${e(snapshot.version)} · 生成于 ${e(dateLabel(snapshot.generatedAt))}${canDeliver ? '。尚未向具体岗位发起投递。' : '。该版本不会随草稿修改而改变。'}</p><div class="resume-preview">${resumeDocument(snapshot)}</div><div class="actions resume-preview-actions"><button class="secondary" type="button" data-resume-action="download">下载 HTML 简历</button><button class="secondary" type="button" data-resume-action="print">打印 / 保存 PDF</button>${canDeliver ? '<button class="primary" type="button" data-resume-action="delivery">选择酒店并预览授权 →</button>' : ''}</div><p class="muted resume-footnote">下载或打印仅导出上方简历，不包含页面其他模块；不代表实习申请已提交。<br>若内置浏览器未响应，请在 Chrome / Safari 中打开本机地址，或下载源码后运行。</p>`, 'YOUR RESUME / 简历预览');
  }
  function saveDraft() {
    const account = api().getAccount();
    if (!account) return api().requireAccount(render);
    if (pendingImage) return api().toast('头像正在读取，请稍候再保存，或先移除头像。');
    const draft = draftFromForm();
    if (!draft) return;
    queuedDraft = null; if (autoSaveTimer && typeof clearTimeout === 'function') clearTimeout(autoSaveTimer);
    draft.savedAt = new Date().toISOString();
    if (!api().save(draftKey(account), draft)) return;
    if (!syncProfile(account.id, draft)) { resumeChanged(); return api().toast('简历草稿已保存，账号资料同步失败；请重试保存草稿。'); }
    byId('resume-save-status').textContent = `草稿保存于 ${dateLabel(draft.savedAt)}；仅此浏览器可见，尚未发送。`;
    resumeChanged();
    api().toast('简历草稿已保存到本机浏览器。');
  }
  function generate() {
    const account = api().getAccount();
    if (!account) return api().requireAccount(render);
    if (pendingImage) return api().toast('头像正在读取，请稍候再生成，或先移除头像。');
    const form = byId('resume-form');
    if (!form) return;
    const draft = draftFromForm();
    if (!draft) return;
    const complete = validateComplete(draft);
    if (!complete.ok) return api().toast(complete.error);
    if (!form.reportValidity()) return;
    if (draft.startMonth && draft.endMonth && draft.endMonth < draft.startMonth) return api().toast('结束月份不能早于开始月份。');
    queuedDraft = null; if (autoSaveTimer && typeof clearTimeout === 'function') clearTimeout(autoSaveTimer);
    const now = new Date();
    draft.savedAt = now.toISOString();
    draft.generatedAt = now.toISOString();
    const saved = api().save(draftKey(account), draft);
    if (!saved) return api().toast('简历未能保存，请检查本机存储空间后重试；尚未开始申请。');
    if (!syncProfile(account.id, draft)) { resumeChanged(); return api().toast('简历草稿已保存，账号资料同步失败；请重试生成简历。'); }
    if (saved) byId('resume-save-status').textContent = `草稿保存于 ${dateLabel(draft.savedAt)}；仅此浏览器可见。`;
    if (saved) { api().save(`resumeGenerated:${account.id}`, { generatedAt: now.toISOString() }); resumeChanged(); }
    const snapshot = { ...draft, accountId: account.id, version: `R${now.getTime()}`, generatedAt: now.toISOString() };
    delete snapshot.savedAt;
    if (applicationTarget?.accountId === account.id) applyToJob(applicationTarget.jobId);
    else preview(snapshot);
  }
  function shareSelection() {
    if (!latestSnapshot || !window.JiulvOutreachCore) return null;
    return window.JiulvOutreachCore.sanitizeSnapshot(latestSnapshot);
  }
  function getShareableSnapshot() {
    const account = api().getAccount();
    if (!account || !window.JiulvOutreachCore) return null;
    const draft = normalizeDraft(api().read(draftKey(account), {}), account);
    if (!validateComplete(draft).ok) return null;
    return window.JiulvOutreachCore.sanitizeSnapshot({ ...draft, version: draft.savedAt ? `已保存简历 · ${draft.savedAt}` : '基本资料摘要', generatedAt: draft.savedAt || new Date().toISOString() });
  }
  function getHotelSnapshot(studentId) {
    const student = (api().getAccounts?.().students || []).find(item => item.id === studentId);
    if (!student || !window.JiulvOutreachCore) return null;
    const saved = api().read(draftKey(student), null);
    if (!saved) return null;
    const draft = normalizeDraft(saved, student);
    if (!validateProfile(draft).ok) return null;
    return { ...window.JiulvOutreachCore.sanitizeSnapshot({ ...draft, version: `已保存简历 · ${draft.savedAt || '时间待确认'}`, generatedAt: draft.savedAt || '' }), ...(validImage(draft.photo) ? { photo: draft.photo } : {}) };
  }
  function contactFor(account) {
    if (!account) return {};
    const saved = api().read(draftKey(account), {});
    const data = normalizeDraft(saved, account);
    return window.JiulvOutreachCore?.studentContacts({ ...account, phone: data.phone, email: data.email }) || {};
  }
  function getContactSnapshot(studentId) {
    const account = studentId ? (api().getAccounts?.().students || []).find(row => row.id === studentId) : api().getAccount();
    return contactFor(account);
  }
  function deliveryJobs() {
    const published = window.JiulvRecruitmentCatalog?.getPublishedJobs?.() || [];
    const jobs = [...published, ...(window.JIULV_JOBS || [])].map(job => ({ ...job }));
    const demoHotel = (api().getAccounts?.().hotels || []).find(hotel => (hotel.hotelId || hotel.id) === 'demo-hotel');
    const demoPlans = demoHotel ? api().read(`hotel:plans:${demoHotel.id}`, null) : null;
    if (!demoPlans?.plans?.length && !published.some(job => job.hotelId === 'demo-hotel')) jobs.push({ id: 'demo-hotel', name: '星湾示范酒店（虚构）', role: '前厅部实习生（本机演示）' });
    // Registered hotels receive applications through an active published plan.
    // A paused/closed plan must never turn into an unversioned fallback job.
    return jobs;
  }
  function deliveryRoles(job) { if (!job) return []; if (job.planId) return [job.role]; return job?.departments?.length ? job.departments.map(d => d.includes('实习') ? d : `${d}实习生`) : [job?.role || '实习岗位（待确认）']; }
  let pendingTransferOptions = [];
  function departmentOf(value) {
    const departments = window.JiulvCore?.DEPARTMENTS || ['前厅', '餐饮', '厨房', '客房', '市场销售', '人力资源', '财务', '预订', '康体', '工程', '安保', '其他'];
    return departments.find(department => value === department || value === `${department}实习生`) || '';
  }
  function transferDepartmentsFor(job, position) {
    if (!job) return [];
    const hotelId = job.hotelId || job.id, primary = departmentOf(position);
    const departments = deliveryJobs().filter(other => (other.hotelId || other.id) === hotelId && (!job.hotelAccountId || !other.hotelAccountId || job.hotelAccountId === other.hotelAccountId)).flatMap(other => [other.department, other.conditionSnapshot?.department, ...(other.departments || []), ...deliveryRoles(other)]).map(departmentOf).filter(Boolean);
    const unique = [...new Set(departments)];
    return unique.length > 1 ? unique.filter(department => department !== primary) : [];
  }
  function transferChoice(departments, checked = false) {
    if (!departments.length) return '';
    return `<label class="resume-consent"><input name="acceptsTransfer" type="checkbox" ${checked ? 'checked' : ''}><span>也接受这家酒店其他部门的实习机会<small class="muted" style="display:block">可沟通部门：${e(departments.join('、'))}。酒店若建议调整岗位，会与你另行确认；不会自动投递其他岗位或其他酒店。</small></span></label>`;
  }
  function deliveryCompleteness() {
    return window.JiulvFeatures.resume?.validateCurrentResume?.() || { ok: false, error: '简历校验暂不可用，请刷新后重试。' };
  }
  function deliveryForm() {
    const account = api().getAccount();
    if (!account) return api().requireAccount(render);
    if (!latestSnapshot || latestSnapshot.accountId !== account.id || !previewCanDeliver) return api().toast('请先生成当前账号的简历预览。');
    const profile = deliveryCompleteness();
    if (!profile.ok) return api().toast(profile.error);
    const timing = validateTiming(latestSnapshot);
    if (!timing.ok) { api().toast(timing.error); return; }
    const hotels = deliveryJobs();
    if (!hotels.length) return api().toast('暂无可选择的酒店岗位，请稍后再试。');
    pendingDelivery = null;
    const question = window.JiulvWorkflow?.getQuestion?.();
    const referral = window.JiulvGrowth?.referral?.();
    const intent = explicitIntent(account);
    const preferred = intent?.jobId || (!intent ? referral?.jobId : '') || '';
    const sameHotel = intent?.hotelId ? hotels.filter(job => (job.hotelId || job.id) === intent.hotelId) : [];
    const initialJob = hotels.find(j => j.id === preferred) || (!intent?.jobId && sameHotel.length === 1 ? sameHotel[0] : null);
    const roleHint = intent?.position || (!intent ? referral?.role : '') || '';
    const preferredRole = initialJob?.planId ? initialJob.role : roleHint ? (roleHint.includes('实习') ? roleHint : `${roleHint}实习生`) : '';
    api().modal(`<h2 id="modal-title">这次，投给哪一家酒店？</h2><p class="muted resume-modal-intro">酒旅之星代投递脱敏简历。酒店筛选通过后，按你这次的授权开放联系方式；双方自行约面试，酒店再记录录取结果。</p><form id="resume-delivery-form" class="form resume-delivery-form"><label class="field resume-field"><span>接收酒店与岗位</span><select name="hotelId" id="resume-delivery-hotel" required><option value="">请选择本次要投递的酒店岗位</option>${hotels.map(job => `<option value="${e(job.id)}" ${job.id === initialJob?.id ? 'selected' : ''}>${e(job.name)} · ${e(job.role)}</option>`).join('')}</select></label><label class="field resume-field"><span>本次意向岗位</span><select name="position" id="resume-delivery-position" required><option value="">请选择意向岗位</option>${deliveryRoles(initialJob).map(position => `<option ${position === preferredRole ? 'selected' : ''}>${e(position)}</option>`).join('')}</select></label><div class="notice resume-demo-notice"><span><b>本次固定分享范围</b><br>已填写的完整简历。简历与邮件始终隐藏电话、邮箱、微信号等联系方式；筛选通过后，联系方式在本次申请中单独展示。</span></div><label class="field resume-field full"><span>想向这家酒店确认的问题 <small>选填</small></span><textarea name="question" maxlength="1000" rows="3" placeholder="例：这个到岗月份是否有宿舍床位？员工餐在休息日供应吗？">${e(question?.question || '')}</textarea></label><p class="muted resume-field-hint">${question ? '已带入实习百科的问题，可按这家酒店的情况修改。' : '酒店的具体安排，可随本次投递一起询问。'}</p><div class="notice resume-demo-notice"><span>企业邮箱与小程序未接通。本次将保存授权并演示酒店回应，不会发送真实邮件。</span></div><div class="actions"><button class="primary" type="submit">核对简历与本次授权 →</button><button class="secondary" type="button" data-resume-action="back-preview">返回简历</button></div></form>`, 'YOUR CHOICE / 逐次投递');
  }
  function showExistingApplication(record) {
    api().toast('这个岗位已有进行中的申请，已打开当前进度。');
    if (window.JiulvWorkflow?.detail) { byId('modal')?.close?.(); api().showView('workflow'); window.JiulvWorkflow.detail(record.id); }
    else api().showView('workflow');
  }
  function reviewDelivery(directInput = null) {
    const account = api().getAccount();
    const form = byId('resume-delivery-form');
    if (!account || (!form && !directInput) || !latestSnapshot || latestSnapshot.accountId !== account.id) return api().toast('账号状态已变化，请重新生成简历。');
    const profile = deliveryCompleteness();
    if (!profile.ok) return api().toast(profile.error);
    const data = directInput ? { get: key => directInput[key] } : new FormData(form);
    const job = deliveryJobs().find(item => item.id === data.get('hotelId'));
    if (!job) return api().toast('请选择有效的酒店岗位。');
    if (job.planId) { const current = window.JiulvRecruitmentCatalog?.getPlanSnapshot?.(job.planId, job.hotelAccountId); if (!current || Number(current.revision) !== Number(job.planRevision)) return api().toast('招聘计划已更新或暂停，请重新选择后预览。'); }
    const position = String(data.get('position') || '');
    if ((!directInput || position) && !deliveryRoles(job).includes(position)) return api().toast('请重新选择有效的实习岗位。');
    const availableRoles = deliveryRoles(job);
    pendingTransferOptions = transferDepartmentsFor(job, position);
    const snapshot = shareSelection();
    if (!snapshot) return api().toast('简历摘要模块尚未就绪，请刷新后重试。');
    const existing = window.JiulvOutreachCore.duplicate(window.JiulvWorkflow?.list?.() || [], account.id, job.hotelId || job.id, position, job.planId || null);
    if (existing) return showExistingApplication(existing);
    const question = window.JiulvOutreachCore.redact(String(data.get('question') || ''));
    const recipient = (api().getAccounts?.().hotels || []).find(hotel => hotel.id === job.hotelAccountId || (hotel.hotelId || hotel.id) === (job.hotelId || job.id));
    const recipientEmail = recipient?.hrEmail || (job.id === 'demo-hotel' ? 'hr@starbay.example.invalid' : '');
    const contactSnapshot = contactFor(account), hasContact = Object.keys(contactSnapshot).length > 0;
    const savedTransfer = directInput?.transferPreference;
    const restoreTransfer = savedTransfer?.acceptsTransfer === true && savedTransfer.jobId === job.id && savedTransfer.hotelId === (job.hotelId || job.id) && savedTransfer.hotelAccountId === (recipient?.id || null) && savedTransfer.position === position && JSON.stringify(savedTransfer.departments) === JSON.stringify(pendingTransferOptions);

    pendingDelivery = { hotelAccountId: recipient?.id || null, recipientEmail, contactSnapshot, accountId: account.id, hotelId: job.hotelId || job.id, jobId: job.id, planId: job.planId || null, planRevision: job.planRevision || null, conditionSnapshot: job.conditionSnapshot || null, hotelName: job.name, role: position, acceptsTransfer: false, transferDepartments: [], channel: 'platform-email', resumeSnapshot: snapshot, question, referral: window.JiulvGrowth?.referral?.()?.jobId === job.id ? window.JiulvGrowth.referral().token : null };
    const timing = validateTiming(latestSnapshot);
    const roleField = directInput && availableRoles.length > 1 ? `<label class="field resume-field"><span>申请岗位 *</span><select name="position" id="resume-authorize-position" required><option value="">请选择本次申请的岗位</option>${availableRoles.map(role => `<option value="${e(role)}" ${role === position ? 'selected' : ''}>${e(role)}</option>`).join('')}</select></label>` : '';
    const questionField = directInput ? `<label class="field resume-field"><span>想向酒店确认的问题 <small>选填</small></span><textarea name="question" rows="2" maxlength="1000" placeholder="例：报到当天可以先办理宿舍入住吗？">${e(question)}</textarea></label>` : '';
    const missingTime = directInput && !timing.ok ? `<div class="notice resume-demo-notice"><span>${e(timing.error)}</span><button class="secondary" type="button" data-resume-action="edit-application">补齐实习时间</button></div>` : '';
    api().modal(`<h2 id="modal-title">${directInput ? '核对简历，申请岗位' : '确认这一次投递授权'}</h2><dl class="resume-authorize-summary"><div><dt>接收酒店</dt><dd>${e(job.name)}</dd></div><div><dt>申请岗位</dt><dd>${e(position || '在下方选择')}</dd></div><div><dt>投递方式</dt><dd>酒旅之星企业邮箱代投递 · 当前为演示</dd></div><div><dt>简历版本</dt><dd>${e(snapshot.version)}</dd></div></dl><p class="muted resume-modal-intro">${directInput ? '已使用你最新保存的简历，核对无误即可申请；如需调整，点击“修改简历”。' : '以下就是本次可向这家酒店展示的简历。'}联系方式已隐藏，本次申请保留你核对的版本。</p>${missingTime}<div class="resume-preview">${resumeDocument(snapshot)}</div>${question && !directInput ? `<div class="ow-question"><b>随投递附带的问题</b><span>${e(question)}</span></div>` : ''}<section class="notice resume-demo-notice"><div><b>酒店筛选通过后，才开放面试联系</b><p>${hasContact ? `仅向 ${e(job.name)} 的对应酒店账号开放：${e([contactSnapshot.phone, contactSnapshot.email].filter(Boolean).join(" / "))}。其他酒店无法通过这份申请获得联系方式。` : "当前简历尚无可用的电话或邮箱。你仍可先投递；在简历中补充后，再到申请进度单独授权共享。"}</p></div></section><form id="resume-authorize-form" ${directInput ? 'data-direct-application="true"' : ''}>${roleField}<div id="resume-transfer-choice">${transferChoice(pendingTransferOptions, restoreTransfer)}</div>${questionField}<label class="resume-consent"><input name="consent" type="checkbox" required><span>我已核对上方内容，单独授权酒旅之星向 <b>${e(job.name)}</b> 提供本次脱敏简历摘要和问题。${hasContact ? "该酒店确认简历筛选通过后，我同意仅向其对应账号开放上方联系方式，用于本次面试联系。" : "此次不共享联系方式。"}我了解当前仅本机模拟，没有实际发送邮件。</span></label><div class="actions resume-preview-actions"><button class="primary" type="submit" ${directInput && !timing.ok ? 'disabled' : ''}>${directInput ? '确认申请（本机演示）' : '确认投递授权（本机演示）'}</button><button class="secondary" type="button" data-resume-action="${directInput ? 'edit-application' : 'delivery'}">${directInput ? '修改简历' : '返回修改'}</button></div></form>`, 'REVIEW BEFORE SHARING / 确认接收对象');
  }
  function authorize() {
    const account = api().getAccount();
    if (!account || !pendingDelivery || pendingDelivery.accountId !== account.id) return api().toast('账号状态已变化，请重新预览授权。');
    const profile = deliveryCompleteness();
    if (!profile.ok) return api().toast(profile.error);
    const authorizeForm = byId('resume-authorize-form');
    if (!authorizeForm) return api().toast('请重新核对本次授权。');
    if (authorizeForm?.dataset?.directApplication === 'true') {
      const timing = validateTiming(pendingDelivery.resumeSnapshot);
      if (!timing.ok) return api().toast(timing.error);
      const data = new FormData(authorizeForm), job = deliveryJobs().find(item => item.id === pendingDelivery.jobId);
      if (!job) return api().toast('这个岗位已暂停或关闭，请返回重新选择。');
      const role = String(data.get('position') || pendingDelivery.role || '');
      if (!deliveryRoles(job).includes(role)) return api().toast('请选择本次申请的岗位。');
      pendingDelivery.role = role;
      pendingDelivery.question = window.JiulvOutreachCore.redact(String(data.get('question') || ''));
    }
    const transferData = new FormData(authorizeForm), job = deliveryJobs().find(item => item.id === pendingDelivery.jobId);
    if (!job) return api().toast('这个岗位已暂停或关闭，请返回重新选择。');
    const acceptsTransfer = transferData.get('acceptsTransfer') === 'on';
    const availableTransfers = transferDepartmentsFor(job, pendingDelivery.role);
    if (acceptsTransfer && JSON.stringify(availableTransfers) !== JSON.stringify(pendingTransferOptions)) {
      api().toast('这家酒店其他部门的招聘信息已变化，请重新核对后申请。');
      return reviewDelivery({ hotelId: pendingDelivery.jobId, position: pendingDelivery.role, question: pendingDelivery.question });
    }
    Object.assign(pendingDelivery, window.JiulvOutreachCore.transferPreference({ acceptsTransfer, transferDepartments: acceptsTransfer ? pendingTransferOptions : [], role: pendingDelivery.role }));
    const consent = authorizeForm?.querySelector('[name="consent"]');
    if (!consent?.checked) return api().toast('请先核对并勾选本次授权。');
    const existing = window.JiulvOutreachCore.duplicate(window.JiulvWorkflow?.list?.() || [], account.id, pendingDelivery.hotelId, pendingDelivery.role, pendingDelivery.planId || null);
    if (existing) return showExistingApplication(existing);
    if (JSON.stringify(contactFor(account)) !== JSON.stringify(pendingDelivery.contactSnapshot || {})) return api().toast('联系方式已变化，请返回重新核对本次授权。');
    if (pendingDelivery.planId) {
      const current = window.JiulvRecruitmentCatalog?.getPlanSnapshot?.(pendingDelivery.planId, pendingDelivery.hotelAccountId);
      if (!current || Number(current.revision) !== Number(pendingDelivery.planRevision)) { const jobId = pendingDelivery.jobId; pendingDelivery = null; api().toast('这份招聘计划已更新或暂停，请返回重新选择并核对。'); return authorizeForm?.dataset?.directApplication === 'true' ? applyToJob(jobId) : deliveryForm(); }
    }
    const stored = api().read('deliveries:v5', []), records = Array.isArray(stored) ? stored : [];
    const record = { ...pendingDelivery, contactConsent: Object.keys(pendingDelivery.contactSnapshot || {}).length > 0, id: `delivery-${crypto.randomUUID()}`, status: 'demo-authorized-v5', createdAt: new Date().toISOString() };
    if (!api().save('deliveries:v5', [...records, record])) return;
    pendingDelivery = null; applicationTarget = null;
    let workflowResult;
    try { workflowResult = window.JiulvWorkflow?.fromDelivery(record); }
    catch { workflowResult = { ok: false, error: '回应模块尚未就绪。' }; }
    api().modal(`<h2 id="modal-title">这份申请已准备好</h2><div class="resume-success-symbol">✓</div><p class="resume-success-title">授权已保存 · 邮件尚未接通</p><p class="muted">${e(record.hotelName)}<br>${e(record.role)} · ${e(record.resumeSnapshot.version)}</p><div class="notice resume-demo-notice"><span>${workflowResult?.ok ? '可以继续演示：酒店筛选简历 → 通过后开放已授权联系方式 → 自行面试 → 酒店记录录取结果。' : e(workflowResult?.error || '回应记录尚未关联，请稍后重试。')} 本次没有向酒店发送邮件。</span></div>${workflowResult?.ok ? `<button class="primary" type="button" data-workflow-action="detail" data-id="${e(workflowResult.record.id)}">查看申请进度 →</button><button class="secondary" type="button" data-workflow-action="email-preview" data-id="${e(workflowResult.record.id)}">预览酒店将收到的邮件</button>` : ''}<button class="secondary" type="button" data-resume-action="record" data-record-id="${e(record.id)}">查看本次授权快照</button>`, 'READY FOR A REPLY / 等待回应');
    api().toast('本次授权已保存，没有实际发送邮件。');
  }

  function fillExample() {
    const form = byId('resume-form');
    if (!form) return;
    const year = new Date().getFullYear();
    const sample = {
      name: '林星禾（虚构示例）', gender: '不愿透露', birthMonth: `${year - 21}-05`, birthplace: '浙江杭州', height: '168', weight: '55',
      school: '星河文旅学院（虚构）', major: '酒店管理与数字化运营', enrollment: `${year - 3}-09`,
      phone: api().getAccount()?.phone || '13800000000', email: 'student@example.invalid', degree: '高职 / 专科', graduation: `${year + 1}-06`, educationSummary: '主修课程：前厅服务与管理、餐饮服务、酒店英语。\n课程实践：完成餐饮摆台与宾客接待情景实训。', intentionCities: '上海、杭州', intentionRoles: '前厅、餐饮', experienceLevel: '有实习经历', conversionIntent: '待考虑',
      englishLevel: englishLevels()[0] || '', languages: '',
      skills: '服务技能：迎宾引位、餐前布置、宾客需求记录与交接。\n办公技能：使用 Excel 整理物品清单和活动报名信息。\n未填写技能证书；所有内容均为虚构示例。',
      experience: `${year}.05 - ${year}.08 · 星湾湖畔酒店（虚构） · 行政酒廊实习生\n• 协助迎宾引位、茶歇补给和餐后整理，保持服务区域有序。\n• 整理会议室与欢迎物品，记录宾客需求并交接给负责同事。\n\n${year - 1}.07 - ${year - 1}.09 · 星港花园酒店（虚构） · 全日制餐厅实习生\n• 完成开餐前摆台、用餐引导及餐具补充，配合团队做好收餐。\n• 协助核对餐品与客房送餐用品，学习复述确认宾客需求。`,
      clubs: `${year - 2}.09 - ${year - 1}.06 · 校园服务社（虚构） · 活动组成员\n• 参与校园开放日的报名整理、路线指引和轮班安排。\n• 与组员梳理活动流程，活动后整理反馈和遗漏事项。`,
      startDate: `${year + 1}-02-01`, endDate: `${year + 1}-07-31`, startMonth: `${year + 1}-02`, endMonth: `${year + 1}-07`, duration: '6个月，需与学校确认',
      objective: '意向前厅或餐饮部门，希望在已有服务实践的基础上，进一步学习宾客接待与跨部门协作。做事习惯先确认需求、再记录与交接。\n本简历全部内容为虚构样例，请替换为真实经历后使用。'
    };
    const existing = draftFromForm() || {};
    fieldKeys.forEach(key => { const control = form.elements.namedItem(key); if (control) control.value = (profileKeys.includes(key) || ['phone','email'].includes(key)) && existing[key] ? existing[key] : sample[key] || ''; });
    if(regionDirectory())updateCitySelection(citySelection(sample.intentionCities).ids);
    form.querySelectorAll('[data-resume-role]').forEach(control=>{control.checked=selectedRoles(sample.intentionRoles).includes(control.dataset.resumeRole);});
    invalidatePhotoRead(); currentPhoto = existing.photo || currentPhoto; updatePhoto();
    updateExperienceRequirement();
    byId('resume-age').textContent = approximateAge(sample.birthMonth);
    queueDraft();
    api().toast('已填入虚构示例并保存草稿，请替换为真实资料并上传本人照片。');
  }
  function updateExperienceRequirement() {
    const form=byId('resume-form'), control=form?.elements.namedItem('experience');
    if(control)control.required=form.elements.namedItem('experienceLevel')?.value!=='暂无相关经历';
    const mark=byId('resume-experience-field')?.querySelector?.('span');
    if(mark)mark.innerHTML=`实习与兼职经历 ${control?.required?'<b aria-hidden="true">*</b>':'<small>已选择暂无相关经历，无需填写</small>'}`;
  }
  function updatePhoto() {
    const area = byId('resume-photo-preview');
    if (area) area.innerHTML = validImage(currentPhoto) ? `<img src="${e(currentPhoto)}" alt="个人头像预览">` : '<span aria-hidden="true">＋</span>';
    const file = byId('resume-photo');
    if (file && !currentPhoto) file.value = '';
  }
  document.addEventListener('click', event => {
    const tab = event.target.closest('[data-resume-tab]');
    if (tab?.dataset.resumeTab) { openTab(tab.dataset.resumeTab); return; }
    const button = event.target.closest('[data-resume-action]');
    if (!button || !api()) return;
    const action = button.dataset.resumeAction;
    if (action === 'login') return api().requireAccount(render);
    const account = api().getAccount();
    if (!account) return api().requireAccount(render);
    if(action==='city-clear')return updateCitySelection([]);
    if(action==='city-remove')return updateCitySelection(currentCityIds().filter(id=>id!==button.dataset.cityId));
    if (action === 'profile') {
      if (pendingImage) return api().toast('头像仍在读取，请稍候或先移除。');
      const draft = draftFromForm();
      if (draft && !api().save(draftKey(account), { ...draft, savedAt: new Date().toISOString() })) return;
      return api().openRegistration('student', render);
    }
    if (action === 'adopt-buddy') {
      const referral = window.JiulvGrowth?.referral?.(), form = byId('resume-form');
      if (!referral?.month || !form || (explicitIntent(account) && explicitIntent(account).source !== 'buddy')) return;
      const [year, month] = referral.month.split('-').map(Number), end = new Date(Date.UTC(year, month - 1 + Number(referral.months), 0));
      form.elements.namedItem('startMonth').value = referral.month;
      form.elements.namedItem('endMonth').value = end.toISOString().slice(0, 7);
      form.elements.namedItem('duration').value = `${referral.months}个月`;
      queueDraft(); api().toast('已采用朋友建议的时间，请按自己的学校安排核对。');
    }
    else if (action === 'edit-application') editApplicationResume();
    else if (action === 'continue-application' && applicationTarget?.accountId === account.id) applyToJob(applicationTarget.jobId);
    else if (action === 'save') saveDraft();
    else if (action === 'example') fillExample();
    else if (action === 'clear') {
      queuedDraft = null; if (autoSaveTimer && typeof clearTimeout === 'function') clearTimeout(autoSaveTimer);
      invalidatePhotoRead();
      if (!api().remove(draftKey(account))) return;
      latestSnapshot = null; pendingDelivery = null;
      render(); resumeChanged();
      api().toast('已清除简历草稿；注册资料和已有授权快照保留。');
    } else if (action === 'remove-photo') { invalidatePhotoRead(); currentPhoto = ''; updatePhoto(); queueDraft(); api().toast('头像已移除。'); }
    else if (action === 'download' && latestSnapshot) {
      const filename = `${latestSnapshot.name || '学生'}-实习简历-${latestSnapshot.version}.html`.replace(/[\\/:*?"<>|]/g, '-');
      api().download(filename, standalone(latestSnapshot), 'text/html;charset=utf-8');
      api().toast('已请求导出 HTML；若未响应，请在 Chrome / Safari 中打开。');
    } else if (action === 'print' && latestSnapshot) {
      let printArea = byId('resume-print-area');
      if (!printArea) {
        printArea = document.createElement('div');
        printArea.id = 'resume-print-area';
        printArea.setAttribute('aria-hidden', 'true');
        document.body.append(printArea);
      }
      printArea.innerHTML = resumeDocument(latestSnapshot);
      // Close the top-layer dialog before print so it cannot obscure the print-only sheet.
      const dialog = document.querySelector('dialog[open]');
      if (dialog) dialog.close();
      const cleanPrint = () => { printArea.innerHTML = ''; window.removeEventListener('afterprint', cleanPrint); };
      window.addEventListener('afterprint', cleanPrint);
      window.print();
    } else if (action === 'delivery') deliveryForm();
    else if (action === 'back-preview' && latestSnapshot) preview(latestSnapshot, previewCanDeliver);
    else if (action === 'record') {
      const record = accountRecords(account).find(item => item.id === button.dataset.recordId);
      if (record?.resumeSnapshot) preview(record.resumeSnapshot, false);
      else api().toast('未找到当前账号的授权记录。');
    }
  });
  document.addEventListener('keydown', event => {
    const tab = event.target.closest('[data-resume-tab]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 'profile' : event.key === 'End' ? 'applications' : activeTab === 'profile' ? 'applications' : 'profile';
    if (openTab(next)) byId(`resume-${next}-tab`)?.focus();
  });
  document.addEventListener('submit', event => {
    if (event.target.id === 'resume-form') { event.preventDefault(); generate(); }
    else if (event.target.id === 'resume-delivery-form') { event.preventDefault(); reviewDelivery(); }
    else if (event.target.id === 'resume-authorize-form') { event.preventDefault(); authorize(); }
  });
  document.addEventListener('input', event => {
    const form = event.target.closest('#resume-form');
    if (form && ['startMonth', 'endMonth'].includes(event.target.name)) {
      const start = form.elements.namedItem('startMonth').value, end = form.elements.namedItem('endMonth').value, duration = form.elements.namedItem('duration');
      const suggestion = durationSuggestion(start, end);
      if (duration && (!duration.value || duration.dataset.suggested === duration.value)) { duration.value = suggestion; duration.dataset.suggested = suggestion; }
      const hint = byId('resume-duration-hint'); if (hint) hint.textContent = suggestion ? `按月份估算${suggestion}，可按学校要求调整。` : '月份可暂时留空，投递前再补齐。';
    }
    if (form) queueDraft();
    if (event.target.name === 'birthMonth' && event.target.closest('#resume-form')) {
      const age = byId('resume-age');
      if (age) age.textContent = approximateAge(event.target.value) || '填写有效出生年月后估算';
    }
  });
  document.addEventListener('change', event => {
    if(event.target.closest?.('#resume-form')) {
      const ids=currentCityIds();
      if(event.target.hasAttribute?.('data-resume-region')) {const options=byId('resume-city-options');if(options)options.innerHTML=cityOptions(event.target.value,ids);return;}
      if(event.target.dataset?.resumeRole) { const form=byId('resume-form'), field=form?.elements.namedItem('intentionRoles');if(field){const roles=selectedRoles(field.value);field.value=(event.target.checked?[...new Set([...roles,event.target.dataset.resumeRole])]:roles.filter(role=>role!==event.target.dataset.resumeRole)).join('、');queueDraft();}return;}
      if(event.target.name==='experienceLevel')updateExperienceRequirement();
      if(event.target.dataset?.resumeCity) return updateCitySelection(event.target.checked?[...ids,event.target.dataset.resumeCity]:ids.filter(id=>id!==event.target.dataset.resumeCity));
      if(event.target.dataset?.resumeCityAll) {const region=regionDirectory()?.regions.find(item=>item.id===event.target.dataset.resumeCityAll);if(region)return updateCitySelection(event.target.checked?[...ids,...region.cities.map(city=>city.id)]:ids.filter(id=>!region.cities.some(city=>city.id===id)));return;}
    }
    if (event.target.closest?.('#resume-form') && event.target.id !== 'resume-photo') queueDraft();
    if (event.target.id === 'resume-authorize-position' && pendingDelivery) {
      const job = deliveryJobs().find(item => item.id === pendingDelivery.jobId);
      pendingTransferOptions = transferDepartmentsFor(job, event.target.value);
      const choice = byId('resume-transfer-choice');
      if (choice) choice.innerHTML = transferChoice(pendingTransferOptions);
      return;
    }
    if (event.target.id !== 'resume-delivery-hotel') return;
    const job = deliveryJobs().find(j => j.id === event.target.value), select = byId('resume-delivery-position');
    if (select) select.innerHTML = deliveryRoles(job).map(position => `<option>${e(position)}</option>`).join('');
  });
  document.addEventListener('change', async event => {
    if (event.target.id !== 'resume-photo' || !api()) return;
    const account = api().getAccount();
    const file = event.target.files?.[0];
    const form = event.target.closest('#resume-form');
    if (!account || !file || !form?.isConnected || byId('resume-form') !== form) return;
    invalidatePhotoRead();
    const task = { token: ++imageRequest, accountId: account.id, form, input: event.target };
    pendingImage = task;
    // A replacement is a new choice: remove the previous photo before validating it.
    currentPhoto = '';
    updatePhoto();
    setPhotoReading(form, true, '正在读取并检查头像，暂时不能保存或生成简历…');
    try {
      const result = await api().readImage(file);
      if (!isCurrentPhotoTask(task)) return;
      if (!validImage(result)) throw new Error('请选择有效的 JPG、PNG 或 WebP 图片。');
      pendingImage = null;
      currentPhoto = result;
      updatePhoto();
      setPhotoReading(form, false, '头像已读取并自动保存。');
      queueDraft();
      api().toast('头像已加入简历草稿。');
    } catch (error) {
      if (!isCurrentPhotoTask(task)) return;
      pendingImage = null;
      currentPhoto = '';
      task.input.value = '';
      updatePhoto();
      setPhotoReading(form, false, '头像读取失败，当前未使用任何照片。可重新选择，或不填照片继续。');
      queueDraft();
      api().toast(error.message || '图片读取失败，请重试。');
    }
  });
  document.addEventListener('jiulv:accountchange', () => {
    // saveAccount dispatches synchronously. A profile saved by this form must not
    // replace its DOM or clear the active job, question, preview, or photo state.
    if (profileSyncAccountId && api().getAccount()?.id === profileSyncAccountId) return;
    flushDraft();
    invalidatePhotoRead(); latestSnapshot = null; pendingDelivery = null; applicationTarget = null;
    const host = byId('resume-view');
    if (host && !host.hidden) render();
  });
  window.addEventListener?.('pagehide', flushDraft);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushDraft(); });
  window.JiulvFeatures = window.JiulvFeatures || {};
  window.JiulvFeatures.resume = { render, open, openTab, hasSavedResume, applyToJob, getTab: () => activeTab, renderSnapshot: resumeDocument, getShareableSnapshot, getHotelSnapshot, getContactSnapshot, citySelection, monthValue, validateProfile, validateComplete, validateCurrentResume, validateTiming, durationSuggestion, flushDraft };
  if (api()) render();
})();
