# 用一句話安裝 Demo Menu

這份指引供 Codex 或 Claude Code 在收到安裝要求後使用。Demo Menu 是本機測試 MCP，提供虛構咖啡店的菜單和可選流程。主 Plugin 安裝到目前使用者的 AI 工具。「預算配餐」可以在聊天裡當次使用，也可以另外裝到專案。

## 1. 裝好主 Plugin

1. 判斷目前的 agent 是 Codex 或 Claude Code，只執行相符的一組命令。若目前環境無法執行本機終端機指令，說明需要在支援本機指令的 Codex 或 Claude Code 開啟這段提示。
2. 若已能呼叫 Demo Menu 的 `list_demo_menu` 和 `list_demo_skills`，直接前往下一節。否則，確認目前工具的 CLI、`git` 和 `node` 可用。若有缺少的項目，說明需要什麼並停在這一步。
3. 在終端機執行下方對應的指令。若已經從本 repo 註冊 `mcp-skill-demo` 來源，可跳過 marketplace add。若同名來源指向其他 repo，告知使用者，保留該設定。若 Windows 出現路徑過長錯誤，可用 [README 的本機 checkout 方式](../README.md#先安裝主-plugin)，把 repo 下載到較短的路徑。

**Codex**

```shell
codex plugin marketplace add https://github.com/RL-RickYeh/mcp-skill-install-demo.git
codex plugin add demo-menu@mcp-skill-demo
```

**Claude Code**

```shell
claude plugin marketplace add https://github.com/RL-RickYeh/mcp-skill-install-demo.git
claude plugin install demo-menu@mcp-skill-demo
```

如果已裝舊版，在 Codex 可更新 Git 來源的 Marketplace（`codex plugin marketplace upgrade mcp-skill-demo`）。如果來源是本機 checkout，先更新該目錄，再執行 `codex plugin add demo-menu@mcp-skill-demo`。Claude Code 使用 [README 的更新流程](../README.md#在聊天選用不用-npx)。

## 2. 確認 MCP 能用，再問使用者

呼叫 `list_demo_menu` 確認有四個品項，再呼叫 `list_demo_skills` 確認有「預算配餐」。若目前 session 還未載入新工具，請使用者在 Codex 開新 chat，或在 Claude Code 執行 `/reload-plugins`。平台若出現信任確認，請使用者依畫面操作。需要延續時可以再貼同一句安裝提示。

確認後詢問：「Demo Menu 已連上。你要現在用一次『預算配餐』、加裝到專案以後繼續用，還是先不用？」

- 選「現在用一次」時，呼叫 `get_demo_skill` 並傳入 `skillId: "choose-demo-combo"`，依回傳的指引完成任務。若沒提供預算，先問預算。這條路不跑安裝指令。Claude Code 日後可輸入 `/demo-menu:list-skills` 重開清單。
- 選「加裝到專案」才進入下一節。若回答未明確選擇，先確認。
- 選「先不用」時，回覆已可使用查菜單功能。

## 3. 使用者同意後，加裝指定 Skill

確認 Node.js 22.20 以上和 `npx` 可用。以下指令應在使用者希望使用 Skill 的專案中執行。若目前沒有明確的專案，先請使用者指定。Windows PowerShell 若阻擋 `npx.ps1`，可執行 `npx.cmd`。

**Codex**

```shell
npx skills add https://github.com/RL-RickYeh/mcp-skill-install-demo/tree/main/library/skills --skill choose-demo-combo -a codex --copy --yes
```

**Claude Code**

```shell
npx skills add https://github.com/RL-RickYeh/mcp-skill-install-demo/tree/main/library/skills --skill choose-demo-combo -a claude-code --copy --yes
```

確認安裝指令成功，再告訴使用者如何試用。Codex 可用 `$choose-demo-combo`，Claude Code 可用 `/choose-demo-combo`。例如「幫我用 150 元配一杯飲品和一份點心」。
