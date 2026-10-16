(function () {
  'use strict';
  const api = window.JiulvDemo, rules = window.JiulvAccountCore, auth = window.JiulvHotelAuth, regions = window.JiulvRegions, e = api.e;
  const policyVersion = 'demo-hotel-2026-10-16';
  let mode = 'register', channel = 'phone', draft = {}, challenge = null, attempts = 0, licenseError = '', busy = false, epoch = 0, ownSave = false, callback = null, origin = 'employer';
  const disabledBeforeSubmit = new WeakMap();
  const current = () => api.getHotelSession();
  const library = () => api.getAccounts().hotels;
  const host = () => document.getElementById('register-view');
  const active = () => document.body.dataset.perspective === 'employer' && host()?.hidden === false && Boolean(document.getElementById('hotel-registration-panel'));
  const form = () => document.getElementById('hotel-registration-form');
  const normalized = (method, value) => rules.normalizeTarget(method, value);
  function capture() {
    const node = form(); if (!node) return;
    const values = Object.fromEntries(new FormData(node));
    draft = { ...draft, ...values, ack: values.ack === 'on', remember: values.remember === 'on' };
  }
  function invalidate(message = '本机模拟码为 246810，请先获取；不会发送短信或邮件。') {
    challenge = null; attempts = 0; draft.code = '';
    const input = form()?.elements.namedItem('code'); if (input) input.value = '';
    const status = document.getElementById('hotel-code-status'); if (status) status.textContent = message;
  }
  function checked(value) { return value ? ' checked' : ''; }
  function input(name, label, { type = 'text', placeholder = '', hint = '', full = false, autocomplete = 'off', required = true, max = 160 } = {}) {
    return `<label class="ft-field reg-field${full ? ' ft-full' : ''}"><span>${e(label)}${required ? ' *' : ''}</span><input name="${name}" type="${type}" value="${e(draft[name] || '')}" placeholder="${e(placeholder)}" autocomplete="${autocomplete}" maxlength="${max}"${required ? ' required' : ''}${name === 'phone' ? ' inputmode="numeric" pattern="1[0-9]{10}"' : ''}>${hint ? `<small>${e(hint)}</small>` : ''}</label>`;
  }
  function passwordField(newPassword) {
    return `<div class="ft-field ft-full reg-field"><label for="hotel-password">${newPassword ? mode === 'register' ? '注册密码' : '设置新密码' : '登录密码'} *</label><div class="hotel-password-row"><input id="hotel-password" name="password" type="password" value="${e(draft.password || '')}" autocomplete="${newPassword ? 'new-password' : 'current-password'}" required maxlength="64"${newPassword ? ' minlength="8"' : ''} placeholder="${newPassword ? '请设置8–64位密码' : '请输入注册时设置的密码'}"><button type="button" data-hotel-reg-action="password" aria-label="显示密码" aria-pressed="false">显示</button></div>${newPassword ? '<small>这是公开演示，请使用虚构密码，勿使用其他账户的真实密码。</small>' : ''}</div>`;
  }
  function regionFields() {
    const region = regions.findRegion(draft.provinceId);
    const terminal = region && ['municipality', 'special-administrative-region'].includes(region.type);
    return `<div class="ft-full hotel-city-fields"><label class="ft-field reg-field"><span>省 / 直辖市 / 港澳 *</span><select name="provinceId" required><option value="">请选择省级单位</option>${regions.regions.map(row => `<option value="${e(row.id)}"${row.id === draft.provinceId ? ' selected' : ''}>${e(row.name)}</option>`).join('')}</select></label>${terminal ? `<div class="hotel-city-selected"><span>所在城市</span><b>${e(region.cities[0].name)}</b><input type="hidden" name="cityId" value="${e(region.cities[0].id)}"></div>` : `<label class="ft-field reg-field"><span>${region?.type === 'taiwan' ? '县 / 市' : '城市'} *</span><select name="cityId" required${region ? '' : ' disabled'}><option value="">${region ? '请选择城市' : '请先选择省级单位'}</option>${(region?.cities || []).map(city => `<option value="${e(city.id)}"${city.id === draft.cityId ? ' selected' : ''}>${e(city.name)}</option>`).join('')}</select></label>`}</div>`;
  }
  const groupOptions = () => window.JiulvCore?.hotelGroupOptions?.(window.JIULV_HOTEL_GROUPS || []) || [...(window.JIULV_HOTEL_GROUPS || []).map(({id,name}) => ({id,name})), {id:'independent',name:'独立酒店 / 其他集团'}];
  function groupField() {
    const brands = rules.hotelBrandOptions(window.JIULV_HOTEL_GROUPS || [], draft.groupId);
    return `<label class="ft-field reg-field"><span>酒店所属集团 *</span><select name="groupId" required><option value="">请选择酒店集团</option>${groupOptions().map(group => `<option value="${e(group.id)}"${draft.groupId === group.id ? ' selected' : ''}>${e(group.name)}</option>`).join('')}</select></label><label class="ft-field reg-field"><span>酒店所属品牌 *</span><select name="brandId" required${draft.groupId ? '' : ' disabled'}><option value="">${draft.groupId ? '请选择酒店品牌' : '请先选择酒店集团'}</option>${brands.map(brand => `<option value="${e(brand.id)}"${draft.brandId === brand.id ? ' selected' : ''}>${e(brand.name)}${brand.english && brand.english !== brand.name ? ` · ${e(brand.english)}` : ''}</option>`).join('')}</select></label>`;
  }
  function consent() {
    return `<div class="ft-full reg-consent-block"><p>使用此功能需注册 / 登录酒旅之星酒店账户</p><div class="reg-agreement-row"><input id="hotel-consent" type="checkbox" name="ack" required aria-labelledby="hotel-consent-text"${checked(draft.ack)}><div id="hotel-consent-text"><label for="hotel-consent">我已阅读并同意</label><button type="button" data-hotel-reg-action="policy" data-policy="terms">《用户协议》</button><button type="button" data-hotel-reg-action="policy" data-policy="privacy">《隐私政策》</button>及<button type="button" data-hotel-reg-action="policy" data-policy="mini">《酒旅之星小程序隐私保护指引》</button></div></div></div>`;
  }
  function remember() {
    return `<label class="ft-full hotel-remember"><input type="checkbox" name="remember"${checked(draft.remember)}><span>在此设备保持登录 30 天<small>个人设备可选；密码可由浏览器密码管理器记住。</small></span></label>`;
  }
  function channels() {
    return `<div class="ft-full hotel-verification"><span>接收验证码</span><div class="hotel-channel-buttons" role="group" aria-label="选择验证码接收方式"><button type="button" data-hotel-reg-action="channel" data-channel="phone" aria-pressed="${channel === 'phone'}">手机验证码</button><button type="button" data-hotel-reg-action="channel" data-channel="email" aria-pressed="${channel === 'email'}">邮箱验证码</button></div>${mode === 'register' ? `<small>${channel === 'phone' ? '验证码发送至上方手机号，工作邮箱仍作为酒店联系邮箱。' : '验证码发送至上方工作邮箱；收不到时可切换手机。'}</small>` : ''}</div>`;
  }
  function codeField() {
    return `<div class="ft-field ft-full reg-field"><label for="hotel-code">${channel === 'phone' ? '手机' : '邮箱'}验证码 *</label><div class="reg-code-row"><input id="hotel-code" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required autocomplete="one-time-code" placeholder="请输入6位验证码"><button type="button" class="secondary" data-hotel-reg-action="code">获取模拟码</button></div><small id="hotel-code-status" role="status">本机模拟码为 246810，请先获取；不会发送短信或邮件。</small></div>`;
  }
  function licenseContent() {
    const selected = rules.businessLicenseComplete(draft.businessLicense) ? draft.businessLicense : null;
    return `<div class="reg-license-heading"><b>公司营业执照 *</b><span>JPG / PNG / WebP / PDF · 不超过 5 MB</span></div>${selected ? `<div class="reg-license-selection"><span class="reg-license-icon" aria-hidden="true">▤</span><div><b>${e(selected.name)}</b><small>${selected.source === 'sample' ? '虚构样例 · 用于体验注册' : `${Math.max(1, Math.ceil(selected.size / 1024))} KB · 仅记录选件信息，未上传`}</small></div><button type="button" class="text-button" data-hotel-reg-action="license-remove">移除</button></div>` : '<div class="reg-license-empty">选择营业执照文件</div>'}<label class="reg-license-picker"><input id="hotel-registration-license" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf" aria-label="选择公司营业执照" aria-describedby="hotel-license-error"></label><button type="button" class="text-button reg-license-sample" data-hotel-reg-action="license-sample">使用虚构执照样例</button><p id="hotel-license-error" class="reg-license-error" role="alert">${e(licenseError)}</p><small>演示仅保存文件名、格式与大小，不读取文件内容，也未进行真实资质审核。</small>`;
  }
  function renderLicense() { const node = document.getElementById('hotel-license-panel'); if (node) node.innerHTML = licenseContent(); }
  const policies = {
    terms: { title: '用户协议', sections: [
      ['这是一份体验稿', '本页用于体验酒店注册、登录与协议阅读流程，运营主体与正式条款尚待确认，不代表已开通真实招聘委托或完成酒店资质审核。'],
      ['酒店账户', '酒店账户使用酒店中文名称、所属集团与品牌、所在城市、工作邮箱、手机号与营业执照资料建立。请由获酒店授权的人员操作；酒店中文名称可与营业执照主体名称不同，但须如实填写。'],
      ['招聘与联系', '招聘计划、实习条件与候选人回应由酒店负责核对。浏览简历始终隐藏联系方式，只有对应投递确认或学生接受邀请后，按该次授权开放联系方式。'],
      ['资料与服务帮助', '账户基础资料需要修改、关联冲突或收不到验证消息时，通过“联系酒旅之星”反馈。演示留言仅保存在本浏览器，尚未送达真实客服。']
    ]},
    privacy: { title: '隐私政策', sections: [
      ['当前演示的数据', '酒店名称、集团与品牌、城市、工作邮箱、手机号、协议同意记录、密码派生校验信息与业务记录保存在此浏览器。营业执照仅保存文件名、格式和大小，文件内容不上传。请使用虚构资料与密码。'],
      ['验证与登录', '可选择手机或工作邮箱接收验证码。仅所选且验证成功的联系方式记为已验证；未验证的备用联系方式不可用于找回密码。登录可用登记手机号或邮箱加密码。'],
      ['保持登录', '默认仅保留本次浏览器会话。主动勾选后在此设备保留30天登录状态；不保存明文密码。此功能是本机演示，真实服务仍需服务端身份校验、会话失效与安全管理。'],
      ['信息展示与权利', '招聘计划中的公开内容供实习生浏览；营业执照、登录凭据不作为岗位详情公开展示。资料修正、访问、删除和注销等问题通过“联系酒旅之星”提出，正式上线前需落实处理渠道和保存期限。'],
      ['上线前确认', '正式政策需补齐运营主体、具体处理目的、服务提供方和用户权利规则。当前验证码不会发送短信或邮件，不代表已验证真实手机号、邮箱或企业身份。']
    ]},
    mini: { title: '酒旅之星小程序隐私保护指引', sections: [
      ['适用范围', '本页为酒店账户小程序隐私流程体验稿；当前是网页演示，尚未获取真实微信授权。正式指引须与微信公众平台配置及实际接口能力一致。'],
      ['手机号与酒店资料', '手机号和邮箱用于账户识别、验证、登录与找回。酒店主动填写名称、城市并选择营业执照文件；注册不索取微信通讯录、位置、头像或昵称。'],
      ['选择和授权', '查看本指引不会自动勾选同意，也不会取得系统授权。选择文件仅由本人触发；正式小程序如调用微信隐私接口，仍须按实际功能完成微信系统要求的授权流程。'],
      ['资料处理', '可通过“联系酒旅之星”反馈账号或资料问题。本机演示记录与其他设备不互通；正式服务上线前应明确资料处理方式、期限与权利渠道。']
    ]}
  };
  function showPolicy(key) {
    const policy = policies[key]; if (!policy) return;
    api.modal(`<article class="reg-policy"><h2>${policy.title}</h2><p class="reg-policy-version">体验稿 · 2026年10月16日 · 非正式上线文件</p>${policy.sections.map(([title, text]) => `<section><h3>${title}</h3><p>${text}</p></section>`).join('')}<p class="reg-policy-foot">关闭后可继续填写；查看文件不会自动勾选同意。</p></article>`, '酒店账号与隐私');
  }
  function profileMarkup(account) {
    const access = rules.hotelAccess(account), needsPlatform = !access.allowed && access.reason !== 'missing-license';
    const status = method => auth.verifiedTarget(account, method) ? '已模拟验证' : '未验证';
    const contactRow = (method, label, value) => `<div><dt>${label}</dt><dd>${e(value || '未登记')}<span class="hotel-verification-status">${value ? status(method) : ''}</span>${value && !auth.verifiedTarget(account, method) ? `<button type="button" class="text-button" data-hotel-reg-action="verify" data-channel="${method}">验证此${method === 'phone' ? '手机号' : '邮箱'}</button>` : ''}</dd></div>`;
    return `<h2>酒店账户资料</h2><dl class="hotel-account-summary"><div><dt>酒店中文名称</dt><dd>${e(account.hotelName)}</dd></div><div><dt>所在城市</dt><dd>${e(window.JiulvRegions?.formatCity?.(account.hotelCity) || account.hotelCity || '未登记')}</dd></div><div><dt>酒店所属集团</dt><dd>${e(groupOptions().find(group => group.id === account.groupId)?.name || account.groupName || '未登记 · 可联系平台补充')}</dd></div><div><dt>酒店所属品牌</dt><dd>${e(rules.hotelBrandSelection(window.JIULV_HOTEL_GROUPS || [], account.groupId, account.brandId)?.brandName || account.brandName || '未登记 · 可联系平台补充')}</dd></div>${contactRow('email', 'HR 工作邮箱', account.hrEmail)}${contactRow('phone', '手机号码', account.phone)}<div><dt>营业执照</dt><dd>${e(account.businessLicense?.name || '尚未选择')}<span class="hotel-verification-status">${rules.businessLicenseComplete(account.businessLicense) ? '仅选件记录 · 未审核' : '请补充后继续'}</span></dd></div></dl><p class="hotel-account-help">${needsPlatform ? '账户资料尚待完善，请联系酒旅之星协助处理。' : '需要修改账户资料？联系酒旅之星，由平台协助处理。'}</p><div class="hotel-account-actions"><button type="button" class="primary" data-hotel-reg-action="${needsPlatform ? 'contact' : 'continue'}">${needsPlatform ? '联系平台完善账户' : access.allowed ? '继续使用' : '补充营业执照'}</button>${needsPlatform ? '' : '<button type="button" class="secondary" data-hotel-reg-action="contact">联系酒旅之星</button>'}</div><div class="hotel-account-tools"><button type="button" class="text-button" data-hotel-reg-action="reset">${account.passwordCredential ? '忘记 / 重设密码' : '首次设置登录密码'}</button><button type="button" class="text-button" data-hotel-reg-action="logout">退出酒店账户</button></div>`;
  }
  function render() {
    const root = host(); if (!root || document.body.dataset.perspective !== 'employer') return;
    epoch++; busy = false; const account = current();
    if (['account', 'license', 'verify'].includes(mode) && !account) { mode = 'login'; draft = {}; }
    if (challenge) invalidate('页面已更新，请重新获取模拟码。');
    let content = '';
    if (mode === 'account') content = profileMarkup(account);
    else if (mode === 'license') content = `<h2>补充营业执照</h2><p class="hotel-account-help">${e(account.hotelName)}的原有资料与招聘记录已保留，选择执照后继续使用。</p><form id="hotel-registration-form" class="ft-form reg-form" data-mode="license" data-account-id="${e(account.id)}"><div id="hotel-license-panel" class="ft-full reg-license">${licenseContent()}</div><div class="ft-actions ft-full"><button class="primary" type="submit">保存选件并继续</button><button class="secondary" type="button" data-hotel-reg-action="account">返回账户资料</button></div></form>`;
    else if (mode === 'verify') content = `<h2>验证${channel === 'phone' ? '手机号码' : '工作邮箱'}</h2><p class="hotel-account-help">${e(channel === 'phone' ? account.phone : account.hrEmail)}<br>验证后可作为密码找回方式，账户资料保持不变。</p><form id="hotel-registration-form" class="ft-form reg-form" data-mode="verify" data-account-id="${e(account.id)}">${codeField()}<div class="ft-actions ft-full"><button class="primary" type="submit">确认验证</button><button class="secondary" type="button" data-hotel-reg-action="account">返回账户资料</button></div></form>`;
    else {
      const tabs = `<div class="reg-mode-tabs"><button type="button" data-hotel-reg-action="mode" data-mode="register" class="${mode === 'register' ? 'active' : ''}">注册酒店账户</button><button type="button" data-hotel-reg-action="mode" data-mode="login" class="${mode !== 'register' ? 'active' : ''}">登录已有账户</button></div>`;
      const fields = mode === 'register'
        ? `${input('hotelName', '酒店中文名称（无需与营业执照一致）', { full: true, placeholder: '请输入酒店对外使用的中文名称', max: 100 })}${regionFields()}${groupField()}${input('hrEmail', 'HR 工作邮箱', { type: 'email', autocomplete: 'email', placeholder: '用于酒店联系及邮箱登录' })}${input('phone', '手机号码', { type: 'tel', autocomplete: 'tel', placeholder: '请输入11位手机号', max: 11 })}${channels()}${codeField()}${passwordField(true)}<div id="hotel-license-panel" class="ft-full reg-license">${licenseContent()}</div>`
        : `${input('identifier', '手机号 / 邮箱', { full: true, placeholder: '输入注册手机号或工作邮箱', autocomplete: 'username' })}${mode === 'reset' ? `${channels()}${codeField()}<p class="ft-full hotel-reset-note">只可用已验证的联系方式找回；旧邮箱账户可先验证原邮箱，再首次设置密码。</p>${passwordField(true)}` : passwordField(false)}`;
      content = `${tabs}<h2>${mode === 'register' ? '建立酒店账户' : mode === 'reset' ? '找回 / 首次设置密码' : '欢迎回来'}</h2><form id="hotel-registration-form" class="ft-form reg-form" data-mode="${mode}">${fields}${remember()}${consent()}<div class="ft-actions ft-full"><button class="primary" type="submit">${mode === 'register' ? '注册并继续' : mode === 'reset' ? '验证并设置密码' : '登录并继续'}</button></div>${mode === 'login' ? '<div class="ft-full hotel-login-help"><button type="button" class="text-button" data-hotel-reg-action="reset">忘记密码 / 首次设置密码</button><button type="button" class="text-button" data-hotel-reg-action="contact">联系酒旅之星</button></div>' : mode === 'reset' ? '<button type="button" class="ft-full text-button" data-hotel-reg-action="mode" data-mode="login">返回密码登录</button>' : ''}</form><div class="reg-demo-caption"><span>当前为本机演示，请使用虚构资料与密码。验证码、资质审核和真实登录服务尚未接通。</span>${mode === 'register' ? '<button type="button" data-hotel-reg-action="sample">填入虚构酒店示例</button>' : ''}</div>`;
    }
    root.innerHTML = `<div class="reg-layout reg-hotel-layout"><section class="reg-intro"><h1>欢迎加入，<br>酒店伙伴。</h1></section><section id="hotel-registration-panel" class="reg-panel" data-registration-context="hotel">${content}</section></div>`;
  }
  function open(nextCallback, nextOrigin) {
    epoch++; document.body.dataset.perspective = 'employer'; callback = typeof nextCallback === 'function' ? nextCallback : null; origin = nextOrigin && nextOrigin !== 'register' ? nextOrigin : 'employer';
    const account = current(); mode = account ? 'account' : 'register'; channel = 'phone'; draft = {}; challenge = null; attempts = 0; licenseError = ''; busy = false; api.showView('register'); render();
  }
  function finish() {
    const account = current(); challenge = null; draft = {}; epoch++; busy = false;
    if (!rules.hotelComplete(account)) { mode = rules.hotelAccess(account).reason === 'missing-license' ? 'license' : 'account'; draft.businessLicense = account?.businessLicense; render(); return; }
    const done = callback, destination = origin; callback = null; api.updateAccount(); api.showView(destination); if (done) done();
  }
  function targetForCode() {
    if (mode === 'register') return normalized(channel, draft[channel === 'phone' ? 'phone' : 'hrEmail']);
    if (mode === 'verify') return normalized(channel, current()?.[channel === 'phone' ? 'phone' : 'hrEmail']);
    const account = auth.findHotelByIdentifier(draft.identifier, library());
    return account ? auth.verifiedTarget(account, channel) : '';
  }
  function save(account, options) { ownSave = true; try { return api.saveAccount(account, options); } finally { ownSave = false; } }
  function switchAccount(id, options) { ownSave = true; try { return api.switchAccount('hotel', id, options); } finally { ownSave = false; } }
  function policyConsent() { return { version: policyVersion, documents: ['terms', 'privacy', 'mini'], acceptedAt: new Date().toISOString(), demoOnly: true }; }
  function tokenFor(node) { return { epoch, node, mode, id: current()?.id || '', version: Number(current()?.opsVersion || 1) }; }
  function stillHere(token) { return token.epoch === epoch && token.node === form() && token.mode === mode && active() && token.id === (current()?.id || '') && token.version === Number(current()?.opsVersion || 1); }
  function setBusy(value) {
    busy = value; const node = form();
    for (const control of node?.querySelectorAll?.('input, select, button') || []) {
      if (value) { disabledBeforeSubmit.set(control, control.disabled); control.disabled = true; }
      else if (disabledBeforeSubmit.has(control)) { control.disabled = disabledBeforeSubmit.get(control); disabledBeforeSubmit.delete(control); }
    }
    const submit = node?.querySelector('[type="submit"]'); if (submit) { submit.disabled = value; submit.setAttribute('aria-busy', String(value)); }
  }
  function finishBusy(token) { if (token.node === form() && active()) setBusy(false); }
  function verifyCode(values) {
    const target = targetForCode();
    if (!rules.validTarget(channel, target) || !rules.verifyChallenge(challenge, { role: 'hotel', mode, channel, target, code: values.code })) {
      if (++attempts >= 5) invalidate('尝试次数已达上限，请重新获取模拟码。');
      api.toast('模拟码不存在、已过期或不匹配，请重新获取。'); return '';
    }
    return target;
  }
  async function submit(event) {
    const node = event.target; if (node.id !== 'hotel-registration-form') return;
    event.preventDefault(); if (!active() || busy || node !== form() || node.dataset.mode !== mode || !node.reportValidity()) return;
    capture(); const values = { ...draft }, account = current();
    if (mode === 'license' || mode === 'verify') {
      if (!account || node.dataset.accountId !== account.id) return api.toast('账户已变化，请重新打开账户资料。');
      if (mode === 'license') {
        if (!rules.businessLicenseComplete(values.businessLicense)) { licenseError = '请先选择营业执照或使用虚构样例。'; renderLicense(); return api.toast(licenseError); }
        if (save({ ...account, businessLicense: { ...values.businessLicense } })) { api.toast('营业执照选件已保存，尚未执行真实审核。'); finish(); } return;
      }
      const target = verifyCode(values); if (!target) return;
      const verification = { ...(account.verification || {}) };
      for (const method of ['phone', 'email']) { const previous = auth.verifiedTarget(account, method); if (previous && !verification[method]) verification[method] = { target: previous, verifiedAt: new Date().toISOString() }; }
      verification[channel] = { target, verifiedAt: new Date().toISOString() };
      if (save({ ...account, verification })) { invalidate(); mode = 'account'; render(); api.toast('已记录本机模拟验证，可使用该联系方式找回密码。'); } return;
    }
    if (!values.ack) return api.toast('请阅读并勾选同意相关协议。');
    const rememberOption = { remember: values.remember === true };
    if (mode === 'register') {
      const identity = { email: normalized('email', values.hrEmail), phone: normalized('phone', values.phone) }, resolution = auth.resolveRegistrationIdentity(identity, library());
      if (resolution.error) return api.toast(resolution.error === 'identity-conflict' ? '手机号与邮箱对应不同账户，请联系酒旅之星处理，不能合并注册。' : resolution.error === 'account-exists' ? '手机号或邮箱已注册，请登录已有账户；忘记密码可通过验证找回。' : '请填写有效的手机号和工作邮箱。');
      const city = regions.findCity(values.cityId), region = regions.findRegion(values.provinceId), group = groupOptions().find(group => group.id === values.groupId);
      if (!String(values.hotelName || '').trim() || !city || !region || city.regionId !== region.id) return api.toast('请填写酒店中文名称，并选择省级单位和所在城市。');
      if (!group) return api.toast('请选择酒店所属集团；独立酒店请选择独立酒店 / 其他集团。');
      const brand = rules.hotelBrandSelection(window.JIULV_HOTEL_GROUPS || [], group.id, values.brandId);
      if (!brand) return api.toast('请选择该集团下的酒店品牌；目录暂未收录的可选择其他品牌 / 待补充。');
      if (!rules.businessLicenseComplete(values.businessLicense)) { licenseError = '请先选择营业执照或使用虚构样例。'; renderLicense(); return api.toast(licenseError); }
      if (!verifyCode(values)) return;
      const error = auth.passwordError(values.password); if (error) return api.toast(error);
      const token = tokenFor(node); setBusy(true);
      try {
        const credential = await auth.createCredential(values.password); if (!stillHere(token)) return;
        if (auth.resolveRegistrationIdentity(identity, library()).error) return api.toast('账户资料已更新，请使用已有账户登录或联系平台。');
        const id = crypto.randomUUID();
        const created = { role: 'hotel', id, hotelId: id, hotelName: values.hotelName.trim(), hotelCity: city.label, hotelCityId: city.id, hotelProvince: region.name, hotelProvinceId: region.id, groupId: group.id, groupName: group.name, ...brand, hrEmail: identity.email, phone: identity.phone, passwordCredential: credential, verification: { [channel]: { target: normalized(channel, channel === 'phone' ? identity.phone : identity.email), verifiedAt: new Date().toISOString() } }, businessLicense: { ...values.businessLicense }, agreementConsent: policyConsent(), demoVerified: true };
        created.demoProfile = Boolean(values.sample && created.hotelName === '星湾示范酒店（虚构）' && created.hrEmail === 'hr@starbay.example.invalid' && created.phone === '13800000101');
        if (save(created, rememberOption)) { api.toast('酒店演示账户已建立，继续刚才的操作。'); finish(); }
      } catch (error) { if (stillHere(token)) api.toast('本机密码处理未完成，请重试；未创建酒店账户。'); }
      finally { finishBusy(token); }
      return;
    }
    if (!['login', 'reset'].includes(mode)) return;
    const found = auth.findHotelByIdentifier(values.identifier, library());
    if (!found) return api.toast('没有找到唯一的本机酒店账户，请核对手机号 / 邮箱或联系平台。');
    const token = tokenFor(node), signature = JSON.stringify(found);
    if (mode === 'login') {
      if (!found.passwordCredential) return api.toast('该旧账户还没有密码，请点击“首次设置密码”，验证原邮箱后继续。');
      setBusy(true);
      try {
        const valid = await auth.verifyPassword(values.password, found.passwordCredential); if (!stillHere(token)) return;
        if (JSON.stringify(library().find(item => item.id === found.id)) !== signature) return api.toast('账户已更新，请重新登录。');
        if (!valid) return api.toast('手机号 / 邮箱或密码不匹配，请重新填写。');
        if (switchAccount(found.id, rememberOption)) finish();
      } catch (error) { if (stillHere(token)) api.toast('暂未完成本机登录，请重试。'); }
      finally { finishBusy(token); }
      return;
    }
    const target = verifyCode(values); if (!target) return;
    const error = auth.passwordError(values.password); if (error) return api.toast(error);
    setBusy(true);
    try {
      const credential = await auth.createCredential(values.password); if (!stillHere(token)) return;
      if (JSON.stringify(library().find(item => item.id === found.id)) !== signature || auth.verifiedTarget(found, channel) !== target) return api.toast('账户资料已更新，请重新验证。');
      if (save({ ...found, passwordCredential: credential, agreementConsent: policyConsent() }, rememberOption)) { api.toast('演示密码已设置，原有招聘计划与记录已保留。'); finish(); }
    } catch (error) { if (stillHere(token)) api.toast('本机密码设置未完成，请重试。'); }
    finally { finishBusy(token); }
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-hotel-reg-action]'); if (!button || !active()) return;
    const action = button.dataset.hotelRegAction; if (action === 'policy') return showPolicy(button.dataset.policy);
    if (busy) return;
    if (action === 'password') { const node = document.getElementById('hotel-password'); if (!node) return; const show = node.type === 'password'; node.type = show ? 'text' : 'password'; button.textContent = show ? '隐藏' : '显示'; button.setAttribute('aria-label', show ? '隐藏密码' : '显示密码'); button.setAttribute('aria-pressed', String(show)); return; }
    if (action === 'contact') { epoch++; invalidate(); return api.showView('contact'); }
    if (action === 'mode' && ['register', 'login'].includes(button.dataset.mode)) { capture(); const previous = mode; mode = button.dataset.mode; if (mode === 'login' && !draft.identifier) draft.identifier = draft.hrEmail || draft.phone || ''; if (previous !== mode) { draft.password = ''; draft.ack = false; } invalidate(); return render(); }
    if (action === 'channel' && ['phone', 'email'].includes(button.dataset.channel) && ['register', 'reset'].includes(mode)) { capture(); channel = button.dataset.channel; invalidate(); return render(); }
    if (action === 'reset') { capture(); const account = current(); draft.identifier = draft.identifier || account?.hrEmail || draft.hrEmail || draft.phone || ''; draft.password = ''; draft.ack = false; mode = 'reset'; const found = auth.findHotelByIdentifier(draft.identifier, library()); channel = found && !auth.verifiedTarget(found, 'phone') && auth.verifiedTarget(found, 'email') ? 'email' : 'phone'; invalidate(); return render(); }
    if (action === 'code' && ['register', 'reset', 'verify'].includes(mode)) { capture(); const target = targetForCode(); if (!rules.validTarget(channel, target)) return api.toast(mode === 'register' ? `请先填写有效的${channel === 'phone' ? '手机号' : '工作邮箱'}。` : '该方式未验证或账户未找到，请切换已验证方式；都不可用时联系酒旅之星。'); challenge = rules.issueChallenge({ role: 'hotel', mode, channel, target }); attempts = 0; draft.code = ''; const code = form()?.elements.namedItem('code'); if (code) code.value = ''; document.getElementById('hotel-code-status').textContent = `本机模拟码：246810；用于 ${target}，5分钟有效。没有实际发送。`; return; }
    if (action === 'sample' && mode === 'register') { capture(); draft = { ...draft, hotelName: '星湾示范酒店（虚构）', provinceId: '31', cityId: '310000', groupId: 'independent', brandId: 'independent', hrEmail: 'hr@starbay.example.invalid', phone: '13800000101', password: 'DemoHotel2026!', businessLicense: rules.sampleBusinessLicense(), sample: true, ack: false }; licenseError = ''; invalidate(); render(); return api.toast('已填入虚构示例，请获取模拟码并阅读协议。'); }
    if (['license-sample', 'license-remove'].includes(action) && ['register', 'license'].includes(mode)) { draft.businessLicense = action === 'license-sample' ? rules.sampleBusinessLicense() : null; licenseError = ''; return renderLicense(); }
    if (action === 'logout') { epoch++; ownSave = true; try { api.logout('hotel'); } finally { ownSave = false; } mode = 'login'; draft = {}; invalidate(); return render(); }
    if (action === 'account') { mode = 'account'; draft = {}; invalidate(); return render(); }
    if (action === 'continue') return finish();
    if (action === 'verify' && current() && ['phone', 'email'].includes(button.dataset.channel)) { mode = 'verify'; channel = button.dataset.channel; draft = {}; invalidate(); return render(); }
  });
  document.addEventListener('change', event => {
    if (!active() || busy) return;
    const node = event.target;
    if (node.id === 'hotel-registration-license' && ['register', 'license'].includes(mode)) { const file = node.files?.[0]; if (!file) return; licenseError = rules.businessLicenseError(file); if (!licenseError) draft.businessLicense = rules.licenseSelection(file); node.value = ''; return renderLicense(); }
    if (node.name === 'groupId' && mode === 'register') { capture(); draft.brandId = ''; invalidate(); return render(); }
    if (node.name === 'provinceId' && mode === 'register') { capture(); const region = regions.findRegion(draft.provinceId); draft.cityId = region && ['municipality', 'special-administrative-region'].includes(region.type) ? region.cities[0].id : ''; invalidate(); return render(); }
  });
  document.addEventListener('input', event => { if (!active()) return; if (['phone', 'hrEmail', 'identifier'].includes(event.target.name)) { epoch++; invalidate('接收信息已修改，原模拟码已作废，请重新获取。'); } });
  document.addEventListener('submit', submit);
  document.addEventListener('jiulv:accountchange', () => { if (ownSave) return; epoch++; busy = false; challenge = null; if (active()) { mode = current() ? 'account' : 'login'; draft = {}; render(); } });
  window.JiulvHotelRegistration = { open, render };
})();
