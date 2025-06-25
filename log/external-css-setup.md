# H5Tools 外部CSS版本设置指南

## 📋 完整操作流程

### 第一步：构建外部CSS版本

```bash
# 1. 切换到外部CSS模式
npm run switch:external

# 2. 构建外部CSS版本
npm run build:external
```

**预期输出**：
```
🌐 构建外部CSS版本...
🎯 GitHub仓库: kw-96/H5Tools
✅ CSS合并完成: dist/styles.min.css
✅ 外部版本HTML生成: dist/ui-external.html

📋 重要信息:
🔗 CDN链接: https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist/styles.min.css
📁 CSS文件大小: XX.XKB
📁 HTML文件大小: XX.XKB
```

### 第二步：提交文件到GitHub

```bash
# 1. 添加构建产物到git
git add dist/styles.min.css dist/ui-external.html manifest.external.json

# 2. 提交更改
git commit -m "添加外部CSS版本构建产物

- 新增jsDelivr CDN版本的CSS文件
- 新增外部CSS版本的HTML文件  
- 新增外部CSS模式的manifest配置
- 支持通过CDN加载样式，减小插件体积"

# 3. 推送到GitHub
git push origin main
```

### 第三步：等待CDN缓存更新

```bash
# 等待1-2分钟后测试CDN链接
npm run test:cdn
```

访问返回的链接，确认CSS文件可以正常访问。

### 第四步：在Figma中测试

1. **打开Figma桌面版**
2. **打开插件开发模式**：
   - 菜单 → Plugins → Development → Import plugin from manifest
   - 选择您的项目中的 `manifest.json` 文件
3. **运行插件**：
   - 观察控制台是否有加载错误
   - 确认界面是否正常显示

## 🔄 模式切换命令

```bash
# 查看当前模式状态
npm run switch:status

# 切换到外部CSS模式
npm run switch:external

# 切换回内联模式  
npm run switch:inline
```

## 🌐 CDN链接信息

### 您的CDN链接
```
https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist/styles.min.css
```

### jsDelivr特性
- ✅ **全球CDN**：200+ POP节点，全球加速
- ✅ **自动压缩**：自动Gzip压缩，节省带宽
- ✅ **版本控制**：支持特定版本/分支/commit
- ✅ **高可用性**：99.9%可用时间保证
- ✅ **免费使用**：对开源项目完全免费

## 📊 构建产物对比

### 内联模式 (当前默认)
```
dist/ui.html          ~181KB  (CSS+JS完全内联)
dist/plugin/          ~13KB   (插件主程序)
```

### 外部CSS模式
```
dist/ui-external.html ~XX KB  (仅JS内联，CSS外部加载)
dist/styles.min.css   ~XX KB  (合并的CSS文件)
dist/plugin/          ~13KB   (插件主程序)
```

**优势对比**：
- 🚀 **加载速度**：首次可能稍慢，后续访问更快(CDN缓存)
- 📦 **插件体积**：显著减小，便于分发
- 🔄 **样式更新**：可独立更新CSS，无需重新发布插件
- 🌐 **网络依赖**：依赖网络连接，离线时需要备用样式

## ⚠️ 注意事项

### Figma插件网络限制
1. **必须配置networkAccess**：在manifest.json中添加允许的域名
2. **CSP限制**：某些安全策略可能阻止外部资源
3. **备用方案**：已内置备用样式，确保基本功能可用

### 开发和生产环境
- **开发环境**：建议使用内联模式，便于调试
- **生产环境**：可选择外部CSS模式，减小分发体积

## 🚨 故障排除

### CSS加载失败
```javascript
// 在浏览器控制台检查
console.log('外部样式加载状态:', document.getElementById('external-styles'));

// 检查网络请求
// Network tab → 查看CSS文件请求状态
```

### 回退到内联模式
```bash
# 快速回退到稳定的内联模式
npm run switch:inline
npm run build
```

### 检查CDN状态
```bash
# 访问jsDelivr状态页面
https://status.jsdelivr.com/

# 手动测试CDN链接
curl -I https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist/styles.min.css
```

## 📝 更新CSS样式

### 方式一：通过GitHub更新（推荐）
1. 修改 `src/ui/styles/` 目录下的CSS文件
2. 运行 `npm run build:css-only` 重新合并CSS
3. 提交 `dist/styles.min.css` 到GitHub
4. 等待1-2分钟CDN缓存更新

### 方式二：强制刷新CDN缓存
```bash
# 使用特定commit hash强制更新
https://cdn.jsdelivr.net/gh/kw-96/H5Tools@{commit-hash}/dist/styles.min.css
```

## 🎯 最佳实践

1. **开发阶段**：使用内联模式便于调试
2. **测试阶段**：切换到外部模式验证网络加载
3. **发布阶段**：根据需求选择合适模式
4. **维护阶段**：利用外部CSS便于样式更新

---

**总结**：外部CSS方案为H5Tools提供了更灵活的部署选项，在保持功能完整性的同时减小了插件体积，并支持独立的样式更新机制。 