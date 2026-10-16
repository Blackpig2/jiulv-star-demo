/* 酒旅之星 V5: consent-scoped recruitment rules; no email/network transport. */
(function(root){'use strict';
  const labels={pending_hotel:'等待酒店回应',pending_student:'等待学生回应',interview:'简历筛选通过',hired:'已录取 · 待学生确认',offer_accepted:'学生已接受录取',offer_declined:'学生已放弃录取',not_hired:'未录取',declined:'本次暂不合适',withdrawn:'已撤回',admin_closed:'平台已结束流程'};
  const declineReasons=Object.freeze([
    {value:'time_mismatch',label:'时间周期不符'},
    {value:'role_mismatch',label:'岗位方向不符'},
    {value:'skill_mismatch',label:'语言技能不符'},
    {value:'position_filled',label:'岗位名额已满'},
    {value:'other',label:'其他'}
  ].map(Object.freeze));
  const activeStages=['pending_hotel','pending_student','interview'];
  const fieldLabels={name:'姓名',gender:'性别',birthMonth:'出生年月',birthplace:'出生地',height:'身高（cm）',weight:'体重（kg）',school:'学校',major:'专业',degree:'学历',enrollment:'入学时间',graduation:'毕业时间',educationSummary:'教育背景补充',startDate:'最早到岗',endDate:'最晚结束',startMonth:'开始年月',endMonth:'结束年月',duration:'可实习周期',intentionCities:'意向城市',intentionRoles:'意向岗位',experienceLevel:'经历情况',conversionIntent:'留任意向',extensionIntent:'是否可延长实习',tripartiteIntent:'是否可签三方协议',englishLevel:'英语能力',languages:'外语能力',skills:'技能证书',experience:'兼职与实习经历',clubs:'校园与社团经历',objective:'实习意向'};
  const clean=(v,max=1800)=>typeof v==='string'?v.normalize('NFKC').replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g,'').trim().slice(0,max):'';
  const clone=v=>JSON.parse(JSON.stringify(v));
  const standardCore=()=>typeof module!=='undefined'&&module.exports?require('./core.js'):root.JiulvCore;
  function canonicalEnglish(value){return (standardCore()?.ENGLISH_LEVELS||['基础交流：能进行简单日常对话','熟练沟通：能处理日常服务交流','流利交流：能独立应对复杂沟通']).find(level=>clean(level)===value)||'';}
  function transferPreference(raw={}){
    const core=standardCore();
    const departments=core?.DEPARTMENTS||['前厅','餐饮','厨房','客房','市场销售','人力资源','财务','预订','康体','工程','安保','其他'];
    const primary=departments.find(department=>[department,`${department}实习生`].includes(raw.position||raw.role));
    const values=raw.acceptsTransfer===true&&raw.origin!=='invitation'&&Array.isArray(raw.transferDepartments)?raw.transferDepartments:[];
    const transferDepartments=[...new Set(values.filter(value=>departments.includes(value)&&value!==primary))];
    return {acceptsTransfer:transferDepartments.length>0,transferDepartments};
  }
  function redact(value){
    return clean(value).replace(/<[^>]*>/g,'').split(/\r?\n/).map(line=>{
      // A hospitality skill such as 电话接待 is not a contact field. Match a
      // concrete identifier (or explicit labelled contact value), not the noun.
      return line.replace(/(?:微信|微\s*信|wechat|weixin|\bvx\b|\bqq\b|whatsapp|telegram)(?:\s*(?:账号|帐号|号))?\s*[:：=]?\s*[a-z0-9][a-z0-9_.+\-]{3,}/gi,'[联系方式已隐藏]')
        .replace(/(?:联系方式|联系号码|联系邮箱|电话|手机|邮箱|电子邮件|e-?mail|phone|mobile)\s*[:：=]\s*[^，。；;\n]+/gi,'[联系方式已隐藏]')
        .replace(/[A-Z0-9._%+-]+\s*(?:@|\[at\]|\(at\))\s*[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[邮箱已隐藏]')
        .replace(/(?:https?:\/\/|www\.)[^\s，。；;]+/gi,'[链接已隐藏]')
        .replace(/(?:\+?\d[\s().-]*){7,}/g,'[号码已隐藏]')
        .replace(/[零〇一二三四五六七八九幺]{7,}/g,'[号码已隐藏]');
    }).join('\n').slice(0,1800);
  }
  function redactExperience(value) {
    // Preserve a valid, leading experience timeline. Numeric contact strings in
    // the rest of the entry still use the same contact redaction rules.
    const part='(?:19|20)\\d{2}(?:[-./](?:0[1-9]|1[0-2])(?:[-./](?:0[1-9]|[12]\\d|3[01]))?|年(?:0?[1-9]|1[0-2])月(?:(?:0?[1-9]|[12]\\d|3[01])日)?)';
    const timeline=new RegExp(`^(${part})(?:\\s*(?:-|—|–|~|至|到)\\s*(${part}|至今|现在))?(?=\\s|[·|]|$)`);
    const valid=value=>{
      if(['至今','现在'].includes(value))return true;
      const normalized=value.replace(/年|月/g,'-').replace(/日$/,'').replace(/[-]$/,'').replace(/[./]/g,'-');
      const [year,month,day]=normalized.split('-').map(Number);
      if(!day)return true;
      const date=new Date(Date.UTC(year,month-1,day));
      return date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day;
    };
    return clean(value).split(/\r?\n/).map(line=>{
      const match=line.match(timeline);
      if(!match||!valid(match[1])||(match[2]&&!valid(match[2])))return redact(line);
      const tail=line.slice(match[0].length), redacted=redact(tail);
      return `${match[0]}${tail&&/^\s/.test(tail)?' ':''}${redacted}`;
    }).join('\n').slice(0,1800);
  }
  function sanitizeSnapshot(raw={}){
    const out={version:clean(raw.version,80),generatedAt:clean(raw.generatedAt,40),sharedFields:[],sharingGroups:['identity','education','intention','ability','experience'],contactRedacted:true};
    for(const [key,label] of Object.entries(fieldLabels)){
      const rawValue=clean(raw[key]);if(!rawValue)continue;
      const value=['extensionIntent','tripartiteIntent'].includes(key)?(['可以','不可以','待确认'].includes(rawValue)?rawValue:''):key==='englishLevel'?canonicalEnglish(rawValue):['startDate','endDate'].includes(key)?(/^\d{4}-\d{2}-\d{2}$/.test(rawValue)?rawValue:''):['enrollment','graduation','startMonth','endMonth','birthMonth'].includes(key)?(/^\d{4}-(0[1-9]|1[0-2])$/.test(rawValue)?rawValue:''):['experience','clubs'].includes(key)?redactExperience(rawValue):redact(rawValue);
      if(value){out[key]=value;out.sharedFields.push(label);}
    }
    return out;
  }
  const owns=(row,a)=>Boolean(row&&a&&typeof a.id==='string'&&a.id.trim()&&((a.role==='student'&&row.studentId===a.id)||(a.role==='hotel'&&row.hotelAccountId&&row.hotelAccountId===a.id)));
  const visible=(rows,a)=>(Array.isArray(rows)?rows:[]).filter(r=>owns(r,a)).map(r=>project(r,a));
  function duplicate(rows,studentId,hotelId,position,planId=null){return (rows||[]).find(r=>r.studentId===studentId&&r.hotelId===hotelId&&r.position===position&&(!planId||!r.planId||r.planId===planId)&&activeStages.includes(r.stage))||null;}
  function needsAction(row,actor){
    if(!owns(row,actor)||row.adminHold?.active||row.stage==='admin_closed')return false;
    return actor.role==='hotel'?['pending_hotel','interview'].includes(row.stage):['pending_student','hired'].includes(row.stage);
  }
  function queue(rows,actor,{source='all',filter='action',query=''}={}){
    const text=clean(query).toLocaleLowerCase();
    return visible(rows,actor).filter(r=>(source==='all'||r.origin===source)&&(!text||[r.hotelName,r.position,r.resumeSnapshot?.name].some(v=>String(v||'').toLocaleLowerCase().includes(text)))&&(filter!=='action'||needsAction(r,actor))).sort((a,b)=>{
      if(filter==='action')return String(a.updatedAt||a.createdAt||'').localeCompare(String(b.updatedAt||b.createdAt||''));
      return String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||''));
    });
  }
  const terminalStages=['declined','withdrawn','admin_closed','hired','not_hired','offer_accepted','offer_declined'];
  const hasReason=data=>data.reasonCode!==undefined&&data.reasonCode!==null&&data.reasonCode!=='';
  function rejectionReason(data,stage,a,at){
    if(!hasReason(data))return null;
    const selected=declineReasons.find(reason=>reason.value===data.reasonCode);
    if(!selected)throw Error('请选择有效的未通过原因。');
    if(selected.value==='other'&&!clean(redact(data.note)))throw Error('选择其他原因时，请补充具体说明。');
    return {code:selected.value,label:selected.label,stage,recordedAt:at,recordedBy:a.id};
  }
  const email=value=>{const normalized=clean(value,254).toLowerCase();return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)?normalized:'';};
  const verifiedField=(a,key)=>!['pending','removed'].includes(a.opsContactVerification?.[key]?.status);
  function studentContacts(a={}){
    a=a||{};
    const out={},phone=clean(a.phone,30).replace(/[\s()-]/g,'');
    if(verifiedField(a,'phone')&&/^\+?\d{7,15}$/.test(phone))out.phone=phone;
    const address=email(a.email);if(verifiedField(a,'email')&&address)out.email=address;
    const wechat=clean(a.wechat,64);if(/^[a-zA-Z][a-zA-Z0-9_-]{5,63}$/.test(wechat))out.wechat=wechat;
    return out;
  }
  function grantedContacts(r){
    const contact=studentContacts(r.contactSnapshot||{});
    // Historic grants authorized only phone/email. New channels require an
    // explicit field list captured when the student reviews this record.
    const allowed=Array.isArray(r.contactGrant?.fields)?r.contactGrant.fields:['phone','email'];
    for(const key of Object.keys(contact))if(!allowed.includes(key))delete contact[key];
    return contact;
  }
  const binding=r=>({recordId:r.id,studentId:r.studentId,hotelId:r.hotelId,hotelAccountId:r.hotelAccountId||null,deliveryId:r.deliveryId||null,recipientEmail:email(r.recipientEmail)});
  function sameBinding(r,b){return Boolean(b&&Object.entries(binding(r)).every(([key,value])=>b[key]===value));}
  function validGrant(r){return r.contactGrant?.scope==='this-record-after-screening'&&sameBinding(r,r.contactGrant)&&Object.keys(grantedContacts(r)).length>0;}
  function grantContacts(r,a,at){
    if(a.role!=='student'||a.id!==r.studentId)throw Error('联系方式只能由学生本人授权。');
    const contact=studentContacts(a);if(!Object.keys(contact).length)throw Error('请先补充并核验手机号，再授权本次联系。');
    r.contactSnapshot=contact;r.contactGrant={...binding(r),scope:'this-record-after-screening',fields:Object.keys(contact),grantedAt:at};
  }
  function hotelContacts(a={}){
    const accountCore=typeof module!=='undefined'&&module.exports?require('./account-core.js'):root.JiulvAccountCore;
    const out={},address=accountCore?.hotelVerifiedTarget?.(a,'email')||'',phone=accountCore?.hotelVerifiedTarget?.(a,'phone')||'';
    if(address)out.email=address;
    if(phone)out.phone=phone;
    if(address||phone)out.name=clean(a.reporterName||a.hotelName,80);
    return out;
  }
  function captureHotelContact(r,a,at){
    if(a.role!=='hotel'||a.id!==r.hotelAccountId)return;
    const contact=hotelContacts(a);
    if(!contact.phone&&!contact.email)return;
    r.hotelContactSnapshot=contact;r.hotelContactBinding={...binding(r),capturedAt:at};
  }
  function canRelease(r){return ['interview','hired','offer_accepted'].includes(r.stage)&&!r.adminHold?.active;}
  function claimRecipient(row,a,data={},at=new Date().toISOString()){
    if(!a||a.role!=='hotel'||typeof a.id!=='string'||!a.id.trim())throw Error('请先登录酒店账号。');
    if(!row||typeof row!=='object')throw Error('申请记录不存在，请刷新后重试。');
    if(Number(data.expectedVersion)!==row.version)throw Error('记录已变化，请刷新后重试。');
    if(row.origin!=='application'||row.stage!=='pending_hotel'||row.hotelAccountId||row.adminHold?.active)throw Error('该记录不能认领，请核对当前状态和接收账号。');
    const target=email(row.recipientEmail),actual=email(a.hrEmail);
    if(!target||!actual||target!==actual)throw Error('预期招聘邮箱不一致，不能认领此申请。');
    if(hotelContacts(a).email!==target)throw Error('该招聘邮箱尚未核验，请先验证对应邮箱，或联系酒旅之星协助；手机号验证不能代替邮箱核验。');
    const r=clone(row),hadGrant=validGrant(row);r.hotelAccountId=a.id;
    if(hadGrant)r.contactGrant={...r.contactGrant,...binding(r)};
    r.version++;r.updatedAt=at;r.history=[...(r.history||[]),{at,label:'经预期企业招聘邮箱核对，绑定接收酒店账号（演示）'}];
    return r;
  }
  function create(input,a,at=new Date().toISOString()){
    if(typeof a?.id!=='string'||!a.id.trim()||!['student','hotel'].includes(a.role))throw Error('请先登录本次操作的账号。');
    if(!input.id||!input.studentId||!input.hotelId||!clean(input.position,120))throw Error('申请信息不完整。');
    if(a.role==='student'&&a.id!==input.studentId)throw Error('只能授权本人投递。');
    if(a.role==='hotel'&&a.id!==input.hotelAccountId)throw Error('只能使用本酒店账号邀请。');
    if(input.consent!==true)throw Error('请明确确认本次申请或邀请。');
    const stage=a.role==='student'?'pending_hotel':'pending_student';
    const r={id:clean(input.id,100),version:1,studentId:input.studentId,hotelAccountId:input.hotelAccountId||null,hotelId:input.hotelId,hotelName:clean(input.hotelName,150),recipientEmail:email(input.recipientEmail),position:clean(input.position,120),origin:a.role==='student'?'application':'invitation',stage,question:redact(input.question),note:redact(input.note),resumeSnapshot:sanitizeSnapshot(input.resumeSnapshot),deliveryId:input.deliveryId||null,emailState:'not_connected',simulatedReceivedAt:null,createdAt:at,updatedAt:at,consentAt:a.role==='student'?at:null,history:[{at,label:a.role==='student'?'学生逐次授权 · 邮件待接入':'酒店发出本机演示邀请'}]};
    Object.assign(r,transferPreference({...input,origin:r.origin}));
    if(input.planId){
      const catalog=typeof module!=='undefined'&&module.exports?require('./recruitment-catalog.js'):root.JiulvRecruitmentCatalog;
      const snapshot=catalog?.normalizeSnapshot?.(input.conditionSnapshot);
      if(!snapshot||snapshot.planId!==input.planId||snapshot.hotelId!==input.hotelId||snapshot.hotelAccountId!==input.hotelAccountId||snapshot.planRevision!==Number(input.planRevision)||(input.jobId&&input.jobId!==snapshot.jobId)||clean(input.position,120)!==snapshot.role)throw Error('招聘计划版本不完整，请重新核对岗位。');
      r.jobId=clean(input.jobId||snapshot.jobId,200);r.planId=snapshot.planId;r.planRevision=snapshot.planRevision;r.conditionSnapshot={...snapshot,conditions:{...snapshot.conditions,values:{...snapshot.conditions.values},photos:{}}};
    }
    if(input.contactConsent===true)grantContacts(r,a,at);
    if(a.role==='hotel')captureHotelContact(r,a,at);
    return r;
  }
  function transition(row,a,action,data={},at=new Date().toISOString()){
    if(!owns(row,a))throw Error('当前账号无权处理这条记录。');
    if(Number(data.expectedVersion)!==row.version)throw Error('记录已变化，请刷新后重试。');
    if(row.stage==='admin_closed')throw Error('平台已结束本次流程，请查看平台说明或联系酒旅之星。');
    if(row.adminHold?.active&&action!=='withdraw')throw Error('平台已暂停本次流程，恢复后才能继续回应或沟通；发起方仍可撤回。');
    if(terminalStages.includes(row.stage)&&!(row.stage==='hired'&&action==='offer-response'))throw Error('该记录已结束，不能继续修改招聘决定或授权。');
    if(hasReason(data)&&!(a.role==='hotel'&&((action==='decline'&&row.stage==='pending_hotel')||(action==='result'&&data.decision==='not_hired'))))throw Error('未通过原因仅用于酒店筛选拒绝或面试未录取。');
    const r=clone(row);let label;
    if(action==='simulate-receipt'){
      if(a.role!=='student'||r.origin!=='application'||r.stage!=='pending_hotel')throw Error('仅可模拟本人待回应申请的收件预览。');
      if(r.simulatedReceivedAt)return r;
      r.simulatedReceivedAt=at;label='已生成模拟收件预览 · 未发送邮件';
    }else if(action==='accept'){
      if(!((a.role==='hotel'&&r.stage==='pending_hotel')||(a.role==='student'&&r.stage==='pending_student')))throw Error('当前阶段不能重复接受。');
      r.stage='interview';r.screeningPassedAt=at;
      if(a.role==='student'){
        r.consentAt=at;
        if(data.contactConsent===true)grantContacts(r,a,at);
        if(data.resumeConsent===true){
          if(!data.resumeSnapshot||typeof data.resumeSnapshot!=='object'||Array.isArray(data.resumeSnapshot))throw Error('请先准备并确认本次共享的简历。');
          r.resumeSnapshot=sanitizeSnapshot(data.resumeSnapshot);r.resumeConsentAt=at;
        }
      }else captureHotelContact(r,a,at);
      label=a.role==='hotel'?'酒店通过简历筛选':'学生接受酒店邀请';
    }else if(action==='authorize-contact'){
      if(a.role!=='student'||!['pending_hotel','interview'].includes(r.stage))throw Error('仅学生本人可在待筛选或已通过阶段补充联系方式授权。');
      if(data.contactConsent!==true)throw Error('请明确同意仅向本次酒店提供注册联系方式。');
      if(validGrant(r))throw Error('本次联系方式已授权；不会用当前账号资料自动替换原授权快照。');
      grantContacts(r,a,at);label='学生补充本次联系方式授权';
    }else if(action==='result'){
      if(a.role!=='hotel'||r.stage!=='interview')throw Error('仅酒店可在双方愿意继续后记录面试录取结果。');
      if(!['hired','not_hired'].includes(data.decision))throw Error('请选择录取或未录取。');
      const reason=data.decision==='not_hired'?rejectionReason(data,'interview',a,at):null;if(reason)r.rejectionReason=reason;
      r.stage=data.decision;r.recruitmentResult={decision:data.decision,note:redact(data.note),recordedAt:at,recordedBy:a.id};label=data.decision==='hired'?'酒店记录面试结果：录取，等待学生确认':'酒店记录面试结果：未录取';
    }else if(action==='offer-response'){
      if(a.role!=='student'||r.stage!=='hired')throw Error('仅学生本人可对待确认的录取结果作出选择。');
      if(r.studentDecision)throw Error('学生已回应本次录取，不能重复修改。');
      if(!['accepted','declined'].includes(data.decision))throw Error('请选择接受录取或放弃录取。');
      r.studentDecision={decision:data.decision,note:redact(data.note),recordedAt:at,recordedBy:a.id};
      r.stage=data.decision==='accepted'?'offer_accepted':'offer_declined';label=data.decision==='accepted'?'学生接受本次录取 · 尚未记录到岗':'学生放弃本次录取';
    }else if(action==='decline'){
      if(!((a.role==='hotel'&&r.stage==='pending_hotel')||(a.role==='student'&&r.stage==='pending_student')))throw Error('当前阶段无法婉拒。');
      const reason=a.role==='hotel'?rejectionReason(data,'screening',a,at):null;if(reason)r.rejectionReason=reason;
      r.stage='declined';r.closingNote=redact(data.note)||'感谢关注，本次暂不合适。';label=a.role==='hotel'?'酒店回应暂不合适':'学生婉拒本次邀请';
    }else if(action==='withdraw'){
      if(!activeStages.includes(r.stage))throw Error('该记录已结束。');
      if((a.role==='hotel'&&r.origin!=='invitation')||(a.role==='student'&&r.origin!=='application'))throw Error('仅发起方可撤回本次申请或邀请。');
      r.stage='withdrawn';if(r.adminHold?.active)r.adminHold={...r.adminHold,active:false,endedAt:at};r.closingNote=redact(data.note)||'发起方已撤回。';label='发起方撤回沟通';
    }else if(action==='reply'){
      if(r.stage!=='interview')throw Error('双方愿意沟通后才能补充安排。');
      const note=redact(data.note);if(!note)throw Error('请填写要沟通的事项。');
      r.messages=[...(r.messages||[]),{role:a.role,text:note,at}];label=a.role==='hotel'?'酒店补充面试沟通':'学生补充沟通问题';
    }else throw Error('未知操作。');
    r.version++;r.updatedAt=at;r.history=[...(r.history||[]),{at,label}];return r;
  }
  function project(row,a){
    if(!owns(row,a))return null;
    const r=clone(row),granted=validGrant(row),released=granted&&canRelease(row);
    for(const key of ['contactSnapshot','contactGrant','hotelContactSnapshot','hotelContactBinding','contactDetails','hotelContactDetails','contactConsent','recipientEmail'])delete r[key];
    r.resumeSnapshot=sanitizeSnapshot(r.resumeSnapshot);
    Object.assign(r,transferPreference(r));
    r.contactConsent={granted,grantedAt:granted?row.contactGrant.grantedAt:null,released,legacyNeedsConsent:!granted&&['pending_hotel','interview'].includes(row.stage)};
    if(a.role==='hotel'&&released)r.contactDetails=grantedContacts(row);
    if(a.role==='student'&&canRelease(row)&&sameBinding(row,row.hotelContactBinding)){
      const address=email(row.hotelContactSnapshot?.email),phone=clean(row.hotelContactSnapshot?.phone,30).replace(/[\s()-]/g,'');
      if(address||/^1\d{10}$/.test(phone))r.hotelContactDetails={name:clean(row.hotelContactSnapshot?.name,80),...(address?{email:address}:{}),...(/^1\d{10}$/.test(phone)?{phone}:{})};
    }
    return r;
  }
  const api={labels,activeStages,terminalStages,declineReasons,fieldLabels,redact,sanitizeSnapshot,transferPreference,studentContacts,hotelContacts,owns,visible,duplicate,needsAction,queue,create,transition,project,claimRecipient};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.JiulvOutreachCore=api;
})(typeof window!=='undefined'?window:this);
