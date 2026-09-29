const DUR = Object.freeze({
  "1h": 3600, "5h": 18000, "12h": 43200, "1d": 86400,
  "7d": 604800, "15d": 1296000, "30d": 2592000
});
const DAY = 86400;
const GRACE = 5 * DAY;
const ADMIN_BOOTSTRAP_HASH = "80cf7c0ff65bc1294e4698c4aea87a00738f2094b3b81a884cf642b36332520a"; // SHA-256("163512")

const GENRE_LABELS = {
  urban: ["通讯录", "世界书", "设置", "语音"],
  xianxia: ["传音玉简", "世界书", "设置", "语音"],
  wuxia: ["江湖名册", "世界书", "设置", "语音"],
  ancient: ["朝堂名录", "世界书", "设置", "语音"],
  alternate_history: ["人物志", "世界书", "设置", "语音"],
  primordial: ["封神榜", "世界书", "设置", "语音"],
  palace: ["宫人名册", "世界书", "设置", "语音"],
  campus: ["同学录", "世界书", "设置", "语音"],
  workplace: ["同事名录", "世界书", "设置", "语音"],
  entertainment: ["艺人名单", "世界书", "设置", "语音"],
  esports: ["战队名单", "世界书", "设置", "语音"],
  fantasy: ["通讯水晶", "世界书", "设置", "语音"],
  medieval: ["骑士名册", "世界书", "设置", "语音"],
  vampire: ["血族名录", "世界书", "设置", "语音"],
  norse: ["英灵名册", "世界书", "设置", "语音"],
  "sci-fi": ["联络终端", "世界书", "设置", "语音"],
  interstellar: ["星图通讯", "世界书", "设置", "语音"],
  cyberpunk: ["数据终端", "世界书", "设置", "语音"],
  apocalypse: ["幸存者名单", "世界书", "设置", "语音"],
  cthulhu: ["联络记录", "世界书", "设置", "语音"],
  infinite: ["副本联络", "世界书", "设置", "语音"],
  quick_transmigration: ["任务者名册", "世界书", "设置", "语音"],
  rebirth: ["故人录", "世界书", "设置", "语音"],
  supernatural: ["阴阳名册", "世界书", "设置", "语音"],
  mystery: ["侦探联络", "世界书", "设置", "语音"]
};

const SURNAMES = ["李","王","张","刘","陈","杨","赵","黄","周","吴","徐","孙","胡","朱","高","林","何","郭","马","罗","宋","郑","谢","韩","唐","冯","董","萧","程","曹","袁","邓","许","傅","沈","曾","彭","吕","苏","卢","蒋","蔡","贾","丁","魏","薛","叶","余","潘","杜","戴","夏","钟","汪","田","任","姜","范","方","石","姚","谭","廖","邹","熊","金","陆","郝","孔","白","崔","康","毛","邱","秦","江","史","顾","侯","邵","孟","龙","万","段","雷","钱","汤","尹","黎","易","常","武","乔","贺","赖","龚","文"];
const DOUBLE_SURNAMES = ["司马","上官","欧阳","司徒","独孤","慕容","纳兰","诸葛","夏侯","东方","皇甫","尉迟","公孙","令狐"];
const GIVEN = {
  eastern: ["凌","玄","清","尘","渊","宸","瑾","珩","玥","瑶","璃","霜","雪","墨","竹","吟","逍","遥","月","寒","剑","书","昭","仪","婉","容","琛","珏","瑄","璟","芷","兰","蕙","筠","笙","瑞","昌","世","承","景","若","云","风","雨","雷","电","星","辰","天","夜","无","忘","归","落","残","孤","鸿","雁","霜","露","烟","霞","晴","岚","岫","枫","梧","桐","柳","荷","莲","桃","樱","棠","梨","梅","兰","竹","菊"],
  modern: ["子","雨","欣","佳","思","明","志","建","晓","宇","皓","然","一","诺","梓","涵","怡","轩","浩","睿","嘉","婷","雪","文","国","海","强","磊","军","洋","勇","艳","杰","娟","涛","明","超","秀","英","华","慧","巧","美","娜","静","淑","惠","珠","翠","雅","芝","玉","萍","红","娥","芬","燕","彩","春","菊"],
  western: ["凯","伦","诺","维","琳","莎","蕾","克","斯","洛","伊","亚","伦","德","安","娜","丽","丝","特","凡","尼","尔","奥","拉","瑟","兰","温","格","莉","安","雅","典","娜","佛","雷"],
  scifi: ["星","舰","零","一","七","空","光","量","子","核","磁","波","频","谱","网","络","端","协","议","序","列","号","格","点","码","智","脑","芯","电","磁","力","场","维","度","跨","星","辰","宇","宙"],
  dark: ["铁","寒","厉","霜","夜","冥","刃","荒","骨","寂","默","岩","峰","峥","魇","蚀","噬","灭","劫","煞","冥","幽","玄","黄","焚","碎","裂","残","断","绝","荒","芜","寂","寥"]
};
const GENRE_GROUP = {
  xianxia:"eastern", wuxia:"eastern", ancient:"eastern", alternate_history:"eastern", primordial:"eastern", palace:"eastern",
  urban:"modern", campus:"modern", workplace:"modern", entertainment:"modern", esports:"modern",
  fantasy:"western", medieval:"western", vampire:"western", norse:"western",
  scifi:"scifi", interstellar:"scifi", cyberpunk:"scifi",
  apocalypse:"dark", cthulhu:"dark", infinite:"dark", quick_transmigration:"dark", rebirth:"dark", supernatural:"dark", mystery:"dark"
};
const IDENTITY_POOL = {
  eastern: ["弟子","长老","散修","侍卫","谋士","医者","刺客","书生","将军","商贾","官宦","宫女","掌门","护法","侠客","镖师","隐士","史官"],
  modern: ["学生","教师","医生","律师","职员","老板","艺人","主播","电竞选手","记者","警察","设计师","程序员","厨师","律师","店长"],
  western: ["骑士","法师","刺客","贵族","学者","吟游诗人","血族","狼人","祭司","佣兵","盗贼","领主"],
  scifi: ["军官","舰长","研究员","黑客","义体医生","记者","走私者","AI代理人","工程师","飞行员"],
  dark: ["幸存者","调查员","猎人","道士","警察","侦探","流浪汉","任务者","线人","法医"]
};
const FACTION_POOL = {
  eastern: ["宗门","朝廷","江湖盟","世家","中立","暗部","帮派","边塞"],
  modern: ["公司","学校","工作室","警局","独立","医院","媒体"],
  western: ["王国","魔法学院","教廷","血族氏族","狼族部落","独立","佣兵工会"],
  scifi: ["联邦","帝国","企业","叛军","独立","科研站"],
  dark: ["避难所","调查局","独立","神秘组织","警方","地下势力"]
};

function pickArr(arr, seed){ if(!arr.length) return ""; let n=0; for(const ch of String(seed)) n=(n*31+ch.charCodeAt(0))>>>0; return arr[n%arr.length]; }
function pickRandom(arr){ if(!arr.length) return ""; return arr[Math.floor(Math.random()*arr.length)]; }

function generateName(genre, seed){
  const group = GENRE_GROUP[genre] || "modern";
  const pool = GIVEN[group] || GIVEN.modern;
  const useDouble = Math.random() < 0.08;
  const surname = useDouble ? pickRandom(DOUBLE_SURNAMES) : pickRandom(SURNAMES);
  const len = 1 + Math.floor(Math.random()*2);
  let given = "";
  for(let i=0;i<len;i++) given += pickRandom(pool);
  return surname + given;
}

const WARM_PERSONALITIES = ["热情开朗","阳光乐天","仗义热忱","讨好型","温柔慢热","敏感共情"];
const COLD_PERSONALITIES = ["清冷内敛","孤僻疏离","阴郁敏感","悲观多虑","固执闷葫芦","独立寡言"];
function affinityForPersonality(personality){
  for(const p of WARM_PERSONALITIES) if(personality.includes(p)) return 5 + Math.floor(Math.random()*6);
  for(const p of COLD_PERSONALITIES) if(personality.includes(p)) return -3 - Math.floor(Math.random()*6);
  return Math.floor(Math.random()*7) - 2;
}

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","access-control-allow-origin":"*","access-control-allow-headers":"content-type, authorization","access-control-allow-methods":"GET,POST,PUT,DELETE,OPTIONS"}})}
const now=()=>Math.floor(Date.now()/1000);
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const safeJsonParse=(v,fallback)=>{try{return JSON.parse(v??"")}catch{return fallback}};
const contentText=v=>String(v??"").trim().slice(0,10000);
async function hash(value){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return [...new Uint8Array(d)].map(v=>v.toString(16).padStart(2,"0")).join("")}
async function hashMatches(value,expected){return !!expected&&(await hash(value))===expected}
function auth(req){return (req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"").trim()}
function randomToken(){return crypto.randomUUID()+"-"+crypto.randomUUID()}

async function ensureAdmin(env){
  const row=await env.DB.prepare("SELECT id FROM admin_settings WHERE id=1").first();
  if(!row){
    const passwordHash=env.ADMIN_PASSWORD?await hash(String(env.ADMIN_PASSWORD)):ADMIN_BOOTSTRAP_HASH;
    await env.DB.prepare("INSERT INTO admin_settings(id,password_hash,updated_at) VALUES(1,?,?)").bind(passwordHash,now()).run();
  }
}
async function adminLogin(env,code){
  const row=await env.DB.prepare("SELECT password_hash FROM admin_settings WHERE id=1").first();
  if(!row||!(await hashMatches(code,row.password_hash)))return null;
  const token=randomToken();
  await env.DB.prepare("INSERT INTO admin_sessions(token,expires_at) VALUES(?,?)").bind(token,now()+DAY).run();
  return token;
}
async function adminOK(env,req){const token=auth(req);if(!token)return false;const row=await env.DB.prepare("SELECT token FROM admin_sessions WHERE token=? AND expires_at>? LIMIT 1").bind(token,now()).first();return !!row}

function randomCode(){const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";const bytes=crypto.getRandomValues(new Uint8Array(18));const chars=[...bytes].map(b=>alphabet[b%alphabet.length]).join("");return `CARD-${chars.slice(0,6)}-${chars.slice(6,12)}-${chars.slice(12,18)}`}
function pick(list,seed){if(!list.length)return null;let n=0;for(const ch of String(seed))n=(n*31+ch.charCodeAt(0))>>>0;return list[n%list.length]}
async function enabledSeeds(env,category){const r=await env.DB.prepare("SELECT id,name,content FROM seeds WHERE category=? AND enabled=1 ORDER BY id").bind(category).all();return r.results||[]}
async function buildWorldSeed(env,code){
  const [genres,relations,plots,events]=await Promise.all([enabledSeeds(env,"genre"),enabledSeeds(env,"relationship"),enabledSeeds(env,"plot"),enabledSeeds(env,"event")]);
  const g=pick(genres,code),r=pick(relations,code+"r"),p=pick(plots,code+"p"),e=pick(events,code+"e");
  return {genre:g?.name||"fantasy",genreRule:g?.content||"世界拥有连续状态与因果反馈。",relationship:r?.name||"none",relationshipRule:r?.content||"关系由剧情与互动自然形成。",plot:p?.name||"adventure",plotRule:p?.content||"剧情根据玩家行动推进。",event:e?.content||"玩家首次行动会触发可追踪世界回应。"};
}

async function createWorld(env,card){
  const seed=await buildWorldSeed(env,card.code),t=now();
  const worldName=`世界-${card.code.slice(-4)}`;
  const background=`这是一个${seed.genre}世界。${seed.genreRule}关系模式：${seed.relationship}；剧情方向：${seed.plot}。${seed.plotRule}`;
  const rules="玩家行动会造成连续反应；角色只能知道符合其经历的信息；真实遭遇只能发生在世界剧情中；通讯录私聊不能制造现实遭遇；隐藏内容只有满足条件后显示；世界状态由因果链持续推进。";
  const power=seed.genre==="xianxia"?"炼气→筑基→金丹→元婴→化神→炼虚→合体→大乘（仅作世界规则参考）。":seed.genre==="wuxia"?"后天→先天→宗师→大宗师→传说（仅作世界规则参考）。":seed.genre==="fantasy"?"元素觉醒→初级法师→中级→高级→圣域→传奇（仅作世界规则参考）。":seed.genre==="interstellar"?"自然人→义体改造→基因强化→星舰指挥→星际公民（仅作世界规则参考）。":seed.genre==="cyberpunk"?"无改造→浅层义体→深层义体→神经接口→幽灵（仅作世界规则参考）。":`能力体系：${seed.genre}主题成长体系，强度由世界规则与剧情共同决定。`;
  const wr=await env.DB.prepare(`INSERT INTO worlds(card_id,name,genre,relationship_type,plot_type,background,world_rules,power_system,current_location,current_time,weather,player_state,hidden_state,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(card.id,worldName,seed.genre,seed.relationship,seed.plot,background,rules,power,"初始区域","第一天 08:00","晴",JSON.stringify({name:"玩家",stats:{},custom:{},actionCount:0}),JSON.stringify({stage:0,unlocked:[],lastEvent:null}),"active",t).run();
  const wid=wr.meta.last_row_id;
  const temp=await env.DB.prepare("SELECT * FROM character_templates ORDER BY id LIMIT 9").all();
  let rows;
  if(temp.results?.length){
    rows=temp.results;
  } else {
    const [outerSeeds,innerSeeds,flawSeeds]=await Promise.all([enabledSeeds(env,"personality_outer"),enabledSeeds(env,"personality_inner"),enabledSeeds(env,"personality_flaw")]);
    const group=GENRE_GROUP[seed.genre]||"modern";
    const idPool=IDENTITY_POOL[group]||IDENTITY_POOL.modern;
    const facPool=FACTION_POOL[group]||FACTION_POOL.modern;
    rows=[];
    for(let i=0;i<9;i++){
      const outer=pickRandom(outerSeeds)?.name||"沉稳";
      const inner=pickRandom(innerSeeds)?.name||"现实主义";
      const flaw=pickRandom(flawSeeds)?.name||"不善表达";
      const name=generateName(seed.genre,card.code+i);
      rows.push({
        name, sex: Math.random()<0.5?"男":"女", age: 18+Math.floor(Math.random()*20),
        identity: pickRandom(idPool), faction: pickRandom(facPool),
        personality: `表层${outer}；内核${inner}；缺陷：${flaw}。`,
        background: `出身于本世界的普通环境，因机缘与你产生交集。`,
        past: `有一段未向人提起的过往。`,
        goals: `在这个世界中找到自己的方向。`,
        initial_attitude: `初次见面，保持距离观察。`,
        story_arc: `与${name}的关系将随互动逐渐展开。`,
        hidden_secret: `${name}藏着一个与自身经历有关的秘密。`,
        clue_condition: `stage >= ${Math.min(5,i%5+1)}`,
        encounter_condition: `必须在世界剧情中自然遭遇${name}。`,
        chat_rules: `保持${outer}的性格边界，不泄露未解锁的秘密。`,
        voice_id: null,
        _affinity: affinityForPersonality(outer)
      });
    }
  }
  const characterSeeds=await enabledSeeds(env,"character");const ids=[];
  for(let i=0;i<9;i++){
    const c=rows[i%rows.length],cs=characterSeeds.length?characterSeeds[i%characterSeeds.length]:null;
    const bg=cs?`${c.background}\n\n角色种子补充：${cs.content}`:c.background;
    const initAffinity=Number(c._affinity||0);
    const ins=await env.DB.prepare(`INSERT INTO characters(world_id,name,sex,age,identity,faction,personality,background,past,goals,initial_attitude,affinity,encountered,contact,story_arc,hidden_secret,clue_condition,encounter_condition,chat_rules,voice_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(wid,c.name,c.sex,c.age,c.identity,c.faction,c.personality,bg,c.past||"",c.goals||"",c.initial_attitude||"初始观望。",initAffinity,0,0,c.story_arc||"主线支线交织。",c.hidden_secret||`与${c.name}过去有关的隐藏真相。`,c.clue_condition||`stage >= ${Math.min(5,i%5+1)}`,c.encounter_condition||`必须在世界剧情中自然遭遇${c.name}。`,c.chat_rules||"保持角色身份与已知信息边界。",c.voice_id||null).run();
    ids.push(ins.meta.last_row_id);
  }
  for(let i=0;i<ids.length-1;i++)await env.DB.prepare("INSERT INTO relationships(world_id,from_character_id,to_character_id,relation,strength) VALUES(?,?,?,?,?)").bind(wid,ids[i],ids[i+1],i%2?"互相利用":"同阵营/利益关联",50).run();
  await env.DB.batch([
    env.DB.prepare("INSERT INTO events(world_id,title,description,stage,trigger_condition,status) VALUES(?,?,?,?,?,?)").bind(wid,"第一次回应",seed.event,0,"玩家首次行动","unlocked"),
    env.DB.prepare("INSERT INTO events(world_id,title,description,stage,trigger_condition,status) VALUES(?,?,?,?,?,?)").bind(wid,"隐藏线索出现","世界中一条此前不可见的信息进入可调查阶段。",2,"阶段达到2","locked"),
    env.DB.prepare("INSERT INTO events(world_id,title,description,stage,trigger_condition,status) VALUES(?,?,?,?,?,?)").bind(wid,"关系转折","关键人物关系发生明显变化。",3,"关键人物好感达到条件或事件触发","locked")
  ]);
  await env.DB.batch([
    env.DB.prepare("INSERT INTO quests(world_id,title,description,quest_type,status,sort_order,created_at) VALUES(?,?,?,?,?,?,?)").bind(wid,"主线：揭开世界真相",`在${seed.genre}世界中找到核心秘密，理解这个世界的本质。与关键角色深入互动，收集足够线索。`,"main","active",0,t),
    env.DB.prepare("INSERT INTO quests(world_id,title,description,quest_type,status,sort_order,created_at) VALUES(?,?,?,?,?,?,?)").bind(wid,"支线：沉沦之夜","与至少一个角色堕入危险而禁忌的亲密关系（好感度达到60以上）。这条线将带你走向黑暗、占有欲与欲望交织的深渊。","side","active",1,t),
    env.DB.prepare("INSERT INTO quests(world_id,title,description,quest_type,status,sort_order,created_at) VALUES(?,?,?,?,?,?,?)").bind(wid,"支线：探索未知","解锁至少3条隐藏线索或世界书秘密，探索这个世界的深层规则。","side","active",2,t)
  ]);
  await env.DB.batch([
    env.DB.prepare("INSERT INTO worldbooks(world_id,category,title,content,hidden,unlock_condition,sort_order) VALUES(?,?,?,?,?,?,?)").bind(wid,"world","世界背景",background,0,null,1),
    env.DB.prepare("INSERT INTO worldbooks(world_id,category,title,content,hidden,unlock_condition,sort_order) VALUES(?,?,?,?,?,?,?)").bind(wid,"rules","世界规则",rules,0,null,2),
    env.DB.prepare("INSERT INTO worldbooks(world_id,category,title,content,hidden,unlock_condition,sort_order) VALUES(?,?,?,?,?,?,?)").bind(wid,"power","力量体系",power,0,null,3),
    env.DB.prepare("INSERT INTO worldbooks(world_id,category,title,content,hidden,unlock_condition,sort_order) VALUES(?,?,?,?,?,?,?)").bind(wid,"faction","主要势力",Array.from(new Set(rows.map(x=>x.faction))).join("、"),0,null,4),
    env.DB.prepare("INSERT INTO worldbooks(world_id,category,title,content,hidden,unlock_condition,sort_order) VALUES(?,?,?,?,?,?,?)").bind(wid,"event","当前事件",seed.event,0,null,5),
    env.DB.prepare("INSERT INTO worldbooks(world_id,category,title,content,hidden,unlock_condition,sort_order) VALUES(?,?,?,?,?,?,?)").bind(wid,"player","玩家自定义","尚未设置自定义内容。",0,null,6),
    env.DB.prepare("INSERT INTO worldbooks(world_id,category,title,content,hidden,unlock_condition,sort_order) VALUES(?,?,?,?,?,?,?)").bind(wid,"secret","隐藏线索Ⅰ","有一条与你初始区域有关的信息被刻意隐藏。",1,"stage >= 2",10),
    env.DB.prepare("INSERT INTO worldbooks(world_id,category,title,content,hidden,unlock_condition,sort_order) VALUES(?,?,?,?,?,?,?)").bind(wid,"secret","隐藏线索Ⅱ",`${rows[0]?.name||"关键角色"}的过去与主线存在交叉。`,1,`affinity:${ids[0]} >= 60`,11),
    env.DB.prepare("INSERT INTO worldbooks(world_id,category,title,content,hidden,unlock_condition,sort_order) VALUES(?,?,?,?,?,?,?)").bind(wid,"secret","隐藏线索Ⅲ","只有在关系转折事件发生后，这条信息才会出现。",1,"event:关系转折",12),
    env.DB.prepare("INSERT INTO player_settings(world_id,data,updated_at) VALUES(?,?,?)").bind(wid,JSON.stringify({plot:{autoAdvance:true,pace:"normal"},world:{genrePreference:seed.genre,relationship:seed.relationship,plot:seed.plot},appearance:{theme:"system"},voice:{enabled:true,autoRead:false,rate:1,pitch:1,volume:1},ai:{model:""},custom:{}}),t)
  ]);
  return wid;
}

async function destroyWorld(env,cardId){
  const card=await env.DB.prepare("SELECT id,code,world_id FROM cards WHERE id=?").bind(cardId).first();if(!card)return;
  await env.DB.prepare("INSERT OR IGNORE INTO retired_cards(code,retired_at) VALUES(?,?)").bind(card.code,now()).run();
  if(card.world_id)await env.DB.prepare("DELETE FROM worlds WHERE id=?").bind(card.world_id).run();
  await env.DB.prepare("DELETE FROM cards WHERE id=?").bind(cardId).run();
}

async function worldAccess(env,req,wid){
  const token=auth(req);if(!token)return {ok:false,status:401,error:"世界会话无效，请重新输入卡密"};
  const row=await env.DB.prepare(`SELECT w.*,c.id card_id,c.code,c.status card_status,c.expires_at,c.grace_until,ps.token session_token,ps.expires_at session_expires_at FROM player_sessions ps JOIN worlds w ON w.id=ps.world_id JOIN cards c ON c.id=w.card_id WHERE ps.token=? AND ps.world_id=? AND ps.expires_at>? AND w.status='active' LIMIT 1`).bind(token,wid,now()).first();
  if(!row)return {ok:false,status:401,error:"世界会话已失效，请重新输入卡密"};
  if(row.card_status!=="active")return {ok:false,status:403,error:"世界当前不可访问"};
  if(row.expires_at&&row.expires_at<=now())return {ok:false,status:410,error:"卡密已到期，请先使用同类型卡续期"};
  await env.DB.prepare("UPDATE player_sessions SET last_seen_at=? WHERE token=?").bind(now(),token).run();
  return {ok:true,world:row,token};
}
async function issuePlayerSession(env,card,wid){const token=randomToken();await env.DB.prepare("INSERT INTO player_sessions(token,card_id,world_id,expires_at,created_at,last_seen_at) VALUES(?,?,?,?,?,?)").bind(token,card.id,wid,now()+Math.max(DAY*7,Number(card.duration_seconds||DAY)+GRACE),now(),now()).run();return token}

async function cleanup(env){
  const t=now();
  const exp=await env.DB.prepare("SELECT id,expires_at,grace_until FROM cards WHERE status IN ('active','frozen') AND expires_at IS NOT NULL AND expires_at<=?").bind(t).all();
  for(const c of exp.results||[]){const deadline=Number(c.expires_at)+GRACE;if((c.grace_until&&Number(c.grace_until)<=t)||(!c.grace_until&&deadline<=t))await destroyWorld(env,c.id);else if(!c.grace_until)await env.DB.prepare("UPDATE cards SET grace_until=? WHERE id=?").bind(deadline,c.id).run()}
  await env.DB.prepare("DELETE FROM player_sessions WHERE expires_at<=?").bind(t).run();
  await env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at<=?").bind(t).run();
}

function labels(genre){return GENRE_LABELS[genre]||GENRE_LABELS.fantasy}
function parseJsonReply(raw){
  const text=String(raw||"").trim();
  const fence=text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);const candidate=fence?.[1]||text;
  try{return {data:JSON.parse(candidate),raw:text}}catch{}
  const m=candidate.match(/\{[\s\S]*\}$/);if(m)try{return {data:JSON.parse(m[0]),raw:text}}catch{}
  return {data:null,raw:text};
}

async function maybeAI(env,world,instruction,ai,context={}){
  const endpoint=String(ai?.endpoint||env.AI_ENDPOINT||"").trim();const apiKey=String(ai?.key||env.AI_API_KEY||"").trim();const model=String(ai?.model||env.AI_MODEL||"").trim();
  if(!endpoint||!model)return null;
  if(!/^https:\/\//i.test(endpoint))return {error:"AI API 地址必须使用 HTTPS。"};
  const system=`你是 CardWorld 的世界引擎，不是普通聊天机器人。你负责依据世界状态判断玩家行动造成的后果。\n严格规则：1) 只有真实发生于世界剧情的相遇才能把角色 encountered=true；2) 通讯/私聊绝不制造现实遭遇；3) 未满足条件的隐藏线索、秘密、世界书隐藏条目不可泄露；4) 角色只能知道符合自身经历和已解锁剧情的信息；5) 每次行动必须考虑因果、时间、地点、天气、事件阶段、人物关系与此前剧情；6) 不要重置世界，不要凭空新增角色；7) 输出严格 JSON，不要 Markdown。JSON 字段：narrative(string), primaryCharacterId(number|null), events([{title,status}]), encounters([{characterId,affinityDelta,location}]), affinityChanges([{characterId,delta}]), worldUpdates({current_location,current_time,weather,stage,player_state_patch}), unlockClues([string])。affinityChanges 只用于已经遭遇的角色；encounters 才能首次建立 encountered。\n当前服务端上下文：${JSON.stringify(context).slice(0,38000)}`;
  try{
    const res=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json",...(apiKey?{authorization:`Bearer ${apiKey}`}:{})},body:JSON.stringify({model,messages:[{role:"system",content:system},{role:"user",content:instruction}],temperature:0.85})});
    if(!res.ok)return {error:`AI API ${res.status}`};
    const data=await res.json();const raw=data?.choices?.[0]?.message?.content||data?.choices?.[0]?.text||data?.output_text||"";const parsed=parseJsonReply(raw);
    return parsed.data?{structured:parsed.data,text:String(parsed.data.narrative||""),raw:parsed.raw}:{text:String(raw)};
  }catch(e){return {error:e?.message||"AI API 请求失败"}}
}

async function getWorldContext(env,wid){
  const [w,c,r,e,m,s,wb]=await Promise.all([
    env.DB.prepare("SELECT * FROM worlds WHERE id=?").bind(wid).first(),
    env.DB.prepare("SELECT id,name,sex,age,identity,faction,personality,background,past,goals,initial_attitude,affinity,encountered,contact,story_arc,clue_condition,encounter_condition,chat_rules,voice_id,hidden_secret FROM characters WHERE world_id=? ORDER BY id").bind(wid).all(),
    env.DB.prepare("SELECT from_character_id,to_character_id,relation,strength FROM relationships WHERE world_id=? ORDER BY id").bind(wid).all(),
    env.DB.prepare("SELECT id,title,description,stage,status,trigger_condition FROM events WHERE world_id=? ORDER BY id").bind(wid).all(),
    env.DB.prepare("SELECT id,character_id,role,content,created_at FROM messages WHERE world_id=? AND channel='story' ORDER BY id DESC LIMIT 20").bind(wid).all(),
    env.DB.prepare("SELECT data FROM player_settings WHERE world_id=?").bind(wid).first(),
    env.DB.prepare("SELECT id,category,title,content,hidden,unlock_condition,sort_order FROM worldbooks WHERE world_id=? ORDER BY sort_order,id").bind(wid).all()
  ]);
  const state=safeJsonParse(w?.hidden_state,{stage:0,unlocked:[]});
  const entries=[];for(const x of wb.results||[]){if(!x.hidden||await canUnlockEntry(env,wid,x,state))entries.push(x)}
  const chars=[]; for(const x of c.results||[]){ const safe={...x}; if(!await canUnlockCondition(env,wid,x.clue_condition,state)) safe.hidden_secret=null; chars.push(safe); }
  return {world:w,playerSettings:safeJsonParse(s?.data,{}),characters:chars,relationships:r.results||[],events:e.results||[],recentMessages:(m.results||[]).reverse(),worldbook:entries,hiddenState:state};
}

async function upsertKnownCharacter(env,wid,cid){const c=await env.DB.prepare("SELECT id,name,identity,faction,personality,background,goals,affinity FROM characters WHERE id=? AND world_id=?").bind(cid,wid).first();if(!c)return;const title=`${c.name} · 已知人物`;const content=`身份：${c.identity}\n势力：${c.faction}\n性格：${c.personality}\n背景：${c.background}\n目标：${c.goals}\n当前好感：${c.affinity}`;const old=await env.DB.prepare("SELECT id FROM worldbooks WHERE world_id=? AND category='character' AND title=? LIMIT 1").bind(wid,title).first();if(old)await env.DB.prepare("UPDATE worldbooks SET content=?,hidden=0,unlock_condition=NULL WHERE id=?").bind(content,old.id).run();else await env.DB.prepare("INSERT INTO worldbooks(world_id,category,title,content,hidden,unlock_condition,sort_order) VALUES(?,?,?,?,?,?,?)").bind(wid,"character",title,content,0,null,20+Number(c.id)).run()}

async function canUnlockCondition(env,wid,cond,state){
  const cnd=String(cond||"").trim();const stage=Number(state?.stage||0);
  let m=cnd.match(/^stage\s*>=\s*(\d+)$/i);if(m)return stage>=Number(m[1]);
  m=cnd.match(/^affinity:(\d+)\s*>=\s*(\d+)$/i);if(m){const c=await env.DB.prepare("SELECT affinity FROM characters WHERE id=? AND world_id=?").bind(Number(m[1]),wid).first();return Number(c?.affinity||0)>=Number(m[2])}
  m=cnd.match(/^encounter:(\d+)$/i);if(m){const c=await env.DB.prepare("SELECT encountered FROM characters WHERE id=? AND world_id=?").bind(Number(m[1]),wid).first();return !!c?.encountered}
  m=cnd.match(/^event:(.+)$/i);if(m){const e=await env.DB.prepare("SELECT status FROM events WHERE world_id=? AND title=? LIMIT 1").bind(wid,m[1].trim()).first();return e?.status==="unlocked"||e?.status==="completed"}
  return false;
}
async function canUnlockEntry(env,wid,entry,state){return !entry.hidden || await canUnlockCondition(env,wid,entry.unlock_condition,state)}


async function applyWorldEngineResult(env,wid,w,structured){
  const result=structured&&typeof structured==="object"?structured:{};
  const currentState=safeJsonParse(w.hidden_state,{stage:0,unlocked:[]});
  const updates=result.worldUpdates&&typeof result.worldUpdates==="object"?result.worldUpdates:{};
  const chars=await env.DB.prepare("SELECT id,affinity,encountered,contact,name FROM characters WHERE world_id=?").bind(wid).all();const cmap=new Map((chars.results||[]).map(x=>[Number(x.id),x]));
  const encounters=Array.isArray(result.encounters)?result.encounters:[];const affinityChanges=Array.isArray(result.affinityChanges)?result.affinityChanges:[];
  const touched=[];const encounteredIds=new Set();
  for(const item of encounters){const cid=Number(item?.characterId);const c=cmap.get(cid);if(!c)continue;const loc=contentText(item?.location||w.current_location).slice(0,300);const delta=clamp(Number(item?.affinityDelta||0),-30,30);const next=clamp(Number(c.affinity||0)+delta,0,100);const contact=next>=30?1:0;await env.DB.prepare("UPDATE characters SET encountered=1,affinity=?,contact=? WHERE id=? AND world_id=?").bind(next,contact,cid,wid).run();await env.DB.prepare("INSERT INTO encounters(world_id,character_id,location,created_at) VALUES(?,?,?,?)").bind(wid,cid,loc,now()).run();await upsertKnownCharacter(env,wid,cid);encounteredIds.add(cid);touched.push({id:cid,name:c.name,affinity:next,encountered:true,contact:contact===1})}
  for(const item of affinityChanges){const cid=Number(item?.characterId),c=cmap.get(cid);if(!c||!c.encountered||encounteredIds.has(cid))continue;const delta=clamp(Number(item?.delta||0),-30,30);const next=clamp(Number(c.affinity||0)+delta,0,100);const contact=next>=30?1:0;await env.DB.prepare("UPDATE characters SET affinity=?,contact=? WHERE id=? AND world_id=?").bind(next,contact,cid,wid).run();await upsertKnownCharacter(env,wid,cid);touched.push({id:cid,name:c.name,affinity:next,encountered:true,contact:contact===1})}
  let stage=clamp(Number(updates.stage??currentState.stage??0),0,20);const userCount=await env.DB.prepare("SELECT COUNT(*) n FROM messages WHERE world_id=? AND channel='story' AND role='user'").bind(wid).first();stage=Math.max(stage,Math.floor(Number(userCount?.n||0)/3));
  const ps=safeJsonParse((await env.DB.prepare("SELECT player_state FROM worlds WHERE id=?").bind(wid).first())?.player_state,{name:"玩家",stats:{},custom:{}});const patch=updates.player_state_patch&&typeof updates.player_state_patch==="object"?updates.player_state_patch:{};for(const [k,v] of Object.entries(patch))ps[k]=v;ps.actionCount=Number(ps.actionCount||0)+1;ps.updatedAt=now();
  const h={...currentState,stage,lastEvent:Array.isArray(result.events)&&result.events[0]?.title||currentState.lastEvent||null,unlocked:Array.isArray(currentState.unlocked)?currentState.unlocked:[]};
  await env.DB.prepare("UPDATE worlds SET current_location=COALESCE(NULLIF(?,''),current_location),current_time=COALESCE(NULLIF(?,''),current_time),weather=COALESCE(NULLIF(?,''),weather),player_state=?,hidden_state=? WHERE id=?").bind(contentText(updates.current_location||w.current_location).slice(0,200),contentText(updates.current_time||w.current_time).slice(0,100),contentText(updates.weather||w.weather).slice(0,100),JSON.stringify(ps),JSON.stringify(h),wid).run();
  for(const ev of Array.isArray(result.events)?result.events:[]){const title=contentText(ev?.title).slice(0,200);if(!title)continue;const status=["locked","unlocked","completed"].includes(ev?.status)?ev.status:"unlocked";await env.DB.prepare("UPDATE events SET status=? WHERE world_id=? AND title=?").bind(status,wid,title).run()}
  await env.DB.prepare("UPDATE events SET status='unlocked' WHERE world_id=? AND stage<=? AND status='locked'").bind(wid,stage).run();
  const entries=await env.DB.prepare("SELECT id,hidden,unlock_condition FROM worldbooks WHERE world_id=?").bind(wid).all();for(const e of entries.results||[]){if(await canUnlockEntry(env,wid,e,h)&&!h.unlocked.includes(Number(e.id)))h.unlocked.push(Number(e.id))}
  await env.DB.prepare("UPDATE worlds SET hidden_state=? WHERE id=?").bind(JSON.stringify(h),wid).run();
  const custom=ps.custom&&typeof ps.custom==="object"?ps.custom:{};const customText=Object.entries(custom).map(([k,v])=>`${k}：${typeof v==="string"?v:JSON.stringify(v)}`).join("\n")||"尚未设置自定义内容。";await env.DB.prepare("UPDATE worldbooks SET content=? WHERE world_id=? AND category='player' AND title='玩家自定义'").bind(customText,wid).run();
  const questResult=await checkQuests(env,wid,h);
  return {state:h,touchedCharacters:touched,questUpdates:questResult};
}

async function checkQuests(env,wid,h){
  const quests=await env.DB.prepare("SELECT id,title,quest_type,status FROM quests WHERE world_id=? AND status='active'").bind(wid).all();
  const unlockedCount=(h.unlocked||[]).length;
  const maxAffinity=await env.DB.prepare("SELECT MAX(affinity) n FROM characters WHERE world_id=? AND encountered=1").bind(wid).first();
  const stage=Number(h.stage||0);
  const completed=[];
  for(const q of quests.results||[]){
    let done=false;
    if(q.quest_type==="main"&&stage>=5) done=true;
    if(q.quest_type==="side"&&q.sort_order===1&&Number(maxAffinity?.n||0)>=60) done=true;
    if(q.quest_type==="side"&&q.sort_order===2&&unlockedCount>=3) done=true;
    if(done){
      await env.DB.prepare("UPDATE quests SET status='completed',completed_at=? WHERE id=?").bind(now(),q.id).run();
      completed.push(q);
    }
  }
  if(completed.length===0) return {completed:[]};
  const remaining=await env.DB.prepare("SELECT COUNT(*) n FROM quests WHERE world_id=? AND status='active'").bind(wid).first();
  let permanentCard=null;
  if(Number(remaining?.n||0)===0){
    const card=await env.DB.prepare("SELECT * FROM cards WHERE world_id=?").bind(wid).first();
    if(card){
      const permCode=randomCode();
      await env.DB.prepare("INSERT INTO cards(code,duration_seconds,status,created_at,activated_at,expires_at,world_id) VALUES(?,?,?,?,?,?,?)").bind(permCode,DAY*36500,"unused",now(),null,null,wid).run();
      permanentCard=permCode;
      await env.DB.prepare("UPDATE quests SET reward_card=? WHERE world_id=? AND status='completed'").bind(permCode,wid).run();
    }
  }
  return {completed,permanentCard};
}

async function fallbackNarrative(env,wid,w,content){
  const recent=await env.DB.prepare("SELECT role,content FROM messages WHERE world_id=? AND channel='story' ORDER BY id DESC LIMIT 6").bind(wid).all();
  return `你的行动：${content}\n\n世界没有替你决定结果。${w.current_location}的环境开始出现细微变化，因果已经被记录下来。${(recent.results||[]).length?"此前发生过的事情仍会影响接下来的发展。":"你还没有遇到任何能够真正改变局势的人。"}`;
}

async function storyReply(env,w,content,ai){
  const context=await getWorldContext(env,w.id);
  const instruction=`玩家刚刚进行了以下行动/发言：\n${content}\n请根据当前世界状态继续剧情。只有当行动真正导致人物出现在同一场景并发生实际接触时，才放入 encounters。不要为了回复方便随机挑角色。`;
  const generated=await maybeAI(env,w,instruction,ai,context);
  if(generated?.structured)return generated;
  return {text:generated?.text||await fallbackNarrative(env,w.id,w,content),error:generated?.error||null};
}

export default {
  async fetch(req,env){
    if(req.method==="OPTIONS")return json({ok:true});
    const u=new URL(req.url),p=u.pathname,m=req.method;
    try{
      await ensureAdmin(env);
      if(p==="/api/auth/card"&&m==="POST"){
        const b=await req.json();const code=String(b.code||"").trim();if(!code)return json({error:"请输入卡密"},400);
        const adminToken=await adminLogin(env,code);if(adminToken)return json({admin:true,token:adminToken});
        const retired=await env.DB.prepare("SELECT code FROM retired_cards WHERE code=? LIMIT 1").bind(code).first();if(retired)return json({error:"该卡密已永久失效"},410);
        const card=await env.DB.prepare("SELECT * FROM cards WHERE code=? LIMIT 1").bind(code).first();if(!card||!["unused","active"].includes(card.status))return json({error:"卡密无效或已停用"},401);
        const t=now();if(card.expires_at&&Number(card.expires_at)<=t){const deadline=Number(card.expires_at)+GRACE;if((card.grace_until&&Number(card.grace_until)<=t)||(!card.grace_until&&deadline<=t)){await destroyWorld(env,card.id);return json({error:"卡密及世界已销毁"},410)}return json({error:"卡密已到期，请使用同类型卡续期",renewalRequired:true,duration_seconds:card.duration_seconds},410)}
        let wid=card.world_id;if(!wid){wid=await createWorld(env,card);await env.DB.prepare("UPDATE cards SET status='active',activated_at=?,expires_at=?,world_id=?,grace_until=NULL WHERE id=?").bind(t,t+card.duration_seconds,wid,card.id).run()}
        const fresh=await env.DB.prepare("SELECT * FROM cards WHERE id=?").bind(card.id).first();const genre=await env.DB.prepare("SELECT genre FROM worlds WHERE id=?").bind(wid).first();const session=await issuePlayerSession(env,fresh||card,wid);return json({worldId:wid,sessionToken:session,labels:labels(genre?.genre),expiresAt:fresh?.expires_at||t+card.duration_seconds});
      }
      if(p==="/api/card/renew"&&m==="POST"){
        const b=await req.json();const currentCode=String(b.currentCode||"").trim(),renewalCode=String(b.renewalCode||"").trim();const current=await env.DB.prepare("SELECT * FROM cards WHERE code=? LIMIT 1").bind(currentCode).first();const renewal=await env.DB.prepare("SELECT * FROM cards WHERE code=? LIMIT 1").bind(renewalCode).first();if(!current||!renewal)return json({error:"卡密不存在"},404);if(renewal.status!=="unused")return json({error:"续期卡已使用或不可用"},400);if(current.duration_seconds!==renewal.duration_seconds)return json({error:"续期卡类型必须与原卡完全相同"},400);if(!current.world_id)return json({error:"原卡尚未建立世界，请先激活原卡"},400);const t=now();if(current.expires_at&&Number(current.expires_at)+GRACE<=t){await destroyWorld(env,current.id);return json({error:"原卡已超过5天保留期，世界已销毁"},410)}const expires=Math.max(t,Number(current.expires_at||t))+Number(renewal.duration_seconds);await env.DB.batch([env.DB.prepare("UPDATE cards SET expires_at=?,grace_until=NULL,status='active',renewed_at=? WHERE id=?").bind(expires,t,current.id),env.DB.prepare("UPDATE cards SET status='used',activated_at=?,renewed_at=?,world_id=? WHERE id=?").bind(t,t,current.world_id,renewal.id,current.id)]);const session=await issuePlayerSession(env,{...current,expires_at:expires},current.world_id);return json({ok:true,worldId:current.world_id,sessionToken:session,expiresAt:expires});
      }
      if(p==="/api/world"&&m==="GET"){
        const wid=Number(u.searchParams.get("id"));const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);const w=a.world;const [chars,msgs,events,quests]=await Promise.all([env.DB.prepare("SELECT id,name,sex,age,identity,faction,personality,affinity,encountered,contact,voice_id FROM characters WHERE world_id=? ORDER BY id").bind(wid).all(),env.DB.prepare("SELECT id,character_id,role,content,created_at FROM messages WHERE world_id=? AND channel='story' ORDER BY id DESC LIMIT 100").bind(wid).all(),env.DB.prepare("SELECT id,title,description,stage,status FROM events WHERE world_id=? ORDER BY id").bind(wid).all(),env.DB.prepare("SELECT id,title,description,quest_type,status,sort_order,reward_card FROM quests WHERE world_id=? ORDER BY sort_order").bind(wid).all()]);return json({world:w,characters:chars.results||[],messages:(msgs.results||[]).reverse(),events:events.results||[],quests:quests.results||[],labels:labels(w.genre)});
      }
      if(p==="/api/ai/test"&&m==="POST"){const b=await req.json();const result=await maybeAI(env,{genre:"test",background:"连接测试",world_rules:"仅回复测试",power_system:"无",current_location:"测试",current_time:"现在",weather:"晴",id:0},"请返回 JSON：{\"narrative\":\"连接成功\",\"primaryCharacterId\":null,\"events\":[],\"encounters\":[],\"affinityChanges\":[],\"worldUpdates\":{},\"unlockClues\":[]}",b.ai||{},{});if(result?.structured||result?.text)return json({ok:true,reply:result.text||result.structured.narrative});return json({ok:false,error:result?.error||"连接失败"},400)}
      if(p==="/api/story/message"&&m==="POST"){
        const b=await req.json(),wid=Number(b.worldId),content=contentText(b.content);if(!wid||!content)return json({error:"内容不能为空"},400);const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);const w=a.world;await env.DB.prepare("INSERT INTO messages(world_id,channel,role,content,created_at) VALUES(?,?,?,?,?)").bind(wid,"story","user",content,now()).run();const generated=await storyReply(env,w,content,b.ai||null);const engine=generated.structured?await applyWorldEngineResult(env,wid,w,generated.structured):{state:safeJsonParse(w.hidden_state,{stage:0}),touchedCharacters:[],questUpdates:{completed:[],permanentCard:null}};const primary=Number(generated.structured?.primaryCharacterId||engine.touchedCharacters?.[0]?.id||0);await env.DB.prepare("INSERT INTO messages(world_id,character_id,channel,role,content,created_at) VALUES(?,?,?,?,?,?)").bind(wid,primary||null,"story","assistant",generated.text||"世界回应了你的行动。",now()).run();return json({reply:generated.text||"世界回应了你的行动。",character:engine.touchedCharacters?.find(c=>c.id===primary)||engine.touchedCharacters?.[0]||null,hiddenState:engine.state,questUpdates:engine.questUpdates||{completed:[],permanentCard:null},aiError:generated.error||null});
      }
      if(p==="/api/contacts"&&m==="GET"){const wid=Number(u.searchParams.get("worldId"));const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);const r=await env.DB.prepare("SELECT id,name,sex,age,identity,faction,personality,affinity,voice_id FROM characters WHERE world_id=? AND contact=1 AND affinity>=30 AND encountered=1 ORDER BY affinity DESC").bind(wid).all();return json({contacts:r.results||[]})}
      if(p==="/api/contact/messages"&&m==="GET"){const wid=Number(u.searchParams.get("worldId")),cid=Number(u.searchParams.get("characterId"));const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);const c=await env.DB.prepare("SELECT id,name FROM characters WHERE id=? AND world_id=? AND contact=1 AND affinity>=30 AND encountered=1").bind(cid,wid).first();if(!c)return json({error:"该角色尚未进入通讯录"},400);const r=await env.DB.prepare("SELECT id,role,content,created_at FROM messages WHERE world_id=? AND character_id=? AND channel='contact' ORDER BY id DESC LIMIT 100").bind(wid,cid).all();return json({messages:(r.results||[]).reverse()})}
      if(p==="/api/contact/message"&&m==="POST"){
        const b=await req.json(),wid=Number(b.worldId),cid=Number(b.characterId),content=contentText(b.content);if(!content)return json({error:"消息不能为空"},400);const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);const c=await env.DB.prepare("SELECT * FROM characters WHERE id=? AND world_id=? AND contact=1 AND affinity>=30 AND encountered=1").bind(cid,wid).first();if(!c)return json({error:"该角色尚未进入通讯录"},400);await env.DB.prepare("INSERT INTO messages(world_id,character_id,channel,role,content,created_at) VALUES(?,?,?,?,?,?)").bind(wid,cid,"contact","user",content,now()).run();const world=await env.DB.prepare("SELECT * FROM worlds WHERE id=?").bind(wid).first();const prior=await env.DB.prepare("SELECT role,content FROM messages WHERE world_id=? AND character_id=? AND channel='contact' ORDER BY id DESC LIMIT 16").bind(wid,cid).all();const data=await getWorldContext(env,wid);const generated=await maybeAI(env,world,`你现在是角色“${c.name}”，只根据真实世界经历和角色自身已知信息回应玩家私聊。私聊不能改变现实遭遇。玩家消息：${content}`,b.ai||null,{...data,contactCharacter:c,recentContact:(prior.results||[]).reverse()});const reply=generated?.text||`【${c.name}】我记得我们在世界里经历过的事情。`;await env.DB.prepare("INSERT INTO messages(world_id,character_id,channel,role,content,created_at) VALUES(?,?,?,?,?,?)").bind(wid,cid,"contact","assistant",reply,now()).run();if(generated?.structured){const ac=Array.isArray(generated.structured.affinityChanges)?generated.structured.affinityChanges.find(x=>Number(x.characterId)===cid):null;if(ac){const next=clamp(Number(c.affinity||0)+clamp(Number(ac.delta||0),-20,20),0,100);await env.DB.prepare("UPDATE characters SET affinity=?,contact=? WHERE id=? AND world_id=?").bind(next,next>=30?1:0,cid,wid).run()}}return json({reply,contact:{id:cid,name:c.name,affinity:Number((await env.DB.prepare("SELECT affinity FROM characters WHERE id=?").bind(cid).first())?.affinity||0)}})
      }
      if(p==="/api/character"&&m==="GET"){const wid=Number(u.searchParams.get("worldId")),cid=Number(u.searchParams.get("characterId"));const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);const c=await env.DB.prepare("SELECT * FROM characters WHERE id=? AND world_id=?").bind(cid,wid).first();if(!c)return json({error:"角色不存在"},404);const state=safeJsonParse((await env.DB.prepare("SELECT hidden_state FROM worlds WHERE id=?").bind(wid).first())?.hidden_state,{stage:0});const revealed=!!c.encountered&&await canUnlockCondition(env,wid,c.clue_condition,state);return json({character:{id:c.id,name:c.name,sex:c.sex,age:c.age,identity:c.identity,faction:c.faction,personality:c.personality,background:c.background, past:c.encountered?c.past:null,goals:c.goals,initial_attitude:c.initial_attitude,affinity:c.affinity,encountered:!!c.encountered,contact:!!c.contact,story_arc:c.story_arc,hidden_secret:revealed?c.hidden_secret:null,clue_condition:c.clue_condition,encounter_condition:c.encounter_condition,chat_rules:c.chat_rules,voice_id:c.voice_id},hiddenUnlocked:revealed})}
      if(p==="/api/worldbook"&&m==="GET"){const wid=Number(u.searchParams.get("worldId"));const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);const w=a.world,state=safeJsonParse(w.hidden_state,{stage:0,unlocked:[]}),entries=await env.DB.prepare("SELECT id,category,title,content,hidden,unlock_condition,sort_order FROM worldbooks WHERE world_id=? ORDER BY sort_order,id").bind(wid).all(),visible=[];for(const e of entries.results||[]){if(await canUnlockEntry(env,wid,e,state))visible.push(e)}return json({world:w,entries:visible,stage:state.stage||0,unlocked:state.unlocked||[]})}
      if(p==="/api/settings"&&(m==="GET"||m==="POST")){const body=m==="POST"?await req.json():null,wid=Number(u.searchParams.get("worldId")||body?.worldId);if(!wid)return json({error:"worldId 缺失"},400);const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);if(m==="GET"){const r=await env.DB.prepare("SELECT data FROM player_settings WHERE world_id=?").bind(wid).first();return json({data:safeJsonParse(r?.data,{})})}const old=safeJsonParse((await env.DB.prepare("SELECT data FROM player_settings WHERE world_id=?").bind(wid).first())?.data,{}),incoming=body?.data||{};const merged={...old,...incoming,plot:{...(old.plot||{}),...(incoming.plot||{})},world:{...(old.world||{}),...(incoming.world||{})},voice:{...(old.voice||{}),...(incoming.voice||{})},custom:{...(old.custom||{}),...(incoming.custom||{})}};await env.DB.prepare("UPDATE player_settings SET data=?,updated_at=? WHERE world_id=?").bind(JSON.stringify(merged),now(),wid).run();if(incoming.custom){const text=Object.entries(merged.custom||{}).map(([k,v])=>`${k}：${typeof v==="string"?v:JSON.stringify(v)}`).join("\n")||"尚未设置自定义内容。";await env.DB.prepare("UPDATE worldbooks SET content=? WHERE world_id=? AND category='player' AND title='玩家自定义'").bind(text,wid).run()}return json({ok:true,data:merged})}

      if(p.startsWith("/api/admin/")&&!(await adminOK(env,req)))return json({error:"管理员认证失败"},401);
      if(p==="/api/admin/cards"&&m==="GET"){const q=String(u.searchParams.get("q")||"").trim();const r=q?await env.DB.prepare("SELECT * FROM cards WHERE code LIKE ? ORDER BY id DESC").bind(`%${q}%`).all():await env.DB.prepare("SELECT * FROM cards ORDER BY id DESC").all();return json({cards:r.results||[],types:Object.keys(DUR)})}
      if(p==="/api/admin/cards"&&m==="POST"){const b=await req.json(),type=String(b.duration||""),duration=DUR[type],count=clamp(Number(b.count||1),1,200);if(!duration)return json({error:"无效卡类型"},400);const created=[];for(let i=0;i<count;i++){let code;do{code=randomCode()}while(await env.DB.prepare("SELECT 1 FROM cards WHERE code=? UNION ALL SELECT 1 FROM retired_cards WHERE code=? LIMIT 1").bind(code,code).first());await env.DB.prepare("INSERT INTO cards(code,duration_seconds,status,created_at) VALUES(?,?,?,?)").bind(code,duration,"unused",now()).run();created.push({code,duration:type})}return json({ok:true,cards:created})}
      if(p==="/api/admin/cards/status"&&m==="POST"){const b=await req.json(),card=await env.DB.prepare("SELECT * FROM cards WHERE id=?").bind(Number(b.cardId)).first();if(!card)return json({error:"卡密不存在"},404);let status=String(b.status||"");if(status==="unfreeze")status=card.activated_at?"active":"unused";if(!["unused","active","frozen"].includes(status))return json({error:"状态无效"},400);await env.DB.prepare("UPDATE cards SET status=? WHERE id=?").bind(status,card.id).run();return json({ok:true,status})}
      if(p==="/api/admin/cards/revoke"&&m==="POST"){const b=await req.json();const card=await env.DB.prepare("SELECT * FROM cards WHERE id=?").bind(Number(b.cardId)).first();if(!card)return json({error:"卡密不存在"},404);await destroyWorld(env,card.id);return json({ok:true})}
      if(p==="/api/admin/cards/renew"&&m==="POST"){const b=await req.json();const current=await env.DB.prepare("SELECT * FROM cards WHERE code=?").bind(String(b.currentCode||"").trim()).first();const renewal=await env.DB.prepare("SELECT * FROM cards WHERE code=?").bind(String(b.renewalCode||"").trim()).first();if(!current||!renewal)return json({error:"卡密不存在"},404);if(current.duration_seconds!==renewal.duration_seconds)return json({error:"必须同类型续期"},400);if(renewal.status!=="unused")return json({error:"续期卡不可用"},400);if(!current.world_id)return json({error:"原卡没有世界"},400);const t=now();if(current.expires_at&&Number(current.expires_at)+GRACE<=t){await destroyWorld(env,current.id);return json({error:"原卡已超过5天保留期"},410)}const expires=Math.max(t,Number(current.expires_at||t))+Number(current.duration_seconds);await env.DB.batch([env.DB.prepare("UPDATE cards SET expires_at=?,grace_until=NULL,status='active',renewed_at=? WHERE id=?").bind(expires,t,current.id),env.DB.prepare("UPDATE cards SET status='used',activated_at=?,renewed_at=?,world_id=? WHERE id=?").bind(t,t,current.world_id,renewal.id)]);return json({ok:true,expiresAt:expires})}
      if(p==="/api/admin/worlds"&&m==="GET"){const r=await env.DB.prepare(`SELECT w.id,w.name,w.genre,w.relationship_type,w.plot_type,w.current_location,w.current_time,w.status,w.created_at,c.code,c.status card_status,c.expires_at,c.grace_until FROM worlds w LEFT JOIN cards c ON c.world_id=w.id ORDER BY w.id DESC`).all();return json({worlds:r.results||[]})}
      if(p==="/api/admin/worlds/detail"&&m==="GET"){const wid=Number(u.searchParams.get("id"));const w=await env.DB.prepare("SELECT * FROM worlds WHERE id=?").bind(wid).first();if(!w)return json({error:"世界不存在"},404);const [chars,entries,events,rels]=await Promise.all([env.DB.prepare("SELECT * FROM characters WHERE world_id=? ORDER BY id").bind(wid).all(),env.DB.prepare("SELECT * FROM worldbooks WHERE world_id=? ORDER BY sort_order,id").bind(wid).all(),env.DB.prepare("SELECT * FROM events WHERE world_id=? ORDER BY id").bind(wid).all(),env.DB.prepare("SELECT * FROM relationships WHERE world_id=? ORDER BY id").bind(wid).all()]);return json({world:w,characters:chars.results||[],worldbooks:entries.results||[],events:events.results||[],relationships:rels.results||[]})}
      if(p==="/api/admin/worlds/status"&&m==="POST"){const b=await req.json();const status=["active","paused","archived"].includes(b.status)?b.status:"paused";await env.DB.prepare("UPDATE worlds SET status=? WHERE id=?").bind(status,Number(b.worldId)).run();return json({ok:true})}
      if(p==="/api/admin/worlds/delete"&&m==="POST"){const b=await req.json();const w=await env.DB.prepare("SELECT card_id FROM worlds WHERE id=?").bind(Number(b.worldId)).first();if(w?.card_id)await destroyWorld(env,Number(w.card_id));else await env.DB.prepare("DELETE FROM worlds WHERE id=?").bind(Number(b.worldId)).run();return json({ok:true})}
      if(p==="/api/admin/seeds"&&m==="GET"){const r=await env.DB.prepare("SELECT * FROM seeds ORDER BY category,id DESC").all();return json({seeds:r.results||[]})}
      if(p==="/api/admin/seeds"&&(m==="POST"||m==="PUT")){const b=await req.json();if(m==="POST")await env.DB.prepare("INSERT INTO seeds(category,name,content,enabled,created_at) VALUES(?,?,?,?,?)").bind(b.category,b.name,b.content,Number(b.enabled??1),now()).run();else await env.DB.prepare("UPDATE seeds SET category=?,name=?,content=?,enabled=? WHERE id=?").bind(b.category,b.name,b.content,Number(b.enabled??1),Number(b.id)).run();return json({ok:true})}
      if(p==="/api/admin/seeds"&&m==="DELETE"){await env.DB.prepare("DELETE FROM seeds WHERE id=?").bind(Number(u.searchParams.get("id"))).run();return json({ok:true})}
      if(p==="/api/admin/templates"&&m==="GET"){const r=await env.DB.prepare("SELECT * FROM character_templates ORDER BY id DESC").all();return json({templates:r.results||[]})}
      if(p==="/api/admin/templates"&&(m==="POST"||m==="PUT")){const b=await req.json();if(m==="POST")await env.DB.prepare(`INSERT INTO character_templates(name,sex,age,identity,faction,personality,background,past,goals,initial_attitude,story_arc,hidden_secret,clue_condition,encounter_condition,chat_rules,voice_id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(b.name,b.sex,Number(b.age||0),b.identity,b.faction,b.personality,b.background,b.past,b.goals,b.initial_attitude,b.story_arc,b.hidden_secret,b.clue_condition,b.encounter_condition,b.chat_rules,b.voice_id||null,now()).run();else await env.DB.prepare(`UPDATE character_templates SET name=?,sex=?,age=?,identity=?,faction=?,personality=?,background=?,past=?,goals=?,initial_attitude=?,story_arc=?,hidden_secret=?,clue_condition=?,encounter_condition=?,chat_rules=?,voice_id=? WHERE id=?`).bind(b.name,b.sex,Number(b.age||0),b.identity,b.faction,b.personality,b.background,b.past,b.goals,b.initial_attitude,b.story_arc,b.hidden_secret,b.clue_condition,b.encounter_condition,b.chat_rules,b.voice_id||null,Number(b.id)).run();return json({ok:true})}
      if(p==="/api/admin/templates"&&m==="DELETE"){await env.DB.prepare("DELETE FROM character_templates WHERE id=?").bind(Number(u.searchParams.get("id"))).run();return json({ok:true})}
      if(p==="/api/admin/worldbooks"&&m==="GET"){const wid=Number(u.searchParams.get("worldId"));const r=await env.DB.prepare("SELECT * FROM worldbooks WHERE world_id=? ORDER BY sort_order,id").bind(wid).all();return json({worldbooks:r.results||[]})}
      if(p==="/api/admin/worldbooks"&&(m==="POST"||m==="PUT")){const b=await req.json();if(m==="POST")await env.DB.prepare("INSERT INTO worldbooks(world_id,category,title,content,hidden,unlock_condition,sort_order) VALUES(?,?,?,?,?,?,?)").bind(Number(b.worldId),b.category,b.title,b.content,Number(b.hidden||0),b.unlock_condition||null,Number(b.sort_order||0)).run();else await env.DB.prepare("UPDATE worldbooks SET category=?,title=?,content=?,hidden=?,unlock_condition=?,sort_order=? WHERE id=?").bind(b.category,b.title,b.content,Number(b.hidden||0),b.unlock_condition||null,Number(b.sort_order||0),Number(b.id)).run();return json({ok:true})}
      if(p==="/api/admin/worldbooks"&&m==="DELETE"){await env.DB.prepare("DELETE FROM worldbooks WHERE id=?").bind(Number(u.searchParams.get("id"))).run();return json({ok:true})}
      if(p==="/api/admin/security/password"&&m==="POST"){const b=await req.json(),row=await env.DB.prepare("SELECT password_hash FROM admin_settings WHERE id=1").first();if(!(await hashMatches(String(b.current||""),row?.password_hash)))return json({error:"当前密码错误"},400);if(String(b.next||"").length<6)return json({error:"新密码至少6位"},400);await env.DB.prepare("UPDATE admin_settings SET password_hash=?,updated_at=? WHERE id=1").bind(await hash(String(b.next)),now()).run();await env.DB.prepare("DELETE FROM admin_sessions WHERE token=?").bind(auth(req)).run();return json({ok:true})}
      if(p==="/api/admin/dashboard"&&m==="GET"){const [cards,active,worlds,chars,enc]=await Promise.all([env.DB.prepare("SELECT COUNT(*) n FROM cards").first(),env.DB.prepare("SELECT COUNT(*) n FROM cards WHERE status='active'").first(),env.DB.prepare("SELECT COUNT(*) n FROM worlds WHERE status='active'").first(),env.DB.prepare("SELECT COUNT(*) n FROM characters").first(),env.DB.prepare("SELECT COUNT(*) n FROM encounters").first()]);return json({cards:Number(cards?.n||0),activeCards:Number(active?.n||0),worlds:Number(worlds?.n||0),characters:Number(chars?.n||0),encounters:Number(enc?.n||0)})}
      if(p==="/api/admin/cleanup"&&m==="POST"){await cleanup(env);return json({ok:true})}
      return p.startsWith("/api/")?json({error:"Not found"},404):env.ASSETS.fetch(req);
    }catch(e){console.error(e);return p.startsWith("/api/")?json({error:e?.message||String(e)},500):new Response("Internal Server Error",{status:500})}
  },
  async scheduled(event,env,ctx){ctx.waitUntil(cleanup(env))}
};
