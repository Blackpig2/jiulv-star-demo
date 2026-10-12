/* 酒旅之星材料库：公开资源 + 本机收藏；不收集学生材料。 */
(() => {
  'use strict';
  const VERIFIED = '2026-09-28';
  const MOE = 'https://www.moe.gov.cn/srcsite/A07/moe_737/s3876_qt/202201/t20220121_595529.html';
  const UG = 'https://www.moe.gov.cn/srcsite/A08/s7056/201907/t20190724_392130.html';
  const audiences = ['全部', '高职 / 高职专科', '高职本科', '普通本科', '专科类型待确认'];
  const types = ['全部', '政府文件', '协议样本', '学校申请', '平台清单'];
  const vocational = ['高职 / 高职专科', '高职本科'];
  const common = ['高职 / 高职专科', '高职本科', '普通本科', '专科类型待确认'];
  const resources = [
    {
      id: 'practical-agreement', title: '酒店实习协议与条件附件 · 实践参考稿', type: '协议样本', origin: '平台参考版', agency: '酒旅之星编辑整理', audiences: common,
      scope: '供学生、酒店与学校共同完善具体实习条件；职业学校使用时作为完整官方三方协议的补充附件。', date: '平台版本：2026-09-28', format: '可编辑 HTML · 可打印',
      summary: '把岗位、首末月津贴、发薪日、住宿、保险、调岗与结束手续写进一份完整的条件附件。',
      purpose: '从到岗、实习中到结束逐项确认，并记录学校、酒店和学生的分工。支持本机填写、下载填写版及打印。',
      boundary: '参考真实酒店协议的问题结构重新编写，未保留任何原协议个人资料或单店条款。不是官方示范文本、酒店正式协议或在线签约。职业学校须保留完整官方主协议；其他实习按学校认可文本办理。',
      tips: ['先确认实习类型和主协议，填入实际签约主体。', '关键金额、日期、险种与流程逐项填写，未确认事项不留作默认同意。', '向学校与酒店核对一致后，按适用程序签署并保留完整附件。'],
      file: 'resources/hotel-internship-agreement.html', featured: true
    },
    {
      id: 'tripartite', title: '岗位实习三方协议 · 教育部示范文本', type: '协议样本', origin: '政府官方原件', agency: '教育部、国家市场监督管理总局', audiences: vocational,
      scope: '按人才培养方案参加岗位实习的职业学校学生，含高职专科、高职本科；不直接泛用于普通本科。', date: '文件版本：2021年12月；通知发布：2022-01-21', format: 'DOCX · 36 KB',
      summary: '完整保留教育部通知的附件2。先交学校确认采用文本、审批及签署顺序。',
      purpose: '了解学校、实习单位、学生三方的约定事项，核对岗位、时间、报酬、食宿、保险和考核安排。',
      boundary: '这是岗位实习协议示范文本，与毕业就业三方协议用途不同。正式使用须经学校确认，并按适用规定和实际情况完成审查；下载或签字本身不代表学校已批准，也不作效力判断。',
      tips: ['对照学校提供的正式版本，不自行删去看不懂的条款。', '请学校与酒店确认签约主体、盖章流程及附件。', '完整原件包含说明、协议及相关附件，请一并阅读。'],
      source: MOE, original: 'https://www.moe.gov.cn/srcsite/A07/moe_737/s3876_qt/202201/W020220121333592547806.docx', file: 'resources/moe-vocational-tripartite-model-2021.docx', featured: true
    },
    {
      id: 'voc-rules', title: '职业学校学生实习管理规定', type: '政府文件', origin: '政府官方原件', agency: '教育部等八部门', audiences: vocational,
      scope: '实施全日制学历教育的中职、高职专科、高职本科学校学生，依人才培养方案参加的实习。', date: '文件署期：2021-12-31；通知发布：2022-01-21', format: 'DOCX · 35 KB',
      summary: '先确认适用范围，再查自主选择实习单位、协议、指导与安全保障要求。',
      purpose: '把学校批准、单位条件与过程管理纳入自主寻找酒店的准备流程。',
      boundary: '“自己找到酒店”并不等于可以跳过学校审核。不同实习类型和具体安排仍需学校确认；本页不替学校批准酒店或实习计划。',
      tips: ['先读第二条的适用范围和实习定义。', '核对自主选择岗位实习单位的申请与学校审核要求。', '保险可结合第三十五、三十六条向学校和酒店核查凭证。'], source: MOE,
      original: 'https://www.moe.gov.cn/srcsite/A07/moe_737/s3876_qt/202201/W020231218539873596108.docx', file: 'resources/moe-vocational-internship-rules-2021.docx'
    },
    {
      id: 'ug-rules', title: '普通本科高校实习管理工作意见', type: '政府文件', origin: '政府官方文件', agency: '教育部', audiences: ['普通本科'],
      scope: '普通本科高校实习教学管理；不是所有在校生统一适用的岗位实习协议模板。', date: '文件署期：2019-07-10；教高函〔2019〕12号', format: '官方网页',
      summary: '了解普通本科集中与分散实习、方案、过程指导及学校管理要求。', purpose: '向院系确认本人是否可以自主选择酒店，以及分散实习的审批材料、指导和考核。',
      boundary: '意见允许高校结合专业特点安排有关分散实习，并要求审核和管理；不表示每位学生均自动获得自主实习资格。具体以本校当前培养方案和通知为准。',
      tips: ['先问本校是否允许本人这一阶段分散实习。', '确认酒店资质、实习内容由谁审核。', '确认保险安排、指导老师和实习成果如何提交。'], source: UG
    },
    {
      id: 'shanghai-rules', title: '上海职业学校实习管理落实通知', type: '政府文件', origin: '政府官方文件', agency: '上海市教育委员会等八部门', audiences: vocational,
      scope: '上海职业学校实习管理相关工作；外省学生到上海酒店实习还需核对本校及相关地区要求。', date: '页面发布：2022-10-12', format: '官方网页',
      summary: '查看上海地方落实要求，并与学校当前通知配套核对。', purpose: '帮助学校、酒店和学生找到上海实习管理的地方文件入口。',
      boundary: '酒店位于上海不意味着本人的学校手续全部改按上海学校处理。跨省安排的流程应交学校确认。',
      tips: ['把学校所在地和酒店所在地同时告诉指导老师。', '请学校核对备案、指导与问题反映渠道。'], source: 'https://edu.sh.gov.cn/zyjy_zjxx/20221014/05d4e56306704177accb8c4d673e0495.html'
    },
    {
      id: 'school-agreement', title: '学校公开样本：岗位实习三方协议', type: '协议样本', origin: '学校官方公开', agency: '珠海城市职业技术学院教务处', audiences: vocational,
      scope: '该校公开的实践用表；其他学校学生仅参考格式与事项，正式文本由本人学校确认。', date: '页面发布：2026-01-13', format: '学校网页',
      summary: '查看学校如何公开三方协议及相关附件，辨认甲方学校、乙方单位、丙方学生。', purpose: '与本人学校索取的版本对照，理解实际学校用表和政府示范文本的关系。',
      boundary: '该页面并非全国统一的“2026新版”。页面发布日期与文本版本日期不同，不应据此替换教育部原件或本校文本。',
      tips: ['仅参考栏目，不将其他学校名称直接改成自己学校后签署。', '向本校教务处或院系索取本学年认可的完整协议。'], source: 'https://dept.zhcpt.edu.cn/jwc/info/2049/13631.htm'
    },
    {
      id: 'school-application', title: '本科自主实习申请 · 学校案例', type: '学校申请', origin: '学校官方公开', agency: '西安外国语大学旅游学院', audiences: ['普通本科'],
      scope: '该院2025年实习通知，涉及2022级旅游管理与酒店管理等学生；历史案例，不是当前全体学生要求。', date: '页面发布：2024-12-25；适用学年见原文', format: '学校网页及原附件',
      summary: '原通知附自主实习申请表 PDF、实习协议及实习手册。', purpose: '认识自主申请可能涉及的接收函、单位资质、协议和校内审核顺序，再向本校确认。',
      boundary: '原通知有特定年级和时间安排。其截止日、家长材料、模板和流程不得直接套用到其他学校或本学年。',
      tips: ['打开原文底部的附件3自主实习申请表。', '对照本校要求整理单位接收证明、岗位说明和实习计划。', '正式申请使用本人学校当前发布的表格。'], source: 'https://lyxy.xisu.edu.cn/info/1133/12526.htm'
    },
    {
      id: 'conditions', title: '实习条件确认单', type: '平台清单', origin: '平台参考版', agency: '酒旅之星编辑整理', audiences: common, scope: '不同学制均可用作沟通准备；不是协议、承诺书或审批文件。', date: '平台版本：2026-09-26', format: '可编辑 HTML',
      summary: '把津贴、班次、食宿、通勤、轮岗与保险问成具体答案。', purpose: '在面试和接受实习意向前，记录已确认条件与待核实事项。', boundary: '这张表仅辅助双方沟通，不代替学校认可协议，也不对费用、工时或保险作适用结论。',
      tips: ['记录答复日期及角色，保留书面确认渠道。', '没有明确答案的项目保留“待确认”。'], file: 'resources/internship-conditions.html'
    },
    {
      id: 'application', title: '自主实习申请准备清单', type: '平台清单', origin: '平台参考版', agency: '酒旅之星编辑整理', audiences: common, scope: '拟自主联系酒店的学生；逐项询问本校，勾选不表示审批通过。', date: '平台版本：2026-09-26', format: '可编辑 HTML',
      summary: '先问允许范围，再准备单位资料、学习计划、学校表格和材料时间线。', purpose: '把学校要求拆成可执行的准备事项，避免先到岗后补手续。', boundary: '不同学校和学生类型的要求不同，表中的“询问是否需要”不代表全国强制材料。',
      tips: ['先确认院系当前实习通知与指导老师。', '先问材料用途、接收渠道和截止时间，再准备个人资料。'], file: 'resources/self-placement-checklist.html'
    },
    {
      id: 'interview', title: '酒店实习面试记录表', type: '平台清单', origin: '平台参考版', agency: '酒旅之星编辑整理', audiences: common, scope: '学生与酒店面试沟通参考；记录自己的决定，不替另一方表态。', date: '平台版本：2026-09-26', format: '可编辑 HTML',
      summary: '准备岗位经历、面试问题，并把双方反馈、后续时间和录用意向分开记录。', purpose: '面试前整理真实经历，面试后明确待确认事项、下一步和反馈日期。', boundary: '填写“双方愿意继续”不等于正式录用、学校批准或已签实习协议。此表不录音、不上传、不发送。',
      tips: ['前厅准备服务沟通实例，餐饮准备高峰协作实例。', '需要视频面试时，由双方确认时间及可信会议链接。'], file: 'resources/interview-record.html'
    },
    {
      id: 'insurance', title: '实习保险问询记录单', type: '平台清单', origin: '平台参考版', agency: '酒旅之星编辑整理', audiences: common, scope: '沟通清单适合不同学制；所附职业学校政策依据仅按其适用范围理解。', date: '平台版本：2026-09-26', format: '可编辑 HTML',
      summary: '问清险种、个人覆盖、保障期间、凭证、场景条款与报案联系人。', purpose: '把“有保险”进一步核对到本人、期间、岗位和具体凭证。', boundary: '雇主责任险、实习责任保险、补充医疗等名称本身不足以确认个人保障。本表不认定劳动关系、险种替代关系或必赔结果。',
      tips: ['酒店若称提供雇主责任险，请确认本岗位实习生是否列入保障范围，并提供凭证和条款。', '通勤、宿舍、餐厅滑倒等情形，交投保方或承保机构按条款说明。'], file: 'resources/insurance-questions.html', reference: MOE
    },
    {
      id: 'arrival', title: '酒店入职材料与到岗核对表', type: '平台清单', origin: '平台参考版', agency: '酒旅之星编辑整理', audiences: common, scope: '拟到岗学生的准备工具；实际材料由学校和酒店确认必要性。', date: '平台版本：2026-09-26', format: '可编辑 HTML',
      summary: '学校材料、酒店材料、报到安排与个人保留副本分开核对。', purpose: '确认提交方、用途、渠道与截止时间，记录报到地点、宿舍和带教安排。', boundary: '不是统一体检或证件清单。不要在本演示页上传身份证、银行卡、病历或真实学生证明。',
      tips: ['证件等只交已核实且必要的接收渠道。', '以学校和酒店确认的要求为准，无法理解的材料先问用途。'], file: 'resources/arrival-materials.html'
    }
  ];
  const D = () => window.JiulvDemo;
  const e = value => D().e(value);
  let query = '', type = '全部', audience = '全部', onlySaved = false;
  const ids = new Set(resources.map(r => r.id));
  function saved() {
    const value = D().read('library', {});
    return Array.isArray(value?.saved) ? [...new Set(value.saved.filter(id => ids.has(id)))] : [];
  }
  function matches(r) {
    const term = query.trim().toLocaleLowerCase();
    return (type === '全部' || r.type === type) && (audience === '全部' || audience === '专科类型待确认' || r.audiences.includes(audience)) && (!onlySaved || saved().includes(r.id)) && (!term || [r.title, r.summary, r.agency, r.scope, r.type, ...r.tips].join(' ').toLocaleLowerCase().includes(term));
  }
  function links(r) {
    const file = r.file ? `<a class="primary" href="${e(r.file)}" ${r.file.endsWith('.html') ? 'target="_blank" rel="noopener"' : 'download'}>${r.file.endsWith('.html') ? (r.type === '协议样本' ? '打开填写协议参考稿 ↗' : '打开编辑参考表 ↗') : '下载官方原件 ↓'}</a>` : '';
    const download = r.file?.endsWith('.html') ? `<a class="secondary" href="${e(r.file)}" download>下载空白 HTML</a>` : '';
    const source = r.source ? `<a class="secondary" href="${e(r.source)}" target="_blank" rel="noopener noreferrer">${r.origin.startsWith('学校') ? '学校原文 / 附件 ↗' : '官方原文 ↗'}</a>` : '';
    return `<div class="library-resource-links">${file}${download}${source}</div>`;
  }
  function card(r) {
    const selected = saved().includes(r.id);
    return `<article class="library-card ${r.featured ? 'library-card-featured' : ''}"><div class="library-card-top"><span class="library-origin ${r.origin === '平台参考版' ? 'library-origin-editor' : ''}">${e(r.origin)}</span><button class="library-save" data-library-action="save" data-library-id="${e(r.id)}" aria-label="${selected ? '取消收藏' : '收藏'}${e(r.title)}" aria-pressed="${selected}">${selected ? '★' : '☆'}</button></div><p class="library-format">${e(r.type)} · ${e(r.format)}</p><h3><button data-library-action="details" data-library-id="${e(r.id)}">${e(r.title)}</button></h3><p class="library-summary">${e(r.summary)}</p><p class="library-scope"><strong>适用对象</strong>${e(r.scope)}</p><p class="library-purpose"><strong>用途</strong>${e(r.purpose)}</p><div class="library-provenance"><span>${e(r.agency)}</span><small>${e(r.date)}<br>核验 / 整理：${VERIFIED}</small></div>${links(r)}<button class="library-detail" data-library-action="details" data-library-id="${e(r.id)}">使用前须知与来源 →</button></article>`;
  }
  function renderResults() {
    const root = document.querySelector('#library-results');
    if (!root) return;
    const visible = resources.filter(matches);
    root.innerHTML = visible.length ? visible.map(card).join('') : '<div class="library-empty"><h3>没有找到这类材料</h3><p>试试“协议”“保险”或取消筛选。</p><button class="secondary" data-library-action="reset">查看全部资源</button></div>';
    document.querySelector('#library-count').textContent = `${visible.length} 份资源${onlySaved ? ' · 我的收藏' : ''}`;
    const note = document.querySelector('#library-scope-note');
    note.textContent = audience === '专科类型待确认' ? '先向学校确认是否属于高职专科及本次实习性质。这里保留全部材料供比较，不因“专科”二字自动套用某套制度。' : '高职本科与普通本科分开查看；跨校样本用于理解流程，正式材料以本人学校认可文本为准。';
  }
  function render() {
    const root = document.querySelector('#library-view');
    if (!root || !D()) return;
    const hotel = document.body.dataset.perspective === 'employer';
    root.innerHTML = `<div class="library-page"><button class="text-button section-back" data-view="${hotel ? 'recruitment' : 'academy'}">← 返回${hotel ? '我的招聘' : '实习百科'}</button><header class="ft-header library-header"><div><p class="library-eyebrow">BEFORE YOU BEGIN</p><h1>实习材料库</h1><p>找对文件，再把准备做完整。</p></div><span class="library-open-tag">学生 · 酒店均可查阅</span></header><section class="library-hero"><div><span class="library-hero-label">自主寻找酒店，从这里开始</span><h2>把承诺写具体，<br>让实习有据可查。</h2><p>新增可填写的酒店实习协议与条件附件。保留官方三方原件，帮助学生、酒店与学校逐项确认。</p><button data-library-action="details" data-library-id="practical-agreement">打开实习协议实践参考稿 <span>↗</span></button></div><div class="library-hero-art" aria-hidden="true"><span>DOCS</span><div>01 <b>确认学校要求</b></div><div>02 <b>核对酒店条件</b></div><div>03 <b>准备认可材料</b></div></div></section><section class="library-quick-guide" aria-label="选择材料前的提醒"><div><b>01 · 先辨实习类型</b><p>高职专科、高职本科与普通本科的文件入口分开；仅有“大专”称呼时先问学校。</p></div><div><b>02 · 两种三方别混淆</b><p>岗位实习三方协议用于实习安排；毕业就业协议用途不同，不能只看“三方”二字。</p></div><div><b>03 · 正式版本找学校</b><p>清单不替代审批和协议。自行联系酒店，也先确认学校是否同意与如何指导。</p></div></section><section class="library-browser"><div class="library-heading"><h2>需要哪一份材料？</h2><span id="library-count" role="status" aria-live="polite"></span></div><div class="library-filter-row"><label class="library-search"><span aria-hidden="true">⌕</span><input id="library-search" type="search" maxlength="100" value="${e(query)}" placeholder="搜索协议、申请、保险、面试……" aria-label="搜索实习材料"></label><label class="library-audience"><span>我的学校类型</span><select id="library-audience">${audiences.map(a => `<option ${a === audience ? 'selected' : ''}>${e(a)}</option>`).join('')}</select></label></div><div class="library-filters" aria-label="资源类型">${types.map(t => `<button data-library-action="type" data-library-type="${e(t)}" class="library-chip ${type === t ? 'active' : ''}" aria-pressed="${type === t}">${e(t)}</button>`).join('')}<button data-library-action="saved-filter" class="library-chip ${onlySaved ? 'active' : ''}" aria-pressed="${onlySaved}">☆ 收藏 <span id="library-saved-count">${saved().length}</span></button></div><p id="library-scope-note" class="library-scope-note"></p><div id="library-results" class="library-grid"></div></section><footer class="library-footer"><p>公开查阅无需账号 · 收藏仅保存在当前浏览器 · 参考表可在本机编辑、下载或打印</p><p>本页不接收学生资料、不提交学校申请、不认定协议效力或个人保险保障。官方文件以原文和本人适用条件为准。核验日期：${VERIFIED}。</p></footer></div>`;
    renderResults();
  }
  function details(id) {
    const r = resources.find(item => item.id === id);
    if (!r) return;
    D().modal(`<article class="library-reader"><span class="library-origin ${r.origin === '平台参考版' ? 'library-origin-editor' : ''}">${e(r.origin)}</span><h2 id="modal-title">${e(r.title)}</h2><p class="library-reader-intro">${e(r.summary)}</p><dl><dt>来源机构</dt><dd>${e(r.agency)}</dd><dt>适用对象</dt><dd>${e(r.scope)}</dd><dt>版本与核验</dt><dd>${e(r.date)}<br>本库核验 / 整理：${VERIFIED}</dd><dt>用途</dt><dd>${e(r.purpose)}</dd></dl><aside class="library-boundary"><strong>使用前先确认</strong><p>${e(r.boundary)}</p></aside><h3>建议这样使用</h3><ul>${r.tips.map(t => `<li>${e(t)}</li>`).join('')}</ul>${links(r)}${r.original ? `<p class="library-direct-source"><a href="${e(r.original)}" target="_blank" rel="noopener noreferrer">教育部服务器上的原附件 ↗</a><br>本机下载件保留官方原文件，未改写、重排或加入平台标记。</p>` : ''}${r.reference ? `<p class="library-direct-source">政策参考：<a href="${e(r.reference)}" target="_blank" rel="noopener noreferrer">职业学校实习管理规定官方通知 ↗</a>；仅按其适用范围理解。</p>` : ''}${r.origin === '平台参考版' ? '<p class="library-direct-source">平台参考版由酒旅之星编辑整理，无强制性。打开后不会上传内容，也不会自动保存；离开前可下载填写版 HTML，或使用浏览器打印为 PDF。</p>' : ''}</article>`, 'RESOURCE LIBRARY / 实习材料库');
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-library-action]');
    if (!button || !D()) return;
    const action = button.dataset.libraryAction;
    if (action === 'details') details(button.dataset.libraryId);
    else if (action === 'save') {
      const id = button.dataset.libraryId;
      if (!ids.has(id)) return;
      const current = saved(), next = current.includes(id) ? current.filter(v => v !== id) : [...current, id];
      if (D().save('library', { saved: next }) === false) return;
      renderResults();
      const count = document.querySelector('#library-saved-count'); if (count) count.textContent = next.length;
      D().toast(next.includes(id) ? '已收藏到本机' : '已取消收藏');
    } else if (action === 'type' && types.includes(button.dataset.libraryType)) { type = button.dataset.libraryType; render(); }
    else if (action === 'saved-filter') { onlySaved = !onlySaved; render(); }
    else if (action === 'reset') { query = ''; type = audience = '全部'; onlySaved = false; render(); }
  });
  document.addEventListener('input', event => { if (event.target.id === 'library-search') { query = event.target.value; renderResults(); } });
  document.addEventListener('change', event => { if (event.target.id === 'library-audience' && audiences.includes(event.target.value)) { audience = event.target.value; renderResults(); } });
  window.JiulvFeatures = window.JiulvFeatures || {};
  window.JiulvFeatures.library = { render };
})();
