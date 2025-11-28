#!/bin/bash
# 前端快速更新脚本 - 不需要重启容器

set -e

SERVER="root@45.32.16.207"
FRONTEND_PATH="/opt/paper_ai/frontend"

echo "🔄 Paper AI 前端快速更新"
echo "========================"
echo ""

# 步骤 1: 构建
echo "📦 步骤 1/3: 构建最新版本..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi
echo "✅ 构建成功"
echo ""

# 步骤 2: 上传
echo "📤 步骤 2/3: 上传到服务器..."
# 删除旧文件并上传新文件
ssh $SERVER "rm -rf $FRONTEND_PATH/*"
scp -r dist/* $SERVER:$FRONTEND_PATH/
echo "✅ 上传完成"
echo ""

# 步骤 3: 验证
echo "✅ 步骤 3/3: 验证更新..."
ssh $SERVER "ls -la $FRONTEND_PATH/ && echo '---' && ls -lh $FRONTEND_PATH/assets/"
echo ""

echo "🎉 更新完成！"
echo ""
echo "🌐 访问: http://45.32.16.207"
echo ""
echo "⚠️  提示: 如果看不到更新，请清空浏览器缓存后刷新"
echo "   - Chrome/Edge: Ctrl+Shift+R (Mac: Cmd+Shift+R)"
echo "   - Firefox: Ctrl+F5 (Mac: Cmd+Shift+R)"
echo "   - 或打开隐私模式/无痕模式访问"
