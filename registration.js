(function () {
  'use strict';
  const api = window.JiulvDemo, rules = window.JiulvAccountCore, e = api.e;
  let role = 'student', mode = 'register', channel = 'phone', challenge = null, attempts = 0, sampleActivated = false, draft = {}, afterComplete = null, returnView = null, licenseError = '';
  const roleLabel = () => role === 'hotel' ? '酒店' : '学生';
  const session = () => role === 'hotel' ? api.getHotelSession() : api.getStudentSession();
  function invalidateCode(message = '获取后显示本机模拟码；不会发送短信或邮件。') { challenge = null; attempts = 0; const status = document.getElementById('registration-code-status'); if (status) status.textContent = message; const code = document.querySelector('#registration-form [name="code"]'); if (code) code.value = ''; }
  const verificationChannel = () => role === 'hotel' || channel === 'legacy-email' ? 'email' : 'phone';
  const targetField = () => role === 'hotel' ? 'hrEmail' : channel === 'legacy-email' ? 'email' : 'phone';
  function capture() { const form = document.getElementById('registration-form'); if (form) draft = { ...draft, ...Object.fromEntries(new FormData(form)) }; }
  function field(key, label, type = 'text', placeholder = '', required = true) { return `<label class="ft-field reg-field"><span>${e(label)}${required ? ' *' : ''}</span><input name="${key}" type="${type}" value="${e(draft[key] || '')}" ${required ? 'required' : ''} maxlength="${key === 'hrEmail' ? 160 : 100}" placeholder="${e(placeholder)}" autocomplete="off"></label>`; }
  function open(nextRole = 'student', callback, origin) {
    if (nextRole === 'hotel') {
      role = 'hotel'; challenge = null; afterComplete = null; draft = {};
      return window.JiulvHotelRegistration?.open(callback, origin);
    }
    role = nextRole === 'hotel' ? 'hotel' : 'student'; document.body.dataset.perspective = role === 'hotel' ? 'employer' : 'student'; const a = session();
    mode = a ? 'profile' : 'register'; channel = role === 'hotel' ? 'email' : 'phone';
    draft = { ...(a || {}) }; licenseError = ''; sampleActivated = Boolean(a?.demoProfile); afterComplete = typeof callback === 'function' ? callback : null; returnView = origin || (role === 'hotel' ? 'hotel' : 'resume'); invalidateCode(); api.showView('register');
  }
  const agreementVersion = 'demo-2026-10-11';
  const policies = {
    terms: { title: '用户协议', sections: [
      ['关于这份体验稿', '本页用于体验酒旅之星的注册与协议阅读流程，不是正式上线版本。运营主体、服务范围和正式条款尚待确认；不会因本次演示形成真实招聘委托或实际投递。'],
      ['账号与使用', '浏览公开信息无需注册。制作简历、记录准备进度、发起同行计划和申请岗位需要平台账号。手机号用于识别与找回账号；姓名、学校和专业在制作简历时补充，请如实填写。'],
      ['实习与平台服务', '酒旅之星帮助整理实习信息、制作简历和记录双方意向，不保证岗位有效、通过筛选或被录取。实习条件、学校手续和协议应由学生、学校与酒店另行核对。'],
      ['由你确认的操作', '分享简历、投递、接受邀请和回应录取由本人决定。注册不等于投递，不代替针对具体酒店的联系方式授权。'],
      ['使用帮助', '账号、内容纠错与资料处理问题可通过“联系酒旅之星”反馈。当前留言、账号和业务记录仅在本浏览器保存，尚未接通真实客服。']
    ]},
    privacy: { title: '隐私政策', sections: [
      ['当前演示的数据范围', '请使用虚构资料。手机号、模拟验证结果、协议勾选记录以及你填写的简历与业务内容保存在此浏览器；本版本没有将这些表单数据上传到业务服务器。分享链接的不同设备不共用账户数据。'],
      ['按功能填写', '注册仅填写手机号及验证码。姓名、学校和专业在制作简历时补充；实习证明、评价配图等仅在你使用对应功能并主动提交时处理，不在注册时索取。'],
      ['酒店可见范围', '完成酒店注册资料与营业执照选件的酒店账户，可浏览已保存且基础资料完整的非联系方式简历。手机号、邮箱和微信等联系方式按具体申请或邀请逐次授权，在对应确认后开放。证明材料不作为公开评价图片展示。'],
      ['账号与资料处理', '简历信息在制作简历时维护；账号信息需要更正时可通过联系酒旅之星处理，也可以撤回可撤回的申请；未完成的草稿只属于当前账号。清除浏览器站点数据会失去本机记录，请先保留需要的文件。正式服务的查阅、删除、注销申请及联系渠道需在上线前落实。'],
      ['正式上线前', '正式政策需明确运营主体、处理目的、必要信息、保存期限、服务提供方与用户权利渠道。本体验稿不作为已上线的隐私承诺；真实短信、微信授权、文件存储和邮件服务均尚未接通。']
    ]},
    mini: { title: '酒旅之星小程序隐私保护指引', sections: [
      ['适用范围', '本页是后续微信小程序的流程预览；当前是网页演示，不会弹出真实微信授权或取得你的微信手机号。正式指引须与微信公众平台配置及实际调用的能力保持一致。'],
      ['手机号与微信账号', '在真实小程序中，只有你主动点击手机号授权按钮并同意后，平台才可按授权获取手机号，用于注册或登录并关联该小程序中的微信身份。同一已验证手机号对应同一平台账号，冲突须先核对，不能覆盖原账号资料。'],
      ['拒绝与继续浏览', '可以拒绝手机号授权或取消注册，继续浏览公开信息；使用需要账号的功能时再验证手机号。不会因查看本指引自动勾选协议或取得授权。'],
      ['其他资料', '头像、简历和实习证明等由你在对应功能中主动选择；注册不索取微信头像、昵称、通讯录或定位。'],
      ['查看与反馈', '上线后可通过小程序的隐私入口查看实际指引，并通过“联系酒旅之星”提出资料处理问题。当前页面的勾选和微信系统授权是不同步骤，不以一项代替另一项。']
    ]}
  };
  function consentMarkup() {
    return `<div class="ft-full reg-consent-block"><p>使用此功能需注册 / 登录酒旅之星账号</p><div class="reg-agreement-row"><input id="registration-consent" type="checkbox" name="ack" required aria-labelledby="registration-consent-text"><div id="registration-consent-text"><label for="registration-consent">我已阅读并同意</label><button type="button" data-reg-action="policy" data-policy="terms">《用户协议》</button><button type="button" data-reg-action="policy" data-policy="privacy">《隐私政策》</button>及<button type="button" data-reg-action="policy" data-policy="mini">《酒旅之星小程序隐私保护指引》</button></div></div></div>`;
  }
  function accountLabel(account) { return account.name || account.hotelName || (account.phone ? `手机用户 · ${String(account.phone).slice(-4)}` : '待完善资料的同学'); }
  function licenseContent() {
    const selected = rules.businessLicenseComplete(draft.businessLicense) ? draft.businessLicense : null;
    return `<div class="reg-license-heading"><b>公司营业执照 *</b><span>用于酒店身份资料</span></div><p>支持 JPG / PNG / WebP / PDF，单个文件不超过 5 MB。</p>${selected ? `<div class="reg-license-selection"><span class="reg-license-icon" aria-hidden="true">▤</span><div><b>${e(selected.name)}</b><small>${selected.source === 'sample' ? '虚构样例 · 用于体验注册' : `${Math.max(1, Math.ceil(selected.size / 1024))} KB · 仅记录选件信息，未上传`}</small></div><button type="button" class="text-button" data-reg-action="license-remove">移除</button></div>` : '<div class="reg-license-empty">尚未选择营业执照</div>'}<label class="reg-license-picker"><span>${selected ? '更换文件' : '选择营业执照文件'}</span><input id="registration-license-file" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf" aria-label="${selected ? '更换' : '选择'}公司营业执照" aria-describedby="registration-license-note registration-license-error"></label><button type="button" class="text-button reg-license-sample" data-reg-action="license-sample">使用虚构执照样例</button><p id="registration-license-error" class="reg-license-error" role="alert">${e(licenseError)}</p><small id="registration-license-note">演示只保存文件名、格式和大小，不读取或保存文件内容，也不进行真实资质审核。请使用虚构文件；正式上线后需接入私密存储与人工审核。</small>`;
  }
  function renderLicense() { const node = document.getElementById('registration-license-panel'); if (node) node.innerHTML = licenseContent(); }
  function render() {
    if (role === 'hotel') return window.JiulvHotelRegistration?.render();
    const host = document.getElementById('register-view'); if (!host) return;
    const current = session(), isProfile = mode === 'profile' && current;
    if (mode === 'profile' && !current) mode = 'register';
    if (channel === 'legacy-email' && mode !== 'login') channel = 'phone';
    const targetKey = targetField(), contactChannel = verificationChannel();
    const list = api.getAccounts()[rules.roleKey(role)];
    const student = role === 'student';
    const modeTabs = '';
    const studentBasics = '';
    if (student && isProfile && current.phone) {
      host.innerHTML = `<div class="reg-layout reg-student-layout"><section class="reg-intro"><h1>你的实习，<br>从这里继续。</h1></section><section class="reg-panel reg-account-readonly"><h2>我的账户</h2><dl><div><dt>登录手机号</dt><dd>${e(current.phone)}</dd></div></dl><p>姓名、院校、专业和简历联系方式，在制作简历时填写或更新。</p><div class="ft-actions"><button class="primary" type="button" data-reg-action="resume">前往我的简历 ↗</button><button class="secondary" type="button" data-view="contact">联系酒旅之星</button></div><div class="reg-session"><span>${e(accountLabel(current))}</span><button class="text-button" data-reg-action="logout">退出学生会话</button></div></section></div>`;
      return;
    }
    host.innerHTML = `<div class="reg-layout ${student ? 'reg-student-layout' : ''}">
      <section class="reg-intro">${student ? '' : '<span class="overline">酒店 HR 账户</span>'}<h1>${student ? '认识你，<br>从这里开始。' : '欢迎加入，<br>酒店伙伴。'}</h1>${student ? '' : '<p>同一企业工作邮箱使用同一酒店账户，填写资料与营业执照选件后进入人才发现。</p><div class="reg-boundary"><b>本机演示</b><p>模拟验证码为 246810，不发送短信或邮件，也不核验真实身份与酒店资质。请使用虚构资料。</p></div>'}</section>
      <section class="reg-panel" data-registration-context="${role}">${modeTabs}<h2>${isProfile ? '绑定手机号' : student ? '手机号登录 / 注册' : mode === 'login' ? '酒店登录' : '建立酒店账户'}</h2>
      ${isProfile && student && !current.phone ? '<p class="reg-alert">原账户、简历和申请已保留。验证手机号后继续使用同一账户；原邮箱不再用于新注册。</p>' : ''}
      ${isProfile && !student && !rules.businessLicenseComplete(current.businessLicense) ? '<p class="reg-alert">原有酒店资料与草稿已保留，请补充营业执照选件，再进入人才发现。当前仅体验资料门槛，未进行真实审核。</p>' : ''}
      <form id="registration-form" class="ft-form reg-form" data-role="${role}" data-mode="${mode}">
      ${student && !isProfile && list.some(a => a.email && !a.phone) ? '<button type="button" class="text-button ft-full reg-legacy-link" data-reg-action="legacy-email">找回旧邮箱账户并绑定手机号</button>' : ''}
      ${channel === 'legacy-email' ? '<button type="button" class="text-button ft-full" data-reg-action="phone">返回手机号登录 / 注册</button>' : ''}
      <label class="ft-field ft-full reg-field"><span>${student ? contactChannel === 'phone' ? '手机号码' : '原账户邮箱（仅接续旧账户）' : '企业工作邮箱'} *</span><input name="${targetKey}" data-reg-target type="${contactChannel === 'phone' ? 'tel' : 'email'}" value="${e(draft[targetKey] || '')}" ${contactChannel === 'phone' ? 'inputmode="numeric" pattern="1[0-9]{10}" maxlength="11"' : 'maxlength="160"'} required autocomplete="${contactChannel === 'phone' ? 'tel' : 'email'}" placeholder="${contactChannel === 'phone' ? '请输入11位手机号' : '请输入邮箱地址'}"></label>
      <div class="ft-field ft-full reg-field"><label for="registration-code">验证码${isProfile ? '（联系方式未变时可留空）' : ' *'}</label><div class="reg-code-row"><input id="registration-code" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" ${isProfile ? '' : 'required'} placeholder="请输入6位验证码" autocomplete="one-time-code"><button type="button" class="secondary" data-reg-action="code">获取模拟码</button></div><small id="registration-code-status" role="status">本机演示码 246810，请先获取；不会发送短信或邮件。</small></div>
      ${mode !== 'login' ? student ? studentBasics : `${field('hotelName', '酒店全称', 'text', '酒店正式名称')}${field('hotelCity', '城市 / 区域', 'text', '例如：上海 · 黄浦区')}${field('reporterName', '填报人姓名', 'text', 'HR或获授权的填报人')}<div id="registration-license-panel" class="ft-full reg-license">${licenseContent()}</div>` : ''}
      ${student ? consentMarkup() : '<label class="ft-consent ft-full"><input type="checkbox" name="ack" required><span>我了解这是本机模拟账户，未执行真实微信授权、身份或资质核验；本次资料仅保存在此浏览器。</span></label>'}
      <div class="ft-actions ft-full"><button class="primary" type="submit">${isProfile ? '验证手机号并继续' : student && channel !== 'legacy-email' ? '登录 / 注册并继续' : mode === 'login' ? '进入本机账户' : '注册并继续'}</button>${student ? '' : `<button class="secondary" type="button" data-reg-action="sample">${mode === 'login' ? '填入示例联系方式' : '使用虚构示例'}</button>`}</div>
      </form>
      ${student ? '<div class="reg-demo-caption"><span>当前为本机演示，请使用虚构手机号。协议为体验稿，短信和微信授权尚未接通。</span><button type="button" data-reg-action="sample">填入演示手机号</button></div>' : ''}
      ${current ? `<div class="reg-session"><span>当前${roleLabel()}会话：${e(accountLabel(current))}</span><button class="text-button" data-reg-action="logout">退出${roleLabel()}会话</button></div>` : ''}
      <details class="reg-local-switch"><summary>切换本机演示账户（不是真实登录）</summary><p>仅用于同一浏览器内测试角色流程。正式服务必须进行服务端认证，不能使用此切换方式。</p>${list.length ? list.map(a => `<button class="secondary" data-reg-action="switch" data-account-id="${e(a.id)}">${e(accountLabel(a))}${a.demoProfile ? ' · 虚构示例' : ''}${current?.id === a.id ? ' · 当前' : ''}</button>`).join('') : '<p>本机还没有此角色的账户。</p>'}</details></section></div>`;
    if (challenge) invalidateCode('页面已更新，请重新获取模拟码。');
  }
  function finish() { if (!(role === 'hotel' ? rules.hotelComplete : rules.studentComplete)(session())) { mode = 'profile'; draft = { ...(session() || {}) }; render(); return; } const callback = afterComplete, destination = returnView; afterComplete = null; challenge = null; api.updateAccount(); api.showView(destination && destination !== 'register' ? destination : role === 'hotel' ? 'hotel' : 'resume'); if (callback) callback(); }
  function restoreProfile(account) { mode = 'profile'; channel = role === 'hotel' ? 'email' : 'phone'; draft = {...account}; sampleActivated = Boolean(account.demoProfile); invalidateCode(); render(); }
  document.addEventListener('click', event => {
    if (role === 'hotel') return;
    const button = event.target.closest('[data-reg-action]'); if (!button) return;
    const action = button.dataset.regAction;
    if (action === 'resume') return api.showView('resume');
    if (action === 'mode' && ['register', 'login'].includes(button.dataset.mode)) {
      capture(); const previousMode = mode; mode = button.dataset.mode; licenseError = ''; const a = session();
      if (mode === 'profile') { draft = {...(a || {})}; sampleActivated = Boolean(a?.demoProfile); }
      else if (previousMode === 'profile') { const key = targetField(); draft = {[key]:draft[key] || ''}; sampleActivated = false; }
      if (channel === 'legacy-email') channel = 'phone'; invalidateCode(); return render();
    }
    if (action === 'policy' && role === 'student' && Object.hasOwn(policies, button.dataset.policy)) {
      const policy = policies[button.dataset.policy];
      return api.modal(`<article class="reg-policy"><h2>${policy.title}</h2><p class="reg-policy-version">体验稿 · 2026年10月11日 · 非正式上线文件</p>${policy.sections.map(([title, text]) => `<section><h3>${title}</h3><p>${text}</p></section>`).join('')}<p class="reg-policy-foot">关闭后可继续填写；查看文件不会自动勾选同意。</p></article>`, '账号与隐私');
    }
    if (action === 'phone' && role === 'student') { capture(); channel = 'phone'; mode = 'register'; invalidateCode(); return render(); }
    if (action === 'legacy-email' && role === 'student' && mode !== 'profile' && api.getAccounts().students.some(a => a.email && !a.phone)) { capture(); channel = 'legacy-email'; mode = 'login'; invalidateCode(); return render(); }
    if (action === 'code') {
      const input = document.querySelector('#registration-form [data-reg-target]'); if (!input?.reportValidity() || !rules.validTarget(verificationChannel(), input.value)) return api.toast('请填写有效的接收手机号或邮箱。');
      challenge = rules.issueChallenge({role,mode,channel:verificationChannel(),target:input.value}); attempts = 0;
      document.getElementById('registration-code-status').textContent = `本机模拟码：246810；仅适用于 ${challenge.target} 的本次${mode === 'login' ? '登录' : mode === 'profile' ? '手机号绑定' : '注册'}，5分钟有效。没有实际发送。`;
    }
    if (action === 'sample') {
      const form = document.getElementById('registration-form'); if (!form) return;
      capture();
      // Keep sample values in the same draft used by every render, including
      // the active phone/email target. Updating DOM values alone is transient.
      Object.entries(rules.examples[role]).forEach(([key,value]) => { if (form.elements.namedItem(key)) draft[key] = value; });
      sampleActivated = true;
      if (role === 'hotel' && mode !== 'login') { draft.businessLicense = rules.sampleBusinessLicense(); licenseError = ''; }
      render();
      invalidateCode('已填入虚构示例，请重新获取模拟码。');
      api.toast('已填入虚构示例；仍需获取模拟码并确认。');
    }
    if (action === 'license-sample' && role === 'hotel' && mode !== 'login') { draft.businessLicense = rules.sampleBusinessLicense(); licenseError = ''; renderLicense(); api.toast('已选择虚构执照样例，没有上传文件或执行资质审核。'); }
    if (action === 'license-remove' && role === 'hotel') { delete draft.businessLicense; licenseError = ''; renderLicense(); }

    if (action === 'switch') { const a = api.getAccounts()[rules.roleKey(role)].find(item => item.id === button.dataset.accountId); if (a && api.switchAccount(role,a.id)) { api.toast('已切换本机演示账户，未执行真实登录。'); if ((role === 'hotel' ? rules.hotelComplete : rules.studentComplete)(a)) finish(); else { mode='profile';draft={...a};invalidateCode();render(); } } }
    if (action === 'logout') { api.logout(role); mode='login';draft={};licenseError='';sampleActivated=false;channel=role==='hotel'?'email':'phone';invalidateCode();render(); }
  });
  document.addEventListener('change', event => {
    if (role === 'hotel') return;
    if (event.target.id !== 'registration-license-file' || role !== 'hotel' || mode === 'login') return;
    const file = event.target.files?.[0]; if (!file) return;
    licenseError = rules.businessLicenseError(file);
    if (!licenseError) draft.businessLicense = rules.licenseSelection(file);
    event.target.value = ''; renderLicense();
  });
  document.addEventListener('input', event => { if (role === 'hotel') return; if (event.target.matches?.('#registration-form [data-reg-target]')) invalidateCode('接收目标已修改，原模拟码作废，请重新获取。'); });
  document.addEventListener('submit', event => {
    if (role === 'hotel') return;
    if (event.target.id !== 'registration-form') return;
    event.preventDefault(); const form = event.target; if (form.dataset.role !== role || form.dataset.mode !== mode || !form.reportValidity()) return;
    if (mode === 'profile') {
      const fresh = session();
      if (!fresh || fresh.id !== draft.id || Number(fresh.opsVersion || 1) !== Number(draft.opsVersion || 1)) return api.toast('账户资料已在管理页或其他页面更新，请重新打开账户页面后再继续。');
    }
    const data = Object.fromEntries(new FormData(form)), method = verificationChannel(), targetKey = targetField(), target = rules.normalizeTarget(method,data[targetKey]);
    if (!rules.validTarget(method,target)) return api.toast('请填写有效的联系方式。');
    const current = session(), changed = mode !== 'profile' || !current || !current.demoVerified || target !== rules.normalizeTarget(method,current[targetKey]);
    if (changed && !rules.verifyChallenge(challenge,{role,mode,channel:method,target,code:data.code})) { if (++attempts >= 5) invalidateCode('尝试次数已达上限，请重新获取模拟码。'); return api.toast('模拟码不存在、已过期或不匹配；请重新获取并填写。'); }
    const accounts=api.getAccounts()[rules.roleKey(role)], found=accounts.find(a=>rules.normalizeTarget(method,a[targetKey])===target);
    if (channel === 'legacy-email') {
      if (!found || found.phone) return api.toast('没有待接续的旧邮箱账户，请使用手机号登录。');
      if (!api.switchAccount('student',found.id)) return; return restoreProfile(found);
    }
    if (role === 'student') {
      if (data.ack !== 'on') return api.toast('请先阅读并勾选同意相关协议。');
      const agreementConsent = { version: agreementVersion, documents: ['terms', 'privacy', 'mini'], acceptedAt: new Date().toISOString(), demoOnly: true };
      const identity = '';
      const resolved = rules.resolveStudentIdentity(accounts,{phone:target,phoneVerified:true,wechatDemoIdentity:identity,currentId:mode === 'profile' ? current.id : ''});
      if (resolved.error) return api.toast('手机号与微信对应了不同账户，不能自动合并。请通过联系酒旅之星处理，原有资料不会删除。');
      const existing = accounts.find(a => a.id === resolved.accountId);
      if (existing && mode !== 'profile') {
        const account = {...existing,phone:target,demoVerified:true,agreementConsent};
        if (!api.saveAccount(account)) return;
        api.toast(identity ? '已绑定同一账户，原简历和申请记录保留。' : '该手机号已注册，已进入原账户。');
        if (!rules.studentComplete(account)) return restoreProfile(account); return finish();
      }
      const basics = {}; // Student identity and education are edited only in the resume.
      const account = {...(existing || {}),...basics,role,id:existing?.id || crypto.randomUUID(),phone:target,discoverable:true,demoVerified:true,agreementConsent};
      account.demoProfile = rules.isExample('student',account,'phone',sampleActivated);
      if (!api.saveAccount(account)) return;
      api.toast(mode === 'profile' ? '手机号已绑定，原有简历与申请继续保留。' : '本机账户已建立，继续刚才的操作。'); return finish();
    }
    if (mode === 'login') { if (!found) return api.toast('本机没有这个企业邮箱账户，请切换到注册；邮箱会保留。'); if (!api.switchAccount(role,found.id)) return; if (!rules.hotelComplete(found)) return restoreProfile(found); return finish(); }
    if (found && (mode !== 'profile' || found.id !== current?.id)) return api.toast('这个企业邮箱已在本机注册，请登录同一酒店账户；邮箱已保留。');
    const id = mode === 'profile' && current ? current.id : crypto.randomUUID();
    if (!data.hotelName?.trim() || !data.hotelCity?.trim() || !data.reporterName?.trim()) return api.toast('请填写酒店全称、城市区域和填报人姓名。');
    if (!rules.businessLicenseComplete(draft.businessLicense)) { licenseError = '请先选择营业执照，或主动使用虚构执照样例。'; renderLicense(); return api.toast(licenseError); }
    const account = { ...(mode === 'profile' ? current : {}),role,id,hotelName:data.hotelName.trim(),hotelCity:data.hotelCity.trim(),reporterName:data.reporterName.trim(),hrEmail:target,demoVerified:true,businessLicense:{...draft.businessLicense} };
    account.demoProfile = rules.isExample(role,account,channel,sampleActivated);
    if (role === 'hotel') account.hotelId = mode === 'profile' && current?.hotelId ? current.hotelId : account.demoProfile ? 'demo-hotel' : id;
    if (!api.saveAccount(account)) return;
    api.toast(mode === 'profile' ? '账户资料已更新；旧简历草稿与已授权快照保留。' : '本机账户已建立；尚未执行真实身份或资质核验。'); finish();
  });
  window.JiulvFeatures.register={render,open};
})();
