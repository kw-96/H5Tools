var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { StorageService } from './storage.service';
// 配置管理服务
export class ConfigService {
    // 保存配置到存储
    static saveConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const configData = JSON.stringify(config);
                this.storage.setItem(this.STORAGE_KEY, configData);
            }
            catch (error) {
                console.error('保存配置失败:', error);
                throw new Error('保存配置失败');
            }
        });
    }
    // 从存储加载配置
    static loadConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const configData = this.storage.getItem(this.STORAGE_KEY);
                if (!configData)
                    return null;
                return JSON.parse(configData);
            }
            catch (error) {
                console.error('加载配置失败:', error);
                return null;
            }
        });
    }
    // 清除配置
    static clearConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.storage.removeItem(this.STORAGE_KEY);
            }
            catch (error) {
                console.error('清除配置失败:', error);
            }
        });
    }
    // 验证配置完整性
    static validateConfig(config) {
        var _a, _b, _c, _d, _e, _f;
        const errors = [];
        if (!((_a = config.pageTitle) === null || _a === void 0 ? void 0 : _a.trim())) {
            errors.push('页面标题不能为空');
        }
        if (!((_b = config.gameName) === null || _b === void 0 ? void 0 : _b.trim())) {
            errors.push('游戏名称不能为空');
        }
        if (!config.buttonVersion) {
            errors.push('请选择按钮版本');
        }
        // 根据按钮版本验证相应字段
        switch (config.buttonVersion) {
            case 'icon':
                if (!((_c = config.iconButtonText) === null || _c === void 0 ? void 0 : _c.trim())) {
                    errors.push('带图标按钮文本不能为空');
                }
                break;
            case 'single':
                if (!((_d = config.singleButtonText) === null || _d === void 0 ? void 0 : _d.trim())) {
                    errors.push('单按钮文本不能为空');
                }
                break;
            case 'double':
                if (!((_e = config.leftButtonText) === null || _e === void 0 ? void 0 : _e.trim())) {
                    errors.push('左侧按钮文本不能为空');
                }
                if (!((_f = config.rightButtonText) === null || _f === void 0 ? void 0 : _f.trim())) {
                    errors.push('右侧按钮文本不能为空');
                }
                break;
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    // 创建默认配置
    static createDefaultConfig() {
        return {
            pageTitle: '活动页面',
            pageBgColor: '#ffffff',
            pageBgImage: null,
            headerImage: null,
            titleUpload: null,
            gameIcon: null,
            gameName: '游戏名称',
            gameDesc: '游戏描述',
            gameTextColor: '#333333',
            buttonVersion: 'single',
            iconButtonText: '立即下载',
            iconButtonTextColor: '#ffffff',
            iconButtonBg: null,
            singleButtonText: '立即下载',
            singleButtonTextColor: '#ffffff',
            singleButtonBg: null,
            leftButtonText: '预约游戏',
            leftButtonTextColor: '#ffffff',
            leftButtonBg: null,
            rightButtonText: '立即下载',
            rightButtonTextColor: '#ffffff',
            rightButtonBg: null,
            buttonSpacing: 20,
            modules: [],
            rulesTitle: '活动规则',
            rulesBgImage: null,
            rulesContent: '请填写活动规则内容',
            footerLogo: null,
            footerBg: null,
            canvasWidth: 1080,
            canvasHeight: 1920
        };
    }
}
ConfigService.STORAGE_KEY = 'h5-tools-config';
ConfigService.storage = StorageService.getInstance();
//# sourceMappingURL=config.service.js.map