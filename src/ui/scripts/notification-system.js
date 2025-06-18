// ==================== UI 通知系统 ====================

class NotificationSystem {
  constructor() {
    this.notifications = new Set();
    this.loadingElement = null;
    this.init();
  }
  
  init() {
    // 创建加载状态元素
    this.createLoadingElement();
  }
  
  createLoadingElement() {
    if (document.getElementById('loadingOverlay')) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;
    
    // 添加旋转动画
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
    this.loadingElement = overlay;
  }
  
  show(message, type = 'info', duration = 5000) {
    const notification = this.createElement(message, type);
    this.notifications.add(notification);
    
    document.body.appendChild(notification);
    
    // 使用 requestAnimationFrame 确保平滑动画
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    });
    
    // 自动移除
    setTimeout(() => this.hide(notification), duration);
    
    return notification;
  }
  
  createElement(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    return notification;
  }
  
  hide(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      this.notifications.delete(notification);
    }, 300);
  }
  
  clear() {
    this.notifications.forEach(notification => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
    this.notifications.clear();
  }
  
  showLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'flex';
    }
  }
  
  hideLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'none';
    }
  }
}

// 创建全局通知系统实例并挂载到window对象
window.notificationSystem = new NotificationSystem();

// ==================== 加载状态管理 ====================

// 显示加载状态 - 供其他模块使用
window.showLoading = function(message = '正在处理...') {
  window.notificationSystem.showLoading();
  console.log('显示加载状态:', message);
};

// 隐藏加载状态 - 供其他模块使用
window.hideLoading = function() {
  window.notificationSystem.hideLoading();
  console.log('隐藏加载状态');
};

// 兼容函数 - 供其他模块使用
window.showNotification = function(message, type) {
  window.notificationSystem.show(message, type);
}; 