#!/bin/bash
# Nginx 配置更新脚本

set -e

SERVER="root@45.32.16.207"
CONFIG_PATH="/opt/paper_ai/nginx.conf"

echo "🔄 更新 Nginx 配置到服务器"
echo "========================"
echo ""

# 步骤 1: 上传配置
echo "📤 步骤 1/3: 上传新配置..."
scp deployment/configs/nginx-updated.conf $SERVER:$CONFIG_PATH
echo "✅ 配置已上传"
echo ""

# 步骤 2: 测试配置
echo "🧪 步骤 2/3: 测试 Nginx 配置..."
ssh $SERVER "docker exec paper_ai_nginx nginx -t"
if [ $? -ne 0 ]; then
    echo "❌ Nginx 配置测试失败"
    exit 1
fi
echo "✅ 配置测试通过"
echo ""

# 步骤 3: 重启 Nginx
echo "🔄 步骤 3/3: 重启 Nginx 容器..."
ssh $SERVER "cd /opt/paper_ai && docker-compose restart nginx"
echo "✅ Nginx 已重启"
echo ""

# 验证
echo "🔍 验证状态..."
ssh $SERVER "docker ps | grep nginx"
echo ""

echo "🎉 Nginx 配置更新完成！"
echo ""
echo "🌐 访问测试:"
echo "   - HTTPS: https://appbobo.com"
echo "   - HTTP重定向: http://appbobo.com (应自动跳转到HTTPS)"
echo ""
echo "📋 查看日志: ssh $SERVER 'docker logs paper_ai_nginx'"
