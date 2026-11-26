# 用一句話安裝 Demo Menu

這份指引供 Codex 或 Claude Code 在收到安裝要求後使用。Demo Menu 是本機測試 MCP，只會回傳虛構咖啡店的菜單。主 Plugin 安裝到目前使用者的 AI 工具。「預算配餐」是額外的專案 Skill，由使用者選擇是否安裝。

## 1. 裝好主 Plugin

1. 判斷目前的 agent 是 Codex 或 Claude Code，只執行相符的一組命令。若目前環境無法執行本機終端機指令，說明需要在支援本機指令的 Codex 或 Claude Code 開啟這段提示。
2. 若目前已能呼叫 Demo Menu 的 `list_demo_menu`，直接前往下一節。否則，確認目前工具的 CLI、`git` 和 `node` 可用。若有缺少的項目，說明需要什麼並停在這一步。
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

## 2. 確認 MCP 能用，再問使用者

在目前工具中呼叫 Demo Menu 的 `list_demo_menu`。正常結果有四個品項，例如冰美式 80 元、紅茶司康 65 元。若目前 session 還未載入新工具，先請使用者在 Codex 開新 chat，或在 Claude Code 執行 `/reload-plugins`。若出現平台的信任確認，請使用者依畫面操作。請使用者在需要延續時再次貼同一句安裝提示，已能呼叫工具時會直接跳到這一步。

確認菜單後，詢問：「Demo Menu 已連上，能查到四個品項。要一起加裝『預算配餐』Skill，讓我幫你在指定預算內配一杯飲品和一份點心嗎？」

等使用者明確答應才進行下一節。若拒絕，回覆已可使用查菜單功能。

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
