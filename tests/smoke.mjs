import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const here = new URL('.', import.meta.url).pathname;
const root = here.endsWith('/tests/') ? path.resolve(here, '..') : path.resolve(here, '..');
const schema = fs.readFileSync(path.join(root,'schema.sql'),'utf8');
const seed = fs.readFileSync(path.join(root,'seed.sql'),'utf8');
const db = new DatabaseSync(':memory:');
db.exec(schema);
db.exec(seed);

db.exec(`INSERT OR IGNORE INTO admin_settings(id,password_hash,updated_at) VALUES(1,'7aa5740b4f25586a20117bd38e1d0bc67d5f3c21089197bd13a715345ab70235',strftime('%s','now'))`);

class Stmt {
  constructor(sql, params=[]) { this.sql=sql; this.params=params; }
  bind(...params){ return new Stmt(this.sql, params); }
  first(){ return db.prepare(this.sql).get(...this.params) ?? null; }
  all(){ return { results: db.prepare(this.sql).all(...this.params) }; }
  run(){ const r=db.prepare(this.sql).run(...this.params); return { meta:{last_row_id:Number(r.lastInsertRowid),changes:Number(r.changes)} }; }
}
const DB = { prepare(sql){ return new Stmt(sql); }, batch(stmts){ const out=[]; for(const s of stmts)out.push(s.run()); return out; } };
const env = { DB, ASSETS: { fetch: async ()=>new Response('asset',{status:404}) } };
const mod = await import(`file://${path.join(root,'src/worker.js')}`);
const worker = mod.default;

const originalFetch = globalThis.fetch;
let aiMode = 'encounter'; let targetCharId=0;
globalThis.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input?.url || '';
  if(url.startsWith('https://mock.ai')) {
    let obj;
    if(aiMode==='encounter') obj={narrative:'你在初始区域真正遇见了这个角色。',primaryCharacterId:targetCharId,events:[{title:'隐藏线索出现',status:'locked'}],encounters:[{characterId:targetCharId,affinityDelta:30,location:'初始区域'}],affinityChanges:[],worldUpdates:{current_location:'初始区域',current_time:'第一天 09:00',weather:'晴',stage:1,player_state_patch:{custom:{scene:'首次遭遇'}}},unlockClues:[]};
    else if(aiMode==='boost') obj={narrative:'你们继续经历了一段重要互动。',primaryCharacterId:targetCharId,events:[{title:'关系转折',status:'unlocked'}],encounters:[],affinityChanges:[{characterId:targetCharId,delta:30}],worldUpdates:{stage:2,player_state_patch:{custom:{scene:'关系变化'}}},unlockClues:[]};
    else obj={narrative:'连接成功',primaryCharacterId:null,events:[],encounters:[],affinityChanges:[],worldUpdates:{},unlockClues:[]};
    return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(obj)}}]}),{status:200,headers:{'content-type':'application/json'}});
  }
  return originalFetch(input,init);
};

async function call(pathname, {method='GET', body, token}={}) {
  const headers={'content-type':'application/json'};
  if(token)headers.authorization=`Bearer ${token}`;
  const req=new Request('https://cardworld.test'+pathname,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
  return worker.fetch(req,env);
}
async function data(res){let x=null;try{x=await res.json()}catch{};return x}
function ok(cond,msg){if(!cond)throw new Error(msg)}

// 1) Admin password and server session
let r=await call('/api/auth/card',{method:'POST',body:{code:'153512'}});let d=await data(r);ok(r.status===200&&d.admin&&d.token,'admin login 153512 failed');const admin=d.token;
// 2) Generate two same-type cards and one expiry test card
r=await call('/api/admin/cards',{method:'POST',token:admin,body:{duration:'1d',count:2}});d=await data(r);ok(r.status===200&&d.cards.length===2,'generate cards failed');const card1=d.cards[0].code, card2=d.cards[1].code;
r=await call('/api/admin/cards',{method:'POST',token:admin,body:{duration:'5h',count:1}});d=await data(r);const expCard=d.cards[0].code;
// 3) Activate world and check session protection
r=await call('/api/auth/card',{method:'POST',body:{code:card1}});d=await data(r);ok(r.status===200&&d.worldId&&d.sessionToken,'activation/session failed');const wid=d.worldId, session=d.sessionToken;
r=await call(`/api/world?id=${wid}`);ok(r.status===401,'world endpoint bypassed session');
r=await call(`/api/world?id=${wid}`,{token:session});d=await data(r);ok(r.status===200&&d.characters.length===9,'world load/character count failed');targetCharId=d.characters[0].id;
// 4) No AI fallback must NOT fake an encounter
r=await call('/api/story/message',{method:'POST',token:session,body:{worldId:wid,content:'我先观察四周。'}});d=await data(r);ok(r.status===200,'story fallback failed');
let chk=db.prepare('SELECT COUNT(*) n FROM characters WHERE world_id=? AND encountered=1').get(wid);ok(Number(chk.n)===0,'fallback falsely created encounter');
// 5) Structured AI real encounter => affinity 30/contact 1
aiMode='encounter';r=await call('/api/story/message',{method:'POST',token:session,body:{worldId:wid,content:'我朝前走去，和眼前的人真正见面。',ai:{endpoint:'https://mock.ai/chat',model:'mock'}}});d=await data(r);ok(r.status===200&&d.character?.id===targetCharId,'structured encounter not applied');
chk=db.prepare('SELECT encountered,affinity,contact FROM characters WHERE id=?').get(targetCharId);ok(Number(chk.encountered)===1&&Number(chk.affinity)===30&&Number(chk.contact)===1,'encounter/contact state wrong');
r=await call(`/api/contacts?worldId=${wid}`,{token:session});d=await data(r);ok(d.contacts.length===1&&d.contacts[0].id===targetCharId,'contacts did not reflect encounter+30');
// 6) Stage/affinity unlock
aiMode='boost';r=await call('/api/story/message',{method:'POST',token:session,body:{worldId:wid,content:'我认真帮助对方处理眼前的问题。',ai:{endpoint:'https://mock.ai/chat',model:'mock'}}});ok(r.status===200,'boost story failed');
r=await call(`/api/worldbook?worldId=${wid}`,{token:session});d=await data(r);ok(d.entries.some(x=>x.title==='隐藏线索Ⅰ'),'stage 2 clue did not unlock');ok(d.entries.some(x=>x.title==='隐藏线索Ⅱ'),'affinity 60 clue did not unlock');
// 7) Contact chat cannot create new encounter for another character
r=await call('/api/contact/message',{method:'POST',token:session,body:{worldId:wid,characterId:targetCharId,content:'你好',ai:{endpoint:'https://mock.ai/chat',model:'mock'}}});ok(r.status===200,'contact chat failed');chk=db.prepare('SELECT encountered,contact,affinity FROM characters WHERE id=?').get(targetCharId);ok(Number(chk.encountered)===1&&Number(chk.contact)===1,'contact chat broke state');
// 8) If affinity reaches 0 contact disappears but encounter remains
db.prepare('UPDATE characters SET affinity=0,contact=0 WHERE id=?').run(targetCharId);r=await call(`/api/contacts?worldId=${wid}`,{token:session});d=await data(r);ok(d.contacts.length===0,'contact not removed at affinity 0');chk=db.prepare('SELECT encountered FROM characters WHERE id=?').get(targetCharId);ok(Number(chk.encountered)===1,'encounter incorrectly cleared');
// 9) Renewal preserves world and consumes same-type new card
r=await call('/api/admin/cards/renew',{method:'POST',token:admin,body:{currentCode:card1,renewalCode:card2}});d=await data(r);ok(r.status===200&&d.expiresAt,'renewal failed');chk=db.prepare('SELECT status,world_id FROM cards WHERE code=?').get(card2);ok(chk.status==='used'&&Number(chk.world_id)===wid,'renewal card state wrong');
// 10) Template full fields CRUD
const tmpl={name:'测试模板',sex:'男',age:20,identity:'测试',faction:'中立',personality:'冷静',background:'背景',past:'过去',goals:'目标',initial_attitude:'观望',story_arc:'支线',hidden_secret:'秘密',clue_condition:'stage >= 2',encounter_condition:'自然遭遇',chat_rules:'边界',voice_id:'voice-test'};
r=await call('/api/admin/templates',{method:'POST',token:admin,body:tmpl});ok(r.status===200,'template create failed');r=await call('/api/admin/templates',{token:admin});d=await data(r);ok(d.templates.some(x=>x.name==='测试模板'&&x.past==='过去'&&x.hidden_secret==='秘密'&&x.clue_condition==='stage >= 2'),'template full fields missing');
// 11) Permanent deletion + tombstone
r=await call('/api/auth/card',{method:'POST',body:{code:expCard}});d=await data(r);ok(r.status===200,'expiry card activation failed');const expWid=d.worldId;db.prepare("UPDATE cards SET expires_at=?,grace_until=? WHERE code=?").run(Math.floor(Date.now()/1000)-10,Math.floor(Date.now()/1000)-1,expCard);r=await call('/api/admin/cleanup',{method:'POST',token:admin});ok(r.status===200,'cleanup failed');r=await call('/api/auth/card',{method:'POST',body:{code:expCard}});d=await data(r);ok(r.status===410&&/永久失效/.test(d.error),'retired card resurrected or wrong response');ok(!db.prepare('SELECT id FROM worlds WHERE id=?').get(expWid),'world was not permanently deleted');
console.log('PASS', {worldId:wid,encounteredCharacter:targetCharId,renewed:true,sessionProtected:true,hiddenUnlocks:true,tombstone:true,templateCRUD:true});
