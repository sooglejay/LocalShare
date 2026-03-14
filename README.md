# LocalShare

<div align="center">

**局域网内容共享工具**

IM 群聊风格的局域网内容共享，让同一 WiFi 下的多台设备轻松分享文本

[English](#english) | 简体中文

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## ✨ 功能特点

| 功能 | 描述 |
|------|------|
| 💬 **IM 群聊风格** | 类似微信/Telegram 的聊天界面，消息清晰有序 |
| 🔄 **双向同步** | 任一设备发送，其他设备实时接收 |
| 📱 **设备标识** | 每条消息显示来源设备和发送时间 |
| 🕐 **时间分组** | 按日期自动分组，方便查看历史 |
| 📋 **一键复制** | 点击消息即可复制内容 |
| 🎨 **美观界面** | 现代化响应式设计，支持暗色模式 |
| 🔒 **隐私安全** | 数据仅在局域网内传输，不上传云端 |
| 🚀 **零配置** | 无需数据库，开箱即用 |

## 🖼️ 界面预览

```
┌─────────────────────────────────────────────────────────┐
│  👥 LocalShare 群聊           🟢 3 台设备在线    [开关] │
├─────────────────────────────────────────────────────────┤
│                    ──── 今天 ────                        │
│                                                         │
│  👤 设备-A1B2                           14:30           │
│  ┌──────────────────────────────────────┐              │
│  │ 这是从电脑A发送的内容                 │              │
│  └──────────────────────────────────────┘              │
│                                                         │
│                              👤 电脑B-XY28    14:31     │
│              ┌──────────────────────────────────────┐  │
│              │ 这是从电脑B回复的内容                 │  │
│              └──────────────────────────────────────┘  │
│                                                         │
│  👤 Mac-A                              14:32            │
│  ┌──────────────────────────────────────┐              │
│  │ 点击消息可复制内容                    │              │
│  └──────────────────────────────────────┘              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [输入内容，按 Enter 发送...                    ] [发送] │
│  [粘贴] [滚动到底部]                        [清空] 12字符│
└─────────────────────────────────────────────────────────┘
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm (推荐) 或 npm

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/sooglejay/LocalShare.git
cd LocalShare

# 安装依赖
pnpm install

# 启动服务（默认端口 5000）
pnpm dev

# 或指定端口启动
PORT=3000 pnpm dev
```

### 使用方法

**步骤 1：在电脑 B 启动服务**

```bash
pnpm dev
```

终端会显示：
```
▲ Next.js 16.1.1
- Local:   http://localhost:5000
- Network: http://192.168.1.100:5000
```

**步骤 2：电脑 A 浏览器访问**

```
http://192.168.1.100:5000
```

**步骤 3：开始分享**

- 在输入框输入内容，按 Enter 或点击发送
- 点击消息可复制内容
- 开启右上角开关可实时同步

## 💻 双向同步方案

### 方案一：浏览器访问（推荐）

电脑 A 和电脑 B 都打开浏览器访问服务地址，实现双向同步。

### 方案二：后台脚本（电脑 B）

电脑 B 运行后台脚本，自动监听剪贴板变化：

```bash
# 安装依赖
pip install pyperclip

# 运行监听脚本
python clipboard-watcher.py

# 指定端口
python clipboard-watcher.py --port 3000
```

**脚本功能：**
- 📤 自动推送本地剪贴板内容到群聊
- 📥 自动同步群聊消息到本地剪贴板

## 🛠️ 技术栈

- **框架**: [Next.js 16](https://nextjs.org/) (App Router)
- **语言**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI 组件**: [shadcn/ui](https://ui.shadcn.com/)
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/)
- **图标**: [Lucide React](https://lucide.dev/)

## 📁 项目结构

```
LocalShare/
├── src/
│   ├── app/
│   │   ├── api/messages/
│   │   │   └── route.ts        # 消息 API
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 主页面（IM界面）
│   │   └── globals.css         # 全局样式
│   ├── components/ui/          # shadcn/ui 组件
│   └── lib/utils.ts            # 工具函数
├── clipboard-watcher.py        # 剪贴板监听脚本
├── package.json
└── README.md
```

## 🔌 API 接口

### GET `/api/messages`

获取消息列表

**参数：**
- `after` (可选): 获取此 ID 之后的消息

**响应示例：**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "1773507209176-u0cam0",
        "content": "Hello World",
        "device": "设备-A1B2",
        "deviceId": "A1B2",
        "timestamp": 1773507209176
      }
    ],
    "total": 1
  }
}
```

### POST `/api/messages`

发送新消息

**请求体：**
```json
{
  "content": "要分享的文本内容",
  "device": "设备-A1B2",
  "deviceId": "A1B2"
}
```

### DELETE `/api/messages`

清空所有消息

## ⚙️ 配置选项

### 指定端口

```bash
# 开发环境
PORT=3000 pnpm dev

# 生产环境
PORT=8080 pnpm start
```

| 环境变量 | 描述 | 默认值 |
|---------|------|--------|
| `PORT` | 服务监听端口 | `5000` |

## ⚠️ 注意事项

1. **同一网络**：所有设备必须在同一 WiFi 局域网内
2. **防火墙**：如无法访问，请检查防火墙是否允许对应端口
3. **内容限制**：单条消息最大 1MB，最多保留 100 条
4. **数据存储**：使用内存存储，重启服务后消息会清空

## 🔮 未来计划

- [ ] 支持图片分享
- [ ] 支持文件传输
- [ ] 消息持久化（SQLite）
- [ ] 端到端加密
- [ ] 多房间支持
- [ ] PWA 离线支持

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](LICENSE)

---

<a name="english"></a>
## English

**LAN Content Sharing Tool**

IM-style group chat for sharing text across devices on the same WiFi network.

### Features

- 💬 **IM Chat Style** - WeChat/Telegram-like interface
- 🔄 **Bidirectional Sync** - Send from any device, receive on all
- 📱 **Device Identification** - See who sent each message
- 📋 **One-click Copy** - Click message to copy
- 🔒 **Privacy First** - Data stays in your LAN
- 🚀 **Zero Config** - No database required

### Quick Start

```bash
# Clone the repo
git clone https://github.com/sooglejay/LocalShare.git
cd LocalShare

# Install and run
pnpm install
pnpm dev

# Then open http://[server-ip]:5000 on any device
```

---

<div align="center">

**Made with ❤️ by [sooglejay](https://github.com/sooglejay)**

If this project helps you, please consider giving it a ⭐️

</div>
