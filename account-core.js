(function (root) {
  'use strict';
  const clean = value => String(value ?? '').trim();
  const roleKey = role => role === 'hotel' ? 'hotels' : 'students';
  const normalizeTarget = (channel, value) => channel === 'phone' ? clean(value).replace(/\s/g, '') : clean(value).toLowerCase();
  const validTarget = (channel, value) => channel === 'phone' ? /^1\d{10}$/.test(normalizeTarget(channel, value)) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeTarget(channel, value)) && clean(value).length <= 160;
  const wechatDemoComplete = account => account?.demoAuthProvider === 'wechat' && /^wechat-demo:[0-9a-f-]{36}$/i.test(String(account.wechatDemoIdentity || ''));
  const studentComplete = account => Boolean(account && account.role === 'student' && account.id && account.demoVerified === true && (validTarget('phone', account.phone) || validTarget('email', account.email) || wechatDemoComplete(account)));
  // A verified phone and a stable WeChat identity may point to one existing student.
  // Never merge two account IDs: both can already own applications and resume drafts.
  function resolveStudentIdentity(accounts, { phone = '', wechatDemoIdentity = '', currentId = '', phoneVerified = false } = {}) {
    const students = (Array.isArray(accounts) ? accounts : []).filter(a => a?.role === 'student' && a.id);
    const target = normalizeTarget('phone', phone);
    if (target && (!validTarget('phone', target) || !phoneVerified)) return { error: 'phone-verification-required' };
    if (wechatDemoIdentity && !/^wechat-demo:[0-9a-f-]{36}$/i.test(wechatDemoIdentity)) return { error: 'invalid-wechat-identity' };
    const phoneMatches = target ? students.filter(a => normalizeTarget('phone', a.phone) === target) : [];
    const wechatMatches = wechatDemoIdentity ? students.filter(a => a.wechatDemoIdentity === wechatDemoIdentity) : [];
    if (phoneMatches.length > 1 || wechatMatches.length > 1) return { error: 'identity-conflict' };
    const ids = [...new Set([currentId, phoneMatches[0]?.id, wechatMatches[0]?.id].filter(Boolean))];
    if (ids.length > 1) return { error: 'identity-conflict' };
    const account = students.find(a => a.id === ids[0]);
    if (account?.wechatDemoIdentity && wechatDemoIdentity && account.wechatDemoIdentity !== wechatDemoIdentity) return { error: 'identity-conflict' };
    return { accountId: account?.id || null, existing: Boolean(account) };
  }
  const licenseTypes = { 'image/jpeg': ['jpg', 'jpeg'], 'image/png': ['png'], 'image/webp': ['webp'], 'application/pdf': ['pdf'] };
  const licenseMaxBytes = 5 * 1024 * 1024;
  function businessLicenseError(file) {
    if (!file) return '请先选择营业执照文件，或主动使用虚构样例。';
    const name = clean(file.name), extension = name.split('.').pop().toLowerCase();
    if (!name || name.length > 200 || !Object.hasOwn(licenseTypes, file.type) || !licenseTypes[file.type].includes(extension)) return '请选择 JPG、PNG、WebP 图片或 PDF；文件扩展名与格式需要一致。';
    if (!Number.isFinite(file.size) || file.size <= 0 || file.size > licenseMaxBytes) return '文件不能为空，且单个文件不能超过 5 MB。';
    return '';
  }
  function licenseSelection(file, now = Date.now()) {
    if (businessLicenseError(file)) return null;
    return { name: clean(file.name), type: file.type, size: file.size, source: 'local-selection', demoOnly: true, selectedAt: now };
  }
  const sampleBusinessLicense = () => ({ name: '虚构酒店营业执照样例.pdf', type: 'application/pdf', size: 1024, source: 'sample', demoOnly: true, selectedAt: Date.now() });
  const businessLicenseComplete = value => Boolean(value && value.demoOnly === true && ['local-selection', 'sample'].includes(value.source) && !businessLicenseError(value));
  function hotelVerifiedTarget(account, method) {
    if (account?.role !== 'hotel' || account.demoVerified !== true || !['phone', 'email'].includes(method)) return '';
    const target = normalizeTarget(method, method === 'phone' ? account.phone : account.hrEmail);
    if (!validTarget(method, target)) return '';
    // Before dual-channel registration, every hotel account used email OTP.
    // An explicit empty verification object revokes that legacy assumption.
    if (!Object.hasOwn(account, 'verification')) return method === 'email' && !['pending', 'removed'].includes(account.opsContactVerification?.hrEmail?.status) ? target : '';
    const record = account.verification?.[method];
    if (!record || !Number.isFinite(Date.parse(record.verifiedAt || ''))) return '';
    return normalizeTarget(method, record.target) === target ? target : '';
  }
  function hotelAccess(account) {
    if (!account) return { allowed: false, reason: 'missing-account' };
    if (account.role !== 'hotel') return { allowed: false, reason: 'wrong-role' };
    if (!clean(account.id) || account.demoVerified !== true || !clean(account.hotelName) || !clean(account.hotelCity) || !validTarget('email', account.hrEmail)) return { allowed: false, reason: 'incomplete-profile' };
    if (!hotelVerifiedTarget(account, 'email') && !hotelVerifiedTarget(account, 'phone')) return { allowed: false, reason: 'unverified-contact' };
    if (!businessLicenseComplete(account.businessLicense)) return { allowed: false, reason: 'missing-license' };
    return { allowed: true, reason: 'demo-profile-complete' };
  }
  const hotelComplete = account => hotelAccess(account).allowed;
  function accountLibrary(raw) { return { students: Array.isArray(raw?.students) ? raw.students.filter(a => a && a.id && a.role === 'student') : [], hotels: Array.isArray(raw?.hotels) ? raw.hotels.filter(a => a && a.id && a.role === 'hotel') : [] }; }
  function issueChallenge({ role, mode, channel, target }, now = Date.now()) {
    if (!validTarget(channel, target)) return null;
    return { role, mode, channel, target: normalizeTarget(channel, target), issuedAt: now, expiresAt: now + 5 * 60 * 1000, code: '246810' };
  }
  function verifyChallenge(challenge, { role, mode, channel, target, code }, now = Date.now()) { return Boolean(challenge && challenge.role === role && challenge.mode === mode && challenge.channel === channel && challenge.target === normalizeTarget(channel, target) && clean(code) === challenge.code && now >= challenge.issuedAt && now < challenge.expiresAt); }
  const examples = {
    student: { name: '林星禾（虚构）', school: '星河文旅学院（虚构）', major: '酒店管理与数字化运营', phone: '13800000000', email: 'student@example.invalid' },
    hotel: { hotelName: '星湾示范酒店（虚构）', hotelCity: '上海 · 示例区域', reporterName: '示例 HR（虚构）', hrEmail: 'hr@starbay.example.invalid' }
  };
  function isExample(role, values, channel, activated) { if (!activated) return false; const keys = role === 'hotel' ? ['hotelName', 'hotelCity', 'reporterName', 'hrEmail'] : [...['name', 'school', 'major'].filter(key => clean(values[key])), ...(channel === 'wechat' ? [] : [channel]), ...['phone', 'email'].filter(key => clean(values[key]))]; return keys.every(key => clean(values[key]) === examples[role][key]); }
  const api = { clean, roleKey, normalizeTarget, validTarget, wechatDemoComplete, studentComplete, resolveStudentIdentity, hotelComplete, hotelAccess, hotelVerifiedTarget, businessLicenseError, licenseSelection, sampleBusinessLicense, businessLicenseComplete, licenseMaxBytes, accountLibrary, issueChallenge, verifyChallenge, examples, isExample };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.JiulvAccountCore = api;
})(typeof window !== 'undefined' ? window : this);
