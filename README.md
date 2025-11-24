# AI 论文润色工具

一个简洁、专业的学术论文润色Web应用，采用类 Notion 的设计风格。

## ✨ 特性

- 🎨 **简洁设计** - 类 Notion 风格，专业学术化界面
- 📝 **大段文本输入** - 支持输入和润色长篇论文内容
- ⚙️ **灵活配置** - 可选择润色风格、目标语言和 AI 提供商
- 🔄 **对比显示** - 原文与润色后内容并排对比
- 📋 **便捷操作** - 一键复制和下载结果
- 📱 **响应式设计** - 完美支持桌面端和移动端

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🛠️ 技术栈

- **React 18** - UI 框架
- **Vite** - 构建工具
- **CSS3** - 样式（原生 CSS，无额外依赖）

## 📁 项目结构

```
paper-ai-web/
├── src/
│   ├── components/
│   │   ├── InputPanel.jsx          # 输入面板组件
│   │   ├── InputPanel.css
│   │   ├── ComparisonView.jsx      # 对比显示组件
│   │   └── ComparisonView.css
│   ├── App.jsx                     # 主应用组件
│   ├── App.css
│   ├── main.jsx                    # 入口文件
│   └── index.css                   # 全局样式
├── index.html
├── vite.config.js
└── package.json
```

## 💡 配置选项

### 润色风格
- 学术风格 - 适合学术论文
- 正式风格 - 正式场合用语
- 简洁风格 - 简明扼要表达
- 详细风格 - 详尽充分说明

### 目标语言
- 中文
- 英文
- 繁体中文

### AI 提供商
- OpenAI
- Claude
- Gemini
- 通义千问

## 🔌 接入 AI API

当前版本使用模拟数据。要接入真实的 AI API，请修改 src/App.jsx 中的 handlePolish 函数。

## 🎨 设计理念

参考 Notion 的设计哲学：
- 极简的视觉层次
- 清晰的信息架构
- 流畅的交互体验
- 优雅的细节处理

## 📄 许可

MIT License
