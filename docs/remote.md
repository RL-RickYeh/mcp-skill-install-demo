# 遠端 Demo Menu MCP

同一份菜單、Skill 目錄和工具可以用本機 stdio Plugin 或遠端 HTTPS 連線。本頁的遠端範例只提供虛構菜單和公開流程，不需要帳密，所有工具都是唯讀。

## RD 部署

- **短期測試**：從 repo 根目錄執行 `node plugins/demo-menu/remote-server.mjs`，把 HTTPS 開發隧道指向 `http://127.0.0.1:8787`，再使用隧道網址的 `/mcp`。隧道與本機服務都要持續執行。重新開啟快速隧道後，網址可能變更。
- **固定網址**：repo 附有 Cloudflare Workers 入口和 `wrangler.jsonc`。在自己的帳號授權後執行 `npx wrangler deploy`，把部署網址加上 `/mcp`。先確認要部署的 Cloudflare 帳號。也可把 Node 入口部署在其他 HTTPS 主機上，並依該主機設定 `DEMO_MCP_HOST` 與 `PORT`。
- **換成正式 MCP**：使用自己的固定 HTTPS 網址，依產品的資料與權限需求設定登入。保留 `list_demo_skills`、`get_demo_skill` 和工作用工具的對應關係，兩個 client 都能沿用同一種對話流程。

## ChatGPT 網頁版

1. 開啟 [ChatGPT Plugins](https://chatgpt.com/plugins)。選 **＋ → Add custom MCP server**。
2. 名稱填 `Demo Menu Remote`，Server URL 填部署網址加 `/mcp`。這個公開測試選 **No authentication**，確認後按 **Create as a plugin**，再到 Personal Plugins 安裝。
3. 開新 **Work** chat，輸入 `@` 選 **Demo Menu Remote**，問「列出 Demo Menu 的官方 Skills，等我選擇。」
4. 回覆「用預算配餐，預算 150 元」。正常會先讀取所選指引，再查菜單，回傳冰美式與紅茶司康共 145 元。

新增自訂 MCP 的入口依帳號與工作區權限提供。OpenAI 的 [網頁測試指引](https://developers.openai.com/plugins/deploy/connect-chatgpt) 有完整說明。

## Claude Code

在終端機執行下方指令，將網址換成你的部署網址：

```sh
claude mcp add --transport http --scope local demo-menu-remote https://YOUR-HOST/mcp
claude mcp list
```

在同一個專案開 Claude Code。輸入 `/` 找 `demo-menu-remote:list-skills`，也可以直接輸入 `/mcp__demo-menu-remote__list-skills`。選定「預算配餐」並給 150 元預算即可。自然語言「請列出 Demo Menu 的官方 Skills」也可以。

遠端 MCP 提供的是 [MCP Prompt](https://code.claude.com/docs/en/mcp#use-mcp-prompts-as-commands)。本機主 Plugin 中的 `/demo-menu:list-skills` 則是隨套件安裝的 Skill。兩邊共用同一份 Skill 目錄以及查菜單工具。

## 更新

- **只改遠端資料或 Skill 指引**：修改 GitHub 來源的 `SKILL.md` 後，執行 `node scripts/build-skill-catalog.mjs`，跑 `node --test` 再部署到原網址。重新連線後兩邊就能讀取新版。
- **改工具名稱、參數或新增工具**：部署後在 ChatGPT Plugins 的連線頁按 **Refresh**，再開新 chat 測。Claude Code 開新 session，確認新工具已載入。
- **ChatGPT 工作區從 GitHub 匯入 Plugin**：管理員在 **Admin Console → Plugins → Marketplaces → Sync now** 同步設定或內建 Skills。MCP server 本身仍由 RD 部署。
- **ChatGPT 公開商店 Plugin**：內建 Skill 或上架資料改動用新版 ZIP 送審。已上架的遠端 MCP 工具更新則走 OpenAI 掃描。

[GitHub Marketplace 同步](https://help.openai.com/en/articles/20001504-importing-and-syncing-plugin-marketplaces-from-github) · [OpenAI 公開商店更新](https://developers.openai.com/plugins/deploy/submission#update-your-published-plugin)
