#!/bin/bash
# Paper AI 前端部署到 Docker Nginx 容器

set -e

SERVER="root@45.32.16.207"
BACKEND_PATH="/opt/paper_ai"
FRONTEND_PATH="/opt/paper_ai/frontend"

echo "🚀 Paper AI 前端部署到 Docker Nginx"
echo "===================================="
echo ""

# 步骤 1: 本地构建
echo "📦 步骤 1/6: 构建前端项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi
echo "✅ 构建成功"
echo ""

# 步骤 2: 备份服务端配置
echo "💾 步骤 2/6: 备份服务端配置..."
ssh $SERVER "cd $BACKEND_PATH && cp nginx.conf nginx.conf.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ 备份完成"
echo ""

# 步骤 3: 上传文件
echo "📤 步骤 3/6: 上传前端文件和配置..."
# 创建前端目录
ssh $SERVER "mkdir -p $FRONTEND_PATH"

# 上传前端文件
scp -r dist/* $SERVER:$FRONTEND_PATH/

# 上传更新的 nginx 配置
scp deployment/configs/nginx-updated.conf $SERVER:$BACKEND_PATH/nginx.conf

echo "✅ 文件上传完成"
echo ""

# 步骤 4: 验证上传
echo "🔍 步骤 4/6: 验证文件..."
ssh $SERVER "ls -la $FRONTEND_PATH/ && echo '---' && ls -la $BACKEND_PATH/nginx.conf"
echo ""

# 步骤 5: 重启 Docker 容器
echo "🔄 步骤 5/6: 重启 Nginx 容器..."
ssh $SERVER "cd $BACKEND_PATH && docker-compose restart nginx"
echo "✅ 容器重启完成"
echo ""

# 步骤 6: 验证部署
echo "✅ 步骤 6/6: 验证部署..."
echo ""
echo "检查容器状态..."
ssh $SERVER "docker ps | grep paper_ai"
echo ""

echo "🎉 部署完成！"
echo ""
echo "📋 访问信息："
echo "   🌐 前端地址: http://45.32.16.207"
echo "   🔧 后端 API: http://45.32.16.207/api/"
echo ""
echo "📊 查看日志："
echo "   docker logs -f paper_ai_nginx"
echo "   docker logs -f paper_ai_app"
echo ""
echo "💡 如果遇到问题："
echo "   1. 查看 Nginx 日志: ssh $SERVER 'docker logs paper_ai_nginx'"
echo "   2. 恢复备份: ssh $SERVER 'cd $BACKEND_PATH && cp nginx.conf.backup.* nginx.conf && docker-compose restart nginx'"
