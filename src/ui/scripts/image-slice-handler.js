// ==================== 图片切片处理器 ====================

class ImageSliceHandler {
  async handleSliceRequest(message) {
    try {
      const { imageData, sliceWidth, sliceHeight } = message;
      
      if (!imageData) {
        throw new Error('缺少图片数据');
      }
      
      console.log(`开始处理图片切片: ${imageData.name}`);
      
      // 执行切片操作
      const slices = await window.fileProcessor.sliceLargeImage(imageData, sliceWidth, sliceHeight);
      
      if (!slices || slices.length === 0) {
        throw new Error('图片切片失败，未生成切片数据');
      }
      
      console.log(`图片切片完成: ${imageData.name}, 生成 ${slices.length} 个切片`);
      
      // 发送成功响应
      window.pluginComm.postMessage('slice-image-response', {
        success: true,
        imageName: imageData.name,
        slices: slices,
        originalWidth: imageData.width,
        originalHeight: imageData.height,
        sliceWidth: sliceWidth,
        sliceHeight: sliceHeight
      });
      
    } catch (error) {
      console.error('图片切片处理失败:', error);
      
      // 发送失败响应
      window.pluginComm.postMessage('slice-image-response', {
        success: false,
        imageName: message.imageData?.name || '未知图片',
        error: error.message
      });
    }
  }
}

// 创建全局图片切片处理器实例并挂载到window对象
window.imageSliceHandler = new ImageSliceHandler(); 