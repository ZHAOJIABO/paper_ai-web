# Docker Nginx 部署方案

## 📋 方案说明

利用现有的 `paper_ai_nginx` Docker 容器来托管前端，同时代理后端 API。

### 架构
```
浏览器
  ↓
Nginx 容器 (80端口)
  ├─ / → 前端静态文件 (React 应用)
  └─ /api/ → 后端容器 (app:8080)
```

---

## 🚀 快速部署

### 一键部署（推荐）

```bash
./deploy-to-docker.sh
```

脚本会自动：
1. ✅ 构建前端项目
2. ✅ 备份服务端 Nginx 配置
3. ✅ 上传前端文件到 `/opt/paper_ai/frontend`
4. ✅ 更新 Nginx 配置
5. ✅ 重启 Nginx 容器
6. ✅ 验证部署

---

## 📝 手动部署

如果你想手动控制每一步：

### 1. 构建前端
```bash
npm run build
```

### 2. 上传到服务器
```bash
# 上传前端文件
scp -r dist/* root@45.32.16.207:/opt/paper_ai/frontend/

# 上传 Nginx 配置
scp nginx-updated.conf root@45.32.16.207:/opt/paper_ai/nginx.conf
```

### 3. 重启容器
```bash
ssh root@45.32.16.207
cd /opt/paper_ai
docker-compose restart nginx
```

### 4. 验证
```bash
docker ps
docker logs paper_ai_nginx
```

---

## 🔧 配置说明

### 主要修改

#### 1. `docker-compose.yml` 变化
```yaml
nginx:
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
    - ./ssl:/etc/nginx/ssl:ro
    - ./frontend:/usr/share/nginx/html:ro  # 新增：挂载前端文件
```

#### 2. `nginx.conf` 变化
- ✅ 添加了前端静态文件托管
- ✅ `/` 路由处理（React Router 支持）
- ✅ `/api/` 代理到后端
- ✅ 静态资源缓存
- ✅ 安全头部

---

## 🌐 访问地址

部署完成后：

- **前端**: http://45.32.16.207
- **后端 API**: http://45.32.16.207/api/
- **健康检查**: http://45.32.16.207/health

---

## 🔍 故障排查

### 1. 检查容器状态
```bash
ssh root@45.32.16.207
docker ps
```

### 2. 查看 Nginx 日志
```bash
docker logs paper_ai_nginx

# 实时查看
docker logs -f paper_ai_nginx
```

### 3. 查看后端日志
```bash
docker logs paper_ai_app
docker logs -f paper_ai_app
```

### 4. 检查文件是否存在
```bash
ssh root@45.32.16.207 "ls -la /opt/paper_ai/frontend/"
```

### 5. 测试 Nginx 配置
```bash
docker exec paper_ai_nginx nginx -t
```

### 6. 进入容器内部检查
```bash
docker exec -it paper_ai_nginx sh
ls -la /usr/share/nginx/html/
cat /etc/nginx/nginx.conf
```

---

## 🔄 更新部署

当你更新前端代码后，重新部署：

```bash
# 方式 1: 使用脚本
./deploy-to-docker.sh

# 方式 2: 手动更新
npm run build
scp -r dist/* root@45.32.16.207:/opt/paper_ai/frontend/
ssh root@45.32.16.207 "cd /opt/paper_ai && docker-compose restart nginx"
```

---

## 🔙 回滚

如果部署出现问题，可以快速回滚：

```bash
ssh root@45.32.16.207
cd /opt/paper_ai

# 查看备份文件
ls -la nginx.conf.backup.*

# 恢复备份（替换时间戳）
cp nginx.conf.backup.20241128_123456 nginx.conf

# 重启容器
docker-compose restart nginx
```

---

## ⚠️ 注意事项

1. **文件权限**: 前端文件必须让 Nginx 用户可读
2. **路径正确**: 确保 `./frontend` 目录存在且有内容
3. **配置同步**: 修改配置后必须重启容器才能生效
4. **备份重要**: 每次部署前都会自动备份旧配置

---

## 🎯 完整文件结构

服务器上的文件结构：
```
/opt/paper_ai/
├── docker-compose.yml
├── nginx.conf (更新后的)
├── nginx.conf.backup.* (自动备份)
├── frontend/          (新增)
│   ├── index.html
│   └── assets/
│       ├── index-*.js
│       └── index-*.css
├── config/
├── logs/
└── ssl/
```

---

## 📊 性能优化

Nginx 配置已包含：
- ✅ Gzip 压缩
- ✅ 静态资源缓存（1年）
- ✅ 正确的 MIME 类型
- ✅ 连接超时配置

---

## 🔒 安全建议

1. 考虑启用 HTTPS（nginx.conf 中已有 HTTPS 配置模板）
2. 定期更新 Docker 镜像
3. 使用强密码保护数据库
4. 配置防火墙规则

---

## 📞 需要帮助？

如果遇到问题：
1. 查看日志: `docker logs paper_ai_nginx`
2. 检查网络: `curl http://45.32.16.207`
3. 验证 API: `curl http://45.32.16.207/api/health`
