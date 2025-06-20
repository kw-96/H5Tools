// ==================== 图片切片处理器 ====================

class ImageSliceHandler {
  async handleSliceRequest(message) {
    try {
      const { imageData, sliceWidth, sliceHeight, sliceStrategy } = message;
      
      if (!imageData) {
        throw new Error('缺少图片数据');
      }
      
      console.log(`开始处理图片切片: ${imageData.name}`);
      if (sliceStrategy) {
        console.log(`使用智能切片策略: ${sliceStrategy.description}`);
      }
      
      // 执行切片操作 - 传递策略计算的尺寸
      const result = await window.fileProcessor.sliceLargeImage(imageData, sliceWidth, sliceHeight);
      
      if (!result || !result.slices || result.slices.length === 0) {
        throw new Error('图片切片失败，未生成切片数据');
      }
      
      console.log(`图片切片完成: ${imageData.name}, 生成 ${result.slices.length} 个切片`);
      
      // 🚨 修复：转换切片数据格式为插件可处理的格式
      const processedSlices = result.slices.map((slice, index) => {
        try {
          return {
            bytes: Array.from(slice.data), // 转换Uint8Array为Array
            width: slice.width,
            height: slice.height,
            x: slice.x,
            y: slice.y,
            row: slice.row,
            col: slice.col,
            name: slice.name || `slice_${index}.png`
          };
        } catch (error) {
          console.error(`处理切片 ${index} 数据时出错:`, error);
          return null;
        }
      }).filter(slice => slice !== null); // 过滤掉处理失败的切片
      
      console.log(`成功处理 ${processedSlices.length}/${result.slices.length} 个切片`);
      
      // 发送成功响应
      window.pluginComm.postMessage('slice-image-response', {
        success: true,
        imageName: imageData.name,
        slices: processedSlices,
        originalWidth: result.originalWidth,
        originalHeight: result.originalHeight,
        sliceWidth: result.sliceWidth,
        sliceHeight: result.sliceHeight,
        cols: result.cols,
        rows: result.rows
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