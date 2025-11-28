# AI 论文润色工具

一个简洁、专业的学术论文润色 Web 应用，采用类 Notion 的设计风格。

## ✨ 特性

- 🎨 **简洁设计** - 类 Notion 风格，专业学术化界面
- 📝 **大段文本输入** - 支持输入和润色长篇论文内容
- ⚙️ **灵活配置** - 可选择润色风格、目标语言和 AI 提供商
- 🔄 **对比显示** - 原文与润色后内容并排对比
- 📋 **便捷操作** - 一键复制和下载结果
- 📱 **响应式设计** - 完美支持桌面端和移动端
- 👤 **用户认证** - 支持用户注册、登录和认证
- 📚 **历史记录** - 保存和管理润色历史

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 构建生产版本

```bash
# 构建
npm run build

# 预览
npm run preview
```

### 生产环境部署

```bash
# 首次部署
./deployment/scripts/deploy-to-docker.sh

# 更新前端代码
./deployment/scripts/update-frontend.sh
```

📖 详细部署文档：[docs/DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md)

## 🛠️ 技术栈

- **React 18** - UI 框架
- **React Router** - 路由管理
- **Vite** - 构建工具
- **CSS3** - 样式（原生 CSS，无额外依赖）

## 📁 项目结构

```
paper-ai-web/
├── src/                           # 源代码
│   ├── components/               # UI 组件
│   │   ├── InputPanel.jsx       # 输入面板
│   │   ├── ComparisonView.jsx   # 对比显示
│   │   ├── Login.jsx            # 登录页面
│   │   ├── Register.jsx         # 注册页面
│   │   ├── History.jsx          # 历史记录
│   │   └── *.css                # 组件样式
│   ├── App.jsx                  # 主应用
│   ├── main.jsx                 # 入口文件
│   └── index.css                # 全局样式
├── deployment/                   # 部署相关
│   ├── scripts/                 # 部署脚本
│   │   ├── deploy-to-docker.sh # 完整部署
│   │   └── update-frontend.sh  # 快速更新
│   └── configs/                 # 配置文件
│       ├── nginx-updated.conf   # Nginx 配置
│       └── docker-compose-updated.yml
├── docs/                         # 文档
│   ├── DOCKER_DEPLOYMENT.md     # 部署文档
│   ├── API_USAGE.md            # API 使用说明
│   └── FRONTEND_INTEGRATION.md  # 前端集成文档
├── dist/                         # 构建输出（自动生成）
├── .env.production              # 生产环境配置
├── index.html
├── vite.config.js
└── package.json
```

## 💡 功能说明

### 润色功能
- **润色风格**：学术、正式、简洁、详细
- **目标语言**：中文、英文、繁体中文
- **AI 提供商**：豆包大模型

### 用户功能
- 用户注册和登录
- JWT Token 认证
- 润色历史记录
- 历史记录管理（删除、查看详情）

## 🌐 API 配置

### 开发环境
```bash
# Vite 代理配置（vite.config.js）
proxy: {
  '/api': 'http://localhost:8080'
}
```

### 生产环境
```bash
# .env.production
VITE_API_BASE_URL=/api
```

Nginx 会将 `/api` 请求代理到后端服务。

## 🔌 环境变量

创建 `.env` 文件（开发环境）：
```bash
VITE_API_BASE_URL=http://localhost:8080
```

生产环境使用 `.env.production`（已配置）。

## 📖 文档

- [Docker 部署指南](docs/DOCKER_DEPLOYMENT.md)
- [API 使用说明](docs/API_USAGE.md)
- [前端集成文档](docs/FRONTEND_INTEGRATION.md)

## 🚀 部署架构

```
浏览器 (http://45.32.16.207)
    ↓
Nginx 容器 (80端口)
    ├── / → 前端静态文件 (React 应用)
    └── /api/ → 后端服务 (app:8080)
```

## 🔄 更新流程

1. 修改代码
2. 本地测试：`npm run dev`
3. 快速部署：`./deployment/scripts/update-frontend.sh`
4. 清空浏览器缓存访问

## 🎨 设计理念

参考 Notion 的设计哲学：
- 极简的视觉层次
- 清晰的信息架构
- 流畅的交互体验
- 优雅的细节处理

## 📄 许可

MIT License
