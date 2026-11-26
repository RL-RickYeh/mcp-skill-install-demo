# MCP 與 Skill 選裝測試場

這是一間虛構的咖啡店。主 Plugin 讓 AI 查菜單，另外有一個可選裝的 Skill，教 AI 怎麼依預算配出一份餐點。範例使用本機 Node.js 執行，只讀取範例菜單。

## 一句話安裝

把下面這句貼到 **Codex** 或 **Claude Code**。它會先安裝主 Plugin、確認能查菜單，再讓你選擇當次使用「預算配餐」或把它裝到專案。

```text
請讀 https://raw.githubusercontent.com/RL-RickYeh/mcp-skill-install-demo/main/docs/install.md，依我現在用的工具安裝或更新 Demo Menu MCP，確認能查菜單，再問我要當次使用「預算配餐」，還是把它加裝到專案。
```

這個測試需要本機終端機、Git 和 Node.js。若工具跳出信任或執行確認，請依畫面操作。也可以直接看[給 agent 的安裝指引](docs/install.md)。

| 你想做什麼 | 操作 | 可以在聊天裡說什麼 |
| --- | --- | --- |
| 先連上工具 | 裝 Demo Menu 主 Plugin | 「幫我列出測試咖啡店的菜單。」 |
| 在聊天裡用一次 | Claude Code 輸入 `/demo-menu:list-skills` | 「選預算配餐，預算 150 元。」 |
| 留在專案裡反覆使用 | 另外安裝「預算配餐」Skill | Claude Code 輸入 `/choose-demo-combo` |

## 在聊天選用，不用 npx

主 Plugin 裝好後，在 Claude Code 輸入 **`/demo-menu:list-skills`**。看到清單後，回覆「用預算配餐，預算 150 元」。Agent 會讀取指引並查菜單。冰美式和紅茶司康合計 145 元。用 Codex 時，可以在聊天說「列出 Demo Menu 的官方 Skills」。

- **主 Plugin 自帶** `show-demo-menu`（查菜單）與 `list-skills`（開啟 Skill 清單）。
- **聊天按需取用**「預算配餐」。Agent 從 MCP 讀取指引，當次直接執行。
- **另外安裝到專案**後，「預算配餐」也能從 Claude Code 的 `/choose-demo-combo` 或 Codex 的 `$choose-demo-combo` 直接叫出來。

已裝舊版的 Claude Code 使用者先更新。如果原本用本機 checkout 安裝，先在該 checkout 執行 `git pull`。

```shell
claude plugin marketplace update mcp-skill-demo
claude plugin update demo-menu@mcp-skill-demo
```

更新後，在 Claude Code 執行 `/reload-plugins` 或開新 session。

## 先安裝主 Plugin

需要已安裝的 Node.js 與對應的 AI 工具。這是公開 repo，可直接使用 Git 下載。以下主 Plugin 指令都在下載後的資料夾執行。

```shell
git clone https://github.com/RL-RickYeh/mcp-skill-install-demo.git
cd mcp-skill-install-demo
```

### Codex

```shell
codex plugin marketplace add .
codex plugin add demo-menu@mcp-skill-demo
```

開新 chat，請 Codex 列出測試咖啡店的菜單。

### Claude Code

```shell
claude plugin marketplace add .
claude plugin install demo-menu@mcp-skill-demo
```

開新 session，或在現有 session 執行 `/reload-plugins`。如果平台詢問是否信任 Plugin 的本機 MCP，確認後再試「列出測試咖啡店的菜單」。

## 需要長期使用時，選裝「預算配餐」

在 repo 根目錄執行對應的一行。選裝 Skill 需要 Node.js 22.20 以上與 npm 自帶的 `npx`。指令會把 Skill 複製到目前的專案。

```shell
npx skills add ./library/skills --skill choose-demo-combo -a codex --copy
npx skills add ./library/skills --skill choose-demo-combo -a claude-code --copy
```

開新 chat 後，Codex 用 `$choose-demo-combo`，Claude Code 用 `/choose-demo-combo`。例如輸入「用這個 Skill 幫我配一杯飲品和一份點心，共不超過 150 元」。冰美式與紅茶司康合計 145 元。

也可以在想使用 Skill 的專案裡，直接從公開 GitHub 選裝。下方以 Codex 為例，Claude Code 將 `-a codex` 換成 `-a claude-code`。

```shell
npx skills add https://github.com/RL-RickYeh/mcp-skill-install-demo/tree/main/library/skills --skill choose-demo-combo -a codex --copy
```

## 看原始檔

- [主 Plugin](plugins/demo-menu/) 包含 MCP 設定、測試菜單與內建 Skill。
- [選裝 Skill](library/skills/choose-demo-combo/SKILL.md) 可以單獨安裝。
- [清單入口](plugins/demo-menu/skills/list-skills/SKILL.md) 定義「先列清單，等選定才讀取」。
- [Skill 目錄](plugins/demo-menu/skill-catalog.json) 隨主 Plugin 打包。修改來源 Skill 後，執行 `node scripts/build-skill-catalog.mjs` 重新產生，再跑 `node --test`。
- [OpenMotion](https://github.com/nexu-io/openmotion/blob/main/docs/skills.md) 示範官方 Skill Library。
- [Agent Toolkit for AWS](https://github.com/aws/agent-toolkit-for-aws) 和 [Slack](https://github.com/slackapi/slack-skills-plugin) 示範官方 MCP 與 Skills 的發佈方式。
- [Playwright MCP](https://github.com/microsoft/playwright-mcp) 示範安裝按鈕與本機 `npx` 啟動。
