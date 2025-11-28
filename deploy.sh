#!/bin/bash
# 快捷部署脚本 - 链接到实际脚本

cd "$(dirname "$0")"
./deployment/scripts/deploy-to-docker.sh "$@"
