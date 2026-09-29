-- For an existing D1 database created by V3.
CREATE TABLE IF NOT EXISTS retired_cards (code TEXT PRIMARY KEY, retired_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS player_sessions (token TEXT PRIMARY KEY, card_id INTEGER NOT NULL, world_id INTEGER NOT NULL, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL, last_seen_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_sessions_world ON player_sessions(world_id,expires_at);
-- Fresh installs should use schema.sql; existing installs need the template columns below.
ALTER TABLE character_templates ADD COLUMN past TEXT NOT NULL DEFAULT '';
ALTER TABLE character_templates ADD COLUMN initial_attitude TEXT NOT NULL DEFAULT '初始观望。';
ALTER TABLE character_templates ADD COLUMN hidden_secret TEXT NOT NULL DEFAULT '';
ALTER TABLE character_templates ADD COLUMN clue_condition TEXT NOT NULL DEFAULT 'stage >= 2';
ALTER TABLE character_templates ADD COLUMN encounter_condition TEXT NOT NULL DEFAULT '必须在世界剧情中自然遭遇。';
