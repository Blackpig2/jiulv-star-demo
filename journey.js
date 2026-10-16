(function () {
  'use strict';
  const api = window.JiulvDemo, e = api.e;
  const jobs = window.JIULV_HOTEL_RESOURCES?.combineJobs?.(window.JIULV_JOBS || []) || window.JIULV_JOBS || [];
  const groups = window.JIULV_HOTEL_GROUPS || [];
  let selectedGroup = 'marriott', search = '', city = '';
  const groupById = id => groups.find(group => group.id === id);
  const brandById = id => groups.flatMap(group => group.brands).find(brand => brand.id === id);
  const count = groups.reduce((sum, group) => sum + group.brands.length, 0);
  const hotelName = job => job.hotelName || job.name;
  const uniqueHotels = list => [...new Map(list.map(job => [`${job.city || ''}:${hotelName(job)}`, job])).values()];
  const hotels = uniqueHotels(jobs);
  const hotelBrand = job => {
    const legacy = window.JIULV_BRANDS?.[job.id] || {};
    const brandId = job.brandId || legacy.brandId || job.id;
    const brand = brandById(brandId);
    const groupId = job.groupId || legacy.groupId || brand?.groupId;
    return { brandId, groupId, name: job.brandName || legacy.brand || brand?.name || '酒店', groupName: groupById(groupId)?.name || legacy.group || '' };
  };
  const cityOptions = () => [...new Set(hotels.map(job => job.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-CN')).map(value => `<option value="${e(value)}" ${city === value ? 'selected' : ''}>${e(value)}</option>`).join('');
  const categories = ['奢华与生活方式', '全服务与高端', '精选与商务', '长住与公寓', '度假与全包'];
  const overview = {
    regent: { focus: '外滩水岸 · 城市地标', note: '前厅与餐饮的具体实习安排，需要向这家酒店的 HR 确认。' },
    langham: { focus: '新天地 · 城市生活', note: '多个部门在招不代表保证轮岗。按自己的意向逐项确认条件。' },
    edition: { focus: '生活方式 · 设计体验', note: '餐饮班次、夜班供餐和末班交通，值得在投递前问清。' },
    grandhyatt: { focus: '陆家嘴 · 高层城市酒店', note: '住宿位置与轮班通勤，直接影响每天的实习生活。' },
    alila: { focus: '乌镇 · 度假目的地', note: '度假酒店还要考虑休息日出行、日常采购和宿舍设施。' }
  };
  function mark(item, kind = 'brand') {
    if (!item) return '';
    return `<span class="v5-brand-mark ${kind === 'group' ? 'v5-group-mark' : ''} ${item.darkLogo ? 'v5-mark-dark' : ''}">${item.logo ? `<img src="${e(item.logo)}" alt="${e(item.name)}${item.logoKind === 'official' ? '官方标识' : '标识'}" loading="lazy">` : `<span class="v5-wordmark" aria-label="${e(item.name)}文字名称">${e(item.english)}</span>`}</span>`;
  }
  function brandButton(brand) {
    return `<button class="v5-brand-tile" data-brand-info="${e(brand.id)}" aria-label="了解${e(brand.name)}品牌">${mark(brand)}<b>${e(brand.name)}</b><span>${e(brand.english)}</span><i aria-hidden="true">↗</i></button>`;
  }
  function brandGrid(group, brands) {
    return categories.map(category => {
      const items = brands.filter(brand => brand.category === category);
      if (!items.length) return '';
      return `<section class="v5-brand-category"><div class="v5-category-heading"><h3>${e(category)}</h3><span>${String(items.length).padStart(2, '0')}</span></div><div class="v5-brand-grid">${items.map(brandButton).join('')}</div></section>`;
    }).join('');
  }
  function renderHome() {
    const host = document.querySelector('#home-brand-marks'); if (!host) return;
    host.classList.add('v5-home-groups');
    host.innerHTML = groups.slice(0, 5).map(group => `<article class="v5-home-group"><button class="v5-home-group-head" data-group-info="${e(group.id)}" aria-label="认识${e(group.name)}">${mark(group, 'group')}<b>${e(group.name)}</b><span>认识集团 <i>↗</i></span></button><div class="v5-home-brand-row">${group.featured.map(id => brandById(id)).filter(Boolean).map(brand => `<button data-brand-info="${e(brand.id)}" aria-label="认识${e(brand.name)}">${mark(brand)}<small>${e(brand.name)}</small></button>`).join('')}</div><button class="v5-all-brands" data-group-matrix="${e(group.id)}">${group.brands.length} 个品牌入门 <span>→</span></button></article>`).join('');
    const subtitle = host.parentElement.querySelector(':scope > div:first-child > small');
    if (subtitle) subtitle.textContent = `从 5 个国际集团开始 · 图鉴收录 ${groups.length} 个集团与品牌体系`;
  }
  function hotelCards(groupId) {
    const visible = uniqueHotels(jobs.filter(job => (!groupId || hotelBrand(job).groupId === groupId) && (!city || city === job.city)));
    if (!visible.length) return `<div class="v5-atlas-empty"><b>这个集团的单体酒店资料正在整理</b><p>先从品牌官方介绍了解服务场景，具体实习安排仍需向单体酒店确认。</p><button class="secondary" data-view="jobs">看看已收录的实习酒店 →</button></div>`;
    return `<div class="atlas-grid">${visible.map(job => {
      const brand = hotelBrand(job);
      return `<article class="atlas-card atlas-${e(job.id)}"><div class="atlas-brand-stage"><button class="v5-hotel-brand-button" data-brand-info="${e(brand.brandId)}" aria-label="了解${e(brand.name)}品牌">${hotelBrandMark(job)}</button><span>${e(brand.groupName)}</span></div><div class="atlas-card-body"><span class="atlas-location">${e([window.JiulvRegions?.formatCity?.(job.city) || job.city, overview[job.id]?.focus].filter(Boolean).join(' · '))}</span><h2>${e(hotelName(job))}</h2>${job.english ? `<p class="atlas-english">${e(job.english)}</p>` : ''}<p class="atlas-note">${e(overview[job.id]?.note || '品牌定位只是起点，岗位、住宿和带教安排请向这家酒店的 HR 逐项确认。')}</p><div class="atlas-job-note"><span>${job.resourcePool ? '首批酒店资源 · 2027年调研' : '公开岗位样本 · 状态待酒店确认'}</span><b>${e(job.role)}</b></div><div class="atlas-actions">${hotelWebsite(job, '酒店官网 ↗', 'primary')}<button class="secondary" data-action="detail" data-id="${e(job.id)}">实习条件</button>${job.resourcePool ? '' : `<button class="text-button" data-action="hotel-reviews" data-id="${e(job.id)}">亲历评价 →</button>`}</div></div></article>`;
    }).join('')}</div>`;
  }
  function renderResults() {
    const target = document.querySelector('#v5-atlas-result'); if (!target) return;
    const group = groupById(selectedGroup) || groups[0];
    const query = search.trim().toLocaleLowerCase();
    const matched = query ? groups.map(g => ({ group: g, brands: g.brands.filter(brand => `${g.name} ${g.english} ${brand.name} ${brand.english}`.toLocaleLowerCase().includes(query)) })).filter(item => item.brands.length) : [{ group, brands: group.brands }];
    target.innerHTML = query ? `<div class="v5-search-summary" role="status">找到 <b>${matched.reduce((n, item) => n + item.brands.length, 0)}</b> 个品牌 · 点击查看介绍与官网</div>${matched.length ? matched.map(item => `<section class="v5-search-group"><button class="v5-search-group-name" data-group-info="${e(item.group.id)}">${e(item.group.name)} <span>认识集团 ↗</span></button>${brandGrid(item.group, item.brands)}</section>`).join('') : `<div class="v5-atlas-empty"><b>还没有找到这个名称</b><p>试试集团名称、中文品牌名或英文名，如“万豪”“凯悦”“EDITION”。</p></div>`}` : `<section class="v5-selected-group"><div class="v5-group-intro"><button class="v5-group-identity" data-group-info="${e(group.id)}">${mark(group, 'group')}<span><b>${e(group.name)}</b><small>${e(group.english)}</small></span><i>↗</i></button><p>${e(group.intro)}</p><div class="v5-group-foot"><span>${group.brands.length} 个代表品牌</span><a href="${e(group.officialUrl)}" target="_blank" rel="noopener noreferrer">集团官网 ↗</a></div></div><aside class="v5-atlas-tip"><span>给第一次认识酒店的你</span><h2>集团 → 品牌 → 酒店 → 岗位</h2><p>${e(group.focus)}</p><small>品牌定位不代表实习待遇。同品牌不同酒店，也要单独比较津贴、住宿与带教。</small></aside></section><div class="v5-matrix-header"><h2>品牌矩阵</h2><span>点击品牌，认识它的服务与风格</span></div>${brandGrid(group, group.brands)}<div class="v5-sample-heading"><div><span class="overline">FROM BRAND TO YOUR EVERYDAY</span><h2>再走进具体酒店</h2></div><label>城市<select id="atlas-city"><option value="">全部城市</option>${cityOptions()}</select></label></div>${hotelCards(group.id)}`;
  }
  function render() {
    const target = document.querySelector('#brands-view'); if (!target) return;
    target.innerHTML = `<div class="v5-atlas-breadcrumb"><button data-view="academy">← 返回实习百科</button><span>认识酒店 / 酒店图鉴</span></div><div class="v5-atlas-hero"><div><span class="overline">THE HOTEL FIELD GUIDE / 酒店图鉴</span><h1>从一个标识，<br>认识一种酒店生活。</h1><p>先认识集团与品牌，再把目光落到你的岗位、同事与日常。</p><div class="v5-atlas-counts"><span><b>${groups.length}</b> 个精选集团</span><span><b>${count}</b> 个代表品牌</span><span><b>${String(hotels.length).padStart(2, '0')}</b> 家酒店样本</span></div></div><div class="v5-atlas-orbit" aria-hidden="true"><span>GROUP</span><b>✧</b><span>BRAND · HOTEL · YOU</span></div></div><div class="v5-atlas-navigation"><label class="v5-atlas-search"><span aria-hidden="true">⌕</span><input id="brand-search" type="search" value="${e(search)}" placeholder="搜索集团、品牌中文名或英文名" aria-label="搜索酒店集团与品牌"></label><p>精选国内外常见集团，按实习认知场景编排，不作规模或雇主排名。</p></div><div class="v5-group-rail" role="group" aria-label="选择酒店集团">${groups.map(group => `<button data-group-select="${e(group.id)}" class="${selectedGroup === group.id ? 'active' : ''}" aria-pressed="${selectedGroup === group.id}">${mark(group, 'group')}<span>${e(group.name)}</span></button>`).join('')}</div><div id="v5-atlas-result"></div><p class="v5-atlas-source">目录更新：2026-10-16 · 品牌分组为入门阅读编排，非官方等级评定。标识仅用于品牌识别，不表示合作或背书；缺少可用原始标识时显示文字名称。各品牌详情附官方来源。</p>`;
    renderResults();
  }
  function groupModal(id) {
    const group = groupById(id); if (!group) return;
    api.modal(`<div class="v5-profile-head">${mark(group, 'group')}<span class="overline">HOTEL GROUP / 集团入门</span><h2 id="modal-title">${e(group.name)}</h2><p>${e(group.english)}</p></div><p class="v5-profile-intro">${e(group.intro)}</p><div class="v5-profile-note"><b>从实习生视角了解</b><p>${e(group.focus)}</p><p>集团提供品牌体系，但具体招聘、津贴、宿舍和带教安排，要向所投酒店确认。</p></div><h3 class="modal-section-title">从这些品牌开始认识</h3><div class="v5-modal-brand-grid">${group.brands.slice(0, 6).map(brandButton).join('')}</div><div class="ft-actions"><a class="primary" href="${e(group.officialUrl)}" target="_blank" rel="noopener noreferrer">访问集团官网 ↗</a><button class="secondary" data-group-matrix="${e(group.id)}">查看 ${group.brands.length} 个品牌矩阵 →</button></div><p class="source-line">公开资料整理，不代表集团入驻。<a href="${e(group.sourceUrl)}" target="_blank" rel="noopener noreferrer">查看官方品牌来源 ↗</a> · ${e(group.verifiedAt || '2026-09-28')}</p>`, 'GROUP PROFILE / 集团介绍');
  }
  function brandModal(id) {
    const brand = brandById(id); if (!brand) return;
    const group = groupById(brand.groupId), examples = uniqueHotels(jobs.filter(job => hotelBrand(job).brandId === id));
    const tips = brand.category === '度假与全包' ? ['度假目的地的休息日出行、生活采购是否方便？', '旺淡季安排、接待客群及语言要求是什么？'] : brand.category === '长住与公寓' ? ['长住客人的服务流程与普通客房有哪些差别？', '前厅、客房和餐饮是否分岗，具体由谁带教？'] : ['你申请的部门每天有哪些具体工作？', '是否安排带教、轮岗以及阶段反馈？'];
    api.modal(`<div class="v5-profile-head">${mark(brand)}<button class="v5-parent-link" data-group-info="${e(group.id)}">${e(group.name)} ↗</button><h2 id="modal-title">${e(brand.name)}</h2><p>${e(brand.english)}</p></div><span class="v5-profile-category">${e(brand.category)}</span><p class="v5-profile-intro">${e(brand.intro)}</p>${id === 'urcove' ? '<p class="ft-notice">逸扉由凯悦与首旅如家共同打造；这里展示品牌关系，不代表单一全资归属。</p>' : ''}<div class="v5-profile-note"><b>了解品牌之后，再问这家酒店</b><ul>${tips.map(tip => `<li>${e(tip)}</li>`).join('')}<li>津贴、发薪日、住宿和班次，是否已写入实习条件？</li></ul><p>这些是沟通建议，不是该品牌对实习生的统一承诺。</p></div>${examples.length ? `<h3 class="modal-section-title">已收录的单体酒店样本</h3><div class="v5-profile-examples">${examples.map(job => `<button data-action="detail" data-id="${e(job.id)}"><b>${e(hotelName(job))}</b><span>${e(job.city)} · 查看实习条件 →</span></button>`).join('')}</div>` : '<p class="ft-muted">该品牌的单体酒店岗位资料正在整理，可先访问官网了解酒店分布与环境。</p>'}<div class="ft-actions"><a class="primary" href="${e(brand.officialUrl)}" target="_blank" rel="noopener noreferrer">${brand.officialUrl === brand.sourceUrl ? '官方品牌介绍' : '访问品牌官网'} ↗</a><button class="secondary" data-group-matrix="${e(group.id)}">返回集团品牌矩阵</button></div><p class="source-line">品牌归属与简介参考：<a href="${e(brand.sourceUrl)}" target="_blank" rel="noopener noreferrer">集团官方资料 ↗</a> · 核对于 ${e(brand.verifiedAt || group.verifiedAt || '2026-09-28')}<br>官网展示主要面向宾客；员工住宿与实习条件请向单体酒店确认。</p>`, 'BRAND PROFILE / 品牌介绍');
  }
  document.addEventListener('input', event => { if (event.target.id === 'brand-search') { search = event.target.value; renderResults(); } });
  document.addEventListener('click', event => {
    const groupInfo = event.target.closest('[data-group-info]'), brandInfo = event.target.closest('[data-brand-info]'), select = event.target.closest('[data-group-select]'), matrix = event.target.closest('[data-group-matrix]');
    if (groupInfo) groupModal(groupInfo.dataset.groupInfo);
    if (brandInfo) brandModal(brandInfo.dataset.brandInfo);
    if (select) { selectedGroup = select.dataset.groupSelect; search = ''; render(); }
    if (matrix) { selectedGroup = matrix.dataset.groupMatrix; search = ''; document.querySelector('#modal')?.close(); api.showView('brands'); }
  });
  function cohortHTML() {
    return `<section class="cohort-banner"><div class="cohort-symbol" aria-hidden="true"><span>你</span><span>我</span><span>他</span></div><div><span class="overline">BETTER TOGETHER</span><h2>一起出发，也要各自选明白。</h2><p>和同学整理候选酒店与到岗时间，再向 HR 确认同批次名额、宿舍和各自岗位。</p></div><button class="primary" data-journey-action="cohort">制作同伴沟通单 ↗</button></section>`;
  }
  function cohortForm() {
    if (window.JiulvFeatures.buddies?.open) return window.JiulvFeatures.buddies.open();
    const draft = api.read('cohort:draft', {});
    api.modal(`<h2 id="modal-title">和同学共享一份沟通单</h2><p class="detail-subtitle">只整理计划，不公开同学身份，也不代表酒店预留名额。</p><form id="cohort-form" class="ft-form"><label class="ft-field">预计到岗月份<input name="month" type="month" required value="${e(draft.month || '')}"></label><label class="ft-field">同行意向人数<input name="count" type="number" min="2" max="50" required value="${e(draft.count || 2)}"></label><fieldset><legend>考虑的酒店（最多 3 家）</legend><div class="cohort-hotels">${jobs.map(job => `<label class="ft-consent"><input type="checkbox" name="hotels" value="${e(job.id)}" ${Array.isArray(draft.hotels) && draft.hotels.includes(job.id) ? 'checked' : ''}><span>${e(job.name)}</span></label>`).join('')}</div></fieldset><label class="ft-field ft-full">优先确认的问题<textarea name="notes" maxlength="500" placeholder="例如：是否能同期到岗、不同部门的名额、宿舍能否自主申请同住。不要填写同学的联系方式。">${e(draft.notes || '')}</textarea></label><p class="ft-muted ft-full">同伴意向不能替代本人投递授权，酒店也不能保证同岗位、同宿舍或同时录用。</p><button class="primary ft-full" type="submit">生成沟通单并保存本机草稿</button></form>`, 'GO TOGETHER / 同伴计划');
  }
  document.addEventListener('change', event => { if (event.target.id === 'atlas-city') { city = event.target.value; render(); } });
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-journey-action]'); if (!button) return;
    if (button.dataset.journeyAction === 'cohort') cohortForm();
    if (button.dataset.journeyAction === 'copy-cohort') {
      const field = document.querySelector('#cohort-share');
      try { await navigator.clipboard.writeText(field.value); api.toast('已复制沟通单，可自行发给同学或 HR。'); }
      catch { field.focus(); field.select(); api.toast('请长按选中文字并复制。'); }
    }
  });
  document.addEventListener('submit', event => {
    if (event.target.id !== 'cohort-form') return;
    event.preventDefault(); if (!event.target.reportValidity()) return;
    const data = new FormData(event.target), selected = jobs.filter(job => data.getAll('hotels').includes(job.id));
    if (!selected.length || selected.length > 3) return api.toast('请选择 1–3 家酒店，方便逐一比较。');
    const draft = { month: data.get('month'), count: Number(data.get('count')), hotels: selected.map(job => job.id), notes: String(data.get('notes') || '').trim() };
    if (!api.save('cohort:draft', draft)) return;
    const content = `【酒旅之星 · 同伴实习沟通单】\n预计到岗：${draft.month}｜意向同行：${draft.count} 人\n这是一份未确认的意向清单，每个人分别选择岗位并授权投递。\n\n${selected.map(job => `${job.name}\n岗位参考：${job.role}\n酒店官网：${window.JIULV_BRANDS?.[job.id]?.officialUrl || '待补充'}\n本站岗位编号：${job.sourceId || job.id}`).join('\n\n')}\n\n一起问清楚：\n□ 当前岗位与同期名额各有多少？\n□ 每人的实习起止日期是否都符合要求？\n□ 宿舍人数、位置及同住申请怎么安排？\n□ 每人的津贴、班次、带教和保险如何确认？\n□ 学校手续与面试安排是否能分别配合？\n${draft.notes ? `其他问题：${draft.notes}\n` : ''}\n所有招聘与住宿安排均待酒店确认，不表示保证同期、同岗、同宿舍或录用。`;
    api.modal(`<h2 id="modal-title">把问题带齐，再一起决定</h2><p class="detail-subtitle">已保存本机草稿。复制后可自行分享，不会自动发送或收集同伴资料。</p><textarea id="cohort-share" class="share-text" aria-label="同伴实习沟通单" readonly>${e(content)}</textarea><div class="ft-actions"><button class="primary" data-journey-action="copy-cohort">复制沟通单</button><button class="secondary" data-journey-action="cohort">返回编辑</button></div>`, 'YOUR SHARED CHECKLIST / 沟通单');
  });
  window.JiulvFeatures.brands = { render, renderHome, groupModal, brandModal };
  window.JiulvFeatures.cohort = { html: cohortHTML };
  renderHome();
})();
