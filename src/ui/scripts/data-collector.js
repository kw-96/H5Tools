// ==================== 数据收集器 ====================

class DataCollector {
  // 收集表单数据
  collectFormData() {
    const config = {
      // 页面基础设置
      pageColor: document.getElementById('pageColor')?.value || '#FFFFFF',
      pageBgImage: window.imageManager.get('pageBackground'),
      headerImage: window.imageManager.get('headerImage'),
      titleUpload: window.imageManager.get('titleUpload'),
      gameIcon: window.imageManager.get('gameIcon'),
      
      // 游戏信息
      buttonVersion: document.getElementById('buttonVersionSelect')?.value || 'imageButton',
      
      // 游戏信息 - 带icon版
      gameName: document.getElementById('gameNameInput')?.value || '',
      gameDesc: document.getElementById('gameCopyInput')?.value || '',
      gameTextColor: document.getElementById('gameCopyTextColor')?.value || '#FFFFFF',
      iconButtonText: document.getElementById('iconButtonText')?.value || '立即下载',
      iconButtonTextColor: document.getElementById('iconButtonTextColor')?.value || '#FFFFFF',
      iconButtonBg: window.imageManager.get('iconButtonBg'),
      
      // 游戏信息 - 单按钮版
      singleButtonText: document.getElementById('singleButtonText')?.value || '立即下载',
      singleButtonTextColor: document.getElementById('singleButtonTextColor')?.value || '#FFFFFF',
      singleButtonBg: window.imageManager.get('singleButtonBg'),
      
      // 游戏信息 - 双按钮版
      leftButtonText: document.getElementById('leftButtonText')?.value || '左侧按钮',
      leftButtonBg: window.imageManager.get('leftButtonBg'),
      leftButtonTextColor: document.getElementById('leftButtonTextColor')?.value || '#FFFFFF',
      rightButtonText: document.getElementById('rightButtonText')?.value || '右侧按钮',
      rightButtonBg: window.imageManager.get('rightButtonBg'),
      rightButtonTextColor: document.getElementById('rightButtonTextColor')?.value || '#FFFFFF',
      btnSpacing: parseInt(document.getElementById('btnSpacing')?.value) || 10,
      
      // 活动规则
      rulesTitle: document.getElementById('rulesTitle')?.value || '',
      rulesBgImage: window.imageManager.get('rulesBg'),
      rulesContent: document.getElementById('rulesContent')?.value || '',
      footerLogo: window.imageManager.get('footerLogo'),
      footerBg: window.imageManager.get('footerBg'),
      
      // 模块数据
      modules: this.collectModuleData()
    };
    
    console.log('收集到的表单数据:', config);
    return config;
  }
  
  // 收集模块数据
  collectModuleData() {
    const modules = document.querySelectorAll('#modulesContainer .module');
    const moduleData = [];
    
    modules.forEach(moduleEl => {
      const moduleType = moduleEl.dataset.moduleType;
      const moduleId = moduleEl.id;
      
      if (moduleType && moduleId) {
        const moduleContent = this.collectModuleContent(moduleEl, moduleType, moduleId);
        if (moduleContent) {
          moduleData.push({
            id: moduleId,
            type: moduleType,
            content: moduleContent
          });
        }
      }
    });
    
    return moduleData;
  }
  
  // 收集模块内容
  collectModuleContent(container, moduleType, moduleId) {
    switch (moduleType) {
      case 'lotteryModule':
        return this.collectLotteryData(container, moduleId);
      case 'signInModule':
        return this.collectSignInData(container, moduleId);
      case 'collectModule':
        return this.collectCardsData(container, moduleId);
      case 'activityContentModule':
        return this.collectActivityContentData(container, moduleId);
      default:
        console.warn(`未知的模块类型: ${moduleType}`);
        return null;
    }
  }
  
  // 收集九宫格抽奖数据
  collectLotteryData(container, moduleId) {
    const data = {
      bigTitle: container.querySelector('.big-title-input')?.value || '',
      titleBgImage: window.imageManager.getModule(`${moduleId}-titlebg`),
      gridBgImage: window.imageManager.getModule(`${moduleId}-gridbg`),
      drawButtonImage: window.imageManager.getModule(`${moduleId}-drawbtn`),
      prizeBgImage: window.imageManager.getModule(`${moduleId}-prizebg`),
      prizes: []
    };
    
    // 收集奖品信息
    const prizeInputs = container.querySelectorAll('.prize-upload');
    prizeInputs.forEach((input, index) => {
      data.prizes.push({
        position: this.getPrizePosition(index),
        image: window.imageManager.getModule(`${moduleId}-prize-${index}`),
      });
    });
    
    return data;
  }
  
  // 收集签到数据
  collectSignInData(container, moduleId) {
    const data = {
      titleImage: window.imageManager.getModule(`${moduleId}-title`),
      bgImage: window.imageManager.getModule(`${moduleId}-bg`),
      daysCount: parseInt(container.querySelector('.days-count')?.value) || 7,
      dayIcon: window.imageManager.getModule(`${moduleId}-dayicon`),
      signButton: window.imageManager.getModule(`${moduleId}-signbtn`)
    };
    
    return data;
  }
  
  // 收集集卡数据
  collectCardsData(container, moduleId) {
    const data = {
      titleImage: window.imageManager.getModule(`${moduleId}-title`),
      bgImage: window.imageManager.getModule(`${moduleId}-bg`),
      cardsCount: parseInt(container.querySelector('.cards-count')?.value) || 5,
      cardStyle: container.querySelector('input[name="cardStyle"]:checked')?.value || 'style1',
      cardBg: window.imageManager.getModule(`${moduleId}-cardbg`),
      combineButton: window.imageManager.getModule(`${moduleId}-combinebtn`)
    };
    
    return data;
  }
  
  // 收集活动内容数据
  collectActivityContentData(container, moduleId) {
    const data = {
      mainTitle: container.querySelector('.activity-content-main-title-input')?.value || '',
      mainTitleBg: window.imageManager.getModule(`${moduleId}-main-title-bg`),
      subTitle: container.querySelector('.activity-content-sub-title-input')?.value || '',
      subTitleBg: window.imageManager.getModule(`${moduleId}-sub-title-bg`),
      content: container.querySelector('.activity-content-text-input')?.value || '',
      image: window.imageManager.getModule(`${moduleId}-image`)
    };
    
    return data;
  }
  
  // 获取奖品位置
  getPrizePosition(index) {
    // 九宫格位置映射
    const positions = [
      { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
      { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
      { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }
    ];
    
    return positions[index] || { row: 0, col: 0 };
  }
  
  // 收集九宫格奖品数据
  collectNineGridPrizes(container, moduleId) {
    const prizes = [];
    const prizeInputs = container.querySelectorAll('.prize-upload');
    
    prizeInputs.forEach((input, index) => {
      const prize = {
        position: this.getPrizePosition(index),
        image: window.imageManager.getModule(`${moduleId}-prize-${index}`),
      };
      prizes.push(prize);
    });
    
    return prizes;
  }
  
  // 收集奖品数据（备用方法）
  collectPrizeData(container, moduleId) {
    const prizes = [];
    const prizeElements = container.querySelectorAll('.grid-item');
    
    prizeElements.forEach((prizeEl, index) => {
      const prize = {
        position: this.getPrizePosition(index),
        image: window.imageManager.getModule(`${moduleId}-prize-${index}`),
      };
      prizes.push(prize);
    });
    
    return prizes;
  }
  
  // 验证收集的数据
  validateData(config) {
    const errors = [];
    
    // 基础验证
    if (!config.pageColor) {
      errors.push('页面颜色不能为空');
    }
    
    // 按钮版本验证
    if (!config.buttonVersion) {
      errors.push('必须选择按钮版本');
    }
    
    return errors;
  }
}

// 创建全局数据收集器实例并挂载到window对象
window.dataCollector = new DataCollector(); 