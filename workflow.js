/* 酒旅之星 V5: two consent-bound sources, screening and a recorded result. */
(function(){'use strict';
  const api=window.JiulvDemo,C=window.JiulvOutreachCore,e=v=>api.e(String(v??'')),KEY='outreach:v5';
  let filter='action',source='all',searchQuery='',unownedQuestion=null,workflowAccountId=null,invitationTarget=null,pendingConsent=null;
  let flowPlanId='',flowMountId='recruitment-flow-root';
  const rows=()=>{const v=api.read(KEY,[]);return Array.isArray(v)?v:[];};
  const accounts=()=>api.getAccounts?.()||{students:[],hotels:[]};
  const role=()=>document.body.dataset.perspective==='employer'?'hotel':'student';
  const actor=()=>{const a=role()==='hotel'?api.getHotelAccount?.():api.getAccount();return a?{...a,role:role()}:null;};
  const hotelKey=h=>h.hotelId||h.id;
  const fmt=v=>v?new Date(v).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false}):'尚未记录';
  const close=()=>document.querySelector('#modal')?.close();
  const current=id=>{const a=actor(),r=rows().find(x=>x.id===id);return a&&C.owns(r,a)?r:null;};
  const ensure=callback=>actor()?callback():(role()==='hotel'?api.requireHotelAccount(callback):api.requireAccount(callback));
  function emit(action,r){const g=window.JiulvGrowth;if(g?.metric){const t=action==='application'?'apply':['accept','decline'].includes(action)?'reply':null;if(t&&(t!=='reply'||actor()?.role==='hotel'))g.metric(t,r.position,r.hotelId,r.studentId,r.hotelAccountId,`${r.id}:${t}`);if(action==='accept')g.metric('interview',r.position,r.hotelId,r.studentId,r.hotelAccountId,`${r.id}:interview`);}document.dispatchEvent(new CustomEvent('jiulv:outreachchange',{detail:{action,recordId:r.id,hotelId:r.hotelId,studentId:r.studentId,stage:r.stage}}));}
  function getQuestion(){const a=api.getAccount();if(a&&unownedQuestion){api.save(`academy-question:${a.id}`,unownedQuestion);unownedQuestion=null;}return a?api.read(`academy-question:${a.id}`,null):unownedQuestion;}
  function clearQuestion(){const a=api.getAccount();if(a)api.remove(`academy-question:${a.id}`);unownedQuestion=null;}
  function saveRows(next,action,r){if(!api.save(KEY,next))return false;emit(action,r);return true;}
  function fromDelivery(delivery){
    const s=api.getAccount();if(!s||delivery?.accountId!==s.id)return {ok:false,error:'请使用本次授权的学生账号。'};
    const list=api.read('deliveries:v5',[]),authorized=(Array.isArray(list)?list:[]).find(r=>r.id===delivery.id&&r.accountId===s.id&&r.status==='demo-authorized-v5');
    if(!authorized)return {ok:false,error:'请先完成本次单独授权。'};
    const existing=rows().find(r=>r.deliveryId===authorized.id);if(existing)return {ok:true,record:existing,deliveryAction:'replayed'};
    const duplicate=C.duplicate(rows(),s.id,authorized.hotelId,authorized.role,authorized.planId);if(duplicate)return {ok:false,error:'该酒店岗位已有进行中的申请，请从申请进度查看。'};
    const h=accounts().hotels.find(h=>hotelKey(h)===authorized.hotelId&&(authorized.hotelAccountId?h.id===authorized.hotelAccountId:true)&&(!authorized.recipientEmail||h.hrEmail?.trim().toLowerCase()===authorized.recipientEmail.trim().toLowerCase())&&(authorized.hotelAccountId||Boolean(authorized.recipientEmail&&C.hotelContacts({...h,role:'hotel'}).email===authorized.recipientEmail.trim().toLowerCase())));
    if(authorized.hotelAccountId&&!h)return {ok:false,error:'授权时指定的酒店账号或工作邮箱已变化，请重新核对接收方后投递。'};
    try{const r=C.create({id:crypto.randomUUID(),studentId:s.id,hotelAccountId:h?.id||null,hotelId:authorized.hotelId,hotelName:authorized.hotelName,position:authorized.role,jobId:authorized.jobId,planId:authorized.planId,planRevision:authorized.planRevision,conditionSnapshot:authorized.conditionSnapshot,resumeSnapshot:authorized.resumeSnapshot,question:authorized.question||'',deliveryId:authorized.id,recipientEmail:authorized.recipientEmail||'',contactConsent:authorized.contactConsent===true,acceptsTransfer:authorized.acceptsTransfer===true,transferDepartments:authorized.transferDepartments,consent:true},{id:s.id,role:'student',phone:authorized.contactConsent===true?authorized.contactSnapshot?.phone||'':'',email:authorized.contactConsent===true?authorized.contactSnapshot?.email||'':'',wechat:authorized.contactConsent===true&&Array.isArray(authorized.contactFields)&&authorized.contactFields.includes('wechat')?authorized.contactSnapshot?.wechat||'':''});if(!saveRows([...rows(),r],'application',r))return {ok:false,error:'回应记录保存失败，请重试关联。'};clearQuestion();source='application';filter='all';document.body.dataset.perspective='student';return {ok:true,record:r,deliveryAction:'created'};}catch(error){return {ok:false,error:error.message};}
  }
  const paused=r=>Boolean(r.adminHold?.active&&(C.activeStages.includes(r.stage)||r.stage==='hired'));
  const actionData=(r,a)=>`data-id="${e(r.id)}" data-version="${r.version}" data-actor="${e(a.id)}" data-role="${a.role}"`;
  const status=r=>paused(r)?'平台暂停中':r.stage==='interview'?(r.origin==='invitation'?'邀请已接受':'简历筛选通过'):(C.labels[r.stage]||'待核对');
  function stage(r){return paused(r)?'paused':['pending_hotel','pending_student'].includes(r.stage)?'pending':r.stage==='interview'?'interview':r.stage==='hired'?'offer_pending':'closed';}
  function platformNotice(r){
    if(!paused(r)&&r.stage!=='admin_closed')return '';
    const intervention=[...(r.history||[])].reverse().find(h=>h.actor==='platform'&&h.action==='close');
    const reason=paused(r)?r.adminHold.reason:(intervention?.reason||r.closingNote||'请联系平台了解处理原因。');
    return `<aside class="ow-platform-note" role="status"><b>${paused(r)?'平台暂停了本次沟通':'平台已结束本次流程'}</b><p>${e(reason)}</p><small>${paused(r)?`原进度：${e(C.labels[r.stage])}。${r.stage==='interview'?'恢复后可继续沟通，已确认意愿不会被改写':'恢复后仍需本人回应'}${r.stage==='hired'?'。':'；发起方可以撤回。'}`:'此状态不代表酒店录用或学生婉拒。如需协助，请联系酒旅之星。'}</small></aside>`;
  }
  const flowFilters=[['action','待我处理'],['all','全部'],['pending','等待确认'],['interview','待面试结果'],['offer_pending','待学生确认'],['closed','已结束'],['paused','平台暂停']];
  const anonymousStudent=id=>`实习同学 ${[...String(id||'')].reduce((value,char)=>(Math.imul(value,31)+char.charCodeAt(0))>>>0,0).toString(36).toUpperCase().padStart(6,'0')}`;
  function progress(r,a=actor()){
    const finished=['hired','not_hired','offer_accepted','offer_declined'].includes(r.stage),confirmed=r.stage==='interview'||finished||Boolean(r.screeningPassedAt)||(r.history||[]).some(h=>h.beforeStage==='interview'||['酒店愿意开始面试沟通','学生接受面试邀请'].includes(h.label)),stopped=!finished&&stage(r)==='closed';
    const labels=[stopped&&!confirmed?'已结束':'等待确认',r.origin==='invitation'?'邀请接受':'筛选通过',r.stage==='hired'?(a?.role==='student'?'待我确认':'待学生确认'):'录取结果'];
    const currentStep=finished?2:confirmed?1:0;
    return `<ol class="ow-record-progress" aria-label="招聘进度">${labels.map((label,i)=>`<li class="${stopped&&i===currentStep?'stopped':i<currentStep?'done':i===currentStep?'current':''}"><span aria-hidden="true">${stopped&&i===currentStep?'×':i<currentStep?'✓':i+1}</span>${label}${i===currentStep?'<span class="sr-only">（当前进度）</span>':''}</li>`).join('')}</ol>`;
  }
  function nextStep(r,a){
    if(paused(r))return {text:'平台已暂停；查看处理说明，恢复后继续。',button:'查看说明'};
    if(r.stage==='pending_hotel')return a.role==='hotel'?{text:'等你筛选：先看脱敏简历，再决定通过或不需要。',button:'筛选简历'}:{text:'等酒店筛选简历；通过后，你们再私下约面试。',button:'查看投递'};
    if(r.stage==='pending_student')return a.role==='student'?{text:'等你决定：了解酒店和岗位，接受或拒绝这份邀请。',button:'回应邀请'}:{text:'等学生接受或拒绝；接受后才按授权开放联系方式。',button:'查看邀请'};
    if(r.stage==='interview')return {text:a.role==='hotel'?'双方私下约面试，完成后由你登记录取或未录取。':'与酒店私下约面试，完成后等待酒店登记录取结果。',button:a.role==='hotel'?'联系与记录结果':'联系与查看进展'};
    if(r.stage==='hired')return a.role==='hotel'?{text:'酒店已录取，等学生本人接受或放弃；尚未确认入职。',button:'查看学生回应'}:{text:'酒店已录取，等你决定是否接受；先核对条件，再确认自己的选择。',button:'查看并回应录取'};
    if(r.stage==='offer_accepted')return {text:'学生已接受本次录取意向；接下来由双方确认协议和到岗安排，尚不代表已到岗。',button:'查看录取回应'};
    if(r.stage==='offer_declined')return {text:'学生已放弃本次录取；流程结束，保留双方决定与说明。',button:'查看录取回应'};
    if(r.stage==='not_hired')return {text:a.role==='hotel'?'已登记未录取，学生可查看结果；本次流程结束。':'酒店已登记未录取；感谢这次了解，继续寻找适合的机会。',button:'查看结果'};
    return {text:r.stage==='admin_closed'?'平台已结束本次流程，查看原因与历史记录。':'本次流程已结束，记录继续保留。',button:r.stage==='admin_closed'?'查看说明':'查看记录'};
  }
  function transferSummary(r,compact=false){
    const preference=C.transferPreference(r);
    if(!preference.acceptsTransfer)return '';
    const text=`也接受本酒店其他部门机会：${preference.transferDepartments.join('、')}`;
    return compact?`<p class="ow-flow-extra" data-transfer-preference>${e(text)}</p>`:`<div class="ow-question" data-transfer-preference><b>其他部门意愿</b><span>${e(text)}。本次主岗位仍为 ${e(r.position)}；如需调整岗位，请双方另行确认。此意愿不会创建其他申请，也不会扩大本次联系授权。</span></div>`;
  }
  function recordCard(r,a){
    const next=nextStep(r,a),hold=paused(r),name=a.role==='hotel'?(r.resumeSnapshot.name||anonymousStudent(r.studentId)):r.hotelName;
    const days=Math.max(0,Math.floor((Date.now()-Date.parse(r.updatedAt||r.createdAt))/86400000));
    const wait=C.activeStages.includes(r.stage)||r.stage==='hired'?`<small class="ow-wait-age">${C.needsAction(r,a)?'待你处理':'等待对方'}${Number.isFinite(days)&&days>0?' · '+days+' 天':''}</small>`:'';
    return `<article class="ow-flow-row" data-workflow-kind="outreach" data-workflow-record="${e(r.id)}"><div class="ow-flow-main"><div class="ow-flow-labels"><span class="ow-flow-source">${r.origin==='application'?'学生投递':'酒店邀请'}</span><span class="ow-pill ${hold||r.stage==='admin_closed'?'platform':['interview','hired','offer_accepted'].includes(r.stage)?'active':''}">${e(status(r))}</span></div><h3>${e(name)}<span>${e(r.position)}</span></h3>${progress(r)}<p class="ow-flow-next">${e(next.text)}</p>${transferSummary(r,true)}${wait}${hold?`<p class="ow-flow-extra">平台说明：${e(r.adminHold.reason||'请查看处理记录')}</p>`:r.question?`<p class="ow-flow-extra">待确认：${e(r.question)}</p>`:''}</div><div class="ow-flow-action"><small>${e(fmt(r.updatedAt))}</small><button type="button" class="${!hold&&((a.role==='hotel'&&r.stage==='pending_hotel')||(a.role==='student'&&['pending_student','hired'].includes(r.stage)))?'primary':'secondary'}" data-workflow-action="detail" data-id="${e(r.id)}" data-actor="${e(a.id)}" data-role="${a.role}">${e(next.button)} <span aria-hidden="true">→</span></button></div></article>`;
  }
  function internalCard(item,a){
    const r=item.record,follow=item.kind==='followup';
    const alias=r.candidateAlias||'虚构候选人',roles=r.position||(Array.isArray(r.candidateRoles)?r.candidateRoles.join(' · '):'岗位待确认');
    const checks=window.JiulvFeatures.employer?.followOptions?.()?.promises||[['stipend','津贴与发薪'],['dorm','住宿与通勤'],['meals','供餐与收费'],['rotation','岗位与轮岗']];
    const missing=follow?checks.filter(([key])=>r.commitment?.[key]!==true).map(([,label])=>label):[];
    const note=String(follow?r.note||'尚未填写跟进说明':r.text||'尚未填写邀请内容');
    return `<article class="ow-flow-row ow-flow-internal" data-workflow-kind="${item.kind}" data-workflow-record="${e(item.id)}"><div class="ow-flow-main"><div class="ow-flow-labels"><span class="ow-flow-source">虚构候选人</span><span class="ow-pill ${follow?'internal':'draft'}">${follow?'内部跟进':'未发送草稿'}</span></div><h3>${e(alias)}<span>${e(roles||'岗位待确认')}</span></h3><p class="ow-flow-next">${e(note.length>90?note.slice(0,90)+'…':note)}</p><p class="ow-flow-extra">${follow?`内部阶段：${e(r.stage||'待跟进')} · ${missing.length?`待说明 ${missing.length} 项条件`:'条件已作内部记录'}，不代表双方已确认面试。`:'此草稿未发送，不属于等待学生回应的邀请。'}</p></div><div class="ow-flow-action"><small>${follow?'下次跟进：'+e(r.nextMonth || r.nextDate?.slice(0,7) || '待安排'):'建立于 '+e(fmt(r.createdAt))}</small><button type="button" class="secondary" data-workflow-action="internal-task" data-kind="${item.kind}" data-id="${e(item.id)}" data-actor="${e(a.id)}" data-role="hotel">${follow?'更新跟进':'编辑草稿'} <span aria-hidden="true">→</span></button></div></article>`;
  }
  const inPlan = (record,planId) => !planId || (planId === '__legacy__' ? !record.planId : record.planId === planId);
  function auxiliary(a,planId=''){
    if(a.role!=='hotel')return '';
    const internal=window.JiulvFeatures.employer?.recruitmentTasks?.()||{},items=[...(internal.followups||[]).map(record=>({kind:'followup',id:record.id,record})),...(internal.drafts||[]).map(record=>({kind:'draft',id:record.id,record}))].filter(item=>inPlan(item.record,planId));
    return `<details class="ow-auxiliary"><summary><span>辅助记录</span><small>内部跟进与未发送草稿 · ${items.length}</small></summary><p class="ow-auxiliary-intro">只供本酒店整理，不计入上方投递、邀请或录取进度。</p>${items.length?`<div class="ow-flow-list">${items.map(item=>internalCard(item,a)).join('')}</div>`:'<p class="ow-auxiliary-intro">尚无辅助记录。邀请草稿可从人才卡片创建。</p>'}<div class="ow-flow-footer"><span>内部备注不代替双方确认</span><button type="button" class="text-button" data-workflow-action="internal-task" data-kind="followup" data-plan-id="${e(planId && planId!=='__legacy__'?planId:'')}" data-actor="${e(a.id)}" data-role="hotel">＋ 补充跟进记录</button></div></details>`;
  }
  function render(target,options={}){
    if(!target && role()==='hotel' && window.JiulvFeatures.hotel?.renderPlans) return window.JiulvFeatures.hotel.renderPlans();
    const embedded=document.querySelector('#resume-applications-panel');
    const root=typeof target==='string'?document.querySelector(target):target||(role()==='student'&&embedded&&!document.querySelector('#resume-view')?.hidden?embedded:document.querySelector('#workflow-view'));
    const a=actor();if(!root||!C)return;
    const inResume=root.id==='resume-applications-panel',inPlans=options.inPlans===true,planId=inPlans?options.planId||'':'',accountKey=a?`${a.role}:${a.id}`:null;
    if(accountKey!==workflowAccountId){workflowAccountId=accountKey;filter='action';source='all';searchQuery='';}
    root.classList.toggle('ow-embedded',inResume||inPlans);root.classList.toggle('ow-in-plan',inPlans);
    if(!a){root.innerHTML=`<section class="ow-empty"><h2>登录后查看属于你的回应</h2><p>每份申请只对本人和指定酒店账号开放。</p><button class="primary" data-registration-role="${role()}">注册 / 登录</button></section>`;return;}
    const hotel=a.role==='hotel',scoped=rows().filter(r=>!hotel||inPlan(r,planId)),mine=C.visible(scoped,a),ofSource=C.queue(scoped,a,{source,filter:'all',query:searchQuery});
    const matches=(r,value)=>value==='all'||(value==='action'?C.needsAction(r,a):stage(r)===value);
    const count=value=>ofSource.filter(r=>matches(r,value)).length;
    if(['paused','offer_pending'].includes(filter)&&!count(filter))filter='all';
    const shown=ofSource.filter(r=>matches(r,filter));
    if(filter==='action')shown.sort((x,y)=>String(x.updatedAt||x.createdAt||'').localeCompare(String(y.updatedAt||y.createdAt||'')));
    const heading=inResume||inPlans?'h2':'h1',sourceLabels=[['all','全部来源'],['application',hotel?'学生投递':'我投递的'],['invitation','酒店邀请']];
    root.innerHTML=`<header class="ow-flow-heading${inPlans?' ow-plan-intro':''}">${inPlans?'':`<span class="overline">${hotel?'CANDIDATE PROGRESS':'YOUR APPLICATIONS'}</span><${heading}>${hotel?'候选人进展':'申请进度'}</${heading}>`}<p>${hotel?(planId==='__legacy__'?'历史未关联计划的投递与邀请，仍可继续处理。':planId?'该部门计划的投递与邀请，筛选、面试和结果放在一起。':'所有部门的投递与邀请，先处理需要你回应的事项。'):'邀请与申请放在一起，现在轮到谁，一眼看清。'}</p></header><section class="ow-flow-workspace" aria-label="${hotel?'招聘':'申请'}进展记录"><div class="ow-flow-toolbar"><div class="ow-filters" aria-label="按进度筛选">${flowFilters.filter(([value])=>!['paused','offer_pending'].includes(value)||count(value)>0).map(([value,label])=>`<button type="button" class="${filter===value?'active':''}" data-workflow-action="filter" data-filter="${value}" aria-pressed="${filter===value}">${label}<span>${count(value)}</span></button>`).join('')}</div></div><div class="ow-source-tabs" role="tablist" aria-label="按来源查看">${sourceLabels.map(([value,label])=>`<button type="button" role="tab" aria-selected="${source===value}" class="${source===value?'active':''}" data-workflow-action="source" data-source="${value}">${label}<span>${mine.filter(r=>value==='all'||r.origin===value).length}</span></button>`).join('')}</div><form id="ow-search-form" class="ow-search-form"><input type="search" name="query" value="${e(searchQuery)}" maxlength="100" aria-label="搜索招聘记录" placeholder="${hotel?'例：前厅实习生':'例：上海 · 前厅'}"><button class="secondary" type="submit">搜索</button></form>${shown.length?`<div class="ow-flow-list">${shown.map(r=>recordCard(r,a)).join('')}</div>`:`<div class="ow-empty"><h2>${filter==='action'?'暂时没有需要你处理的事项':'暂时没有这类进展'}</h2><p>${mine.length?'可以查看全部申请、等待对方回应的事项和已有结果。':hotel?'从人才发现了解同学，在对应候选人旁发起邀请。':'准备好简历，选择心仪岗位，开始第一份申请。'}</p>${mine.length?'<button type="button" class="secondary" data-workflow-action="show-all">查看全部进展 →</button>':hotel?'<button type="button" class="secondary" data-view="employer">去人才发现 →</button>':'<button type="button" class="secondary" data-workflow-action="create">去制作简历 →</button>'}</div>`}</section>${auxiliary(a,planId)}<p class="ow-flow-demo">本机演示 · 邮件、通知与跨设备同步尚未接通。录取结果不代表已发送正式 Offer 或签署协议。</p>`;
  }

  function renderEmbedded({planId='',mountId='recruitment-flow-root'}={}){
    if(role()!=='hotel')return;
    if(flowPlanId!==planId){flowPlanId=planId;filter='action';source='all';searchQuery='';}
    flowMountId=mountId;const root=document.querySelector('#'+flowMountId);if(!root)return;return render(root,{inPlans:true,planId:flowPlanId});
  }
  function openRecordFlow(record){
    if(role()==='hotel'&&window.JiulvFeatures.hotel?.openPlanFlow)window.JiulvFeatures.hotel.openPlanFlow(record.planId||'__legacy__');
    else api.showView('workflow');
  }
  const studentContacts = account => window.JiulvFeatures.resume?.getContactSnapshot?.() || C.studentContacts(account);
  function scheduleLabel(snap){
    if(/^\d{4}-\d{2}$/.test(snap.startMonth||''))return `${snap.startMonth.replace('-', '年')}月起 · ${snap.durationMonths==='unlimited'?'时长不限':/^([1-9]|1[0-2])$/.test(String(snap.durationMonths))?snap.durationMonths+'个月':'时长待确认'}`;
    return `${String(snap.startDate||'').slice(0,7)||'待确认'} 至 ${String(snap.endDate||'').slice(0,7)||'待确认'}`;
  }
  function planSummary(r){
    const snap=r.conditionSnapshot;if(!snap)return '';
    const groups=window.JiulvRecruitmentCatalog?.conditionDisplayGroups?.(snap.conditions)||[];
    const rows=items=>items.map(([label,value])=>`<div><dt>${e(label)}</dt><dd>${e(value||'待确认')}</dd></div>`).join('');
    const note=C.redact(snap.note);
    return `<details class="ow-plan-snapshot"><summary>本次招聘计划 · 条件版本 ${e(r.planRevision||snap.planRevision)}</summary><p>${e(snap.name||snap.role)}</p><dl>${rows([['实习时间',scheduleLabel(snap)],...(note?[['部门具体岗位说明',note]]:[])])}</dl>${groups.map(group=>`<section><h4>${e(group.title)}</h4><dl>${rows(group.rows)}</dl></section>`).join('')}<small>保留本次申请/邀请时的条件；酒店后续修改计划不会覆盖此记录。</small></details>`;
  }
  function emailBody(r){const fields=Object.entries(C.fieldLabels).filter(([key])=>r.resumeSnapshot[key]);return `<article class="ow-mail" data-outreach-detail="${e(r.id)}" data-outreach-version="${r.version}">${platformNotice(r)}<div class="ow-mail-head"><span>酒旅之星 · 代投递邮件预览</span><b>未实际发送</b></div><p><strong>接收：</strong>${e(r.hotelName)} HR（待配置验证邮箱）</p><p><strong>主题：</strong>实习申请 · ${e(r.position)} · 编号 ${e(r.id.slice(0,8))}</p><hr><p>您好，一位实习生希望了解贵酒店的 ${e(r.position)}，以下为其逐次授权的简历摘要。</p><dl>${fields.map(([key,label])=>`<div><dt>${e(label)}</dt><dd>${e(r.resumeSnapshot[key])}</dd></div>`).join('')}</dl>${transferSummary(r)}${r.question?`<div class="ow-question"><b>学生想确认</b><span>${e(r.question)}</span></div>`:''}<p class="ow-meta">此邮件不含候选人的电话、邮箱、微信号或照片。联系方式不会随本次摘要发送。</p>${!paused(r)&&C.activeStages.includes(r.stage)?`<button class="primary" data-workflow-action="open-receiver" data-id="${e(r.id)}">模拟点击邮件链接：登录酒店处理 →</button>`:'<p class="ow-meta">此处仅保留邮件历史预览，本次流程当前无法通过邮件链接继续处理。</p>'}<small>此按钮演示网页跳转；正式上线后由服务端生成受控链接，并核验酒店身份。</small></article>`;}
  function contactCard(r,a){
    const hotel=a.role==='hotel',contact=hotel?r.contactDetails:r.hotelContactDetails;
    if(contact&&(contact.phone||contact.email||contact.wechat))return `<section class="ow-contact-card"><span class="overline">DIRECT CONTACT</span><h3>${hotel?'本次授权的学生联系方式':'本次酒店联系人'}</h3><dl>${contact.name?`<div><dt>联系人</dt><dd>${e(contact.name)}</dd></div>`:''}${contact.phone?`<div><dt>电话</dt><dd><a href="tel:${e(contact.phone)}">${e(contact.phone)}</a></dd></div>`:''}${contact.email?`<div><dt>邮箱</dt><dd><a href="mailto:${e(contact.email)}">${e(contact.email)}</a></dd></div>`:''}${contact.wechat?`<div><dt>微信号</dt><dd>${e(contact.wechat)}</dd></div>`:''}</dl><p>仅用于本次岗位沟通。请双方私下约定面试；简历和邮件预览仍不包含直接联系方式。</p></section>`;
    let text=hotel?(r.contactConsent?.granted?'学生已授权；完成确认后，在这里查看本次联系方式。':'学生尚未授权本次联系方式，确认通过不会自动读取其账户资料。'):(['interview','hired','offer_accepted'].includes(r.stage)?'酒店尚未留下可展示的已核验联系方式，可在下方补充沟通事项，或联系酒旅之星协助。':'通过筛选或接受邀请后，在这里查看本次酒店联系人。');
    if(paused(r))text='平台暂停期间暂不展示联系方式，恢复后按原授权继续。';
    if(['declined','withdrawn','admin_closed','not_hired','offer_declined'].includes(r.stage))text='本次流程已结束，联系方式不再展示。';
    return `<section class="ow-contact-card locked"><h3>${hotel?'学生联系方式':'酒店联系方式'}</h3><p>${e(text)}</p></section>`;
  }
  function reasonFields(hidden=false){
    return `<fieldset class="ow-rejection-reasons" data-rejection-fields ${hidden?'hidden disabled':''}><legend>未通过原因（选填）</legend><div class="ow-reason-options">${(C.declineReasons||[]).map(({value,label})=>`<label><input type="radio" name="reasonCode" value="${e(value)}"><span>${e(label)}</span></label>`).join('')}</div><small>对方可以看到所选原因。选择“其他”时，请补充具体说明。</small></fieldset>`;
  }
  function feedbackReason(r){return r.rejectionReason?.label?`<p class="ow-feedback-reason"><span>${r.rejectionReason.stage==='screening'?'初筛反馈':'面试反馈'}</span><b>${e(r.rejectionReason.label)}</b></p>`:'';}
  function resultDetails(r,a){
    if(!['hired','not_hired','offer_accepted','offer_declined'].includes(r.stage))return '';
    const hotel=a.role==='hotel',accepted=r.stage==='offer_accepted',declined=r.stage==='offer_declined';
    const title=r.stage==='hired'?(hotel?'已录取，等待学生确认':'酒店已录取，等你的决定'):accepted?'学生已接受录取':declined?'学生已放弃录取':'酒店已登记未录取';
    const text=r.stage==='hired'?'请核对实习条件与个人安排，由学生本人选择接受或放弃。本记录不代表学生已接受、已到岗或已签署协议。':accepted?'双方已确认录取意向，接下来直接核对学校手续、协议与到岗安排。接受录取不等于已签署协议或已到岗。':declined?'学生已决定放弃本次录取，流程结束，原有决定与说明保留。':hotel?'已向学生记录未录取结果。可在反馈中说明原因，便于双方结束本次沟通。':'本次流程结束。你可以保留这次反馈，继续寻找其他机会。';
    return `<section class="ow-choice ow-result"><h3>${title}</h3><p>${text}</p>${accepted?'<ul class="ow-preparation"><li>核对学校实习手续</li><li>确认协议与本次实习条件</li><li>与酒店确定报到时间、地点和住宿安排</li></ul>':''}${feedbackReason(r)}${r.recruitmentResult?.note?`<p>${e(r.recruitmentResult.note)}</p>`:''}<small>酒店登记：${e(fmt(r.recruitmentResult?.recordedAt||r.updatedAt))}</small>${r.studentDecision?`<div class="ow-student-response"><b>${accepted?'接受录取':'放弃录取'}</b><small>学生回应：${e(fmt(r.studentDecision.recordedAt))}</small>${r.studentDecision.note?`<p>${e(r.studentDecision.note)}</p>`:''}</div>`:''}${r.stage==='hired'&&!hotel&&!paused(r)?`<form id="ow-offer-form" data-record="${e(r.id)}" data-actor="${e(a.id)}" data-role="student" data-version="${r.version}"><fieldset class="ow-offer-choice"><legend>我的选择</legend><div class="ow-result-options"><label><input type="radio" name="decision" value="accepted" required>接受录取</label><label><input type="radio" name="decision" value="declined" required>放弃录取</label></div></fieldset><label class="ft-field">给酒店的说明（选填）<textarea name="note" maxlength="500" placeholder="例：我已核对学校安排，可以按约定时间到岗。"></textarea></label><p class="ow-meta">确认后将记录你的选择。接受只是确认录取意向，后续仍需按学校和酒店要求办理手续。</p><button class="primary" type="submit">确认我的选择</button></form>`:''}</section>`;
  }
  function detail(id){
    const raw=current(id),a=actor();if(!raw||!a)return api.toast('请登录此申请对应的账号后查看。');
    const r=C.project(raw,a),hotel=a.role==='hotel',blocked=paused(r)||r.stage==='admin_closed';let actions='';
    if(!blocked&&r.stage==='pending_hotel'&&hotel)actions=`<section class="ow-choice"><h3>这份简历是否符合初步需求？</h3><p>通过后进入“简历筛选通过”，按学生本次授权开放联系方式，由双方私下约面试。</p><div class="actions"><button class="primary" data-workflow-action="accept" ${actionData(r,a)}>通过简历筛选</button><button class="secondary" data-workflow-action="decline-form" ${actionData(r,a)}>本次不需要</button></div></section>`;
    else if(!blocked&&r.stage==='pending_student'&&!hotel)actions=`<section class="ow-choice"><h3>愿意接受这家酒店的邀请吗？</h3><p>接受前核对本次简历与联系授权。接受只表示愿意面试，不代表接受实习条件或已被录取。</p><div class="actions"><button class="primary" data-workflow-action="accept-form" ${actionData(r,a)}>核对并接受邀请</button><button class="secondary" data-workflow-action="decline-form" ${actionData(r,a)}>拒绝邀请</button></div></section>`;
    else if(!blocked&&stage(r)==='pending')actions=`<section class="ow-choice"><h3>等待${r.stage==='pending_hotel'?'酒店筛选':'学生回应'}</h3><p>${e(nextStep(r,a).text)}</p></section>`;
    if(!hotel&&!blocked&&r.contactConsent?.legacyNeedsConsent)actions+=`<section class="ow-choice ow-consent-needed"><h3>补充本次联系授权</h3><p>这条记录尚未授权向该酒店展示联系方式。补充后，只在筛选通过阶段向这家酒店开放。</p><button class="secondary" data-workflow-action="contact-form" ${actionData(r,a)}>核对联系方式并授权</button></section>`;
    if(r.stage==='interview'&&!blocked&&hotel)actions+=`<section class="ow-choice"><h3>面试后，登记录取结果</h3><p>先与学生私下约面试。完成后记录酒店的决定；录取后还需学生本人确认。</p><form id="ow-result-form" data-record="${e(id)}" data-actor="${e(a.id)}" data-role="hotel" data-version="${r.version}"><div class="ow-result-options"><label><input type="radio" name="decision" value="hired" required>录取</label><label><input type="radio" name="decision" value="not_hired" required>未录取</label></div>${reasonFields(true)}<label class="ft-field"><span data-note-label>结果说明（选填）</span><textarea name="note" maxlength="500" placeholder="例：面试通过，后续联系确认报到安排。"></textarea></label><button class="primary" type="submit">确认酒店决定</button></form></section>`;
    actions+=resultDetails(r,a);
    const canReply=r.stage==='interview'&&!blocked;
    const messages=(r.messages||[]).map(m=>`<div class="ow-message"><b>${m.role==='hotel'?'酒店':'学生'} · ${e(fmt(m.at))}</b><p>${e(m.text)}</p></div>`).join('');
    if(canReply||messages)actions+=`<details class="ow-history ow-communication"><summary>补充沟通事项${r.messages?.length?` · ${r.messages.length} 条`:''}</summary><p class="ow-meta">可补充时间偏好和待问条件；面试请双方直接约定。</p>${messages}${canReply?`<form id="ow-reply-form" data-record="${e(id)}" data-actor="${e(a.id)}" data-role="${a.role}" data-version="${r.version}"><label class="ft-field">说明<textarea name="note" required maxlength="1200" placeholder="例：我周三下午可以面试，也想确认实习开始日期。"></textarea></label><button type="submit" class="secondary">保存沟通（演示）</button></form>`:''}</details>`;
    if((r.closingNote||r.rejectionReason)&&r.stage==='declined')actions+=`<section class="ow-choice"><h3>${r.origin==='application'?'酒店筛选反馈':'学生邀请回应'}</h3>${feedbackReason(r)}${r.closingNote?`<p>${e(r.closingNote)}</p>`:''}</section>`;
    else if(r.closingNote&&r.stage!=='admin_closed')actions+=`<div class="ow-choice"><p>${e(r.closingNote)}</p></div>`;
    const initiated=(hotel&&r.origin==='invitation')||(!hotel&&r.origin==='application');
    const resume=hotel&&Object.keys(C.fieldLabels).some(key=>r.resumeSnapshot[key])?`<details class="ow-snapshot" data-outreach-id="${e(id)}" ${r.stage==='pending_hotel'?'open':''}><summary>查看本次脱敏简历</summary><div class="resume-preview">${window.JiulvFeatures.resume?.renderSnapshot?.(r.resumeSnapshot)||''}</div></details>`:'';
    api.modal(`<div class="ow-detail" data-outreach-detail="${e(id)}" data-outreach-version="${r.version}"><span class="ow-pill ${blocked?'platform':['interview','hired','offer_accepted'].includes(r.stage)?'active':''}">${e(status(r))}</span><h2 id="modal-title">${e(r.position)}</h2><p class="detail-subtitle">${e(r.hotelName)}</p>${progress(r)}${platformNotice(r)}${planSummary(r)}${transferSummary(r)}${r.question?`<div class="ow-question"><b>本次待确认问题</b><span>${e(r.question)}</span></div>`:''}${r.note?`<p>${e(r.note)}</p>`:''}${resume}${contactCard(r,a)}${actions}${r.origin==='application'?`<div class="actions"><button class="secondary" data-workflow-action="email-preview" data-id="${e(id)}">查看无联系方式简历邮件</button>${!blocked&&!hotel&&r.stage==='pending_hotel'?`<button class="secondary" data-workflow-action="simulate-receipt" ${actionData(r,a)}>模拟酒店收到邮件</button>`:''}</div>`:''}<details class="ow-history"><summary>查看回应与平台处理记录</summary><ol>${(r.history||[]).map(h=>`<li class="${h.actor==='platform'?'ow-platform-history':''}">${h.actor==='platform'?'<b>平台处理</b>':''}${e(h.label)}${h.actor==='platform'&&h.beforeStage&&h.afterStage?`<small>原进度：${e(C.labels[h.beforeStage]||h.beforeStage)} · 处理后：${e(C.labels[h.afterStage]||h.afterStage)}${h.action==='pause'?'（暂停，未推进进度）':''}</small>`:''}<small>${e(fmt(h.at))}</small></li>`).join('')}</ol></details>${initiated&&['pending_hotel','pending_student','interview'].includes(r.stage)?`<button class="text-button" data-workflow-action="withdraw-form" ${actionData(r,a)}>撤回本次${hotel?'邀请':'申请'}</button>`:''}<p class="ow-meta">当前为本机演示；登录、权限和邮件需在正式服务端实现。</p></div>`,'RECRUITMENT / 招聘进展');
  }
  function recordResumeView(r){const a=actor();if(a?.role==='hotel'&&C.owns(r,a)&&r.resumeSnapshot?.name)window.JiulvGrowth?.recordStudentView?.(r.studentId,'授权简历');}
  function emailPreview(id){const r=current(id);if(!r)return api.toast('请登录对应账号。');api.modal(emailBody(C.project(r,actor())),'EMAIL PREVIEW / 无联系方式简历');recordResumeView(r);}
  function openReceiver(id){
    const student=api.getAccount(),raw=rows().find(r=>r.id===id),h=api.getHotelAccount();
    if(!raw||(!C.owns(raw,{id:student?.id,role:'student'})&&!C.owns(raw,{id:h?.id,role:'hotel'})))return api.toast('没有查看该邮件预览的权限。');
    if(paused(raw)||!C.activeStages.includes(raw.stage))return detail(id);
    if(!raw.hotelAccountId&&!raw.recipientEmail){api.modal(`<h2 id="modal-title">接收酒店仍待平台核验</h2><p class="detail-subtitle">${e(raw.hotelName)} 尚无已确认的招聘邮箱。公开资料不代表入驻，不能按酒店同名认领简历。</p><p>本次授权与进度会保留，请联系酒旅之星核对接收酒店。</p><button class="secondary" data-view="contact">联系酒旅之星</button>`,'HOTEL ACCOUNT / 核验接收方');return;}
    const expectedVersion=raw.version;
    const receive=()=>{
      const logged=api.getHotelAccount(),all=rows(),index=all.findIndex(r=>r.id===id),latest=all[index];
      if(!logged||!latest)return api.toast('请登录本次指定的酒店账号。');
      try{
        if(latest.version!==expectedVersion)throw Error('记录已变化，请由学生重新打开邮件预览。');
        if(!latest.hotelAccountId){const bound=C.claimRecipient(latest,{...logged,role:'hotel'},{expectedVersion});if(!saveRows(all.map((r,i)=>i===index?bound:r),'claim-recipient',bound))return;}
        else if(logged.id!==latest.hotelAccountId)throw Error('请登录这份申请指定的酒店账号，其他账号不能接收。');
        document.body.dataset.perspective='employer';source='application';filter='all';close();openRecordFlow(latest);detail(id);
      }catch(error){
        if(!latest.hotelAccountId&&logged.hrEmail?.trim().toLowerCase()===latest.recipientEmail?.trim().toLowerCase()&&!C.hotelContacts({...logged,role:'hotel'}).email){
          api.modal(`<h2 id="modal-title">请先核验这份申请的接收邮箱</h2><p>你已登录酒店账户，但这份申请对应的工作邮箱尚未核验。手机号验证不能代替该邮箱的所有权核验。</p><p>申请进度将保留；请在账户资料中验证邮箱，或联系酒旅之星协助处理。</p><button class="primary" data-registration-role="hotel" data-registration-mode="profile">查看账户资料</button><button class="secondary" data-view="contact">联系酒旅之星</button>`,'VERIFY EMAIL / 核验接收方');
        }else api.toast(error.message);
      }
    };
    if(h?.id===raw.hotelAccountId||(h&&!raw.hotelAccountId&&h.hrEmail?.trim().toLowerCase()===raw.recipientEmail))return receive();
    close();api.openRegistration('hotel',receive);
  }
  function apply(id,action,data={}){const a=actor(),all=rows(),index=all.findIndex(r=>r.id===id);if(!a||index<0)return api.toast('请重新登录。');try{const grantActor=a.role==='student'&&data.contactConsent===true?{...a,phone:'',email:'',wechat:'',...studentContacts(a)}:a;const next=C.transition(all[index],grantActor,action,{...data,expectedVersion:data.expectedVersion});if(!saveRows(all.map((r,i)=>i===index?next:r),action,next))return false;render();if(action==='simulate-receipt')emailPreview(id);else detail(id);return true;}catch(error){api.toast(error.message);return false;}}
  function closingForm(id,action,expectedVersion){
    const r=current(id),a=actor();if(!r||!a)return;if(Number(expectedVersion)!==r.version)return api.toast('记录已变化，请重新打开申请详情。');if(r.stage==='admin_closed'||(paused(r)&&action!=='withdraw'))return detail(id);
    const hotelDecline=action==='decline'&&a.role==='hotel';
    api.modal(`<h2 id="modal-title">${action==='decline'?(hotelDecline?'本次不需要':'拒绝本次邀请'):'撤回本次沟通'}</h2><p class="detail-subtitle">${e(r.hotelName)} · ${e(r.position)}</p><form id="ow-close-form" data-record="${e(id)}" data-actor="${e(a.id)}" data-role="${a.role}" data-version="${r.version}" data-action="${action}">${hotelDecline?reasonFields():''}<label class="ft-field"><span data-note-label>${hotelDecline?'补充说明（选填）':'给对方的简短说明'}</span><textarea name="note" ${hotelDecline?'':'required'} maxlength="500" placeholder="${hotelDecline?'例：本次岗位需要的外语能力与当前简历不符。':'例：可到岗时间与这次需求不一致，谢谢。'}"></textarea></label><button class="primary" type="submit">确认并保存回应</button></form>`,'A CLEAR RESPONSE / 明确回应');
  }
  function updateDecisionForm(form){
    if(!form||!['ow-result-form','ow-close-form'].includes(form.id))return;
    const decision=form.querySelector('[name="decision"]:checked')?.value,fields=form.querySelector('[data-rejection-fields]');
    const showReason=form.id==='ow-close-form'||decision==='not_hired';
    if(fields){fields.hidden=!showReason;fields.disabled=!showReason;}
    const other=showReason&&form.querySelector('[name="reasonCode"]:checked')?.value==='other';
    const note=form.querySelector('[name="note"]'),label=form.querySelector('[data-note-label]');
    if(note&&fields)note.required=other;
    if(label&&fields)label.textContent=other?'补充说明（必填）':form.id==='ow-result-form'?'结果说明（选填）':'补充说明（选填）';
  }
  function consentForm(id,action,expectedVersion){
    pendingConsent=null;
    const raw=current(id),a=actor();if(!raw||a?.role!=='student')return;
    if(Number(expectedVersion)!==raw.version)return api.toast('记录已变化，请重新打开申请详情。');
    const r=C.project(raw,a);if(paused(r)||!((action==='accept'&&r.stage==='pending_student')||(action==='authorize-contact'&&['pending_hotel','interview'].includes(r.stage)&&!r.contactConsent?.granted)))return detail(id);
    if(action==='accept'){const complete=window.JiulvFeatures.resume?.validateCurrentResume?.();if(complete&&!complete.ok)return api.toast(complete.error);}
    const contact=studentContacts(a);
    if(!contact.phone&&!contact.email&&!contact.wechat){api.modal(`<h2 id="modal-title">先补充可联系的手机号</h2><p>请在简历中填写可联系的手机号或邮箱，保存后回到这条邀请确认联系。</p><button class="primary" data-workflow-action="complete-contact" ${actionData(r,a)} data-next-action="${action}">完善我的联系方式</button>`,'CONTACT / 本次联系授权');return;}
    const snapshot=action==='accept'?window.JiulvFeatures.resume?.getShareableSnapshot?.():null;
    if(action==='accept'&&!snapshot)return api.toast('请先保存一份简历，再核对本次邀请授权。');
    if(action==='accept'){const timing=window.JiulvFeatures.resume?.validateTiming?.(snapshot);if(timing&&!timing.ok)return api.toast(timing.error);}
    pendingConsent={recordId:id,studentId:a.id,version:r.version,action,phone:contact.phone||'',email:contact.email||'',wechat:contact.wechat||'',snapshot:snapshot?C.sanitizeSnapshot(snapshot):null};
    api.modal(`<section class="ow-detail" data-outreach-detail="${e(id)}" data-outreach-version="${r.version}"><h2 id="modal-title">${action==='accept'?'核对这次邀请授权':'补充本次联系授权'}</h2><p class="detail-subtitle">仅向 ${e(r.hotelName)} · ${e(r.position)}</p>${snapshot?`<p class="ow-meta">下面是这次共享的脱敏简历；酒店可查看非联系方式简历，本次记录会保留你确认的版本。</p><div class="resume-preview">${window.JiulvFeatures.resume?.renderSnapshot?.(pendingConsent.snapshot)||''}</div>`:''}<div class="ow-consent-preview"><b>仅本次授权的联系方式</b><p>${e([contact.phone,contact.email,contact.wechat?`微信 ${contact.wechat}`:''].filter(Boolean).join(' · '))}</p><small>确认通过后在独立联系卡展示，不写入简历和代投递邮件。</small></div><form id="ow-consent-form" data-record="${e(id)}" data-actor="${e(a.id)}" data-role="student" data-version="${r.version}" data-action="${action}">${snapshot?'<label class="ft-consent"><input name="resumeConsent" type="checkbox" required><span>我已核对上方简历，将此版本用于本次面试沟通。</span></label>':''}<label class="ft-consent"><input name="contactConsent" type="checkbox" required><span>我同意仅在本次筛选通过或邀请接受后，向这家酒店展示上方联系方式，用于私下约面试。本机演示不发送邮件或通知。</span></label><button class="primary" type="submit">${action==='accept'?'接受邀请并授权本次联系':'确认本次联系授权'}</button></form></section>`,'REVIEW BEFORE SHARING / 逐次授权');
  }
  function createForm(candidate){
    invitationTarget=null;
    if(role()==='student'){close();api.showView('resume');window.JiulvFeatures.resume?.openTab('profile');return;}
    if(candidate?.fictional===true){window.JiulvFeatures.employer?.openCandidateDraft?.(candidate.id);return;}
    ensure(()=>{
      const a=actor(),student=accounts().students.find(s=>s.id===candidate?.studentId);
      if(!student){close();api.showView('employer');api.toast('请先在人才发现中选择具体候选人，再创建邀请。');return;}
      const plans=window.JiulvRecruitmentCatalog?.getInvitePlans?.()||[];
      if(!plans.length){api.modal(`<h2 id="modal-title">先准备一份招聘计划</h2><p>在实习机会中填写通用条件，再发布部门计划，就能邀请 ${e(candidate.alias||'这位同学')}，不用重复说明待遇。</p><button class="primary" data-view="workflow">去招聘计划</button>`,'INVITE / 岗位先说清楚');return;}
      invitationTarget={hotelId:a.id,studentId:student.id,plans:Object.fromEntries(plans.map(p=>[p.id,p.planRevision]))};
      api.modal(`<h2 id="modal-title">邀请这位实习生进一步了解</h2><p class="detail-subtitle">${e(candidate.alias||'这位实习同学')}。本次邀请只发给你选择的这位学生。</p><form id="ow-invite-form" data-actor="${e(a.id)}" data-role="hotel" data-student-id="${e(student.id)}"><input type="hidden" name="studentId" value="${e(student.id)}"><label class="ft-field">选择招聘计划<select name="jobId" data-invite-plan required><option value="">请选择已发布的岗位</option>${plans.map(plan=>`<option value="${e(plan.id)}">${e(plan.conditionSnapshot?.name||plan.role)} · ${e(plan.role)}</option>`).join('')}</select></label><div id="ow-invite-plan-preview"></div><label class="ft-field">给同学的话（选填）<textarea name="note" maxlength="1000" placeholder="例：你的前厅意向与我们的岗位很契合，期待进一步沟通。"></textarea></label><label class="ft-consent"><input type="checkbox" name="consent" required><span>我确认用所选岗位邀请这位学生。由学生自行接受或拒绝，接受并授权后才获得联系方式。</span></label><button class="primary" type="submit">确认邀请（本机演示）</button></form>`,'INVITE / 先表达意向');
    });
  }
  document.addEventListener('toggle',event=>{const t=event.target;if(t.classList?.contains('ow-snapshot')&&t.open){const r=current(t.dataset.outreachId);if(r)recordResumeView(r);}},true);
  document.addEventListener('click',event=>{const b=event.target.closest('[data-workflow-action]');if(!b)return;const action=b.dataset.workflowAction,id=b.dataset.id;if(b.dataset.actor){const a=actor();if(!a||a.id!==b.dataset.actor||a.role!==b.dataset.role)return api.toast('账号已变化，请重新打开记录。');}
    if(action==='internal-task'){const a=actor();if(a?.role!=='hotel'||!['followup','draft'].includes(b.dataset.kind))return;window.JiulvFeatures.employer?.openRecruitmentTask?.(b.dataset.kind,id||'',b.dataset.planId||'');}
    else if(action==='switch'){close();document.body.dataset.perspective=b.dataset.role==='hotel'?'employer':'student';source='application';filter='all';api.showView('workflow');}
    else if(action==='source'){source=['all','application','invitation'].includes(b.dataset.source)?b.dataset.source:'all';render();}
    else if(action==='show-all'){source='all';filter='all';searchQuery='';render();}
    else if(action==='filter'){filter=flowFilters.some(([key])=>key===b.dataset.filter)?b.dataset.filter:'all';render();}
    else if(action==='accept-form'||action==='contact-form')consentForm(id,action==='accept-form'?'accept':'authorize-contact',b.dataset.version);
    else if(action==='complete-contact'){const a=actor();if(a?.role!=='student')return;close();api.showView('resume');window.JiulvFeatures.resume?.openTab('profile');api.toast('请在简历中完善联系方式，保存后回到这条邀请确认。');}
    else if(action==='create')createForm();else if(action==='detail')detail(id);else if(action==='accept'){if(actor()?.role==='student')consentForm(id,'accept',b.dataset.version);else apply(id,'accept',{expectedVersion:Number(b.dataset.version)});}else if(action==='decline-form')closingForm(id,'decline',b.dataset.version);else if(action==='withdraw-form')closingForm(id,'withdraw',b.dataset.version);else if(action==='email-preview')emailPreview(id);else if(action==='open-receiver')openReceiver(id);else if(action==='simulate-receipt')apply(id,'simulate-receipt',{expectedVersion:Number(b.dataset.version)});
    else if(action==='invite'){const candidate=window.JiulvFeatures.employer?.candidates?.().find(c=>c.id===b.dataset.candidateId);if(candidate)window.JiulvWorkflow.inviteFromCandidate(candidate);}
  });
  document.addEventListener('change',event=>{
    updateDecisionForm(event.target.closest?.('#ow-result-form, #ow-close-form'));
    if(event.target.matches?.('[data-invite-plan]')){const job=(window.JiulvRecruitmentCatalog?.getInvitePlans?.()||[]).find(j=>j.id===event.target.value),preview=document.querySelector('#ow-invite-plan-preview');if(preview)preview.innerHTML=job?planSummary({conditionSnapshot:job.conditionSnapshot,planRevision:job.planRevision}):'';}
  });
  document.addEventListener('submit',event=>{const f=event.target;if(f.id==='ow-search-form'){event.preventDefault();searchQuery=String(new FormData(f).get('query')||'').trim();render();return;}if(!['ow-reply-form','ow-close-form','ow-invite-form','ow-result-form','ow-consent-form','ow-offer-form'].includes(f.id))return;event.preventDefault();if(!f.reportValidity())return;const a=actor();if(!a||f.dataset.actor!==a.id||f.dataset.role!==a.role)return api.toast('账号已变化，请重新打开表单。');const data=Object.fromEntries(new FormData(f));
    if(f.id==='ow-consent-form'){
      const pending=pendingConsent;
      if(a.role!=='student'||!pending||pending.recordId!==f.dataset.record||pending.studentId!==a.id||pending.version!==Number(f.dataset.version)||pending.action!==f.dataset.action)return api.toast('本次授权页面已变化，请重新核对。');
      if(pending.action==='accept'){const complete=window.JiulvFeatures.resume?.validateCurrentResume?.();if(complete&&!complete.ok)return api.toast(complete.error);}
      const contact=studentContacts(a);
      if(pending.phone!==(contact.phone||'')||pending.email!==(contact.email||'')||pending.wechat!==(contact.wechat||''))return api.toast('联系方式已变化，请重新打开并核对本次授权。');
      if(data.contactConsent!=='on'||(pending.action==='accept'&&data.resumeConsent!=='on'))return api.toast('请分别确认本次简历与联系方式授权。');
      if(apply(pending.recordId,pending.action,{contactConsent:true,resumeConsent:pending.action==='accept',resumeSnapshot:pending.snapshot,expectedVersion:pending.version}))pendingConsent=null;
      return;
    }
    if(f.id==='ow-offer-form'){apply(f.dataset.record,'offer-response',{decision:data.decision,note:data.note,expectedVersion:Number(f.dataset.version)});return;}
    if(f.id==='ow-result-form'){apply(f.dataset.record,'result',{decision:data.decision,reasonCode:data.decision==='not_hired'?data.reasonCode:undefined,note:data.note,expectedVersion:Number(f.dataset.version)});return;}
    if(f.id==='ow-invite-form'){
      if(!invitationTarget||invitationTarget.hotelId!==a.id||invitationTarget.studentId!==data.studentId||f.dataset.studentId!==data.studentId)return api.toast('邀请对象已变化，请回到这位候选人的资料重新创建。');
      const student=accounts().students.find(s=>s.id===data.studentId),job=(window.JiulvRecruitmentCatalog?.getInvitePlans?.()||[]).find(j=>j.id===data.jobId);
      if(!student||data.consent!=='on')return api.toast('学生账户状态已变化。');
      if(!job)return api.toast('请选择仍开放的招聘计划。');
      if(invitationTarget.plans[job.id]!==job.planRevision)return api.toast('计划条件已更新，请重新打开邀请核对新版本。');
      const duplicate=C.duplicate(rows(),student.id,hotelKey(a),job.role,job.planId);
      if(duplicate){
        if(!C.owns(duplicate,a))return api.toast('该计划已有进行中的记录，请联系酒旅之星核对所属酒店账号。');
        invitationTarget=null;openRecordFlow(duplicate);source='all';filter='all';searchQuery='';render();detail(duplicate.id);
        return api.toast('已打开这份招聘计划的进行中记录，可在这里继续处理。');
      }
      try{
        const r=C.create({id:crypto.randomUUID(),studentId:student.id,hotelAccountId:a.id,hotelId:hotelKey(a),hotelName:a.hotelName,position:job.role,jobId:job.id,planId:job.planId,planRevision:job.planRevision,conditionSnapshot:job.conditionSnapshot,note:data.note,consent:true,resumeSnapshot:window.JiulvFeatures.resume?.getHotelSnapshot?.(student.id)||{}},a);
        if(saveRows([...rows(),r],'invitation',r)){invitationTarget=null;openRecordFlow(r);source='invitation';filter='pending';render();detail(r.id);}
      }catch(error){api.toast(error.message);}return;
    }
    apply(f.dataset.record,f.id==='ow-reply-form'?'reply':f.dataset.action,{note:data.note,reasonCode:f.id==='ow-close-form'&&a.role==='hotel'&&f.dataset.action==='decline'?data.reasonCode:undefined,expectedVersion:Number(f.dataset.version)});
  });
  document.addEventListener('jiulv:ask-hr',event=>{event.preventDefault();const q={question:C.redact(event.detail?.question||''),title:C.redact(event.detail?.title||''),topicId:String(event.detail?.topicId||'').slice(0,80)};const a=api.getAccount();if(a)api.save(`academy-question:${a.id}`,q);else unownedQuestion=q;close();document.body.dataset.perspective='student';api.showView('jobs');api.toast('问题已带入本次投递准备：选择酒店后，在简历授权页一并确认。');});
  document.addEventListener('jiulv:accountchange',()=>{const a=actor(),key=a?`${a.role}:${a.id}`:null;if(key!==workflowAccountId&&document.querySelector('#modal')?.querySelector('[data-outreach-detail]'))close();if(invitationTarget&&(a?.id!==invitationTarget.hotelId||a?.role!=='hotel'))invitationTarget=null;if(pendingConsent&&(a?.id!==pendingConsent.studentId||a?.role!=='student'))pendingConsent=null;if(!document.querySelector('#workflow-view')?.hidden||(!document.querySelector('#resume-view')?.hidden&&document.querySelector('#resume-applications-panel')))render();});
  function refreshOutreach(){
    const dialog=document.querySelector('#modal'),panel=dialog?.open?(dialog.querySelector('[data-outreach-detail]')||dialog.querySelector('#ow-close-form')):null,openRecord=panel?.dataset.outreachDetail||panel?.dataset.record,openVersion=Number(panel?.dataset.outreachVersion||panel?.dataset.version);
    if(!document.querySelector('#workflow-view')?.hidden||(!document.querySelector('#resume-view')?.hidden&&document.querySelector('#resume-applications-panel')))render();
    if(openRecord){const latest=current(openRecord);if(!latest)close();else if(latest.version!==openVersion){detail(openRecord);api.toast('招聘记录已更新，已显示最新平台处理与回应。');}}
  }
  window.addEventListener?.('storage',event=>{const a=actor(),internalPrefix=a?.role==='hotel'?`jiulv:v2:employer:hotel:${encodeURIComponent(a.id)}:`:null;if(event.key==='jiulv:v2:'+KEY||event.key===null||(internalPrefix&&['followups','invites'].some(key=>event.key===internalPrefix+key)))refreshOutreach();});
  window.JiulvWorkflow={fromDelivery,detail,getQuestion,clearQuestion,emailPreview,list:()=>rows(),inviteFromCandidate(candidate){document.body.dataset.perspective='employer';if(candidate?.fictional===true||!candidate?.studentId){invitationTarget=null;if(!window.JiulvFeatures.employer?.openCandidateDraft?.(candidate?.id))api.toast('请先选择具体候选人再创建邀请。');return;}createForm(candidate);}};
  window.JiulvFeatures.workflow={render,renderEmbedded};
})();
