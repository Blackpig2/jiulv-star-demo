(function () {
  'use strict';
  const prefix = 'jiulv:v2:', rules = window.JiulvAccountCore, e = escapeHTML;
  function load(key, fallback) { try { return JSON.parse(localStorage.getItem(prefix + key)) ?? fallback; } catch { return fallback; } }
  function save(key, value) { try { localStorage.setItem(prefix + key, JSON.stringify(value)); return true; } catch { toast('本机保存失败，请检查存储空间或减少图片后重试。'); return false; } }
  function remove(key) { try { localStorage.removeItem(prefix + key); return true; } catch { toast('无法清除本机数据，请检查浏览器设置。'); return false; } }
  function getAccounts() { return rules.accountLibrary(load('accounts:v4', {})); }
  const hotelSessionKey = prefix + 'sessions:hotel:v1', hotelRememberMs = 30 * 24 * 60 * 60 * 1000;
  let hotelMemorySession = null;
  function persistentSessions() { const raw = load('sessions:v4', {}); return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}; }
  function hotelTabSession() {
    try { return typeof sessionStorage === 'undefined' ? hotelMemorySession : JSON.parse(sessionStorage.getItem(hotelSessionKey)); } catch { return null; }
  }
  function saveHotelTabSession(value) {
    try {
      if (typeof sessionStorage === 'undefined') hotelMemorySession = value;
      else if (value) sessionStorage.setItem(hotelSessionKey, JSON.stringify(value));
      else sessionStorage.removeItem(hotelSessionKey);
      return true;
    } catch { toast('浏览器无法保存本次登录，请检查存储设置后重试。'); return false; }
  }
  function sessions() {
    const raw = { ...persistentSessions() }, tab = hotelTabSession();
    if (Object.hasOwn(raw, 'hotelExpiresAt') && (!Number.isFinite(raw.hotelExpiresAt) || Date.now() >= raw.hotelExpiresAt)) { delete raw.hotel; delete raw.hotelExpiresAt; }
    if (tab?.accountId) raw.hotel = tab.accountId;
    return raw;
  }
  function getSession(role) { return getAccounts()[rules.roleKey(role)].find(a => a.id === sessions()[role]) || null; }
  const getStudentSession = () => getSession('student');
  const getHotelSession = () => getSession('hotel');
  const getAccount = () => { const a = getStudentSession(); return rules.studentComplete(a) ? a : null; };
  const getHotelAccount = () => { const a = getHotelSession(); return rules.hotelComplete(a) ? a : null; };
  const getIdentity = () => getSession(sessions().activeRole === 'hotel' ? 'hotel' : 'student');
  function updateAccount() {
    const student = getStudentSession(), hotel = getHotelSession();
    document.querySelectorAll('[data-account-label]').forEach(node => { const role = node.closest('[data-registration-role]')?.dataset.registrationRole; const a = role === 'hotel' ? hotel : role === 'student' ? student : getIdentity(); node.textContent = a ? `${a.name || a.reporterName || '我的账号'} · 本机演示` : '注册 / 登录'; });
    document.querySelectorAll('[data-hotel-account-label]').forEach(node => { node.textContent = hotel ? `${hotel.hotelName} · 本机演示` : '酒店注册 / 登录'; });
  }
  function accountChanged() { updateAccount(); document.dispatchEvent(new CustomEvent('jiulv:accountchange', { detail: { identity: getIdentity() } })); }
  function switchAccount(role, accountId, options = {}) {
    if (!['student', 'hotel'].includes(role) || !getAccounts()[rules.roleKey(role)].some(a => a.id === accountId)) return false;
    const current = persistentSessions();
    if (role === 'hotel') {
      const explicit = typeof options.remember === 'boolean';
      const remembered = current.hotel === accountId && (!Object.hasOwn(current, 'hotelExpiresAt') || Number.isFinite(current.hotelExpiresAt) && Date.now() < current.hotelExpiresAt);
      const remember = explicit ? options.remember : remembered && !hotelTabSession();
      if (remember) {
        if (!save('sessions:v4', { ...current, hotel: accountId, hotelExpiresAt: explicit || !Number.isFinite(current.hotelExpiresAt) ? Date.now() + hotelRememberMs : current.hotelExpiresAt, activeRole: role })) return false;
        if (!saveHotelTabSession(null)) return false;
      } else {
        const next = { ...current, activeRole: role }; delete next.hotel; delete next.hotelExpiresAt;
        if (!save('sessions:v4', next) || !saveHotelTabSession({ accountId })) return false;
      }
    } else if (!save('sessions:v4', { ...current, student: accountId, activeRole: role })) return false;
    accountChanged(); return true;
  }
  function saveAccount(account, options = {}) {
    const library = getAccounts(), key = rules.roleKey(account.role), existing = library[key].findIndex(a => a.id === account.id);
    if (existing < 0) library[key].push(account); else library[key][existing] = account;
    if (!save('accounts:v4', library)) return false;
    return switchAccount(account.role, account.id, options);
  }
  function logout(role) {
    const current = persistentSessions(); delete current[role];
    if (role === 'hotel') { delete current.hotelExpiresAt; if (!saveHotelTabSession(null)) return false; }
    if (!save('sessions:v4', current)) return false;
    accountChanged(); return true;
  }
  function openRegistration(role = 'student', callback) {
    const view = [...document.querySelectorAll('.view')].find(node => !node.hidden)?.id.replace(/-view$/, '');
    if (document.querySelector('#modal')?.open) document.querySelector('#modal').close();
    if (window.JiulvFeatures.register) window.JiulvFeatures.register.open(role, callback, view === 'register' ? null : view);
    else toast('注册模块正在加载，请稍后重试。');
  }
  function requireAccount(callback) { if (getAccount()) callback(); else openRegistration('student', callback); }
  function requireHotelAccount(callback) { if (getHotelAccount()) callback(); else openRegistration('hotel', callback); }
  function download(filename, content, type = 'text/plain;charset=utf-8') { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000); }
  function readImage(file) { return new Promise((resolve, reject) => {
    if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return reject(new Error('请选择 JPG、PNG 或 WebP 图片。'));
    if (file.size > 2 * 1024 * 1024) return reject(new Error('单张图片请小于 2 MB。'));
    const reader = new FileReader(); reader.onerror = () => reject(new Error('图片读取失败，请重试。'));
    reader.onload = () => { const picture = new Image(); picture.onload = () => resolve(String(reader.result)); picture.onerror = () => reject(new Error('无法识别图片内容，请更换文件。')); picture.src = String(reader.result); }; reader.readAsDataURL(file);
  }); }
  if (!load('accounts:migrated:v4', false)) {
    const old = load('account', null), library = getAccounts();
    if (old?.id && old.demoVerified === true && !library.students.some(a => a.id === old.id)) {
      library.students.push({ ...old, role: 'student', major: String(old.major || ''), discoverable: false });
      if (save('accounts:v4', library)) save('sessions:v4', { ...persistentSessions(), student: old.id, activeRole: 'student' });
    }
    save('accounts:migrated:v4', true);
  }
  window.JiulvFeatures = window.JiulvFeatures || {};
  window.JiulvDemo = { e, read: load, save, remove, toast, modal: openModal, download, readImage, showView, getAccount, getHotelAccount, getIdentity, getStudentSession, getHotelSession, getAccounts, saveAccount, switchAccount, logout, requireAccount, requireHotelAccount, openRegistration, updateAccount };
  document.addEventListener('click', event => {
    const roleButton = event.target.closest('[data-registration-role]');
    if (roleButton) return openRegistration(roleButton.dataset.registrationRole);
    const action = event.target.closest('[data-demo-action]')?.dataset.demoAction;
    if (action === 'account') openRegistration(document.body.dataset.perspective === 'employer' ? 'hotel' : 'student');
    if (action === 'go-resume') { document.querySelector('#modal')?.close(); showView('resume'); }
    if (action === 'logout') { logout(getIdentity()?.role || 'student'); document.querySelector('#modal')?.close(); showView('jobs'); }
  });
  window.addEventListener?.('storage', event => {
    if (event.key === prefix + 'accounts:v4') { updateAccount(); toast('账户资料已在另一页面更新；重新打开资料页可查看，当前未保存的填写内容会保留。'); }
    if (event.key === prefix + 'sessions:v4') accountChanged();
  });
  updateAccount();
})();
