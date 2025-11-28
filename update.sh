#!/bin/bash
# 快捷更新脚本 - 链接到实际脚本

cd "$(dirname "$0")"
./deployment/scripts/update-frontend.sh "$@"
