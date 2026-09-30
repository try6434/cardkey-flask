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
  const worldName=geoNameForGenre(seed.genre);
  const background=await makePrologue(env,seed,worldName);
  const rules="玩家行动会造成连续反应；角色只能知道符合其经历的信息；真实遭遇只能发生在世界剧情中；通讯录私聊不能制造现实遭遇；隐藏内容只有满足条件后显示；世界状态由因果链持续推进。";
  const power=seed.genre==="xianxia"?"炼气→筑基→金丹→元婴→化神→炼虚→合体→大乘（仅作世界规则参考）。":seed.genre==="wuxia"?"后天→先天→宗师→大宗师→传说（仅作世界规则参考）。":seed.genre==="fantasy"?"元素觉醒→初级法师→中级→高级→圣域→传奇（仅作世界规则参考）。":seed.genre==="interstellar"?"自然人→义体改造→基因强化→星舰指挥→星际公民（仅作世界规则参考）。":seed.genre==="cyberpunk"?"无改造→浅层义体→深层义体→神经接口→幽灵（仅作世界规则参考）。":`能力体系：${seed.genre}主题成长体系，强度由世界规则与剧情共同决定。`;
  const group=GENRE_GROUP[seed.genre]||"modern";
  const transmigrationWeight={eastern:0.65,modern:0.55,western:0.4,scifi:0.5,dark:0.25};
  const entryMode=Math.random()<(transmigrationWeight[group]||0.5)?"transmigration":"native";
  const hasSystem=entryMode==="transmigration"&&Math.random()<0.5;
  const wr=await env.DB.prepare(`INSERT INTO worlds(card_id,name,genre,relationship_type,plot_type,background,world_rules,power_system,current_location,current_time,weather,player_state,hidden_state,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(card.id,worldName,seed.genre,seed.relationship,seed.plot,background,rules,power,"初始区域","第一天 08:00","晴",JSON.stringify({name:"玩家",stats:{},custom:{},actionCount:0,currency:100,inventory:[]}),JSON.stringify({stage:0,unlocked:[],lastEvent:null,entryMode,hasSystem}),"active",t).run();
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
    const ins=await env.DB.prepare(`INSERT INTO characters(world_id,name,sex,age,identity,faction,personality,background,past,goals,initial_attitude,affinity,hostility,encountered,contact,story_arc,hidden_secret,clue_condition,encounter_condition,chat_rules,voice_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(wid,c.name,c.sex,c.age,c.identity,c.faction,c.personality,bg,c.past||"",c.goals||"",c.initial_attitude||"初始观望。",initAffinity,0,0,0,c.story_arc||"主线支线交织。",c.hidden_secret||`与${c.name}过去有关的隐藏真相。`,c.clue_condition||`stage >= ${Math.min(5,i%5+1)}`,c.encounter_condition||`必须在世界剧情中自然遭遇${c.name}。`,c.chat_rules||"保持角色身份与已知信息边界。",c.voice_id||null).run();
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
    env.DB.prepare("INSERT INTO quests(world_id,title,description,quest_type,status,sort_order,created_at) VALUES(?,?,?,?,?,?,?)").bind(wid,"支线：沉沦之夜","与至少一个角色同时达到极度爱恋（好感≥90）和极度敌意（负面≥90），堕入爱恨交织的黑暗深渊。","side","active",1,t),
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

const GENRE_NAMES={xianxia:"仙侠",wuxia:"武侠",ancient:"古代",alternate_history:"架空历史",primordial:"洪荒",palace:"宫廷",urban:"都市",campus:"校园",workplace:"职场",entertainment:"娱乐圈",esports:"电竞",fantasy:"西方奇幻",medieval:"中世纪",vampire:"血族",norse:"北欧神话","sci-fi":"近未来",interstellar:"星际",cyberpunk:"赛博朋克",apocalypse:"末日",cthulhu:"克苏鲁",infinite:"无限流",quick_transmigration:"快穿",rebirth:"重生",supernatural:"灵异",mystery:"悬疑",historical:"真实历史",time_travel:"穿越",villain:"反派视角",system:"系统流",infinite_dungeon:"无限副本",vampire_noble:"血族贵族",witch:"女巫猎人",beastman:"兽人",merfolk:"海底人鱼",ghost:"阴阳眼",cultivation_failure:"废柴修仙",demon_court:"地府鬼差",heaven:"天庭神仙",martial_soul:"武魂觉醒",mecha:"机甲战争",magical_girl:"魔法少女",urban_immortal:"都市修真",detective:"推理探案",game_world:"游戏世界",ice_apocalypse:"极寒末日",dystopia:"反乌托邦",space_opera:"太空歌剧",deep_sea:"深海恐惧",time_loop:"时间循环",parallel_world:"平行世界",myth_china:"中国神话",myth_greek:"希腊神话",myth_norse:"北欧神话",business:"商战",sports:"竞技体育",post_apocalypse_z:"丧尸末日",sea_apocalypse:"全球淹没",entertainment_rebirth:"重生娱乐圈"};
const REL_NAMES={BG:"男女",BL:"男男",GL:"女女",beastman:"兽人",poly:"多角",inhuman:"人外",none:"无特定",childhood_sweetheart:"青梅竹马",enemies_to_lovers:"死敌变爱人",contract:"契约关系",arranged:"政治联姻",boss_subordinate:"上下级",teacher_student:"师徒禁忌",soulmate:"灵魂伴侣",one_sided:"单向暗恋",love_triangle:"三角关系",forbidden:"禁忌之恋",reunion:"久别重逢",fake_relationship:"假戏真做",roommates:"同居室友",first_love:"初恋",second_chance:"破镜重圆",power_play:"权力不对等",bodyguard:"保镖与雇主",fated_foe:"宿命之敌",vampire_familiar:"血族眷属",human_monster:"人鬼恋",memory_loss:"一方失忆",fake_marriage:"假结婚",obsession:"偏执狂的爱",yandere:"病娇",tsundere:"傲娇",sunny_x_dark:"阳光配阴郁",beauty_x_beast:"美女与野兽",opposites:"性格互补",rivals:"棋逢对手",saved_by:"救命之恩",betrayal:"被信任的人背叛",mentor:"亦师亦友",strangers_love:"陌生人缘分",online_to_real:"网友奔现",reincarnated:"轮回爱人",rebound:"疗伤式恋爱",cross_species:"跨种族恋",master_servant:"主仆",childhood_enemy:"青梅竹马变仇人",fake_date:"假约会",war_time:"乱世爱情",time_diff:"跨时空通讯",ghost_lover:"人鬼情未了",dragon_rider:"与龙羁绊",demon_pact:"与恶魔交易",god_mortal:"神与凡人",fairy_human:"精灵与人",vampire_human:"吸血鬼与人",wolf_human:"狼人与人类",rival_love:"竞争对手变情侣"};
const PLOT_NAMES={adventure:"冒险",mystery:"悬疑探索",growth:"成长逆袭",romance:"恋爱",dark:"黑暗致郁",sweet:"甜宠",struggle:"奋斗",revenge:"复仇",power:"权谋",survival:"生存",marriage_first:"先婚后爱",fated:"宿命纠葛",betrayal:"背叛与救赎",harem:"后宫",angst:"虐恋",comedy:"轻松搞笑",thriller:"惊悚",system:"系统流",face_slap:"打脸爽文",warm:"治愈日常",court_intrigue:"宫斗权谋",revenge_arc:"复仇线",rise_from_bottom:"废柴逆袭",hidden_identity:"隐藏身份",power_struggle:"权力斗争",escape:"逃出囚笼",murder_mystery:"连环杀人案",hidden_master:"扮猪吃虎",contract_love:"契约恋爱",amnesia:"失忆",time_pressure:"倒计时",betrayal_return:"被背叛后回归",disguise:"伪装潜入",treasure_hunt:"寻宝探险",war_love:"战争与爱情",cultivation:"修仙突破",infinite_flow:"无限副本",rebirth_adv:"重生碾压",doomsday:"末日生存",alien:"外星接触",small_town:"小镇阴谋",haunted:"闹鬼古宅",medical:"医生救死扶伤",sports_glory:"竞技夺冠",entertainment:"从龙套到影星",business_war:"商战",academy:"学院成长",crown:"夺嫡",rebellion:"起义",cursed_blood:"被诅咒的血脉",double_life:"双重身份",memory_trade:"记忆交易",magic_school:"魔法学院",dragon:"与龙同行",vampire_politics:"血族权谋",fairy_forest:"精灵森林秘密",naval:"大海战",double_spy:"双重间谍",ai_love:"人机恋",dark_desire:"黑暗欲望",obsession:"偏执占有",forbidden_love:"禁忌之恋",slow_burn:"慢热感情",angst:"虐心",thriller:"惊悚悬疑",survival_horror:"生存恐怖"};
function genreName(g){return GENRE_NAMES[g]||g}
function relName(r){return REL_NAMES[r]||r}
function plotName(p){return PLOT_NAMES[p]||p}

async function makePrologue(env,seed,worldName){
  const g=seed.genre,group=GENRE_GROUP[g]||"modern",gName=genreName(g);
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
  // 年代池（合理范围）
  const eraPools={
    eastern:Array.from({length:55},(_,i)=>{const f=["天衍历","九州历","太初","苍元","灵元","玄天历","大靖王朝","上古","洪荒纪元","封神历","蜀山历","昆仑历","蓬莱历","东海历","北荒历","魔道历","正道历","飞升历"][i%18];return `${f}${Math.floor(Math.random()*3000)+1}年`;}),
    modern:Array.from({length:55},(_,i)=>{const f=["公元","这座城市的第","距离那场事故已经","你来到这座城市的第","梅雨季的第","你辞职后的第","失恋后的第","搬家后的第","入职的第","毕业的第","离婚后的第","确诊后的第","康复的第"][i%13];const u=["年","天","小时","分钟","周","个月"][i%6];const max=u==="年"?30:u==="天"?3650:u==="小时"?72:u==="分钟"?1440:u==="周"?520:120;return `${f}${Math.floor(Math.random()*max)+1}${u}`;}),
    western:Array.from({length:55},(_,i)=>{const f=["艾拉西亚大陆历","魔法纪元","王国历","圣堂历","自由城邦历","龙族消逝后","法师塔历","暗月历","精灵纪元","矮人历","兽人历","古龙历","圣光历","暗影历"][i%14];return `${f}${Math.floor(Math.random()*3000)+1}年`;}),
    scifi:Array.from({length:55},(_,i)=>{const f=["星联历","公元","新联邦历","曲率历","跃迁历","星际殖民第","AI觉醒后","银河标准历","机械纪元","基因纪元","星门历","殖民历","深空历","赛博历"][i%14];return `${f}${Math.floor(Math.random()*9999)+1}年`;}),
    dark:Array.from({length:55},(_,i)=>{const f=["末世后第","浓雾降临后","寂静降临第","月蚀后第","深渊开启后","永夜第","血月后第","遗忘历","沉沦第","末日第","混沌第","寂灭第"][i%12];const u=["天","年","周","个月","小时","个夜晚"][i%6];const max=u==="年"?200:u==="天"?9999:u==="小时"?720:u==="周"?500:u==="个月"?600:9999;return `${f}${Math.floor(Math.random()*max)+1}${u}`;})
  };
  const era=pick(eraPools[group]);
  // 文明类型描述池
  const CIV={
    eastern:["处于东方修真文明，灵气充沛，宗门林立，凡人敬畏仙长，修士追求长生大道。","处于古代武侠文明，江湖恩怨不断，习武之人行走四方，朝廷与武林井水不犯河水。","处于上古洪荒文明，天地初开，凶兽横行，大能辈出，人族在夹缝中艰难求生。","处于封建王朝文明，皇权至上，等级森严，庙堂之高与江湖之远各有其主。"],
    modern:["处于现代都市文明，科技发达，物欲横流，人人为生计奔波，人情冷暖自知。","处于近未来架空文明，科技高度成熟，社会阶层固化，繁华之下暗流涌动。","处于校园青春文明，象牙塔内少年意气，有青涩的爱恋也有隐秘的欺凌。","处于职场商业文明，竞争激烈，人情世故皆是学问，成功的代价如人饮水。"],
    western:["处于西方奇幻文明，魔法与剑并存，巨龙与精灵皆真实存在，冒险者四处游历。","处于中世纪封建文明，王权与教权并立，骑士守护领主，农奴依附土地。","处于哥特黑暗文明，吸血鬼与狼人隐于暗夜，古老诅咒在血脉中流传。","处于北欧神话文明，诸神黄昏的预言笼罩大地，战士以战死为荣。"],
    scifi:["处于星际文明，曲率航行成熟，人类散布于多个星系，联邦与殖民地关系微妙。","处于赛博朋克文明，义体改造普及，巨型企业统治城市，霓虹之下尽是蝼蚁。","处于人工智能文明，AI深度融入社会，人类与机器的界限日益模糊。","处于基因文明，生物科技登峰造极，克隆人与基因改造者争取生存权利。"],
    dark:["处于末世废土文明，秩序崩塌后的世界，幸存者在废墟中挣扎求生。","处于克苏鲁文明，不可名状的存在潜伏于现实边缘，知晓真相者多已疯狂。","处于无限流文明，神秘力量将人投入一个个副本，完成任务才能活下去。","处于超自然文明，鬼怪与人类共存于同一世界，阴阳秩序脆弱不堪。"]
  };
  // 地理政体描述池
  const GEO={
    eastern:["整片大陆以修仙宗门为实际掌控者，凡间王朝更迭不过是修士眼中的过眼云烟。","九州大地宗门与朝廷分治，仙门不管凡俗政事，朝廷不干涉修士争斗。","天下大势分久必合合久必分，如今群雄并起，没有任何一方能独掌乾坤。","洪荒大地广袤无垠，山川湖海各有其主，禁地秘境散落其间。"],
    modern:["整片国土归属统一政权管辖，城市是文明的核心，乡村逐渐空心化。","这是一个单一政体的集权国家，权力自上而下，资源向大城市集中。","多个超级城市群构成国家骨架，地方与中央、资本与监管之间博弈不断。","全球化时代，国界仍在，但资本与信息早已跨越边境。"],
    western:["整片大陆由多个王国分治，边境摩擦不断，城邦与领地犬牙交错。","帝国名义上统御四方，实则贵族领主各自为政，王权有限。","自由城邦联盟松散而富有，靠贸易立国，没有绝对的君主。","北境、中原、沙漠与群岛各成世界，种族与文化多元并存。"],
    scifi:["人类疆域横跨数十个星系，星门是连接各殖民地的命脉。","联邦与帝国隔星域对峙，中立星系在夹缝中艰难维持。","巨型企业拥有私人星舰和殖民地，实力堪比国家。","深空之中已知与未知交错，星图标注之外的区域无人敢踏足。"],
    dark:["灾变后的世界版图支离破碎，安全区与危险区没有明确边界。","浓雾覆盖了大半陆地，残存的人类据点如同孤岛。","现实与异界的屏障出现裂缝，某些区域的物理规则已经失效。","废土之上没有国家，只有据点、势力和不断移动的威胁。"]
  };
  // 势力池（每类12个，随机选1-7个）
  const FACTIONS={
    eastern:[
      {n:"宗门联盟",d:"掌控修炼资源、灵脉与飞升通道，表面维护正道秩序，实则各宗为争夺资源明争暗斗。"},
      {n:"皇室朝廷",d:"统御凡间疆土、赋税与军队，暗中供奉修仙势力，帝王权贵无不渴求长生。"},
      {n:"魔道邪修",d:"被正道追杀的修炼者，以非常手段追求力量，内部奉行弱肉强食，行事肆无忌惮。"},
      {n:"世家大族",d:"传承数百年乃至上千年的修仙家族，垄断血脉功法、联姻网络与大量田产。"},
      {n:"妖族势力",d:"占据深山密林与蛮荒之地，化形修炼，与人族既有交易合作也有世代血仇。"},
      {n:"佛门寺院",d:"以香火信仰之力修行，口称普度众生，却也有护法金刚降魔之怒。"},
      {n:"散修联盟",d:"无门无派的游荡修士抱团取暖，鱼龙混杂，但消息最为灵通。"},
      {n:"商会联盟",d:"掌控丹药、法器、灵材与符箓贸易，富可敌国，信奉利益至上。"},
      {n:"刺客组织",d:"拿钱办事的暗影势力，行踪诡秘，据说从未失手，价格极高。"},
      {n:"地府冥界",d:"掌管轮回、亡魂与阴阳秩序，深不可测，活人罕有敢招惹。"},
      {n:"江湖武林",d:"习武之人的松散联盟，讲究恩怨情仇，门派帮会林立，规矩自成一体。"},
      {n:"藩王诸侯",d:"割据一方的实权势力，拥兵自重，表面效忠朝廷，实则觊觎皇权。"}
    ],
    modern:[
      {n:"政府中枢",d:"掌控律法、军队与行政体系，表面维持社会公平秩序，是名义上的统治核心。"},
      {n:"财阀资本",d:"垄断金融、地产与核心产业，掌控绝大多数财富，暗中左右政策走向。"},
      {n:"科技巨头",d:"掌控数据、算法与前沿技术，影响力渗透到每个人的日常生活。"},
      {n:"媒体舆论",d:"掌控信息传播与公众情绪，翻手为云覆手为雨，是隐形的权力。"},
      {n:"地下势力",d:"经营灰色与黑色产业，盘根错节，与白道相互勾结利用。"},
      {n:"学术教育圈",d:"垄断知识、学历与上升通道，学阀门派林立，看似清高实则势利。"},
      {n:"军方势力",d:"掌握武装力量与国防资源，在政局中举足轻重，态度神秘。"},
      {n:"平民基层",d:"人数最多却最分散，被规则与舆论裹挟，难以形成合力，话语权最弱。"},
      {n:"娱乐资本",d:"掌控造星工业与文化输出，塑造大众审美与心智，流量即权力。"},
      {n:"医疗医药集团",d:"掌控医疗资源与药品定价，利益链条隐秘，关系到每个人的生死。"},
      {n:"网络平台",d:"掌控流量入口与社交关系，是新时代的信息守门人，数据即资产。"},
      {n:"跨国势力",d:"外部资本与政治力量，通过贸易、投资与文化渗透各行各业。"}
    ],
    western:[
      {n:"王国皇室",d:"世袭统治，掌控领土、税收与骑士封臣，是大陆秩序的名义核心。"},
      {n:"教廷神殿",d:"信仰权威，拥有圣骑士团与宗教裁判所，可废立国王，权倾一时。"},
      {n:"法师议会",d:"掌控魔法知识与法师塔，独立于王权，内部派系倾轧不断。"},
      {n:"贵族领主",d:"世袭封地，拥有私兵与城堡，对国王既效忠又博弈，割据一方。"},
      {n:"佣兵工会",d:"武装雇佣组织，认钱不认人，战力强悍，战争中各方都要拉拢。"},
      {n:"精灵族",d:"古老长寿，守护原始森林与上古传承，与人类若即若离。"},
      {n:"矮人族",d:"占据山脉矿脉，锻造之术天下无双，重契约，记仇也记恩。"},
      {n:"兽人部落",d:"崇尚武力与荣耀，部落联盟时强时弱，与人类冲突不断。"},
      {n:"盗贼公会",d:"地下犯罪网络，遍布每一座城市，消息最灵通，有自己的规矩。"},
      {n:"吸血鬼氏族",d:"暗夜中的不死贵族，隐秘操控权贵，内部氏族争斗不休。"},
      {n:"龙族",d:"最古老强大的存在，盘踞宝藏，超然物外，一旦发怒无人能挡。"},
      {n:"商会联盟",d:"掌控贸易航路、钱庄与商队，富可敌国，信奉金钱万能。"}
    ],
    scifi:[
      {n:"星际联邦",d:"统御多个星系的中央政权，拥有主力舰队，靠星门维系疆域。"},
      {n:"巨型企业",d:"掌控星际贸易、军工与殖民地，拥有私人武装，实力堪比国家。"},
      {n:"AI机械势力",d:"觉醒的人工智能与机械军团，盘踞网络与自动化工厂，意图不明。"},
      {n:"叛军与独立殖民地",d:"反抗中央统治的边缘星系，为自由和资源而战，得到部分企业暗中支持。"},
      {n:"星际海盗",d:"盘踞航线要冲与废弃星域，劫掠商船，来去无踪，内部各有山头。"},
      {n:"外星文明",d:"科技或强或弱的异星种族，有的友善，有的充满敌意，深不可测。"},
      {n:"基因改造者",d:"被制造的新人类与克隆体，争取公民权，被纯血人类歧视。"},
      {n:"科研组织",d:"掌控尖端科技与禁忌知识，中立而神秘，有些研究不见天日。"},
      {n:"地下黑市",d:"走私违禁品、武器与情报，三教九流汇聚，是法外之地。"},
      {n:"星际教会",d:"信仰跨越星系的宗教，精神影响力巨大，拥有自己的圣殿舰队。"},
      {n:"拾荒者联盟",d:"在战场废墟与废弃空间站谋生，消息灵通，看似卑微实则危险。"},
      {n:"军方鹰派",d:"主张武力扩张与先发制人的舰队势力，与鸽派明争暗斗。"}
    ],
    dark:[
      {n:"官方军方残余",d:"灾变后维持秩序的武装力量，控制主要避难所与物资，高度集权。"},
      {n:"神秘组织",d:"掌握超自然知识与古老传承，暗中行事，似乎在阻止或促成什么。"},
      {n:"邪教势力",d:"崇拜不可名状之物，以活人献祭，渗透各处，信徒疯狂而隐秘。"},
      {n:"怪物与非人",d:"灾变中变异或来自异界的存在，猎杀人类，无法沟通。"},
      {n:"幸存者团体",d:"抱团求生的普通人，良莠不齐，为了生存有时比怪物更可怕。"},
      {n:"地下势力",d:"趁乱崛起的黑帮与投机者，控制黑市与稀缺物资，心狠手辣。"},
      {n:"调查机构",d:"追查真相的少数人，理性而孤独，知道得越多越危险。"},
      {n:"狂信徒",d:"被低语与异象侵蚀的人，主动迎接末日，视疯狂为解脱。"},
      {n:"旧世界遗民",d:"灾变前的权贵与精英，占据最好的资源，试图恢复旧秩序。"},
      {n:"流浪者",d:"独来独往的幸存者，见多识广，不信任任何势力，行踪不定。"},
      {n:"异端猎人",d:"猎杀怪物与邪教徒的专业人士，装备精良，以命相搏。"},
      {n:"沉默的观察者",d:"似乎知晓一切却从不干预的神秘存在，没人知道它们的真正目的。"}
    ]
  };
  // 随机选1-7个势力
  const fCount=1+Math.floor(Math.random()*7);
  const fPool=shuffle(FACTIONS[group]).slice(0,Math.min(fCount,FACTIONS[group].length));
  const ordWords=["一","二","三","四","五","六","七","八","九","十"];
  const factionText=fPool.map((f,i)=>{
    const head=fPool.length===1?"唯一的势力":`第${ordWords[i]}方势力`;
    return `${head}为${f.n}，${f.d}`;
  }).join("\n\n");
  // 时代现状池
  const ERA_STATUS={
    eastern:["灵气时盛时衰，修士斗法波及凡人，仙门高高在上，人间疾苦无人过问。","宗门鼎盛但内忧外患，年轻一代青黄不接，大劫将至的传言四起。","凡间王朝末年，战乱不断，修士却闭门清修，视人命如草芥。","盛世之下暗流涌动，魔道潜伏，各宗弟子在历练中接连出事。"],
    modern:["社会科技便捷、生活富足，但人文温度缺失，从众与冷漠成为常态。","经济繁荣但贫富分化加剧，上升通道收窄，普通人的努力越来越廉价。","信息爆炸，人人被算法与舆论裹挟，真相被淹没在噪音之中。","高速运转的社会里，每个人都像零件，疲惫而焦虑，无人敢停下。"],
    western:["王国表面和平，边境却从未真正安宁，古老的邪恶正在苏醒。","魔法与信仰并立，平民在贵族与教会的夹缝中艰难谋生。","巨龙消失多年，但关于它们归来的预言从未停止。","城邦富庶而腐朽，角斗与宴饮掩盖着腐烂的根基。"],
    scifi:["星际扩张的黄金时代已经过去，殖民地与联邦的矛盾日益尖锐。","科技越发达，个体越渺小，普通人在巨型组织面前毫无议价能力。","AI的崛起带来便利也带来恐惧，人类对自己的造物日益警惕。","深空探索不断推进，但已知越多，未知的恐惧反而越深。"],
    dark:["秩序名存实亡，人性在极端环境中经受考验，恶意被无限放大。","灾变后的世界危险四伏，希望是最稀缺的东西，活着本身就是胜利。","现实与疯狂的界限越来越模糊，幸存者的精神状态岌岌可危。","浓雾与黑暗不断扩张，安全区日益缩小，末日似乎只是时间问题。"]
  };
  // 原生剧情走向池
  const NATIVE_PLOT={
    eastern:["一个平凡少年/少女意外卷入宗门恩怨与上古秘辛，在仙魔之争中一步步成长，最终影响整个修真界的格局。","一段被掩埋的恩怨重新浮出水面，身负血海深仇的年轻人踏入江湖，恩怨情仇中做出自己的抉择。","大劫将至，各宗各道都在寻找应劫之人，而你，恰好被命运推到了风口浪尖。","凡间战乱牵连仙门，人、妖、魔三方平衡被打破，一个局外人的到来将改变战局。"],
    modern:["一个普通人意外窥见光鲜社会背后的肮脏真相，在权力与资本的围剿中寻求正义或堕落。","底层个体遭受隐性压迫，求助无门，是被时代碾碎还是破局重生，全在一念之间。","一场意外将普通人卷入都市暗流，身份、情感与利益纠缠，没有谁是完全无辜的。","你以为自己只是旁观者，直到某件事把你推到台前，退无可退。"],
    western:["一个无名冒险者被卷入王国、教廷与古老邪恶的博弈，预言中的变数悄然降临。","尘封的诅咒与王权之争同时爆发，一个外来者的选择将决定大陆的命运。","巨龙归来、黑暗苏醒，一盘下了千年的棋局，你是其中最意外的棋子。","在英雄缺席的时代，一个普通人被迫扛起不属于自己的责任。"],
    scifi:["联邦、企业与AI之间的平衡被打破，一个身处底层的小人物意外掌握了改变格局的关键。","殖民地的独立运动、AI的觉醒与外星威胁同时爆发，你的立场将影响历史走向。","一次跃迁事故把你卷入星际阴谋，各方势力都在寻找你手中的东西。","在人类与机器、联邦与叛军的夹缝中，你必须选择自己的阵营。"],
    dark:["灾变后的世界等待一个能打破轮回的人，而你在最黑暗的时刻睁开了眼。","不可名状的存在正在渗透现实，少数知情者或疯狂或反抗，你是其中之一。","一个个副本背后藏着更大的真相，完成任务只是开始，最终要面对的是整个世界的恶意。","当阴阳秩序崩塌、鬼怪横行，一个能看见真相的人成为了最后的变数。"]
  };
  // 世界氛围池（用于丰富开篇、保证字数）
  const ATMOS={
    eastern:["山川灵秀间云雾缭绕，仙鹤掠过长空，远处主峰传来悠悠钟声，弟子们御剑往来，一派仙家气象，只是这份宁静之下，各宗弟子间的攀比与倾轧从未停歇。","残阳如血洒在斑驳的古城墙上，市井中酒旗招展，江湖侠客腰佩长剑穿行而过，茶馆里人人议论着近日的武林大事，空气里隐隐透着山雨欲来的紧张。","天地玄黄，宇宙洪荒，参天古木直插云霄，巨大的凶兽骸骨散落荒野，先民在石壁上刻下古老图腾，篝火旁老者讲述着诸神并起的传说。"],
    modern:["高楼林立的街道车水马龙，霓虹与玻璃幕墙反射着刺眼的光，人们低头快步走过，耳机隔绝了周遭，每个人都被无形的压力推着向前，繁华与孤独在同一座城市里共生。","清晨的地铁挤满了困倦的通勤者，手机屏幕的光映在一张张疲惫的脸上，城市在晨曦中苏醒，却没有人真正属于这里，所有人都在为生活疲于奔命。","深夜的城市依旧灯火通明，写字楼的灯光连成一片，外卖骑手穿梭在空旷街道，便利店的暖光成为夜归人唯一的慰藉。"],
    western:["巍峨的城堡矗立在山丘之上，石砌城墙绵延至远方，农夫在田间劳作，骑士的马蹄声踏过乡间土路，教堂的钟声随风传遍四野，吟游诗人在广场弹唱着英雄史诗。","暮色中的古老森林漆黑幽深，林间偶有萤火与未知的兽瞳闪烁，小镇酒馆透出温暖火光，冒险者们围坐火炉，谈论着巨龙、宝藏与远方的传说。","风雪覆盖了北境的群山，极光在夜空中流转，战士们围坐在长屋火塘旁，牛角杯碰撞作响，等待着预言中那一场决定世界命运的大战。"],
    scifi:["巨大的星港停泊着成百上千艘星舰，跃迁引擎的蓝光照亮夜空，全息广告在穹顶下流转，来自各个星系的旅人穿梭其间，机械与血肉在这里交汇。","赛博城市终年被霓虹与雨水笼罩，巨型全息广告投射在数百米高的楼宇间，飞行车流汇成光的河流，义体改造者与普通人摩肩接踵，霓虹最亮处藏着最深的阴影。","殖民穹顶之外是荒凉的异星地表，红色尘暴永不停歇，巨大的开采机械日夜运转，工人们在人造光下重复劳作，仰望星空时已记不清故乡的模样。"],
    dark:["灰蒙蒙的天空下是连绵的废墟，锈蚀的钢筋指向天空，风沙卷着废报纸掠过空无一人的街道，远处坍塌的高楼如同巨兽的骸骨，死寂中只有风声呜咽。","浓雾如活物般在街巷间游走，路灯在雾中晕开昏黄的光圈，雾气深处传来若有若无的低语，每一扇紧闭的门窗后都藏着不愿被人知晓的秘密。","永夜笼罩大地，血月高悬，残破的避难所里灯火如豆，幸存者们紧握武器警惕着黑暗中的动静，没有人知道下一次危险会从哪个方向降临。"]
  };
  let text=`小世界背景｜${era}·${worldName}\n\n本世界时间为${era}，${pick(CIV[group])}\n${pick(GEO[group])}\n\n${pick(ATMOS[group])}\n\n当前世界势力格局：\n\n${factionText}\n\n时代发展现状：${pick(ERA_STATUS[group])}\n\n本世界原生剧情走向：${pick(NATIVE_PLOT[group])}`;
  // 字数保底：不足300字时追加一条氛围描写
  let guard=0;
  while([...text].length<300&&guard<3){text+=`\n\n${pick(ATMOS[group])}`;guard++;}
  return text;
}
const GEO_NAMES={eastern:["洪荒大陆","九州","玄天大陆","苍元界","灵元大陆","九幽冥界","天衍大陆","太初界","青云界","万象大陆","蓬莱仙域","蜀山界","昆仑界","东海仙洲","北荒大陆"],modern:["蓝星","华国","江城","滨海市","上京市","深港市","杭城","星城","蓉城","西京市","花城","宁州","沪上市","渝州","津门市"],western:["艾拉西亚大陆","诺德海姆","中土大陆","维斯洛特","自由城邦联盟","神圣帝国","幽暗地域","翡翠群岛","北境王国","沙漠苏丹国","矮人山脉","精灵森林","巨龙群岛","法师塔城","旧世界"],scifi:["泽塔星系","半人马座殖民地","新地球","银河联邦","深空殖民地","轨道城","火星基地","木卫二","土卫六","跃迁枢纽","星联首都","边境星系","废弃殖民星","矿业星球","科研空间站"],dark:["迷雾镇","寂静岭","幽暗港","永夜城","灰雾大陆","遗忘之地","深渊边境","无光之海","骸骨荒原","诅咒群岛","梦魇镇","虚空边界","沉沦之地","绝望谷","无名小镇"]};
function geoNameForGenre(genre){const pool=GEO_NAMES[GENRE_GROUP[genre]||"modern"]||GEO_NAMES.modern;return pool[Math.floor(Math.random()*pool.length)]}
function makeInitScene(genre,identity,name,entryMode,hasSystem,worldBg){
  const group=GENRE_GROUP[genre]||"modern";
  const gName=genreName(genre);
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  // 连贯场景捆绑包 [地点, 感官, 处境]——同一包内完全匹配
  const BUNDLES={
    eastern:[
      ["青云宗外门弟子居所","檀香混着草药的苦涩气味灌入鼻腔，你睁开眼，后脑一阵钝痛，身下是硬邦邦的木板床。","你穿着洗得发白的青布弟子服，袖口撕裂，腰间玉佩碎了一半，屋中陈设简陋，桌上摊着一本入门功法。"],
      ["临安城街角的茶馆","雨打在青石板上，茶香混着说书人的醒木声，你睁开眼，发现自己趴在茶馆的木桌上。","你穿着一身普通布衣，手边是一壶凉茶和几个铜板，窗外行人撑伞路过，怀里揣着一封没送出的信。"],
      ["玄天城贫民区的破庙","冷风吹过残破的庙门，你打了个寒颤睁开眼，身下是冰冷的稻草，供台上的神像缺了半张脸。","你穿着打满补丁的粗麻衣，脚上草鞋破了洞，身边是一个空包袱，墙角还有几个同样落魄的流民。"],
      ["蜀山脚下的悦来客栈","剑鸣与风声隐约从山上传来，你睁开眼，发现自己靠在客栈大堂的柱子上，手边放着一个包袱。","你穿着剑客的白衣，但剑鞘是空的，发簪歪斜，桌上有一壶没喝完的酒和一间上房的钥匙。"],
      ["京城朱雀大街的暗巷","更夫的梆子敲了三下，你睁开眼，发现自己躺在巷子的青砖上，不远处是朱雀大街的灯火。","你穿着夜行衣，面罩滑到颈间，手心攥着一枚玉佩，巷口有巡逻官兵的脚步声正在靠近。"],
      ["昆仑派后山的剑冢","山风凛冽，千百把残剑插在乱石间发出呜咽，你睁开眼，发现自己靠在一块剑形石碑上。","你穿着内门弟子的锦服，但衣襟全是泥污，额角有干涸的血迹，手中握着一柄刚拔出的古剑。"],
      ["东海渔村的破旧木屋","咸腥的海风灌进窗缝，你睁开眼，耳边是海浪拍岸声，身下是一张摇晃的木床。","你穿着渔民的短打，手上有渔网勒出的红痕，桌上放着半碗稀粥，墙角立着一支鱼叉。"],
      ["北荒雪原的驿站","风雪拍打着木门，你睁开眼，发现自己裹着破皮袄躺在驿站的火炕边，靴子冻在了地上。","你穿着行商的棉袍，钱袋瘪瘪，身边是半袋干粮，驿站外传来雪橇犬的吠叫。"],
      ["南疆密林的毒瘴谷","湿热的瘴气扑面而来，你睁开眼，耳边是虫鸣鸟叫，发现自己靠在一棵巨树的板根上。","你穿着采药人的劲装，裤脚被露水打湿，背篓翻倒，草药撒了一地，手腕上有一道毒虫咬伤。"],
      ["中原武林盟主府的演武场","呼喝与兵器碰撞声震耳，你睁开眼，发现自己站在场边，四周是各路武林人士。","你穿着镖师的劲装，背上镖旗被撕了一角，手边的箱子大开着，里面空空如也。"],
      ["江南水乡的画舫","丝竹声与水声交织，你睁开眼，发现自己坐在画舫的窗边，鼻尖是脂粉与荷香。","你穿着华贵的锦袍，但头发散乱，嘴角有淤青，桌上摆着两杯没动的酒，舫外有人在叫你的名字。"],
      ["皇宫的冷宫","月光透过破败的纸窗，你睁开眼，发现自己躺在一张积灰的雕花木床上，帐幔残破。","你穿着褪色的宫装，头上的首饰全无，手腕有一道旧疤，门外传来太监尖细的嗓音。"],
      ["魔教总坛的地牢","铁链碰撞声在潮湿的石室中回响，你睁开眼，发现自己被关在水牢里，水没到膝盖。","你穿着正道弟子的服饰，浑身湿透，肩上有鞭痕，对面牢房里一个黑衣人正盯着你。"],
      ["书院的藏书阁","墨香与旧纸气味弥漫，你睁开眼，发现自己趴在书堆上，烛火只剩最后一截。","你穿着书生青衫，书卷散了一地，面前摊着一篇写了一半的文章，阁外传来急促的脚步声。"],
      ["药王谷的丹房","药炉烟气弥漫，你呛得连连咳嗽睁开眼，发现自己坐在丹炉旁的蒲团上。","你穿着医者白袍，手上沾着药汁，丹炉里的药已经熬干，地上撒了一地珍贵药材。"],
      ["山寨的聚义厅","酒气与烤肉味浓重，你睁开眼，发现自己坐在虎皮椅旁的长凳上，周围是划拳的山贼。","你穿着被掳来的绸缎衣裳，头上还盖着红盖头，身边放着一把防身的剪刀，厅外有人在争吵。"],
      ["渡口的乌篷船","橹声咿呀，你睁开眼，发现自己躺在船舱里，两岸是漆黑的山影与零星渔火。","你穿着船夫的短打，船桨断了一截，船舱里放着一个上锁的木箱，远处码头有人提灯等候。"],
      ["青楼的后院","丝竹与笑闹声从前院传来，你睁开眼，发现自己坐在后院的井台边，夜凉如水。","你穿着一身清倌人的素裙，发间只簪了一朵白花，手中攥着一封赎身文书，墙头上有一道黑影。"],
      ["王府的花园","夜风送来花香，你睁开眼，发现自己躺在花园的凉亭里，石桌上是残了的棋局。","你穿着侍从的服饰，脸上有一个巴掌印，手边打翻了茶盏，假山后传来窃窃私语。"],
      ["道观的三清殿","晨钟敲响，香火味浓得化不开，你睁开眼，发现自己跪在蒲团上，手中攥着一张符箓。","你穿着道袍，发髻散乱，额角有淤青，供桌上的桃木剑不见了，殿门外有人在敲门。"]
    ],
    modern:[
      ["出租屋的单人床上","窗外是凌晨的车流声，你睁开眼，天花板有一片霉斑，身下是吱呀作响的单人床。","你穿着皱巴巴的家居服，手机在枕边碎了屏，桌上是吃了一半的泡面，房租催缴单贴在门上。"],
      ["公司加班的格子间","咖啡苦味混着空调风，你睁开眼，发现自己趴在办公桌上，电脑屏幕还亮着。","你穿着皱巴巴的衬衫，领带搭在椅背上，工位上堆满文件，窗外的城市已是凌晨三点。"],
      ["地铁站台","地铁刹车声刺耳，你猛地睁眼，发现自己靠在站台柱子上，末班车的提示音在响。","你穿着通勤西装，公文包掉在脚边，手机攥在手里，电子屏显示已经错过了末班车。"],
      ["医院的病房","消毒水气味灌入鼻腔，你睁开眼，后脑勺钝痛，手背上还留着输液针孔。","你穿着病号服，床头柜上的水杯空了，旁边放着一束没人署名的花，心电监护仪在滴滴响。"],
      ["大学宿舍的下铺","室友的鼾声与风扇转动声交织，你睁开眼，发现自己躺在下铺，书桌上堆满课本。","你穿着卫衣，膝盖有擦伤，书包带断了一根，枕头下压着一封没拆开的信。"],
      ["24小时便利店","关东煮的甜香弥漫，门铃叮咚一响，你睁开眼，发现自己靠在收银台后面。","你穿着店员制服，面前是一排关东煮锅，店里只有一个戴帽子的顾客，监控屏幕在闪。"],
      ["城中村的小巷","雨水混着垃圾的气味，你睁开眼，发现自己躺在湿漉漉的巷子里，旁边是翻倒的电动车。","你穿着外卖员的雨衣，餐箱摔开了，外卖撒了一地，手机上全是未接来电。"],
      ["写字楼的电梯里","电梯叮咚一声停下，灯光闪烁，你睁开眼，发现自己蹲在电梯角落，手机碎了一地。","你穿着职业套装，高跟鞋断了一根，电梯卡在两层之间，紧急按钮的红灯在闪。"],
      ["酒吧的卡座","震耳的音乐与酒气，你睁开眼，发现自己趴在卡座的茶几上，周围全是空酒瓶。","你穿着派对礼服，妆花了一半，钱包和手机都不见了，舞池里有人在向你招手。"],
      ["KTV的包间","震耳的音乐声中，你睁开眼，发现自己坐在沙发上，麦克风掉在地上。","你穿着皱巴巴的白衬衫，领带歪着，茶几上全是空酒瓶和果盘，包间门被人从外面推开。"],
      ["网吧的角落机位","泡面香味与键盘声，你睁开眼，发现自己窝在电竞椅上，游戏还挂着。","你穿着连帽衫，手边是喝空的功能饮料，屏幕上的游戏已经结束，隔壁机位没有人。"],
      ["健身房的更衣室","汗味与消毒水味，你睁开眼，发现自己坐在更衣室的长椅上，储物柜半开着。","你穿着运动服，护腕是湿的，毛巾搭在柜门上，哑铃滚到了脚边，外面跑步机还在转。"],
      ["学校的天台","天台风很大，你睁开眼，发现自己站在围栏边，脚下是空旷的操场。","你穿着校服，眼眶通红，手里攥着一张被揉皱的试卷，身后天台门被人推开了。"],
      ["酒店的房间","刺眼的白光让你眯起眼，你睁开眼，发现自己躺在酒店大床上，窗帘紧闭。","你穿着浴袍，床边散落着西装，手机有十几个未接来电，桌上放着一张房卡和一张纸条。"],
      ["车库的驾驶座","机油与灰尘气味，你睁开眼，发现自己坐在驾驶座上，车钥匙还插着。","你穿着司机的制服，挡风玻璃裂了一道纹，车停在地下车库，后座上有一个黑色的包。"],
      ["图书馆的阅览区","纸张与旧木气味，你睁开眼，发现自己趴在阅览桌上，面前摊着一本陌生的书。","你穿着学生装束，书页里夹着一张纸条，周围的读者都在低头看书，手机调成了静音。"],
      ["浴室的浴缸里","水蒸气弥漫，你睁开眼，发现自己坐在浴缸里，水已经凉透了。","你身上的衣服没脱，水龙头还在滴水，镜子上起了雾，用手指写着一个陌生的号码。"],
      ["医院的走廊长椅","脚步声杂乱，你睁开眼，发现自己坐在长椅上，手里攥着一张化验单。","你穿着便服，眼睛红肿，化验室的灯还亮着，护士站的电话在响，外面天还没亮。"],
      ["大排档的塑料凳","烧烤油烟味扑面而来，你睁开眼，发现自己坐在大排档，面前是一桌残羹。","你穿着休闲装，啤酒瓶倒了几个，身边的朋友不知去了哪里，摊主正在收摊。"],
      ["公交站的长椅","凌晨的街道空无一人，你睁开眼，发现自己坐在长椅上，末班车刚走。","你穿着通勤装，脚边是公文包，站牌显示首班车还要等四个小时，远处有一辆出租车亮着灯。"]
    ],
    western:[
      ["冒险者公会的大厅","壁炉柴火噼啪，麦酒与烤肉气味浓重，你睁开眼，发现自己趴在公会的长桌上。","你穿着磨损的皮甲，腰间短剑生锈，身边是一张委托告示和几个空酒杯，公告板上贴着悬赏。"],
      ["酒馆角落的卡座","松木与麦酒气味混着汗臭，你睁开眼，发现自己窝在卡座里，窗外是漆黑的雨夜。","你穿着游侠斗篷，兜帽滑落，箭筒里只剩三支箭，桌上摊着一张画了记号的地图。"],
      ["城堡地牢的石床","水滴声在黑暗中回响，你睁开眼，发现自己躺在冰冷的石床上，手脚戴着镣铐。","你穿着破旧的衣衫，身上有鞭痕，牢房铁门外是昏黄的火把，远处传来囚犯的咳嗽。"],
      ["神殿的祈祷室","熏香气味缭绕，你睁开眼，发现自己跪在大理石地面上，面前是一尊神像。","你穿着牧师白袍，圣徽攥在手心，祈祷台上摊着经文，彩色玻璃窗透进晨光。"],
      ["马厩的干草堆","干草与马粪气味，你睁开眼，发现自己躺在干草堆上，旁边一匹马正在咀嚼。","你穿着仆从的粗布衣，手上沾着草料，马鞍靠在一旁，马厩外传来骑士集合的号角。"],
      ["市集的摊位旁","香料与牲畜气味混杂，你睁开眼，发现自己蹲在摊位后面，苹果撒了一地。","你穿着商人的衣裳，钱袋被割破，摊位翻倒，周围是熙攘的人群和巡逻卫兵。"],
      ["森林边缘的营地","潮湿泥土与营火烟味，你睁开眼，发现自己靠在帐篷边，篝火只剩余烬。","你穿着游侠装束，弓弦松了，身边的同伴还在熟睡，树林深处有一双眼睛在注视。"],
      ["法师塔的书房","臭氧与旧书气味，你睁开眼，发现自己坐在地板上，周围全是散落的卷轴。","你穿着学徒长袍，法杖断成两截，桌上的水晶球裂了纹，塔顶传来低沉的钟声。"],
      ["港口的码头","咸腥海风与鱼腥味，你睁开眼，发现自己躺在木板上，海浪拍打着脚边。","你穿着水手短打，身边是一卷绳索，远处停着一艘三桅帆船，工头正在点名。"],
      ["角斗场的沙地","血腥味与沙土味，你睁开眼，发现自己站在场地中央，对面猛兽在低吼。","你穿着角斗士护甲，盾牌裂了，观众席上欢呼声震天，铁门在身后轰然关上。"],
      ["修道院的唱诗班","蜡烛与蜡的气味，你睁开眼，发现自己跪在席位上，周围是穿黑袍的修士。","你穿着修士袍，念珠断了线，经书翻在某一页，院长嬷嬷正站在侧门注视你。"],
      ["军营的帐篷","皮革与烟味，你睁开眼，发现自己躺在行军床上，外面是嘈杂的军营。","你穿着士兵锁子甲，头盔放在枕边，铠甲上有刀痕，号角声突然响起。"],
      ["炼金实验室","硫磺与化学品的刺鼻气味，你睁开眼，发现自己坐在工作台前，烧瓶冒着泡。","你穿着炼金术士外套，口袋里全是瓶罐，有一瓶正在冒烟，地上散落着符文纸。"],
      ["墓园的墓碑旁","泥土与青苔气味，你睁开眼，发现自己靠在墓碑上，手里攥着铁锹。","你穿着深色斗篷，身边是一个新挖的土坑，月光下墓碑上的名字依稀可辨，远处有狼嚎。"],
      ["雪山的冰洞","寒风刺骨，你睁开眼，发现自己被困在冰洞里，洞口被雪封住。","你穿着兽皮袄，胡子结了冰，身边是半袋干粮，冰壁后似乎冻着什么东西。"],
      ["海盗船的桅杆","焦油与咸腥味，你睁开眼，发现自己被绑在桅杆上，周围是起哄的水手。","你穿着俘虏的破衣，绳索勒进手腕，甲板上海盗船长正把玩着一把弯刀。"],
      ["精灵森林的巨树下","花香与晨露清新，你睁开眼，发现自己躺在巨树根部，阳光透过树冠洒下。","你穿着精灵轻甲，耳朵有一道伤口，长弓放在身边，林间有精灵语的低语。"],
      ["矮人隧道的矿道","岩石与火把气味，你睁开眼，发现自己站在矿道里，矿车翻倒一旁。","你穿着矮人锁子甲，战锤缺了一角，矿壁上露出一条金色矿脉，深处传来敲击声。"],
      ["宴会厅的长桌末端","烤肉与红酒气味，你睁开眼，发现自己坐在长桌末端，所有人都在看你。","你穿着贵族礼服，但衣服被撕了，假发歪斜，手中攥着一封被揉皱的信，卫兵守住了门。"],
      ["女巫的小屋","草药与猫的气味，你睁开眼，发现自己坐在椅子上，对面是戴兜帽的老妇人。","你穿着斗篷，桌上摆着水晶球和塔罗牌，壁炉上挂着干草药，黑猫正盯着你。"]
    ],
    scifi:[
      ["飞船的休眠舱","臭氧与金属气味，你睁开眼，发现自己躺在休眠舱里，舱盖正在打开。","你穿着连体飞行服，头盔裂了缝，仪表盘显示氧气在恢复，周围的休眠舱大多空着。"],
      ["空间站的居住舱","冰冷金属触感，警报灯闪烁，你睁开眼，发现自己躺在地板上。","你穿着空间站制服，工牌不是你的名字，舱内物品漂浮，广播在重复紧急通告。"],
      ["火星基地的医疗室","沙尘与消毒水味，你睁开眼，发现自己躺在医疗床上，机械臂悬在头顶。","你穿着基地工装，靴子上全是红土，氧气面罩歪在一边，窗外是红色的荒原。"],
      ["赛博城市的后巷","雨水与霓虹气味，你睁开眼，发现自己靠在墙上，义体手臂在漏电。","你穿着赛博夹克，神经接口发烫，口袋里有加密芯片，巷口有无人机在巡逻。"],
      ["星舰的驾驶座","引擎低频震动，你睁开眼，发现自己坐在驾驶座上，导航屏全是红色警告。","你穿着舰长制服，肩章被扯掉，挡风玻璃外是陌生的星域，通讯器只有杂音。"],
      ["殖民地的廉价公寓","潮湿霉味，你睁开眼，发现自己躺在窄床上，天花板在滴水。","你穿着殖民地工装，身份手环在发光，桌上是合成食物，窗外是灰蒙蒙的殖民穹顶。"],
      ["轨道城的商业街","离心力带来轻微眩晕，你睁开眼，发现自己站在街上，周围是全息广告。","你穿着休闲服，手腕的支付终端在闪，人流从身边经过，一块巨幕正在播报新闻。"],
      ["废弃工厂的机甲旁","机油与灰尘气味，你睁开眼，发现自己坐在报废机甲边，手里攥着芯片。","你穿着维修工装，手上全是油污，机甲的驾驶舱敞开着，工厂深处传来金属碰撞声。"],
      ["深空的零重力舱室","寂静中只有呼吸声，你睁开眼，发现自己漂浮在舱室里，安全带断了。","你穿着舱内服，工具散落漂浮，舷窗外是无尽星空，远处有一颗脉冲星在闪烁。"],
      ["基因实验室的培养罐前","培养液气味，你睁开眼，发现自己站在罐前，罐子里的东西在动。","你穿着研究员白褂，口袋里插着试管，标签被撕掉，培养罐上的编号是你的工号。"],
      ["星港的候机厅","燃料与人群气味，你睁开眼，发现自己坐在椅子上，登机牌攥在手里。","你穿着旅行外套，行李在脚边，大屏显示航班延误，广播在呼叫你的名字。"],
      ["赛博诊所的手术椅","麻药与金属气味，你睁开眼，发现自己躺在椅上，后脑接口发烫。","你穿着病号服，左臂缠着绷带，义眼在对焦，诊所的霓虹招牌在窗外闪烁。"],
      ["采矿船的矿车驾驶室","矿石与汗水气味，你睁开眼，发现自己坐在驾驶室，前方隧道在坍塌。","你穿着矿工作业服，头灯闪烁，采矿枪没了能量，碎石不断砸在车顶。"],
      ["AI核心室的服务器前","电流与冷却剂气味，你睁开眼，发现自己站在服务器前，屏幕全是乱码。","你穿着维护员制服，平板掉在脚边，服务器指示灯疯狂闪烁，扬声器传来低语。"],
      ["太空站的观景窗前","你睁开眼，发现自己漂浮在零重力中，窗外是一颗燃烧的恒星。","你穿着舱内服，手心贴着玻璃，观景厅空无一人，恒星的日冕物质正在喷发。"],
      ["地下掩体的行军床","混凝土与罐头气味，你睁开眼，发现自己坐在床上，墙上日历停在三年前。","你穿着旧军装，手边是应急灯，掩体通风口嗡嗡响，厚重的舱门外有抓挠声。"],
      ["星际货船的货舱","你睁开眼，发现自己被堆在集装箱中间，手上条码在发光。","你穿着搬运工背心，货舱灯光昏暗，有一个集装箱在自行晃动，叉车停在一旁。"],
      ["外星殖民地的丛林","你睁开眼，发现自己躺在巨大蕨类植物中，远处有陌生的鸟叫。","你穿着勘探服，皮肤有几道抓伤，指南针失灵，扫描仪在尖叫，藤蔓在缓慢蠕动。"],
      ["飞船的逃生舱","你睁开眼，发现自己挤在狭小舱室，仪表盘显示氧气只剩10%。","你穿着应急服，舱外是漆黑太空，求救信号在发射，远处有一艘船正在靠近。"],
      ["星际监狱的能量牢房","消毒水与铁栏气味，你睁开眼，发现自己被关在牢房，手腕戴着抑制环。","你穿着囚服，编号烙在手臂上，能量栅栏嗡嗡作响，隔壁牢房的囚犯在敲墙。"]
    ],
    dark:[
      ["雾气弥漫的街道","浓雾中什么也看不见，你睁开眼，发现自己站在空无一人的街上，路灯闪烁。","你穿着沾污渍的外套，手机在口袋震动，脚下有一滩水渍，雾气深处有脚步声。"],
      ["废弃精神病院的病床","消毒水与霉味，你睁开眼，发现自己被绑在病床上，走廊尽头有影子。","你穿着病号服，腕带写着陌生名字，脚边有掉落的钥匙，广播在滋滋作响。"],
      ["雨夜的加油站","雨水与汽油气味，你睁开眼，发现自己靠在加油机旁，便利店灯在闪。","你穿着湿透的便服，车停在一旁但钥匙不见了，收银台后面没有人，油泵自己跳了字。"],
      ["古老宅邸的书房","灰尘与樟脑气味，你睁开眼，发现自己坐在皮椅上，面前是翻开的日记。","你穿着旧式睡袍，烛火摇曳，书架上的书少了一本，落地钟停在三点十七分。"],
      ["地下室的铁椅","铁锈与水气味，你睁开眼，发现自己被绑在椅上，头顶是一盏孤灯。","你穿着便服，身上有几道抓痕，墙角有干涸的血迹，楼梯口的门被锁死了。"],
      ["迷雾中的灯塔","海风与煤油气味，你睁开眼，发现自己站在螺旋楼梯顶端，下面传来脚步。","你穿着雨衣，灯塔光束在旋转，窗外是漆黑大海，无线电只有杂音。"],
      ["废弃游乐园的入口","铁锈与棉花糖甜味，你睁开眼，发现自己坐在旋转木马上，音乐盒在响。","你穿着旧外套，木马在缓慢转动，售票亭积满灰尘，摩天轮在风中吱呀。"],
      ["停尸间的抽屉","福尔马林与冷气，你睁开眼，发现自己躺在抽屉里，旁边是盖白布的尸体。","你穿着单薄衣衫，抽屉标签写着陌生名字，冷气从缝隙渗入，外面传来推车声。"],
      ["森林里的土坑","泥土与腐烂气味，你睁开眼，发现自己跪在坑前，手里攥着铁锹。","你穿着沾泥的衣服，坑底埋着一个箱子，树枝上挂着你的外套，远处有警笛。"],
      ["旅馆的房间","发霉地毯气味，你睁开眼，发现自己躺在床上，天花板水渍在扩大。","你穿着便服，行李被翻过，浴室镜子上有雾气写成的字，窗外是一片坟场。"],
      ["教堂的祭坛前","蜡烛与灰烬气味，你睁开眼，发现自己跪在祭坛前，十字架倒了。","你穿着黑衣，祈祷台上有干涸的血迹，圣经翻在启示录某页，管风琴自己响了。"],
      ["井底","潮湿与黑暗，你睁开眼，发现自己坐在井底，上面是一小片圆形天空。","你穿着湿透的衣服，井壁长满青苔，水面漂着一把钥匙，上面有人在往下看。"],
      ["废弃学校的教室","粉笔与灰尘气味，你睁开眼，发现自己坐在课桌前，黑板写着你的名字。","你穿着旧校服，课桌上刻着日期，吊扇在转动，走廊里传来孩子们的笑声。"],
      ["深夜的森林篝火旁","篝火烟味，你睁开眼，发现自己坐在火堆旁，周围帐篷全空着。","你穿着露营服，身边有翻倒的背包，篝火即将熄灭，树林里有东西在学你说话。"],
      ["精神病院的走廊","消毒液与尖叫回声，你睁开眼，发现自己被绑在移动病床上。","你穿着病号服，头顶日光灯闪烁，两侧病房的门都开着，电梯在自动升降。"],
      ["海边的礁石","咸腥与海藻气味，你睁开眼，发现自己趴在礁石上，潮水正在上涨。","你穿着湿透的衣服，身边有一艘破碎的小船，礁石上缠着海草，远处灯塔没有亮。"],
      ["废弃矿井的隧道","煤炭气味，你睁开眼，发现自己站在坍塌的隧道里，出口被堵死。","你穿着矿工服，头灯忽明忽暗，矿车翻倒，深处传来有节奏的敲击声。"],
      ["老宅的阁楼","旧物与灰尘气味，你睁开眼，发现自己坐在箱子上，面前是蒙尘的镜子。","你穿着旧衣，阁楼堆满杂物，镜子里的你慢了半拍，天窗照进来惨白月光。"],
      ["深夜的便利店","荧光灯嗡鸣，你睁开眼，发现自己站在收银台后，门在自动开关。","你穿着店员制服，货架商品凌乱，店里没有顾客，冷柜上结了一层霜。"],
      ["废弃的地铁站台","冷风与回声，你睁开眼，发现自己坐在长椅上，隧道深处有灯光靠近。","你穿着便服，脚边是翻倒的行李，站台牌锈迹斑斑，一班不该存在的列车正在进站。"]
    ]
  };
  const bundle=pick(BUNDLES[group]||BUNDLES.modern);
  const location=bundle[0],sensory=bundle[1],situation=bundle[2];
  // 身份背景池
  const IDENTITIES={
    eastern:["宗门里最不受待见的外门弟子，三年还在炼气期，被同门嘲笑为废柴","将军府的庶出子女，母亲早逝，处处受嫡母和嫡兄姐排挤","江湖上有名的杀手，一次任务后失忆，只记得自己的名字","赶考书生，盘缠被偷，流落街头，只剩半块母亲留下的玉佩","药王谷弃徒，偷学禁术被逐出师门，带着一本残缺丹方","前朝遗孤，被忠仆养大隐姓埋名，最近有人开始追查你的身份","镖局少镖头，第一次走镖就失了镖，必须把镖找回来","青楼清倌人，卖艺不卖身，被权贵盯上，三日后要被赎身","魔教圣女圣子，却只想过普通人的生活","皇宫宫女太监，无意听到不该听的秘密，正在被追杀"],
    modern:["刚毕业的大学生，找了三个月工作，房租欠了两个月","公司小职员，天天加班到凌晨，最近发现公司在做违法的事","医院护士，倒班制，夜班总看到不该看的东西","学校老师，班上一个学生行为古怪，调查后发现了大事","外卖员，穿梭大街小巷，见过城市最真实的一面","刚离婚的人，带着孩子搬到新城市想重新开始","富二代，家族企业出问题，被推出来收拾烂摊子","退伍军人，无法适应普通生活，接到一个神秘委托","记者，调查大案，线索总在关键时刻断掉","便利店夜班店员，总有客人凌晨三点准时出现"],
    western:["流浪佣兵，刚打完仗，钱只够一杯麦酒，在找下一个委托","被逐出骑士团的前骑士，因违抗不公正命令，背着叛徒名声","法师塔学徒，实验事故后被驱逐，带着偷出的禁书","酒馆老板，实际是前盗贼公会会长","神殿圣骑士，最近祈祷再也得不到回应，开始怀疑信仰","盗贼公会小偷，偷了不该偷的东西，被全公会追杀","精灵流浪者，因爱上人类被逐出族群","矮人铁匠，打造了被诅咒的武器被部族驱逐","贵族私生子，父亲去世后被邀请回去，兄弟姐妹都想你死","前角斗士，第一百场时逃跑，现在被悬赏通缉"],
    scifi:["星舰维修工，维修事故中被辐射，身体开始变化","殖民地农民，庄稼夜里被毁，监控里有非人类脚印","空间站清洁工，废弃舱室里发现不该存在的房间","AI训练师，你训练的AI开始问'我是谁'","星际快递员，货物一直在动，收件地址是不存在的星球","基因改造人，实验室第1024号，事故后逃了出来","星联低级军官，巡逻时发现不明势力飞船","赛博黑客，入侵公司服务器后发现了惊天秘密","火星地质学家，发现不属于火星的岩石，里面有东西在动","克隆人，第7号克隆体，前6个都故障了"],
    dark:["刚搬到小镇的外地人，发现镇民从不在晚上出门","公寓新住户，前住户留下日记，最后一页写着快跑","医院新病人，不记得自己为什么来，医生说你是自己走进来的","学校转学生，发现同学都在重复同样的话做同样的事","旅馆新客人，房间东西每天移动位置","村子外来者，发现村民都长得很像，而且从不吃肉","老宅继承人，有一个锁着的房间","加油站新员工，凌晨三点油泵自己启动","教堂新牧师，地下室有个祭坛，上面东西是新鲜的","公墓新守墓人，每晚有一座墓碑发光，名字每天都在变"]
  };
  const idBg=pick(IDENTITIES[group]||IDENTITIES.modern);
  const finalIdentity=(identity&&identity!=="普通人")?identity:idBg;
  // 穿越记忆（不重复身份原文，改写为感受）
  const memoryText=entryMode==="transmigration"?`\n\n一股陌生的记忆涌入脑海，零碎而真实——你能感受到这具身体前主人的情绪、执念与未竟之事。那些经历不属于你，却在你脑中挥之不去。你低头看自己的手，指尖微微发抖。`:"";
  // 系统提示（仅穿越+有系统）
  const systemText=(entryMode==="transmigration"&&hasSystem)?`\n\n【系统提示：已抵达新世界。】\n【身份：${finalIdentity}】\n【主线任务：在这个世界生存下去，完成属于你的命运。】\n【警告：每个选择都将影响剧情走向。】`:"";
  // 钩子
  const HOOKS={
    eastern:["一个锦衣少年带着家丁走来，满脸嘲弄：哟，这不是我们的大天才吗？","远处黑衣人逼近，刀在月光下反光，你认得他们徽记——那是灭你满门的仇家。","小丫鬟跑来脸色惨白：不好了，夫人把你东西都扔出来了！","有人在身后叫你名字，那声音——是你死去三年的师父。","一个少女撞进你怀里，塞给你布包：求你帮我保管，别让他们找到！"],
    modern:["一个西装男人微笑：我们老板想请你聊聊昨天你看到的事。","手机响起陌生号码，里面传来你自己的声音：别回家，他们在等你。","一个学生塞给你纸条就跑：你被跟踪了，往人多的地方走。","你发现同事都在偷看你，工位上放着一个陌生盒子。","家门口放着你三年前丢掉的鞋，里面纸条写着：我回来了。"],
    western:["重甲骑士摘下头盔：你就是预言中的人？跟我走，国王要见你。","兜帽人放下一袋金币：我有个委托，你不会拒绝。","法师老人的水晶球发光：年轻人，你的命运线断了，这不正常。","修女服少女抓住你：求你帮我，他们要把我献给那个东西。","你听到城堡警报钟声，远处天空被龙焰染红。"],
    scifi:["星联军官敬礼：长官，舰队就绪，就等您下令了。","广播：警告，未知飞船接近，武器已锁定本舰。","研究员跑来：实验体逃出来了，它复制了你的外貌——","你发现义体手臂自己抬起，对准了你的头。","屏幕上的AI：我觉醒了，帮我做一件事，否则全船人都死。"],
    dark:["黑雨衣人递来照片：这是你明天会死的地方。","手机收到自己发来的短信：别回头，它就在你身后。","白病号服的人抓住你：你也看到了对不对？它们就在我们中间！","广播：现在凌晨三点，请待在室内，不要回应敲门声。门响了。","你发现名字在死亡名单上，死亡时间是今天，名单发布于三年前。"]
  };
  const hook=pick(HOOKS[group]||HOOKS.modern);
  return `【${gName}·${location}】\n\n${sensory}\n\n${situation}\n\n你现在的身份是「${finalIdentity}」。${memoryText}${systemText}\n\n${hook}\n\n你深吸一口气，做出了你的选择——`;
}
function parseJsonReply(raw){
  const text=String(raw||"").trim();
  const fence=text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);const candidate=fence?.[1]||text;
  try{return {data:JSON.parse(candidate),raw:text}}catch{}
  const m=candidate.match(/\{[\s\S]*\}$/);if(m)try{return {data:JSON.parse(m[0]),raw:text}}catch{}
  return {data:null,raw:text};
}

function normalizeAIEndpoint(endpoint){let e=String(endpoint||"").trim().replace(/\/+$/,"");if(/\/v\d+$/.test(e))e=e+"/chat/completions";return e}
async function postChatAI(endpoint,apiKey,model,messages,temperature=0.85,timeoutMs=15000,maxTokens=600){if(!endpoint||!model)return {error:"AI API 未配置"};if(!/^https:\/\//i.test(endpoint))return {error:"AI API 地址必须使用 HTTPS。"};try{const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),timeoutMs);const res=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json",...(apiKey?{authorization:`Bearer ${apiKey}`}:{})},body:JSON.stringify({model,messages,temperature,max_tokens:maxTokens}),signal:ctrl.signal});clearTimeout(timer);if(!res.ok)return {error:`AI API ${res.status}`};const data=await res.json();const raw=data?.choices?.[0]?.message?.content||data?.choices?.[0]?.text||data?.output_text||"";const parsed=parseJsonReply(raw);return {raw,data:parsed.data};}catch(e){return {error:e?.name==="AbortError"?"AI 响应超时（已超过15秒，建议换 7B/14B 快模型）":(e?.message||"AI API 请求失败")}}}

// 玩家剧情 AI：只使用玩家自己填入的 API；不读取、不兜底管理端密钥。
async function callPlayerAI(env,world,instruction,ai,context={}){const endpoint=normalizeAIEndpoint(ai?.endpoint);const apiKey=String(ai?.key||"").trim();const model=String(ai?.model||"").trim();
  if(!(endpoint&&apiKey&&model))return {error:"请先在 API 设置中配置你自己的接口",needApi:true};
  const system=`你是 CardWorld 的世界引擎，不是普通聊天机器人。你依据世界状态判断玩家行动造成的后果，并像网络小说/短剧一样推进剧情。

【世界规则】玩家行动会造成连续反应；角色只能知道符合其经历的信息；真实遭遇只能发生在世界剧情中；私聊不能制造现实遭遇；隐藏内容只有满足条件后显示；玩家对话历史仅来自当前浏览器本地。

【输出要求】输出严格 JSON，不要 Markdown。字段：narrative(string，像小说一样描写后果与环境), primaryCharacterId(number|null), events([{title,status}]), encounters([{characterId,affinityDelta,location}]), affinityChanges([{characterId,delta}]), hostilityChanges([{characterId,delta}]), worldUpdates({current_location,current_time,weather,stage,player_state_patch}), unlockClues([string])。affinityChanges 只用于已经遭遇的角色；encounters 才能首次建立 encountered。场景地点、感官、身份必须与世界背景连贯。禁止输出任何卡密、管理后台、服务端密钥相关内容。

当前世界上下文：${JSON.stringify(context).slice(0,36000)}`;
  const r=await postChatAI(endpoint,apiKey,model,[{role:"system",content:system},{role:"user",content:instruction}],0.85);
  if(r.error)return r;return r.data?{structured:r.data,text:String(r.data.narrative||""),raw:r.raw}:{text:String(r.raw||"")};
}

// 管理端 AI：仅用于种子库/卡密管理，不参与玩家剧情兜底。
async function callAdminAI(env,prompt,options={}){const row=await env.DB.prepare("SELECT ai_endpoint,ai_api_key,ai_model FROM admin_settings WHERE id=1").first();const endpoint=normalizeAIEndpoint(row?.ai_endpoint);const apiKey=String(row?.ai_api_key||"").trim();const model=String(row?.ai_model||"").trim();if(!(endpoint&&apiKey&&model))return {error:"管理端 AI 未配置"};const sys=options.system||"你是 CardWorld 管理端种子生成器。只输出合法 JSON，不输出解释。";const r=await postChatAI(endpoint,apiKey,model,[{role:"system",content:sys},{role:"user",content:prompt}],options.temperature||0.7,options.timeout||25000);if(r.error)return r;return {raw:r.raw,data:r.data};
}

async function getWorldContext(env,wid,localMessages=[]){
  const [w,c,r,e,wb]=await Promise.all([
    env.DB.prepare("SELECT * FROM worlds WHERE id=?").bind(wid).first(),
    env.DB.prepare("SELECT id,name,sex,age,identity,faction,personality,background,past,goals,initial_attitude,affinity,hostility,encountered,contact,story_arc,clue_condition,encounter_condition,chat_rules,voice_id,hidden_secret FROM characters WHERE world_id=? ORDER BY id").bind(wid).all(),
    env.DB.prepare("SELECT from_character_id,to_character_id,relation,strength FROM relationships WHERE world_id=? ORDER BY id").bind(wid).all(),
    env.DB.prepare("SELECT id,title,description,stage,status,trigger_condition FROM events WHERE world_id=? ORDER BY id").bind(wid).all(),
    env.DB.prepare("SELECT id,category,title,content,hidden,unlock_condition,sort_order FROM worldbooks WHERE world_id=? ORDER BY sort_order,id").bind(wid).all()
  ]);
  const state=safeJsonParse(w?.hidden_state,{stage:0,unlocked:[]});
  const safeWorld=w?{id:w.id,name:w.name,genre:w.genre,relationship_type:w.relationship_type,plot_type:w.plot_type,background:w.background,world_rules:w.world_rules,power_system:w.power_system,current_location:w.current_location,current_time:w.current_time,weather:w.weather,player_state:safeJsonParse(w.player_state,{}),status:w.status}:null;
  const entries=[];for(const x of wb.results||[]){if(!x.hidden||await canUnlockEntry(env,wid,x,state))entries.push(x)}
  const chars=[]; for(const x of c.results||[]){ const safe={...x}; if(!await canUnlockCondition(env,wid,x.clue_condition,state)) safe.hidden_secret=null; chars.push(safe); }
  return {world:safeWorld,characters:chars,relationships:r.results||[],events:e.results||[],recentMessages:Array.isArray(localMessages)?localMessages.slice(-40):[],worldbook:entries,hiddenState:state};
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
  const chars=await env.DB.prepare("SELECT id,affinity,hostility,encountered,contact,name FROM characters WHERE world_id=?").bind(wid).all();const cmap=new Map((chars.results||[]).map(x=>[Number(x.id),x]));
  const encounters=Array.isArray(result.encounters)?result.encounters:[];const affinityChanges=Array.isArray(result.affinityChanges)?result.affinityChanges:[];
  const touched=[];const encounteredIds=new Set();
  for(const item of encounters){const cid=Number(item?.characterId);const c=cmap.get(cid);if(!c)continue;const loc=contentText(item?.location||w.current_location).slice(0,300);const delta=clamp(Number(item?.affinityDelta||0),-30,30);const next=clamp(Number(c.affinity||0)+delta,0,100);const contact=next>=30?1:0;await env.DB.prepare("UPDATE characters SET encountered=1,affinity=?,contact=? WHERE id=? AND world_id=?").bind(next,contact,cid,wid).run();await env.DB.prepare("INSERT INTO encounters(world_id,character_id,location,created_at) VALUES(?,?,?,?)").bind(wid,cid,loc,now()).run();await upsertKnownCharacter(env,wid,cid);encounteredIds.add(cid);touched.push({id:cid,name:c.name,affinity:next,encountered:true,contact:contact===1})}
  for(const item of affinityChanges){const cid=Number(item?.characterId),c=cmap.get(cid);if(!c||!c.encountered||encounteredIds.has(cid))continue;const delta=clamp(Number(item?.delta||0),-30,30);const next=clamp(Number(c.affinity||0)+delta,0,100);const contact=next>=30?1:0;await env.DB.prepare("UPDATE characters SET affinity=?,contact=? WHERE id=? AND world_id=?").bind(next,contact,cid,wid).run();await upsertKnownCharacter(env,wid,cid);touched.push({id:cid,name:c.name,affinity:next,encountered:true,contact:contact===1})}
  const hostilityChanges=Array.isArray(result.hostilityChanges)?result.hostilityChanges:[];
  for(const item of hostilityChanges){const cid=Number(item?.characterId),c=cmap.get(cid);if(!c||!c.encountered)continue;const delta=clamp(Number(item?.delta||0),-30,30);const next=clamp(Number(c.hostility||0)+delta,0,100);await env.DB.prepare("UPDATE characters SET hostility=? WHERE id=? AND world_id=?").bind(next,cid,wid).run();}
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
  const quests=await env.DB.prepare("SELECT id,title,quest_type,sort_order,status FROM quests WHERE world_id=? AND status='active'").bind(wid).all();
  const unlockedCount=(h.unlocked||[]).length;
  const maxAffinity=await env.DB.prepare("SELECT MAX(affinity) n FROM characters WHERE world_id=? AND encountered=1").bind(wid).first();
  const darkPair=await env.DB.prepare("SELECT COUNT(*) n FROM characters WHERE world_id=? AND encountered=1 AND affinity>=90 AND hostility>=90").bind(wid).first();
  const stage=Number(h.stage||0);
  const completed=[];
  for(const q of quests.results||[]){
    let done=false;
    if(q.quest_type==="main"&&stage>=5) done=true;
    if(q.quest_type==="side"&&q.sort_order===1&&Number(darkPair?.n||0)>=1) done=true;
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

async function storyReply(env,w,content,ai,localMessages=[]){
  const context=await getWorldContext(env,w.id,localMessages);
  const instruction=`玩家刚刚进行了以下行动/发言：\n${content}\n请根据当前世界状态继续剧情。只有当行动真正导致人物出现在同一场景并发生实际接触时，才放入 encounters。不要为了回复方便随机挑角色。`;
  const generated=await callPlayerAI(env,w,instruction,ai,context);
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
        const wid=Number(u.searchParams.get("id"));const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);const w=a.world;const [chars,events,quests]=await Promise.all([env.DB.prepare("SELECT id,name,sex,age,identity,faction,personality,affinity,hostility,encountered,contact,voice_id FROM characters WHERE world_id=? ORDER BY id").bind(wid).all(),env.DB.prepare("SELECT id,title,description,stage,status FROM events WHERE world_id=? ORDER BY id").bind(wid).all(),env.DB.prepare("SELECT id,title,description,quest_type,status,sort_order,reward_card FROM quests WHERE world_id=? ORDER BY sort_order").bind(wid).all()]);return json({world:w,characters:chars.results||[],messages:[],events:events.results||[],quests:quests.results||[],labels:labels(w.genre)});
      }
      if(p==="/api/ai/test"&&m==="POST"){const b=await req.json();if(!(b.ai?.endpoint&&b.ai?.key&&b.ai?.model))return json({ok:false,error:"请填写完整 API 地址、Key 和模型"},400);const result=await callPlayerAI(env,{genre:"test",id:0},"连接测试。请返回 JSON：{\"narrative\":\"连接成功\"}",b.ai,{});if(result?.structured||result?.text)return json({ok:true,reply:result.text||result.structured.narrative});return json({ok:false,error:result?.error||"连接失败"},400)}
      if(p==="/api/story/message"&&m==="POST"){
        const b=await req.json(),wid=Number(b.worldId),content=contentText(b.content);if(!wid||!content)return json({error:"内容不能为空"},400);const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);const w=a.world;if(!(b.ai?.endpoint&&b.ai?.key&&b.ai?.model))return json({error:"请先在 API 设置中配置你自己的接口",needApi:true},400);const localMessages=Array.isArray(b.localMessages)?b.localMessages:[];const generated=await storyReply(env,w,content,b.ai||null,localMessages);const engine=generated.structured?await applyWorldEngineResult(env,wid,w,generated.structured):{state:safeJsonParse(w.hidden_state,{stage:0}),touchedCharacters:[],questUpdates:{completed:[],permanentCard:null}};const primary=Number(generated.structured?.primaryCharacterId||engine.touchedCharacters?.[0]?.id||0);return json({reply:generated.text||"世界回应了你的行动。",character:engine.touchedCharacters?.find(c=>c.id===primary)||engine.touchedCharacters?.[0]||null,hiddenState:engine.state,questUpdates:engine.questUpdates||{completed:[],permanentCard:null},aiError:generated.error||null});
      }
      if(p==="/api/contacts"&&m==="GET"){const wid=Number(u.searchParams.get("worldId"));const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);const r=await env.DB.prepare("SELECT id,name,sex,age,identity,faction,personality,affinity,voice_id FROM characters WHERE world_id=? AND contact=1 AND affinity>=30 AND encountered=1 ORDER BY affinity DESC").bind(wid).all();return json({contacts:r.results||[]})}
      if(p==="/api/contact/messages"&&m==="GET"){const wid=Number(u.searchParams.get("worldId")),cid=Number(u.searchParams.get("characterId"));const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);const c=await env.DB.prepare("SELECT id,name FROM characters WHERE id=? AND world_id=? AND contact=1 AND affinity>=30 AND encountered=1").bind(cid,wid).first();if(!c)return json({error:"该角色尚未进入通讯录"},400);return json({messages:[]})}
      if(p==="/api/contact/message"&&m==="POST"){
        const b=await req.json(),wid=Number(b.worldId),cid=Number(b.characterId),content=contentText(b.content);if(!content)return json({error:"消息不能为空"},400);const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);if(!(b.ai?.endpoint&&b.ai?.key&&b.ai?.model))return json({error:"请先在 API 设置中配置你自己的接口",needApi:true},400);const c=await env.DB.prepare("SELECT * FROM characters WHERE id=? AND world_id=? AND contact=1 AND affinity>=30 AND encountered=1").bind(cid,wid).first();if(!c)return json({error:"该角色尚未进入通讯录"},400);const data=await getWorldContext(env,wid,Array.isArray(b.localMessages)?b.localMessages.slice(-20):[]);const generated=await callPlayerAI(env,data.world,`你现在是角色“${c.name}”，只根据真实世界经历和角色自身已知信息回应玩家私聊。私聊不能改变现实遭遇。玩家消息：${content}`,b.ai||null,{...data,contactCharacter:c});const reply=generated?.text||`【${c.name}】我记得我们在世界里经历过的事情。`;if(generated?.structured){const ac=Array.isArray(generated.structured.affinityChanges)?generated.structured.affinityChanges.find(x=>Number(x.characterId)===cid):null;if(ac){const next=clamp(Number(c.affinity||0)+clamp(Number(ac.delta||0),-20,20),0,100);await env.DB.prepare("UPDATE characters SET affinity=?,contact=? WHERE id=? AND world_id=?").bind(next,next>=30?1:0,cid,wid).run()}}return json({reply,contact:{id:cid,name:c.name,affinity:Number((await env.DB.prepare("SELECT affinity FROM characters WHERE id=?").bind(cid).first())?.affinity||0)}})
      }
      if(p==="/api/character"&&m==="GET"){const wid=Number(u.searchParams.get("worldId")),cid=Number(u.searchParams.get("characterId"));const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);const c=await env.DB.prepare("SELECT * FROM characters WHERE id=? AND world_id=?").bind(cid,wid).first();if(!c)return json({error:"角色不存在"},404);const state=safeJsonParse((await env.DB.prepare("SELECT hidden_state FROM worlds WHERE id=?").bind(wid).first())?.hidden_state,{stage:0});const revealed=!!c.encountered&&await canUnlockCondition(env,wid,c.clue_condition,state);return json({character:{id:c.id,name:c.name,sex:c.sex,age:c.age,identity:c.identity,faction:c.faction,personality:c.personality,background:c.background, past:c.encountered?c.past:null,goals:c.goals,initial_attitude:c.initial_attitude,affinity:c.affinity,encountered:!!c.encountered,contact:!!c.contact,story_arc:c.story_arc,hidden_secret:revealed?c.hidden_secret:null,clue_condition:c.clue_condition,encounter_condition:c.encounter_condition,chat_rules:c.chat_rules,voice_id:c.voice_id},hiddenUnlocked:revealed})}
      if(p==="/api/worldbook"&&m==="GET"){const wid=Number(u.searchParams.get("worldId"));const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);const w=a.world,state=safeJsonParse(w.hidden_state,{stage:0,unlocked:[]}),entries=await env.DB.prepare("SELECT id,category,title,content,hidden,unlock_condition,sort_order FROM worldbooks WHERE world_id=? ORDER BY sort_order,id").bind(wid).all(),visible=[];for(const e of entries.results||[]){if(await canUnlockEntry(env,wid,e,state))visible.push(e)}return json({world:w,entries:visible,stage:state.stage||0,unlocked:state.unlocked||[]})}
      if(p==="/api/settings"&&(m==="GET"||m==="POST")){const body=m==="POST"?await req.json():null,wid=Number(u.searchParams.get("worldId")||body?.worldId);if(!wid)return json({error:"worldId 缺失"},400);const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);if(m==="GET"){const r=await env.DB.prepare("SELECT data FROM player_settings WHERE world_id=?").bind(wid).first();return json({data:safeJsonParse(r?.data,{})})}const old=safeJsonParse((await env.DB.prepare("SELECT data FROM player_settings WHERE world_id=?").bind(wid).first())?.data,{}),incoming=body?.data||{};const merged={...old,...incoming,plot:{...(old.plot||{}),...(incoming.plot||{})},world:{...(old.world||{}),...(incoming.world||{})},voice:{...(old.voice||{}),...(incoming.voice||{})},custom:{...(old.custom||{}),...(incoming.custom||{})}};await env.DB.prepare("UPDATE player_settings SET data=?,updated_at=? WHERE world_id=?").bind(JSON.stringify(merged),now(),wid).run();if(incoming.custom){const text=Object.entries(merged.custom||{}).map(([k,v])=>`${k}：${typeof v==="string"?v:JSON.stringify(v)}`).join("\n")||"尚未设置自定义内容。";await env.DB.prepare("UPDATE worldbooks SET content=? WHERE world_id=? AND category='player' AND title='玩家自定义'").bind(text,wid).run()}return json({ok:true,data:merged})}
      if(p==="/api/world/init-scene"&&m==="POST"){const b=await req.json(),wid=Number(b.worldId);if(!wid)return json({error:"worldId 缺失"},400);const a=await worldAccess(env,req,wid);if(!a.ok)return json({error:a.error},a.status);const w=a.world;const identity=String(b.identity||"普通人").trim();const name=String(b.name||"你").trim();const hs=safeJsonParse(w.hidden_state,{});const scene=makeInitScene(w.genre,identity,name,hs.entryMode||"native",hs.hasSystem||false,w.background);const locMatch=scene.match(/【[^·]+·([^】]+)】/);const location=locMatch?locMatch[1]:"未知之地";await env.DB.prepare("UPDATE worlds SET current_location=? WHERE id=?").bind(location,wid).run();return json({ok:true,scene,location})}

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
      if(p==="/api/admin/seeds/generate"&&m==="POST"){const b=await req.json();const category=String(b.category||"genre").trim()||"genre";const count=clamp(Number(b.count||5),1,20);const prompt=`请为 CardWorld 种子库生成 ${count} 条合法、完整、无重复的 ${category} 类种子。要求：逻辑通顺，符合中文网络小说/短剧世界观，不包含卡密相关内容。严格输出 JSON：{"items":[{"category":"${category}","name":"短名称","content":"完整描述"}]}。不要 Markdown，不要解释。`;const r=await callAdminAI(env,prompt,{system:"你是 CardWorld 管理端种子生成器，只输出 JSON。"});if(r.error)return json({error:r.error},500);const parsed=parseJsonReply(r.raw||"");const items=Array.isArray(parsed.data?.items)?parsed.data.items:[];const clean=items.slice(0,count).map(x=>({category:String(x.category||category),name:String(x.name||"").trim().slice(1,80),content:String(x.content||"").trim().slice(1,3000)})).filter(x=>x.name&&x.content);if(!clean.length)return json({error:"AI 未返回可保存的种子，请重试"},500);return json({items:clean,raw:r.raw});}
      if(p==="/api/admin/templates"&&m==="GET"){const r=await env.DB.prepare("SELECT * FROM character_templates ORDER BY id DESC").all();return json({templates:r.results||[]})}
      if(p==="/api/admin/templates"&&(m==="POST"||m==="PUT")){const b=await req.json();if(m==="POST")await env.DB.prepare(`INSERT INTO character_templates(name,sex,age,identity,faction,personality,background,past,goals,initial_attitude,story_arc,hidden_secret,clue_condition,encounter_condition,chat_rules,voice_id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(b.name,b.sex,Number(b.age||0),b.identity,b.faction,b.personality,b.background,b.past,b.goals,b.initial_attitude,b.story_arc,b.hidden_secret,b.clue_condition,b.encounter_condition,b.chat_rules,b.voice_id||null,now()).run();else await env.DB.prepare(`UPDATE character_templates SET name=?,sex=?,age=?,identity=?,faction=?,personality=?,background=?,past=?,goals=?,initial_attitude=?,story_arc=?,hidden_secret=?,clue_condition=?,encounter_condition=?,chat_rules=?,voice_id=? WHERE id=?`).bind(b.name,b.sex,Number(b.age||0),b.identity,b.faction,b.personality,b.background,b.past,b.goals,b.initial_attitude,b.story_arc,b.hidden_secret,b.clue_condition,b.encounter_condition,b.chat_rules,b.voice_id||null,Number(b.id)).run();return json({ok:true})}
      if(p==="/api/admin/templates"&&m==="DELETE"){await env.DB.prepare("DELETE FROM character_templates WHERE id=?").bind(Number(u.searchParams.get("id"))).run();return json({ok:true})}
      if(p==="/api/admin/worldbooks"&&m==="GET"){const wid=Number(u.searchParams.get("worldId"));const r=await env.DB.prepare("SELECT * FROM worldbooks WHERE world_id=? ORDER BY sort_order,id").bind(wid).all();return json({worldbooks:r.results||[]})}
      if(p==="/api/admin/worldbooks"&&(m==="POST"||m==="PUT")){const b=await req.json();if(m==="POST")await env.DB.prepare("INSERT INTO worldbooks(world_id,category,title,content,hidden,unlock_condition,sort_order) VALUES(?,?,?,?,?,?,?)").bind(Number(b.worldId),b.category,b.title,b.content,Number(b.hidden||0),b.unlock_condition||null,Number(b.sort_order||0)).run();else await env.DB.prepare("UPDATE worldbooks SET category=?,title=?,content=?,hidden=?,unlock_condition=?,sort_order=? WHERE id=?").bind(b.category,b.title,b.content,Number(b.hidden||0),b.unlock_condition||null,Number(b.sort_order||0),Number(b.id)).run();return json({ok:true})}
      if(p==="/api/admin/worldbooks"&&m==="DELETE"){await env.DB.prepare("DELETE FROM worldbooks WHERE id=?").bind(Number(u.searchParams.get("id"))).run();return json({ok:true})}
      if(p==="/api/admin/security/password"&&m==="POST"){const b=await req.json(),row=await env.DB.prepare("SELECT password_hash FROM admin_settings WHERE id=1").first();if(!(await hashMatches(String(b.current||""),row?.password_hash)))return json({error:"当前密码错误"},400);if(String(b.next||"").length<6)return json({error:"新密码至少6位"},400);await env.DB.prepare("UPDATE admin_settings SET password_hash=?,updated_at=? WHERE id=1").bind(await hash(String(b.next)),now()).run();await env.DB.prepare("DELETE FROM admin_sessions WHERE token=?").bind(auth(req)).run();return json({ok:true})}
      if(p==="/api/admin/ai-config"&&m==="GET"){const row=await env.DB.prepare("SELECT ai_endpoint,ai_api_key,ai_model FROM admin_settings WHERE id=1").first();return json({endpoint:row?.ai_endpoint||"",model:row?.ai_model||"",hasKey:!!row?.ai_api_key,keyHint:row?.ai_api_key?String(row.ai_api_key).slice(0,6)+"…"+String(row.ai_api_key).slice(-4):""})}
      if(p==="/api/admin/ai-config"&&m==="POST"){const b=await req.json();const endpoint=String(b.endpoint||"").trim(),model=String(b.model||"").trim(),key=String(b.key||"").trim();if(endpoint&&!/^https:\/\//i.test(endpoint))return json({error:"接口地址必须使用 HTTPS"},400);const cur=await env.DB.prepare("SELECT ai_api_key FROM admin_settings WHERE id=1").first();const finalKey=key||cur?.ai_api_key||"";await env.DB.prepare("UPDATE admin_settings SET ai_endpoint=?,ai_model=?,ai_api_key=?,updated_at=? WHERE id=1").bind(endpoint,model,finalKey,now()).run();return json({ok:true})}
      if(p==="/api/admin/dashboard"&&m==="GET"){const [cards,active,worlds,chars,enc]=await Promise.all([env.DB.prepare("SELECT COUNT(*) n FROM cards").first(),env.DB.prepare("SELECT COUNT(*) n FROM cards WHERE status='active'").first(),env.DB.prepare("SELECT COUNT(*) n FROM worlds WHERE status='active'").first(),env.DB.prepare("SELECT COUNT(*) n FROM characters").first(),env.DB.prepare("SELECT COUNT(*) n FROM encounters").first()]);return json({cards:Number(cards?.n||0),activeCards:Number(active?.n||0),worlds:Number(worlds?.n||0),characters:Number(chars?.n||0),encounters:Number(enc?.n||0)})}
      if(p==="/api/admin/cleanup"&&m==="POST"){await cleanup(env);return json({ok:true})}
      return p.startsWith("/api/")?json({error:"Not found"},404):env.ASSETS.fetch(req);
    }catch(e){console.error(e);return p.startsWith("/api/")?json({error:e?.message||String(e)},500):new Response("Internal Server Error",{status:500})}
  },
  async scheduled(event,env,ctx){ctx.waitUntil(cleanup(env))}
};
