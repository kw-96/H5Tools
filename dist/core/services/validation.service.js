// 验证服务
export class ValidationService {
    // 验证H5配置
    static validateH5Config(config) {
        var _a, _b, _c, _d, _e, _f;
        const errors = [];
        // 必填字段验证
        if (!((_a = config.pageTitle) === null || _a === void 0 ? void 0 : _a.trim())) {
            errors.push('页面标题不能为空');
        }
        if (!((_b = config.gameName) === null || _b === void 0 ? void 0 : _b.trim())) {
            errors.push('游戏名称不能为空');
        }
        // 按钮版本验证
        if (config.buttonVersion) {
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
                default:
                    errors.push('无效的按钮版本');
            }
        }
        else {
            errors.push('请选择按钮版本');
        }
        // 画布尺寸验证
        if (config.canvasWidth && config.canvasWidth < 320) {
            errors.push('画布宽度不能小于320px');
        }
        if (config.canvasHeight && config.canvasHeight < 480) {
            errors.push('画布高度不能小于480px');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    // 验证图片数据
    static validateImageData(imageData) {
        var _a, _b;
        const errors = [];
        // 必填字段验证
        if (!imageData.data) {
            errors.push('图片数据不能为空');
        }
        if (!((_a = imageData.name) === null || _a === void 0 ? void 0 : _a.trim())) {
            errors.push('图片名称不能为空');
        }
        if (!((_b = imageData.type) === null || _b === void 0 ? void 0 : _b.trim())) {
            errors.push('图片类型不能为空');
        }
        // 尺寸验证
        if (!imageData.width || imageData.width <= 0) {
            errors.push('图片宽度必须大于0');
        }
        if (!imageData.height || imageData.height <= 0) {
            errors.push('图片高度必须大于0');
        }
        // 大小验证
        if (!imageData.size || imageData.size <= 0) {
            errors.push('图片大小必须大于0');
        }
        // 时间戳验证
        if (!imageData.timestamp || imageData.timestamp <= 0) {
            errors.push('图片时间戳无效');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    // 验证渠道名称
    static validateChannelName(channel) {
        return /^[a-zA-Z0-9_-]{2,50}$/.test(channel);
    }
}
//# sourceMappingURL=validation.service.js.map