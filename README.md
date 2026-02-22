# MCP Browser Server

浏览器自动化 MCP 服务器 - 兼容Claude Code 及其他支持 MCP 协议的工具。

## 功能特性

提供 30 个浏览器自动化工具：

| 类别 | 工具 |
|------|------|
| **导航** | `browser_navigate`, `browser_navigate_back`, `browser_navigate_forward`, `browser_reload` |
| **页面信息** | `browser_snapshot`, `browser_take_screenshot`, `browser_search`, `browser_highlight` |
| **交互** | `browser_click`, `browser_type`, `browser_fill`, `browser_fill_form`, `browser_hover`, `browser_select_option`, `browser_press_key`, `browser_scroll`, `browser_drag` |
| **信息获取** | `browser_get_attribute`, `browser_get_input_value`, `browser_get_bounding_box`, `browser_console_messages`, `browser_network_requests` |
| **状态检查** | `browser_is_visible`, `browser_is_enabled`, `browser_is_checked` |
| **等待** | `browser_wait_for` |
| **标签页** | `browser_tabs` (list/new/close/switch) |
| **窗口** | `browser_resize` |
| **安全** | `browser_lock`, `browser_unlock` |
| **对话框** | `browser_handle_dialog` |

## 安装

```bash
cd /home/lpsadmin/work/mcp-cursor-ide-browser
npm install
npm run build
```


## 工具使用示例

### 导航操作

```
打开网页：
browser_navigate(url: "https://example.com")

后退/前进/刷新：
browser_navigate_back()
browser_navigate_forward()
browser_reload()
```

### 页面交互

```
点击元素：
browser_click(selector: "button.submit")

输入文字：
browser_type(selector: "input[name='username']", text: "admin")

清空并填入：
browser_fill(selector: "input[name='email']", text: "test@example.com")

批量填表：
browser_fill_form(fields: {
  "input[name='username']": "admin",
  "input[name='password']": "123456"
})
```

### 页面信息

```
获取页面快照（可访问性树）：
browser_snapshot()

截图：
browser_take_screenshot(fullPage: true)

页面内搜索：
browser_search(query: "登录")
```

### 状态检查

```
检查元素是否可见：
browser_is_visible(selector: ".modal")

检查元素是否启用：
browser_is_enabled(selector: "button.submit")

检查复选框是否勾选：
browser_is_checked(selector: "input[type='checkbox']")
```

### 标签页管理

```
列出所有标签页：
browser_tabs(action: "list")

新建标签页：
browser_tabs(action: "new")

切换标签页：
browser_tabs(action: "switch", tabId: 1)

关闭标签页：
browser_tabs(action: "close", tabId: 2)
```

### 等待操作

```
等待文字出现：
browser_wait_for(text: "加载完成")

等待文字消失：
browser_wait_for(text: "加载中...", waitForGone: true)

等待指定时间：
browser_wait_for(timeout: 3000)
```

### 锁定/解锁

```
锁定浏览器（防止误操作）：
browser_lock()

解锁浏览器：
browser_unlock()
```

## 环境要求

- Node.js 16+
- 支持的操作系统：Linux、macOS、Windows

## 技术栈

- **Puppeteer** - 浏览器自动化
- **@modelcontextprotocol/sdk** - MCP 协议支持
- **TypeScript** - 类型安全

## 配置选项

默认使用 Headless 模式运行（无图形界面）。如需可视化模式，可修改 `src/browser.ts` 中的 `headless` 选项：

```typescript
this.browser = await puppeteer.launch({
  headless: false,  // 改为 false 可启用可视化模式
  // ...
});
```

## 故障排除

### 1. 浏览器启动失败

错误信息：`Missing X server or $DISPLAY`

**解决方案**：确保使用 Headless 模式（默认已启用）。

### 2. 找不到模块

错误信息：`Cannot find module`

**解决方案**：
```bash
cd /home/lpsadmin/work/mcp-cursor-ide-browser
npm install
npm run build
```

### 3. 权限问题

错误信息：`EACCES: permission denied`

**解决方案**：
```bash
chmod +x /home/lpsadmin/work/mcp-cursor-ide-browser/dist/index.js
```

## License

MIT
