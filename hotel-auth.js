(function (root) {
  'use strict';
  // This browser-only credential store is for the demo. Production authentication,
  // OTP verification, credential hashes and session tokens belong on the server.
  const clean = value => String(value ?? '').trim();
  const accountRules = root.JiulvAccountCore || (typeof module !== 'undefined' && module.exports ? require('./account-core.js') : null);
  const normalizeEmail = value => clean(value).toLowerCase();
  const normalizePhone = value => clean(value).replace(/\s/g, '');
  const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value)) && clean(value).length <= 160;
  const validPhone = value => /^1\d{10}$/.test(normalizePhone(value));
  const ITERATIONS = 600000;
  const hex = value => [...new Uint8Array(value)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  const unhex = value => Uint8Array.from(value.match(/.{2}/g), byte => parseInt(byte, 16));
  function passwordError(password) {
    if (typeof password !== 'string' || password.length < 8 || password.length > 64) return '请设置 8–64 位密码。';
    if (!password.trim()) return '密码不能全部为空格。';
    return '';
  }
  function webCrypto() {
    const api = root.crypto || globalThis.crypto;
    if (!api?.subtle || !api.getRandomValues) throw new Error('当前浏览器暂不支持安全保存演示密码，请使用 HTTPS 或本机预览。');
    return api;
  }
  async function derive(password, salt, iterations) {
    const api = webCrypto();
    const key = await api.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    return hex(await api.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256));
  }
  async function createCredential(password) {
    const error = passwordError(password); if (error) throw new Error(error);
    const salt = webCrypto().getRandomValues(new Uint8Array(16));
    return { version: 1, algorithm: 'PBKDF2-SHA256', iterations: ITERATIONS, salt: hex(salt), hash: await derive(password, salt, ITERATIONS), demoOnly: true };
  }
  async function verifyPassword(password, credential) {
    if (passwordError(password) || !credential || credential.version !== 1 || credential.algorithm !== 'PBKDF2-SHA256' || credential.iterations !== ITERATIONS || credential.demoOnly !== true || !/^[a-f0-9]{32}$/.test(credential.salt || '') || !/^[a-f0-9]{64}$/.test(credential.hash || '')) return false;
    const actual = await derive(password, unhex(credential.salt), credential.iterations);
    let difference = 0; for (let i = 0; i < actual.length; i++) difference |= actual.charCodeAt(i) ^ credential.hash.charCodeAt(i);
    return difference === 0;
  }
  const hotels = accounts => (Array.isArray(accounts) ? accounts : []).filter(account => account?.role === 'hotel' && account.id);
  function findHotelByIdentifier(identifier, accounts = []) {
    const value = clean(identifier);
    if (!validPhone(value) && !validEmail(value)) return null;
    const matches = hotels(accounts).filter(account => validPhone(value) ? normalizePhone(account.phone) === normalizePhone(value) : normalizeEmail(account.hrEmail) === normalizeEmail(value));
    return matches.length === 1 ? matches[0] : null;
  }
  function resolveRegistrationIdentity({ email = '', phone = '' } = {}, accounts = []) {
    if (!validEmail(email)) return { error: 'invalid-email' };
    if (!validPhone(phone)) return { error: 'invalid-phone' };
    const emailMatches = hotels(accounts).filter(account => normalizeEmail(account.hrEmail) === normalizeEmail(email));
    const phoneMatches = hotels(accounts).filter(account => normalizePhone(account.phone) === normalizePhone(phone));
    const ids = new Set([...emailMatches, ...phoneMatches].map(account => account.id));
    if (emailMatches.length > 1 || phoneMatches.length > 1 || ids.size > 1) return { error: 'identity-conflict' };
    if (ids.size) return { error: 'account-exists', accountId: [...ids][0], existing: true };
    return { existing: false, accountId: null };
  }
  function verifiedTarget(account, method) {
    return accountRules?.hotelVerifiedTarget(account, method) || '';
  }
  const api = { passwordError, createCredential, verifyPassword, findHotelByIdentifier, resolveRegistrationIdentity, verifiedTarget, ITERATIONS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.JiulvHotelAuth = api;
})(typeof window !== 'undefined' ? window : globalThis);
