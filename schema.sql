PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admin_settings (id INTEGER PRIMARY KEY CHECK (id=1), password_hash TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS admin_sessions (token TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS retired_cards (code TEXT PRIMARY KEY, retired_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  duration_seconds INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'unused',
  created_at INTEGER NOT NULL,
  activated_at INTEGER,
  expires_at INTEGER,
  grace_until INTEGER,
  world_id INTEGER,
  renewed_at INTEGER
);
CREATE TABLE IF NOT EXISTS worlds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  genre TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  plot_type TEXT NOT NULL,
  background TEXT NOT NULL,
  world_rules TEXT NOT NULL,
  power_system TEXT NOT NULL,
  current_location TEXT NOT NULL,
  current_time TEXT NOT NULL,
  weather TEXT NOT NULL,
  player_state TEXT NOT NULL DEFAULT '{}',
  hidden_state TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL,
  FOREIGN KEY(card_id) REFERENCES cards(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS player_sessions (
  token TEXT PRIMARY KEY,
  card_id INTEGER NOT NULL,
  world_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  FOREIGN KEY(card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY(world_id) REFERENCES worlds(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  sex TEXT NOT NULL,
  age INTEGER NOT NULL,
  identity TEXT NOT NULL,
  faction TEXT NOT NULL,
  personality TEXT NOT NULL,
  background TEXT NOT NULL,
  past TEXT NOT NULL,
  goals TEXT NOT NULL,
  initial_attitude TEXT NOT NULL,
  affinity INTEGER NOT NULL DEFAULT 0,
  encountered INTEGER NOT NULL DEFAULT 0,
  contact INTEGER NOT NULL DEFAULT 0,
  story_arc TEXT NOT NULL,
  hidden_secret TEXT NOT NULL,
  clue_condition TEXT NOT NULL,
  encounter_condition TEXT NOT NULL,
  chat_rules TEXT NOT NULL,
  voice_id TEXT,
  FOREIGN KEY(world_id) REFERENCES worlds(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id INTEGER NOT NULL,
  from_character_id INTEGER NOT NULL,
  to_character_id INTEGER NOT NULL,
  relation TEXT NOT NULL,
  strength INTEGER NOT NULL DEFAULT 50,
  FOREIGN KEY(world_id) REFERENCES worlds(id) ON DELETE CASCADE,
  FOREIGN KEY(from_character_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY(to_character_id) REFERENCES characters(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS encounters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id INTEGER NOT NULL,
  character_id INTEGER NOT NULL,
  location TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(world_id) REFERENCES worlds(id) ON DELETE CASCADE,
  FOREIGN KEY(character_id) REFERENCES characters(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  stage INTEGER NOT NULL DEFAULT 0,
  trigger_condition TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked',
  FOREIGN KEY(world_id) REFERENCES worlds(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id INTEGER NOT NULL,
  character_id INTEGER,
  channel TEXT NOT NULL DEFAULT 'story',
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(world_id) REFERENCES worlds(id) ON DELETE CASCADE,
  FOREIGN KEY(character_id) REFERENCES characters(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS worldbooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0,
  unlock_condition TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(world_id) REFERENCES worlds(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS player_settings (
  world_id INTEGER PRIMARY KEY,
  data TEXT NOT NULL DEFAULT '{}',
  updated_at INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(world_id) REFERENCES worlds(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS seeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS character_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sex TEXT NOT NULL,
  age INTEGER NOT NULL,
  identity TEXT NOT NULL,
  faction TEXT NOT NULL,
  personality TEXT NOT NULL,
  background TEXT NOT NULL,
  past TEXT NOT NULL,
  goals TEXT NOT NULL,
  initial_attitude TEXT NOT NULL,
  story_arc TEXT NOT NULL,
  hidden_secret TEXT NOT NULL,
  clue_condition TEXT NOT NULL,
  encounter_condition TEXT NOT NULL,
  chat_rules TEXT NOT NULL,
  voice_id TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cards_status_expires ON cards(status,expires_at,grace_until);
CREATE INDEX IF NOT EXISTS idx_sessions_world ON player_sessions(world_id,expires_at);
CREATE INDEX IF NOT EXISTS idx_characters_world_contact ON characters(world_id,contact,affinity);
CREATE INDEX IF NOT EXISTS idx_messages_world_channel ON messages(world_id,channel,id);
CREATE INDEX IF NOT EXISTS idx_worldbooks_world_hidden ON worldbooks(world_id,hidden);
