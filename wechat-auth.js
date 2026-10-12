/* WeChat Mini Program adapter. Never invoked by the browser demo. */
(function (root) {
  'use strict';
  const isDemoIdentity = value => typeof value === 'string' && /^wechat-demo:[0-9a-f-]{36}$/i.test(value);
  function createDemoIdentity(uuid) {
    if (typeof uuid !== 'string' || !/^[0-9a-f-]{36}$/i.test(uuid)) throw new Error('Invalid demo identity');
    return 'wechat-demo:' + uuid;
  }
  const hasText = value => typeof value === 'string' && value.trim().length > 0;
  function hasServerCredential(value, seen = new Set()) {
    if (!value || typeof value !== 'object' || seen.has(value)) return false;
    seen.add(value);
    return Object.keys(value).some(key => /^(session_?key|app_?secret|access_?token)$/i.test(key) || hasServerCredential(value[key], seen));
  }
  function isHttpsEndpoint(value) {
    if (typeof value !== 'string') return false;
    const match = value.match(/^https:\/\/([a-z0-9.-]+)(?::(\d{1,5}))?(?:[/?][^\s#]*)?$/i);
    if (!match || !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(match[1]) || match[1].includes('..')) return false;
    return !match[2] || Number(match[2]) > 0 && Number(match[2]) <= 65535;
  }
  // Native Mini Program only. Pass the successful bindgetphonenumber event.detail as
  // phoneAuthorization and policyConsent: { accepted: true, version?: '...' }.
  // The native caller must also complete WeChat privacy authorization; this consent
  // record cannot replace an actual agreePrivacyAuthorization button interaction.
  // The server exchanges phoneCode and loginCode independently, binds the verified
  // phone to the server-derived WeChat identity, and issues only its own session.
  function loginMiniProgram(wxAPI, options = {}) {
    if (typeof window !== 'undefined' && typeof document !== 'undefined' || options.miniProgramRuntime !== true || typeof wxAPI?.login !== 'function' || typeof wxAPI?.request !== 'function') return Promise.reject(new Error('请在真实微信小程序环境中调用手机号验证接口。'));
    if (!isHttpsEndpoint(options.endpoint)) return Promise.reject(new Error('手机号验证服务尚未配置，请先部署服务端并设置 HTTPS 接口域名。'));
    if (hasServerCredential(options)) return Promise.reject(new Error('微信服务端密钥不应配置在客户端。'));
    const consent = options.policyConsent;
    if (!consent || consent.accepted !== true) return Promise.reject(new Error('请先阅读并同意用户协议和隐私说明。'));
    if (consent.version !== undefined && !hasText(consent.version)) return Promise.reject(new Error('隐私说明版本无效，请重新确认。'));
    const phone = options.phoneAuthorization;
    if (!phone || phone.errMsg !== 'getPhoneNumber:ok' || phone.errno != null && phone.errno !== 0) return Promise.reject(new Error('手机号授权未完成或已取消，请重新授权。'));
    if (!hasText(phone.code)) return Promise.reject(new Error('微信没有返回手机号授权凭证，请重试。'));
    const phoneCode = phone.code;
    const policyConsent = { accepted: true };
    if (consent.version !== undefined) policyConsent.version = consent.version.trim();
    return new Promise((resolve, reject) => {
      try {
        wxAPI.login({ timeout: 10000, success(result) {
          if (!hasText(result?.code)) return reject(new Error('微信没有返回登录凭证，请重试。'));
          if (result.code === phoneCode) return reject(new Error('手机号授权凭证与登录凭证不能混用，请重新授权。'));
          try {
            wxAPI.request({ url: options.endpoint, method: 'POST', timeout: 15000, header: {'content-type':'application/json'}, data: { loginCode: result.code, phoneCode, policyConsent }, success(response) {
              const data = response?.data;
              if (hasServerCredential(data)) return reject(new Error('登录服务返回了不应发送到客户端的字段。'));
              if (!(response?.statusCode >= 200 && response.statusCode < 300) || !hasText(data?.sessionToken) || !hasText(data?.accountId)) return reject(new Error('登录服务未返回有效会话。'));
              resolve({sessionToken:data.sessionToken,accountId:data.accountId});
            }, fail() { reject(new Error('连接登录服务失败，请稍后重试。')); }});
          } catch (_) { reject(new Error('连接登录服务失败，请稍后重试。')); }
        }, fail() { reject(new Error('微信登录未完成，请重试。')); }});
      } catch (_) { reject(new Error('微信登录未完成，请重试。')); }
    });
  }
  const api = {isDemoIdentity,createDemoIdentity,loginMiniProgram};
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.JiulvWechatAuth = api;
})(typeof window !== 'undefined' ? window : this);
