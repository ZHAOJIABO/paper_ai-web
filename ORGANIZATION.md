# 项目文件整理说明

## 📂 新的目录结构

```
paper-ai-web/
├── 📂 src/                          # 源代码
│   ├── components/                 # React 组件
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── 📂 deployment/                   # 部署相关（新）
│   ├── scripts/                    # 部署脚本
│   │   ├── deploy-to-docker.sh    # 完整部署
│   │   └── update-frontend.sh     # 快速更新
│   └── configs/                    # 配置文件
│       ├── nginx-updated.conf      # Nginx 配置
│       └── docker-compose-updated.yml
│
├── 📂 docs/                         # 文档（新）
│   ├── DOCKER_DEPLOYMENT.md        # 部署文档
│   ├── API_USAGE.md               # API 使用说明
│   └── FRONTEND_INTEGRATION.md     # 前端集成文档
│
├── 📄 deploy.sh                     # 快捷部署（链接到 deployment/scripts/）
├── 📄 update.sh                     # 快捷更新（链接到 deployment/scripts/）
├── 📄 README.md                     # 项目说明（已更新）
├── 📄 .env.production              # 生产环境配置
├── 📄 index.html
├── 📄 vite.config.js
└── 📄 package.json
```

## 🔄 变化说明

### 新增目录

1. **`deployment/`** - 部署相关文件集中管理
   - `scripts/` - 所有部署脚本
   - `configs/` - 配置文件模板

2. **`docs/`** - 文档集中存放
   - 部署文档
   - API 文档
   - 集成文档

### 移动的文件

**部署脚本** → `deployment/scripts/`
- `deploy-to-docker.sh`
- `update-frontend.sh`

**配置文件** → `deployment/configs/`
- `nginx-updated.conf`
- `docker-compose-updated.yml`

**文档** → `docs/`
- `DOCKER_DEPLOYMENT.md`
- `API_USAGE.md`
- `FRONTEND_INTEGRATION.md`

### 新增的快捷脚本

**根目录快捷方式**（方便使用）：
- `deploy.sh` → 链接到完整部署脚本
- `update.sh` → 链接到快速更新脚本

## 🚀 使用方式

### 部署

```bash
# 方式 1: 使用快捷脚本（推荐）
./deploy.sh

# 方式 2: 直接使用完整路径
./deployment/scripts/deploy-to-docker.sh
```

### 更新

```bash
# 方式 1: 使用快捷脚本（推荐）
./update.sh

# 方式 2: 直接使用完整路径
./deployment/scripts/update-frontend.sh
```

## 📖 查看文档

所有文档都在 `docs/` 目录：

```bash
# 部署文档
cat docs/DOCKER_DEPLOYMENT.md

# API 文档
cat docs/API_USAGE.md

# 集成文档
cat docs/FRONTEND_INTEGRATION.md
```

或者在 IDE 中直接打开查看。

## 🎯 整理优势

1. **清晰的目录结构** - 不同类型文件分类存放
2. **易于维护** - 相关文件集中管理
3. **方便使用** - 根目录保留快捷脚本
4. **文档集中** - 所有文档统一存放在 docs/
5. **版本控制友好** - 结构清晰，便于 Git 管理

## ✨ 根目录保持简洁

现在根目录只保留：
- 核心配置文件（package.json, vite.config.js 等）
- 快捷脚本（deploy.sh, update.sh）
- 主要说明文档（README.md）
- 源代码目录（src/）

所有辅助文件都分类到对应目录中。
