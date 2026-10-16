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
    {name:"上海艾迪逊酒店",groupId:'marriott',brandId:'edition',brandName:'艾迪逊',first:3000,later:3200,extra:'杂费津贴100元/月；夜班班次津贴，金额待确认',dorm:'6',shuttle:false,commute:'地铁30分钟',officialUrl:"https://www.editionhotels.com/shanghai/",supersedes:['edition']},
    {name:"上海圣淘沙万怡酒店",groupId:'marriott',brandId:'courtyard',brandName:'万怡',first:2800,later:3200,extra:'无',dorm:'4',shuttle:false,commute:'步行2分钟',officialUrl:"https://www.marriott.com/en-us/hotels/shafn-courtyard-shanghai-fengxian/overview/"},
    {name:"上海奉贤JW万豪酒店",groupId:'marriott',brandId:'jw-marriott',brandName:'JW万豪',first:2800,later:3200,extra:'水电煤补贴70元/月',dorm:'3',shuttle:true,commute:'班车15分钟',officialUrl:"https://www.marriott.com.cn/hotels/shajf-jw-marriott-hotel-shanghai-fengxian/overview/",aliases:["奉贤JW万豪酒店"]},
    {name:"上海漕河泾万丽酒店",groupId:'marriott',brandId:'renaissance',brandName:'万丽',first:2800,later:3200,extra:'宿舍生活津贴100元/月',dorm:'4–6',shuttle:false,commute:'步行或骑车10–20分钟',officialUrl:"https://www.marriott.com/en-us/hotels/shaca-renaissance-shanghai-caohejing-hotel/overview/"},
    {name:"上海宝山德尔塔酒店",groupId:'marriott',brandId:'delta',brandName:'德尔塔',first:2800,later:2800,extra:'水电补贴200元/月',dorm:'4–6',shuttle:false,commute:'公交30分钟',officialUrl:"https://www.marriott.com/en-us/hotels/shabs-delta-hotels-shanghai-baoshan/overview/"},
    {name:"上海杨浦滨江万豪酒店",groupId:'marriott',brandId:'marriott-hotels',brandName:'万豪酒店',first:2740,later:3200,extra:'无',dorm:'4–10',shuttle:false,commute:'约5分钟，交通方式待确认',officialUrl:"https://www.marriott.com/en-gb/hotels/shaym-shanghai-marriott-hotel-yangpu-riverside/overview/"},
    {name:"上海世博桐森酒店",groupId:'hyatt',brandId:'thompson',brandName:'桐森',first:3000,later:3000,extra:'无',dorm:'4',shuttle:true,commute:'地铁35分钟',officialUrl:"https://www.hyatt.com/thompson-hotels/zh-HK/shath-thompson-shanghai-expo"},
    {name:"上海金桥凯悦尚萃酒店",groupId:'hyatt',brandId:'hyatt-centric',brandName:'凯悦尚萃',first:2800,later:3100,extra:'住宿津贴100元/月',dorm:'4',shuttle:false,commute:'单程2.4公里；交通方式和时间待确认',officialUrl:""},
    {name:"上海金茂君悦大酒店",groupId:'hyatt',brandId:'grandhyatt',brandName:'君悦',first:2750,later:null,extra:'150元/月，补贴类别及适用条件待确认',dorm:'4–6',shuttle:false,commute:'15–20分钟，交通方式待确认',officialUrl:"https://www.hyatt.com/grand-hyatt/zh-CN/shagh-grand-hyatt-shanghai",supersedes:['grandhyatt']},
    {name:"上海前滩华尔道夫酒店",groupId:'hilton',brandId:'waldorf',brandName:'华尔道夫',first:3000,later:3200,extra:'无',dorm:'4',shuttle:false,commute:'地铁20分钟',officialUrl:"https://www.hilton.com/en/hotels/shaqtwa-waldorf-astoria-shanghai-qiantan/"},
    {name:"上海外滩华尔道夫酒店",groupId:'hilton',brandId:'waldorf',brandName:'华尔道夫',first:2900,later:3100,extra:'100元/月，补贴类别及适用条件待确认',dorm:'4–6',shuttle:false,commute:'公交30分钟',officialUrl:"https://www.hilton.com/en/hotels/shawawa-waldorf-astoria-shanghai-on-the-bund"},
    {name:"上海虹桥国际机场希尔顿酒店",groupId:'hilton',brandId:'hilton-hotels',brandName:'希尔顿',first:2800,later:3000,extra:'无',dorm:'4',shuttle:true,commute:'班车20–30分钟',officialUrl:"https://www.hilton.com/en/hotels/shaaphi-hilton-shanghai-hongqiao-international-airport/"},
    {name:"上海浦东丽晶酒店",groupId:'ihg',brandId:'regent',brandName:'丽晶',first:2900,later:3600,extra:'生活补贴100元/月；满勤补贴100元/月，须满足满勤条件',dorm:'6',shuttle:false,commute:'地铁45分钟',officialUrl:"https://www.ihg.com/regent/hotels/cn/zh/shanghai/shasd/hoteldetail"},
    {name:"洲至奢选上海静安THE ONE套房酒店",groupId:'ihg',brandId:'vignette',brandName:'洲至奢选',first:3000,later:3000,extra:'无',dorm:'4',shuttle:false,commute:'公交30分钟',officialUrl:"https://www.ihg.com/vignettecollection/hotels/gb/en/shanghai/shaos/hoteldetail"},
    {name:"上海丽笙精选海仑宾馆",groupId:'radisson',brandId:'radisson-collection',brandName:'丽笙精选',first:2900,later:3100,extra:'无',dorm:'4–6',shuttle:false,commute:'宿舍位于酒店内',officialUrl:"https://www.radissonhotels.com/zh-cn/hotels/radisson-collection-hyland-shanghai",aliases:["上海丽笙精选海伦酒店"]},
    {name:"上海虹桥西郊庄园丽笙酒店",groupId:'radisson',brandId:'radisson-blu',brandName:'丽笙',first:3000,later:3000,extra:'无',dorm:'4–6',shuttle:false,commute:'约15分钟，交通方式待确认',officialUrl:"https://www.radissonhotels.com/zh-cn/hotels/radisson-blu-shanghai-hongqiao-forest-manor"},
    {name:"上海璞丽酒店",groupId:'puli',brandId:'puli',brandName:'璞丽',first:2900,later:3400,extra:'无',dorm:'2',shuttle:false,commute:'地铁35分钟',officialUrl:"https://thepuli.com/shanghai/en/"},
    {name:"上海素凯泰酒店",groupId:'sukhothai',brandId:'sukhothai',brandName:'素凯泰',first:3000,later:3200,extra:'夜班或超早班交通补贴单次最多40元；两头班津贴待确认',dorm:'6',shuttle:false,commute:'约40分钟，交通方式待确认',officialUrl:"https://shanghai.sukhothai.com/en/"},
    {name:"上海外滩悦榕庄",groupId:'banyan',brandId:'banyan-tree',brandName:'悦榕庄',first:3000,later:3000,extra:'待确认',dorm:'4',shuttle:false,commute:'15–20分钟，交通方式待确认',officialUrl:"https://www.banyantree.com/china/shanghai-on-the-bund"},
    {name:"上海桃浦雅辰悦居酒店",groupId:'artyzen',brandId:'artyzen-habitat',brandName:'雅辰悦居',first:3500,later:3500,extra:'无',dorm:'4',shuttle:false,commute:'约35分钟，交通方式待确认',officialUrl:"https://www.artyzen.com/sc/hotels/artyzen-habitat-taopu-shanghai/"},
    {name:"上海前滩31雅辰酒店",groupId:'artyzen',brandId:'artyzen',brandName:'雅辰',first:3000,later:3000,extra:'无',dorm:'4',shuttle:false,commute:'地铁30分钟',officialUrl:"https://www.artyzen.com/sc/hotels/artyzen-new-bund-31-shanghai/"},
    {name:"上海宏安瑞士大酒店",groupId:'accor',brandId:'swissotel',brandName:'瑞士酒店',first:3000,later:'3200–4000',extra:'无',dorm:'4–6',shuttle:false,commute:'地铁35分钟',officialUrl:"https://www.swissotel.com/hotels/shanghai/"},
    {name:"Z酒店",groupId:'independent',brandId:'',brandName:'品牌待确认',first:3000,later:3500,extra:'水电补贴100元/月',dorm:'4–6',shuttle:false,commute:'约15分钟，交通方式待确认',identityPending:true,officialUrl:""},
    {name:"上海静安香格里拉",groupId:'shangri-la',brandId:'shangri-la',brandName:'香格里拉',first:2900,later:3300,extra:'水电津贴25元/人/月；交通津贴180元/人/月，适用条件待确认',dorm:'6',shuttle:true,commute:'地铁30分钟',officialUrl:"https://www.shangri-la.com/shanghai/jinganshangrila/"},
    {name:"上海邻家美利亚酒店",groupId:'melia',brandId:'melia',brandName:'美利亚',first:2800,later:3000,extra:'无',dorm:'4',shuttle:false,commute:'步行8分钟',officialUrl:"https://www.melia.com/en/hotels/china/shanghai/melia-shanghai-parkside"},
    {name:"上海浦东机场遨途酒店",groupId:'plaza-premium',brandId:'aerotel',brandName:'遨途',first:3000,later:3200,extra:'300元/月，补贴类别及适用条件待确认',dorm:'4',shuttle:false,commute:'地铁20分钟',officialUrl:"https://www.myaerotel.com/en-uk/find/china-regions/mainland-china/shanghai/aerotel-shanghai"}
  ];

  function phase(label, amount) {
    return {label,amount:Number.isFinite(amount)?amount:null,displayText:Number.isFinite(amount)?`${amount.toLocaleString('zh-CN')} 元/月`:typeof amount==='string'?`${amount.replace(/\d+/g,n=>Number(n).toLocaleString('zh-CN'))} 元/月（适用条件待确认）`:pending};
  }
  function commuteFields(entry) {
    const minutes = entry.commute.match(/(\d+(?:–\d+)?)分钟/);
    const distance = entry.commute.match(/(\d+(?:\.\d+)?)公里/);
    const modes = [];
    if (entry.shuttle) modes.push('酒店班车');
    for (const mode of ['地铁','公交','步行','骑车']) if (entry.commute.includes(mode)) modes.push(mode);
    if (entry.commute.includes('酒店内')) modes.push('酒店内');
    return {commuteMinutes:minutes?`${minutes[1]} 分钟`:pending,commuteMode:`${modes.join(' / ')||(distance?'交通方式待确认':pending)}${distance?`；单程${distance[1]}公里`:''}${entry.shuttle?'':'；酒店班车：无'}`};
  }
  const records = entries.map((entry,index) => {
    const allowancePhases = [phase('前6个月',entry.first),phase('第7个月起',entry.later)];
    const commute = commuteFields(entry);
    const details = {
      educationRequirement:pending,minimumDurationMonths:pending,englishRequirement:pending,heightRequirement:pending,workHours:pending,rotationType:pending,
      stipendFirst6:allowancePhases[0].displayText,stipendFrom7:allowancePhases[1].displayText,
      otherSubsidies:entry.extra,completionBonus:pending,payDay:pending,liabilityInsurance:pending,otherInsurance:pending,
      dormOccupancy:`${entry.dorm} 人`,dormUtilities:pending,dormFacilities:pending,dormCommonFacilities:pending,
      ...commute,mealsPerDay:pending,halalMeals:pending
    };
    return {
      id:`survey-2027-${String(index+1).padStart(2,'0')}`,name:entry.name,english:'',city:'上海',
      groupId:entry.groupId,brandId:entry.brandId,brandName:entry.brandName,officialUrl:entry.officialUrl||'',aliases:entry.aliases||[],
      role:'实习岗位待确认',departments:[],salaryMin:entry.first,salaryMax:entry.first,allowancePhases,
      salaryNote:'前6个月基础津贴；其他补贴另列。',
      duration:pending,startMonth:'',durationMonths:'',education:pending,languages:pending,
      meals:pending,dorm:`${entry.dorm}人/间`,commute:entry.shuttle?(entry.commute.includes('班车')?entry.commute.replace('班车','酒店班车'):`酒店班车 / ${entry.commute}`):`${entry.commute}；酒店班车：无`,rotation:pending,schedule:pending,
      sourceKind:'userProvidedHotelSurvey',resourcePool:true,sourceBatch:'shanghai-2027-first',planYear:2027,
      sourceName:'酒店实习信息',sourceId:`SH-2027-${String(index+1).padStart(2,'0')}`,sourceRow:index+2,
      checkedAt:'2026-10-16',evidenceStatus:pending,recruitmentStatus:'具体招聘待确认',
      registeredHotel:false,isRegisteredHotel:false,isCurrentVacancyConfirmed:false,identityPending:!!entry.identityPending,
      supersedesJobIds:entry.supersedes||[],details,
      conditionGroups:[
        {id:'work',title:'岗位要求',rows:[['学历要求',details.educationRequirement],['最低实习时长',details.minimumDurationMonths],['英语要求',details.englishRequirement],['身高要求',details.heightRequirement],['排班方式',details.workHours],['是否提供轮岗',details.rotationType]]},
        {id:'pay',title:'津贴与保险',rows:[['前6个月基础津贴',details.stipendFirst6],['第7个月起基础津贴',details.stipendFrom7],['其他补贴',details.otherSubsidies],['一次性奖励金',details.completionBonus],['发薪日期',details.payDay],['是否提供雇主责任险',details.liabilityInsurance],['其他补充保险',details.otherInsurance]]},
        {id:'dorm',title:'宿舍与设施',rows:[['每间宿舍人数',details.dormOccupancy],['宿舍水电费',details.dormUtilities],['宿舍内设施',details.dormFacilities],['宿舍公区设施',details.dormCommonFacilities]]},
        {id:'life',title:'通勤与餐食',rows:[['单程通勤时间',details.commuteMinutes],['通勤交通方式',details.commuteMode],['每日供餐次数',details.mealsPerDay],['是否有清真餐',details.halalMeals]]}
      ],
      notes:[]
    };
  });

  function combineJobs(existingJobs) {
    const replaced = new Set(records.flatMap(record=>[record.id,...record.supersedesJobIds]));
    return [...records,...(Array.isArray(existingJobs)?existingJobs:[]).filter(job=>job && !replaced.has(job.id))];
  }
  return {records,combineJobs};
});
