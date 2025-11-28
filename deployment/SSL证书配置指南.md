# SSL 证书配置指南

## 问题原因
之前 HTTPS 配置被注释掉了，所以访问 https://appbobo.com 返回 404。

## 已完成的配置更改
✅ 启用了 HTTPS 配置（443端口）
✅ 配置了域名 `appbobo.com` 和 `www.appbobo.com`
✅ 设置了 HTTP 到 HTTPS 的自动重定向
✅ 添加了安全头部（HSTS等）

## 部署步骤

### 1. 获取 SSL 证书

**方式一：使用 Let's Encrypt（免费，推荐）**

在服务器上运行：
```bash
# 安装 certbot
sudo apt-get update
sudo apt-get install certbot

# 获取证书
sudo certbot certonly --standalone -d appbobo.com -d www.appbobo.com

# 证书会保存在：
# /etc/letsencrypt/live/appbobo.com/fullchain.pem
# /etc/letsencrypt/live/appbobo.com/privkey.pem
```

**方式二：如果已有证书**
将证书文件上传到服务器的 `/opt/paper_ai/ssl/` 目录：
- fullchain.pem（完整证书链）
- privkey.pem（私钥）

### 2. 部署配置

#### 方式一：Docker Compose 部署（推荐）

```bash
# 在服务器上
cd /opt/paper_ai

# 创建 SSL 目录
sudo mkdir -p ssl

# 如果使用 Let's Encrypt，复制证书
sudo cp /etc/letsencrypt/live/appbobo.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/appbobo.com/privkey.pem ssl/

# 更新 nginx 配置（使用本地修改后的配置）
# 从本地上传新的 nginx-updated.conf 到服务器
```

然后从本地运行：
```bash
# 上传新的配置文件
scp deployment/configs/nginx-updated.conf root@45.32.16.207:/opt/paper_ai/nginx.conf

# SSH 到服务器重启容器
ssh root@45.32.16.207 "cd /opt/paper_ai && docker-compose restart nginx"
```

#### 方式二：直接在服务器配置

```bash
# SSH 到服务器
ssh root@45.32.16.207

# 备份旧配置
cd /opt/paper_ai
cp nginx.conf nginx.conf.backup

# 编辑配置文件（或从本地上传）
vi nginx.conf

# 重启 nginx 容器
docker-compose restart nginx

# 查看日志确认无误
docker logs paper_ai_nginx
```

### 3. 验证配置

```bash
# 测试 nginx 配置语法
docker exec paper_ai_nginx nginx -t

# 查看 nginx 日志
docker logs paper_ai_nginx

# 测试 HTTPS 访问
curl -I https://appbobo.com

# 测试 HTTP 重定向
curl -I http://appbobo.com
```

### 4. 证书自动续期（Let's Encrypt）

Let's Encrypt 证书有效期90天，需要定期续期：

```bash
# 在服务器上设置自动续期
sudo crontab -e

# 添加以下行（每天凌晨2点检查并续期）
0 2 * * * certbot renew --quiet && docker exec paper_ai_nginx nginx -s reload
```

## 快速部署脚本

创建一个快速部署脚本 `deployment/scripts/update-nginx.sh`：

```bash
#!/bin/bash
set -e

SERVER="root@45.32.16.207"
CONFIG_PATH="/opt/paper_ai/nginx.conf"

echo "🔄 更新 Nginx 配置"

# 上传配置
scp deployment/configs/nginx-updated.conf $SERVER:$CONFIG_PATH

# 测试并重启
ssh $SERVER "docker exec paper_ai_nginx nginx -t && docker-compose -f /opt/paper_ai/docker-compose.yml restart nginx"

echo "✅ Nginx 配置已更新并重启"
echo "🌐 访问: https://appbobo.com"
```

## 检查清单

- [ ] DNS 已正确解析（appbobo.com -> 45.32.16.207）
- [ ] SSL 证书已获取并放置在正确位置
- [ ] Docker compose 配置中映射了 SSL 目录
- [ ] Nginx 配置中正确引用了证书路径
- [ ] 防火墙开放了 443 端口
- [ ] Nginx 容器已重启
- [ ] HTTPS 访问测试成功
- [ ] HTTP 自动重定向到 HTTPS

## 故障排查

**如果仍然 404：**
1. 检查 DNS 解析：`nslookup appbobo.com`
2. 检查证书路径：`docker exec paper_ai_nginx ls -la /etc/nginx/ssl/`
3. 检查 nginx 错误日志：`docker logs paper_ai_nginx`
4. 验证 nginx 配置：`docker exec paper_ai_nginx nginx -t`

**如果证书错误：**
1. 确认证书文件存在且可读
2. 检查证书是否过期：`openssl x509 -in fullchain.pem -noout -dates`
3. 确认域名匹配：`openssl x509 -in fullchain.pem -noout -text | grep DNS`
