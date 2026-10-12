/* 全国实习目的地目录。来源、层级与核验限制见私有 REGION-SOURCES.md。
 * 静态筛选目录并非行政区划实时服务；没有下钻到市辖区、乡镇。
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JiulvRegions = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  // 每行：省级代码|正式名称|显示简称|类型|城市代码:正式名称:显示简称（可省略）
  // 省直管县级就业目的地保留真实层级；台湾县市使用内部标识，不伪造国家行政区划码。
  const rows = [
    ['11','北京市','北京','municipality','110000:北京市:北京'],
    ['12','天津市','天津','municipality','120000:天津市:天津'],
    ['13','河北省','河北','province','130100:石家庄市 130200:唐山市 130300:秦皇岛市 130400:邯郸市 130500:邢台市 130600:保定市 130700:张家口市 130800:承德市 130900:沧州市 131000:廊坊市 131100:衡水市'],
    ['14','山西省','山西','province','140100:太原市 140200:大同市 140300:阳泉市 140400:长治市 140500:晋城市 140600:朔州市 140700:晋中市 140800:运城市 140900:忻州市 141000:临汾市 141100:吕梁市'],
    ['15','内蒙古自治区','内蒙古','autonomous-region','150100:呼和浩特市 150200:包头市 150300:乌海市 150400:赤峰市 150500:通辽市 150600:鄂尔多斯市 150700:呼伦贝尔市 150800:巴彦淖尔市 150900:乌兰察布市 152200:兴安盟:兴安盟 152500:锡林郭勒盟:锡林郭勒 152900:阿拉善盟:阿拉善'],
    ['21','辽宁省','辽宁','province','210100:沈阳市 210200:大连市 210300:鞍山市 210400:抚顺市 210500:本溪市 210600:丹东市 210700:锦州市 210800:营口市 210900:阜新市 211000:辽阳市 211100:盘锦市 211200:铁岭市 211300:朝阳市 211400:葫芦岛市'],
    ['22','吉林省','吉林','province','220100:长春市 220200:吉林市 220300:四平市 220400:辽源市 220500:通化市 220600:白山市 220700:松原市 220800:白城市 222400:延边朝鲜族自治州:延边'],
    ['23','黑龙江省','黑龙江','province','230100:哈尔滨市 230200:齐齐哈尔市 230300:鸡西市 230400:鹤岗市 230500:双鸭山市 230600:大庆市 230700:伊春市 230800:佳木斯市 230900:七台河市 231000:牡丹江市 231100:黑河市 231200:绥化市 232700:大兴安岭地区:大兴安岭'],
    ['31','上海市','上海','municipality','310000:上海市:上海'],
    ['32','江苏省','江苏','province','320100:南京市 320200:无锡市 320300:徐州市 320400:常州市 320500:苏州市 320600:南通市 320700:连云港市 320800:淮安市 320900:盐城市 321000:扬州市 321100:镇江市 321200:泰州市 321300:宿迁市'],
    ['33','浙江省','浙江','province','330100:杭州市 330200:宁波市 330300:温州市 330400:嘉兴市 330500:湖州市 330600:绍兴市 330700:金华市 330800:衢州市 330900:舟山市 331000:台州市 331100:丽水市'],
    ['34','安徽省','安徽','province','340100:合肥市 340200:芜湖市 340300:蚌埠市 340400:淮南市 340500:马鞍山市 340600:淮北市 340700:铜陵市 340800:安庆市 341000:黄山市 341100:滁州市 341200:阜阳市 341300:宿州市 341500:六安市 341600:亳州市 341700:池州市 341800:宣城市'],
    ['35','福建省','福建','province','350100:福州市 350200:厦门市 350300:莆田市 350400:三明市 350500:泉州市 350600:漳州市 350700:南平市 350800:龙岩市 350900:宁德市'],
    ['36','江西省','江西','province','360100:南昌市 360200:景德镇市 360300:萍乡市 360400:九江市 360500:新余市 360600:鹰潭市 360700:赣州市 360800:吉安市 360900:宜春市 361000:抚州市 361100:上饶市'],
    ['37','山东省','山东','province','370100:济南市 370200:青岛市 370300:淄博市 370400:枣庄市 370500:东营市 370600:烟台市 370700:潍坊市 370800:济宁市 370900:泰安市 371000:威海市 371100:日照市 371300:临沂市 371400:德州市 371500:聊城市 371600:滨州市 371700:菏泽市'],
    ['41','河南省','河南','province','410100:郑州市 410200:开封市 410300:洛阳市 410400:平顶山市 410500:安阳市 410600:鹤壁市 410700:新乡市 410800:焦作市 410900:濮阳市 411000:许昌市 411100:漯河市 411200:三门峡市 411300:南阳市 411400:商丘市 411500:信阳市 411600:周口市 411700:驻马店市 419001:济源市'],
    ['42','湖北省','湖北','province','420100:武汉市 420200:黄石市 420300:十堰市 420500:宜昌市 420600:襄阳市 420700:鄂州市 420800:荆门市 420900:孝感市 421000:荆州市 421100:黄冈市 421200:咸宁市 421300:随州市 422800:恩施土家族苗族自治州:恩施 429004:仙桃市 429005:潜江市 429006:天门市 429021:神农架林区:神农架'],
    ['43','湖南省','湖南','province','430100:长沙市 430200:株洲市 430300:湘潭市 430400:衡阳市 430500:邵阳市 430600:岳阳市 430700:常德市 430800:张家界市 430900:益阳市 431000:郴州市 431100:永州市 431200:怀化市 431300:娄底市 433100:湘西土家族苗族自治州:湘西'],
    ['44','广东省','广东','province','440100:广州市 440200:韶关市 440300:深圳市 440400:珠海市 440500:汕头市 440600:佛山市 440700:江门市 440800:湛江市 440900:茂名市 441200:肇庆市 441300:惠州市 441400:梅州市 441500:汕尾市 441600:河源市 441700:阳江市 441800:清远市 441900:东莞市 442000:中山市 445100:潮州市 445200:揭阳市 445300:云浮市'],
    ['45','广西壮族自治区','广西','autonomous-region','450100:南宁市 450200:柳州市 450300:桂林市 450400:梧州市 450500:北海市 450600:防城港市 450700:钦州市 450800:贵港市 450900:玉林市 451000:百色市 451100:贺州市 451200:河池市 451300:来宾市 451400:崇左市'],
    ['46','海南省','海南','province','460100:海口市 460200:三亚市 460300:三沙市 460400:儋州市 469001:五指山市 469002:琼海市 469005:文昌市 469006:万宁市 469007:东方市 469021:定安县:定安 469022:屯昌县:屯昌 469023:澄迈县:澄迈 469024:临高县:临高 469025:白沙黎族自治县:白沙 469026:昌江黎族自治县:昌江 469027:乐东黎族自治县:乐东 469028:陵水黎族自治县:陵水 469029:保亭黎族苗族自治县:保亭 469030:琼中黎族苗族自治县:琼中'],
    ['50','重庆市','重庆','municipality','500000:重庆市:重庆'],
    ['51','四川省','四川','province','510100:成都市 510300:自贡市 510400:攀枝花市 510500:泸州市 510600:德阳市 510700:绵阳市 510800:广元市 510900:遂宁市 511000:内江市 511100:乐山市 511300:南充市 511400:眉山市 511500:宜宾市 511600:广安市 511700:达州市 511800:雅安市 511900:巴中市 512000:资阳市 513200:阿坝藏族羌族自治州:阿坝 513300:甘孜藏族自治州:甘孜 513400:凉山彝族自治州:凉山'],
    ['52','贵州省','贵州','province','520100:贵阳市 520200:六盘水市 520300:遵义市 520400:安顺市 520500:毕节市 520600:铜仁市 522300:黔西南布依族苗族自治州:黔西南 522600:黔东南苗族侗族自治州:黔东南 522700:黔南布依族苗族自治州:黔南'],
    ['53','云南省','云南','province','530100:昆明市 530300:曲靖市 530400:玉溪市 530500:保山市 530600:昭通市 530700:丽江市 530800:普洱市 530900:临沧市 532300:楚雄彝族自治州:楚雄 532500:红河哈尼族彝族自治州:红河 532600:文山壮族苗族自治州:文山 532800:西双版纳傣族自治州:西双版纳 532900:大理白族自治州:大理 533100:德宏傣族景颇族自治州:德宏 533300:怒江傈僳族自治州:怒江 533400:迪庆藏族自治州:迪庆'],
    ['54','西藏自治区','西藏','autonomous-region','540100:拉萨市 540200:日喀则市 540300:昌都市 540400:林芝市 540500:山南市 540600:那曲市 542500:阿里地区:阿里'],
    ['61','陕西省','陕西','province','610100:西安市 610200:铜川市 610300:宝鸡市 610400:咸阳市 610500:渭南市 610600:延安市 610700:汉中市 610800:榆林市 610900:安康市 611000:商洛市'],
    ['62','甘肃省','甘肃','province','620100:兰州市 620200:嘉峪关市 620300:金昌市 620400:白银市 620500:天水市 620600:武威市 620700:张掖市 620800:平凉市 620900:酒泉市 621000:庆阳市 621100:定西市 621200:陇南市 622900:临夏回族自治州:临夏 623000:甘南藏族自治州:甘南'],
    ['63','青海省','青海','province','630100:西宁市 630200:海东市 632200:海北藏族自治州:海北州 632300:黄南藏族自治州:黄南州 632500:海南藏族自治州:海南州 632600:果洛藏族自治州:果洛 632700:玉树藏族自治州:玉树 632800:海西蒙古族藏族自治州:海西州'],
    ['64','宁夏回族自治区','宁夏','autonomous-region','640100:银川市 640200:石嘴山市 640300:吴忠市 640400:固原市 640500:中卫市'],
    ['65','新疆维吾尔自治区','新疆','autonomous-region','650100:乌鲁木齐市 650200:克拉玛依市 650400:吐鲁番市 650500:哈密市 652300:昌吉回族自治州:昌吉 652700:博尔塔拉蒙古自治州:博尔塔拉 652800:巴音郭楞蒙古自治州:巴音郭楞 652900:阿克苏地区:阿克苏 653000:克孜勒苏柯尔克孜自治州:克孜勒苏 653100:喀什地区:喀什 653200:和田地区:和田 654000:伊犁哈萨克自治州:伊犁 654200:塔城地区:塔城 654300:阿勒泰地区:阿勒泰 659001:石河子市 659002:阿拉尔市 659003:图木舒克市 659004:五家渠市 659005:北屯市 659006:铁门关市 659007:双河市 659008:可克达拉市 659009:昆玉市 659010:胡杨河市 659011:新星市 659012:白杨市 65-caohu:草湖市'],
    ['71','台湾省','台湾','taiwan','tw-taipei:台北市 tw-new-taipei:新北市 tw-taoyuan:桃园市 tw-taichung:台中市 tw-tainan:台南市 tw-kaohsiung:高雄市 tw-keelung:基隆市 tw-hsinchu-city:新竹市:新竹市 tw-chiayi-city:嘉义市:嘉义市 tw-yilan:宜兰县:宜兰县 tw-hsinchu-county:新竹县:新竹县 tw-miaoli:苗栗县:苗栗县 tw-changhua:彰化县:彰化县 tw-nantou:南投县:南投县 tw-yunlin:云林县:云林县 tw-chiayi-county:嘉义县:嘉义县 tw-pingtung:屏东县:屏东县 tw-taitung:台东县:台东县 tw-hualien:花莲县:花莲县 tw-penghu:澎湖县:澎湖县 tw-kinmen:金门县:金门县 tw-lienchiang:连江县:连江县'],
    ['81','香港特别行政区','香港','special-administrative-region','810000:香港特别行政区:香港'],
    ['82','澳门特别行政区','澳门','special-administrative-region','820000:澳门特别行政区:澳门']
  ];

  const extraAliases = {
    '110000':['北京城'], '310000':['上海市区'],
    '152200':['兴安'], '152500':['锡盟'], '152900':['阿盟'],
    '222400':['延边州'], '422800':['恩施州'], '433100':['湘西州'],
    '513200':['阿坝州'], '513300':['甘孜州'], '513400':['凉山州'],
    '522300':['黔西南州'], '522600':['黔东南州'], '522700':['黔南州'],
    '532300':['楚雄州'], '532500':['红河州'], '532600':['文山州'],
    '532800':['西双版纳州','版纳'], '532900':['大理州'], '533100':['德宏州'],
    '533300':['怒江州'], '533400':['迪庆州'], '622900':['临夏州'], '623000':['甘南州'],
    '632200':['海北'], '632300':['黄南'], '632600':['果洛州'], '632700':['玉树州'], '632800':['海西'],
    '652300':['昌吉州'], '652700':['博州'], '652800':['巴州'], '653000':['克州'], '654000':['伊犁州'],
    '810000':['香港特区','Hong Kong'], '820000':['澳门特区','Macao','Macau'],
    'tw-taipei':['臺北','臺北市'], 'tw-taichung':['臺中','臺中市'], 'tw-tainan':['臺南','臺南市'],
    'tw-taoyuan':['桃園','桃園市'], 'tw-kaohsiung':['高雄市'],
    'tw-chiayi-city':['嘉義市'], 'tw-chiayi-county':['嘉義縣'], 'tw-yilan':['宜蘭縣'],
    'tw-hsinchu-county':['新竹縣'], 'tw-miaoli':['苗栗縣'], 'tw-changhua':['彰化縣'],
    'tw-nantou':['南投縣'], 'tw-yunlin':['雲林縣'], 'tw-pingtung':['屏東縣'],
    'tw-taitung':['臺東縣','台東縣'], 'tw-hualien':['花蓮縣'], 'tw-penghu':['澎湖縣'],
    'tw-kinmen':['金門縣'], 'tw-lienchiang':['連江縣']
  };
  const directCountyIds = new Set(['419001','429004','429005','429006','429021']);
  function cityLevel(id, name, regionType) {
    if (regionType === 'municipality') return 'municipality';
    if (regionType === 'special-administrative-region') return 'special-administrative-region';
    if (regionType === 'taiwan') {
      if (['tw-taipei','tw-new-taipei','tw-taoyuan','tw-taichung','tw-tainan','tw-kaohsiung'].includes(id)) return 'taiwan-municipality';
      return name.endsWith('县') ? 'taiwan-county' : 'taiwan-city';
    }
    if (directCountyIds.has(id) || id.startsWith('469') || id.startsWith('659') || id === '65-caohu') {
      return name.endsWith('市') ? 'direct-county-city' : 'direct-county';
    }
    if (name.endsWith('自治州')) return 'autonomous-prefecture';
    if (name.endsWith('地区')) return 'prefecture';
    if (name.endsWith('盟')) return 'league';
    return 'prefecture-city';
  }
  const regions = Object.freeze(rows.map(([id, name, label, type, text]) => Object.freeze({
    id, name, label, type,
    cities: Object.freeze(text.split(' ').map(entry => {
      const [cityId, cityName, shortName] = entry.split(':');
      return Object.freeze({ id:cityId, name:cityName, label:shortName || cityName.replace(/市$/, ''),
        regionId:id, level:cityLevel(cityId, cityName, type),
        aliases:Object.freeze(extraAliases[cityId] || []),
        code:/^\d{6}$/.test(cityId) ? cityId : null
      });
    }))
  })));
  const cities = Object.freeze(regions.flatMap(region => region.cities));
  const key = value => String(value == null ? '' : value).trim().toLowerCase();
  const cityIndex = new Map();
  for (const city of cities) {
    for (const value of [city.id, city.name, city.label, ...city.aliases]) cityIndex.set(key(value), city);
  }
  const regionIndex = new Map();
  for (const region of regions) {
    for (const value of [region.id, region.id + '0000', region.name, region.label]) regionIndex.set(key(value), region);
  }
  function findCity(value) { return cityIndex.get(key(value)) || null; }
  function findRegion(value) {
    const direct = regionIndex.get(key(value));
    if (direct) return direct;
    const city = findCity(value);
    return city ? regionIndex.get(city.regionId) : null;
  }
  function normalizeCity(value) {
    const city = findCity(value);
    // 未知名称只做空白/大小写归一，不把嘉义县误归并到嘉义市。
    return city ? city.label : String(value == null ? '' : value).trim();
  }
  // Presentation only: retain stored historical addresses, but show the same
  // province/city hierarchy on every public city label, without district names.
  function formatCity(value) {
    const raw = String(value == null ? '' : value).trim();
    const parts = raw.split(/[·,，/\s]+/).filter(Boolean);
    const regionHint = parts.length > 1 ? findRegion(parts[0]) : null;
    const regionalCity = regionHint && parts.slice(1).map(findCity).find(item => item?.regionId === regionHint.id);
    const city = findCity(raw) || regionalCity || parts.map(findCity).find(Boolean);
    if (!city) return parts[0] || '城市待确认';
    const region = findRegion(city.regionId);
    return !region || region.cities.length === 1 && region.cities[0].id === city.id
      ? city.label : `${region.label} · ${city.label}`;
  }
  function matchesCity(actualName, selected) {
    const actual = findCity(actualName), target = findCity(selected);
    if (actual && target) return actual.id === target.id;
    return !!key(actualName) && key(actualName) === key(selected);
  }
  return Object.freeze({ regions, cities, findCity, findRegion, normalizeCity, formatCity, matchesCity,
    reviewedAt:'2026-10-11', baseYear:2024, live:false });
});
