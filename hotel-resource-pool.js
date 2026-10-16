/* First hotel resource pool: user-provided 2027 planning survey, reviewed 2026-10-16.
 * The survey describes planned benefits, not verified accounts or current vacancies.
 * Private source workbooks, contact details and internal recruitment data stay outside this module.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JIULV_HOTEL_RESOURCES = api;
})(typeof window === 'object' ? window : null, function () {
  'use strict';

  const pending = '待确认';
  // Each entry contains only public hotel identity and student-facing survey answers.
  const entries = [
    {name:"上海艾迪逊酒店",groupId:'marriott',brandId:'edition',brandName:'艾迪逊',first:3000,later:3200,extra:'杂费津贴100元/月；夜班班次津贴，金额待确认',sick:'每两个月1天',dorm:'6',shuttle:false,commute:'地铁30分钟',plan:'55',officialUrl:"https://www.editionhotels.com/shanghai/",supersedes:['edition']},
    {name:"上海圣淘沙万怡酒店",groupId:'marriott',brandId:'courtyard',brandName:'万怡',first:2800,later:3200,extra:'未另设额外津贴',sick:'未提供带薪病假',dorm:'4',shuttle:false,commute:'步行2分钟',plan:'20',officialUrl:"https://www.marriott.com/en-us/hotels/shafn-courtyard-shanghai-fengxian/overview/"},
    {name:"上海奉贤JW万豪酒店",groupId:'marriott',brandId:'jw-marriott',brandName:'JW万豪',first:2800,later:3200,extra:'水电煤补贴70元/月',sick:'未提供带薪病假',dorm:'3',shuttle:true,commute:'班车15分钟',plan:'40+',officialUrl:"https://www.marriott.com.cn/hotels/shajf-jw-marriott-hotel-shanghai-fengxian/overview/",aliases:["奉贤JW万豪酒店"]},
    {name:"上海漕河泾万丽酒店",groupId:'marriott',brandId:'renaissance',brandName:'万丽',first:2800,later:3200,extra:'宿舍生活津贴100元/月',sick:'未提供带薪病假',dorm:'4–6',shuttle:false,commute:'步行或骑车10–20分钟',plan:'45',officialUrl:"https://www.marriott.com/en-us/hotels/shaca-renaissance-shanghai-caohejing-hotel/overview/"},
    {name:"上海宝山德尔塔酒店",groupId:'marriott',brandId:'delta',brandName:'德尔塔',first:2800,later:2800,extra:'水电补贴200元/月',sick:'未提供带薪病假',dorm:'4–6',shuttle:false,commute:'公交30分钟',plan:'60',officialUrl:"https://www.marriott.com/en-us/hotels/shabs-delta-hotels-shanghai-baoshan/overview/"},
    {name:"上海杨浦滨江万豪酒店",groupId:'marriott',brandId:'marriott-hotels',brandName:'万豪酒店',first:2740,later:3200,extra:'未另设额外津贴',sick:'未提供带薪病假',dorm:'4–10',shuttle:false,commute:'约5分钟，交通方式待确认',plan:'40',officialUrl:"https://www.marriott.com/en-gb/hotels/shaym-shanghai-marriott-hotel-yangpu-riverside/overview/"},
    {name:"上海世博桐森酒店",groupId:'hyatt',brandId:'thompson',brandName:'桐森',first:3000,later:3000,extra:'未另设额外津贴',sick:'未提供带薪病假',dorm:'4',shuttle:true,commute:'地铁35分钟',plan:'30',officialUrl:"https://www.hyatt.com/thompson-hotels/zh-HK/shath-thompson-shanghai-expo",notes:['调查同时填报有班车和地铁通勤，班车线路、时刻及使用范围待确认。']},
    {name:"上海金桥凯悦尚萃酒店",groupId:'hyatt',brandId:'hyatt-centric',brandName:'凯悦尚萃',first:2800,later:3100,extra:'住宿津贴100元/月',sick:'未提供带薪病假',dorm:'4',shuttle:false,commute:'单程2.4公里；交通方式和时间待确认',plan:'30',officialUrl:"",notes:["集团官方开发目录列为Pre-opening，未列出单体官网；当前营业及招聘安排待酒店确认。"]},
    {name:"上海金茂君悦大酒店",groupId:'hyatt',brandId:'grandhyatt',brandName:'君悦',first:2750,later:null,extra:'150元/月，补贴类别及适用条件待确认',sick:'未提供带薪病假',dorm:'4–6',shuttle:false,commute:'15–20分钟，交通方式待确认',plan:'70',officialUrl:"https://www.hyatt.com/grand-hyatt/zh-CN/shagh-grand-hyatt-shanghai",supersedes:['grandhyatt'],notes:['第7个月起津贴未填明确金额，不推定保持不变或上涨。']},
    {name:"上海前滩华尔道夫酒店",groupId:'hilton',brandId:'waldorf',brandName:'华尔道夫',first:3000,later:3200,extra:'未另设额外津贴',sick:'每两个月1天',dorm:'4',shuttle:false,commute:'地铁20分钟',plan:'10',officialUrl:"https://www.hilton.com/en/hotels/shaqtwa-waldorf-astoria-shanghai-qiantan/"},
    {name:"上海外滩华尔道夫酒店",groupId:'hilton',brandId:'waldorf',brandName:'华尔道夫',first:2900,later:3100,extra:'100元/月，补贴类别及适用条件待确认',sick:'带薪病假安排待核实',dorm:'4–6',shuttle:false,commute:'公交30分钟',plan:'35',notes:['带薪病假填报文字有歧义，确认前不作具体天数承诺。'],officialUrl:"https://www.hilton.com/en/hotels/shawawa-waldorf-astoria-shanghai-on-the-bund"},
    {name:"上海虹桥国际机场希尔顿酒店",groupId:'hilton',brandId:'hilton-hotels',brandName:'希尔顿',first:2800,later:3000,extra:'未另设额外津贴',sick:'未提供带薪病假',dorm:'4',shuttle:true,commute:'班车20–30分钟',plan:'15',officialUrl:"https://www.hilton.com/en/hotels/shaaphi-hilton-shanghai-hongqiao-international-airport/"},
    {name:"上海浦东丽晶酒店",groupId:'ihg',brandId:'regent',brandName:'丽晶',first:2900,later:3600,extra:'生活补贴100元/月；满勤补贴100元/月，须满足满勤条件',sick:'未提供带薪病假',dorm:'6',shuttle:false,commute:'地铁45分钟',plan:'30',officialUrl:"https://www.ihg.com/regent/hotels/cn/zh/shanghai/shasd/hoteldetail"},
    {name:"洲至奢选上海静安THE ONE套房酒店",groupId:'ihg',brandId:'vignette',brandName:'洲至奢选',first:3000,later:3000,extra:'未另设额外津贴',sick:'每两个月1天',dorm:'4',shuttle:false,commute:'公交30分钟',plan:'2–3',officialUrl:"https://www.ihg.com/vignettecollection/hotels/gb/en/shanghai/shaos/hoteldetail"},
    {name:"上海丽笙精选海仑宾馆",groupId:'radisson',brandId:'radisson-collection',brandName:'丽笙精选',first:2900,later:3100,extra:'未另设额外津贴',sick:'未提供带薪病假',dorm:'4–6',shuttle:false,commute:'宿舍位于酒店内',plan:'14',officialUrl:"https://www.radissonhotels.com/zh-cn/hotels/radisson-collection-hyland-shanghai",aliases:["上海丽笙精选海伦酒店"]},
    {name:"上海虹桥西郊庄园丽笙酒店",groupId:'radisson',brandId:'radisson-blu',brandName:'丽笙',first:3000,later:3000,extra:'未另设额外津贴',sick:'未提供带薪病假',dorm:'4–6',shuttle:false,commute:'约15分钟，交通方式待确认',plan:'15',officialUrl:"https://www.radissonhotels.com/zh-cn/hotels/radisson-blu-shanghai-hongqiao-forest-manor"},
    {name:"上海璞丽酒店",groupId:'puli',brandId:'puli',brandName:'璞丽',first:2900,later:3400,extra:'未另设额外津贴',sick:'未提供带薪病假',dorm:'2',shuttle:false,commute:'地铁35分钟',plan:'28',officialUrl:"https://thepuli.com/shanghai/en/"},
    {name:"上海素凯泰酒店",groupId:'sukhothai',brandId:'sukhothai',brandName:'素凯泰',first:3000,later:3200,extra:'夜班或超早班交通补贴单次最多40元；两头班津贴20，单位及计算方式待确认',sick:'未提供带薪病假',dorm:'6',shuttle:false,commute:'约40分钟，交通方式待确认',plan:'25',notes:['特殊班次补贴按条件发放，不计入无条件固定月津贴。'],officialUrl:"https://shanghai.sukhothai.com/en/"},
    {name:"上海外滩悦榕庄",groupId:'banyan',brandId:'banyan-tree',brandName:'悦榕庄',first:3000,later:3000,extra:'能源补贴，金额待核实',sick:'每月1天',dorm:'4',shuttle:false,commute:'15–20分钟，交通方式待确认',plan:'30',notes:['能源补贴原始金额存在疑似笔误，复核前不展示确定金额。'],officialUrl:"https://www.banyantree.com/china/shanghai-on-the-bund"},
    {name:"上海桃浦雅辰悦居酒店",groupId:'artyzen',brandId:'artyzen-habitat',brandName:'雅辰悦居',first:3500,later:3500,extra:'未另设额外津贴',sick:'未提供带薪病假',dorm:'4',shuttle:false,commute:'约35分钟，交通方式待确认',plan:'5',officialUrl:"https://www.artyzen.com/sc/hotels/artyzen-habitat-taopu-shanghai/"},
    {name:"上海前滩31雅辰酒店",groupId:'artyzen',brandId:'artyzen',brandName:'雅辰',first:3000,later:3000,extra:'未另设额外津贴',sick:'未提供带薪病假',dorm:'4',shuttle:false,commute:'地铁30分钟',plan:'6',officialUrl:"https://www.artyzen.com/sc/hotels/artyzen-new-bund-31-shanghai/"},
    {name:"上海宏安瑞士大酒店",groupId:'accor',brandId:'swissotel',brandName:'瑞士酒店',first:3000,later:'3200–4000',extra:'未另设额外津贴',sick:'未提供带薪病假',dorm:'4–6',shuttle:false,commute:'地铁35分钟',plan:'50',notes:['第7个月起津贴为3,200–4,000元/月区间，分档条件待确认，不按最高金额承诺。'],officialUrl:"https://www.swissotel.com/hotels/shanghai/"},
    {name:"Z酒店",groupId:'independent',brandId:'',brandName:'品牌待确认',first:3000,later:3500,extra:'水电补贴100元/月',sick:'每月1天',dorm:'4–6',shuttle:false,commute:'约15分钟，交通方式待确认',plan:'15',identityPending:true,notes:['调查名称为“Z酒店”，具体酒店身份与官网仍待核实，暂不关联同名酒店。'],officialUrl:""},
    {name:"上海静安香格里拉",groupId:'shangri-la',brandId:'shangri-la',brandName:'香格里拉',first:2900,later:3300,extra:'水电津贴25元/人/月；交通津贴180元/人/月，适用条件待确认',sick:'未提供带薪病假',dorm:'6',shuttle:true,commute:'地铁30分钟',plan:'100',notes:['调查同时填报有班车和地铁通勤，班车线路、时刻及使用范围待确认。'],officialUrl:"https://www.shangri-la.com/shanghai/jinganshangrila/"},
    {name:"上海邻家美利亚酒店",groupId:'melia',brandId:'melia',brandName:'美利亚',first:2800,later:3000,extra:'未另设额外津贴',sick:'未提供带薪病假',dorm:'4',shuttle:false,commute:'步行8分钟',plan:'12',officialUrl:"https://www.melia.com/en/hotels/china/shanghai/melia-shanghai-parkside"},
    {name:"上海浦东机场遨途酒店",groupId:'plaza-premium',brandId:'aerotel',brandName:'遨途',first:3000,later:3200,extra:'300元/月，补贴类别及适用条件待确认',sick:'未提供带薪病假',dorm:'4',shuttle:false,commute:'地铁20分钟',plan:'6',officialUrl:"https://www.myaerotel.com/en-uk/find/china-regions/mainland-china/shanghai/aerotel-shanghai"}
  ];

  function phase(label, amount) {
    return {label,amount:Number.isFinite(amount)?amount:null,displayText:Number.isFinite(amount)?`${amount.toLocaleString('zh-CN')} 元/月`:typeof amount==='string'?`${amount.replace(/\d+/g,n=>Number(n).toLocaleString('zh-CN'))} 元/月（适用条件待确认）`:pending};
  }
  const records = entries.map((entry,index) => {
    const allowancePhases = [phase('前6个月',entry.first),phase('第7个月起',entry.later)];
    const details = {
      stipendFirst6:allowancePhases[0].displayText,stipendFrom7:allowancePhases[1].displayText,
      extraAllowance:entry.extra,paidSickLeave:entry.sick,dormPeople:`${entry.dorm}人/间`,
      shuttle:entry.shuttle?'提供班车，具体安排待确认':'调查填报不提供班车',commute:entry.commute,
      plannedHires2027:`${entry.plan}人（2027年计划，不代表当前名额）`
    };
    return {
      id:`survey-2027-${String(index+1).padStart(2,'0')}`,name:entry.name,english:'',city:'上海',
      groupId:entry.groupId,brandId:entry.brandId,brandName:entry.brandName,officialUrl:entry.officialUrl||'',aliases:entry.aliases||[],
      role:'2027年实习计划 · 岗位待确认',departments:[],salaryMin:entry.first,salaryMax:entry.first,allowancePhases,
      salaryNote:'2027年计划津贴；前后阶段分别展示，额外津贴另列。',
      duration:pending,startMonth:'',durationMonths:'',education:pending,languages:pending,
      meals:pending,dorm:details.dormPeople,commute:entry.commute,rotation:pending,schedule:pending,
      sourceKind:'userProvidedHotelSurvey',resourcePool:true,sourceBatch:'shanghai-2027-first',planYear:2027,
      sourceName:'酒店薪资福利调查 · 用户提供',sourceId:`SH-2027-${String(index+1).padStart(2,'0')}`,sourceRow:index+2,
      checkedAt:'2026-10-16',evidenceStatus:'2027年调研计划',recruitmentStatus:'具体招聘待确认',
      registeredHotel:false,isRegisteredHotel:false,isCurrentVacancyConfirmed:false,identityPending:!!entry.identityPending,
      plannedHires2027Text:entry.plan,supersedesJobIds:entry.supersedes||[],details,
      conditionGroups:[
        {id:'work',title:'岗位与实习安排',rows:[['招聘部门与岗位',pending],['2027年计划人数',details.plannedHires2027],['实习开始时间与时长',pending],['学历与专业要求',pending],['英语要求',pending],['排班方式',pending],['轮岗安排',pending]]},
        {id:'pay',title:'津贴与福利',rows:[['前6个月基础津贴',details.stipendFirst6],['第7个月起基础津贴',details.stipendFrom7],['其他补贴',details.extraAllowance],['带薪病假',details.paidSickLeave],['发薪日期',pending],['雇主责任险与其他保险',pending]]},
        {id:'dorm',title:'宿舍与设施',rows:[['每间住宿人数',details.dormPeople],['住宿与水电费用',pending],['宿舍内与公区设施',pending]]},
        {id:'life',title:'通勤与餐食',rows:[['单程通勤',details.commute],['酒店班车',details.shuttle],['每日供餐次数',pending],['是否有清真餐',pending]]}
      ],
      notes:[
        '资料来自2027年薪资福利与招聘计划调查，尚未逐店确认为公开招聘承诺；不表示酒店已入驻。',
        '招聘部门、到岗时间、实习时长及当前名额待酒店确认，年度计划人数不等于现有空缺。',
        '额外补贴的适用条件、宿舍实际安排与通勤时段，请在决定前确认。',
        ...(entry.notes||[])
      ]
    };
  });

  function combineJobs(existingJobs) {
    const replaced = new Set(records.flatMap(record=>[record.id,...record.supersedesJobIds]));
    return [...records,...(Array.isArray(existingJobs)?existingJobs:[]).filter(job=>job && !replaced.has(job.id))];
  }
  return {records,combineJobs};
});
