// ==================== 数据收集器 ====================

class DataCollector {
  constructor() {
    this.moduleDataCollectors = {
      carousel: this.collectCarouselData.bind(this),
      verticalCarousel: this.collectVerticalCarouselData.bind(this)
    };
    
    // 存储键映射
    this.storageKeyMap = {
      'carousel-title-bg-upload': 'titleBgImage',
      'carousel-image-upload': 'carouselImage',
      'carousel-image-bg-upload': 'carouselBgImage',
      'vertical-carousel-title-bg-upload': 'titleBackground',
      'vertical-carousel-image-upload': 'carouselImage'
    };
  }

  // 收集表单数据
  collectFormData() {
    const config = {
      // 页面基础设置
      pageBgColor: document.getElementById('pageColor')?.value || '#FFFFFF',
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
          // 获取模块标题
          const moduleTitle = this.getModuleTitle(moduleType);
          
          moduleData.push({
            id: moduleId,
            type: moduleType,  // 保持字符串格式，在后端处理类型转换
            title: moduleTitle, // 添加标题字段
            content: moduleContent
          });
          
          console.log('📊 [模块数据收集]', {
            moduleId,
            moduleType,
            moduleTitle,
            收集内容: moduleContent
          });
        }
      }
    });
    
    console.log('🎯 [所有模块数据收集完成]', moduleData);
    return moduleData;
  }
  
  // 获取模块标题
  getModuleTitle(moduleType) {
    const titleMap = {
      'nineGrid': '九宫格抽奖',
      'signIn': '每日签到',
      'collectCards': '集卡活动',
      'activityContent': '活动详情',
      'carousel': '图片轮播（横版）',
      'verticalCarousel': '图片轮播（竖版）'
    };
    return titleMap[moduleType] || '未知模块';
  }
  
  // 收集模块内容
  collectModuleContent(container, moduleType, moduleId) {
    switch (moduleType) {
      case 'nineGrid':
        return this.collectLotteryData(container, moduleId);
      case 'lotteryModule':
        return this.collectLotteryData(container, moduleId);
      case 'signInModule':
        return this.collectSignInData(container, moduleId);
      case 'collectModule':
        return this.collectCardsData(container, moduleId);
      case 'activityContent':
        return this.collectActivityContentData(container, moduleId);
      case 'carousel':
        return this.collectCarouselData(moduleId);
      case 'verticalCarousel':
        return this.collectVerticalCarouselData(moduleId);
      default:
        console.warn(`未知的模块类型: ${moduleType}`);
        return null;
    }
  }
  
  // 收集九宫格抽奖数据
  collectLotteryData(container, moduleId) {
    const data = {
      mainTitle: container.querySelector('.big-title-input')?.value || "抽奖活动",
      // 类型保护：只允许ImageInfo类型
      titleBgImage: window.imageManager.getModule(`${moduleId}-titlebg`),
      gridBgImage: window.imageManager.getModule(`${moduleId}-gridbg`),
      drawButtonImage: window.imageManager.getModule(`${moduleId}-drawbtn`),
      prizeBgImage: window.imageManager.getModule(`${moduleId}-prizebg`),
      prizes: this.collectNineGridPrizes(container, moduleId)
    };
    
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
      text: container.querySelector('.activity-content-text-input')?.value || '',
      image: window.imageManager.getModule(`${moduleId}-image`)
    };
    
    console.log('🔍 [活动内容数据收集]', {
      moduleId,
      data,
      主标题: data.mainTitle,
      副标题: data.subTitle,
      正文: data.text,
      图片: !!data.image
    });
    
    return data;
  }
  
  // 收集图片轮播数据
  collectCarouselData(moduleId) {
    try {
      const titleInput = document.querySelector(`#${moduleId} input[name="carousel-title"]`);

      const data = {
        title: titleInput?.value || '',
        titleBackground: window.imageManager.getModule(`${moduleId}-carousel-title-bg`),
        carouselImage: window.imageManager.getModule(`${moduleId}-carousel-image`),
        carouselBackground: window.imageManager.getModule(`${moduleId}-carousel-image-bg`)
      };
    
      console.log('🔍 [图片轮播数据收集]', {
        moduleId,
        data,
        标题: data.title,
        轮播图片: !!data.carouselImage,
        标题背景: !!data.titleBackground,
        轮播背景: !!data.carouselBackground
      });
    
      return data;
    } catch (error) {
      console.error('收集轮播图数据失败:', error);
      return null;
    }
  }

  // 收集图片轮播（竖版）数据
  collectVerticalCarouselData(moduleId) {
    try {
      const titleInput = document.querySelector(`#${moduleId} input[name="vertical-carousel-title"]`);

      // 收集轮播图片数据 - 确保返回3元素元组格式
      const carouselImages = [
        window.imageManager.getModule(`${moduleId}-vertical-image-1`) || null,  // 主图
        window.imageManager.getModule(`${moduleId}-vertical-image-2`) || null,  // 右上图
        window.imageManager.getModule(`${moduleId}-vertical-image-3`) || null   // 右下图
      ];

      const data = {
        title: titleInput?.value || '',
        titleBackground: window.imageManager.getModule(`${moduleId}-vertical-title-bg`),
        carouselImages: carouselImages
      };
      
      console.log('🔍 [图片轮播（竖版）数据收集]', {
        moduleId,
        data,
        标题: data.title,
        轮播图片: `[主图: ${!!carouselImages[0]}, 右上: ${!!carouselImages[1]}, 右下: ${!!carouselImages[2]}]`,
        标题背景: !!data.titleBackground
      });
      
      return data;
    } catch (error) {
      console.error('收集图片轮播（竖版）数据失败:', error);
      return null;
    }
  }
  
  // 获取存储键
  getStorageKey(className, moduleId) {
    const baseKey = this.storageKeyMap[className];
    if (!baseKey) {
      return null;
    }
    return `${moduleId}-${baseKey}`;
  }
  
  // 获取奖品位置
  getPrizePosition(index) {
    // 九宫格位置映射 (3x3网格)
    const positions = [
      { row: 0, col: 0 }, // 位置0: 左上
      { row: 0, col: 1 }, // 位置1: 上中
      { row: 0, col: 2 }, // 位置2: 右上
      { row: 1, col: 2 }, // 位置3: 右中
      { row: 2, col: 2 }, // 位置4: 右下
      { row: 2, col: 1 }, // 位置5: 下中
      { row: 2, col: 0 }, // 位置6: 左下
      { row: 1, col: 0 }, // 位置7: 左中
      { row: 1, col: 1 }  // 位置8: 中心(抽奖按钮位置)
    ];
    
    return positions[index] || { row: 0, col: 0 };
  }
  
  // 收集九宫格奖品数据（专门处理3-2-3布局）
  collectNineGridPrizes(container, moduleId) {
    const prizes = [];
    const prizeElements = container.querySelectorAll('.prize-grid-custom .grid-item');
    
    prizeElements.forEach((prizeEl, index) => {
      const prizeLabel = prizeEl.querySelector('.prize-label')?.textContent || `奖品${String(index + 1).padStart(2, '0')}`;
      
      console.log(`🔍 [奖品${index}] 标签: "${prizeLabel}"`);
      
      prizes.push({
        image: window.imageManager.getModule(`${moduleId}-prize-${index}`),
        name: prizeLabel,
        position: index
      });
    });
    
    console.log('🔍 [九宫格奖品数据收集完成]', {
      moduleId,
      奖品数量: prizes.length,
      奖品名称: prizes.map(p => p.name)
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
    if (!config.pageBgColor) {
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