#!/bin/bash
# API 连接测试脚本

SERVER="45.32.16.207"

echo "🔍 测试 API 连接..."
echo ""

echo "1️⃣ 测试健康检查端点（直接访问后端容器）..."
echo "命令: curl http://$SERVER:8080/api/v1/health"
curl -v http://$SERVER:8080/api/v1/health 2>&1 | grep -E "HTTP|health"
echo ""

echo "2️⃣ 测试通过 Nginx 代理访问健康检查..."
echo "命令: curl http://$SERVER/api/v1/health"
curl -v http://$SERVER/api/v1/health 2>&1 | grep -E "HTTP|health|404"
echo ""

echo "3️⃣ 测试前端页面..."
echo "命令: curl http://$SERVER/"
curl -s http://$SERVER/ | head -n 5
echo ""

echo "4️⃣ 在服务器上检查 Nginx 配置..."
echo "ssh root@$SERVER 'docker exec paper_ai_nginx cat /etc/nginx/nginx.conf | grep -A 10 \"location /api\"'"
