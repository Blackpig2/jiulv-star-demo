/* Contact form prototype; records stay in this browser and website origin. */
(function () {
  'use strict';
  const api = window.JiulvDemo, C = window.JiulvOperations, e = api.e;
  let memoryGuest = null;
  const rows = () => C.list(api.read(C.TICKETS, []));
  function identity() {
    const role = document.body.dataset.perspective === 'employer' ? 'hotel' : 'student';
    const account = role === 'hotel' ? api.getHotelSession() : api.getStudentSession();
    let guest = api.read('contact:guest:v1', null);
    if (!guest || typeof guest !== 'string') { guest = memoryGuest || crypto.randomUUID(); memoryGuest = guest; api.save('contact:guest:v1', guest); }
    return { role: account ? role : 'guest', ownerKey: C.owner(role, account, guest), label: account?.name || (role === 'hotel' ? '酒店账户' : '') || '访客', hotel: account?.hotelName || '' };
  }
  const date = text => new Date(text).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  function records() {
    const host = document.getElementById('contact-records'); if (!host) return;
    const mine = C.ownTickets(rows(), identity().ownerKey);
    host.innerHTML = mine.length ? mine.map(row => `<article class="contact-record"><div class="contact-record-top"><b>${e(C.categories[row.category] || '其他问题')}</b><span class="contact-status ${e(row.status)}">${e(C.ticketStatuses[row.status] || '待处理')}</span></div><p>${e(row.message)}</p><small>${e(date(row.createdAt))} · 编号 ${e(row.id.slice(0, 8))} · 仅本机</small>${(row.replies || []).map(reply => `<div class="contact-reply"><b>平台回复演示</b><p>${e(reply.text)}</p><small>${e(date(reply.at))} · 未发送邮件或消息</small></div>`).join('')}</article>`).join('') : `<div class="contact-empty"><span aria-hidden="true">${window.JiulvIcons?.svg("mail") || "✉"}</span><h3>你的声音，从这里留下</h3><p>保存后可以在这里回看。当前尚未接通在线客服。</p></div>`;
  }
  function render() {
    const host = document.getElementById('contact-view'); if (!host) return;
    const actor = identity();
    host.innerHTML = `<div class="contact-heading"><span class="overline">WE ARE LISTENING</span><h1>联系酒旅之星</h1><p>有疑问、有建议，或者发现信息需要更新，<br>都可以在这里说一说。</p></div><div class="contact-layout"><section class="contact-panel"><div class="contact-channel"><span class="contact-illustration" aria-hidden="true"><img src="favicon.svg" width="48" height="48" alt=""></span><div><h2>把问题留给我们</h2><p>使用帮助 · 信息纠错 · 酒店合作 · 产品建议</p></div></div><div class="contact-demo-note"><b>当前是留言功能演示</b><p>仅保存到此浏览器，平台尚不能在线收到。正式客服邮箱与微信渠道待配置；请勿填写真实敏感资料。</p></div><form id="contact-form" data-owner="${e(actor.ownerKey)}"><label>问题类型<select name="category">${Object.entries(C.categories).map(([key, label]) => `<option value="${key}">${label}</option>`).join('')}</select></label><label>想告诉我们什么？<textarea name="message" required minlength="5" maxlength="1200" rows="5" placeholder="例如：某酒店的住宿信息可能已更新，希望平台再核对一下。"></textarea><small>5–1200 字，不需要上传证件或简历</small></label><label>希望如何回复你？<span class="contact-optional">选填</span><input name="replyTo" maxlength="160" placeholder="演示请使用虚构邮箱，或留空后在此查看回复"></label><label class="contact-consent"><input type="checkbox" name="ack" required><span>我了解当前仅保存本机演示留言，尚未送达平台。</span></label><div class="contact-submit"><button type="submit" class="primary">保存留言（本机演示） <span aria-hidden="true">↗</span></button><small>${e(actor.label)}${actor.hotel ? ` · ${e(actor.hotel)}` : ''}</small></div></form></section><section class="contact-panel contact-history"><div class="contact-history-head"><div><span class="overline">MY MESSAGES</span><h2>我的留言记录</h2></div><button class="text-button" type="button" data-contact-refresh>刷新记录 ↻</button></div><p class="contact-history-note">${actor.role === 'guest' ? '访客记录仅属于此浏览器访客身份；注册后显示账户自己的记录。' : '仅显示当前账户的留言。切换账户时，记录会分开显示。'}</p><div id="contact-records" aria-live="polite"></div></section></div>`;
    records();
  }
  document.addEventListener('submit', event => {
    const form = event.target; if (form.id !== 'contact-form') return;
    event.preventDefault(); if (!form.reportValidity()) return;
    const actor = identity(); if (actor.ownerKey !== form.dataset.owner) { render(); return api.toast('账户已变化，请重新填写留言。'); }
    const data = Object.fromEntries(new FormData(form)); if (data.ack !== 'on') return;
    try { const record = C.createTicket({ ...data, ...actor, id: crypto.randomUUID() }); if (!api.save(C.TICKETS, [...rows(), record])) return; form.reset(); records(); api.toast('留言已保存到本机演示，尚未送达平台。'); document.getElementById('contact-records')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (error) { api.toast(error.message); }
  });
  document.addEventListener('click', event => { if (event.target.closest('[data-contact-refresh]')) { records(); api.toast('已刷新当前浏览器的留言记录。'); } });
  document.addEventListener('jiulv:accountchange', () => { if (document.querySelector('#contact-view')?.hidden === false) render(); });
  window.addEventListener('storage', event => { if (document.querySelector('#contact-view')?.hidden === false) { if (event.key === C.PREFIX + C.TICKETS) records(); else if (event.key === C.PREFIX + 'sessions:v4') render(); } });
  window.JiulvFeatures.contact = { render };
})();
