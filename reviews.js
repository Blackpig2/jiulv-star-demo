(function () {
  'use strict';
  const api = window.JiulvDemo, rules = window.JiulvRules, e = api.e;
  const list = key => rules.asList(api.read(key, []));
  const hotels = [{ id: 'demo-hotel', name: '星湾示范酒店（虚构）' }, ...window.JIULV_JOBS.map(job => ({ id: job.id, name: job.name }))];
  const dimensions = [['environment', '工作环境'], ['team', '团队氛围'], ['dorm', '住宿条件'], ['benefits', '福利待遇']];
  const text = value => typeof value === 'string' ? value.trim() : '';
  function proofIdentity(proof) {
    const account = api.getAccount();
    if (!proof || !account || proof.accountId !== account.id) return null;
    const boundName = text(proof.realName), accountName = text(account.name);
    if (boundName && accountName && boundName !== accountName) return null;
    // Older named accounts can retain their own legacy proofs. A phone alone
    // cannot supply a missing identity or change the person bound to a proof.
    const name = boundName || accountName;
    return name ? { name, school: text(proof.school) || text(account.school) } : null;
  }
  function approvedReviewProof(hotelId, role) {
    return rules.approvedProof(list('proofs').filter(proofIdentity), api.getAccount()?.id, hotelId, role);
  }
  function identityFields(proof, draft) {
    const account = api.getAccount(), identity = proof ? proofIdentity(proof) : null;
    const name = identity?.name || text(account?.name), school = identity?.school || text(account?.school);
    const values = draft?.values || {};
    return `${name ? `<div class="ft-full ft-muted">经历核验姓名：${e(name)}。默认匿名展示，可在下方选择公开身份。</div>` : `<label class="ft-field ft-full">姓名（经历核验必填）<input name="realName" required maxlength="80" autocomplete="name" value="${e(values.realName || '')}"><small>请与经历证明上的姓名一致；默认匿名展示，实名用于经历核验。</small></label>`}${school ? '' : `<label class="ft-field ft-full">学校（选填）<input name="school" maxlength="100" value="${e(values.school || '')}"><small>只有下方主动勾选公开学校后，才会随评价展示。</small></label>`}`;
  }
  function submissionIdentity(proof, data) {
    const account = api.getAccount();
    const known = proof ? proofIdentity(proof) : { name: text(account?.name), school: text(account?.school) };
    if (!known || (known.name && data.realName !== undefined && text(data.realName) !== known.name)) return null;
    const name = known.name || text(data.realName), school = known.school || text(data.school);
    return name && name.length <= 80 && school.length <= 100 ? { name, school } : null;
  }
  const sample = { id: 'sample-review', hotelId: 'demo-hotel', hotelName: '星湾示范酒店（虚构）', role: '前厅', period: '2026-03 — 2026-08', displayName: '示例同学', anonymous: true, ratings: { environment: 4, team: 5, dorm: 3, benefits: 4 }, content: '【虚构评价，用于展示产品】\n带教会在每周安排复盘，前台服务流程学得比较完整。住宿如果能提前告知实际入住人数，同学们会更好安排。建议入职前问清夜班班车的最后一班时间。', photos: [], comments: [], createdAt: '2026-09-25T08:00:00.000Z', sample: true, status: 'published', shareSchool: true, school: '示范旅游学院（虚构）' };
  let hotelFilter = '', roleFilter = '', schoolFilter = '', yearFilter = '', proofFile = null, reviewPhotos = [], commentPhotos = [], draftProofId = null, commentReviewId = null;
  let formGeneration = 0, activeSession = null, editingReviewId = null;
  const formSessions = new WeakMap();
  function invalidateSession() {
    formGeneration += 1;
    activeSession = null;
    proofFile = null; reviewPhotos = []; commentPhotos = [];
  }
  function reviewModal(html, kicker) {
    invalidateSession();
    api.modal(html, kicker);
    const form = document.querySelector('#modal form');
    if (!form || !['proof-form', 'review-form', 'review-comment-form', 'review-report-form'].includes(form.id)) return;
    const account = api.getAccount();
    const review = form.id === 'review-comment-form' ? allReviews().find(item => item.id === commentReviewId) : null;
    const proofId = form.id === 'review-form' ? draftProofId : review ? approvedReviewProof(review.hotelId, review.role)?.id : null;
    activeSession = { form, accountId: account?.id, proofId, reviewId: form.id === 'review-comment-form' ? commentReviewId : form.id === 'review-form' ? editingReviewId : null, generation: formGeneration, uploads: {}, pending: false, submitted: false };
    activeSession.identityName = proofId ? proofIdentity(list('proofs').find(item => item.id === proofId))?.name : text(account?.name);
    formSessions.set(form, activeSession);
  }
  function currentSession(session) {
    if (!session || activeSession !== session || session.generation !== formGeneration || !session.form.isConnected || session.accountId !== api.getAccount()?.id || document.querySelector(`#${session.form.id}`) !== session.form || document.querySelector('#modal')?.open === false) return false;
    if (session.form.id === 'review-form' && (session.proofId !== draftProofId || session.reviewId !== editingReviewId)) return false;
    if (session.form.id === 'review-comment-form' && session.reviewId !== commentReviewId) return false;
    return true;
  }
  function syncSubmit(session) {
    session.form.querySelectorAll('button[type="submit"]').forEach(button => { button.disabled = session.pending || session.submitted; });
  }
  function currentUpload(token) { return currentSession(token.session) && token.session.uploads[token.field]?.generation === token.generation; }
  function saveSubmission(session, key, records) {
    if (!currentSession(session) || session.pending || session.submitted) return false;
    session.submitted = true; syncSubmit(session);
    if (api.save(key, records)) return true;
    session.submitted = false; syncSubmit(session);
    return false;
  }
  const safeImage = value => typeof value === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(value) ? value : '';
  const photosHTML = photos => `<div class="ft-photo-grid">${(Array.isArray(photos) ? photos : []).filter(photo => safeImage(photo.data)).map(photo => `<figure><img src="${e(photo.data)}" alt="评价配图" loading="lazy"></figure>`).join('')}</div>`;
  const extraSamples = [
    { ...sample, id: 'sample-review-2', role: '餐饮', period: '2025-09 — 2026-02', school: '星河文旅学院（虚构）', ratings: { environment: 4, team: 4, dorm: 3, benefits: 3 }, content: '【虚构评价，用于展示产品】\n我和同学同一批到岗，但分在不同餐厅。建议分别确认班次和休息日，同行不意味着每天都能一起上下班。员工餐的开放时间也要对照自己的排班问清楚。', comments: [], createdAt: '2026-03-02T08:00:00.000Z' },
    { ...sample, id: 'sample-review-3', role: '前厅', period: '2026-01 — 2026-06', school: '示范旅游学院（虚构）', ratings: { environment: 4, team: 4, dorm: 4, benefits: 3 }, content: '【虚构评价，用于展示产品】\n学姐的建议帮我准备了面试，但到我这一批，宿舍分配与她实习时有变化。出发前重新让 HR 确认了宿舍地址、入住人数和交通方式，不能只照搬上一批同学的经验。', comments: [], createdAt: '2026-07-10T08:00:00.000Z' }
  ];
  function allReviews() { return [sample, ...extraSamples, ...list('reviews')]; }
  function hotelOptions(selected) { return hotels.map(hotel => `<option value="${e(hotel.id)}" ${hotel.id === selected ? 'selected' : ''}>${e(hotel.name)}</option>`).join(''); }
  function currentProofs() { return list('proofs').filter(proof => proof.accountId === api.getAccount()?.id); }
  const statusLabel = status => ({ pending: '待审核 · 演示', approved: '演示审核通过', rejected: '需补充资料' }[status] || '待审核');
  function render() {
    const account = api.getAccount();
    const published = rules.filterPublicReviews(allReviews(), {hotelId:hotelFilter, role:roleFilter, school:schoolFilter, year:yearFilter});
    const publicPosts = allReviews().filter(review => review.status === 'published').map(rules.publicReview);
    const roles = [...new Set(publicPosts.map(review => review.role))];
    const schools = [...new Set(publicPosts.map(review => review.school).filter(Boolean))];
    const years = [...new Set(publicPosts.map(review => String(review.period || '').slice(0, 4)).filter(value => /^\d{4}$/.test(value)))].sort().reverse();
    const options = (values, selected) => values.map(value => `<option value="${e(value)}" ${value === selected ? 'selected' : ''}>${e(value)}</option>`).join('');
    document.querySelector('#community-view').innerHTML = `
      <div class="ft-header review-page-heading"><div><span class="overline">实习口碑 · EXPERIENCE MATTERS</span><h1>这一站，<em>听你说。</em></h1><p>住得怎么样，工作开不开心？让亲身经历，成为下一位同学的参考。</p></div><div class="ft-actions"><button class="primary" data-review-action="start">写下我的实习体验 ↗</button></div></div>
      <div class="ft-notice">本页为本机评价流程演示，身份和经历审核均为模拟。默认 3 条内容属于同一家虚构酒店，不代表真实酒店评价。</div>
      <div class="review-layout"><div><div class="review-toolbar review-toolbar-v3"><label>酒店<select id="review-hotel-filter"><option value="">全部酒店</option>${hotelOptions(hotelFilter)}</select></label><label>实习岗位<select id="review-role-filter"><option value="">全部岗位</option>${options(roles,roleFilter)}</select></label><label>同校参考（作者自愿公开）<select id="review-school-filter"><option value="">全部 / 未公开学校</option>${options(schools,schoolFilter)}</select></label><label>实习开始年份<select id="review-year-filter"><option value="">全部时期</option>${options(years,yearFilter)}</select></label></div>
      <div class="review-result-line"><span>符合条件 ${published.length} 条 · 其中虚构示例 ${published.filter(review=>review.sample).length} 条</span><button class="text-button" data-review-action="reset-filters">重置筛选</button></div>
      <div id="review-list">${published.length ? published.map(reviewCard).join('') : '<div class="ft-empty"><h3>还没有符合条件的公开评价</h3><p>可以换个岗位或实习时期。没有评价不代表体验好或不好。</p></div>'}</div>${account ? mySubmissions() : ''}</div>
      <aside class="ft-card review-side"><span class="ft-badge-icon">☆</span><h2>参考前人的路，<br>保留自己的判断。</h2><ol class="review-steps"><li><b>经历一致，参考才具体</b>同品牌、同酒店的不同部门，工作体验也可能不同。</li><li><b>对照实习时期</b>宿舍、带教和排班会变化，旧经验要向 HR 再确认。</li><li><b>看细节，也看样本量</b>个人评分不能代表酒店整体，不以少量评价做排名。</li></ol><div class="ft-notice">学校只有经作者主动勾选才展示；匿名不保证熟人无法从内容推断身份。证明不公开给酒店。</div></aside></div>`;
  }
  function mySubmissions() {
    const mine = list('reviews').filter(review => review.accountId === api.getAccount()?.id && review.status !== 'published');
    if (!mine.length) return '';
    return `<h2 class="review-section-title">我的体验进度</h2>${mine.map(review => {
      const proof = currentProofs().find(item => item.id === review.proofId);
      const needsProof = proof?.status === 'rejected';
      const needsEdit = review.status === 'rejected' || needsProof;
      return `<div class="proof-item"><span class="ft-chip ${needsEdit ? 'rejected' : 'pending'}">${needsProof ? '请补充经历证明' : needsEdit ? '请修改体验内容' : '待审核 · 尚未公开'}</span><h3>${e(review.hotelName)} · ${e(review.role)}</h3><p>${e(review.content)}</p>${proof?.reason && needsProof ? `<div class="ft-notice">证明审核意见：${e(proof.reason)}</div>` : ''}${review.reason ? `<div class="ft-notice">内容审核意见：${e(review.reason)}</div>` : ''}${needsEdit ? `<button class="primary" data-review-action="revise" data-id="${e(review.id)}">${needsProof ? '补充证明并继续' : '修改后重新提交'}</button>` : ''}<button class="text-button" data-review-action="withdraw" data-id="${e(review.id)}">撤回此演示评价</button></div>`;
    }).join('')}`;
  }
  function reviewCard(raw) {
    const review = rules.publicReview(raw);
    const average = (Object.values(review.ratings).reduce((sum, value) => sum + Number(value), 0) / 4).toFixed(1);
    return `<article class="ft-card review-card"><div class="review-card-top"><div><span class="ft-chip ${review.sample ? 'demo' : ''}">${review.sample ? '虚构内容 · 演示样例' : '经历审核通过 · 本机演示'}</span><h3>${e(review.hotelName)}</h3><p class="review-meta">${e(review.role)} · ${e(review.period)}</p>${review.school ? `<span class="review-school">同校参考 · ${e(review.school)}</span>` : '<span class="review-school">学校未公开</span>'}</div><div class="review-score">${average}<small>个人评分 / 5</small></div></div><div class="review-rating-grid">${dimensions.map(([key, label]) => `<div><span>${label}</span><b>${'★'.repeat(Number(review.ratings[key]))}${'☆'.repeat(5 - Number(review.ratings[key]))}</b></div>`).join('')}</div><p class="review-content">${e(review.content)}</p>${photosHTML(review.photos)}<div class="review-card-footer"><p class="review-meta">${e(review.displayName)} · ${e(review.createdAt?.slice(0, 10))}</p><div class="ft-actions"><button class="secondary" data-review-action="comments" data-id="${e(review.id)}">讨论 ${review.comments.length}</button><button class="text-button" data-review-action="report" data-id="${e(review.id)}">反馈问题</button></div></div></article>`;
  }
  function draftKey(session) { return `reviewDraft:${session.accountId}:${session.reviewId || session.proofId || 'new'}`; }
  function saveDraft(session = activeSession) {
    if (!currentSession(session) || session.submitted || !['proof-form', 'review-form'].includes(session.form.id)) return false;
    const values = Object.fromEntries(new FormData(session.form));
    const fields = Object.fromEntries(Object.entries(values).filter(([key, value]) => typeof value === 'string' && key !== 'consent'));
    return api.save(draftKey(session), { values: fields, photos: reviewPhotos, proofFile, savedProofId: session.savedProofId || null, updatedAt: new Date().toISOString() });
  }
  function draftFor(id, revisionId) {
    const value = api.read(`reviewDraft:${api.getAccount()?.id}:${revisionId || id || 'new'}`, null);
    return value && typeof value === 'object' ? value : null;
  }
  function restoreDraft(draft) {
    reviewPhotos = (draft?.photos || []).filter(photo => safeImage(photo.data));
    proofFile = draft?.proofFile || null;
    if (activeSession) activeSession.savedProofId = draft?.savedProofId || null;
  }
  function reviewFields(previous = {}, draft = null, proof = null) {
    const values = draft?.values || {}, ratings = { ...previous.ratings, ...values };
    const anonymous = values.visibility ? values.visibility === 'anonymous' : previous.anonymous !== false;
    const shareSchool = draft ? values.shareSchool === 'on' : previous.shareSchool;
    return `<div class="ft-full rating-select">${dimensions.map(([key, label]) => `<label class="ft-field">${label}<select name="${key}" required><option value="">请选择评分</option>${[5, 4, 3, 2, 1].map(value => `<option value="${value}" ${Number(ratings[key]) === value ? 'selected' : ''}>${value} 分 · ${['', '很不满意', '不太满意', '一般', '满意', '很满意'][value]}</option>`).join('')}</select></label>`).join('')}</div><label class="ft-field ft-full">具体体验<textarea name="content" required minlength="20" maxlength="2000" placeholder="工作、住宿或待遇，有哪些具体经历想分享？至少20字。">${e(values.content ?? previous.content ?? '')}</textarea></label><label class="ft-field ft-full">体验配图（选填，最多3张）<input id="review-photo-upload" type="file" multiple accept="image/jpeg,image/png,image/webp"><small>单张不超过 2 MB，证明不会作为公开配图。</small></label><div class="ft-full" id="review-photo-preview">${photosHTML(draft?.photos || previous.photos || [])}</div><label class="ft-field ft-full">公开身份<select name="visibility"><option value="anonymous" ${anonymous ? 'selected' : ''}>匿名展示</option><option value="named" ${!anonymous ? 'selected' : ''}>显示核验姓名</option></select><small>匿名时平台仍保留核验身份。正文和图片请勿包含他人的联系方式。</small></label><label class="ft-consent ft-full"><input name="shareSchool" type="checkbox" ${shareSchool ? 'checked' : ''}><span>同时展示我的学校：${e(proofIdentity(proof)?.school || text(api.getAccount()?.school) || '本次填写的学校')}（选填，匿名时也会显示）</span></label><label class="ft-consent ft-full"><input name="consent" type="checkbox" required><span>同意将内容提交本机模拟审核；证明和手机不公开，经历与内容审核通过后才展示。</span></label><div class="ft-full ft-actions"><button type="submit" class="primary">提交实习体验</button><button type="button" class="secondary" data-review-action="save-draft">保存草稿</button></div><small class="ft-full ft-muted" role="status" id="review-draft-status">${draft ? '已恢复上次未提交的内容。' : '填写内容会自动保存为本机草稿。'}</small>`;
  }
  function startReview() {
    api.requireAccount(() => {
      const proofs = currentProofs().filter(proof => ['approved', 'pending'].includes(proof.status) && proofIdentity(proof));
      const available = proofs.filter(proof => !rules.hasExperienceReview(list('reviews'), list('proofs'), proof));
      const last = available.find(proof => draftFor(proof.id)) || available.find(proof => proof.status === 'approved') || available[0];
      if (last && !draftFor(null)) writeReview(last.id); else proofForm();
    });
  }
  function showProofs() { startReview(); }
  function proofForm() {
    api.requireAccount(() => {
      draftProofId = null; editingReviewId = null;
      const draft = draftFor(null), values = draft?.values || {};
      const approved = currentProofs().filter(proof => ['approved', 'pending'].includes(proof.status) && proofIdentity(proof) && !rules.hasExperienceReview(list('reviews'), list('proofs'), proof));
      reviewModal(`<h2 id="modal-title">写下我的实习体验</h2><p class="detail-subtitle">经历证明和体验一起提交，审核通过后再公开。</p>${approved.length ? `<label class="ft-field">使用已有经历<select id="review-experience-picker"><option value="">填写一段新经历</option>${approved.map(proof => `<option value="${e(proof.id)}">${e(proof.hotelName)} · ${e(proof.role)} · ${statusLabel(proof.status)}</option>`).join('')}</select></label>` : ''}<form id="proof-form" class="ft-form">${identityFields(null, draft)}<label class="ft-field ft-full">实习酒店<select name="hotelId">${hotelOptions(values.hotelId || hotelFilter || 'demo-hotel')}</select></label><label class="ft-field ft-full">实习岗位<select name="role">${['前厅', '餐饮', '厨房', '客房', '其他'].map(role => `<option ${values.role === role ? 'selected' : ''}>${role}</option>`).join('')}</select></label><label class="ft-field">实习开始月份<input name="startMonth" type="month" required value="${e(values.startMonth || '')}"></label><label class="ft-field">实习结束 / 预计结束月份<input name="endMonth" type="month" required value="${e(values.endMonth || '')}"></label><label class="ft-field ft-full">经历证明（图片或 PDF）<input id="proof-upload" type="file" ${draft?.proofFile ? '' : 'required'} accept="image/jpeg,image/png,image/webp,application/pdf"><small>只供平台核验，不公开。演示请使用测试文件，每份不超过 2 MB。</small></label><div id="proof-file-preview" class="ft-full ft-muted" role="status">${draft?.proofFile ? `已保留：${e(draft.proofFile.name)}` : ''}</div><label class="ft-field ft-full">证明说明（选填）<input name="note" maxlength="300" value="${e(values.note || '')}" placeholder="例如：当前仍在实习"></label>${reviewFields({}, draft)}</form>`, 'YOUR EXPERIENCE / 实习体验');
      restoreDraft(draft);
    });
  }
  function writeReview(id, revisionId = null) {
    api.requireAccount(() => {
      const proof = currentProofs().find(item => item.id === id && ['approved', 'pending', 'rejected'].includes(item.status));
      if (!proof || !proofIdentity(proof)) return api.toast('这段经历缺少一致的核验姓名，请在新体验表单填写姓名并上传证明。');
      const previous = revisionId ? list('reviews').find(item => item.id === revisionId && item.accountId === api.getAccount()?.id && item.proofId === id && (item.status === 'rejected' || (proof.status === 'rejected' && item.status === 'pending'))) : null;
      if (revisionId && !previous) return api.toast('这条评价状态已变化，请刷新后查看。');
      editingReviewId = previous?.id || null;
      draftProofId = id;
      const draft = draftFor(id, revisionId);
      const replacement = proof.status === 'rejected' ? `<div class="ft-notice">证明需补充：${e(proof.reason || '请重新上传有效的经历证明')}。原体验内容已保留。</div><label class="ft-field ft-full">补充经历证明<input id="proof-upload" type="file" ${draft?.proofFile ? '' : 'required'} accept="image/jpeg,image/png,image/webp,application/pdf"><small>仅供核验，请使用不超过 2 MB 的测试文件。</small></label><div id="proof-file-preview" class="ft-full ft-muted">${draft?.proofFile ? `已保留：${e(draft.proofFile.name)}` : ''}</div>` : '';
      const available = currentProofs().filter(item => ['approved', 'pending'].includes(item.status) && proofIdentity(item) && (item.id === id || !rules.hasExperienceReview(list('reviews'), list('proofs'), item)));
      reviewModal(`<h2 id="modal-title">${previous ? '修改你的实习体验' : '写下我的实习体验'}</h2>${previous?.reason ? `<div class="ft-notice">审核意见：${e(previous.reason)}</div>` : ''}<p class="detail-subtitle">${e(proof.hotelName)} · ${e(proof.role)}<br>${e(proof.startMonth)} — ${e(proof.endMonth)} · ${statusLabel(proof.status)}</p>${!revisionId ? `<label class="ft-field">实习经历<select id="review-experience-picker">${available.map(item => `<option value="${e(item.id)}" ${item.id === id ? 'selected' : ''}>${e(item.hotelName)} · ${e(item.role)}</option>`).join('')}<option value="">填写一段新经历</option></select></label>` : ''}<form id="review-form" class="ft-form">${identityFields(proof, draft)}${replacement}${reviewFields(previous || {}, draft, proof)}</form>`, 'YOUR EXPERIENCE / 实习体验');
      restoreDraft(draft);
      if (activeSession && previous) activeSession.reviewFingerprint = JSON.stringify(previous);
      if (!draft) reviewPhotos = previous?.photos || [];
    });
  }
  function showComments(id) {
    const review = allReviews().find(item => item.id === id && item.status === 'published'); if (!review) return;
    commentReviewId = id; commentPhotos = [];
    const eligible = Boolean(approvedReviewProof(review.hotelId, review.role));
    reviewModal(`<h2 id="modal-title">围绕这段实习聊一聊</h2><p class="detail-subtitle">${e(review.hotelName)} · ${e(review.role)}</p>${review.sample ? '<div class="ft-notice">此主帖为虚构示例。讨论也只保存在本机。</div>' : ''}<div>${(review.comments || []).length ? rules.publicReview(review).comments.map(comment => `<article class="review-comment"><h3>${e(comment.displayName)}</h3><p>${e(comment.content)}</p>${photosHTML(comment.photos)}<small class="ft-muted">${e(comment.createdAt.slice(0, 10))}</small></article>`).join('') : '<p class="ft-muted">还没有讨论。评论同样需要对应酒店及岗位的实习经历核验。</p>'}</div>${eligible ? `<form id="review-comment-form" class="ft-form"><label class="ft-field ft-full">你的补充<textarea name="content" required minlength="5" maxlength="1000" placeholder="分享具体经历或提出有帮助的问题。"></textarea></label><label class="ft-field ft-full">评论配图（最多2张）<input id="comment-photo-upload" type="file" multiple accept="image/jpeg,image/png,image/webp"></label><div id="comment-photo-preview" class="ft-full"></div><label class="ft-consent ft-full"><input name="anonymous" type="checkbox" checked><span>匿名展示，后台保留核验身份</span></label><button type="submit" class="primary ft-full">添加本机演示评论</button></form>` : '<div class="ft-notice">分享对应酒店、岗位的体验并通过经历核验后，即可参与讨论。</div><button class="primary" data-review-action="start">写下我的实习体验</button>'}`, 'DISCUSSION / 交流');
  }
  function reportReview(id) {
    api.requireAccount(() => reviewModal(`<h2 id="modal-title">反馈这条评价的问题</h2><p class="detail-subtitle">可说明内容不实、隐私泄露或需要补充的背景。</p><form id="review-report-form" class="ft-form"><input type="hidden" name="reviewId" value="${e(id)}"><label class="ft-field ft-full">具体说明<textarea name="reason" required minlength="5" maxlength="500"></textarea></label><button class="primary ft-full" type="submit">提交本机反馈</button></form>`, 'FEEDBACK / 评价反馈'));
  }
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-review-action]'); if (!target) return;
    const action = target.dataset.reviewAction, id = target.dataset.id;
    if (action === 'start') startReview();
    if (action === 'save-draft' && saveDraft()) api.toast('体验草稿已保存，可稍后继续。');
    if (action === 'proofs') showProofs();
    if (action === 'reset-filters') { hotelFilter = ''; roleFilter = ''; schoolFilter = ''; yearFilter = ''; render(); }
    if (action === 'proof-form') proofForm();
    if (action === 'write') writeReview(id);
    if (action === 'revise') { const review = list('reviews').find(item => item.id === id && item.accountId === api.getAccount()?.id && (item.status === 'rejected' || (item.status === 'pending' && currentProofs().some(proof => proof.id === item.proofId && proof.status === 'rejected')))); if (review) writeReview(review.proofId, review.id); }
    if (action === 'comments') showComments(id);
    if (action === 'report') reportReview(id);
    if (action === 'withdraw') { const account = api.getAccount(); if (!account) return; const current = list('reviews'); const targetReview = current.find(review => review.id === id && review.accountId === account.id && review.status !== 'published'); if (!targetReview) return; if (api.save('reviews', current.filter(review => review.id !== id))) { render(); api.toast('已撤回本机演示评价。'); } }
    if (action === 'academy') { document.querySelector('#modal').close(); api.showView(action); }
  });
  document.addEventListener('change', async event => {
    const target = event.target;
    if (target.id === 'review-hotel-filter') { hotelFilter = target.value; render(); }
    if (target.id === 'review-role-filter') { roleFilter = target.value; render(); }
    if (target.id === 'review-school-filter') { schoolFilter = target.value; render(); }
    if (target.id === 'review-year-filter') { yearFilter = target.value; render(); }
    if (target.id === 'review-experience-picker') { saveDraft(); if (target.value) writeReview(target.value); else proofForm(); return; }
    if (!['proof-upload', 'review-photo-upload', 'comment-photo-upload'].includes(target.id)) { saveDraft(); return; }
    const session = formSessions.get(target.form || target.closest('form'));
    if (!currentSession(session) || session.submitted) return;
    const token = { session, field: target.id, generation: (session.uploads[target.id]?.generation || 0) + 1 };
    session.uploads[target.id] = { generation: token.generation, pending: false };
    const proofUpload = target.id === 'proof-upload', comment = target.id === 'comment-photo-upload';
    const preview = session.form.querySelector(proofUpload ? '#proof-file-preview' : comment ? '#comment-photo-preview' : '#review-photo-preview');
    const files = Array.from(target.files || []);
    if (proofUpload) proofFile = null;
    else if (comment) commentPhotos = [];
    else reviewPhotos = [];
    session.uploads[target.id].pending = files.length > 0;
    session.pending = Object.values(session.uploads).some(upload => upload.pending); syncSubmit(session);
    if (preview) preview.textContent = files.length ? '正在读取附件，完成后才可提交。' : '';
    if (!files.length) { saveDraft(session); return; }
    try {
      if (proofUpload) {
        const file = files[0];
        if (file.size > 2 * 1024 * 1024) throw new Error('证明附件请小于 2 MB。');
        let data;
        if (file.type === 'application/pdf') {
          const header = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer()); if (header !== '%PDF-') throw new Error('无法识别 PDF 内容。');
          data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
        } else data = await api.readImage(file);
        if (!currentUpload(token)) return;
        proofFile = { name: file.name, type: file.type, data };
        if (preview) preview.innerHTML = safeImage(data) ? `<div class="ft-photo-grid"><img src="${e(data)}" alt="待审核证明，仅本机预览"></div><span>${e(file.name)} · 待提交审核</span>` : `${e(file.name)} · PDF 已读取，待提交审核`;
      } else {
        const max = comment ? 2 : 3;
        if (files.length > max) throw new Error(`最多选择 ${max} 张图片。`);
        const photos = await Promise.all(files.map(async file => ({ name: file.name, data: await api.readImage(file) })));
        if (!currentUpload(token)) return;
        if (comment) commentPhotos = photos; else reviewPhotos = photos;
        if (preview) preview.innerHTML = photosHTML(photos);
      }
    } catch (error) {
      if (!currentUpload(token)) return;
      target.value = '';
      if (preview) preview.textContent = '附件未加入，请重新选择。';
      api.toast(error.message || '附件读取失败，请重新选择。');
    } finally {
      if (currentUpload(token)) { session.uploads[token.field].pending = false; session.pending = Object.values(session.uploads).some(upload => upload.pending); syncSubmit(session); saveDraft(session); }
    }
  });
  document.addEventListener('submit', event => {
    if (!['proof-form', 'review-form', 'review-comment-form', 'review-report-form'].includes(event.target.id)) return;
    event.preventDefault();
    const account = api.getAccount(); if (!account) return api.toast('请先进入演示账户。');
    const session = formSessions.get(event.target);
    if (!currentSession(session) || session.submitted) return;
    if (session.pending) return api.toast('附件仍在读取，请完成后再提交。');
    if (!event.target.reportValidity()) return;
    const data = Object.fromEntries(new FormData(event.target));
    if (['proof-form', 'review-form'].includes(event.target.id)) {
      let proof = currentProofs().find(item => item.id === (session.savedProofId || draftProofId) && ['approved', 'pending'].includes(item.status));
      if (event.target.id === 'proof-form' && proof && !rules.sameExperience(proof, { accountId: account.id, hotelId: data.hotelId, role: data.role, startMonth: data.startMonth, endMonth: data.endMonth })) proof = null;
      const original = event.target.id === 'review-form' ? currentProofs().find(item => item.id === draftProofId && item.status === 'rejected') : null;
      let identity = submissionIdentity(proof || original, data);
      if (!identity) return api.toast('请填写与经历证明一致的姓名；已有账户和证明的核验姓名不能在此更换。');
      if (session.identityName && session.identityName !== identity.name) return api.toast('核验身份已变化，请重新打开体验表单。');
      if (event.target.id === 'proof-form' && !proof) {
        if (!proofFile) return api.toast('请先选择并等待经历证明读取完成。');
        if (!rules.periodValid(data.startMonth, data.endMonth, new Date().toISOString().slice(0, 7))) return api.toast('请确认月份有效：开始时间不能晚于结束月份或当前月份。');
        const hotel = hotels.find(item => item.id === data.hotelId); if (!hotel) return;
        proof = { id: crypto.randomUUID(), accountId: account.id, realName: identity.name, school: identity.school, phone: account.phone, hotelId: hotel.id, hotelName: hotel.name, role: data.role, startMonth: data.startMonth, endMonth: data.endMonth, note: data.note, file: proofFile, status: 'pending', createdAt: new Date().toISOString() };
        const existing = currentProofs().find(item => item.status !== 'rejected' && rules.sameExperience(item, proof));
        if (existing && proofIdentity(existing)) {
          if (proofIdentity(existing).name !== identity.name) return api.toast('这段经历已有不同的核验姓名，不能替换证明归属。');
          proof = existing;
          identity = submissionIdentity(proof, data);
          if (!identity) return api.toast('这段经历的核验姓名已变化，请重新打开表单。');
        } else if (existing && text(existing.realName)) return api.toast('这段经历的核验姓名与当前账户不一致，不能复用证明。');
      }
      let replacementProof = null;
      if (!proof && event.target.id === 'review-form') {
        if (original) {
          if (!proofFile) return api.toast('请补充经历证明，原体验内容会保留。');
          replacementProof = { ...original, realName: identity.name, file: proofFile, status: 'pending', reason: '', updatedAt: new Date().toISOString(), history: [...(original.history || []), { action: 'student-resubmitted', reason: original.reason || '', at: new Date().toISOString() }] };
          proof = replacementProof;
        }
      }
      if (!proof) return api.toast('对应经历状态已变化，请重新打开体验表单。');
      const ratings = Object.fromEntries(dimensions.map(([key]) => [key, Number(data[key])]));
      if (!rules.validRatings(ratings)) return api.toast('请完成四个维度的评分。');
      if (String(data.content || '').trim().length < 20) return api.toast('请至少填写20字的具体经历。');
      const previous = editingReviewId ? list('reviews').find(item => item.id === editingReviewId && item.accountId === account.id && item.proofId === proof.id && (item.status === 'rejected' || (item.status === 'pending' && session.reviewFingerprint === JSON.stringify(item)))) : null;
      if (editingReviewId && !previous) return api.toast('这条评价状态已变化，请关闭后重新打开。');
      const duplicate = rules.hasExperienceReview(list('reviews').filter(item => item.id !== editingReviewId), list('proofs'), proof);
      if (duplicate) return api.toast('这段经历已有评价，请先等待审核或撤回待审评价。');
      const review = { id: previous?.id || crypto.randomUUID(), accountId: account.id, proofId: proof.id, hotelId: proof.hotelId, hotelName: proof.hotelName, role: proof.role, startMonth: proof.startMonth, endMonth: proof.endMonth, period: `${proof.startMonth} — ${proof.endMonth}`, displayName: identity.name, anonymous: data.visibility !== 'named', shareSchool: data.shareSchool === 'on', school: data.shareSchool === 'on' ? identity.school : '', ratings, content: data.content.trim(), photos: reviewPhotos, comments: [], status: 'pending', createdAt: new Date().toISOString() };
      if (previous) {
        review.createdAt = previous.createdAt;
        review.updatedAt = new Date().toISOString();
        review.history = [...(previous.history || []), { at: review.updatedAt, action: 'student-resubmitted', previousStatus: previous.status, reason: previous.reason || '', previousContent: previous.content, previousRatings: previous.ratings, previousPhotos: previous.photos || [] }];
      }
      saveDraft(session);
      if (replacementProof && !api.save('proofs', list('proofs').map(item => item.id === proof.id ? replacementProof : item))) return;
      if (!currentProofs().some(item => item.id === proof.id)) {
        if (!api.save('proofs', [...list('proofs'), proof])) return;
        session.savedProofId = proof.id;
        saveDraft(session);
      }
      if (!saveSubmission(session, 'reviews', previous ? list('reviews').map(item => item.id === previous.id ? { ...previous, ...review, reason: '' } : item) : [...list('reviews'), review])) return;
      api.save(draftKey(session), null);
      document.querySelector('#modal').close(); render(); api.toast('实习体验已提交审核，经历和内容审核通过后才公开。');
    }
    if (event.target.id === 'review-comment-form') {
      const review = allReviews().find(item => item.id === commentReviewId && item.status === 'published'); if (!review) return;
      const proof = list('proofs').find(item => item.id === session.proofId && item.accountId === account.id && item.hotelId === review.hotelId && item.role === review.role && item.status === 'approved' && proofIdentity(item));
      if (!proof) return api.toast('对应实习经历尚未核验。');
      if (session.identityName !== proofIdentity(proof).name) return api.toast('核验身份已变化，请重新打开讨论。');
      if (String(data.content || '').trim().length < 5) return api.toast('评论请至少填写5字。');
      const comment = { id: crypto.randomUUID(), accountId: account.id, proofId: proof.id, displayName: text(account.name) || '同学', anonymous: data.anonymous === 'on', content: data.content.trim(), photos: commentPhotos, createdAt: new Date().toISOString() };
      if (review.sample) { const key = review.id === 'sample-review' ? 'sampleComments' : `sampleComments:${review.id}`; const comments = list(key); if (!saveSubmission(session, key, [...comments, comment])) return; review.comments = [...comments, comment]; }
      else { const records = list('reviews'); const entry = records.find(item => item.id === review.id && item.status === 'published'); if (!entry) return; entry.comments = [...(entry.comments || []), comment]; if (!saveSubmission(session, 'reviews', records)) return; }
      showComments(review.id); render(); api.toast('已添加本机演示评论，未对外发布。');
    }
    if (event.target.id === 'review-report-form') {
      if (String(data.reason || '').trim().length < 5) return api.toast('请至少填写5字说明。');
      if (!saveSubmission(session, 'reports', [...list('reports'), { id: crypto.randomUUID(), accountId: account.id, reviewId: data.reviewId, reason: data.reason.trim(), status: 'pending', createdAt: new Date().toISOString() }])) return;
      document.querySelector('#modal').close(); api.toast('反馈已进入本机运营列表，未发送到外部。');
    }
  });
  document.addEventListener('input', event => { if (event.target.form === activeSession?.form) saveDraft(); });
  document.querySelector('#modal').addEventListener('close', () => { if (!document.querySelector('#modal').open) invalidateSession(); });
  sample.comments = list('sampleComments');
  extraSamples.forEach(review => { review.comments = list(`sampleComments:${review.id}`); });
  window.JiulvFeatures.community = { setHotel(id) { hotelFilter = hotels.some(hotel => hotel.id === id) ? id : ''; roleFilter = ''; schoolFilter = ''; yearFilter = ''; }, render, hotels, allReviews, statusLabel, safeImage };
})();
