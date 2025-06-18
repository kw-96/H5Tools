// ==================== 表单重置器模块 ====================

class FormResetter {
  resetAll() {
    try {
      console.log('开始重置表单...');
      
      // 1. 清理图片管理器数据
      if (window.imageManager) {
        window.imageManager.clear();
      }
      
      // 2. 立即重置表单输入
      this.resetInputs();
      
      // 3. 立即重置模块
      this.resetModules();
      
      // 4. 立即重置预览
      this.resetPreviews();
      
      console.log('表单重置完成');
      return true;
    } catch (error) {
      console.error('重置过程中发生错误:', error);
      window.notificationSystem.show('重置时发生错误，请刷新页面', 'error');
      return false;
    }
  }
  
  resetInputs() {
    try {
      // 立即重置所有输入，保持原有功能
      // 重置文本输入框
      document.querySelectorAll('input[type="text"], textarea').forEach(input => {
        input.value = '';
      });
      
      // 重置文件输入框
      document.querySelectorAll('input[type="file"]').forEach(input => {
        input.value = '';
      });
      
      // 重置颜色输入框到默认值
      const colorDefaults = {
        '#pageColor': '#D9D9D9',
        '#gameCopyTextColor': '#FFFFFF',
        '#iconButtonTextColor': '#FFFFFF',
        '#singleButtonTextColor': '#FFFFFF',
        '#leftButtonTextColor': '#FFFFFF',
        '#rightButtonTextColor': '#FFFFFF'
      };
      
      for (const [selector, defaultValue] of Object.entries(colorDefaults)) {
        const colorInput = document.querySelector(selector);
        if (colorInput) {
          colorInput.value = defaultValue;
          const textInput = colorInput.nextElementSibling;
          if (textInput && textInput.classList.contains('color-value')) {
            textInput.value = defaultValue;
          }
        }
      }
      
      // 重置选择框
      document.querySelectorAll('select').forEach(select => {
        if (select.options.length > 0) {
          select.selectedIndex = 0;
        }
      });
      
      // 重置数字输入框
      document.querySelectorAll('input[type="number"]').forEach(input => {
        const defaultValue = input.getAttribute('placeholder') || '0';
        input.value = defaultValue;
      });
      
      // 立即处理按钮版本选择器
      const buttonVersionSelect = document.getElementById('buttonVersionSelect');
      if (buttonVersionSelect) {
        buttonVersionSelect.selectedIndex = 0;
        window.utilityFunctions.switchButtonVersion(); // 直接调用函数而不是触发事件
      }
      
      console.log('输入字段重置完成');
    } catch (error) {
      console.error('重置输入字段失败:', error);
      throw error;
    }
  }
  
  reinitializeComponents() {
    try {
      console.log('重新初始化组件...');
      
      // 只重新绑定必要的颜色输入事件，不克隆DOM节点
      this.rebindColorInputs();
      
      console.log('组件重新初始化完成');
    } catch (error) {
      console.error('组件重新初始化失败:', error);
    }
  }
  
  // 高效重新绑定颜色输入事件
  rebindColorInputs() {
    document.querySelectorAll('.color-input-group').forEach(group => {
      const colorInput = group.querySelector('input[type="color"]');
      const textInput = group.querySelector('.color-value');
      
      if (colorInput && textInput && !colorInput.dataset.bound) {
        // 标记已绑定，避免重复绑定
        colorInput.dataset.bound = 'true';
        textInput.dataset.bound = 'true';
        
        // 直接绑定事件，不克隆节点
        colorInput.addEventListener('input', () => {
          textInput.value = colorInput.value.toUpperCase();
        });
        
        textInput.addEventListener('input', () => {
          if (/^#[0-9A-F]{6}$/i.test(textInput.value)) {
            colorInput.value = textInput.value;
          }
        });
      }
    });
  }
  
  resetModules() {
    const container = document.getElementById('modulesContainer');
    if (container) {
      // 直接移除所有模块，不使用动画
      const modules = container.querySelectorAll('.module');
      modules.forEach(module => module.remove());
      
      // 延迟清理模块数据，避免阻塞UI
      setTimeout(() => {
        if (imageManager.moduleData) {
          imageManager.moduleData = {};
        }
      }, 50);
      
      // 立即更新模块计数
      const moduleManager = new ModuleManager();
      moduleManager.updateModuleCount();
    }
  }
  
  resetPreviews() {
    // 批量重置预览
    const previews = document.querySelectorAll('.img-preview-inline, .preview-container');
    previews.forEach(preview => {
      preview.innerHTML = '<span class="upload-icon-inline">+</span>';
    });
    
    // 特殊处理游戏icon预览
    const gameIconPreview = document.getElementById('gameIconPreview');
    if (gameIconPreview) {
      gameIconPreview.innerHTML = '<span class="upload-icon-text">+</span>';
    }
    
    // 批量重置按钮样式
    document.querySelectorAll('.upload-btn, .grid-btn').forEach(btn => {
      btn.style.border = '';
    });
  }
}

// 创建全局表单重置器实例
const formResetter = new FormResetter();

// 导出供其他模块使用
window.formResetter = formResetter; 