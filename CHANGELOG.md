# 更新日志

## 2025-12-06

### 新功能

#### 1. 版本选择 API 集成
- 添加 `selectVersion` API 函数调用后端版本选择接口
- 实现版本选择后的状态管理和页面跳转
- 添加版本选择过程中的加载状态和错误处理

**相关文件**:
- `src/services/api.js` - 新增 `selectVersion` 函数
- `src/pages/PolishPage.jsx` - 实现异步版本选择逻辑
- `src/components/VersionSelection.jsx` - 添加 `isSelecting` 状态支持

#### 2. 历史记录只读查看模式
- 实现历史记录的只读查看功能
- 历史记录按钮文本改为"查看此记录"
- 只读模式下禁用所有修改操作（接受/拒绝按钮、全部接受按钮）
- 只读模式下隐藏修改详情面板
- 标题显示"(查看模式)"标识
- 润色后内容显示为 `final_content`（用户最终确认的内容）

**相关文件**:
- `src/pages/PolishPage.jsx` - 添加 `isReadOnly` 状态管理
- `src/components/ComparisonView.jsx` - 实现只读模式逻辑
- `src/components/PolishHistory.jsx` - 添加 `final_content` 字段映射

#### 3. 版本选择页面原文显示
- 多版本选择页面新增原文显示区域
- 显示原文内容和字数统计
- 支持滚动查看完整原文
- 美观的卡片式设计，与版本卡片风格一致

**相关文件**:
- `src/components/VersionSelection.jsx` - 添加原文显示组件
- `src/components/VersionSelection.css` - 添加原文区域样式
- `src/pages/PolishPage.jsx` - 传递 `original_content` 参数

### 改进

#### 1. 润色内容滚动条优化
- 版本卡片中的润色内容预览添加滚动条
- 将 `overflow: hidden` 改为 `overflow-y: auto`
- 添加 `white-space: pre-wrap` 保持文本格式
- 自定义滚动条样式，提升用户体验

**相关文件**:
- `src/components/VersionSelection.css` - 优化 `.preview-text` 样式

#### 2. 历史记录显示优化
- 历史记录中不再显示高亮和修改详情
- 润色后内容标题简化为"润色后"
- 提供更简洁的查看体验

**相关文件**:
- `src/components/ComparisonView.jsx` - 根据 `readOnly` 状态调整显示

### 技术细节

#### API 集成
```javascript
// 版本选择 API
export async function selectVersion(traceId, version) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/polish/select-version/${traceId}?version=${version}`,
    {
      method: 'POST',
      headers: getAuthHeaders()
    }
  )
  return await handleResponse(response)
}
```

#### 只读模式实现
```javascript
// 在 ComparisonView 中根据 readOnly 状态
{readOnly ? (
  // 显示纯文本，不显示高亮
  <div className="text-display">{currentContent}</div>
) : (
  // 显示高亮文本，支持点击查看详情
  <div className="text-display highlighted">
    {highlightText(currentContent, displayAnnotations)}
  </div>
)}
```

#### 原文显示实现
```javascript
// 原文显示区域（支持滚动）
{originalContent && (
  <div className="original-text-section">
    <div className="section-header">
      <h3>📄 原文</h3>
      <span className="text-length">{originalLength} 字</span>
    </div>
    <div className="original-text-content">
      <pre className="text-preview">{originalContent}</pre>
    </div>
  </div>
)}
```

### Bug 修复
- 修复版本卡片中润色内容预览显示不全的问题
- 修复历史记录加载时可能出现的 null 引用错误
- 优化内容显示的空值检查

### 文档更新
- 更新 FRONTEND_CHANGES.md 文档
- 创建本更新日志记录最新改动

---

## 历史版本

### 2024-12-05
- 实现多版本润色功能
- 添加版本选择界面
- 实现对比视图

### 2024-12-04
- 完成基础润色功能
- 添加历史记录功能
- 实现用户认证

### 2024-12-01
- 项目初始化
- 搭建基础框架
