/* 酒旅之星：百科可公开阅读；准备进度与收藏按学生账号分别保存在当前浏览器。 */
(() => {
  'use strict';

  const CHECKED_AT = '2026-09-28';
  const policySources = [
    { title: '教育部：职业学校学生实习管理规定（2021年修订）通知', url: 'https://www.moe.gov.cn/srcsite/A07/moe_737/s3876_qt/202201/t20220121_595529.html', date: '生成日期 2022-01-17', scope: '职业学校学生实习；请结合完整规定及本人实习类型核对。' },
    { title: '郑州市政府公开的规定全文（第三十四至三十六条）', url: 'https://public.zhengzhou.gov.cn/D480205X/6428172.jhtml', date: '文件署期 2021-12-31', scope: '政府公开原文，可核对保险条款及适用范围。' },
    { title: '上海市教委：落实职业学校学生实习管理规定的通知', url: 'https://edu.sh.gov.cn/zyjy_zjxx/20221014/05d4e56306704177accb8c4d673e0495.html', date: '页面发布 2022-10-12', scope: '上海职业学校实习管理的落实要求，不是个人保单。' }
  ];
  const articles = [
    {
      id: 'insurance', category: '安全与手续', minutes: 5,
      title: '“有保险”之后，还要问哪几句？',
      summary: '确认险种、保单和保障期间，再把通勤、宿舍与报案流程问清楚。',
      label: '出发前推荐',
      intro: '酒店说“实习生有保险”，这句话还不能回答谁投保、什么情形承保、何时生效。到岗前，向学校老师和酒店 HR 确认保单或参保凭证，并留好联系人。',
      sections: [
        { title: '先确认你的实习类型', text: '高职、普通本科、学校统一安排与自主联系实习的管理要求可能不同。请学校确认本人适用的实习制度；不能仅凭“在校生”或“实习协议”几个字，判断是否形成劳动关系、是否能够适用工伤保险。' },
        { title: '有政策要求，也要看具体凭证', text: '《职业学校学生实习管理规定》（2021年修订）第三十五条规定，职业学校和实习单位应依法为实习学生投保实习责任保险；相关保险费不得向学生另收或从实习报酬中抵扣。第三十六条明确，属于保险赔付范围的，按保险合同标准赔付。这里的适用对象是职业学校学生实习，不能直接扩展到所有学生和全部实习情形。' },
        { title: '拿真实酒店场景核对条款', text: '把“餐厅工作时滑倒”“下班回宿舍途中发生意外”“休息日在宿舍受伤”分别提问，让投保方或承保机构按条款解释。若酒店称提供雇主责任险，请其确认本岗位实习生是否列入保障范围，并提供相应凭证和条款；仅有险种名称不足以确认个人保障。实习责任保险、意外伤害保险、医疗保险、工伤保险不是同一个名称；本页不替任何保单判断必赔、全赔或免赔。' },
        { title: '把遇事流程记在手机里', text: '保存酒店值班负责人、学校指导老师与保单报案渠道。发生意外时先保障安全、及时寻求专业救助，尽快通知相关负责人，并依承保机构要求留存就医记录、票据和事故材料；不要为拍照或等待保险确认延误救助。' }
      ],
      example: '可以这样问：“我是××学校的酒店管理实习生，计划10月1日到岗。请提供我适用的险种、承保机构、保障起止日和查询方式；通勤、宿舍及夜班相关情形如何按条款处理？发生事故先联系谁？”',
      checks: ['学校已确认本人的实习类型及适用制度', '已取得险种、承保机构、保障期间和个人覆盖确认', '已询问通勤、宿舍、岗位风险与除外责任', '已保存酒店、学校及保险报案联系人'],
      sources: policySources
    },
    {
      id: 'pay', category: '津贴与生活', minutes: 4,
      title: '津贴 3,000 元，到手怎么算？',
      summary: '分清基础津贴、出勤口径、发薪日与每一项可能的费用。',
      intro: '比较岗位时，把“月津贴”拆成可核对的明细。招聘页上的范围往往还没有说明首月、请假、住宿和结算的具体口径。',
      sections: [
        { title: '先问计算口径', text: '确认数字是固定月额还是按实际出勤计发，是否包含餐补、交通补贴等项目。若月中到岗，请 HR 用你的预计到岗日期演算一次首月金额，不要自行把月额统一除以30天。' },
        { title: '把发放与费用分开列', text: '记录发薪日、发放主体、工资或津贴明细的获取方式。对宿舍水电、工作服、体检等逐项询问是否收费、依据、金额、收款方及退款安排；出现“先交押金再入职”等要求，先交学校核查。询问不代表认可收费。' },
        { title: '最后一笔也提前问', text: '确认实习结束、提前结束或有待核对考勤时，余款如何结算、由谁解释差额。每月保存自己的班次、出勤记录、明细及到账记录，发现差异先逐项对照。' }
      ],
      example: '计算示例（仅示意）：基础津贴3,000＋书面确认的补贴200＝预计发放3,200元。食宿费用如有，应另列并向学校核查。该示例不代表任何酒店待遇或费用合法性判断。',
      checks: ['已确认基础津贴、补贴与出勤计算方法', '已确认发薪日、发放主体及明细获取方式', '已逐项询问费用并交学校核查不清楚的项目', '已确认首月、末月和提前结束的结算流程']
    },
    {
      id: 'dorm', category: '津贴与生活', minutes: 3,
      title: '“提供住宿”要问到房间这一层',
      summary: '人数、地址、水电、入住时间与退宿条件，放在一起比较。',
      intro: '宿舍条件会影响睡眠、通勤和日常开支。不要只记录“包住”两个字，尽量取得近期照片、地址和明确的费用说明。',
      sections: [
        { title: '从床位问到可入住日期', text: '确认几人一间、男女住宿安排、卫浴与洗衣设施、空调使用、储物空间和基本安全管理。询问是否需要排队、提前几天可入住，以及未分配床位时的安排。' },
        { title: '把“免费”问具体', text: '床位费、水电、网络、被褥是否分别计费，有无上限和结算周期。若有任何押金或扣款要求，要求书面说明并与学校核查，不因口头承诺就先付款。' },
        { title: '夜班同住与退宿也影响体验', text: '轮班室友如何协调安静时段、访客及门禁如何安排，夜间到宿舍能否正常进入。提前问清实习结束后的退宿日期、物品交接及异议联系渠道。' }
      ],
      example: '可向 HR 请求：“方便提供目前实习生宿舍的近期照片和地址吗？我想同时确认每间人数、水电口径和预计入住日期。”注意不要索取其他住户的个人信息。',
      checks: ['已确认宿舍地址、人数和基本设施', '已确认入住日期及没有床位时的安排', '已确认全部费用、门禁及夜班住宿安排', '已确认退宿时间、物品交接和问题联系人']
    },
    {
      id: 'commute', category: '津贴与生活', minutes: 3,
      title: '酒店离地铁近，不等于下班能坐到',
      summary: '按实际班次测算，从员工入口到宿舍门口的整段通勤。',
      intro: '酒店24小时运营不意味着每个实习岗位都安排夜班。先向学校和酒店确认允许的班次，再比较这些班次对应的出行方案。',
      sections: [
        { title: '用实际出发点测算', text: '地图起点选员工入口或宿舍入口，考虑更衣、交接、等车与步行时间。分别测算早班到岗、晚班离岗，不只记录酒店到地铁站的距离。' },
        { title: '班车也需要时刻表', text: '确认班车停靠点、运行日、末班时间、预约方式和座位安排。遇到宴会收尾或交接延后，询问错过末班车后的处理方式及负责人。' },
        { title: '晚归安排先交学校核对', text: '把班次写成具体起止时间，请指导老师核对本人实习要求。若涉及夜间出行，确认是否有接驳、陪同或交通费用安排及适用条件，不把“可以报销”理解为任意打车均可报销。' }
      ],
      example: '示例：23:00结束交接，步行15分钟至车站，实际23:15到站。应查询该线路、该方向、当天可用的交通方案；本示例不是任何地铁线路的末班时间。',
      checks: ['已向学校确认具体班次是否适合本人实习', '已按员工入口和宿舍测算早晚通勤', '已取得班车时刻、停靠点及运行日说明', '已确认延后下班或错过末班车的处理方式']
    },
    {
      id: 'meals', category: '津贴与生活', minutes: 2,
      title: '员工餐：每天几餐，什么时候能吃？',
      summary: '问清供餐时段、休息日、夜班与个人饮食需求。',
      intro: '“包吃”可能指工作日员工餐，也可能包含住宿期间用餐。询问时把工作日、休息日、培训日分开，避免到岗后才发现空档。',
      sections: [
        { title: '供餐时间能否覆盖班次', text: '确认每餐开放时段、领餐方式、是否需预订；前厅交接或宴会高峰错过用餐时如何安排。若经学校确认有晚班，继续问是否提供相应餐食。' },
        { title: '问清次数和费用', text: '确认每日可用餐次数、休息日是否开放、补卡或额外用餐如何处理。如岗位标注餐补，问金额、发放条件与是否另有员工餐。' },
        { title: '个人需求提前沟通', text: '有过敏、宗教或其他饮食需求时，可询问能否了解菜品成分及是否提供可选餐食。不要假设员工餐厅一定能满足所有要求；涉及个人健康判断请咨询专业人员。' }
      ],
      example: '“我预计住员工宿舍，休息日也会在附近。请问休息日可以使用员工餐厅吗？如果工作交接错过开餐时段，能否提前留餐？”',
      checks: ['已确认供餐时段与每日次数', '已确认休息日和培训日用餐规则', '已确认错过餐点及晚班用餐安排', '已沟通个人饮食需求与相关费用']
    },
    {
      id: 'rotation', category: '岗位与成长', minutes: 4,
      title: '多个部门招聘，和轮岗是两回事',
      summary: '把首岗、带教、学习目标与轮岗条件变成可确认的安排。',
      intro: '“前厅、餐饮、客房都招实习生”通常只说明存在不同岗位。自己入职哪一岗、是否能换部门，需要进一步确认。',
      sections: [
        { title: '让工作内容具体到一天', text: '前厅可能涉及礼宾、总机、行政酒廊；餐饮也可能是宴会、中餐或全日餐厅。请面试官举例说明实习生典型的一天，并问清系统操作、对客服务与辅助工作的比例。' },
        { title: '找到带教人和学习目标', text: '询问由哪个岗位负责带教、前两周培训内容、何时能独立操作及如何复盘。可以提出每月一次简短反馈，并与学校的实习任务相对照。' },
        { title: '把轮岗条件写明', text: '确认是固定轮岗、可申请换岗还是根据空缺调整。逐项问部门、时长、评估条件及申请流程；若没有确定计划，就在岗位对比中记为“轮岗待确认”。' }
      ],
      example: '示例学习目标：“第1月能说明入住流程，第2月在带教下完成常见客情沟通，第3月做一次服务案例复盘。”这些是沟通示例，不是酒店承诺。',
      checks: ['已确认首个部门、岗位及主要工作', '已确认带教安排和入岗培训', '已讨论阶段学习目标及反馈方式', '已区分固定轮岗、申请轮岗与未安排轮岗']
    },
    {
      id: 'schedule', category: '岗位与成长', minutes: 4,
      title: '月休几天之外，还要看排班怎么落地',
      summary: '把班次、休息、交接、临时调班与考勤记录逐项问清。',
      intro: '招聘页写“月休8天”，仍不足以判断自己的学习和生活节奏。拿一个不包含个人信息的排班示例，与学校指导老师一起核对。',
      sections: [
        { title: '问起止时间和占用时间', text: '记录早中晚班的起止时间，区分用餐、休息、更衣、培训与交接的安排，询问是否存在两头班以及班间如何休息。这里提供问询方法，不对具体工时合规性作结论。' },
        { title: '月休如何安排', text: '问清排班提前多久发布、能否申请指定休息日、考试或返校如何请假。节假日、宴会高峰或临时换班的处理方式，应由学校和酒店结合本人实习要求确认。' },
        { title: '临时延后不要只靠口头', text: '询问临时延后结束是否需要审批、如何记录，补休或其他处理如何确认。保存自己的考勤与调班沟通；发现安排与学校要求或已确认计划冲突，及时联系指导老师和 HR。' }
      ],
      example: '“可以看一份去掉姓名的典型周排班吗？如果遇到考试返校或宴会延后结束，分别由谁审批、怎样登记和处理？”不要提交或传播同事的完整排班个人信息。',
      checks: ['已确认各班次起止、休息和交接安排', '已确认月休、排班公布及调班方式', '已确认返校考试、请假和节假日安排', '已确认考勤记录及临时延后工作的处理流程']
    },
    {
      id: 'agreement', category: '安全与手续', minutes: 4,
      title: '收到录用意向后，先和学校对齐材料',
      summary: '岗位实习协议、就业协议、入职登记表，要逐项辨认。',
      intro: '口头录用、聊天确认、实习协议与毕业就业协议用途不同。先让指导老师确认实习类型、审批顺序及学校模板，再安排到岗。',
      sections: [
        { title: '确认谁签、签什么', text: '核对酒店品牌与实际签约单位的名称，确认学校是否需要参与签署，以及由谁审核盖章。《职业学校学生实习管理规定》（2021年修订）的相关要求针对职业学校学生实习；普通本科或其他实习安排，请向所在学校确认适用制度。' },
        { title: '材料尽量一次准备齐', text: '整理学校实习审批、协议、实习计划、指导老师联系方式、酒店材料清单及提交截止日。跨省实习、返校考试、实习考核和提前结束的手续要单独确认。' },
        { title: '签之前核对实习条件', text: '核对实习地点、起止日、部门、津贴、食宿、保险和问题处理联系人。对空白条款或无法理解的内容，先请学校解释；身份证件等个人材料只通过确认过的必要渠道提交，不发到公开群。' }
      ],
      example: '可建立文件夹：“学校审批 / 签署后的协议 / 实习计划 / 保险凭证 / 月度记录 / 实习考核”。保留自己的完整版本，分享给同学时先去掉证件号码等个人信息。',
      checks: ['已向学校确认审批顺序、模板及实习类型', '已核对酒店品牌与实际签约单位', '已核对协议条件、保险及问题联系人', '已确认跨省、返校、考核与结束实习手续'],
      sources: [policySources[0], policySources[2]]
    },
    {
      id: 'resume', category: '申请准备', minutes: 3,
      title: '酒店实习简历：先把能到岗的时间写清楚',
      summary: '用具体服务经历和岗位英语展示准备程度，不夸大能力。',
      intro: '面试官首先需要知道你能何时到岗、连续实习多久、意向部门与学校要求。一页简历可以先围绕这几项组织。',
      sections: [
        { title: '首屏放清楚的基本信息', text: '写明学校、专业、就读年级、预计到岗日、可实习时间和意向部门。说明是否需要学校协议与考核配合；不要把“暑假有空”写成半年稳定到岗。' },
        { title: '用小经历说明服务能力', text: '校园活动签到、餐饮兼职、志愿服务都可写成“场景—行动—结果”。如实写自己完成的工作，不把协助活动描述成独立管理酒店部门。' },
        { title: '准备与岗位有关的表达', text: '前厅可练问候、确认姓名、说明等待；餐饮可练引位、介绍菜品、转交特殊需求。英语水平按实际描述，准备30秒中英文自我介绍；没有听懂时礼貌请对方重复，避免猜测客人需求。' }
      ],
      example: '简历句式：“在学院接待活动中负责来宾签到和引导，按名单核对后将特殊需求转交负责人。”如确有记录，可补充真实人数；不要编造数据。',
      checks: ['简历写清学校、专业、到岗日与实习时长', '经历表述真实且能说明个人贡献', '已准备与意向部门相关的沟通表达', '已通过酒店确认的渠道了解投递与面试方式']
    },
    {
      id: 'firstweek', category: '申请准备', minutes: 3,
      title: '到岗第一周，建立自己的小记录本',
      summary: '把联系人、培训、每天的新技能与待解决问题整理起来。',
      intro: '第一周不必急着证明自己什么都会。先了解团队、工作边界、操作流程和遇到问题该找谁。',
      sections: [
        { title: '第一天先找对人', text: '记录 HR、部门带教、当班负责人和学校指导老师的联系方法，了解更衣室、员工餐厅、宿舍及紧急疏散安排。进入具体操作前，确认相应培训和指导要求。' },
        { title: '每天记一件学会的事', text: '用“今天学习了什么—还不理解什么—准备问谁”三行记录。涉及客人投诉时记流程与改进点，不把客人姓名、房号、证件、联系方式或酒店系统截图放进个人笔记。' },
        { title: '一周后做一次简短复盘', text: '与带教核对后续目标，同时向学校汇报学习、食宿和实际安排。有与先前确认条件不同的事项，清楚记录差异和沟通结果，尽早提出。' }
      ],
      example: '周复盘示例：“已熟悉员工入口、供餐和班车；还需练习电话转接；下周希望在带教下完成一次规范交接。”',
      checks: ['已保存酒店与学校联系人', '已确认入岗培训、应急及基本生活安排', '已建立不包含客人个人信息的学习记录', '已约定第一周反馈及后续学习目标']
    }
  ];

  const practicalQuestions = [
  {
    "id": "arrival-order",
    "category": "报到与材料",
    "minutes": 2,
    "title": "到站后先去酒店，还是先去宿舍？",
    "summary": "先看 HR 的书面报到安排。住宿办理、入职材料提交、部门正式到岗可能是三个不同时间和地点，不要默认下车后直接去酒店大堂。",
    "intro": "先看 HR 的书面报到安排。住宿办理、入职材料提交、部门正式到岗可能是三个不同时间和地点，不要默认下车后直接去酒店大堂。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "把到达车站、预计时间告知 HR，确认员工入口、接待人、是否先办住宿。若车次变动或晚到，先联系接待人再调整行程。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "我的车次预计几点到达？当天先去哪里、找谁、最晚几点能办理？"
      }
    ],
    "example": "我的车次预计几点到达？当天先去哪里、找谁、最晚几点能办理？",
    "checks": [
      "已确认报到顺序、日期和员工入口",
      "已保存到达当日接待及晚到联系方法"
    ]
  },
  {
    "id": "bank-card",
    "category": "报到与材料",
    "minutes": 2,
    "title": "工资卡一定要重新办？开户行怎么查？",
    "summary": "先确认酒店的代发银行，再核对已有本人银行卡能否使用。已有卡不要急着重办；卡片是否正常、收款额度和开户行信息，可通过银行官方渠道核实。",
    "intro": "先确认酒店的代发银行，再核对已有本人银行卡能否使用。已有卡不要急着重办；卡片是否正常、收款额度和开户行信息，可通过银行官方渠道核实。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "HR 可能需要户名、卡号和开户网点。只通过酒店核实过的安全渠道提交，不把银行卡照片发进同伴群；不要提供密码、验证码或网银登录信息。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "酒店接受哪家银行、什么卡种？已有异地卡是否可用，需要开户行全称还是联行号？"
      }
    ],
    "example": "酒店接受哪家银行、什么卡种？已有异地卡是否可用，需要开户行全称还是联行号？",
    "checks": [
      "已核实酒店代发银行及已有卡能否使用",
      "已确认必要信息和提交渠道"
    ]
  },
  {
    "id": "health-certificate",
    "category": "报到与材料",
    "minutes": 2,
    "title": "健康证和入职体检一样吗？必须在当地办吗？",
    "summary": "两者不要混为一谈。岗位是否需要从业健康证明、证件类别、办理地点和已有证明能否使用，都要由酒店按岗位及当地现行要求确认，不能把某酒店的安排套用于所有城市。",
    "intro": "两者不要混为一谈。岗位是否需要从业健康证明、证件类别、办理地点和已有证明能否使用，都要由酒店按岗位及当地现行要求确认，不能把某酒店的安排套用于所有城市。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "先索取办理指引，确认是否需要单位材料、预约、照片或其他资料，以及费用承担和出结果时间。未取得确认前，不必自行重复体检；不适或复查按医疗机构指引处理。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "我的岗位需要哪类证明？已有证能否使用？由谁提供材料、承担费用，报告未出时怎样安排到岗？"
      }
    ],
    "example": "我的岗位需要哪类证明？已有证能否使用？由谁提供材料、承担费用，报告未出时怎样安排到岗？",
    "checks": [
      "已确认岗位所需证明类型及认可范围",
      "已确认预约材料、费用和预计办结时间"
    ]
  },
  {
    "id": "school-docs",
    "category": "报到与材料",
    "minutes": 2,
    "title": "在读证明、学校背景函、无犯罪记录证明都要准备吗？",
    "summary": "不必把某一家酒店的材料清单当成所有实习生的统一要求。先让 HR 写明本岗位需要的材料、用途和可接受替代文件，再找学校对应部门办理。",
    "intro": "不必把某一家酒店的材料清单当成所有实习生的统一要求。先让 HR 写明本岗位需要的材料、用途和可接受替代文件，再找学校对应部门办理。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "若学校盖章需要时间，离校前准备；不要自行制作或修改学校证明。对背景调查或犯罪记录核查，先确认必要性、依据、授权和正规渠道，不向陌生链接提交证件。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "学校现有在读证明或表现证明是否可以？缺少某份材料时接受什么替代、何时补交？"
      }
    ],
    "example": "学校现有在读证明或表现证明是否可以？缺少某份材料时接受什么替代、何时补交？",
    "checks": [
      "已拿到本岗位材料清单及用途",
      "已确认学校盖章时间和可接受替代材料"
    ]
  },
  {
    "id": "photo-uniform",
    "category": "报到与材料",
    "minutes": 2,
    "title": "要带证件照、正装和工作鞋吗？",
    "summary": "先问照片尺寸、底色、张数及是否现场拍摄，再准备。制服、工作鞋、清洗服务是否提供，各酒店不同，不要先按自己的想象整套购买。",
    "intro": "先问照片尺寸、底色、张数及是否现场拍摄，再准备。制服、工作鞋、清洗服务是否提供，各酒店不同，不要先按自己的想象整套购买。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "记录制服试穿时间、可用尺码、个人需自备的物品和清洁安排。仪容要求与具体岗位沟通，尺码或身体适配有困难时提前说明。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "哪些物品由酒店提供？我只需自备哪些？照片可以交电子版吗？"
      }
    ],
    "example": "哪些物品由酒店提供？我只需自备哪些？照片可以交电子版吗？",
    "checks": [
      "已确认照片规格、电子版及现场拍摄安排",
      "已确认制服鞋履和必须自备物品"
    ]
  },
  {
    "id": "dorm-checkin",
    "category": "住宿与通勤",
    "minutes": 2,
    "title": "可以提前住进宿舍？晚到怎么办？",
    "summary": "提前入住需要先确认床位和接待时间。住宿资格、可入住日期及接待时段通常与正式到岗安排分别确认，收到录用意向不等于当天就能入住。",
    "intro": "提前入住需要先确认床位和接待时间。住宿资格、可入住日期及接待时段通常与正式到岗安排分别确认，收到录用意向不等于当天就能入住。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "订票前确认到达时间是否能办理；超出接待时段时，询问可行的替代安排及谁承担相应费用。没有得到同意前，不要把提前入住作为既定计划。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "最早哪天入住、当天几点办理？如果车次晚点，联系谁，有没有临时安排？"
      }
    ],
    "example": "最早哪天入住、当天几点办理？如果车次晚点，联系谁，有没有临时安排？",
    "checks": [
      "已获得可入住日期及接待时段",
      "已确认晚到或提前到达的处理方式"
    ]
  },
  {
    "id": "bedding-parcel",
    "category": "住宿与通勤",
    "minutes": 2,
    "title": "床品要自带吗？行李能提前寄过去吗？",
    "summary": "先问宿舍提供哪些床品、床的尺寸和可收快递的时间。没有指定接收人和保管安排时，不要提前把行李寄到酒店或宿舍。",
    "intro": "先问宿舍提供哪些床品、床的尺寸和可收快递的时间。没有指定接收人和保管安排时，不要提前把行李寄到酒店或宿舍。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "按首周必需品打包，确认洗衣、晾晒、储物和换洗安排。能否代收大件、是否有快递柜、宿舍空间多大，都需要实际答复。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "床垫被褥是否提供、床多大？何时可寄件、谁签收、收件地址怎么写？"
      }
    ],
    "example": "床垫被褥是否提供、床多大？何时可寄件、谁签收、收件地址怎么写？",
    "checks": [
      "已确认床品、床尺寸与洗衣条件",
      "已确认快递接收日期、地址和责任人"
    ]
  },
  {
    "id": "dorm-roommate",
    "category": "住宿与通勤",
    "minutes": 2,
    "title": "能和同学住一间吗？能住外面吗？",
    "summary": "可以提出希望同住或不住宿舍的意向，但房间分配取决于空床、住宿规则和班次，不宜向同学承诺一定同住。外住还需核对学校的管理要求。",
    "intro": "可以提出希望同住或不住宿舍的意向，但房间分配取决于空床、住宿规则和班次，不宜向同学承诺一定同住。外住还需核对学校的管理要求。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "分别确认几人间、独立卫浴、门禁、可否调床，以及外住申请流程。同伴邀请只表达共同选择意向，不替酒店分房，也不代替个人的学校审批。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "有几人间、能否同住？如不能同住我是否仍接受？外住或住家需要哪些确认？"
      }
    ],
    "example": "有几人间、能否同住？如不能同住我是否仍接受？外住或住家需要哪些确认？",
    "checks": [
      "已确认房间人数及同住申请方式",
      "已与学校、酒店确认外住要求"
    ]
  },
  {
    "id": "dorm-utilities",
    "category": "住宿与通勤",
    "minutes": 2,
    "title": "“包住”后，还要交哪些水电费用？",
    "summary": "“提供住宿”不一定包括全部水电和生活用品。让酒店按床位、水、电、网络、洗衣等逐项列明是否承担、计价方法和结算周期。",
    "intro": "“提供住宿”不一定包括全部水电和生活用品。让酒店按床位、水、电、网络、洗衣等逐项列明是否承担、计价方法和结算周期。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "合住时确认按人还是按房分摊，晚入住、早退宿如何计算。如要求押金或扣款，先取得书面说明并交学校核查，不把“大家都交”当成依据。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "水电怎么计费、谁收取、能否查明细？我月中入住或退宿怎样结算？"
      }
    ],
    "example": "水电怎么计费、谁收取、能否查明细？我月中入住或退宿怎样结算？",
    "checks": [
      "已取得食宿费用及分摊明细",
      "已核查押金扣款等不清楚的项目"
    ]
  },
  {
    "id": "commute-late",
    "category": "住宿与通勤",
    "minutes": 2,
    "title": "晚班错过地铁怎么办？打车都能报销吗？",
    "summary": "不是所有打车费都自动报销。先确认本人允许的班次，再分别问正常班次交通安排、临时延后结束和交通中断的处理方法。",
    "intro": "不是所有打车费都自动报销。先确认本人允许的班次，再分别问正常班次交通安排、临时延后结束和交通中断的处理方法。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "保存适用时段、审批人、报销上限、票据要求和申请期限。班次交通津贴与凭票报销是不同项目，不要只记“有车补”。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "我的班次结束时还能坐公共交通吗？若没有，酒店怎样安排、需谁批准、费用何时到账？"
      }
    ],
    "example": "我的班次结束时还能坐公共交通吗？若没有，酒店怎样安排、需谁批准、费用何时到账？",
    "checks": [
      "已核对实际上下班可用交通",
      "已确认津贴与报销的各自条件"
    ]
  },
  {
    "id": "pay-first-month",
    "category": "津贴与请假",
    "minutes": 2,
    "title": "月中到岗，第一笔津贴怎么算、何时到账？",
    "summary": "先区分考勤周期与发薪日期，再按约定的出勤口径计算。月中到岗不宜直接用月额除以30；入职赶不上当期结算时，首笔到账也可能与预期不同。",
    "intro": "先区分考勤周期与发薪日期，再按约定的出勤口径计算。月中到岗不宜直接用月额除以30；入职赶不上当期结算时，首笔到账也可能与预期不同。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "让 HR 按你的实际到岗日期演算首月，拆开基础津贴、补贴、奖励和依法需处理的项目，并确认从哪里查看明细。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "我计划在几号到岗，第一笔何时发、对应哪段考勤？首月怎么计算？"
      }
    ],
    "example": "我计划在几号到岗，第一笔何时发、对应哪段考勤？首月怎么计算？",
    "checks": [
      "已确认首月计算示例和首笔发放日",
      "已确认考勤周期及明细获取渠道"
    ]
  },
  {
    "id": "travel-reimbursement",
    "category": "津贴与请假",
    "minutes": 2,
    "title": "来实习的高铁或机票能报销吗？先买票行不行？",
    "summary": "先取得明确的报销条件，再购买。是否报销、适用出发地、交通等级、金额上限、实习时长和凭证要求，都可能因酒店与学校约定不同。",
    "intro": "先取得明确的报销条件，再购买。是否报销、适用出发地、交通等级、金额上限、实习时长和凭证要求，都可能因酒店与学校约定不同。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "来程与返程分开问；电子发票、行程单或铁路凭证按对方指引保留。改签、跨城市出发、提前结束实习是否影响报销，应在订票前确认。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "我的出发地和车次符合标准吗？需要先审批吗？提交什么凭证，预计何时到账？"
      }
    ],
    "example": "我的出发地和车次符合标准吗？需要先审批吗？提交什么凭证，预计何时到账？",
    "checks": [
      "已确认来回程标准及审批方式",
      "已确认票据、提交时点和结算安排"
    ]
  },
  {
    "id": "sick-exam-leave",
    "category": "津贴与请假",
    "minutes": 2,
    "title": "生病、返校考试怎么请假？会影响津贴吗？",
    "summary": "请假先联系部门负责人，并按酒店流程登记；学校安排的考试或返校事项同时告知指导老师。是否带薪、怎样影响津贴和实习时长，按适用制度及实际约定核对。",
    "intro": "请假先联系部门负责人，并按酒店流程登记；学校安排的考试或返校事项同时告知指导老师。是否带薪、怎样影响津贴和实习时长，按适用制度及实际约定核对。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "不要把另一家酒店的带薪病假天数套用到自己。询问是否需要就医证明、提交给谁、何时补交；健康资料只交必要接收方。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "病假和返校假分别找谁批准？津贴如何计算，学校要求的实习天数需要补足吗？"
      }
    ],
    "example": "病假和返校假分别找谁批准？津贴如何计算，学校要求的实习天数需要补足吗？",
    "checks": [
      "已确认请假联系人和材料",
      "已确认津贴、实习时长及返校安排"
    ]
  },
  {
    "id": "meals-shift",
    "category": "津贴与请假",
    "minutes": 2,
    "title": "休息日能吃员工餐吗？错过饭点怎么办？",
    "summary": "工作日、培训日、休息日的供餐资格可能不同。员工餐开放不等于可以不限次数就餐，也不能默认酒店24小时提供餐食。",
    "intro": "工作日、培训日、休息日的供餐资格可能不同。员工餐开放不等于可以不限次数就餐，也不能默认酒店24小时提供餐食。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "核对各餐时段、领取方式、个人饮食需求和错过用餐时的安排。需要晚班餐时，先确认允许班次及相应餐食。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "我住宿期间的休息日可以用餐吗？交接错过饭点时能否留餐、找谁安排？"
      }
    ],
    "example": "我住宿期间的休息日可以用餐吗？交接错过饭点时能否留餐、找谁安排？",
    "checks": [
      "已确认工作日和休息日的用餐规则",
      "已确认错过饭点及个人饮食需求"
    ]
  },
  {
    "id": "rotation-actual",
    "category": "岗位与排班",
    "minutes": 2,
    "title": "做得好就能轮岗？可以实习中换部门吗？",
    "summary": "不一定。多个部门都招人，不代表入职后能自由轮岗；固定轮岗、申请换岗和临时支援应分开确认。",
    "intro": "不一定。多个部门都招人，不代表入职后能自由轮岗；固定轮岗、申请换岗和临时支援应分开确认。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "签署前记录首岗、预计工作内容、培训及是否有已确认的轮岗计划。岗位改变涉及学习任务、食宿或津贴时，向学校和 HR 同步确认并留下书面记录。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "这份岗位是固定部门还是有轮岗计划？能否写明部门、时长、条件和审批人？"
      }
    ],
    "example": "这份岗位是固定部门还是有轮岗计划？能否写明部门、时长、条件和审批人？",
    "checks": [
      "已区分固定岗位、轮岗和临时支援",
      "已确认变更岗位时的沟通与书面记录"
    ]
  },
  {
    "id": "schedule-real",
    "category": "岗位与排班",
    "minutes": 2,
    "title": "月休8天，是固定双休吗？两头班是什么？",
    "summary": "月休天数不等于每周六日休息。两头班通常指一天分两个时段安排工作，中间有较长间隔；应看完整起止时间、休息和通勤安排。",
    "intro": "月休天数不等于每周六日休息。两头班通常指一天分两个时段安排工作，中间有较长间隔；应看完整起止时间、休息和通勤安排。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "请 HR 提供去掉姓名的典型周排班，确认排班提前多久公布、调班流程，以及学校对本人实习班次的要求。不能只按“总时长看起来够”作判断。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "能给一个实际周排班例子吗？有没有两头班、最早最晚几点、月休怎样安排？"
      }
    ],
    "example": "能给一个实际周排班例子吗？有没有两头班、最早最晚几点、月休怎样安排？",
    "checks": [
      "已查看实际班次和间隔示例",
      "已向学校确认本人可接受的实习安排"
    ]
  },
  {
    "id": "overtime-record",
    "category": "岗位与排班",
    "minutes": 2,
    "title": "宴会结束晚了，怎样记工时和补休？",
    "summary": "先确认谁批准延后结束、怎样记录实际时间，再确认补休或报酬的适用处理方式。不要把“偶尔帮忙”理解为无需记录。",
    "intro": "先确认谁批准延后结束、怎样记录实际时间，再确认补休或报酬的适用处理方式。不要把“偶尔帮忙”理解为无需记录。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "实习班次和延时安排先按学校及适用规定核对。保留本人考勤、变更原因和书面反馈；发现与确认条件不符时，及时联系带教、HR及指导老师。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "延后结束由谁审批，考勤怎么确认？后续补休或其他处理什么时候落实？"
      }
    ],
    "example": "延后结束由谁审批，考勤怎么确认？后续补休或其他处理什么时候落实？",
    "checks": [
      "已确认考勤及临时调整的记录方式",
      "已保存差异沟通与处理联系人"
    ]
  },
  {
    "id": "ask-right-person",
    "category": "岗位与排班",
    "minutes": 2,
    "title": "津贴没到账，是找HR还是财务？",
    "summary": "先找酒店指定的实习联络人或 HR，确认考勤、银行卡及申请是否齐全，再按流程查询财务付款。不要同时把个人银行卡信息发给多个不明联系人。",
    "intro": "先找酒店指定的实习联络人或 HR，确认考勤、银行卡及申请是否齐全，再按流程查询财务付款。不要同时把个人银行卡信息发给多个不明联系人。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "带上本人对应月份、应付项目、预计金额和提交日期，询问下一次明确反馈时间。报销审核通过不等于款项已经到账。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "这笔津贴或报销目前在哪一步？还缺什么材料，由谁跟进、何时反馈？"
      }
    ],
    "example": "这笔津贴或报销目前在哪一步？还缺什么材料，由谁跟进、何时反馈？",
    "checks": [
      "已保存各事项的指定联系人",
      "已记录待处理项目和下次反馈时间"
    ]
  },
  {
    "id": "insurance-covered",
    "category": "安全与协议",
    "minutes": 2,
    "title": "酒店说有雇主责任险，我就一定被保了吗？",
    "summary": "不能仅凭险种名称判断。需确认本岗位实习生是否在保障范围、什么时候生效、保额和除外事项，以及能取得什么凭证。",
    "intro": "不能仅凭险种名称判断。需确认本岗位实习生是否在保障范围、什么时候生效、保额和除外事项，以及能取得什么凭证。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "雇主责任险、实习责任保险、意外险、补充医疗并非同一项保障。工作中受伤、通勤意外和宿舍受伤分别按实际条款核对；发生紧急情况先救助再按流程报案。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "可以提供我适用的保险说明或参保凭证吗？工作、通勤和宿舍情形分别如何处理？"
      }
    ],
    "example": "可以提供我适用的保险说明或参保凭证吗？工作、通勤和宿舍情形分别如何处理？",
    "checks": [
      "已确认本人覆盖及起止日期",
      "已保存保险凭证与报案渠道"
    ]
  },
  {
    "id": "agreement-conflict",
    "category": "安全与协议",
    "minutes": 2,
    "title": "招聘页、Q&A和协议写得不一样，以哪个为准？",
    "summary": "不要自己挑一个更有利的版本理解。签署前把冲突条目并列发给 HR，请其与学校核对并形成一致的书面版本或补充约定。",
    "intro": "不要自己挑一个更有利的版本理解。签署前把冲突条目并列发给 HR，请其与学校核对并形成一致的书面版本或补充约定。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "常见差异包括能否调岗、津贴补贴是否包含、住宿费用及提前结束流程。记录版本和日期，保留签署完整件；口头解释不应成为漏填重要条件的理由。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "这几处条件不一致，请确认当前适用于我的条款，并在协议或附件中写清。"
      }
    ],
    "example": "这几处条件不一致，请确认当前适用于我的条款，并在协议或附件中写清。",
    "checks": [
      "已核对岗位说明、通知及协议的一致性",
      "已保存双方及学校确认的完整版本"
    ]
  },
  {
    "id": "finish-date",
    "category": "结束与返校",
    "minutes": 2,
    "title": "最后一天上班，当天就能退宿赶火车吗？",
    "summary": "不一定。最后工作日、手续办理日、退宿日和返程日可能不同，先确认各部门可办理的时间，再订返程票。",
    "intro": "不一定。最后工作日、手续办理日、退宿日和返程日可能不同，先确认各部门可办理的时间，再订返程票。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "预留制服、证件、钥匙交还与费用核对时间；周末或节假日 HR、财务不一定都能办理。提前了解是否必须本人办理以及学校材料的盖章周期。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "我的最后工作日、办理手续日和退宿截止日分别是哪天？返程票订哪天合适？"
      }
    ],
    "example": "我的最后工作日、办理手续日和退宿截止日分别是哪天？返程票订哪天合适？",
    "checks": [
      "已对齐工作、手续、退宿和返程日期",
      "已确认办理时段及是否必须本人到场"
    ]
  },
  {
    "id": "finish-certificate",
    "category": "结束与返校",
    "minutes": 2,
    "title": "实习鉴定和证明什么时候找谁签、盖什么章？",
    "summary": "先核对学校要求的表格、评价人和印章，再向部门及 HR 预约办理。直属带教评价、部门签字和公司盖章可能需要不同时间。",
    "intro": "先核对学校要求的表格、评价人和印章，再向部门及 HR 预约办理。直属带教评价、部门签字和公司盖章可能需要不同时间。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "自评部分提前写好，向学校确认可否使用电子件。计划提前结束时，应单独询问已完成时段如何记录，不要默认能取得与完整实习相同的证明。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "学校要求哪种印章、由谁评价？最晚何时交表，何时能领取真实实习时段的材料？"
      }
    ],
    "example": "学校要求哪种印章、由谁评价？最晚何时交表，何时能领取真实实习时段的材料？",
    "checks": [
      "已取得学校当前材料和盖章要求",
      "已预约评价、签字、盖章与领取时间"
    ]
  },
  {
    "id": "finish-checkout",
    "category": "结束与返校",
    "minutes": 2,
    "title": "结束实习要还什么？最后一笔钱如何核对？",
    "summary": "按酒店交接清单逐项归还制服、员工证、门卡、钥匙及借用物品，并保留确认。津贴、报销、宿舍水电等分开核对，问清各自结算日期。",
    "intro": "按酒店交接清单逐项归还制服、员工证、门卡、钥匙及借用物品，并保留确认。津贴、报销、宿舍水电等分开核对，问清各自结算日期。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "对物品损坏或扣款有争议，先要求事实和明细并联系学校协助，不签空白确认。离开前核对手机、邮箱可正常接收后续通知。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "归还清单由谁确认？末月津贴、报销和住宿结算何时完成，异议联系谁？"
      }
    ],
    "example": "归还清单由谁确认？末月津贴、报销和住宿结算何时完成，异议联系谁？",
    "checks": [
      "已完成物品交接并留存确认",
      "已核对最终结算及后续联系方法"
    ]
  },
  {
    "id": "early-end",
    "category": "结束与返校",
    "minutes": 2,
    "title": "实习不适应，能直接离开吗？",
    "summary": "先把问题及希望调整的方案告诉指导老师和 HR，核对协议中的变更或提前结束流程。遇到紧急安全风险先保障自身安全并及时寻求帮助。",
    "intro": "先把问题及希望调整的方案告诉指导老师和 HR，核对协议中的变更或提前结束流程。遇到紧急安全风险先保障自身安全并及时寻求帮助。",
    "practical": true,
    "sections": [
      {
        "title": "实际准备怎么做",
        "text": "写明已完成时段、离开原因、交接安排和学校后续要求；津贴、返程报销、住宿及实习记录分别确认。不要把某酒店的通知天数当成全国统一期限。"
      },
      {
        "title": "还需向本酒店确认",
        "text": "如果需要调整或提前结束，学校和酒店分别怎样办理？结算、住宿和已完成时段如何记录？"
      }
    ],
    "example": "如果需要调整或提前结束，学校和酒店分别怎样办理？结算、住宿和已完成时段如何记录？",
    "checks": [
      "已与学校和HR确认变更或结束流程",
      "已核对交接、结算及学习记录安排"
    ]
  }
];
  articles.unshift(...practicalQuestions);
  const categoryAlias = { '安全与手续': '安全与协议', '津贴与生活': '津贴与请假', '岗位与成长': '岗位与排班' };
  const categories = ['全部', '申请准备', '报到与材料', '住宿与通勤', '津贴与请假', '岗位与排班', '安全与协议', '结束与返校'];
  const displayCategory = article => ['dorm', 'commute', 'meals'].includes(article.id) ? '住宿与通勤' : categoryAlias[article.category] || article.category;
  const ids = articles.map(article => article.id);
  const PAGE_SIZE = 6;
  let state, stateOwner = null, query = '', category = '全部', collectionOnly = false, currentPage = 1;
  const D = () => window.JiulvDemo;
  const e = value => D().e(value);
  const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
  // Inline artwork stays legible offline and shares the handbook's line style.
  const iconPaths = {
    hotel: '<path d="M4 21V8h6V3h10v18M2 21h20M7 11v1m0 3v1m6-10h1m3 0h1m-5 4h1m3 0h1m-5 4h1m3 0h1m-5 7v-4h4v4"/>',
    book: '<path d="M12 5v15M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2V4Zm3 4h3m6 0h3M6 12h3m6 0h3"/>',
    document: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Zm0 0v6h6M8 13h8m-8 4h5"/>',
    suitcase: '<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V4h6v3M8 7v13M16 7v13M7 20v1m10-1v1"/>',
    wallet: '<path d="M20 8V5H6a3 3 0 0 0 0 6h15v9H6a3 3 0 0 1-3-3V8m18 6h-5v3h5"/><path d="M6 8h11"/>',
    bed: '<path d="M3 18V8m18 10V9M3 15h18M3 11h18v4M5 11V7h6v4m2 0V7h6v4M3 18v3m18-3v3"/>',
    train: '<rect x="5" y="3" width="14" height="15" rx="4"/><path d="M5 10h14M12 3v7M8 18l-2 3m10-3 2 3M8 21h8"/><circle cx="8.5" cy="14.5" r=".7"/><circle cx="15.5" cy="14.5" r=".7"/>',
    meal: '<path d="M4 3v6a2 2 0 0 0 4 0V3M6 3v18M18 3c-2 2-3 5-3 9h4m0-9v18"/>',
    rotation: '<path d="M20 9a8 8 0 0 0-14-3L3 9m0-6v6h6M4 15a8 8 0 0 0 14 3l3-3m0 6v-6h-6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18M7 14h2m4 0h2m-8 4h2"/>',
    shield: '<path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4Z"/><path d="m8 12 3 3 5-6"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4m4 0h2"/>',
    health: '<path d="M15 7h4v14H5V7h4m0-3h6v5H9V4Z"/><path d="M9 15h6m-3-3v6"/>',
    shirt: '<path d="m8 3-5 3-2 5 5 2v8h12v-8l5-2-2-5-5-3c0 4-8 4-8 0Z"/>',
    parcel: '<path d="m12 3 9 5v10l-9 5-9-5V8l9-5Zm0 10v10M3 8l9 5 9-5M8 5l9 5v4"/>',
    people: '<circle cx="8" cy="7" r="3"/><path d="M2 20v-3a6 6 0 0 1 12 0v3m3-16a3 3 0 0 1 0 6m0 4a5 5 0 0 1 5 5v1"/>',
    utilities: '<path d="m12 2-6 11h5l-1 9 8-13h-6l0-7Z"/>',
    ticket: '<path d="M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V6Zm12 0v2m0 3v2m0 3v2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
    chat: '<path d="M21 12a9 9 0 0 1-9 9 10 10 0 0 1-4-1l-6 2 2-6a10 10 0 0 1-1-4 9 9 0 1 1 18 0Z"/><path d="M7 10h10m-10 4h6"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="m8 14-2 8 6-3 6 3-2-8m-7-5 2 2 4-4"/>',
    checklist: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M8 10l1 1 2-2m2 1h3M8 16l1 1 2-2m2 1h3"/>',
    route: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h9a4 4 0 0 1 0 8H8a3 3 0 0 0 0 6h9m-5-3 3 3-3 3"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>'
  };
  const articleIcons = {
    insurance: 'shield', pay: 'wallet', dorm: 'bed', commute: 'train', meals: 'meal', rotation: 'rotation', schedule: 'calendar', agreement: 'document', resume: 'document', firstweek: 'suitcase',
    'arrival-order': 'route', 'bank-card': 'card', 'health-certificate': 'health', 'school-docs': 'document', 'photo-uniform': 'shirt',
    'dorm-checkin': 'bed', 'bedding-parcel': 'parcel', 'dorm-roommate': 'people', 'dorm-utilities': 'utilities', 'commute-late': 'train',
    'pay-first-month': 'wallet', 'travel-reimbursement': 'ticket', 'sick-exam-leave': 'calendar', 'meals-shift': 'meal',
    'rotation-actual': 'rotation', 'schedule-real': 'calendar', 'overtime-record': 'clock', 'ask-right-person': 'chat',
    'insurance-covered': 'shield', 'agreement-conflict': 'document', 'finish-date': 'suitcase', 'finish-certificate': 'award', 'finish-checkout': 'checklist', 'early-end': 'route'
  };
  const categoryIcons = { '全部': 'book', '报到与材料': 'suitcase', '住宿与通勤': 'bed', '津贴与请假': 'wallet', '岗位与排班': 'calendar', '安全与协议': 'shield', '结束与返校': 'award', '安全与手续': 'shield', '津贴与生活': 'wallet', '岗位与成长': 'rotation', '申请准备': 'document' };
  function icon(name) { return `<svg class="academy-line-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${iconPaths[name] || iconPaths.book}</svg>`; }
  function articleMeta(article) {
    const series = articles.filter(item => item.practical === article.practical);
    return `${displayCategory(article)} · ${article.practical ? '问答' : '指南'} ${String(series.findIndex(item => item.id === article.id) + 1).padStart(2, '0')}`;
  }
  // A single checklist is shared by related questions and guides, so an item
  // appears only once in the final preparation list and is never double-counted.
  const checklistGroups = [
    { title: '报到与材料', icon: 'suitcase', items: [
      { id: 'arrival', text: '已确认报到日期、先去酒店还是宿舍、接待地点、晚到安排与联系人。', topics: ['arrival-order', 'dorm-checkin', 'firstweek'] },
      { id: 'school', text: '已向学校确认实习类型、审批顺序、必交材料和截止日，不确定的证明已向 HR 核实。', topics: ['school-docs', 'agreement', 'insurance'] },
      { id: 'health-clothing', text: '已问清健康证与体检是否需要、办理地点，以及证件照、正装、工作鞋等准备要求。', topics: ['health-certificate', 'photo-uniform'] },
      { id: 'bank', text: '已确认工资卡的银行要求、开户行信息及提交方式，不把银行卡资料发进公开群。', topics: ['bank-card', 'pay'] }
    ] },
    { title: '住宿与通勤', icon: 'bed', items: [
      { id: 'dorm-space', text: '已确认宿舍地址、入住日期、房间人数、卫浴设施及同住/外住申请安排。', topics: ['dorm-checkin', 'dorm-roommate', 'dorm'] },
      { id: 'dorm-cost', text: '已逐项问清住宿水电等费用、门禁与夜班作息；押金或不明收费先交学校核查。', topics: ['dorm-utilities', 'dorm', 'pay'] },
      { id: 'luggage', text: '已确认床品和生活用品是否自备、行李能否提前寄送、收件地点及领取方式。', topics: ['bedding-parcel', 'dorm'] },
      { id: 'commute', text: '已按实际班次核对员工入口到宿舍的通勤、末班交通/班车及晚归费用和处理办法。', topics: ['commute-late', 'commute', 'firstweek'] }
    ] },
    { title: '津贴与餐食', icon: 'wallet', items: [
      { id: 'pay-amount', text: '已确认基础津贴、补贴和出勤口径，并请 HR 说明首月、末月的计算与结算方式。', topics: ['pay-first-month', 'pay', 'finish-checkout'] },
      { id: 'pay-date', text: '已确认发薪日期、发放主体、明细获取方式；金额有差异时知道找谁核对。', topics: ['pay-first-month', 'ask-right-person', 'pay'] },
      { id: 'travel', text: '如涉及来程交通报销，已在购票前问清适用条件、金额范围、凭证和办理期限。', topics: ['travel-reimbursement'] },
      { id: 'meals', text: '已确认员工餐供餐时段、次数、费用、休息日和错过饭点的安排，并沟通饮食需求。', topics: ['meals-shift', 'meals', 'firstweek'] }
    ] },
    { title: '岗位与作息', icon: 'calendar', items: [
      { id: 'job', text: '已问清首个部门、日常工作、岗位语言要求、入岗培训、带教人与阶段学习目标。', topics: ['rotation-actual', 'rotation', 'resume', 'firstweek'] },
      { id: 'rotation', text: '已分清固定轮岗、申请换岗或未安排轮岗，并确认条件、时长和申请流程。', topics: ['rotation-actual', 'rotation'] },
      { id: 'schedule', text: '已确认班次起止、月休、调班与考勤；临时延后结束怎样审批、记录和处理。', topics: ['schedule-real', 'overtime-record', 'schedule', 'commute'] },
      { id: 'leave', text: '已确认生病、考试或返校的请假联系人、材料与审批方式，以及出勤和津贴如何计算。', topics: ['sick-exam-leave', 'schedule', 'agreement'] }
    ] },
    { title: '协议与安全', icon: 'shield', items: [
      { id: 'agreement', text: '已核对实际签约单位、实习起止日和条件；招聘说明与协议不一致的地方已书面确认。', topics: ['agreement-conflict', 'agreement'] },
      { id: 'insurance', text: '已取得适用险种、承保方和保障期间的凭证，并按条款核对个人覆盖、通勤、宿舍及除外责任。', topics: ['insurance-covered', 'insurance', 'agreement'] },
      { id: 'incident', text: '已保存紧急负责人、学校老师和保险报案渠道，了解事故处理、就医与材料留存流程。', topics: ['insurance-covered', 'insurance', 'firstweek'] },
      { id: 'contacts', text: '已分清 HR、部门带教、财务和学校老师各自负责的问题，知道遇到差异先联系谁。', topics: ['ask-right-person', 'firstweek'] }
    ] },
    { title: '申请与结束', icon: 'award', items: [
      { id: 'resume', text: '简历如实写明学校专业、到岗时间、实习周期和个人经历，并准备岗位相关表达。', topics: ['resume'] },
      { id: 'records', text: '已确认学习记录、实习鉴定和证明由谁签章、何时提交；个人笔记不保存客人隐私。', topics: ['finish-certificate', 'firstweek', 'agreement'] },
      { id: 'checkout', text: '已问清末日排班、物品交还、退宿、最后结算与返程的先后顺序。', topics: ['finish-date', 'finish-checkout', 'dorm'] },
      { id: 'change', text: '已了解不适应、调整或提前结束实习时，如何与学校和酒店办理沟通、交接及结算。', topics: ['early-end', 'agreement', 'pay'] }
    ] }
  ];
  const checklist = checklistGroups.flatMap(group => group.items);
  const checkIds = checklist.map(item => item.id);
  const accountOwner = () => String(D()?.getAccount?.()?.id || '');
  const relatedChecks = article => checklist.filter(item => item.topics.includes(article.id));
  const emptyState = () => ({ read: [], saved: [], checks: [] });
  function normalizedState(value) {
    const keep = (values, allowed) => Array.isArray(values) ? [...new Set(values.filter(id => allowed.includes(id)))] : [];
    return { read: keep(value.read, ids), saved: keep(value.saved, ids), checks: keep(value.checks, checkIds) };
  }
  function getState() {
    const owner = accountOwner();
    if (state && stateOwner === owner) return state;
    stateOwner = owner;
    if (!owner) return (state = emptyState());
    // Older anonymous "academy" data has no reliable owner: leave it untouched
    // and never silently attach it to the next student who registers or logs in.
    const raw = D().read(`academy:v52:${encodeURIComponent(owner)}`, null);
    state = isObject(raw) && raw.version === 2 && raw.ownerId === owner ? normalizedState(raw) : emptyState();
    return state;
  }
  function persist(next, owner = accountOwner()) {
    if (!owner || accountOwner() !== owner) return false;
    const safe = normalizedState(next);
    if (D().save(`academy:v52:${encodeURIComponent(owner)}`, { version: 2, ownerId: owner, ...safe }) === false) return false;
    state = safe; stateOwner = owner;
    return true;
  }
  function withAccount(callback, expectedOwner = '') {
    const before = accountOwner();
    if (expectedOwner && expectedOwner !== before) {
      D().toast('账号已切换，请在当前账号下重新操作。');
      render();
      if (document.querySelector('#modal [data-academy-reader-view]')) document.querySelector('#modal')?.close();
      return;
    }
    return D().requireAccount(() => {
      const owner = accountOwner();
      if (!owner || (expectedOwner && owner !== expectedOwner)) return;
      if (!before) D().showView('academy');
      return callback(owner, !before);
    });
  }
  function checkCount() { return getState().checks.length; }
  function articleCheckCount(article) { return relatedChecks(article).filter(item => getState().checks.includes(item.id)).length; }
  function progressHTML() {
    if (!accountOwner()) return `<section class="academy-progress-card academy-progress-guest"><span class="academy-eyebrow">YOUR LITTLE STEPS</span><h2>我的准备进度</h2><div class="academy-progress-illustration">${icon('checklist')}</div><p>问题可以随时看。注册后，把读过的内容和问清的条件记下来。</p><div class="academy-progress-definition"><b>34 篇阅读记录 · 24 项自查</b><span>收藏方便回看，不计入准备进度。</span></div><button class="primary" data-academy-action="progress-login">注册 / 登录，开始记录 →</button><small>演示按学生账号在本机分别保存，不会自动同步到其他设备。</small></section>`;
    const current = getState();
    return `<section class="academy-progress-card"><span class="academy-eyebrow">YOUR LITTLE STEPS</span><h2>我的准备进度</h2><div class="academy-progress-number">${current.read.length}<span> / ${articles.length} 篇已读</span></div><progress max="${articles.length}" value="${current.read.length}" aria-label="百科阅读进度">${current.read.length}/${articles.length}</progress><p>阅读后手动标记；确认实际条件后再勾选自查。收藏方便回看，不计入进度。</p><div class="academy-progress-summary"><span>自查清单</span><strong>${checkCount()} / ${totalChecks()} 已核查</strong></div><button class="secondary" data-academy-action="checklist" data-academy-owner="${e(accountOwner())}">打开我的沟通清单 →</button><small>当前学生账号 · 本机保存。阅读与勾选不代表酒店承诺或学校审核。</small></section>`;
  }
  function matches(article) {
    const term = query.trim().toLocaleLowerCase();
    return (category === '全部' || displayCategory(article) === category) && (!collectionOnly || getState().saved.includes(article.id)) && (!term || [article.title, article.summary, article.intro, ...article.sections.map(section => section.text), ...article.checks].join(' ').toLocaleLowerCase().includes(term));
  }
  function articleCard(article) {
    const current = getState();
    return `<article class="academy-card"><div class="academy-card-top"><span class="academy-icon" aria-hidden="true">${icon(articleIcons[article.id])}</span><span class="academy-card-meta"><b>${e(articleMeta(article))}</b><small>${article.practical ? '实用问答' : '深读指南'} · ${article.minutes} 分钟</small></span><button class="academy-bookmark ${current.saved.includes(article.id) ? 'is-saved' : ''}" data-academy-action="save" data-academy-id="${e(article.id)}" data-academy-owner="${e(accountOwner())}" aria-label="${current.saved.includes(article.id) ? '取消收藏' : '收藏'}：${e(article.title)}" aria-pressed="${current.saved.includes(article.id)}">${current.saved.includes(article.id) ? '★' : '☆'}</button></div><h3><button data-academy-action="read" data-academy-id="${e(article.id)}">${e(article.title)}</button></h3><p>${e(article.summary)}</p><div class="academy-card-bottom"><span class="${current.read.includes(article.id) ? 'academy-read-state' : ''}">${accountOwner() ? `${current.read.includes(article.id) ? '✓ 已读' : '待阅读'} · ${articleCheckCount(article)}/${relatedChecks(article).length} 项已核查` : '随时阅读 · 登录后记录进度'}</span><button class="academy-link" data-academy-action="read" data-academy-id="${e(article.id)}">${article.practical ? '查看做法与追问' : '继续阅读'} ↗</button></div></article>`;
  }
  function renderResults() {
    const list = document.querySelector('#academy-results');
    if (!list) return;
    const visible = articles.filter(matches), pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(1, currentPage), pages);
    const offset = (currentPage - 1) * PAGE_SIZE, current = visible.slice(offset, offset + PAGE_SIZE);
    list.innerHTML = visible.length ? current.map(articleCard).join('') : `<div class="academy-empty"><span aria-hidden="true">${icon('search')}</span><h3>没有找到这类内容</h3><p>试试“住宿”“班次”或“保险”，也可以清除筛选。</p><button class="secondary" data-academy-action="reset">查看全部百科</button></div>`;
    document.querySelector('#academy-result-count').textContent = `${visible.length ? `${offset + 1}–${offset + current.length} / ` : ''}${visible.length} 个问题与指南${collectionOnly ? ' · 我的收藏' : ''}`;
    const pagination = document.querySelector('#academy-pagination');
    if (pagination) {
      pagination.hidden = pages <= 1;
      pagination.innerHTML = pages > 1 ? `<button class="secondary" data-academy-action="page" data-academy-page="${currentPage - 1}" aria-controls="academy-results" ${currentPage === 1 ? 'disabled' : ''}>← 上一页</button><span class="academy-page-position" aria-live="polite"><strong>第 ${currentPage} / ${pages} 页</strong><small>每页 ${PAGE_SIZE} 条 · 按自己的节奏看</small></span><button class="secondary" data-academy-action="page" data-academy-page="${currentPage + 1}" aria-controls="academy-results" ${currentPage === pages ? 'disabled' : ''}>下一页 →</button>` : '';
    }
  }
  function render() {
    const root = document.querySelector('#academy-view');
    if (!root || !D()) return;
    const current = getState();
    root.innerHTML = `<div class="academy-page"><header class="ft-header academy-header"><div><p class="academy-eyebrow">THE INTERNSHIP HANDBOOK</p><h1>实习百科</h1><p>从报到材料到离店盖章，把第一次实习的细节弄明白。</p></div><span class="academy-open-tag">无需账号 · 随时阅读</span></header><nav class="academy-path" aria-label="实习百科阅读路径">
      <button class="academy-path-card" data-view="brands"><span class="academy-path-icon">${icon('hotel')}</span><span class="academy-path-copy"><small>01 / 认识酒店</small><strong>酒店集团与品牌图鉴</strong><span>了解集团、品牌与服务风格</span></span><span class="academy-path-arrow" aria-hidden="true">↗</span></button>
      <button class="academy-path-card academy-path-current" data-academy-action="browse"><span class="academy-path-icon">${icon('book')}</span><span class="academy-path-copy"><small>02 / 读懂实习</small><strong>把日常问题问清楚</strong><span>24 个实践问答 · 10 篇指南</span></span><span class="academy-path-arrow" aria-hidden="true">↓</span></button>
      <button class="academy-path-card" data-view="library"><span class="academy-path-icon">${icon('document')}</span><span class="academy-path-copy"><small>03 / 实用材料</small><strong>规章文件与协议模板</strong><span>材料清单、参考表与下载</span></span><span class="academy-path-arrow" aria-hidden="true">↗</span></button>
    </nav>${accountOwner() ? `<div class="academy-return-progress"><span>我的准备：${current.read.length} 篇已读 · ${checkCount()} 项已核查</span><button class="text-button" data-academy-action="checklist" data-academy-owner="${e(accountOwner())}">继续准备 →</button></div>` : ''}<div class="academy-layout"><div class="academy-main"><section class="academy-feature"><div class="academy-feature-copy"><span class="academy-feature-tag">从真实报到问题出发</span><h2>行李怎么寄？<br>第一天去哪儿？</h2><p>先看通用做法，再把与你有关的条件带给酒店 HR。24 个具体问答，覆盖报到、住宿、津贴与结束手续。</p><button class="academy-feature-button" data-academy-action="read" data-academy-id="arrival-order">先看报到第一步 <span aria-hidden="true">↗</span></button></div><div class="academy-feature-art" aria-hidden="true"><div class="academy-feature-drawing">${icon('suitcase')}</div><span>准备妥当<br>安心出发</span></div></section><section class="academy-library" aria-labelledby="academy-library-title"><div class="academy-library-title"><h2 id="academy-library-title" tabindex="-1">读懂实习，从你的问题开始</h2><span id="academy-result-count" role="status" aria-live="polite"></span></div><label class="academy-search"><span aria-hidden="true">${icon('search')}</span><input id="academy-search" type="search" value="${e(query)}" maxlength="100" placeholder="搜索健康证、银行卡、快递、报销、盖章……" aria-label="搜索实习百科"></label><div class="academy-filters" aria-label="百科分类">${categories.map(item => `<button class="academy-chip ${category === item ? 'active' : ''}" aria-pressed="${category === item}" data-academy-action="category" data-academy-category="${e(item)}">${icon(categoryIcons[item])}<span>${e(item)}</span></button>`).join('')}<button class="academy-chip academy-saved-filter ${collectionOnly ? 'active' : ''}" aria-pressed="${collectionOnly}" data-academy-action="saved-filter" data-academy-owner="${e(accountOwner())}">☆ ${accountOwner() ? `已收藏 ${current.saved.length}` : '我的收藏'}</button></div><div class="academy-grid" id="academy-results"></div><nav class="academy-pagination" id="academy-pagination" aria-label="百科目录翻页" hidden></nav></section></div><aside class="academy-sidebar">${progressHTML()}<section class="academy-editor-note"><span aria-hidden="true">${icon('chat')}</span><h3>带着问题去面试</h3><p>百科先解答常见做法。房间人数、津贴金额、报销条件等，仍需向你投递的酒店确认；可把问题带入代投递沟通。</p><button class="academy-link" data-academy-action="jobs">看看有哪些实习机会 ↗</button></section></aside></div><p class="academy-footnote">参考用户提供的酒店实习 Q&A 提炼通用问题，未将单家酒店的金额、期限、材料要求作为行业统一标准。整理：${CHECKED_AT}。</p></div>`;
    renderResults();
  }
  function sourceHTML(article) {
    if (!article.sources) return '<p class="academy-editorial">酒旅之星实践问答 · 通用准备方法由编辑整理；具体金额、办理地点、材料及时间，以你所在学校和接收酒店的确认结果为准。</p>';
    return `<section class="academy-sources"><h3>官方原文与适用范围</h3>${article.sources.map(source => `<p><a href="${e(source.url)}" target="_blank" rel="noopener noreferrer">${e(source.title)} ↗</a><small>${e(source.date)} · 查阅：${CHECKED_AT}<br>${e(source.scope)}</small></p>`).join('')}<p class="academy-source-note">文中的沟通清单是编辑整理；政策说明以完整原文及适用条件为准，不构成对个人劳动关系、保险责任或赔付结果的认定。</p></section>`;
  }
  function checkHTML(items, articleId = '') {
    const current = getState();
    return items.map(item => `<label class="academy-check"><input type="checkbox" data-academy-check="${e(item.id)}" data-academy-id="${e(articleId)}" data-academy-owner="${e(accountOwner())}" ${current.checks.includes(item.id) ? 'checked' : ''}><span><small class="academy-check-number">${String(checkIds.indexOf(item.id) + 1).padStart(2, '0')}</small>${e(item.text)}</span></label>`).join('');
  }
  function readingNavigation(article) {
    const index = articles.indexOf(article), previous = articles[index - 1], next = articles[index + 1];
    const series = articles.filter(item => Boolean(item.practical) === Boolean(article.practical));
    const position = series.findIndex(item => item.id === article.id) + 1;
    return `<nav class="academy-reading-nav" aria-label="连续阅读"><div class="academy-reading-position"><b>${article.practical ? '实践问答' : '深读指南'} ${String(position).padStart(2, '0')} / ${series.length}</b><span>全部内容 ${index + 1} / ${articles.length}</span></div><div class="academy-reading-controls"><button class="secondary" ${previous ? `data-academy-action="read" data-academy-id="${e(previous.id)}" aria-label="${previous.practical ? '上一题' : '上一篇'}：${e(previous.title)}"` : 'disabled'}>← ${previous?.practical || article.practical ? '上一题' : '上一篇'}</button><button class="academy-directory" data-academy-action="directory">回到问题目录</button><button class="primary" ${next ? `data-academy-action="read" data-academy-id="${e(next.id)}" aria-label="${next.practical ? '下一题' : '下一篇'}：${e(next.title)}"` : 'disabled'}>${next ? next.practical ? '下一题 →' : article.practical ? '继续读指南 →' : '下一篇 →' : '已到最后一篇'}</button></div><p>${next ? `接下来：${e(next.title)}` : '已到最后一篇，可以回目录复习，或整理自己的沟通清单。'}</p></nav>`;
  }
  function readingContinuation(article) {
    const index = articles.indexOf(article), previous = articles[index - 1], next = articles[index + 1];
    return `<nav class="academy-reading-footer" aria-label="读完继续"><span class="academy-eyebrow">YOUR NEXT LITTLE STEP</span>${next ? `<button class="academy-next-article" data-academy-action="read" data-academy-id="${e(next.id)}" aria-label="继续阅读：${e(next.title)}"><span><small>${next.practical ? '下一题' : article.practical ? '接着读指南' : '下一篇'} · ${e(articleMeta(next))}</small><strong>${e(next.title)}</strong></span><span class="academy-next-arrow" aria-hidden="true">→</span></button>` : '<div class="academy-reading-finish"><strong>这是最后一篇。</strong><p>可以回到目录复习，再把还没问清的条件整理到自己的沟通清单。</p></div>'}<div class="academy-reading-footer-links">${previous ? `<button data-academy-action="read" data-academy-id="${e(previous.id)}" aria-label="回看：${e(previous.title)}">← 回看${previous.practical ? '上一题' : '上一篇'}</button>` : '<span></span>'}<button data-academy-action="directory">返回百科目录 →</button></div></nav>`;
  }
  function showArticle(id) {
    const article = articles.find(item => item.id === id);
    if (!article) return;
    const current = getState();
    D().modal(`<article class="academy-reader" data-academy-reader-view="article" data-academy-reader-id="${e(id)}">${readingNavigation(article)}<div class="academy-reader-heading"><span class="academy-icon">${icon(articleIcons[article.id])}</span><p class="academy-reader-meta">${e(articleMeta(article))}<br>约 ${article.minutes} 分钟 · ${CHECKED_AT} 整理</p></div><h2 id="modal-title">${e(article.title)}</h2><p class="academy-reader-intro">${e(article.intro)}</p>${article.sections.map((section, index) => `<section class="academy-reader-section"><h3><span>${String(index + 1).padStart(2, '0')}</span>${e(section.title)}</h3><p>${e(section.text)}</p></section>`).join('')}<aside class="academy-example"><strong>带去沟通的一句话</strong><p>${e(article.example)}</p></aside><section class="academy-hr-followup"><div><strong>这家酒店具体怎么安排？</strong><p>把这个问题带入投递沟通，向对应酒店 HR 确认。</p></div><button class="primary" data-academy-action="ask-hr" data-academy-id="${e(id)}">把这个问题带入投递 →</button></section><section class="academy-reader-checks"><h3>这篇关联的自查事项</h3><p>${accountOwner() ? '获得明确答复后再勾选。与24项沟通清单同步，不重复计数。' : '可以先看问题；勾选时需注册 / 登录，保存到自己的准备进度。'}</p>${checkHTML(relatedChecks(article), id)}</section>${sourceHTML(article)}<div class="academy-reader-actions"><button class="primary" data-academy-action="mark-read" data-academy-id="${e(id)}" data-academy-owner="${e(accountOwner())}">${current.read.includes(id) ? '✓ 已读 · 改为未读' : '标记这篇已读'}</button><button class="secondary" data-academy-action="save" data-academy-id="${e(id)}" data-academy-reader="true" data-academy-owner="${e(accountOwner())}" aria-pressed="${current.saved.includes(id)}">${current.saved.includes(id) ? '★ 已收藏' : '☆ 收藏文章'}</button></div><p class="academy-local-note">阅读无需账号 · 保存进度需学生账号 · 演示只在本机保存</p>${readingContinuation(article)}</article>`, 'INTERNSHIP HANDBOOK / 实习百科');
  }
  function showChecklist() {
    if (!accountOwner()) return withAccount(() => showChecklist());
    D().modal(`<div class="academy-reader" data-academy-reader-view="checklist"><h2 id="modal-title">我的实习沟通清单</h2><p class="academy-reader-intro">把重复的问题合并为 ${totalChecks()} 项。向酒店或学校问清楚后再勾选；需要回看的细节仍在原问答里。目前 <strong id="academy-modal-check-count">${checkCount()}</strong> / ${totalChecks()} 项已核查。</p><div class="academy-checklist-note">准备进度 = 手动标记的阅读记录 + 这份自查清单；收藏只为方便回看。</div>${checklistGroups.map((group, index) => `<section class="academy-check-group"><h3><span class="academy-icon">${icon(group.icon)}</span><span><small>自查 ${String(index + 1).padStart(2, '0')} / ${checklistGroups.length}</small>${e(group.title)}</span></h3>${checkHTML(group.items)}</section>`).join('')}<div class="academy-reader-actions"><button class="primary" data-academy-action="copy-checklist" data-academy-owner="${e(accountOwner())}">复制待核查事项</button><button class="secondary" data-academy-action="reset-checklist" data-academy-owner="${e(accountOwner())}">重置勾选</button></div><p class="academy-local-note">当前学生账号 · 本机保存。勾选不表示酒店已承诺或材料已审核。</p></div>`, 'ASK BEFORE YOU GO / 我的沟通清单');
  }
  async function copyChecklist() {
    const owner = accountOwner();
    if (!owner) return withAccount(() => copyChecklist());
    const current = getState(), remaining = checklistGroups.map(group => ({ title: group.title, items: group.items.filter(item => !current.checks.includes(item.id)) })).filter(group => group.items.length);
    const text = remaining.length ? `【酒旅之星 · 实习待核查事项】\n${remaining.map(group => `${group.title}\n${group.items.map(item => `□ ${item.text}`).join('\n')}`).join('\n\n')}\n\n以上为沟通指南，具体条件请向酒店和学校确认。` : `【酒旅之星】目前${totalChecks()}项沟通清单均已标记核查完成；该进度不代表酒店承诺或学校审核结果。`;
    try { await navigator.clipboard.writeText(text); if (accountOwner() === owner) D().toast('已复制待核查事项，可自行发给酒店或老师。'); }
    catch {
      if (accountOwner() !== owner) return;
      D().modal(`<div data-academy-reader-view="copy"><h2 id="modal-title">复制我的待核查事项</h2><p class="detail-subtitle">当前浏览器未提供直接复制权限，请选中下方文字复制。</p><textarea id="academy-copy-text" class="academy-copy-text" aria-label="待核查事项文字" readonly>${e(text)}</textarea></div>`, 'MY CHECKLIST / 沟通清单');
      const textarea = document.querySelector('#academy-copy-text');
      textarea?.focus(); textarea?.select();
    }
  }
  function askHR(id) {
    const article = articles.find(item => item.id === id);
    if (!article) return;
    const detail = { question: article.example, title: article.title, topicId: article.id, source: 'academy' };
    const event = new CustomEvent('jiulv:ask-hr', { detail, cancelable: true });
    if (!document.dispatchEvent(event)) return;
    D().save('academy-question', detail);
    D().modal(`<div class="academy-reader"><h2 id="modal-title">带给酒店 HR 的问题</h2><p class="academy-reader-intro">选择要投递的酒店时，可把这段问题附在沟通备注中。这里只准备问题，不会自动发送。</p><textarea class="academy-copy-text academy-question-text" readonly aria-label="给酒店HR的问题">${e(detail.question)}</textarea><div class="academy-reader-actions"><button class="primary" data-academy-action="jobs">选择酒店与岗位 →</button></div></div>`, 'ASK YOUR HOTEL / 酒店具体答复');
  }
  function focusDirectory() {
    const heading = document.querySelector('#academy-library-title');
    heading?.scrollIntoView({ behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    heading?.focus({ preventScroll: true });
  }
  function browseDirectory() {
    document.querySelector('#modal')?.close();
    D().showView('academy');
    focusDirectory();
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-academy-action]');
    if (!button || !D()) return;
    const action = button.dataset.academyAction, id = button.dataset.academyId, owner = button.dataset.academyOwner || '';
    if (action === 'read') showArticle(id);
    else if (action === 'ask-hr') askHR(id);
    else if (action === 'browse' || action === 'directory') browseDirectory();
    else if (action === 'page') {
      const requested = Number(button.dataset.academyPage), pages = Math.ceil(articles.filter(matches).length / PAGE_SIZE);
      if (!Number.isInteger(requested) || requested < 1 || requested > pages || requested === currentPage) return;
      currentPage = requested;
      renderResults(); focusDirectory();
    }
    else if (action === 'save' || action === 'mark-read') {
      if (!ids.includes(id)) return;
      const key = action === 'save' ? 'saved' : 'read', wanted = !getState()[key].includes(id);
      return withAccount((accountId, resumed) => {
        const current = getState();
        const values = wanted ? [...new Set([...current[key], id])] : current[key].filter(value => value !== id);
        if (!persist({ ...current, [key]: values }, accountId)) return;
        render();
        if (resumed || action === 'mark-read' || button.dataset.academyReader) showArticle(id);
        D().toast(action === 'save' ? (wanted ? '已收藏到当前账号' : '已取消收藏') : (wanted ? '已标记为已读' : '已改为未读'));
      }, owner);
    } else if (action === 'category') {
      if (!categories.includes(button.dataset.academyCategory)) return;
      category = button.dataset.academyCategory; currentPage = 1; render();
    } else if (action === 'saved-filter') return withAccount(() => { collectionOnly = !collectionOnly; currentPage = 1; render(); }, owner);
    else if (action === 'reset') { query = ''; category = '全部'; collectionOnly = false; currentPage = 1; render(); }
    else if (action === 'checklist' || action === 'progress-login') return withAccount(() => showChecklist(), owner);
    else if (action === 'copy-checklist') return withAccount(() => copyChecklist(), owner);
    else if (action === 'reset-checklist') return withAccount(accountId => {
      if (!persist({ ...getState(), checks: [] }, accountId)) return;
      render(); showChecklist(); D().toast('已重置自查清单，阅读记录与收藏保留。');
    }, owner);
    else if (action === 'jobs') { document.querySelector('#modal')?.close(); D().showView('jobs'); }
  });
  document.addEventListener('input', event => {
    if (event.target.id !== 'academy-search') return;
    query = event.target.value; currentPage = 1; renderResults();
  });
  document.addEventListener('change', event => {
    const input = event.target;
    if (!input.matches('[data-academy-check]') || !D()) return;
    const checkId = input.dataset.academyCheck, articleId = input.dataset.academyId, owner = input.dataset.academyOwner || '', wanted = input.checked;
    if (!checkIds.includes(checkId) || (articleId && !articles.some(article => article.id === articleId && relatedChecks(article).some(item => item.id === checkId)))) return;
    input.checked = getState().checks.includes(checkId);
    return withAccount((accountId, resumed) => {
      const current = getState(), values = wanted ? [...new Set([...current.checks, checkId])] : current.checks.filter(id => id !== checkId);
      if (!persist({ ...current, checks: values }, accountId)) return;
      input.checked = wanted;
      render();
      if (resumed) { if (articleId) showArticle(articleId); else showChecklist(); }
      const count = document.querySelector('#academy-modal-check-count');
      if (count) count.textContent = checkCount();
    }, owner);
  });
  document.addEventListener('jiulv:accountchange', () => {
    state = null; stateOwner = null; collectionOnly = false; currentPage = 1;
    const host = document.querySelector('#academy-view');
    if (host && !host.hidden) render();
    if (document.querySelector('#modal [data-academy-reader-view]')) {
      document.querySelector('#modal')?.close();
      const body = document.querySelector('#modal-body');
      if (body) body.innerHTML = '';
    }
  });
  function totalChecks() { return checklist.length; }
  window.JiulvFeatures = window.JiulvFeatures || {};
  window.JiulvFeatures.academy = { render, showArticle, askHR, getQuestions: () => practicalQuestions.map(({ id, title, category, example }) => ({ id, title, category, question: example })) };
})();
