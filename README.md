# LocalShare

<div align="center">

**局域网剪贴板同步工具**

让同一 WiFi 下的多台设备轻松共享剪贴板内容

[English](#english) | 简体中文

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## ✨ 功能特点

| 功能 | 描述 |
|------|------|
| 🔄 **双向同步** | 任一设备发送内容，其他设备自动接收 |
| ⚡ **实时刷新** | 每秒自动检查更新，无需手动刷新 |
| 📱 **设备标识** | 清晰显示内容来源设备 |
| 🕐 **时间戳** | 显示最后同步时间 |
| 📋 **一键操作** | 复制、粘贴、发送按钮一应俱全 |
| 🎨 **美观界面** | 现代化响应式设计，支持暗色模式 |
| 🔒 **隐私安全** | 数据仅在局域网内传输，不上传云端 |
| 🚀 **零配置** | 无需数据库，开箱即用 |

## 🖼️ 预览

```
┌─────────────────────────────────────────────────────────┐
│                   局域网剪贴板同步                        │
├─────────────────────────────────────────────────────────┤
│  同步状态                              [自动同步: 开启]   │
│  当前设备: 设备-A1B2                                     │
│  最后来源: 设备-C3D4 | 更新时间: 14:32:05               │
├─────────────────────────────────────────────────────────┤
│  剪贴板内容                                              │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 在这里输入或粘贴内容...                              ││
│  │                                                     ││
│  │                                                     ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  [发送到服务器] [复制内容] [从剪贴板粘贴] [刷新]          │
│                                              128 字符    │
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

#### 场景：电脑B（高性能）运行服务，电脑A（任意设备）浏览器访问

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

**步骤 2：在电脑 A 浏览器访问**

打开浏览器，访问电脑 B 显示的 Network 地址：
```
http://192.168.1.100:5000
```

**步骤 3：开始同步**

1. 在任一设备输入内容并点击「发送到服务器」
2. 其他设备开启「自动同步」后自动接收
3. 点击「复制内容」粘贴到本地使用

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
│   │   ├── api/clipboard/
│   │   │   └── route.ts        # 剪贴板 API
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 主页面
│   │   └── globals.css         # 全局样式
│   ├── components/ui/          # shadcn/ui 组件
│   └── lib/utils.ts            # 工具函数
├── public/                     # 静态资源
├── package.json
└── README.md
```

## 🔌 API 接口

### GET `/api/clipboard`

获取当前剪贴板内容

**响应示例：**
```json
{
  "success": true,
  "data": {
    "content": "Hello World",
    "updatedAt": 1699999999999,
    "device": "设备-A1B2"
  }
}
```

### POST `/api/clipboard`

发送剪贴板内容

**请求体：**
```json
{
  "content": "要同步的文本内容",
  "device": "设备-A1B2"
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "content": "要同步的文本内容",
    "updatedAt": 1699999999999,
    "device": "设备-A1B2"
  }
}
```

## ⚙️ 配置选项

### 指定端口

通过环境变量 `PORT` 指定服务端口：

```bash
# 开发环境 - 使用 3000 端口
PORT=3000 pnpm dev

# 生产环境 - 使用 8080 端口
PORT=8080 pnpm start
```

| 环境变量 | 描述 | 默认值 |
|---------|------|--------|
| `PORT` | 服务监听端口 | `5000` |

## 💡 双向同步方案

### 方案一：电脑B也打开浏览器（最简单）

电脑B在浏览器中访问自己的服务：
```
http://localhost:5000
```

这样两台电脑都打开页面，可以双向同步。

### 方案二：电脑B运行后台脚本（推荐）

在电脑B上运行剪贴板监听脚本，自动同步本地剪贴板：

```bash
# 安装依赖
pip install pyperclip

# 运行监听脚本（默认端口 5000）
python clipboard-watcher.py

# 指定端口
python clipboard-watcher.py --port 3000

# 指定服务地址
python clipboard-watcher.py --url http://localhost:5000
```

**功能：**
- 📤 自动推送本地剪贴板内容到服务
- 📥 自动接收服务内容到本地剪贴板
- 🔄 双向实时同步

## ⚠️ 注意事项

1. **同一网络**：所有设备必须在同一 WiFi 局域网内
2. **防火墙**：如无法访问，请检查防火墙是否允许对应端口
3. **内容限制**：目前支持文本内容，最大 1MB
4. **数据存储**：使用内存存储，重启服务后内容会清空
5. **浏览器权限**：复制/粘贴功能需要浏览器授权

## 🔮 未来计划

- [ ] 支持图片同步
- [ ] 支持文件传输
- [ ] 添加历史记录
- [ ] 端到端加密
- [ ] 多房间支持
- [ ] PWA 离线支持

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

```bash
# Fork 后克隆
git clone https://github.com/your-username/LocalShare.git

# 创建分支
git checkout -b feature/amazing-feature

# 提交更改
git commit -m 'Add amazing feature'

# 推送分支
git push origin feature/amazing-feature

# 创建 Pull Request
```

## 📄 许可证

[MIT License](LICENSE)

---

<a name="english"></a>
## English

**LAN Clipboard Sync Tool**

Easily share clipboard content across multiple devices on the same WiFi network.

### Features

- 🔄 **Bidirectional Sync** - Send from any device, receive on all others
- ⚡ **Real-time Refresh** - Auto-check for updates every second
- 📱 **Device Identification** - See which device sent the content
- 🎨 **Beautiful UI** - Modern responsive design with dark mode
- 🔒 **Privacy First** - Data stays in your LAN, never uploaded to cloud
- 🚀 **Zero Config** - No database required, works out of the box

### Quick Start

```bash
# Clone the repo
git clone https://github.com/sooglejay/LocalShare.git
cd LocalShare

# Install dependencies
pnpm install

# Start the server
pnpm dev
```

Then open `http://[server-ip]:5000` in your browser on any device.

---

<div align="center">

**Made with ❤️ by [sooglejay](https://github.com/sooglejay)**

If this project helps you, please consider giving it a ⭐️

</div>
