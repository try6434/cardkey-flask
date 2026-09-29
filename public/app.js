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
  prefs: { theme: "system", pace: "normal" }
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
    if (state.worldId && (res.status === 401 || res.status === 410) && !path.startsWith("/api/auth/")) { state.sessionToken = ""; save(); renderLogin(); }
    throw Object.assign(new Error(data?.error || `请求失败 ${res.status}`), { data, status: res.status });
  }
  return data;
}

async function loadWorld() {
  const data = await api(`/api/world?id=${state.worldId}`);
  try { const settings = await api(`/api/settings?worldId=${state.worldId}`); const d = settings.data || {}; state.prefs = { ...state.prefs, ...(d.plot || {}), ...(d.appearance || {}) }; state.voice = { ...state.voice, ...(d.voice || {}) }; applyTheme(); } catch {}
  state.world = data.world;
  state.characters = data.characters || [];
  state.messages = data.messages || [];
  state.events = data.events || [];
  state.labels = data.labels || state.labels;
  save();
  renderWorld();
  scrollBottom();
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
        <div class="pill">${esc(String(w.genre || "").toUpperCase())}</div>
      </div>
      <main id="story" class="story">
        <div class="scene">
          <div class="scene-head">
            <div class="scene-line"><span>${esc(w.relationship_type || "")}</span><span>${esc(w.plot_type || "")}</span></div>
            <div class="narration">${esc(w.background || "")}</div>
          </div>
          ${renderMessages()}
        </div>
      </main>
      <div class="composer-wrap">
        ${state.emojiOpen ? emojiPanel() : ""}
        ${state.plusOpen ? plusPanel(labels) : ""}
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
}

function renderMessages() {
  if (!state.messages.length) return `<div class="narration">你站在这个世界的起点。这里还没有告诉你答案，第一步要由你自己迈出。</div>`;
  return state.messages.map(m => {
    if (m.role === "user") return `<div class="user-action">${esc(m.content)}</div>`;
    return `<div class="dialogue"><div class="who">${esc(characterName(m.character_id))}</div><div class="text">${esc(m.content)}</div></div>`;
  }).join("");
}
function characterName(id) {
  if (!id) return "世界";
  return state.characters.find(c => Number(c.id) === Number(id))?.name || "世界";
}
function emojiPanel() {
  const emojis = ["😀","😄","🥹","😂","🙂","😌","😍","🥰","😳","😎","🤔","😐","😮","😴","😭","😡","❤️","🖤","✨","🌙","🔥","🌸","🌧️","☀️","🍵","🍎","🎵","🎮","🫶","👍","👀","🙏","💫","🪽","🐺","🐈","🦊","🐉","☕","📖","⚔️","🗡️","🏹","🔮"];
  return `<div class="emoji-panel">${emojis.map(e => `<button data-emoji="${e}">${e}</button>`).join("")}</div>`;
}
function plusPanel(labels) {
  return `<div class="plus-panel"><div class="plus-grid">
    <button class="plus-item" data-fn="contacts"><span class="ico">👥</span><span class="name">${esc(labels[0])}</span><div class="hint">与你真实遭遇过的人物</div></button>
    <button class="plus-item" data-fn="worldbook"><span class="ico">📖</span><span class="name">${esc(labels[1])}</span><div class="hint">世界规则与已知信息</div></button>
    <button class="plus-item" data-fn="settings"><span class="ico">⚙️</span><span class="name">${esc(labels[2])}</span><div class="hint">AI、剧情与界面</div></button>
    <button class="plus-item" data-fn="voice"><span class="ico">♫</span><span class="name">${esc(labels[3])}</span><div class="hint">角色声音与自动朗读</div></button>
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

  $("#emojiBtn").onclick = () => {
    state.emojiOpen = !state.emojiOpen;
    state.plusOpen = false;
    renderWorld();
    focusStory();
  };
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
    if (fn === "settings") openSettings();
    if (fn === "voice") openVoice();
  });
}
function focusStory() { setTimeout(() => $("#storyInput")?.focus(), 40); }
function scrollBottom() { setTimeout(() => { const s = $("#story"); if (s) s.scrollTop = s.scrollHeight; }, 40); }

async function sendStory() {
  const input = $("#storyInput");
  const content = input.value.trim();
  if (!content || input.disabled) return;
  input.disabled = true;
  try {
    const data = await api("/api/story/message", {
      method: "POST",
      body: JSON.stringify({ worldId: state.worldId, content, ai: state.ai.endpoint ? state.ai : null })
    });
    await loadWorld();
    if (state.voice.autoRead) speak(data.reply, data.character?.id);
  } catch (err) {
    alert(err.message);
  } finally {
    const current = $("#storyInput");
    if (current) { current.disabled = false; current.value = ""; current.dispatchEvent(new Event("input")); current.focus(); }
  }
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
  const data = await api(`/api/contact/messages?worldId=${state.worldId}&characterId=${cid}`);
  openSheet(`<div class="sheet-head"><div><div class="sheet-title">${esc(contact.name)}</div><div class="small">好感度 ${contact.affinity}</div></div><button class="close" data-close>×</button></div>
    <div id="contactMessages" class="contact-chat">${(data.messages || []).map(m => `<div class="bubble ${m.role === "user" ? "me" : "them"}">${esc(m.content)}</div>`).join("") || `<div class="small">还没有私聊消息。</div>`}</div>
    <div class="contact-compose"><input id="contactInput" placeholder="发送消息"><button id="contactSend">↑</button></div>`);
  $("#contactSend").onclick = sendContact;
  $("#contactInput").addEventListener("keydown", e => { if (e.key === "Enter") sendContact(); });
}

async function sendContact() {
  const input = $("#contactInput");
  const contact = state.activeContact;
  const content = input.value.trim();
  if (!content || !contact) return;
  input.disabled = true;
  try {
    const data = await api("/api/contact/message", { method: "POST", body: JSON.stringify({ worldId: state.worldId, characterId: contact.id, content, ai: state.ai.endpoint ? state.ai : null }) });
    $("#contactMessages").insertAdjacentHTML("beforeend", `<div class="bubble me">${esc(content)}</div><div class="bubble them">${esc(data.reply)}</div>`);
    input.value = "";
    if (state.voice.autoRead) speak(data.reply, contact.id);
  } catch (err) { alert(err.message); }
  finally { input.disabled = false; input.focus(); }
}
function emptyState(title, detail) { return `<div class="list-card"><div class="contact-name">${esc(title)}</div><div class="small" style="margin-top:6px">${esc(detail)}</div></div>`; }

async function openWorldbook() {
  const data = await api(`/api/worldbook?worldId=${state.worldId}`);
  const w = data.world;
  const groups = { world:"世界", rules:"规则", power:"力量", faction:"势力", character:"人物", event:"事件", player:"玩家自定义", secret:"隐藏" };
  const entries = (data.entries || []).map(e => `<div class="section"><div class="section-title">${esc(groups[e.category] || e.category)}</div><div class="list-card"><div class="contact-name">${esc(e.title)}</div><div class="small" style="white-space:pre-wrap;margin-top:7px">${esc(e.content)}</div></div></div>`).join("");
  openSheet(`<div class="sheet-head"><div class="sheet-title">${esc(state.labels[1])}</div><button class="close" data-close>×</button></div>
    <div class="section"><div class="list-card"><div class="contact-name">世界状态 · 第 ${data.stage || 0} 阶段</div><div class="small" style="margin-top:7px">${esc(w.current_location)} · ${esc(w.current_time)} · ${esc(w.weather)}</div></div></div>
    <div class="section"><div class="list-card"><div class="contact-name">世界背景</div><div class="small" style="white-space:pre-wrap;margin-top:7px">${esc(w.background)}</div></div></div>
    ${entries || emptyState("暂无可见隐藏条目", "隐藏内容会在达到条件后逐步出现。")}`);
}

async function openSettings() {
  let serverPrefs={}; try { serverPrefs=(await api(`/api/settings?worldId=${state.worldId}`)).data||{}; } catch {}
  const custom=serverPrefs.custom||{};
  const html = `<div class="sheet-head"><div class="sheet-title">${esc(state.labels[2])}</div><button class="close" data-close>×</button></div>
    <div class="form-card"><div class="contact-name">世界偏好</div><div class="field"><label>世界类型偏好</label><input id="genrePref" value="${esc(serverPrefs.world?.genrePreference||state.world?.genre||"")}" placeholder="例如：xianxia / urban"></div>
      <div class="field"><label>关系偏好</label><input id="relPref" value="${esc(serverPrefs.world?.relationship||state.world?.relationship_type||"")}" placeholder="BG / BL / GL / none"></div>
      <div class="field"><label>剧情偏好</label><input id="plotPref" value="${esc(serverPrefs.world?.plot||state.world?.plot_type||"")}" placeholder="adventure / mystery / growth"></div>
    </div>
    <div class="form-card"><div class="contact-name">AI / API</div><div class="small" style="margin:6px 0 12px">支持兼容 OpenAI Chat Completions 的 HTTPS 接口。API Key 只保存在当前浏览器，不上传到 D1，也不会写入 Git。</div>
      <div class="field"><label>API 地址</label><input id="aiEndpoint" value="${esc(state.ai.endpoint)}" placeholder="https://api.example.com/v1/chat/completions"></div>
      <div class="field"><label>API Key</label><input id="aiKey" type="password" value="${esc(state.ai.key)}" placeholder="sk-…"></div>
      <div class="field"><label>模型</label><input id="aiModel" value="${esc(state.ai.model)}" placeholder="模型名称"></div>
      <div class="save-row"><button id="saveAI">保存</button><button class="secondary" id="testAI">测试连接</button></div><div id="aiTestMsg" class="small" style="margin-top:8px"></div>
    </div>
    <div class="form-card"><div class="contact-name">剧情与界面</div><div class="field"><label>节奏</label><select id="pace"><option value="slow">慢</option><option value="normal">正常</option><option value="fast">快</option></select></div>
      <div class="field"><label>界面主题</label><select id="theme"><option value="system">跟随系统</option><option value="light">浅色</option><option value="dark">深色</option></select></div>
      <div class="switch"><div><div class="contact-name">自动推进</div><div class="small">允许世界在每次行动后继续推进事件阶段。</div></div><input id="autoAdvance" type="checkbox"></div>
    </div>
    <div class="form-card"><div class="contact-name">玩家自定义</div><div class="small" style="margin:6px 0 12px">这些内容会保存到这个世界的世界书，影响后续 AI 世界上下文。</div>
      <div class="field"><label>玩家身份/称呼</label><input id="customName" value="${esc(custom.name||"")}" placeholder="例如：渡鸦"></div>
      <div class="field"><label>自定义设定</label><textarea id="customLore" placeholder="你希望这个世界记住的自定义信息">${esc(custom.lore||"")}</textarea></div>
    </div>
    <div class="form-card"><div class="contact-name">其他</div><div class="small">当前世界的状态始终由服务器 D1 保存；清除浏览器数据不会删除云端世界，但会清除本机 AI / TTS 密钥与界面偏好。</div></div>`;
  openSheet(html);
  $("#pace").value=state.prefs.pace||serverPrefs.plot?.pace||"normal"; $("#theme").value=state.prefs.theme||serverPrefs.appearance?.theme||"system"; $("#autoAdvance").checked=serverPrefs.plot?.autoAdvance!==false;
  $("#saveAI").onclick=()=>{state.ai={endpoint:$("#aiEndpoint").value.trim(),key:$("#aiKey").value,model:$("#aiModel").value.trim()};save();$("#aiTestMsg").textContent="AI 设置已保存到当前设备"};
  $("#testAI").onclick=testAI;
  const saveAll=document.createElement('button'); saveAll.textContent='保存全部设置'; saveAll.id='saveAllPrefs'; saveAll.style.marginTop='12px'; $("#autoAdvance").closest('.form-card').appendChild(saveAll);
  saveAll.onclick=async()=>{
    state.prefs={...state.prefs,pace:$("#pace").value,theme:$("#theme").value,autoAdvance:$("#autoAdvance").checked}; applyTheme();
    const data={plot:{pace:state.prefs.pace,autoAdvance:state.prefs.autoAdvance},appearance:{theme:state.prefs.theme},world:{genrePreference:$("#genrePref").value.trim(),relationship:$("#relPref").value.trim(),plot:$("#plotPref").value.trim()},custom:{name:$("#customName").value.trim(),lore:$("#customLore").value}};
    await api(`/api/settings?worldId=${state.worldId}`,{method:'POST',body:JSON.stringify({worldId:state.worldId,data})}); save(); alert('设置已保存');
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
