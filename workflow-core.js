(function(root){
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const activeStages=['pending_hotel','pending_student','connected','interview','offer_draft','offer_sent','accepted','onboarding'];
  const labels={pending_hotel:'待酒店接受',pending_student:'待学生接受',connected:'双方已同意',interview:'面试与反馈',offer_draft:'Offer 草稿',offer_sent:'待回应 Offer',accepted:'已接受 Offer',onboarding:'到岗准备',arrived:'已记录到岗',declined:'已婉拒',withdrawn:'已撤回'};
  const validId=value=>typeof value==='string'&&value.length>0&&value===value.trim();
  function owns(record,actor){return !!record&&!!actor&&validId(actor.id)&&((actor.role==='student'&&record.studentId===actor.id)||(actor.role==='hotel'&&record.hotelAccountId===actor.id));}
  function visible(records,actor){return (Array.isArray(records)?records:[]).filter(record=>owns(record,actor)).map(record=>project(record,actor));}
  function chinaDay(value){const time=new Date(value).getTime();if(!Number.isFinite(time))throw new Error('流程时间无效，请重试。');return new Date(time+8*60*60*1000).toISOString().slice(0,10);}
  function validDay(value){if(typeof value!=='string'||(!/^\d{4}-\d{2}-\d{2}$/.test(value)||value.startsWith('0000')))return false;const d=new Date(value+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;}
  function meetingURL(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&['meeting.tencent.com','voovmeeting.com','www.voovmeeting.com'].includes(u.hostname)?u.href:'';}catch{return '';}}
  function requireText(value,label,max=2000){const s=String(value||'').trim();if(!s||s.length>max)throw new Error(`请填写${label}（不超过${max}字）。`);return s;}
  function create(data,actor,now){
    if(!['student','hotel'].includes(actor?.role)||!validId(actor.id))throw new Error('请先注册并登录对应账号。');
    if(!validId(data.id)||!validId(data.studentId)||!validId(data.hotelId)||(data.hotelAccountId!=null&&!validId(data.hotelAccountId)))throw new Error('请明确有效的记录编号与申请双方。');
    if(actor.role==='student'&&actor.id!==data.studentId)throw new Error('只能代表本人投递。');
    if(actor.role==='hotel'&&actor.id!==data.hotelAccountId)throw new Error('只能以当前酒店账号邀请。');
    chinaDay(now);
    const hotel=data.hotelAccountId||null;
    return {id:data.id,version:1,studentId:data.studentId,studentName:requireText(data.studentName||'匿名同学','学生姓名',80),hotelAccountId:hotel,hotelId:data.hotelId,hotelName:requireText(data.hotelName,'酒店名称',150),position:requireText(data.position,'岗位',100),origin:actor.role==='student'?'application':'invitation',stage:actor.role==='student'?'pending_hotel':'pending_student',studentConsent:actor.role==='student',hotelConsent:actor.role==='hotel',applicationNote:String(data.applicationNote||'').slice(0,1000),deliveryId:data.deliveryId||null,resumeSnapshot:data.resumeSnapshot?clone(data.resumeSnapshot):null,interview:null,conclusions:{student:null,hotel:null},offer:null,onboarding:{school:false,materials:false,hotelReady:false},createdAt:now,updatedAt:now,history:[{at:now,by:actor.role,label:actor.role==='student'?'学生提交了申请':'酒店发出了站内邀请（演示）'}]};
  }
  function duplicate(records,studentId,hotelId,position){return (Array.isArray(records)?records:[]).find(r=>r.studentId===studentId&&r.hotelId===hotelId&&r.position===position&&activeStages.includes(r.stage));}
  function hasDelivery(record,deliveryId){return validId(deliveryId)&&!!record&&(record.deliveryId===deliveryId||(Array.isArray(record.resumeShares)&&record.resumeShares.some(share=>share?.deliveryId===deliveryId)));}
  function attachDelivery(original,actor,delivery,now=new Date().toISOString(),recipientAccountId=null){
    if(actor?.role!=='student'||!owns(original,actor))throw new Error('只能由该学生本人关联简历授权。');
    if(!delivery||!validId(delivery.id)||delivery.accountId!==actor.id||delivery.hotelId!==original.hotelId||delivery.role!==original.position)throw new Error('简历授权必须对应同一学生、酒店和岗位。');
    if(delivery.channel!=='hotel-account'||delivery.status!=='demo-authorized')throw new Error('仅能关联本人已确认的酒店账号渠道授权。');
    if(!delivery.resumeSnapshot||typeof delivery.resumeSnapshot!=='object'||Array.isArray(delivery.resumeSnapshot))throw new Error('简历授权缺少有效快照。');
    if(recipientAccountId!==null&&!validId(recipientAccountId))throw new Error('接收酒店账号无效。');
    if(recipientAccountId&&original.hotelAccountId&&recipientAccountId!==original.hotelAccountId)throw new Error('接收酒店账号与原流程不一致，请重新确认接收对象。');
    if(hasDelivery(original,delivery.id))return {record:clone(original),added:false};
    if(!activeStages.includes(original.stage))throw new Error('该流程已结束，请另行发起本次申请。');
    chinaDay(now);
    const r=clone(original),shares=Array.isArray(r.resumeShares)?r.resumeShares:[];
    if(r.resumeSnapshot&&!shares.length){
      shares.push({deliveryId:validId(r.deliveryId)?r.deliveryId:null,legacy:true,attachedAt:r.createdAt,resumeSnapshot:clone(r.resumeSnapshot)});
    }
    shares.push({deliveryId:delivery.id,accountId:delivery.accountId,hotelId:delivery.hotelId,role:delivery.role,channel:delivery.channel,status:delivery.status,authorizedAt:delivery.createdAt||null,attachedAt:now,resumeSnapshot:clone(delivery.resumeSnapshot)});
    r.resumeShares=shares;r.resumeSnapshot=clone(delivery.resumeSnapshot);if(!r.deliveryId)r.deliveryId=delivery.id;
    if(!r.hotelAccountId&&recipientAccountId)r.hotelAccountId=recipientAccountId;
    r.version+=1;r.updatedAt=now;
    r.history.push({at:now,by:'student',deliveryId:delivery.id,label:`学生新增逐次简历授权（${String(delivery.resumeSnapshot.version||'未标注版本').slice(0,80)}，仅本机记录，未实际发送）；流程进度不变`});
    return {record:r,added:true};
  }
  function transition(original,actor,action,data={},now=new Date().toISOString()){
    if(!owns(original,actor))throw new Error('当前账号无权处理这条记录。');
    if(data.expectedVersion!==undefined&&Number(data.expectedVersion)!==original.version)throw new Error('进度已变化，请重新打开记录。');
    const r=clone(original),role=actor.role,today=chinaDay(now);
    const need=(condition,message)=>{if(!condition)throw new Error(message);};
    const hotel=()=>need(role==='hotel','此步骤需要酒店账号操作。');
    const student=()=>need(role==='student','此步骤需要该学生本人操作。');
    let label='';
    if(action==='accept'){
      need((r.stage==='pending_hotel'&&role==='hotel')||(r.stage==='pending_student'&&role==='student'),'只有受邀的一方可以接受。');
      r.studentConsent=true;r.hotelConsent=true;r.stage='connected';label='双方同意，开始招聘流程';
    }else if(action==='decline'){
      need((r.stage==='pending_hotel'&&role==='hotel')||(r.stage==='pending_student'&&role==='student'),'当前阶段不能婉拒初次申请。');
      r.stage='declined';r.closingNote=requireText(data.note,'说明',500);label='接收方婉拒了本次申请 / 邀请';
    }else if(action==='withdraw'){
      need(activeStages.includes(r.stage)&&!['accepted','onboarding'].includes(r.stage),'当前阶段不能撤回。');
      r.stage='withdrawn';r.closingNote=requireText(data.note,'撤回说明',500);label='撤回本次沟通';
    }else if(action==='schedule'){
      hotel();need(['connected','interview'].includes(r.stage),'双方同意后才能安排面试。');
      need(r.studentConsent&&r.hotelConsent,'请先取得双方同意。');
      const time=String(data.time||''),date=new Date(time);
      need(Number.isFinite(date.getTime()),'请填写面试时间。');
      const url=String(data.url||'').trim();need(!url||meetingURL(url),'仅支持腾讯会议 / VooV 官方 HTTPS 链接。');
      r.interview={time:date.toISOString(),mode:url?'腾讯会议':'线下 / 电话',url:url?meetingURL(url):'',location:String(data.location||'').slice(0,200),note:String(data.note||'').slice(0,1000),confirmed:false};
      need(url||r.interview.location.trim(),'请填写会议链接，或线下地点 / 电话沟通说明。');
      r.conclusions={student:null,hotel:null};delete r.hotelInterviewNotes;r.stage='interview';label='酒店更新面试安排，等待学生确认';
    }else if(action==='confirm_interview'){
      student();need(r.stage==='interview'&&r.interview,'还没有待确认的面试安排。');r.interview.confirmed=true;label='学生确认了面试安排';
    }else if(action==='conclusion'){
      need(r.stage==='interview'&&r.interview?.confirmed,'请先由学生确认面试安排。');
      need(['proceed','hold','decline'].includes(data.decision),'请选择面试结论。');
      r.conclusions[role]={decision:data.decision,publicNote:requireText(data.note,'给对方的反馈',1000),at:now};
      if(role==='hotel')r.hotelInterviewNotes=String(data.privateNote||'').slice(0,3000);
      label=role==='hotel'?'酒店记录了面试结果':'学生记录了面试后的意愿';
    }else if(action==='save_offer'){
      hotel();const revisingExpired=r.stage==='offer_sent'&&r.offer&&validDay(r.offer.deadline)&&r.offer.deadline<today;need(['interview','offer_draft'].includes(r.stage)||revisingExpired,'当前阶段不能编辑 Offer；已发送的有效版本不能直接改写。');
      need(r.conclusions.student?.decision==='proceed'&&r.conclusions.hotel?.decision==='proceed','双方结论均为愿意继续后，才能拟定 Offer。');
      need(validDay(data.startDate)&&validDay(data.endDate)&&data.startDate<=data.endDate,'请填写有效的实习起止日期。');
      need(validDay(data.deadline)&&data.deadline>=today,'回应截止日期不能早于今天。');
      const stipend=Number(data.stipend);need((typeof data.stipend==='number'||(typeof data.stipend==='string'&&data.stipend.trim()!==''))&&Number.isFinite(stipend)&&stipend>=0&&stipend<=100000,'请填写有效的基础津贴。');
      r.offer={version:(r.offer?.version||0)+1,startDate:data.startDate,endDate:data.endDate,deadline:data.deadline,stipend,position:requireText(data.position,'Offer岗位',100),conditions:requireText(data.conditions,'食宿、保障及其他接收条件',3000),createdAt:now};r.stage='offer_draft';label=revisingExpired?'酒店修订了过期 Offer；旧版本已失效，新草稿待重新发送':'酒店保存了新版 Offer 草稿';
    }else if(action==='send_offer'){
      hotel();need(r.stage==='offer_draft'&&r.offer,'请先保存 Offer 草稿。');need(r.conclusions.student?.decision==='proceed'&&r.conclusions.hotel?.decision==='proceed','双方需先明确愿意继续。');need(r.offer.deadline>=today,'Offer已过回应截止日期，请修改草稿。');r.stage='offer_sent';r.offer.sentAt=now;label='酒店发送了站内 Offer（本机演示）';
    }else if(action==='respond_offer'){
      student();need(r.stage==='offer_sent'&&r.offer,'当前没有待回应的 Offer。');need(r.offer.deadline>=today,'Offer回应期限已过，请联系酒店重新确认。');need(['accept','decline'].includes(data.response),'请选择接受或婉拒。');r.offer.response=data.response;r.offer.respondedAt=now;r.stage=data.response==='accept'?'accepted':'declined';label=data.response==='accept'?'学生接受了演示 Offer':'学生婉拒了演示 Offer';
    }else if(action==='onboarding'){
      need(['accepted','onboarding'].includes(r.stage),'接受 Offer 后才能准备到岗。');
      if(role==='student'){r.onboarding.school=data.school===true;r.onboarding.materials=data.materials===true;}else r.onboarding.hotelReady=data.hotelReady===true;
      r.stage='onboarding';label=role==='student'?'学生更新了学校手续和材料自查':'酒店更新了到岗准备';
    }else if(action==='arrived'){
      hotel();need(r.stage==='onboarding'&&r.onboarding.school&&r.onboarding.materials&&r.onboarding.hotelReady,'请双方先完成到岗准备清单。');r.stage='arrived';label='酒店手工记录到岗（演示）';
    }else throw new Error('不支持的流程操作。');
    r.version+=1;r.updatedAt=now;r.history.push({at:now,by:role,label});return r;
  }
  function project(record,actor){
    if(!owns(record,actor))return null;
    const r=clone(record);if(actor.role!=='hotel'){delete r.hotelInterviewNotes;if(r.offer&&!r.offer.sentAt)r.offer=null;}
    if(actor.role==='hotel'&&r.origin==='invitation'&&!r.studentConsent){
      const shares=(Array.isArray(r.resumeShares)?r.resumeShares:[]).filter(share=>share.accountId===r.studentId&&share.hotelId===r.hotelId&&share.role===r.position&&share.channel==='hotel-account'&&share.status==='demo-authorized');
      const shared=shares.at(-1)?.resumeSnapshot;
      r.studentName=typeof shared?.name==='string'&&shared.name.trim()?shared.name:'匿名意向学生';r.resumeSnapshot=shared||null;r.resumeShares=shares;
    }
    return r;
  }
  const api={labels,activeStages,owns,visible,validDay,chinaDay,meetingURL,create,duplicate,hasDelivery,attachDelivery,transition,project};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.JiulvWorkflowCore=api;
})(typeof window!=='undefined'?window:this);
