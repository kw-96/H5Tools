// ==================== 模块管理器模块 ====================

class ModuleManager {
  constructor() {
    this.moduleCounter = 0;
  }
  
  init() {
    this.bindAddModuleEvent();
    this.updateModuleCount();
  }
  
  bindAddModuleEvent() {
    const addBtn = document.getElementById('addModuleBtn');
    const typeSelect = document.getElementById('moduleTypeSelect');
    
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const moduleType = typeSelect?.value;
        if (moduleType) {
          this.addModule(moduleType);
        }
      });
    }
  }
  
  addModule(moduleType) {
    // 统一使用 moduleType + "Template" 的命名规则
    const templateId = `${moduleType}Template`;
    const template = document.getElementById(templateId);
    
    if (!template) {
      console.error(`找不到模板: ${templateId}`);
      window.notificationSystem.show(`模板 ${templateId} 不存在`, 'error');
      return;
    }
    
    // 创建新模块
    this.moduleCounter++;
    const moduleId = `module-${this.moduleCounter}`;
    const newModule = template.cloneNode(true);
    
    newModule.id = moduleId;
    newModule.className = 'module';
    newModule.style.display = 'block';
    
    // 统一模块类型标识符
    const moduleTypeMapping = {
      'lotteryModule': 'nineGrid',
      'signInModule': 'signIn', 
      'collectModule': 'collectCards',
      'activityContentModule': 'activityContent',
      'carouselModule': 'carousel',
      'verticalCarouselModule': 'verticalCarousel'
    };
    
    newModule.dataset.moduleType = moduleTypeMapping[moduleType] || moduleType;
    
    this.bindModuleEvents(newModule);
    
    const container = document.getElementById('modulesContainer');
    const emptyMessage = container.querySelector('.empty-modules-message');
    if (emptyMessage) {
      emptyMessage.style.display = 'none';
    }
    
    container.appendChild(newModule);
    
    this.updateModuleCount();
    
    // 滚动到新模块
    requestAnimationFrame(() => {
      newModule.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    
    // 触发模块添加事件
    document.dispatchEvent(new CustomEvent('moduleAdded', { 
      detail: { moduleId } 
    }));
  }
  
  // 模块类型映射
  getModuleTypeMapping(templateType) {
    const typeMap = {
      'lotteryModule': 'nineGrid',
      'signInModule': 'signIn', 
      'collectModule': 'collectCards',
      'activityContentModule': 'activityContent',
      'carouselModule': 'carousel',
      'verticalCarouselModule': 'verticalCarousel'
    };
    return typeMap[templateType] || templateType;
  }
  
  bindModuleEvents(moduleEl) {
    const deleteBtn = moduleEl.querySelector('.delete-btn');
    const collapseBtn = moduleEl.querySelector('.collapse-btn');
    const moveUpBtn = moduleEl.querySelector('.move-up-btn');
    const moveDownBtn = moduleEl.querySelector('.move-down-btn');
    
    // 为删除按钮添加事件监听器
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.preventDefault(); // 阻止默认行为
        e.stopPropagation(); // 阻止事件冒泡
        this.deleteModule(moduleEl); // 调用删除模块方法
      });
    }
    
    if (collapseBtn) {
      collapseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        moduleEl.classList.toggle('module-collapsed');
        collapseBtn.classList.toggle('collapsed');
      });
    }
    
    if (moveUpBtn) {
      moveUpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.moveModuleUp(moduleEl);
      });
    }
    
    if (moveDownBtn) {
      moveDownBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.moveModuleDown(moduleEl);
      });
    }
    
    // 绑定图片上传事件
    this.bindModuleImageUploads(moduleEl);
  }     

  // 绑定模块内的图片上传事件
  bindModuleImageUploads(moduleEl) {
    const imageInputs = moduleEl.querySelectorAll('input[type="file"][accept="image/*"]');
    imageInputs.forEach(input => {
      // 移除现有的事件监听器（如果有）
      const newInput = input.cloneNode(true);
      input.parentNode.replaceChild(newInput, input);
      
      // 重新绑定 onchange 事件
      if (newInput.classList.contains('prize-upload')) {
        newInput.addEventListener('change', () => window.utilityFunctions.previewImage(newInput));
      } else {
        // 对于其他类型的图片上传，使用标准预览函数
        newInput.addEventListener('change', () => {
          const previewContainer = newInput.nextElementSibling?.querySelector('.img-preview-inline');
          if (previewContainer) {
            window.utilityFunctions.previewImage(newInput, previewContainer);
          }
        });
      }
    });
  }
  
  deleteModule(moduleEl) {
    if (confirm('确定要删除这个模块吗？')) {
      const moduleId = moduleEl.id;
      
      // 一步完成：DOM + 数据 + 更新
      moduleEl.remove();
      this.cleanupModuleData(moduleId);
      this.updateModuleCount();
    }
  }
  
  // 极简高效清理
  cleanupModuleData(moduleId) {
    if (!moduleId || !window.imageManager?.moduleData) return;
    
    // 直接过滤重建，比逐个删除更高效
    const newData = {};
    for (const key in window.imageManager.moduleData) {
      if (!key.startsWith(moduleId)) {
        newData[key] = window.imageManager.moduleData[key];
      }
    }
    window.imageManager.moduleData = newData;
  }
  
  moveModuleUp(moduleEl) {
    const prevModule = moduleEl.previousElementSibling;
    if (prevModule && !prevModule.classList.contains('empty-modules-message')) {
      moduleEl.parentNode.insertBefore(moduleEl, prevModule);
    }
  }
  
  moveModuleDown(moduleEl) {
    const nextModule = moduleEl.nextElementSibling;
    if (nextModule) {
      moduleEl.parentNode.insertBefore(nextModule, moduleEl);
    }
  }
  
  updateModuleCount() {
    const counter = document.getElementById('moduleCounter');
    const modules = document.querySelectorAll('#modulesContainer .module');
    const emptyMessage = document.getElementById('emptyModulesMessage');
    
    if (counter) {
      counter.textContent = modules.length;
    }
    
    // 显示或隐藏空状态消息
    if (emptyMessage) {
      emptyMessage.style.display = modules.length === 0 ? 'block' : 'none';
    }
  }
}

// 创建全局模块管理器实例
const moduleManager = new ModuleManager();

// 导出供其他模块使用
window.moduleManager = moduleManager; 