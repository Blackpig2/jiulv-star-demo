(function(root){
  'use strict';
  const DAY=86400000;
  function validInvite(v,jobs,now=Date.now()){return Boolean(v&&typeof v.token==='string'&&/^[\w-]{8,64}$/.test(v.token)&&jobs.some(j=>j.id===v.jobId&&j.departments.includes(v.role))&&/^20\d{2}-(0[1-9]|1[0-2])$/.test(v.month)&&Number.isInteger(v.months)&&v.months>=1&&v.months<=12&&Number.isFinite(v.expires)&&v.expires>now&&v.expires<=now+31*DAY);}
  function addVisit(records,visit,now=Date.now()){
    if(!visit.ownerId||!visit.viewerId||visit.ownerId===visit.viewerId||!['student','hotel'].includes(visit.viewerRole)) return records;
    const day=new Date(now).toISOString().slice(0,10),id=[visit.ownerId,visit.viewerId,visit.targetId,day].join(':');
    return [...records.filter(r=>now-r.at<90*DAY&&r.id!==id),{...visit,id,at:now}].slice(-1500);
  }
  function visibleVisits(records,ownerId,accounts,now=Date.now()){return records.filter(r=>r.ownerId===ownerId&&Number.isFinite(r.at)&&r.at<=now&&now-r.at<90*DAY).map(r=>{const viewer=accounts.find(a=>a.id===r.viewerId);return {...r,label:viewer?.visitConsent===true?(viewer.role==='hotel'?viewer.hotelName:'实习生 · '+(viewer.name||'').slice(0,1)+'同学'):'匿名访客',identified:viewer?.visitConsent===true};}).sort((a,b)=>b.at-a.at);}
  function addJoin(list,token,studentId,ownerId){if(!studentId||studentId===ownerId||list.some(r=>r.token===token&&r.studentId===studentId))return list;return [...list,{token,studentId,joinedAt:Date.now()}];}
  function aggregate(events,days=30,now=Date.now()){const valid=events.filter(x=>Number.isFinite(x.at)&&x.at<=now&&now-x.at<days*DAY);const ids=new Set();const rows={};for(const x of valid){if(!x.id||ids.has(x.id))continue;ids.add(x.id);const role=String(x.role||'未指定');rows[role]??={role,views:0,applies:0,replies:0,interviews:0};const key={view:'views',apply:'applies',reply:'replies',interview:'interviews'}[x.type];if(key)rows[role][key]++;}return Object.values(rows).sort((a,b)=>b.applies-a.applies||b.views-a.views);}
  const rejectionLabels={time_mismatch:'时间周期不符',role_mismatch:'岗位方向不符',skill_mismatch:'语言技能不符',position_filled:'岗位名额已满',other:'其他',unspecified:'未填写'};
  function recordedTime(value){
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value))return null;
    const time=Date.parse(value);
    return Number.isFinite(time)&&new Date(time).toISOString().slice(0,19)===value.slice(0,19)?time:null;
  }
  function recruitmentFeedback(records,hotelAccountId,days=30,now=Date.now()){
    const result={offers:0,accepted:0,declined:0,rejected:0,reasons:Object.entries(rejectionLabels).map(([code,label])=>({code,label,screening:0,interview:0,total:0}))};
    if(typeof hotelAccountId!=='string'||!hotelAccountId||!Number.isFinite(now)||!Number.isInteger(days)||days<=0)return result;
    const inPeriod=time=>time!==null&&time<=now&&now-time<days*DAY;
    const validPast=time=>time!==null&&time<=now;
    const seen=new Set();
    for(const row of Array.isArray(records)?records:[]){
      if(!row||row.hotelAccountId!==hotelAccountId||typeof row.id!=='string'||!row.id||seen.has(row.id))continue;
      seen.add(row.id);
      const outcome=row.recruitmentResult,decision=row.studentDecision;
      const outcomeTime=recordedTime(outcome?.recordedAt),decisionTime=recordedTime(decision?.recordedAt);
      const hotelOutcome=outcome?.recordedBy===hotelAccountId;
      if(['hired','offer_accepted','offer_declined'].includes(row.stage)&&hotelOutcome&&outcome.decision==='hired'){
        if(inPeriod(outcomeTime))result.offers++;
        // The student response is its own event, even when the hotel decision was in an earlier period.
        if(validPast(outcomeTime)&&decisionTime>=outcomeTime&&inPeriod(decisionTime)&&typeof row.studentId==='string'&&row.studentId&&decision?.recordedBy===row.studentId){
          if(row.stage==='offer_accepted'&&decision.decision==='accepted')result.accepted++;
          if(row.stage==='offer_declined'&&decision.decision==='declined')result.declined++;
        }
      }
      const stage=row.stage==='not_hired'&&hotelOutcome&&outcome.decision==='not_hired'?'interview':row.stage==='declined'&&row.origin==='application'?'screening':null;
      if(!stage)continue;
      let time=null,code='unspecified';
      if(row.rejectionReason!=null){
        const reason=row.rejectionReason;
        if(reason.recordedBy!==hotelAccountId||reason.stage!==stage)continue;
        time=recordedTime(reason.recordedAt);
        if(Object.hasOwn(rejectionLabels,reason.code)&&reason.code!=='unspecified')code=reason.code;
      }else if(stage==='interview')time=outcomeTime;
      else {
        // Legacy application refusals had no reason object. Use only the explicit hotel's refusal event,
        // never a later updatedAt, an administrator action or the student's refusal of an invitation.
        const history=Array.isArray(row.history)?row.history:[];
        const event=[...history].reverse().find(item=>item?.label==='酒店回应暂不合适');
        time=recordedTime(event?.at);
      }
      if(!inPeriod(time))continue;
      const reason=result.reasons.find(item=>item.code===code);reason[stage]++;reason.total++;result.rejected++;
    }
    return result;
  }
  const api={validInvite,addVisit,visibleVisits,addJoin,aggregate,recruitmentFeedback};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.JiulvGrowthCore=api;
})(typeof window!=='undefined'?window:this);
