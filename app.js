/* 酒旅之星 H5 演示：静态资料 + 本机收藏和意向，不向服务器提交个人信息。 */
'use strict';
const publicJobs = window.JIULV_JOBS || [];
let jobs = [...publicJobs];
function syncPublishedJobs() {
  const hotels = window.JiulvDemo?.getAccounts?.().hotels || [];
  const published = (window.JiulvRecruitmentCatalog?.getPublishedJobs?.() || []).map(job => {
    const account = hotels.find(item => item.id === job.hotelAccountId);
    const snapshot = job.conditionSnapshot;
    const registeredHotel = Boolean(window.JiulvAccountCore?.hotelComplete?.(account) && job.localPublication && snapshot && snapshot.hotelAccountId === account.id && snapshot.planId === job.planId);
    return { ...job, registeredHotel };
  });
  jobs = [...published, ...publicJobs.map(job => ({ ...job, registeredHotel: false }))];
}
const { filterJobs, toggleCompare, validIds } = window.JiulvCore;
const $ = selector => document.querySelector(selector);
const all = selector => document.querySelectorAll(selector);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const storageKey = 'jiulv:v1:';
// Published plans load after the static catalog, and a paused plan may return.
// Keep saved identities even when an opportunity is not currently displayed.
const storedFavorites = read(storageKey + 'favorites', []);
let favorites = [...new Set((Array.isArray(storedFavorites) ? storedFavorites : []).filter(id => typeof id === 'string' && id.length > 0 && id.length <= 300))];
let comparisons = [];
let currentView = 'roles';
let activeJob = null;
let toastTimer;
const jobFilters = { cities: [], groups: [], departments: [] };
let activeRegionId = '11';
let visibleLimit = 12;
const filterTitles = { cities: '城市', groups: '酒店集团', departments: '岗位部门' };
const departmentLabel = value => value === '销售' ? '市场销售' : value;
function jobBrand(job) {
  const legacy = window.JIULV_BRANDS?.[job.id];
  const group = window.JIULV_HOTEL_GROUPS?.find(g => g.id === (job.groupId || legacy?.groupId));
  const brand = group?.brands.find(b => b.id === (job.brandId || legacy?.brandId));
  return { ...brand, ...legacy, group: group?.name || legacy?.group || job.groupName || '', brand: brand?.name || legacy?.brand || job.brandName || '',
    groupId: group?.id || job.groupId, brandId: brand?.id || job.brandId,
    officialUrl: job.hotelOfficialUrl || legacy?.officialUrl || brand?.officialUrl,
    isHotelLink: Boolean(job.hotelOfficialUrl || legacy?.officialUrl) };
}
function filterOptions(key) {
  if (key === 'cities') return (window.JiulvRegions?.regions || []).flatMap(region => region.cities.map(city => [city.label, city.label]));
  if (key === 'departments') return (window.JiulvCore.DEPARTMENTS || [...new Set(jobs.flatMap(j => j.departments).map(departmentLabel))]).map(v => [v,v]);
  const groups = window.JIULV_HOTEL_GROUPS || [];
  if (key === 'groups') return (window.JiulvCore.hotelGroupOptions?.(groups) || groups).map(g => [g.id,g.name]);
  return groups.flatMap(g => g.brands).filter(b => jobs.some(j => (j.brandId || jobBrand(j).brandId) === b.id)).map(b => [b.id,b.name]);
}
function cityRegions() { return window.JiulvRegions?.regions || []; }
function cityLabel(value) { return window.JiulvRegions?.formatCity?.(value) || String(value || '').split(/[·,，/\s]+/)[0] || '城市待确认'; }
function cityPickerMarkup() {
  return `<div class="job-filter-menu city-filter-menu"><div class="city-picker"><nav class="city-provinces" aria-label="选择省级地区">${cityRegions().map(region => `<button type="button" data-city-region="${escapeHTML(region.id)}" aria-current="${region.id === activeRegionId ? 'true' : 'false'}"><span>${escapeHTML(region.label)}</span><b data-region-count="${escapeHTML(region.id)}"></b></button>`).join('')}</nav><div id="city-options" class="city-options" aria-label="选择城市"></div></div><footer class="filter-menu-actions"><button type="button" data-action="clear-city-filter">清空城市</button><button type="button" data-action="finish-job-filter">完成选择 ✓</button></footer></div>`;
}
function renderCityOptions() {
  const host = $('#city-options'); if (!host) return;
  const region = cityRegions().find(item => item.id === activeRegionId) || cityRegions()[0];
  if (!region) { host.innerHTML = '<p>城市目录暂未加载，请刷新页面。</p>'; return; }
  activeRegionId = region.id;
  host.innerHTML = `<p class="city-region-heading">${escapeHTML(region.name)}</p>${region.cities.length > 1 ? `<label class="city-select-all"><input type="checkbox" data-region-all="${escapeHTML(region.id)}"><span>全选${escapeHTML(region.label)}</span></label>` : ''}<div class="city-options-grid">${region.cities.map(city => `<label><input type="checkbox" data-job-filter="cities" value="${escapeHTML(city.label)}"><span>${escapeHTML(city.label)}</span></label>`).join('')}</div>`;
  syncCityPicker();
}
function syncCityPicker() {
  all('[data-job-filter="cities"]').forEach(input => { input.checked = jobFilters.cities.includes(input.value); });
  cityRegions().forEach(region => {
    const count = region.cities.filter(city => jobFilters.cities.includes(city.label)).length;
    const node = $(`[data-region-count="${region.id}"]`); if (node) node.textContent = count || '';
    const nav = $(`[data-city-region="${region.id}"]`); if (nav) nav.setAttribute('aria-current', String(region.id === activeRegionId));
    const checkbox = $(`[data-region-all="${region.id}"]`);
    if (checkbox) { checkbox.checked = count === region.cities.length; checkbox.indeterminate = count > 0 && count < region.cities.length; }
  });
}
function renderFilterOptions() {
  const host = $('#job-filters'); if (!host) return;
  host.innerHTML = Object.keys(jobFilters).map(key => `<details class="job-filter" data-filter-panel="${key}"><summary><span>${filterTitles[key]}</span><b data-filter-summary="${key}">不限</b><i aria-hidden="true">⌄</i></summary>${key === 'cities' ? cityPickerMarkup() : `<div class="job-filter-menu"><div>${filterOptions(key).map(([value,label]) => `<label><input type="checkbox" data-job-filter="${key}" value="${escapeHTML(value)}" ${jobFilters[key].includes(value) ? 'checked' : ''}><span>${escapeHTML(label)}</span></label>`).join('')}</div><footer class="filter-menu-actions"><button type="button" data-action="finish-job-filter">完成选择 ✓</button></footer></div>`}</details>`).join('');
  renderCityOptions();
}
function renderFilterSummary() {
  Object.keys(jobFilters).forEach(key => { const node = $(`[data-filter-summary="${key}"]`); if (node) node.textContent = jobFilters[key].length ? `已选 ${jobFilters[key].length}` : '不限'; });
  const host = $('#selected-job-filters'); if (!host) return;
  const wholeRegions = cityRegions().filter(region => region.cities.length > 1 && region.cities.every(city => jobFilters.cities.includes(city.label)));
  const covered = new Set(wholeRegions.flatMap(region => region.cities.map(city => city.label)));
  const chips = [
    ...wholeRegions.map(region => ['cities', `region:${region.id}`, `${region.label}全域`]),
    ...jobFilters.cities.filter(value => !covered.has(value)).map(value => ['cities', value, value]),
    ...['groups','departments'].flatMap(key => jobFilters[key].map(value => [key,value,filterOptions(key).find(o => o[0] === value)?.[1] || value]))
  ];
  host.innerHTML = chips.map(([key,value,label]) => `<button class="filter-chip" data-remove-filter="${key}" data-value="${escapeHTML(value)}" aria-label="移除${escapeHTML(label)}筛选">${escapeHTML(label)} <span aria-hidden="true">×</span></button>`).join('') + (chips.length ? '<button class="text-button" data-action="reset-filters">清空筛选</button>' : '');
  host.hidden = !chips.length;
}
function refreshJobs() { visibleLimit = 12; render(); }
function resetJobFilters() {
  Object.keys(jobFilters).forEach(key => jobFilters[key] = []);
  all('[data-job-filter]').forEach(input => input.checked = false);
  $('#search').value = ''; syncCityPicker(); refreshJobs();
}

function hotelBrandMark(job, extraClass = '') {
  const brand = jobBrand(job);
  const group = (window.JIULV_HOTEL_GROUPS || []).find(item => item.id === job.groupId);
  const logo = brand?.logo || group?.logo;
  return `<span class="hotel-mark brand-mark ${escapeHTML(brand?.brandId || job.id)} ${brand?.darkLogo ? 'mark-dark' : ''} ${escapeHTML(extraClass)}">${logo ? `<img src="${escapeHTML(logo)}" alt="${escapeHTML(brand.brand || group.name)}标识" loading="lazy">` : `<span>${escapeHTML(job.localPublication ? 'HOTEL' : (brand?.brand || job.english || 'HOTEL'))}</span>`}</span>`;
}
function hotelWebsite(job, label = '酒店官网 ↗', className = 'official-link') {
  const brand = jobBrand(job);
  const profileUrl = job.hotelProfile?.officialUrl || window.JiulvRecruitmentCatalog?.getHotelProfile?.(job.hotelAccountId)?.officialUrl;
  const official = profileUrl || brand?.officialUrl;
  let safeUrl = '';
  try { const parsed = new URL(official); if (['https:','http:'].includes(parsed.protocol) && !parsed.username && !parsed.password) safeUrl = parsed.href; } catch {}
  return safeUrl ? `<a class="${className}" href="${escapeHTML(safeUrl)}" target="_blank" rel="noopener noreferrer">${profileUrl || brand.isHotelLink ? label : '品牌官网 ↗'}</a>` : '';
}

function safePublicPhotos(items, limit = 5) {
  return (Array.isArray(items) ? items : []).filter(photo => /^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(photo?.dataUrl || '') && photo.dataUrl.length < 2850000).slice(0, limit);
}
function hotelIntroductionHTML(job) {
  const profile = job.hotelProfile || window.JiulvRecruitmentCatalog?.getHotelProfile?.(job.hotelAccountId);
  const photos = safePublicPhotos(profile?.photos, 6);
  return `<section class="hotel-public-home" aria-label="酒店简介"><div class="hotel-public-about"><span class="overline">MEET THE HOTEL</span><h3>酒店简介</h3>${profile?.intro ? `<p class="hotel-public-intro">${escapeHTML(profile.intro)}</p>` : '<p class="hotel-public-intro muted">酒店暂未发布简介，已公布的实习安排见下方。</p>'}${profile?.highlights ? `<div class="hotel-public-highlights"><span aria-hidden="true">✧</span><div><h4>酒店亮点与实习优势</h4><p>${escapeHTML(profile.highlights)}</p></div></div>` : ''}</div>${photos.length ? `<div class="hotel-public-gallery" tabindex="0" role="region" aria-label="酒店照片，可左右滑动">${photos.map((photo, index) => `<figure><img src="${escapeHTML(photo.dataUrl)}" alt="酒店照片 ${index + 1}：${escapeHTML(photo.name || '酒店提供的实景照片')}" loading="lazy"><figcaption>${escapeHTML(photo.name || `酒店照片 ${index + 1}`)}</figcaption></figure>`).join('')}</div>` : ''}</section>`;
}
function conditionPhotosHTML(photos, group) {
  const limits = window.JiulvRecruitmentCatalog?.CONDITION_PHOTO_LIMITS || {};
  const titles = {accommodation:'宿舍内设施照片', dormCommon:'宿舍公区设施照片', meals:'员工餐照片', commute:'通勤照片（历史信息）'};
  const items = safePublicPhotos(photos?.[group], limits[group] || 3);
  if (!items.length) return '';
  return `<section class="job-condition-photos" aria-label="${titles[group] || '实习环境照片'}"><h5>${titles[group] || '实习环境照片'}</h5><div tabindex="0" role="region" aria-label="${titles[group] || '实习环境照片'}，可左右滑动">${items.map((photo, index) => `<figure><img src="${escapeHTML(photo.dataUrl)}" alt="${titles[group] || '实习环境'} ${index + 1}：${escapeHTML(photo.name || '酒店提供')}" loading="lazy"><figcaption>${escapeHTML(photo.name || `照片 ${index + 1}`)}</figcaption></figure>`).join('')}</div></section>`;
}
function otherHotelPlansHTML(job) {
  if (!job.hotelAccountId) return '';
  const related = jobs.filter(item => item.hotelAccountId === job.hotelAccountId && item.id !== job.id && item.localPublication);
  if (!related.length) return '';
  return `<section class="hotel-public-plans"><h3>这家酒店也在找</h3><div>${related.map(item => `<button type="button" data-action="detail" data-id="${escapeHTML(item.id)}"><span><strong>${escapeHTML(item.departments?.join(' / ') || item.role)}</strong><small>${escapeHTML(item.duration)}</small></span><b aria-hidden="true">↗</b></button>`).join('')}</div></section>`;
}
const money = value => new Intl.NumberFormat('zh-CN').format(value);
const salaryText = job => !Number.isFinite(job.salaryMin) ? '津贴待确认' : job.salaryMin === job.salaryMax ? money(job.salaryMin) : `${money(job.salaryMin)}–${money(job.salaryMax)}`;
const salaryUnit = job => Number.isFinite(job.salaryMin) ? '元/月' : '';
const hasAllowancePhases = job => Array.isArray(job.allowancePhases) && job.allowancePhases.length === 2;
const phaseAmount = phase => Number.isFinite(phase.amount) ? `${money(phase.amount)} 元/月` : '待确认';
function allowanceText(job) {
  return hasAllowancePhases(job) ? job.allowancePhases.map(phase => `${phase.label}：${phaseAmount(phase)}`).join('；') : `${salaryText(job)} ${salaryUnit(job)}`.trim();
}
function allowanceCardHTML(job) {
  return hasAllowancePhases(job) ? `<div class="allowance-phases" aria-label="分阶段基础津贴">${job.allowancePhases.map(phase => `<div><span>${escapeHTML(phase.label)}</span><strong>${escapeHTML(phaseAmount(phase))}</strong></div>`).join('')}</div>` : `<p class="salary">${salaryText(job)}<small>${salaryUnit(job)}</small></p>`;
}

const unknown = value => value === '待确认';
const evidenceLabel = job => job.planId ? '酒店发布 · 本机演示' : job.evidenceStatus === '检索摘要' ? '检索线索 · 待复核' : '公开岗位 · 待确认';
function toast(message) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3300);
}
function saveLocal(key, value) {
  try { localStorage.setItem(storageKey + key, JSON.stringify(value)); return true; }
  catch { toast('当前浏览器无法保存数据，请检查隐私或存储设置。'); return false; }
}
function facts(job) {
  return [['住宿', job.dorm], ['餐食', job.meals], ['通勤', job.commute], ['轮岗', job.rotation]];
}
function card(job) {
  const saved = favorites.includes(job.id), compared = comparisons.includes(job.id);
  return `<article class="job-card" data-job="${escapeHTML(job.id)}"><div class="job-top">${hotelBrandMark(job)}<div class="job-title"><h3>${escapeHTML(job.name)}</h3><small>${escapeHTML(job.english || jobBrand(job).brand)}</small><p class="job-location">⌖ ${escapeHTML(cityLabel(job.city))}</p><div class="job-brand-line"><span>${escapeHTML(jobBrand(job).group)}</span>${hotelWebsite(job)}</div></div><button class="save-button ${saved ? 'saved' : ''}" data-action="favorite" data-id="${escapeHTML(job.id)}" aria-label="${saved ? '取消收藏' : '收藏'}${escapeHTML(job.name)}" aria-pressed="${saved}">${saved ? '♥' : '♡'}</button></div><div class="role-line"><h4>${escapeHTML(job.role)}</h4>${allowanceCardHTML(job)}</div><div class="job-tags"><span>${escapeHTML(job.duration)}</span><span>${escapeHTML(job.education)}</span>${job.departments.slice(0, 3).map(dept => `<span>${escapeHTML(departmentLabel(dept))}</span>`).join('')}</div><dl class="facts">${facts(job).map(([label, value]) => `<div class="fact"><dt>${label}</dt><dd class="${unknown(value) ? 'unknown' : ''}">${escapeHTML(value)}</dd></div>`).join('')}</dl><div class="job-card-bottom"><p class="source-status"><i></i>${evidenceLabel(job)}<br>${job.planId?'按本次发布条件展示':'未经酒店核验'}</p><div class="card-actions"><button class="compare-toggle ${compared ? 'selected' : ''}" data-action="toggle-compare" data-id="${escapeHTML(job.id)}" aria-pressed="${compared}" aria-label="${compared ? '移出对比' : '加入对比'}${escapeHTML(job.name)}">${compared ? '✓ 已加入' : '＋ 对比'}</button><button class="detail-button" data-action="detail" data-id="${escapeHTML(job.id)}">查看详情 ↗</button></div></div></article>`;
}
function emptyState(type) {
  return `<div class="empty-state"><span class="empty-icon">${type === 'favorites' ? '♡' : '⌕'}</span><h3>${type === 'favorites' ? '先留住一个感兴趣的机会' : '暂时没有符合条件的岗位'}</h3><p>${type === 'favorites' ? '点击岗位右上角的爱心，就能在这里找到它。' : '可以更换城市、酒店集团或岗位部门再看看。'}</p><button class="secondary" ${type === 'favorites' ? 'data-view="jobs"' : 'data-action="reset-filters"'}>${type === 'favorites' ? '去发现实习机会 →' : '重置筛选'}</button></div>`;
}
function render() {
  syncPublishedJobs();
  updateResumeWelcome();
  const visible = filterJobs(jobs, { ...jobFilters, query: $('#search').value });
  $('#result-count').innerHTML = `<strong>${visible.length}</strong> 个实习机会 · ${visible.filter(job => job.planId).length} 个酒店发布演示`;
  $('#job-list').innerHTML = visible.length ? visible.slice(0,visibleLimit).map(card).join('') : emptyState('jobs');
  renderFilterSummary();
  const more = $('#job-load-more'); if (more) { more.hidden = visible.length <= visibleLimit; more.textContent = `再看 ${Math.min(12,visible.length-visibleLimit)} 个机会 ↓`; }
  const progress = $('#job-page-progress'); if (progress) progress.textContent = visible.length ? `已展示 ${Math.min(visibleLimit,visible.length)} / ${visible.length} 个岗位` : '';
  const scope = $('#job-sample-scope'); if (scope) scope.textContent = `${new Set(jobs.map(j => j.city)).size} 个城市 · ${new Set(jobs.map(j => j.brandId).filter(Boolean)).size} 个品牌 · ${jobs.some(j=>j.planId)?'酒店发布与公开样本':'公开招聘样本'}`;
  const saved = jobs.filter(job => favorites.includes(job.id));
  $('#favorite-list').innerHTML = saved.length ? saved.map(card).join('') : emptyState('favorites');
  all('[data-fav-count]').forEach(element => element.textContent = favorites.length);
  $('#compare-count').textContent = comparisons.length;
  $('#compare-bar').hidden = !comparisons.length;
}
function updateResumeWelcome() {
  const api = window.JiulvDemo, account = api?.getAccount?.(), button = $('[data-resume-welcome-action]'), note = $('#resume-welcome-return');
  if (!button) return;
  const draft = account ? api.read(`resumeDraft:${account.id}`, {}) : {};
  const prepared = Boolean(draft?.savedAt && (!draft.accountId || draft.accountId === account?.id));
  button.innerHTML = `${prepared ? (draft.generatedAt ? '查看和完善我的简历' : '继续制作我的简历') : '免费制作我的简历'} <span aria-hidden="true">↗</span>`;
  const records = account ? (api.read('outreach:v5', []) || []).filter(r=>r.studentId===account.id && !r.adminHold?.active) : [];
  const waiting = records.filter(r=>['pending_student','hired'].includes(r.stage));
  const accepted = records.some(r=>r.stage==='offer_accepted');
  if (note) { note.hidden=!waiting.length&&!accepted; note.innerHTML = waiting.length ? `<button class="text-button" data-view="workflow">你有 ${waiting.length} 条邀请或录取待回应 →</button>` : accepted ? '<button class="text-button" data-view="workflow">已有录取意向，查看下一步准备 →</button>' : ''; }
}
function selectApplicationJob(id) {
  syncPublishedJobs();
  const job = jobs.find(j=>j.id===id); if(!job) return toast('这个岗位已暂停或关闭，请重新选择。');
  const api=window.JiulvDemo;
  if(!api?.save('intent:v5',{hotelId:job.hotelId||job.id,jobId:job.id,hotelName:job.name,position:job.role,planId:job.planId||null,planRevision:job.planRevision||null,conditionSnapshot:job.conditionSnapshot||null,source:'explicit',selectedAt:new Date().toISOString(),accountId:api.getAccount()?.id||null})) return;
  if($('#modal').open)$('#modal').close();
  if (window.JiulvFeatures?.resume?.applyToJob) window.JiulvFeatures.resume.applyToJob(id);
  else showView('resume');
}
function showView(view) {
  const requested = ['roles', 'jobs', 'favorites', 'community', 'academy', 'resume', 'hotel', 'contact', 'brands', 'employer', 'recruitment', 'register', 'workflow', 'library', 'buddies', 'visitors'].includes(view) ? view : 'jobs';
  const hotelWorkspaces = ['employer', 'hotel', 'workflow', 'recruitment'];
  const employerMode = ['employer', 'hotel', 'recruitment'].includes(requested) || (['register', 'workflow', 'library', 'visitors', 'contact'].includes(requested) && document.body.dataset.perspective === 'employer');
  const protectedView = employerMode && !['register', 'contact'].includes(requested);
  if (protectedView && !window.JiulvDemo?.getHotelAccount?.()) {
    [...hotelWorkspaces, 'visitors'].forEach(id => { const node = $('#' + id + '-view'); if (node) { node.hidden = true; node.replaceChildren(); } });
    if (window.JiulvFeatures?.register) window.JiulvFeatures.register.open('hotel', null, requested);
    else showView('roles');
    return;
  }
  const studentApplications = requested === 'workflow' && !employerMode;
  currentView = studentApplications ? 'resume' : requested;
  if (!['roles','register'].includes(currentView)) saveLocal('last-place', {view:studentApplications?'workflow':currentView,perspective:employerMode?'employer':'student'});
  document.body.dataset.view = currentView;
  all('.view').forEach(element => element.hidden = element.id !== `${currentView}-view`);
  document.body.dataset.perspective = employerMode ? 'employer' : 'student';
  const hideNavigation = ['roles', 'register'].includes(currentView);
  all('.student-desktop-nav,.student-mobile-nav,.student-account').forEach(element => element.hidden = employerMode || hideNavigation);
  all('.employer-desktop-nav,.employer-mobile-nav,.employer-account').forEach(element => element.hidden = !employerMode || hideNavigation);
  if (!employerMode || hideNavigation || !window.JiulvDemo?.getHotelAccount?.()) [...hotelWorkspaces, 'visitors'].forEach(id => $('#' + id + '-view')?.replaceChildren());
  const activeView = employerMode && ['visitors', 'library'].includes(currentView) ? 'recruitment' : !employerMode && ['favorites', 'visitors'].includes(currentView) ? 'resume' : !employerMode && ['brands', 'library'].includes(currentView) ? 'academy' : currentView;
  all('nav [data-view]').forEach(element => { const active = element.dataset.view === activeView; element.classList.toggle('active', active); if (active) element.setAttribute('aria-current', 'page'); else element.removeAttribute('aria-current'); });
  window.scrollTo({ top: 0, behavior: 'instant' });
  window.JiulvDemo?.updateAccount?.();
  if (studentApplications && window.JiulvFeatures?.resume?.openTab) window.JiulvFeatures.resume.openTab('applications');
  else if (currentView === 'resume' && window.JiulvFeatures?.resume?.openTab) window.JiulvFeatures.resume.openTab('profile');
  else window.JiulvFeatures?.[currentView]?.render();
  render();
  if (!['jobs', 'favorites'].includes(currentView)) $('#compare-bar').hidden = true;
}
function openModal(content, kicker) {
  $('#modal-body').innerHTML = content; $('#modal-kicker').textContent = kicker || '酒旅之星';
  if (!$('#modal').open) $('#modal').showModal();
  $('#modal').scrollTop = 0; document.body.classList.add('modal-open');
}
function showJob(id) {
  syncPublishedJobs();
  const job = jobs.find(item => item.id === id); if (!job) return;
  activeJob = id;
  const officialLink = hotelWebsite(job, '走进酒店官网 ↗');
  window.JiulvGrowth?.recordHotelView(job);
  const conditions=job.conditionSnapshot?.conditions;
  const conditionGroups = conditions ? window.JiulvRecruitmentCatalog?.conditionDisplayGroups?.(conditions) : [
    {id:'work',title:'岗位要求',rows:[['学历与专业要求',job.education],['英语要求',job.languages],['排班方式',job.schedule],['轮岗安排',job.rotation]]},
    {id:'pay',title:'津贴与保险',rows:[['已公布津贴',allowanceText(job)],['津贴说明',job.salaryNote],['发薪日期','待酒店确认'],['雇主责任险','待酒店确认'],['其他补充保险','待酒店确认']]},
    {id:'dorm',title:'宿舍与设施',rows:[['住宿安排',job.dorm],['宿舍水电费','待酒店确认'],['宿舍内与公区设施','待酒店确认']]},
    {id:'life',title:'通勤与餐食',rows:[['通勤安排',job.commute],['每日供餐安排',job.meals],['是否有清真餐','待酒店确认']]}
  ];
  const photos = conditions?.photos || {};
  const photoGroups = {dorm:['accommodation','dormCommon'], life:['meals'], commute:['commute'], meals:['meals']};
  const detailsHTML = (conditionGroups || []).map(group => `<section class="job-condition-group"><h4>${escapeHTML(group.title)}</h4><dl class="detail-grid">${group.rows.map(([label,value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value || '待确认')}</dd></div>`).join('')}</dl>${(photoGroups[group.id] || []).map(key => conditionPhotosHTML(photos, key)).join('')}</section>`).join('');
  const departmentNote = job.conditionSnapshot?.note;

  openModal(`<div class="detail-brand-heading">${hotelBrandMark(job)}<div><span class="overline">${escapeHTML(jobBrand(job).group || 'HOTEL PROFILE')}</span><h2 id="modal-title">${escapeHTML(job.name)}</h2></div></div>${officialLink ? `<div class="detail-official">${officialLink}</div>` : ''}<p class="detail-subtitle">${escapeHTML(cityLabel(job.city))}</p>${hotelIntroductionHTML(job)}<div class="hotel-public-opening"><span class="overline">YOUR INTERNSHIP</span><h3>实习信息</h3><strong>${escapeHTML(job.role)}</strong><p>${escapeHTML(job.duration)}${job.demand ? ` · 招募 ${escapeHTML(job.demand)} 人` : ''}</p>${departmentNote ? `<div class="hotel-department-note"><b>部门具体岗位说明</b><p>${escapeHTML(departmentNote)}</p></div>` : ''}</div><div class="note-box">${job.planId?`这份条件由酒店账户填写，发布版本 ${escapeHTML(job.planRevision)}。本机演示，不代表完成实地核验。`:(job.evidenceStatus==='检索摘要'?'本条依据公开检索摘要整理，信息可能滞后。':'本条来自公开岗位页面。')+'名额与条件尚未经酒店核验；多个招聘部门不等于保证轮岗。'}</div>${detailsHTML}<h3 class="modal-section-title">申请前再问清楚</h3><ul class="detail-notes">${(job.notes || []).filter(note => note !== departmentNote).map(note => `<li>${escapeHTML(note)}</li>`).join('')}<li>津贴是否有扣费、何时发放；休息日是否供餐。</li><li>具体到岗日期、名额、带教和学校实习协议安排。</li></ul>${otherHotelPlansHTML(job)}<div class="detail-footer"><button class="primary" data-action="apply-job" data-id="${escapeHTML(id)}">${window.JiulvFeatures?.resume?.hasSavedResume?.() ? '申请岗位' : '制作简历并申请这个岗位'}</button><button class="secondary" data-action="hotel-reviews" data-id="${escapeHTML(id)}">查看该酒店实习评价</button><button class="secondary" data-action="share" data-id="${escapeHTML(id)}">生成群分享文字</button></div><p class="source-line">来源：${escapeHTML(job.sourceName)} · ${escapeHTML(job.evidenceStatus || '待复核')}<br>核查编号：${escapeHTML(job.sourceId || job.id)} · 资料查看日期：${escapeHTML(job.checkedAt)}${job.planId?'；本机发布演示日期。':'；此日期不代表酒店确认日期。'}<br>本站投递仅为本机授权预览。真实代投递与酒店回应服务尚未开通。</p>`, 'INTERNSHIP DETAILS / 岗位信息');
}
function showCompare() {
  const selected = comparisons.map(id => jobs.find(job => job.id === id)).filter(Boolean);
  if (!selected.length) return toast('请先选择需要对比的岗位。');
  const rows = [['基础津贴', allowanceText], ['津贴说明', job => job.salaryNote], ['其他补贴', job => job.conditionSnapshot?.conditions?.values?.otherSubsidies || '待确认'], ['一次性奖励金', job => job.conditionSnapshot?.conditions?.values?.completionBonus || '待确认'], ['学历要求', job => job.education || '待确认'], ['英语要求', job => job.languages || '待确认'], ['最低实习时长', job => { const value = job.conditionSnapshot?.conditions?.values?.minimumDurationMonths; return value === '不限' ? '不限' : /^(?:[1-9]|1[0-2])$/.test(value || '') ? `至少${value}个月` : '待确认'; }], ['实习期限', job => job.duration], ['住宿安排', job => job.dorm], ['宿舍人数', job => job.conditionSnapshot?.conditions?.values?.dormOccupancy ? `${job.conditionSnapshot.conditions.values.dormOccupancy}人间` : '待确认'], ['宿舍水电费', job => job.conditionSnapshot?.conditions?.values?.dormUtilities || '待确认'], ['通勤', job => job.commute], ['餐食', job => job.meals], ['是否有清真餐', job => job.conditionSnapshot?.conditions?.values?.halalMeals || '待确认'], ['身高要求', job => job.conditionSnapshot?.conditions?.values?.heightRequirement || '待确认'], ['轮岗', job => job.rotation], ['工作与休息', job => job.schedule], ['学校三方协议', () => '待确认'], ['招聘状态', job => job.recruitmentStatus === 'published' ? '正在招聘 · 本机演示' : '待酒店确认']];
  openModal(`<h2 id="modal-title">把条件放在一起看</h2><p class="detail-subtitle">已选 ${selected.length} 个岗位 · 表格可左右滑动</p><div class="compare-scroll" tabindex="0" role="region" aria-label="岗位条件对比表"><table class="compare-table"><thead><tr><th scope="col">关注点</th>${selected.map(job => `<th scope="col">${escapeHTML(job.name)}</th>`).join('')}</tr></thead><tbody>${rows.map(([label, get]) => `<tr><th scope="row">${label}</th>${selected.map(job => `<td class="${unknown(get(job)) ? 'unknown' : ''}">${escapeHTML(get(job))}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="note-box">待确认的项目请向酒店询问。“提供住宿”不代表免费，“实习岗位涉及多个部门”不代表可轮岗。</div>`, 'SIDE BY SIDE / 岗位对比');
}
function intentCityOptions(regionId, selected = '') {
  const region = cityRegions().find(item => item.id === regionId);
  return '<option value="">请选择城市</option>' + (region?.cities || []).map(city => `<option value="${escapeHTML(city.label)}" ${city.label === selected ? 'selected' : ''}>${escapeHTML(city.label)}</option>`).join('');
}
function showIntent() {
  const raw = read(storageKey + 'intent', {});
  const saved = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const options = (values, selected) => values.map(value => `<option value="${escapeHTML(value)}" ${selected === value ? 'selected' : ''}>${escapeHTML(value)}</option>`).join('');
  const selectedCity = window.JiulvRegions?.findCity?.(String(saved.city || '').split(/[·,，/\s]+/)[0]);
  const selectedRegion = selectedCity?.regionId || saved.provinceId || '';
  openModal(`<h2 id="modal-title">下一站，你想怎么选？</h2><p class="detail-subtitle">先整理偏好，再找适合自己的酒店。</p><span class="local-badge">本机演示 · 不发送给酒店或平台</span><form id="intent-form" class="intent-form"><label>省 / 直辖市 / 港澳<select name="provinceId" id="intent-province"><option value="">请选择省级单位</option>${cityRegions().map(region => `<option value="${escapeHTML(region.id)}" ${region.id === selectedRegion ? 'selected' : ''}>${escapeHTML(region.name)}</option>`).join('')}</select></label><label>意向城市<select name="city" id="intent-city">${intentCityOptions(selectedRegion, selectedCity?.label)}</select></label><label>首选部门<select name="department">${options(['暂不确定', '前厅', '餐饮', '厨房', '其他'], saved.department)}</select></label><label>预计到岗月份<input type="month" name="startMonth" required value="${escapeHTML(saved.startMonth || '')}"></label><label>可实习时长<select name="duration">${options(['6个月', '3个月', '9个月', '12个月', '其他 / 待学校确认'], saved.duration)}</select></label><label>就读阶段<select name="education">${options(['高职 / 专科', '本科', '其他'], saved.education)}</select></label><label>津贴期望<select name="salary">${options(['暂不设下限', '2,500元/月以上', '2,800元/月以上', '3,000元/月以上'], saved.salary)}</select></label><label class="full">最在意的条件（选填）<textarea name="preferences" maxlength="300" placeholder="例如：希望宿舍4人间以内，有班车，希望了解轮岗安排。请勿填写手机号或证件号码。">${escapeHTML(saved.preferences || '')}</textarea></label><label class="consent full"><input name="consent" type="checkbox" required><span>我了解：这是一份本机演示意向，仅保存在此浏览器，不构成岗位申请，清除浏览器数据后可能丢失。</span></label><div class="form-actions full"><button class="primary" type="submit">保存实习意向（本机演示）</button><button class="text-button" data-action="clear-intent" type="button">清除已保存意向</button></div><div id="intent-result" class="saved-message full" hidden role="status"></div></form>`, 'YOUR NEXT STEP / 我的实习意向');
}
function showShare(id) {
  const job = jobs.find(item => item.id === id); if (!job) return;
  const platformLink = new URL(location.href); platformLink.hash = ''; platformLink.searchParams.set('job', job.id);
  const content = `【酒旅之星 · 酒店实习信息】\n${job.name}｜${job.role}\n城市：${cityLabel(job.city)}\n津贴：${allowanceText(job)}\n说明：${job.salaryNote}\n期限：${job.duration}\n住宿：${job.dorm}\n餐食：${job.meals}\n通勤：${job.commute}｜轮岗：${job.rotation}\n公开信息未经酒店核验，招聘状态及具体条件待确认。\n资料查看：${job.checkedAt}\n在酒旅之星查看：${platformLink.href}`;
  openModal(`<h2 id="modal-title">给同学分享一个机会</h2><p class="detail-subtitle">分享平台岗位卡片与信息状态，朋友可以先浏览，再决定是否投递。</p><textarea class="share-text" id="share-text" aria-label="岗位分享文字" readonly>${escapeHTML(content)}</textarea><div class="detail-footer"><button class="primary" data-action="copy-share">复制分享文字</button><button class="secondary" data-action="detail" data-id="${escapeHTML(id)}">返回岗位</button></div><p class="source-line">此操作不会自动发送微信消息。</p>`, 'SHARE AN OPPORTUNITY / 分享岗位');
}
function showGuide() {
  openModal(`<h2 id="modal-title">实习前，问清楚这 6 件事</h2><p class="detail-subtitle">面试或沟通时，记下明确的答案与确认人。</p><ol class="guide-list"><li><b>津贴怎么算、什么时候发？</b>基础津贴、加班安排、发薪日，有无住宿或其他扣费。</li><li><b>宿舍到底是什么样？</b>每间人数、距离、通勤方式、夜班交通与押金。</li><li><b>餐食怎么安排？</b>每天几餐，休息日和夜班是否供餐，有无额外费用。</li><li><b>部门和轮岗能否确认？</b>具体工作、带教人、轮岗条件与频率，避免把“可申请”当作保证。</li><li><b>工作和休息如何安排？</b>日常工时、班次、月休及调休，遇到问题找谁沟通。</li><li><b>学校手续能否配合？</b>学校审批、实习协议、保险、考核与结束实习的手续。</li></ol>`, 'ASK BEFORE YOU GO / 沟通清单');
}
document.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.selectRole) {
    document.body.dataset.perspective = button.dataset.selectRole === 'hotel' ? 'employer' : 'student';
    showView(button.dataset.selectRole === 'hotel' ? 'employer' : location.hash.startsWith('#buddy=') ? 'buddies' : 'jobs');
    if (button.dataset.selectRole === 'student' && !location.hash.startsWith('#buddy=')) {
      const id = location.href ? new URL(location.href).searchParams.get('job') : null; if (id) showJob(id);
    }
    return;
  }
  if (button.dataset.removeFilter) {
    const key = button.dataset.removeFilter;
    const value = button.dataset.value;
    const region = key === 'cities' && value.startsWith('region:') ? cityRegions().find(r => r.id === value.slice(7)) : null;
    if (jobFilters[key]) jobFilters[key] = jobFilters[key].filter(v => region ? !region.cities.some(city => city.label === v) : v !== value);
    all('[data-job-filter]').forEach(input => input.checked = jobFilters[input.dataset.jobFilter].includes(input.value));
    syncCityPicker(); refreshJobs(); return;
  }
  if (button.dataset.cityRegion) { activeRegionId = button.dataset.cityRegion; renderCityOptions(); return; }
  if (button.dataset.view) { if ($('#modal').open) $('#modal').close(); showView(button.dataset.view); return; }
  const { action, id } = button.dataset;
  if (action === 'clear-city-filter') { jobFilters.cities = []; syncCityPicker(); refreshJobs(); return; }
  if (action === 'finish-job-filter') { const panel = button.closest('details'); if (panel) { panel.open = false; panel.querySelector('summary')?.focus(); } return; }
  if (action === 'favorite') {
    const next = favorites.includes(id) ? favorites.filter(value => value !== id) : [...favorites, id];
    if (!saveLocal('favorites', next)) return;
    favorites = next; render(); toast(favorites.includes(id) ? '已收藏到本机浏览器' : '已取消收藏');
  } else if (action === 'toggle-compare') {
    const result = toggleCompare(comparisons, id);
    if (result.limited) return toast('最多对比3个岗位，请先移除一个。');
    comparisons = result.ids; render(); toast(comparisons.includes(id) ? `已加入对比（${comparisons.length}/3）` : '已从对比中移除');
  } else if (action === 'clear-compare') { comparisons = []; render(); }
  else if (action === 'compare') showCompare();
  else if (action === 'detail') showJob(id);
  else if (action === 'apply-job') selectApplicationJob(id);
  else if (action === 'hotel-reviews') { if ($('#modal').open) $('#modal').close(); window.JiulvFeatures.community?.setHotel(id); showView('community'); }
  else if (action === 'intent') showIntent();
  else if (action === 'guide') showGuide();
  else if (action === 'hotel-demo-account') openModal('<h2 id="modal-title">星湾示范酒店 · 酒店视角</h2><p class="detail-subtitle">当前是本机产品演示。候选人、需求和邀请均为虚构样例。</p><div class="note-box">正式版本需核验酒店主体和 HR 授权后登录。此处仅演示筛选与工作流程，没有真实招聘账号、联系方式或服务端权限隔离。</div><div class="ft-actions"><button class="primary" data-view="hotel">完善招聘条件</button><button class="secondary" data-view="jobs">返回学生视角</button></div>', 'HOTEL ACCOUNT / 酒店演示');
  else if (action === 'explore') document.querySelector('.job-main').scrollIntoView({behavior:'smooth',block:'start'});
  else if (action === 'share') showShare(id || activeJob);
  else if (action === 'copy-share') {
    try { await navigator.clipboard.writeText($('#share-text').value); toast('已复制，可粘贴到微信群。'); }
    catch { $('#share-text').focus(); $('#share-text').select(); toast('请长按选中文字并复制。'); }
  } else if (action === 'reset-filters') resetJobFilters();
  else if (action === 'load-more-jobs') { visibleLimit += 12; render(); }
  else if (action === 'clear-intent') {
    try { localStorage.removeItem(storageKey + 'intent'); showIntent(); toast('已清除本机保存的实习意向。'); }
    catch { toast('当前浏览器无法清除数据。'); }
  }
});
document.addEventListener('submit', event => {
  if (event.target.id !== 'intent-form') return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target)); delete data.consent;
  if (!saveLocal('intent', data)) return;
  $('#intent-result').textContent = '已保存在本机浏览器，尚未发送给酒店或平台。';
  $('#intent-result').hidden = false;
  $('#intent-result').scrollIntoView({ block: 'nearest' });
});
$('#search').addEventListener('input', refreshJobs);
document.addEventListener('change', event => {
  if (event.target.id === 'intent-province') {
    const region = cityRegions().find(item => item.id === event.target.value);
    const city = $('#intent-city'); if (city) city.innerHTML = intentCityOptions(region?.id, region?.cities.length === 1 ? region.cities[0].label : '');
    return;
  }
  const regionId = event.target.dataset?.regionAll;
  if (regionId) {
    const region = cityRegions().find(item => item.id === regionId); if (!region) return;
    const labels = region.cities.map(city => city.label);
    jobFilters.cities = event.target.checked ? [...new Set([...jobFilters.cities, ...labels])] : jobFilters.cities.filter(value => !labels.includes(value));
    syncCityPicker(); refreshJobs(); return;
  }
  const key = event.target.dataset?.jobFilter; if (!jobFilters[key]) return;
  if (key === 'cities') {
    const value = event.target.value;
    jobFilters.cities = event.target.checked ? [...new Set([...jobFilters.cities, value])] : jobFilters.cities.filter(city => city !== value);
    syncCityPicker();
  } else jobFilters[key] = Array.from(all(`[data-job-filter="${key}"]:checked`), input => input.value);
  refreshJobs();
});
document.addEventListener('toggle', event => {
  const panel = event.target; if (!panel.matches?.('.job-filter') || !panel.open) return;
  all('.job-filter').forEach(other => { if (other !== panel) other.open = false; });
}, true);
document.addEventListener('click', event => { if (!event.target.closest('.job-filter')) all('.job-filter').forEach(panel => panel.open = false); });
$('#close-modal').addEventListener('click', () => $('#modal').close());
$('#modal').addEventListener('close', () => { if (!$('#modal').open) document.body.classList.remove('modal-open'); });
$('#modal').addEventListener('click', event => { if (event.target === $('#modal')) { const rect = $('#modal').getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('#modal').close(); } });
document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); showView(currentView === 'roles' ? 'roles' : document.body.dataset.perspective === 'employer' ? 'employer' : 'jobs'); });
document.addEventListener('jiulv:accountchange', () => {
  render();
  if (document.body.dataset.perspective === 'employer' && !['roles', 'register'].includes(currentView) && !window.JiulvDemo?.getHotelAccount?.()) showView(currentView);
});
document.addEventListener('jiulv:planschange', () => { syncPublishedJobs(); renderFilterOptions(); render(); });
document.addEventListener('jiulv:outreachchange', updateResumeWelcome);
document.addEventListener('jiulv:resumechange', updateResumeWelcome);
window.addEventListener?.('storage', event => { if(!event.key || event.key.includes('accounts:v4') || event.key.includes('recruitmentPlans:') || event.key.includes('hotel:plans:') || event.key.includes('hotel:information:') || event.key.includes('plans:')) { syncPublishedJobs(); renderFilterOptions(); render(); } });
document.addEventListener('DOMContentLoaded', () => {
  syncPublishedJobs(); renderFilterOptions();
  const linkedJob = new URL(location.href).searchParams.get('job');
  if(location.hash.startsWith('#buddy=')){document.body.dataset.perspective='student';showView('buddies');return;}
  if(linkedJob){document.body.dataset.perspective='student';showView('jobs');showJob(linkedJob);return;}
  const last=read(storageKey+'last-place',null);
  if(last&&['student','employer'].includes(last.perspective)&&!['roles','register'].includes(last.view)){document.body.dataset.perspective=last.perspective;showView(last.view);}
  else showView('roles');
}, { once: true });
render();
