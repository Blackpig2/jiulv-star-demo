/* Shared local contact / operations rules. No network, authentication or real customer support. */
(function (root) {
  'use strict';
  const PREFIX = 'jiulv:v2:', TICKETS = 'contact:tickets:v1', AUDIT = 'ops:audit:v1', OVERLAYS = 'ops:notes:v1', SANDBOX = 'ops:sandbox:v1';
  const categories = { usage: '使用帮助', information: '岗位信息纠错', feedback: '产品建议', hotel: '酒店入驻咨询', privacy: '资料与隐私', other: '其他问题' };
  const ticketStatuses = { pending: '待处理', processing: '处理中', replied: '已回复', resolved: '已结束' };
  const list = value => Array.isArray(value) ? value.filter(row => row && typeof row === 'object' && typeof row.id === 'string') : [];
  const clean = value => String(value ?? '').trim();
  function owner(role, account, guestId) { return account?.id && ['student', 'hotel'].includes(role) ? `${role}:${account.id}` : `guest:${clean(guestId)}`; }
  function ownTickets(rows, ownerKey) { return list(rows).filter(row => row.ownerKey === ownerKey).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))); }
  function createTicket({ id, ownerKey, role, category, message, replyTo = '' }, now = new Date().toISOString()) {
    if (!clean(id) || !/^(student|hotel|guest):.+$/.test(clean(ownerKey))) throw new Error('请刷新后重新留言。');
    if (!Object.hasOwn(categories, category)) throw new Error('请选择问题类型。');
    const text = clean(message), reply = clean(replyTo);
    if (text.length < 5 || text.length > 1200) throw new Error('请填写 5–1200 字的问题描述。');
    if (reply.length > 160) throw new Error('回复方式最多 160 字。');
    return { id: clean(id), ownerKey, role: role === 'hotel' ? 'hotel' : role === 'student' ? 'student' : 'guest', category, message: text, replyTo: reply, status: 'pending', replies: [], version: 1, createdAt: now, updatedAt: now, demoOnly: true };
  }
  function updateTicket(row, { version, status, reply = '' }, now = new Date().toISOString()) {
    if (!row || row.version !== Number(version)) throw new Error('记录已更新，请关闭后重新打开。');
    if (!Object.hasOwn(ticketStatuses, status)) throw new Error('请选择有效状态。');
    const text = clean(reply);
    if (text.length > 1200) throw new Error('回复最多 1200 字。');
    if (status === 'replied' && !text && !row.replies?.length) throw new Error('请填写回复后再标记已回复。');
    return { ...row, status, version: row.version + 1, updatedAt: now, replies: [...(Array.isArray(row.replies) ? row.replies : []), ...(text ? [{ text, at: now, demoOnly: true }] : [])] };
  }
  function moderate(kind, row, status, reason, proofs, sample = false, now = new Date().toISOString()) {
    if (!row) throw new Error('记录不存在，请刷新。');
    const allowed = kind === 'proofs' ? ['approved', 'rejected'] : kind === 'reviews' ? ['published', 'rejected'] : kind === 'reports' ? ['resolved'] : [];
    if (!allowed.includes(status)) throw new Error('不支持此处理操作。');
    const note = clean(reason);
    if (note.length < 3 || note.length > 600) throw new Error('请填写 3–600 字的处理说明。');
    if (kind === 'proofs' && status === 'approved' && (!row.accountId || !row.realName || !row.hotelId || !row.role || (!row.file?.data && !(sample && row.sample)))) throw new Error('证明缺少身份、岗位或附件，不能通过。');
    if (kind === 'reviews' && status === 'published') {
      const proof = list(proofs).find(p => p.id === row.proofId && p.accountId === row.accountId && p.hotelId === row.hotelId && p.role === row.role && p.status === 'approved');
      if (!proof) throw new Error('对应身份、酒店和岗位的证明尚未通过，不能展示评价。');
    }
    return { ...row, status, reason: note, reviewedAt: now };
  }
  function unpublishForProof(reviews, proofId, now = new Date().toISOString()) { return list(reviews).map(row => row.proofId === proofId && row.status === 'published' ? { ...row, status: 'rejected', reason: '对应实习证明需要补充，评价暂不展示；请补充证明后重新核对。', reviewedAt: now } : row); }
  function snapshot(read, jobs = []) {
    const library = read('accounts:v4', {});
    const students = list(library?.students), hotels = list(library?.hotels);
    return { students: students.map(row => ({ ...row, resume: read(`resumeDraft:${row.id}`, null) })), hotels: hotels.map(row => {
      const savedInformation = read(`hotel:information:${row.id}`, null);
      const hotelInformation = savedInformation?.accountId === row.id ? savedInformation : null;
      const planLibrary = read(`hotel:plans:${row.id}`, null);
      if (planLibrary?.accountId === row.id && Array.isArray(planLibrary.plans)) {
        return { ...row, hotelInformation, recruitmentPlans: list(planLibrary.plans), questionnaire: null, conditionProfiles: [], recruitmentBatches: [] };
      }
      const conditions = read(`hotel:conditions:${row.id}`, null);
      const conditionProfiles = conditions?.accountId === row.id ? list(conditions.profiles) : [];
      return { ...row, hotelInformation, questionnaire: conditionProfiles.find(profile => profile.id === 'default')?.draft || read(`hotel:draft:${row.id}`, null), conditionProfiles, recruitmentBatches: list(read(`employer:hotel:${encodeURIComponent(row.id)}:batches`, [])) };
    }), jobs: list(jobs), applications: list(read('outreach:v5', [])), deliveries: list(read('deliveries:v5', [])), proofs: list(read('proofs', [])), reviews: list(read('reviews', [])), reports: list(read('reports', [])), contacts: list(read(TICKETS, [])), logs: list(read(AUDIT, [])), notes: read(OVERLAYS, {}) || {} };
  }
  function sampleData(now = new Date().toISOString()) {
    const student = { id: 'ops-sample-student', role: 'student', name: '林小舟（虚构）', school: '星河文旅学院（虚构）', major: '酒店管理', discoverable: true, demoProfile: true, resume: { startDate: '2027-02-01', duration: '6个月', savedAt: now } };
    const hotel = { id: 'ops-sample-hotel', hotelId: 'ops-sample-hotel', hotelName: '星屿示范酒店（虚构）', hotelCity: '上海 · 示例区', reporterName: '示例 HR', hrEmail: 'hr@example.invalid', businessLicense: { name: '虚构执照样例.pdf', type: 'application/pdf', size: 1024, source: 'sample' }, questionnaire: { savedAt: now, values: { jobTitle: '前厅实习生', stipend: '2800', headcount: '6', startDate: '2027-02-01', durationMonths: '6', dormOccupancy: '4', commuteMinutes: '15', mealsPerDay: '3', liabilityInsurance: '待确认', daysOff: '8' } } };
    const proof = { id: 'ops-sample-proof', accountId: student.id, realName: student.name, school: student.school, hotelId: hotel.id, hotelName: hotel.hotelName, role: '餐饮实习生', startMonth: '2026-03', endMonth: '2026-08', file: { name: '虚构实习证明.pdf', type: 'application/pdf' }, status: 'pending', sample: true, createdAt: now };
    return { students: [student], hotels: [hotel], jobs: [{ id: 'ops-sample-job', name: hotel.hotelName, city: '上海', role: '前厅实习生', salaryMin: 2800, recruitmentStatus: '虚构样例', checkedAt: '2026-09-29' }], applications: [{ id: 'ops-sample-application', studentId: student.id, hotelAccountId: hotel.id, hotelId: hotel.id, hotelName: hotel.hotelName, position: '前厅实习生', stage: 'pending_hotel', origin: 'application', createdAt: now, history: [{ label: '已保存本机投递授权', at: now }] }], deliveries: [], proofs: [proof], reviews: [{ id: 'ops-sample-review', accountId: student.id, proofId: proof.id, hotelId: hotel.id, hotelName: hotel.hotelName, role: proof.role, anonymous: true, content: '这是虚构评价示例：带教师傅会演示摆台流程，忙碌时也希望可以提前明确休息安排。', status: 'pending', createdAt: now }], reports: [], contacts: [createTicket({ id: 'ops-sample-ticket', ownerKey: `student:${student.id}`, role: 'student', category: 'usage', message: '我是虚构样例：请问保存简历后，怎样查看每次投递的进度？' }, now)], logs: [], notes: {} };
  }
  const api = { PREFIX, TICKETS, AUDIT, OVERLAYS, SANDBOX, categories, ticketStatuses, list, clean, owner, ownTickets, createTicket, updateTicket, moderate, unpublishForProof, snapshot, sampleData };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.JiulvOperations = api;
})(typeof window !== 'undefined' ? window : this);
