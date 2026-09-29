# CardWorld Complete v4

Cloudflare Worker + D1 的卡密驱动 AI 世界系统。首页只输入卡密；管理员也通过同一入口输入管理员密码，服务端识别后签发管理员 Session。

## 已实现的核心规则

- 卡型：1h / 5h / 12h / 1d / 7d / 15d / 30d
- 首次激活只创建一次世界；之后继续进入原世界
- 到期后保留 5 天；5 天内可用同类型卡续期；超过 5 天通过 Cron 真正删除卡、世界与关联状态
- 被永久删除的卡密会写入 `retired_cards`，旧卡不会重新激活出新世界
- 所有玩家世界 API 都需要服务端签发的 `player_sessions`，不能只靠 worldId 绕过卡密验证
- 角色只有在 AI 世界引擎明确判定“实际遭遇”后才会 `encountered=1`
- 好感度达到 30 且已遭遇才进入通讯录；降到 0 自动离开通讯录
- 私聊永远不会制造现实遭遇
- 隐藏线索按阶段 / 好感 / 遭遇 / 事件条件解锁
- AI 请求上下文包含世界、玩家状态、人物、关系、事件、最近剧情、可见世界书和解锁状态
- AI 优先返回结构化 JSON，由服务器应用人物遭遇、好感、事件、世界状态等变化
- 未配置 AI 时使用无人物强制登场的安全 fallback，不伪造遭遇
- 世界书包含世界背景、规则、力量、势力、人物、事件、玩家自定义、隐藏线索
- 设置包含世界偏好、剧情、主题、玩家自定义、AI/API
- 语音支持 TTS API + 浏览器系统语音 fallback；浏览器语音和第三方 TTS voice_id 分开保存
- 管理后台支持卡密、续期、世界、世界书、种子、完整人物模板、密码与生命周期清理

## 管理员密码

新数据库第一次启动时，管理员密码默认是：`153512`。

代码中不会把明文密码放到前端；Worker 内仅有 `SHA-256("153512")` 的 bootstrap hash。正式部署建议在 Cloudflare Secret 中设置 `ADMIN_PASSWORD`，或者进入后台后立即修改密码。

## 本地运行

```bash
npm install
npm run db:init
npm run db:seed
npm run dev
```

若使用全新 D1，执行 `schema.sql` 后执行 `seed.sql`。

现有旧版数据库可按顺序执行 `migrations/0002_state_security.sql`，再检查人物模板表是否已经完成升级。

## Cloudflare

1. 创建 D1 数据库并把 `wrangler.toml` 的 `database_id` 改成真实 ID。
2. 设置管理员 Secret：

```bash
npx wrangler secret put ADMIN_PASSWORD
```

3. 执行生产 D1 初始化与种子。
4. 部署：

```bash
npm run deploy
```

## API Key 说明

AI / TTS Key 默认只保存在当前浏览器，不进入 GitHub，也不写入 D1。需要第三方服务允许浏览器 CORS；不允许时可改成 Worker 代理模式。

## 重要数据表

`cards`、`retired_cards`、`worlds`、`player_sessions`、`characters`、`relationships`、`encounters`、`events`、`messages`、`worldbooks`、`player_settings`、`seeds`、`character_templates`、`admin_settings`、`admin_sessions`。
