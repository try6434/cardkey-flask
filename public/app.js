const $ = (s, root = document) => root.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const STORE = "cardworld_local_v4";
const fmtTs = t => t ? new Date(Number(t) * 1000).toLocaleString() : "";

let state = {
  worldId: null,
  sessionToken: "",
  labels: ["通讯录", "世界书", "设置", "语音"],
  world: null,
  characters: [],
  messages: [],
  events: [],
  contacts: [],
  activeContact: null,
  emojiOpen: false,
  plusOpen: false,
  sheet: null,
  ai: { endpoint: "", key: "", model: "" },
  voice: { enabled: true, autoRead: false, rate: 1, pitch: 1, volume: 1, voices: {}, api: { endpoint:"", key:"", model:"", voice:"alloy" } },
  prefs: { theme: "system", pace: "normal" },
  streaming: false
};

try { Object.assign(state, JSON.parse(localStorage.getItem(STORE) || "{}")); } catch {}
function save() {
  localStorage.setItem(STORE, JSON.stringify({
    worldId: state.worldId,
    sessionToken: state.sessionToken,
    labels: state.labels,
    ai: state.ai,
    voice: state.voice,
    prefs: state.prefs
  }));
}

async function api(path, options = {}) {
  const headers = { "content-type": "application/json", ...(options.headers || {}) };
  if (state.sessionToken && !headers.authorization) headers.authorization = `Bearer ${state.sessionToken}`;
  const res = await fetch(path, { ...options, headers });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    if (state.worldId && (res.status === 401 || res.status === 410) && !path.startsWith("/api/auth/")) { idbDelete(state.worldId).catch(()=>{}); state.sessionToken = ""; save(); renderLogin(); }
    throw Object.assign(new Error(data?.error || `请求失败 ${res.status}`), { data, status: res.status });
  }
  return data;
}

const IDB_NAME = "cardworld_worlds_v1";
function idbOpen(){return new Promise((resolve,reject)=>{const req=indexedDB.open(IDB_NAME,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains("worlds"))db.createObjectStore("worlds",{keyPath:"worldId"})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function idbGet(wid){const db=await idbOpen();return new Promise((resolve,reject)=>{const rq=db.transaction("worlds","readonly").objectStore("worlds").get(wid);rq.onsuccess=()=>resolve(rq.result||{worldId:wid,messages:[],contacts:{}});rq.onerror=()=>reject(rq.error)})}
async function idbPut(obj){const db=await idbOpen();return new Promise((resolve,reject)=>{const tx=db.transaction("worlds","readwrite");tx.objectStore("worlds").put(obj);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
async function idbDelete(wid){const db=await idbOpen();return new Promise((resolve,reject)=>{const tx=db.transaction("worlds","readwrite");tx.objectStore("worlds").delete(wid);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
async function idbAppendStory(wid,msgs){const cur=await idbGet(wid);cur.messages=(cur.messages||[]).concat(msgs).slice(-800);await idbPut(cur)}
async function idbSaveMessages(wid,msgs){const cur=await idbGet(wid);cur.messages=(msgs||[]).slice(-800);await idbPut(cur)}
async function idbLoadStory(wid){return (await idbGet(wid)).messages||[]}
async function idbAppendContact(wid,cid,msgs){const cur=await idbGet(wid);cur.contacts=cur.contacts||{};cur.contacts[cid]=(cur.contacts[cid]||[]).concat(msgs).slice(-300);await idbPut(cur)}
async function idbLoadContact(wid,cid){return (await idbGet(wid)).contacts?.[cid]||[]}

async function refreshWorldState(){
  const data=await api(`/api/world?id=${state.worldId}`);
  state.world=data.world; state.characters=data.characters||[]; state.events=data.events||[]; state.quests=data.quests||[]; state.labels=data.labels||state.labels; save(); return data;
}
async function loadWorld() {
  await refreshWorldState();
  state.messages = await idbLoadStory(state.worldId);
  const introKey = `cw_intro_${state.worldId}`;
  const needIntro = !localStorage.getItem(introKey);
  if (needIntro) {
    $("#app").innerHTML = "";
    showIntro();
  } else {
    renderWorld();
    scrollBottom();
  }
}

function applyTheme(){document.documentElement.dataset.theme=state.prefs.theme||"system";}

function renderEntry() {
  if (state.worldId && state.world && state.sessionToken) renderWorld();
  else renderLogin();
}

function renderLogin() {
  $("#app").innerHTML = `
    <div class="screen login-screen">
      <div class="login-wrap">
        <div class="login-title">CardWorld</div>
        <div class="login-sub">请输入卡密进入世界</div>
        <div class="login-card">
          <form id="cardForm">
            <input id="cardCode" class="login-input" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="输入卡密" required>
            <div id="cardMsg" class="err-tip"></div>
            <button id="loginBtn" class="login-btn" type="submit">进入世界</button>
          </form>
        </div>
        <div id="renewBox" class="renew-box hidden"></div>
      </div>
    </div>`;

  const input = $("#cardCode");
  const msg = $("#cardMsg");
  const btn = $("#loginBtn");

  input.addEventListener("input", () => {
    input.value = input.value.toUpperCase().replace(/\s/g, "");
    msg.textContent = "";
    msg.classList.remove("show");
    input.classList.remove("shake");
  });

  $("#cardForm").onsubmit = async e => {
    e.preventDefault();
    const code = input.value.trim().toUpperCase();
    if (!code) return;
    msg.textContent = "";
    msg.classList.remove("show");
    btn.disabled = true;
    btn.textContent = "验证中…";
    try {
      const data = await api("/api/auth/card", { method: "POST", body: JSON.stringify({ code }) });
      if (data.admin) {
        location.href = `/admin.html#${encodeURIComponent(data.token)}`;
        return;
      }
      state.worldId = data.worldId;
      state.sessionToken = data.sessionToken || "";
      state.labels = data.labels || state.labels;
      await loadWorld();
    } catch (err) {
      btn.disabled = false;
      btn.textContent = "进入世界";
      msg.textContent = err.message || "卡密无效";
      msg.classList.add("show");
      input.classList.add("shake");
      setTimeout(() => input.classList.remove("shake"), 250);
      if (err.data?.renewalRequired) {
        msg.textContent = "卡密已到期，请使用同类型卡续期。";
        showRenewal(err.data.duration_seconds, code);
      }
    }
  };
  setTimeout(() => input.focus(), 100);
}

function durationName(seconds){return ({3600:"1小时",18000:"5小时",43200:"12小时",86400:"1天",604800:"7天",1296000:"15天",2592000:"30天"})[Number(seconds)] || "同类型";}
function showRenewal(durationSeconds,currentCode){
  const box=$("#renewBox"); if(!box) return;
  box.classList.remove("hidden");
  box.innerHTML=`<div class="form-card"><div class="contact-name">续期世界</div><div class="small" style="margin:6px 0 12px">原卡类型：${durationName(durationSeconds)}。必须使用完全相同类型的新卡，续期后仍保留原世界。</div><div class="field"><label>续期卡密</label><input id="renewalCode" class="input" placeholder="输入同类型新卡"></div><button id="renewBtn" class="primary" style="margin-top:8px">立即续期</button><div id="renewMsg" class="msg" style="margin-top:8px"></div></div>`;
  $("#renewBtn").onclick=async()=>{const r=$("#renewMsg");r.textContent="正在续期…";try{const data=await api("/api/card/renew",{method:"POST",body:JSON.stringify({currentCode,renewalCode:$("#renewalCode").value.trim()})});state.worldId=data.worldId;state.sessionToken=data.sessionToken||"";state.labels=data.labels||state.labels;await loadWorld();}catch(e){r.textContent=e.message;}};
}

function renderWorld() {
  const w = state.world || {};
  const labels = state.labels;
  $("#app").innerHTML = `
    <div class="screen">
      <div class="topbar">
        <div class="meta">
          <div class="world-name">${esc(w.name || "CardWorld")}</div>
          <div class="world-sub">${esc(w.current_location || "")} · ${esc(w.current_time || "")} · ${esc(w.weather || "")}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button id="questBtn" class="quest-btn" title="任务">📜</button>
        </div>
      </div>
      <main id="story" class="story">
        <div class="scene">
          ${renderMessages()}
        </div>
      </main>
      <div class="composer-wrap">
        ${state.emojiOpen ? emojiPanel() : ""}
        ${state.plusOpen ? plusPanel() : ""}
        <div class="composer-row">
          <button class="icon-btn" id="emojiBtn" aria-label="emoji">🙂</button>
          <div class="input-shell">
            <textarea id="storyInput" class="story-input" rows="1" placeholder="输入你想说的话……"></textarea>
            <button id="sendBtn" class="send" aria-label="发送">↑</button>
          </div>
          <button id="plusBtn" class="icon-btn composer-plus ${state.plusOpen ? "open" : ""}" aria-label="更多">${state.plusOpen ? "−" : "＋"}</button>
        </div>
      </div>
    </div>`;
  bindWorldUI();
  const bpEl=$("#bpName");
  if(bpEl)bpEl.textContent=bpName(state.world?.genre||"");
}

function avatarHTML(avatar,size){
  if(!avatar)return "";
  if(avatar.startsWith("data:"))return `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
  return avatar;
}
function charAvatar(charId){
  const avs=state.prefs?.charAvatars||{};
  return avs[charId]||"";
}
function renderMessages() {
  if (!state.messages.length) return `<div class="narration" style="text-align:center;color:var(--muted);padding:40px 20px;font-size:15px">你站在这个世界的起点。<br>输入你的行动，开始故事。</div>`;
  return state.messages.map((m,i) => {
    const isUser = m.role === "user";
    const isLast = i === state.messages.length - 1;
    const name = characterName(m.character_id);
    const cid=String(m.character_id||"world");
    const customAvatar=charAvatar(cid);
    // 正在输入
    if (!isUser && isLast && state.streaming && !m.content) {
      return `<div class="msg-row ai"><div class="msg-top"><div class="msg-avatar-col"><div class="msg-avatar-name">${esc(name)}</div><div class="msg-avatar">${esc(name[0]||"世")}</div></div><div class="typing"><span></span><span></span><span></span></div></div></div>`;
    }
    const streaming = (!isUser && isLast && state.streaming && m.content) ? " streaming" : "";
    if (isUser) {
      const avatar=state.prefs?.avatar||"🧑";
      return `<div class="msg-row user"><div class="msg-top"><div class="msg-avatar-col"><div class="msg-avatar user-avatar" style="overflow:hidden">${avatarHTML(avatar)}</div></div><div class="bubble user">${esc(m.content)}</div></div></div>`;
    }
    const avatarContent=customAvatar?avatarHTML(customAvatar):esc(name[0]||"世");
    const canRefresh=!streaming&&!state.streaming;
    return `<div class="msg-row ai"><div class="msg-top"><div class="msg-avatar-col"><div class="msg-avatar-name">${esc(name)}</div><div class="msg-avatar char-avatar-click" data-cid="${cid}" data-cname="${esc(name)}" style="overflow:hidden">${avatarContent}</div></div><div class="bubble ai${streaming}">${esc(m.content)}${streaming ? '<span class="cursor"></span>' : ''}${canRefresh?`<button class="bubble-refresh" data-regen="${i}" title="重新生成">↻</button>`:''}</div></div></div>`;
  }).join("");
}
function characterName(id) {
  if (!id) return "世界";
  return state.characters.find(c => Number(c.id) === Number(id))?.name || "世界";
}
function genreCN(g){
  const map={
    "xianxia":"仙侠","xuanhuan":"玄幻","wuxia":"武侠","cyberpunk":"赛博朋克",
    "post_apocalyptic":"废土末日","steampunk":"蒸汽朋克","space_opera":"星际歌剧",
    "urban_fantasy":"都市异能","historical":"历史穿越","scifi":"科幻","mystery":"悬疑推理",
    "horror":"恐怖惊悚","romance":"言情","slice_of_life":"日常","school":"校园",
    "idol_entertainment":"娱乐圈","e_sports":"电竞","medical":"医疗","legal":"律政",
    "military":"军事","mafia":"黑帮","vampire":"吸血鬼","werewolf":"狼人","fairy_tale":"童话",
    "mythology":"神话","dystopia":"反乌托邦","utopia":"乌托邦","time_travel":"时间穿越",
    "quick_transmigration":"快穿","reincarnation":"重生","system_flow":"系统流",
    "infinite_flow":"无限流","cultivation":"修真","magic":"魔法","dragon_rider":"龙骑士",
    "pirate":"海盗","ninja":"忍者","knight":"骑士","detective":"侦探","spy":"谍战",
    "apartment":"公寓","coffee_shop":"咖啡馆","hospital":"医院","palace":"宫廷",
    "sect":"宗门","empire":"帝国","wasteland":"荒原","underwater":"海底世界",
    "virtual_reality":"虚拟现实","game_world":"游戏世界","isekai":"异世界",
    "modern":"现代都市","ancient":"古代","republic":"民国","tang_dynasty":"唐朝",
    "song_dynasty":"宋朝","ming_dynasty":"明朝","qing_dynasty":"清朝",
    "three_kingdoms":"三国","spring_autumn":"春秋战国","sengoku":"战国",
    "victorian":"维多利亚","western":"西部荒野","noir":"黑色电影",
    "superhero":"超级英雄","mutant":"变种人","ghost":"灵异","demon":"妖魔",
    "gods":"封神","immortal":"神仙","beast_tamer":"御兽","alchemy":"炼丹",
    "formation":"阵法","talisman":"符箓","sword_immortal":"剑仙","demon_cult":"魔教",
    "righteous_path":"正道","jianghu":"江湖","martial_arts":"武林",
    "court_politics":"宫廷斗争","harem":"后宫","revenge":"复仇","coming_of_age":"成长",
    "war":"战争","peace":"和平","survival":"生存","adventure":"冒险",
    "exploration":"探索","treasure_hunt":"寻宝","tomb_raider":"盗墓",
    "hidden_identity":"隐藏身份","dual_identity":"双重身份","amnesia":"失忆",
    "contract":"契约","marriage_of_convenience":"协议婚姻","enemies_to_lovers":"相爱相杀",
    "childhood_sweetheart":"青梅竹马","boss_employee":"上司下属","teacher_student":"师生",
    "doctor_patient":"医患","cop_criminal":"警匪","rich_poor":"贫富差距",
    "age_gap":"年龄差","long_distance":"异地恋","secret_love":"暗恋",
    "love_triangle":"三角恋","polyamory":"多角恋","forbidden_love":"禁忌恋"
  };
  const key=String(g||"").toLowerCase().trim();
  return map[key]||String(g||"未知").toUpperCase();
}
function emojiPanel() {
  const emojis = ["😀","😄","🥹","😂","🙂","😌","😍","🥰","😳","😎","🤔","😐","😮","😴","😭","😡","❤️","🖤","✨","🌙","🔥","🌸","🌧️","☀️","🍵","🍎","🎵","🎮","🫶","👍","👀","🙏","💫","🪽","🐺","🐈","🦊","🐉","☕","📖","⚔️","🗡️","🏹","🔮"];
  return `<div class="emoji-panel">${emojis.map(e => `<button data-emoji="${e}">${e}</button>`).join("")}</div>`;
}
function plusPanel() {
  return `<div class="plus-panel"><div class="plus-grid">
    <button class="plus-item" data-fn="contacts"><span class="ico">👥</span><span class="name">${esc(state.labels[0])}</span><div class="hint">与你真实遭遇过的人物</div></button>
    <button class="plus-item" data-fn="worldbook"><span class="ico">📖</span><span class="name">世界书</span><div class="hint">世界规则与已知信息</div></button>
    <button class="plus-item" data-fn="backpack"><span class="ico">🎒</span><span class="name" id="bpName">背包</span><div class="hint">货币与物品</div></button>
    <button class="plus-item" data-fn="api"><span class="ico">🔑</span><span class="name">API 设置</span><div class="hint">你的 AI 接口</div></button>
    <button class="plus-item" data-fn="persona"><span class="ico">🧑</span><span class="name">我的人设</span><div class="hint">只改你自己，不动 NPC</div></button>
    <button class="plus-item" data-fn="voice"><span class="ico">♫</span><span class="name">语音</span><div class="hint">自定义 TTS 音色</div></button>
  </div></div>`;
}
function bindWorldUI() {
  const input = $("#storyInput");
  const send = $("#sendBtn");
  input.addEventListener("input", () => {
    send.classList.toggle("ready", !!input.value.trim());
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 110) + "px";
  });
  send.onclick = sendStory;
  input.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendStory(); } });

  // NPC 头像点击更换
  document.querySelectorAll(".char-avatar-click").forEach(el=>{
    el.onclick=()=>openCharAvatarEditor(el.dataset.cid,el.dataset.cname);
  });
  // AI 回答刷新按钮
  document.querySelectorAll(".bubble-refresh").forEach(btn=>{
    btn.onclick=(e)=>{e.stopPropagation();regenerateMessage(Number(btn.dataset.regen));};
  });

  $("#emojiBtn").onclick = () => {
    state.emojiOpen = !state.emojiOpen;
    state.plusOpen = false;
    renderWorld();
    focusStory();
  };
  $("#questBtn").onclick = () => openQuests();
  $("#plusBtn").onclick = () => {
    state.plusOpen = !state.plusOpen;
    state.emojiOpen = false;
    renderWorld();
  };
  $(".emoji-panel")?.addEventListener("click", e => {
    const button = e.target.closest("button[data-emoji]");
    if (!button) return;
    const i = $("#storyInput");
    i.value += button.dataset.emoji;
    i.dispatchEvent(new Event("input"));
    focusStory();
  });
  $(".plus-panel")?.addEventListener("click", async e => {
    const button = e.target.closest("[data-fn]");
    if (!button) return;
    const fn = button.dataset.fn;
    state.plusOpen = false;
    renderWorld();
    if (fn === "contacts") openContacts();
    if (fn === "worldbook") openWorldbook();
    if (fn === "backpack") openBackpack();
    if (fn === "api") openAPI();
    if (fn === "persona") openPersona();
    if (fn === "voice") openVoice();
  });
}
function focusStory() { setTimeout(() => $("#storyInput")?.focus(), 40); }
function scrollBottom() { setTimeout(() => { const s = $("#story"); if (s) s.scrollTop = s.scrollHeight; }, 40); }

function ownAPIReady() { const a=state.ai||{}; return !!(a.endpoint&&a.key&&a.model); }
// 从流式 JSON 片段中提取 narrative 文本用于实时显示
function extractNarrative(raw){
  const m=raw.match(/"narrative"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
  if(!m) return "";
  try { return m[1].replace(/\\n/g,"\n").replace(/\\"/g,'"').replace(/\\\\/g,"\\"); }
  catch { return m[1]; }
}

async function sendStory() {
  const input = $("#storyInput");
  const rawContent = input.value.trim();
  if (input.disabled) return;
  if (!ownAPIReady()) { alert("开始剧情前，请先在「API 设置」中配置你自己的接口。"); openAPI(); return; }
  // 空白输入 = 自动推进剧情
  const content = rawContent || "（你没有说话，静静等待事态发展。请根据当前场景自然推进剧情。）";
  input.disabled = true; input.value = "";

  // 1. 立即显示用户消息（空白时不显示用户气泡，直接推进）
  const nowMs=Date.now();
  if(rawContent){
    const userMsg={role:"user",character_id:null,content:rawContent,created_at:nowMs};
    state.messages.push(userMsg);
    await idbAppendStory(state.worldId,[userMsg]);
  }
  // 插入一个空的 AI 气泡，用于流式填充
  const aiMsg={role:"assistant",character_id:null,content:"",created_at:nowMs+1};
  state.messages.push(aiMsg);
  state.streaming=true;
  renderWorld(); scrollBottom();

  try {
    const localMessages=(state.messages||[]).filter(m=>m.content).map(m=>({role:m.role,content:String(m.content).slice(0,800)})).slice(-40);
    const memory=await idbGetMemory(state.worldId);
    // 2. 向 worker 要系统提示
    const prep=await api("/api/story/prepare",{method:"POST",body:JSON.stringify({worldId:state.worldId,content,localMessages,model:state.ai.model,memory})});
    // 3. 浏览器直连硅基流动，流式
    let endpoint=state.ai.endpoint.replace(/\/+$/,"");
    if(!/\/chat\/completions$/.test(endpoint)){endpoint+=(/\/v\d+$/.test(endpoint)?"/chat/completions":"/v1/chat/completions");}
    const resp=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${state.ai.key}`},body:JSON.stringify({model:state.ai.model,messages:[{role:"system",content:prep.system},{role:"user",content:prep.instruction}],temperature:prep.temperature,max_tokens:prep.maxTokens,stream:true,...(prep.extraBody||{})})});
    if(!resp.ok){const t=await resp.text();throw new Error(`AI API ${resp.status}: ${t.slice(0,200)}`)}
    const reader=resp.body.getReader();const decoder=new TextDecoder();let fullContent="";let lastDisplayed="";let sseBuf="";
    while(true){const {done,value}=await reader.read();if(done)break;sseBuf+=decoder.decode(value,{stream:true});
      const lines=sseBuf.split("\n");sseBuf=lines.pop()||"";
      for(const line of lines){if(!line.startsWith("data: "))continue;const payload=line.slice(6).trim();if(payload==="[DONE]")continue;try{const j=JSON.parse(payload);fullContent+=j.choices?.[0]?.delta?.content||"";}catch{}}
      const display=extractNarrative(fullContent);
      if(display&&display!==lastDisplayed){lastDisplayed=display;aiMsg.content=display;renderWorld();scrollBottom();}
    }
    // 4. 流结束，解析完整 JSON 提交给 worker
    const parsed=parseJsonLocal(fullContent);
    const narrative=parsed?.narrative||fullContent.slice(0,1500);
    aiMsg.content=narrative;
    state.messages[state.messages.length-1]=aiMsg;
    await idbAppendStory(state.worldId,[aiMsg]);
    const commit=await api("/api/story/commit",{method:"POST",body:JSON.stringify({worldId:state.worldId,raw:fullContent})});
    aiMsg.character_id=commit.character?.id||null;
    await idbAppendStory(state.worldId,[aiMsg]);
    await refreshWorldState();
    state.streaming=false;
    renderWorld();scrollBottom();
    if(commit.questUpdates?.permanentCard){showPermanentCard(commit.questUpdates.permanentCard);}
    else if(commit.questUpdates?.completed?.length){alert(`任务完成：${commit.questUpdates.completed.map(q=>q.title).join("、")}`);}
    if(state.voice.autoRead) speak(narrative,commit.character?.id);
    await updateMemoryIfNeeded();
    await checkNewContactInvitations();
  } catch(err){
    aiMsg.content="⚠️ "+err.message;
    state.streaming=false;
    renderWorld();scrollBottom();
  } finally {
    const cur=$("#storyInput");if(cur){cur.disabled=false;cur.focus();}
  }
}

function parseJsonLocal(text){
  try{return JSON.parse(text);}catch{}
  const m=text.match(/\{[\s\S]*\}/);if(m){try{return JSON.parse(m[0]);}catch{}}
  return null;
}

async function openContacts() {
  const data = await api(`/api/contacts?worldId=${state.worldId}`);
  state.contacts = data.contacts || [];
  const body = state.contacts.length
    ? state.contacts.map(c => `<button class="list-card" style="width:100%;text-align:left" data-contact="${c.id}"><div class="list-row"><div><div class="contact-name">${esc(c.name)}</div><div class="small">${esc(c.identity)} · ${esc(c.faction)}</div></div><div class="pill">好感 ${c.affinity}</div></div><div class="bar"><i style="width:${c.affinity}%"></i></div></button>`).join("")
    : emptyState("暂时没有进入通讯录的人物", "只有在世界剧情中真实遭遇，并且好感度达到 30 后，角色才会进入这里。");
  openSheet(`<div class="sheet-head"><div class="sheet-title">${esc(state.labels[0])}</div><button class="close" data-close>×</button></div>${body}`);
}

async function openContactChat(cid) {
  const contact = state.contacts.find(c => Number(c.id) === Number(cid));
  if (!contact) return;
  state.activeContact = contact;
  state.contactHistory = await idbLoadContact(state.worldId,cid);
  openSheet(`<div class="sheet-head"><div><div class="sheet-title">${esc(contact.name)}</div><div class="small">好感度 ${contact.affinity}</div></div><button class="close" data-close>×</button></div>
    <div id="contactMessages" class="contact-chat">${(state.contactHistory || []).map(m => `<div class="bubble ${m.role === "user" ? "me" : "them"}">${esc(m.content)}</div>`).join("") || `<div class="small">还没有私聊消息。</div>`}</div>
    <div class="contact-compose"><input id="contactInput" placeholder="发送消息"><button id="contactSend">↑</button></div>`);
  $("#contactSend").onclick = sendContact;
  $("#contactInput").addEventListener("keydown", e => { if (e.key === "Enter") sendContact(); });
}

async function sendContact() {
  const input = $("#contactInput");
  const contact = state.activeContact;
  const content = input.value.trim();
  if (!content || !contact) return;
  if (!ownAPIReady()) { alert("私聊前，请先在「API 设置」中配置你自己的接口。"); openAPI(); return; }
  input.disabled = true;
  try {
    const localMessages=(state.contactHistory||[]).map(m=>({role:m.role,content:String(m.content||"").slice(0,800)})).slice(-20);
    const data = await api("/api/contact/message", { method: "POST", body: JSON.stringify({ worldId: state.worldId, characterId: contact.id, content, ai: state.ai, localMessages }) });
    const nowMs=Date.now();
    const userMsg={role:"user",content,created_at:nowMs};
    const aiMsg={role:"assistant",content:data.reply,created_at:nowMs+1};
    state.contactHistory.push(userMsg,aiMsg);
    await idbAppendContact(state.worldId,contact.id,[userMsg,aiMsg]);
    $("#contactMessages").insertAdjacentHTML("beforeend", `<div class="bubble me">${esc(content)}</div><div class="bubble them">${esc(data.reply)}</div>`);
    contact.affinity=data.contact?.affinity??contact.affinity;
    input.value = "";
    if (state.voice.autoRead) speak(data.reply, contact.id);
  } catch (err) { alert(err.message); }
  finally { input.disabled = false; input.focus(); }
}
function emptyState(title, detail) { return `<div class="list-card"><div class="contact-name">${esc(title)}</div><div class="small" style="margin-top:6px">${esc(detail)}</div></div>`; }

const GENRE_CN={xianxia:"仙侠",wuxia:"武侠",ancient:"古代",alternate_history:"架空历史",primordial:"洪荒",palace:"宫廷",urban:"都市",campus:"校园",workplace:"职场",entertainment:"娱乐圈",esports:"电竞",fantasy:"西方奇幻",medieval:"中世纪",vampire:"血族",norse:"北欧神话","sci-fi":"近未来",interstellar:"星际",cyberpunk:"赛博朋克",apocalypse:"末日",cthulhu:"克苏鲁",infinite:"无限流",quick_transmigration:"快穿",rebirth:"重生",supernatural:"灵异",mystery:"悬疑",historical:"真实历史",time_travel:"穿越",villain:"反派视角",system:"系统流",infinite_dungeon:"无限副本",vampire_noble:"血族贵族",witch:"女巫猎人",beastman:"兽人",merfolk:"海底人鱼",ghost:"阴阳眼",cultivation_failure:"废柴修仙",demon_court:"地府鬼差",heaven:"天庭神仙",martial_soul:"武魂觉醒",mecha:"机甲战争",magical_girl:"魔法少女",urban_immortal:"都市修真",detective:"推理探案",game_world:"游戏世界",ice_apocalypse:"极寒末日",dystopia:"反乌托邦",space_opera:"太空歌剧",deep_sea:"深海恐惧",time_loop:"时间循环",parallel_world:"平行世界",myth_china:"中国神话",myth_greek:"希腊神话",myth_norse:"北欧神话",business:"商战",sports:"竞技体育",post_apocalypse_z:"丧尸末日",sea_apocalypse:"全球淹没",entertainment_rebirth:"重生娱乐圈"};
const REL_CN={BG:"男女",BL:"男男",GL:"女女",beastman:"兽人",poly:"多角",inhuman:"人外",none:"无特定",childhood_sweetheart:"青梅竹马",enemies_to_lovers:"死敌变爱人",contract:"契约关系",arranged:"政治联姻",boss_subordinate:"上下级",teacher_student:"师徒禁忌",soulmate:"灵魂伴侣",one_sided:"单向暗恋",love_triangle:"三角关系",forbidden:"禁忌之恋",reunion:"久别重逢",fake_relationship:"假戏真做",roommates:"同居室友",first_love:"初恋",second_chance:"破镜重圆",power_play:"权力不对等",bodyguard:"保镖与雇主",fated_foe:"宿命之敌",vampire_familiar:"血族眷属",human_monster:"人鬼恋",memory_loss:"一方失忆",fake_marriage:"假结婚",obsession:"偏执狂的爱",yandere:"病娇",tsundere:"傲娇",sunny_x_dark:"阳光配阴郁",beauty_x_beast:"美女与野兽",opposites:"性格互补",rivals:"棋逢对手",saved_by:"救命之恩",betrayal:"被信任的人背叛",mentor:"亦师亦友",strangers_love:"陌生人缘分",online_to_real:"网友奔现",reincarnated:"轮回爱人",rebound:"疗伤式恋爱",cross_species:"跨种族恋",master_servant:"主仆",childhood_enemy:"青梅竹马变仇人",fake_date:"假约会",war_time:"乱世爱情",time_diff:"跨时空通讯",ghost_lover:"人鬼情未了",dragon_rider:"与龙羁绊",demon_pact:"与恶魔交易",god_mortal:"神与凡人",fairy_human:"精灵与人",vampire_human:"吸血鬼与人",wolf_human:"狼人与人类",rival_love:"竞争对手变情侣"};
const PLOT_CN={adventure:"冒险",mystery:"悬疑探索",growth:"成长逆袭",romance:"恋爱",dark:"黑暗致郁",sweet:"甜宠",struggle:"奋斗",revenge:"复仇",power:"权谋",survival:"生存",marriage_first:"先婚后爱",fated:"宿命纠葛",betrayal:"背叛与救赎",harem:"后宫",angst:"虐恋",comedy:"轻松搞笑",thriller:"惊悚",system:"系统流",face_slap:"打脸爽文",warm:"治愈日常",court_intrigue:"宫斗权谋",revenge_arc:"复仇线",rise_from_bottom:"废柴逆袭",hidden_identity:"隐藏身份",power_struggle:"权力斗争",escape:"逃出囚笼",murder_mystery:"连环杀人案",hidden_master:"扮猪吃虎",contract_love:"契约恋爱",amnesia:"失忆",time_pressure:"倒计时",betrayal_return:"被背叛后回归",disguise:"伪装潜入",treasure_hunt:"寻宝探险",war_love:"战争与爱情",cultivation:"修仙突破",infinite_flow:"无限副本",rebirth_adv:"重生碾压",doomsday:"末日生存",alien:"外星接触",small_town:"小镇阴谋",haunted:"闹鬼古宅",medical:"医生救死扶伤",sports_glory:"竞技夺冠",entertainment:"从龙套到影星",business_war:"商战",academy:"学院成长",crown:"夺嫡",rebellion:"起义",cursed_blood:"被诅咒的血脉",double_life:"双重身份",memory_trade:"记忆交易",magic_school:"魔法学院",dragon:"与龙同行",vampire_politics:"血族权谋",fairy_forest:"精灵森林秘密",naval:"大海战",double_spy:"双重间谍",ai_love:"人机恋",dark_desire:"黑暗欲望",obsession:"偏执占有",forbidden_love:"禁忌之恋",slow_burn:"慢热感情",angst:"虐心",thriller:"惊悚悬疑",survival_horror:"生存恐怖"};

async function openWorldbook() {
  const data = await api(`/api/worldbook?worldId=${state.worldId}`);
  const w = data.world;
  const gCN=GENRE_CN[w.genre]||w.genre;
  const rCN=REL_CN[w.relationship_type]||w.relationship_type;
  const pCN=PLOT_CN[w.plot_type]||w.plot_type;
  let sp={}; try { sp=(await api(`/api/settings?worldId=${state.worldId}`)).data||{}; } catch {}
  const customWorld=sp.worldCustom||"";
  const groups = { world:"世界", rules:"规则", power:"力量", faction:"势力", character:"人物", event:"事件", player:"玩家自定义", secret:"隐藏" };
  const entries = (data.entries || []).map(e => `<div class="section"><div class="section-title">${esc(groups[e.category] || e.category)}</div><div class="list-card"><div class="contact-name">${esc(e.title)}</div><div class="small" style="white-space:pre-wrap;margin-top:7px">${esc(e.content)}</div></div></div>`).join("");
  openSheet(`<div class="sheet-head"><div class="sheet-title">${esc(state.labels[1])}</div><button class="close" data-close>×</button></div>
    <div class="section"><div class="list-card"><div class="contact-name">世界状态 · 第 ${data.stage || 0} 阶段</div><div class="small" style="margin-top:7px">${esc(w.current_location)} · ${esc(w.current_time)} · ${esc(w.weather)}</div></div></div>
    <div class="section"><div class="list-card"><div class="contact-name">世界设定（创建后固定，不可更改）</div><div class="small" style="margin-top:7px">世界类型：${esc(gCN)}　｜　关系模式：${esc(rCN)}　｜　剧情方向：${esc(pCN)}</div><div class="small" style="white-space:pre-wrap;margin-top:10px">${esc(w.background)}</div></div></div>
    <div class="section"><div class="form-card"><div class="contact-name">自定义世界观设定</div><div class="small" style="margin:6px 0 12px">添加你希望世界遵循的偏好或补充设定，不会改变已经发生的剧情和事件。</div><textarea id="worldCustomInput" placeholder="例如：希望世界偏黑暗风格；希望多出现酒馆场景；希望NPC说话古风一些……" style="min-height:80px">${esc(customWorld)}</textarea><button id="saveWorldCustom" class="save-full">保存设定</button></div></div>
    ${entries || emptyState("暂无可见隐藏条目", "隐藏内容会在达到条件后逐步出现。")}`);
  $("#saveWorldCustom").onclick=async()=>{
    const val=$("#worldCustomInput").value.trim();
    await api(`/api/settings?worldId=${state.worldId}`,{method:"POST",body:JSON.stringify({worldId:state.worldId,data:{worldCustom:val}})});
    alert("自定义设定已保存");
  };
}

// 背包名称按世界观变化
const BP_NAMES={xianxia:"储物袋",wuxia:"行囊",ancient:"包袱",alternate_history:"行囊",primordial:"储物戒",palace:"妆匣",urban:"背包",campus:"书包",workplace:"公文包",entertainment:"随身包",esports:"装备包",fantasy:"次元袋",medieval:"行囊",vampire:"古董箱",norse:"兽皮袋","sci-fi":"工具包",interstellar:"物资舱",cyberpunk:"植入仓",apocalypse:"求生包",cthulhu:"调查包",infinite:"轮回匣",quick_transmigration:"系统空间",rebirth:"随身空间",supernatural:"法器袋",mystery:"侦探包",historical:"行囊",time_travel:"时空囊",villain:"魔王宝库",system:"系统背包",infinite_dungeon:"冒险者背包",vampire_noble:"血族宝匣",witch:"草药包",beastman:"兽皮袋",merfolk:"珍珠贝",ghost:"阴阳袋",cultivation_failure:"储物袋",demon_court:"鬼差袋",heaven:"仙家宝库",martial_soul:"武魂空间",mecha:"机师舱",magical_girl:"变身盒",urban_immortal:"储物戒",detective:"侦探包",game_world:"游戏背包",ice_apocalypse:"保温箱",dystopia:"物资配给包",space_opera:"星舰货舱",deep_sea:"潜水舱",time_loop:"循环记录器",parallel_world:"跨维度袋",myth_china:"仙家法宝",myth_greek:"众神之袋",myth_norse:"维京宝箱",business:"公文包",sports:"运动包",post_apocalypse_z:"求生包",sea_apocalypse:"浮囊",entertainment_rebirth:"随身包"};
const CURRENCY_NAMES={xianxia:"灵石",wuxia:"银两",ancient:"银两",alternate_history:"银两",primordial:"功德",palace:"金锭",urban:"元",campus:"零花钱",workplace:"工资",entertainment:"片酬",esports:"奖金",fantasy:"金币",medieval:"金币",vampire:"血晶",norse:"银币","sci-fi":"信用点",interstellar:"星币",cyberpunk:"欧元点",apocalypse:"物资点",cthulhu:"理智值",infinite:"积分",quick_transmigration:"剧情点",rebirth:"气运值",supernatural:"功德",mystery:"线索点",historical:"铜钱",time_travel:"时空币",villain:"邪恶值",system:"系统币",infinite_dungeon:"冒险币",vampire_noble:"血晶",witch:"魔晶",beastman:"兽牙",merfolk:"珍珠",ghost:"冥币",cultivation_failure:"灵石",demon_court:"冥币",heaven:"仙桃",martial_soul:"武魂币",mecha:"能源块",magical_girl:"魔力晶",urban_immortal:"灵石",detective:"线索费",game_world:"金币",ice_apocalypse:"热量值",dystopia:"配给券",space_opera:"星币",deep_sea:"珍珠",time_loop:"记忆碎片",parallel_world:"维度币",myth_china:"仙桃",myth_greek:"德拉克马",myth_norse:"奥丁币",business:"资金",sports:"奖金",post_apocalypse_z:"弹药",sea_apocalypse:"淡水",entertainment_rebirth:"片酬"};
function bpName(genre){return BP_NAMES[genre]||"背包"}
function currencyName(genre){return CURRENCY_NAMES[genre]||"金币"}
function getPlayerState(){try{return JSON.parse(state.world?.player_state||"{}")}catch{return {}}}

async function openBackpack() {
  const ps=getPlayerState();
  const genre=state.world?.genre||"";
  const name=bpName(genre);
  const cur=ps.currency||0;
  const curName=currencyName(genre);
  const items=ps.inventory||[];
  const slots=[];
  for(let i=0;i<12;i++){
    const it=items[i];
    if(it){slots.push(`<div class="bp-slot" title="${esc(it.name)}">${esc(it.icon||"📦")}<span class="qty">${it.qty>1?it.qty:""}</span></div>`)}
    else{slots.push(`<div class="bp-slot empty">·</div>`)}
  }
  openSheet(`<div class="sheet-head"><div class="sheet-title">${esc(name)}</div><button class="close" data-close>×</button></div>
    <div class="bp-currency"><span class="label">${esc(curName)}</span><span class="amount">${cur}</span></div>
    <div class="section-title">物品</div>
    <div class="bp-grid">${slots.join("")}</div>`);
}

async function openAPI() {
  openSheet(`<div class="sheet-head"><div class="sheet-title">API 设置</div><button class="close" data-close>×</button></div>
    <div class="form-card"><div class="contact-name">AI 接口</div>
      <div class="small" style="margin:6px 0 12px">开始剧情前必须配置你自己的 AI 接口，三项都要填。Key 只存在本机，不上传服务器。地址填到 <b>/v1</b> 即可，系统会自动补全。</div>
      <div class="field"><label>API 地址</label><input id="aiEndpoint" value="${esc(state.ai.endpoint)}" placeholder="https://api.siliconflow.cn/v1"></div>
      <div class="field"><label>API Key</label><input id="aiKey" type="password" value="${esc(state.ai.key)}" placeholder="sk-…"></div>
      <div class="field"><label>模型</label><input id="aiModel" value="${esc(state.ai.model)}" placeholder="例如 Qwen/Qwen2.5-14B-Instruct"></div>
      <div class="small" style="margin:4px 0">推荐快速模型（3-5秒回复，硅基流动）：
        <span style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
          <button type="button" class="secondary pick-model" data-m="Qwen/Qwen2.5-7B-Instruct">7B 极速</button>
          <button type="button" class="secondary pick-model" data-m="Qwen/Qwen2.5-14B-Instruct">14B 均衡</button>
          <button type="button" class="secondary pick-model" data-m="Qwen/Qwen2.5-72B-Instruct">72B 高质量</button>
        </span>
      </div>
      <div class="save-row"><button id="saveAI">保存</button><button class="secondary" id="testAI">测试连接</button><button class="secondary" id="resetAI">清空</button></div>
      <div id="aiTestMsg" class="small" style="margin-top:8px"></div>
    </div>`);
  document.querySelectorAll(".pick-model").forEach(btn=>btn.onclick=()=>{ $("#aiModel").value=btn.dataset.m; });
  $("#saveAI").onclick = () => { state.ai={endpoint:$("#aiEndpoint").value.trim(),key:$("#aiKey").value,model:$("#aiModel").value.trim()}; save(); $("#aiTestMsg").textContent="已保存到本机"; };
  $("#resetAI").onclick = () => { state.ai={endpoint:"",key:"",model:""}; save(); $("#aiEndpoint").value="";$("#aiKey").value="";$("#aiModel").value=""; $("#aiTestMsg").textContent="已清空，请重新填写你自己的接口"; };
  $("#testAI").onclick = testAI;
}

async function openPersona() {
  let sp={}; try { sp=(await api(`/api/settings?worldId=${state.worldId}`)).data||{}; } catch {}
  const custom=sp.custom||{};
  openSheet(`<div class="sheet-head"><div class="sheet-title">我的人设</div><button class="close" data-close>×</button></div>
    <div class="form-card"><div class="contact-name">你的角色</div>
      <div class="small" style="margin:6px 0 12px">只修改你自己的角色，不会改动任何 NPC。</div>
      <div class="field"><label>称呼</label><input id="customName" value="${esc(custom.name||"")}" placeholder="你希望别人怎么叫你"></div>
      <div class="field"><label>外貌特征</label><input id="customLook" value="${esc(custom.look||"")}" placeholder="例如：黑衣、佩剑、左眉有疤"></div>
      <div class="field"><label>性格设定</label><input id="customPersona" value="${esc(custom.persona||"")}" placeholder="例如：冷静、话少、重情义"></div>
      <div class="field"><label>背景/自定义</label><textarea id="customLore" placeholder="这个世界需要记住的关于你的信息">${esc(custom.lore||"")}</textarea></div>
    </div>
    <div class="form-card"><div class="contact-name">界面</div>
      <div class="field"><label>主题</label><select id="theme"><option value="system">跟随系统</option><option value="light">浅色</option><option value="dark">深色</option></select></div>
      <div class="field"><label>节奏</label><select id="pace"><option value="slow">慢</option><option value="normal">正常</option><option value="fast">快</option></select></div>
    </div>
    <button id="savePersona" class="save-full">保存</button>`);
  $("#theme").value = state.prefs.theme||sp.appearance?.theme||"system";
  $("#pace").value = state.prefs.pace||sp.plot?.pace||"normal";
  $("#savePersona").onclick = async () => {
    state.prefs = {...state.prefs, theme:$("#theme").value, pace:$("#pace").value};
    applyTheme();
    await api(`/api/settings?worldId=${state.worldId}`,{method:'POST',body:JSON.stringify({worldId:state.worldId,data:{appearance:{theme:state.prefs.theme},plot:{pace:state.prefs.pace},custom:{name:$("#customName").value.trim(),look:$("#customLook").value.trim(),persona:$("#customPersona").value.trim(),lore:$("#customLore").value}}})});
    save(); alert('人设已保存');
  };
}

async function testAI() {
  const box = $("#aiTestMsg");
  box.textContent = "测试中…";
  const ai = { endpoint:$("#aiEndpoint").value.trim(), key:$("#aiKey").value, model:$("#aiModel").value.trim() };
  if (!ai.endpoint || !ai.model) { box.textContent = "请先填写 API 地址和模型"; return; }
  try { const data = await api("/api/ai/test", { method:"POST", body:JSON.stringify({ ai }) }); box.textContent = data.reply?.includes("连接成功") ? "连接成功" : "接口已返回内容"; }
  catch (e) { box.textContent = e.message; }
}

function openVoice() {
  const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  const voiceOptions = voices.map((v,i) => `<option value="${i}">${esc(v.name)} · ${esc(v.lang)}</option>`).join("");
  const rows = state.characters.slice(0,9).map(c => `<div class="list-card" style="margin-top:10px"><div class="list-row"><div><div class="contact-name">${esc(c.name)}</div><div class="small">${esc(c.personality)}</div></div><div style="display:grid;gap:6px;max-width:190px"><select data-browservoice="${c.id}"><option value="">系统默认</option>${voiceOptions}</select><input data-ttsvoice="${c.id}" placeholder="TTS voice_id（可空）" value="${esc(state.voice.ttsVoices?.[c.id]||"")}"></div></div></div>`).join("");
  const apiCfg = state.voice.api || {endpoint:"",key:"",model:"",voice:"alloy"};
  openSheet(`<div class="sheet-head"><div class="sheet-title">${esc(state.labels[3])}</div><button class="close" data-close>×</button></div>
    <div class="form-card"><div class="contact-name">语音 API</div><div class="small" style="margin:6px 0 12px">可选。支持 OpenAI Audio Speech 风格接口；未配置时使用设备自带朗读。</div>
      <div class="field"><label>TTS API 地址</label><input id="ttsEndpoint" value="${esc(apiCfg.endpoint)}" placeholder="https://api.example.com/v1/audio/speech"></div>
      <div class="field"><label>TTS API Key</label><input id="ttsKey" type="password" value="${esc(apiCfg.key)}" placeholder="sk-…"></div>
      <div class="field"><label>TTS 模型</label><input id="ttsModel" value="${esc(apiCfg.model)}" placeholder="tts-1"></div>
      <div class="field"><label>默认音色</label><input id="ttsVoice" value="${esc(apiCfg.voice || "alloy")}" placeholder="alloy"></div>
      <div class="save-row"><button id="saveTTS">保存 API</button><button class="secondary" id="testTTS">测试语音 API</button></div><div id="ttsMsg" class="small" style="margin-top:8px"></div>
    </div>
    <div class="form-card"><div class="switch"><div><div class="contact-name">启用语音</div><div class="small">默认使用设备自带朗读。</div></div><input id="voiceEnabled" type="checkbox" ${state.voice.enabled !== false ? "checked" : ""}></div>
      <div class="switch" style="margin-top:12px"><div><div class="contact-name">自动朗读</div><div class="small">收到故事对白后自动朗读。</div></div><input id="autoRead" type="checkbox" ${state.voice.autoRead ? "checked" : ""}></div>
      <div class="field" style="margin-top:14px"><label>语速</label><input id="rate" type="range" min="0.6" max="1.5" step="0.05" value="${state.voice.rate || 1}"></div>
      <div class="field"><label>音调</label><input id="pitch" type="range" min="0.6" max="1.4" step="0.05" value="${state.voice.pitch || 1}"></div>
      <div class="field"><label>音量</label><input id="volume" type="range" min="0" max="1" step="0.05" value="${state.voice.volume ?? 1}"></div>
      <div class="save-row"><button id="saveVoice">保存</button><button class="secondary" id="previewVoice">试听</button></div>
    </div>
    <div class="form-card"><div class="contact-name">角色声音</div><div class="small" style="margin-top:6px">每个角色可以在本设备选择自己的系统声音。</div>${rows || `<div class="small" style="margin-top:10px">角色尚未生成。</div>`}</div>`);
  document.querySelectorAll("[data-browservoice]").forEach(s => { s.value = state.voice.browserVoices?.[s.dataset.browservoice] ?? ""; });
  $("#saveTTS").onclick = () => { state.voice.api = {endpoint:$("#ttsEndpoint").value.trim(), key:$("#ttsKey").value, model:$("#ttsModel").value.trim(), voice:$("#ttsVoice").value.trim() || "alloy"}; save(); $("#ttsMsg").textContent="语音 API 已保存到本机"; };
  $("#testTTS").onclick = async () => { const cfg={endpoint:$("#ttsEndpoint").value.trim(),key:$("#ttsKey").value,model:$("#ttsModel").value.trim(),voice:$("#ttsVoice").value.trim()||"alloy"}; const box=$("#ttsMsg"); if(!cfg.endpoint||!cfg.model){box.textContent="请先填写地址和模型";return;} box.textContent="测试中…"; try{await playTTS("这是 CardWorld 的语音 API 试听。",cfg);box.textContent="语音 API 返回成功";}catch(e){box.textContent=e.message;}};
  $("#saveVoice").onclick = () => { state.voice.enabled=$("#voiceEnabled").checked;state.voice.autoRead=$("#autoRead").checked;state.voice.rate=Number($("#rate").value);state.voice.pitch=Number($("#pitch").value);state.voice.volume=Number($("#volume").value);state.voice.browserVoices=state.voice.browserVoices||{};state.voice.ttsVoices=state.voice.ttsVoices||{};document.querySelectorAll("[data-browservoice]").forEach(s=>{state.voice.browserVoices[s.dataset.browservoice]=s.value});document.querySelectorAll("[data-ttsvoice]").forEach(s=>{state.voice.ttsVoices[s.dataset.ttsvoice]=s.value.trim()});save();alert("语音设置已保存"); };
  $("#previewVoice").onclick=()=>speak("这是 CardWorld 的语音试听。",null,true);
}

function speak(text, charId, force=false) {
  if (!force && state.voice.enabled === false) return;
  const cfg=state.voice.api || {};
  if (cfg.endpoint && cfg.model) { playTTS(text,cfg,charId).catch(()=>deviceSpeak(text,charId)); return; }
  deviceSpeak(text,charId);
}
function deviceSpeak(text,charId){
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(String(text).slice(0,1800));
  utterance.rate=Number(state.voice.rate)||1;utterance.pitch=Number(state.voice.pitch)||1;utterance.volume=Number(state.voice.volume??1);
  const idx=state.voice.browserVoices?.[charId];const voices=speechSynthesis.getVoices();
  if(idx!==undefined&&idx!==""&&voices[idx])utterance.voice=voices[idx];
  speechSynthesis.speak(utterance);
}
async function playTTS(text,cfg,charId){
  if(!/^https:\/\//i.test(cfg.endpoint)) throw new Error("TTS API 地址必须使用 HTTPS");
  const voice=(state.voice.browserVoices?.[charId] && String(state.voice.voices[charId]).trim()) || cfg.voice || "alloy";
  const res=await fetch(cfg.endpoint,{method:"POST",headers:{"content-type":"application/json",...(cfg.key?{authorization:`Bearer ${cfg.key}`}:{})},body:JSON.stringify({model:cfg.model,input:String(text).slice(0,4000),voice})});
  if(!res.ok)throw new Error(`TTS API ${res.status}`);
  const type=res.headers.get("content-type")||"";
  if(type.startsWith("audio/")){const blob=await res.blob();const url=URL.createObjectURL(blob);const audio=new Audio(url);await audio.play();audio.onended=()=>URL.revokeObjectURL(url);return;}
  const data=await res.json();
  const b64=data?.audio_base64 || data?.audio;
  if(!b64)throw new Error("TTS 返回格式未识别");
  const raw=atob(String(b64));const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);const blob=new Blob([bytes],{type:data.mime_type||"audio/mpeg"});const url=URL.createObjectURL(blob);const audio=new Audio(url);await audio.play();audio.onended=()=>URL.revokeObjectURL(url);
}


// 世界观分组
const GENRE_GROUP={xianxia:"eastern",wuxia:"eastern",ancient:"eastern",alternate_history:"eastern",primordial:"eastern",palace:"eastern",historical:"eastern",time_travel:"eastern",cultivation_failure:"eastern",demon_court:"eastern",heaven:"eastern",martial_soul:"eastern",urban_immortal:"eastern",myth_china:"eastern",urban:"modern",campus:"modern",workplace:"modern",entertainment:"modern",esports:"modern",detective:"modern",business:"modern",sports:"modern",entertainment_rebirth:"modern",fantasy:"western",medieval:"western",vampire:"western",norse:"western",vampire_noble:"western",witch:"western",beastman:"western",merfolk:"western",ghost:"western",myth_greek:"western",myth_norse:"western",magical_girl:"western","sci-fi":"scifi",interstellar:"scifi",cyberpunk:"scifi",mecha:"scifi",space_opera:"scifi",game_world:"scifi",parallel_world:"scifi",ai_love:"scifi",apocalypse:"dark",cthulhu:"dark",infinite:"dark",quick_transmigration:"dark",rebirth:"dark",supernatural:"dark",mystery:"dark",villain:"dark",system:"dark",infinite_dungeon:"dark",ice_apocalypse:"dark",dystopia:"dark",deep_sea:"dark",time_loop:"dark",post_apocalypse_z:"dark",sea_apocalypse:"dark",survival_horror:"dark"};
// 世界地名按世界观生成
const WORLD_NAMES={
  eastern:["洪荒大陆","九州","玄天大陆","苍元界","灵元大陆","九幽冥界","天衍大陆","太初界","青云界","万象大陆","蓬莱仙域","蜀山界","昆仑界","东海仙洲","北荒大陆"],
  modern:["蓝星","地球","华国","江城","滨海市","上京市","深港市","杭城","星城","蓉城","西京市","花城","宁州","沪上市","渝州"],
  western:["艾拉西亚大陆","诺德海姆","中土大陆","维斯洛特","自由城邦联盟","神圣帝国","幽暗地域","翡翠群岛","北境王国","沙漠苏丹国","矮人山脉","精灵森林","巨龙群岛","法师塔城","旧世界"],
  scifi:["泽塔星系","半人马座殖民地","新地球","银河联邦","深空殖民地","轨道城","火星基地","木卫二","土卫六","跃迁枢纽","星联首都","边境星系","废弃殖民星","矿业星球","科研空间站"],
  dark:["迷雾镇","寂静岭","幽暗港","永夜城","灰雾大陆","遗忘之地","深渊边境","无光之海","骸骨荒原","诅咒群岛","梦魇镇","虚空边界","沉沦之地","绝望谷","无名小镇"]
};
function worldGeoName(genre){
  const group=GENRE_GROUP[genre]||"modern";
  const pool=WORLD_NAMES[group]||WORLD_NAMES.modern;
  return pool[Math.floor(Math.random()*pool.length)];
}

async function showIntro(){
  const w=state.world||{};
  const text=w.background||"你睁开眼，发现自己来到了一个陌生的世界。";
  const geoName=worldGeoName(w.genre||"");
  const overlay=document.createElement("div");
  overlay.className="intro-overlay";
  overlay.innerHTML=`<div class="intro-mask-top"></div><div class="intro-mask-bottom"></div><div class="intro-crawl"><div class="intro-title">${esc(geoName)}</div><div class="intro-text">${esc(text)}</div><div class="intro-skip">即将进入……</div></div>`;
  document.body.appendChild(overlay);
  let finished=false;
  const crawl=overlay.querySelector(".intro-crawl");
  const skip=overlay.querySelector(".intro-skip");
  let autoTimer=null;
  // 动态计算滚动距离：让最后一行停在屏幕中央（50%）
  requestAnimationFrame(()=>{
    const textH=crawl.scrollHeight;
    const viewH=window.innerHeight;
    const startTop=viewH*0.40; // 起始top:40%
    const endTop=viewH*0.50-textH; // 最后一行在50%处
    const dist=startTop-endTop;
    crawl.style.setProperty("--scroll-dist",`-${dist}px`);
    crawl.classList.add("scrolling");
  });
  crawl.addEventListener("animationend",()=>{
    finished=true;
    skip.classList.add("show");
    skip.textContent="点击任意处进入";
    autoTimer=setTimeout(()=>{
      if(overlay.parentNode){overlay.remove();showPersonaForm();}
    },5000);
  });
  overlay.addEventListener("click",()=>{
    if(!finished)return;
    if(autoTimer)clearTimeout(autoTimer);
    overlay.remove();showPersonaForm();
  });
}

async function aiRandomizePersona(world,missing){
  if(!ownAPIReady())return null;
  const endpoint=state.ai.endpoint.replace(/\/+$/,"");
  const ep=endpoint+(/\/v\d+$/.test(endpoint)?"/chat/completions":"/v1/chat/completions");
  const sys=`你是角色设定生成器。根据世界背景，为玩家生成符合这个世界的角色设定。只输出JSON，不解释。格式：{"name":"...","look":"...","persona":"...","identity":"..."}。身份必须符合世界类型，仙侠世界不能出现消防员、程序员等现代职业。`;
  const user=`世界名称：${world.name||""}
类型：${world.genre||""}
关系模式：${world.relationship_type||""}
剧情方向：${world.plot_type||""}
世界背景：${String(world.background||"").slice(0,600)}
需要生成的字段：${missing.join("、")}
请为这些字段生成符合该世界的设定。`;
  try{
    const r=await fetch(ep,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${state.ai.key}`},body:JSON.stringify({model:state.ai.model,messages:[{role:"system",content:sys},{role:"user",content:user}],temperature:0.9,max_tokens:300})});
    if(!r.ok)return null;
    const d=await r.json();
    const text=d.choices?.[0]?.message?.content||"";
    const m=text.match(/\{[\s\S]*\}/);
    if(!m)return null;
    return JSON.parse(m[0]);
  }catch(e){return null;}
}

async function showPersonaForm(){
  const overlay=document.createElement("div");
  overlay.className="intro-overlay center";
  const presetAvatars=["🧑","👩","🧔","👱","🧑‍🦰","👨‍🦱","👩‍🦳","🧑‍🎤","🦸","🧙","🥷","👸","🤴","🧛","🧝","🐱","🐺","🦊","🐉","👻"];
  const currentAvatar=state.prefs?.avatar||"🧑";
  const isImageAvatar=currentAvatar.startsWith("data:");
  overlay.innerHTML=`<div class="persona-card">
    <div class="sheet-title" style="text-align:center;margin-bottom:8px">塑造你的角色</div>
    <div style="text-align:center;margin-bottom:14px">
      <div id="avatarPreview" style="width:64px;height:64px;border-radius:50%;background:var(--accent-soft);display:grid;place-items:center;font-size:32px;margin:0 auto 8px;overflow:hidden;background-size:cover;background-position:center">${isImageAvatar?`<img src="${currentAvatar}" style="width:100%;height:100%;object-fit:cover">`:currentAvatar}</div>
      <input type="file" id="avatarUpload" accept="image/*" style="display:none">
      <button id="uploadAvatarBtn" style="font-size:12px;padding:4px 12px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--muted);cursor:pointer;margin-bottom:8px">📷 上传图片头像</button>
      <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:280px;margin:0 auto">
        ${presetAvatars.map(e=>`<button class="avatar-pick" data-avatar="${e}" style="width:36px;height:36px;border-radius:50%;border:${e===currentAvatar?'2px solid var(--accent)':'1px solid var(--line)'};background:var(--bg);font-size:18px;cursor:pointer">${e}</button>`).join("")}
      </div>
    </div>
    <div class="form-card">
      <div class="field"><label>你的名字</label><input id="pName" placeholder="留空自动生成"></div>
      <div class="field"><label>外貌特征</label><input id="pLook" placeholder="留空自动生成"></div>
      <div class="field"><label>性格</label><input id="pPersona" placeholder="留空自动生成"></div>
      <div class="field"><label>身份/背景</label><input id="pIdentity" placeholder="留空自动生成，符合当前世界"></div>
    </div>
    <button id="pSubmit" class="save-full">进入世界</button>
  </div>`;
  document.body.appendChild(overlay);
  let selectedAvatar=currentAvatar;
  const updatePreview=(av)=>{
    const prev=$("#avatarPreview");
    if(av.startsWith("data:")){prev.innerHTML=`<img src="${av}" style="width:100%;height:100%;object-fit:cover">`;}
    else{prev.innerHTML=av;}
  };
  overlay.querySelectorAll(".avatar-pick").forEach(btn=>{
    btn.onclick=()=>{
      selectedAvatar=btn.dataset.avatar;
      updatePreview(selectedAvatar);
      overlay.querySelectorAll(".avatar-pick").forEach(b=>b.style.border="1px solid var(--line)");
      btn.style.border="2px solid var(--accent)";
    };
  });
  $("#uploadAvatarBtn").onclick=()=>$("#avatarUpload").click();
  $("#avatarUpload").onchange=(e)=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{selectedAvatar=reader.result;updatePreview(selectedAvatar);
      overlay.querySelectorAll(".avatar-pick").forEach(b=>b.style.border="1px solid var(--line)");};
    reader.readAsDataURL(file);
  };
  $("#pSubmit").onclick=async()=>{
    const btn=$("#pSubmit");
    let name=$("#pName").value.trim();
    let look=$("#pLook").value.trim();
    let persona=$("#pPersona").value.trim();
    let identity=$("#pIdentity").value.trim();
    const missing=[];
    if(!name)missing.push("name");
    if(!look)missing.push("look");
    if(!persona)missing.push("persona");
    if(!identity)missing.push("identity");
    if(missing.length>0){
      btn.disabled=true;btn.textContent="AI 生成身份中...";
      const aiResult=await aiRandomizePersona(state.world||{},missing);
      if(aiResult){
        if(!name&&aiResult.name)name=String(aiResult.name).slice(0,20);
        if(!look&&aiResult.look)look=String(aiResult.look).slice(0,50);
        if(!persona&&aiResult.persona)persona=String(aiResult.persona).slice(0,50);
        if(!identity&&aiResult.identity)identity=String(aiResult.identity).slice(0,80);
      }
      // AI 失败时给保底
      if(!name)name="无名者";
      if(!look)look="衣着普通，面容清秀";
      if(!persona)persona="冷静、话少、重情义";
      if(!identity)identity="初来乍到的旅人";
      btn.textContent="进入世界";btn.disabled=false;
    }
    state.prefs.avatar=selectedAvatar;
    save();
    await api(`/api/settings?worldId=${state.worldId}`,{method:"POST",body:JSON.stringify({worldId:state.worldId,data:{custom:{name,look,persona,identity,lore:`外貌：${look}；性格：${persona}；身份：${identity}`}}})});
    // 生成初始场景；剧情只保存在本机 IndexedDB
    let scene="你睁开眼，发现自己来到了这个世界。";
    try{const r=await api(`/api/world/init-scene`,{method:"POST",body:JSON.stringify({worldId:state.worldId,identity:identity||"普通人",name})});scene=r.scene||scene}catch(e){}
    const firstMsg={role:"assistant",character_id:null,content:scene,created_at:Date.now()};
    state.messages=[firstMsg]; await idbAppendStory(state.worldId,[firstMsg]);
    localStorage.setItem(`cw_intro_${state.worldId}`,"1");
    overlay.remove();
    await refreshWorldState();
    renderWorld();
    scrollBottom();
    openQuests();
  };
}

function openCharAvatarEditor(cid,cname){
  const npcPresets=["🧙","🧝","🧛","🧟","👸","🤴","🥷","🦸","🧑‍⚕️","👮","🧑‍🍳","🧑‍🎨","🧑‍🚀","🧑‍💼","👩‍🎤","🧔","👱","🧑‍🦰","👨‍🦱","🐱","🐺","🦊","🐉","👻","💀","🤖","👽"];
  const current=charAvatar(cid)||cname[0]||"?";
  const isImg=current.startsWith("data:");
  const overlay=document.createElement("div");
  overlay.className="intro-overlay center";
  overlay.innerHTML=`<div class="persona-card" style="max-width:340px">
    <div class="sheet-title" style="text-align:center;margin-bottom:8px">更换「${esc(cname)}」头像</div>
    <div style="text-align:center;margin-bottom:14px">
      <div id="charAvatarPrev" style="width:64px;height:64px;border-radius:50%;background:var(--accent-soft);display:grid;place-items:center;font-size:32px;margin:0 auto 8px;overflow:hidden">${isImg?`<img src="${current}" style="width:100%;height:100%;object-fit:cover">`:current}</div>
      <input type="file" id="charAvatarUpload" accept="image/*" style="display:none">
      <button id="charUploadBtn" style="font-size:12px;padding:4px 12px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--muted);cursor:pointer;margin-bottom:8px">📷 上传图片</button>
      <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:280px;margin:0 auto">
        ${npcPresets.map(e=>`<button class="npc-av-pick" data-av="${e}" style="width:36px;height:36px;border-radius:50%;border:1px solid var(--line);background:var(--bg);font-size:18px;cursor:pointer">${e}</button>`).join("")}
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <button id="charAvReset" class="save-full" style="flex:1;background:var(--line);color:var(--text)">恢复默认</button>
      <button id="charAvClose" class="save-full" style="flex:1">完成</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  let selected=current;
  const upd=(av)=>{const p=$("#charAvatarPrev");if(av.startsWith("data:"))p.innerHTML=`<img src="${av}" style="width:100%;height:100%;object-fit:cover">`;else p.innerHTML=av;};
  overlay.querySelectorAll(".npc-av-pick").forEach(b=>{b.onclick=()=>{selected=b.dataset.av;upd(selected);};});
  $("#charUploadBtn").onclick=()=>$("#charAvatarUpload").click();
  $("#charAvatarUpload").onchange=(e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{selected=r.result;upd(selected);};r.readAsDataURL(f);};
  $("#charAvReset").onclick=()=>{selected=cname[0]||"?";upd(selected);if(!state.prefs.charAvatars)state.prefs.charAvatars={};delete state.prefs.charAvatars[cid];save();renderWorld();};
  $("#charAvClose").onclick=()=>{
    if(!state.prefs.charAvatars)state.prefs.charAvatars={};
    if(selected===cname[0])delete state.prefs.charAvatars[cid];
    else state.prefs.charAvatars[cid]=selected;
    save();overlay.remove();renderWorld();
  };
}

// 记忆库：存储剧情摘要，防止AI失忆
async function idbGetMemory(worldId){
  try{
    const db=await idbOpen();const tx=db.transaction("worlds","readonly");const store=tx.objectStore("worlds");
    const w=await store.get(worldId);return w?.memory||"";
  }catch(e){return "";}
}
async function idbSetMemory(worldId,memory){
  try{
    const db=await idbOpen();const tx=db.transaction("worlds","readwrite");const store=tx.objectStore("worlds");
    const w=await store.get(worldId)||{worldId};w.memory=memory;await store.put(w);
  }catch(e){}
}
// 每10轮对话后用AI概括剧情更新记忆库
async function updateMemoryIfNeeded(){
  const msgs=state.messages||[];
  if(msgs.length<10||msgs.length%10!==0)return;
  if(!ownAPIReady())return;
  const oldMem=await idbGetMemory(state.worldId);
  const recent=msgs.slice(-10).map(m=>`${m.role==="user"?"玩家":characterName(m.character_id)}：${String(m.content).slice(0,150)}`).join("\n");
  const endpoint=state.ai.endpoint.replace(/\/+$/,"");
  const ep=endpoint+(/\/v\d+$/.test(endpoint)?"/chat/completions":"/v1/chat/completions");
  try{
    const r=await fetch(ep,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${state.ai.key}`},body:JSON.stringify({model:state.ai.model,messages:[{role:"system",content:"你是剧情记忆管理员。根据已有记忆和最近对话，更新剧情摘要。保留关键人物、地点、事件、关系变化、伏笔。不超过300字。只输出摘要文本，不要解释。"},{role:"user",content:`已有记忆：${oldMem||"无"}\n\n最近对话：\n${recent}`}],temperature:0.3,max_tokens:400})});
    if(!r.ok)return;
    const d=await r.json();
    const summary=d.choices?.[0]?.message?.content?.trim();
    if(summary)await idbSetMemory(state.worldId,summary);
  }catch(e){}
}

// 重新生成某条AI消息
async function regenerateMessage(index){
  if(state.streaming)return;
  if(!ownAPIReady()){alert("请先配置 API 设置");openAPI();return;}
  const msgs=state.messages;
  // 找到这条AI消息对应的用户输入（前一条user消息）
  let userInput="继续";
  for(let i=index-1;i>=0;i--){if(msgs[i].role==="user"){userInput=msgs[i].content;break;}}
  // 删除这条AI消息
  const removed=msgs.splice(index,1)[0];
  await idbSaveMessages(state.worldId,msgs);
  state.streaming=true;
  renderWorld();scrollBottom();
  // 重新走一遍流式生成
  const aiMsg={role:"assistant",character_id:removed.character_id||null,content:"",created_at:Date.now()};
  msgs.splice(index,0,aiMsg);
  try{
    const localMessages=msgs.filter(m=>m.content).map(m=>({role:m.role,content:String(m.content).slice(0,800)})).slice(-40);
    const prep=await api("/api/story/prepare",{method:"POST",body:JSON.stringify({worldId:state.worldId,content:userInput,localMessages,model:state.ai.model,memory:await idbGetMemory(state.worldId)})});
    let endpoint=state.ai.endpoint.replace(/\/+$/,"");
    if(!/\/chat\/completions$/.test(endpoint)){endpoint+=(/\/v\d+$/.test(endpoint)?"/chat/completions":"/v1/chat/completions");}
    const resp=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${state.ai.key}`},body:JSON.stringify({model:state.ai.model,messages:[{role:"system",content:prep.system},{role:"user",content:prep.instruction}],temperature:prep.temperature,max_tokens:prep.maxTokens,stream:true,...(prep.extraBody||{})})});
    if(!resp.ok){const t=await resp.text();throw new Error(`AI API ${resp.status}: ${t.slice(0,200)}`)}
    const reader=resp.body.getReader();const decoder=new TextDecoder();let fullContent="";let lastDisplayed="";let sseBuf="";
    while(true){const {done,value}=await reader.read();if(done)break;sseBuf+=decoder.decode(value,{stream:true});
      const lines=sseBuf.split("\n");sseBuf=lines.pop()||"";
      for(const line of lines){if(!line.startsWith("data: "))continue;const payload=line.slice(6).trim();if(payload==="[DONE]")continue;try{const j=JSON.parse(payload);fullContent+=j.choices?.[0]?.delta?.content||"";}catch{}}
      const display=extractNarrative(fullContent);
      if(display&&display!==lastDisplayed){lastDisplayed=display;aiMsg.content=display;renderWorld();scrollBottom();}
    }
    const parsed=parseJsonLocal(fullContent);
    const narrative=parsed?.narrative||fullContent.slice(0,1500);
    aiMsg.content=narrative;
    msgs[index]=aiMsg;
    await idbSaveMessages(state.worldId,msgs);
    const commit=await api("/api/story/commit",{method:"POST",body:JSON.stringify({worldId:state.worldId,raw:fullContent})});
    aiMsg.character_id=commit.character?.id||null;
    await idbSaveMessages(state.worldId,msgs);
    await refreshWorldState();
    state.streaming=false;
    renderWorld();scrollBottom();
    await updateMemoryIfNeeded();
  }catch(err){
    aiMsg.content="⚠️ "+err.message;
    state.streaming=false;
    renderWorld();scrollBottom();
  }
}

// 通讯器邀请：新角色加入通讯录时需要玩家同意
async function checkNewContactInvitations(){
  try{
    const data=await api(`/api/contacts?worldId=${state.worldId}`);
    const currentContacts=data.contacts||[];
    const knownKey=`cw_known_contacts_${state.worldId}`;
    const knownIds=JSON.parse(localStorage.getItem(knownKey)||"[]");
    const newOnes=currentContacts.filter(c=>!knownIds.includes(c.id));
    // 更新已知列表
    localStorage.setItem(knownKey,JSON.stringify(currentContacts.map(c=>c.id)));
    // 对新联系人逐个显示邀请
    for(const c of newOnes){
      await showContactInvitation(c);
    }
  }catch(e){}
}
function showContactInvitation(character){
  return new Promise(resolve=>{
    const overlay=document.createElement("div");
    overlay.className="intro-overlay center";
    overlay.style.background="rgba(0,0,0,0.5)";
    overlay.innerHTML=`<div class="persona-card" style="max-width:320px;text-align:center">
      <div style="font-size:40px;margin-bottom:8px">📱</div>
      <div class="sheet-title" style="margin-bottom:8px">通讯器邀请</div>
      <div class="small" style="margin-bottom:6px">「${esc(character.name)}」想添加你的联系方式</div>
      <div class="small" style="color:var(--muted);margin-bottom:16px">${esc(character.identity||"")} · 好感 ${character.affinity}</div>
      <div style="display:flex;gap:8px">
        <button id="ciDecline" class="save-full" style="flex:1;background:var(--line);color:var(--text)">拒绝</button>
        <button id="ciAccept" class="save-full" style="flex:1">同意</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    $("#ciAccept").onclick=async()=>{overlay.remove();resolve();};
    $("#ciDecline").onclick=async()=>{
      await api("/api/contacts/respond",{method:"POST",body:JSON.stringify({worldId:state.worldId,characterId:character.id,accepted:false})});
      overlay.remove();resolve();
    };
  });
}

function conditionLabel(q){
  const ct=q.condition_type, cv=q.condition_value;
  if(ct==="stage") return `剧情阶段达到 ${cv}`;
  if(ct==="clues") return `解锁 ${cv} 条隐藏线索`;
  if(ct==="affinity"){const [id,thr]=(cv||"").split(":");return `对角色 #${id} 好感≥${thr}`;}
  if(ct==="hostility"){const [id,thr]=(cv||"").split(":");return `对角色 #${id} 敌意≥${thr}`;}
  if(ct==="dark_pair") return cv==="any"?"任一角色好感≥90且敌意≥90":`角色 #${cv} 好感≥90且敌意≥90`;
  if(ct==="event") return `完成事件：${cv}`;
  return cv||"";
}
async function openQuests(){
  const qs=state.quests||[];
  if(qs.length===0){
    // 没有任务，显示生成界面
    openSheet(`<div class="sheet-head"><div class="sheet-title">任务</div><button class="close" data-close>×</button></div>
      <div class="form-card" style="margin-top:14px;text-align:center">
        <div style="font-size:36px;margin-bottom:10px">📜</div>
        <div class="contact-name">本世界暂无任务</div>
        <div class="small" style="margin:10px 0">AI 将根据当前世界生成 3 个专属任务（1主线+2支线，含成人向），全部完成可获得永久卡密。</div>
        <button id="genQuestBtn" class="save-full">AI 生成任务</button>
      </div>`);
    const btn=$("#genQuestBtn");
    if(btn) btn.onclick=async ()=>{
      if(!ownAPIReady()){alert("生成任务前，请先在「API 设置」中配置你自己的接口。");openAPI();return;}
      btn.disabled=true;btn.textContent="生成中...";
      try{
        const r=await api("/api/quests/generate",{method:"POST",body:JSON.stringify({worldId:state.worldId,ai:state.ai})});
        if(r.error){alert(r.error);btn.disabled=false;btn.textContent="AI 生成任务";return;}
        // 刷新世界数据获取新任务
        await loadWorld(state.worldId);
        if(state.sheet)state.sheet.remove();
        openQuests();
      }catch(e){alert("生成失败："+e.message);btn.disabled=false;btn.textContent="AI 生成任务";}
    };
    return;
  }
  const done=qs.filter(q=>q.status==="completed").length;
  const body=qs.map(q=>`
    <div class="list-card" style="margin-top:10px;opacity:${q.status==='completed'?0.5:1}">
      <div class="list-row">
        <div style="flex:1">
          <div class="contact-name">${q.quest_type==='main'?'⭐':'📌'} ${esc(q.title)} ${Number(q.is_adult)===1?'<span style="color:#e91e63;font-size:12px">🔞成人向</span>':''}</div>
          <div class="small">${esc(q.description)}</div>
          <div class="small" style="color:var(--accent);margin-top:4px">条件：${esc(conditionLabel(q))}</div>
        </div>
        <div class="pill">${q.status==='completed'?'✅':'进行中'}</div>
      </div>
    </div>`).join("");
  const reward=qs.find(q=>q.reward_card);
  const rewardHtml=reward?`<div class="form-card" style="margin-top:14px;border:1.5px solid var(--accent)"><div class="contact-name">🎉 永久卡密奖励</div><div class="small" style="margin:8px 0">全部任务完成！这是本世界唯一的永久卡密：</div><div style="font-family:monospace;font-size:18px;letter-spacing:2px;color:var(--accent);text-align:center;padding:12px 0;font-weight:700">${esc(reward.reward_card)}</div></div>`
    :`<div class="form-card" style="margin-top:14px"><div class="small">完成全部 3 个任务可获得本世界唯一的永久卡密（${done}/3 已完成）</div></div>`;
  openSheet(`<div class="sheet-head"><div class="sheet-title">任务</div><button class="close" data-close>×</button></div>${body}${rewardHtml}`);
}

function showPermanentCard(code){
  const overlay=document.createElement("div");
  overlay.className="intro-overlay";
  overlay.innerHTML=`<div class="persona-card" style="text-align:center">
    <div style="font-size:48px;margin-bottom:12px">🎉</div>
    <div class="sheet-title">全部任务完成！</div>
    <div class="small" style="margin:12px 0">你获得了这个世界唯一的永久卡密</div>
    <div style="font-family:monospace;font-size:22px;letter-spacing:3px;color:var(--accent);font-weight:700;padding:16px;border:1.5px dashed var(--accent);border-radius:12px;margin:16px 0">${esc(code)}</div>
    <div class="small" style="margin-bottom:16px">请妥善保存，此卡密永久有效</div>
    <button id="permClose" class="save-full">继续冒险</button>
  </div>`;
  document.body.appendChild(overlay);
  $("#permClose").onclick=()=>overlay.remove();
}

function openSheet(content) {
  if (state.sheet) state.sheet.remove();
  const backdrop = document.createElement("div");
  backdrop.className = "sheet-backdrop";
  backdrop.innerHTML = `<div class="sheet"><div class="handle"></div>${content}</div>`;
  document.body.appendChild(backdrop);
  state.sheet = backdrop;
  backdrop.addEventListener("click", e => {
    if (e.target === backdrop || e.target.closest("[data-close]")) { backdrop.remove(); state.sheet = null; return; }
    const contact = e.target.closest("[data-contact]");
    if (contact) openContactChat(Number(contact.dataset.contact));
  });
}

applyTheme();
if (state.worldId) loadWorld().catch(() => { state.worldId = null; state.world = null; save(); renderLogin(); });
else renderEntry();
