const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 定义要监控的文件和执行的脚本
const csvPath = path.join(__dirname, '../data/games.csv');
const updateScriptPath = path.join(__dirname, 'update-games.js');
const homepageScriptPath = path.join(__dirname, 'update-homepage.js');

console.log('🔍 开始监控游戏数据文件 (data/games.csv)');
console.log('💡 提示: 修改CSV文件后，网站将自动更新');
console.log('📋 按 Ctrl+C 停止监控\n');

// 记录上次修改时间以避免重复触发
let lastModified = Date.now();
let isProcessing = false;

// 监控CSV文件变化
fs.watchFile(csvPath, { interval: 1000 }, async (curr, prev) => {
  // 如果文件被修改且当前没有正在处理的更新
  if (curr.mtime > prev.mtime && !isProcessing) {
    const now = Date.now();
    // 避免短时间内多次触发
    if (now - lastModified > 2000) {
      lastModified = now;
      isProcessing = true;
      
      console.log(`\n📝 检测到CSV文件变化，时间: ${new Date().toLocaleTimeString()}`);
      console.log('🔄 开始更新网站...');
      
      // 等待一小段时间确保文件写入完成
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        // 1. 运行update-games.js（将CSV转换为JSON并生成游戏页面）
        console.log('➡️ 步骤1: 更新游戏数据和生成游戏页面');
        await runScript(updateScriptPath);
        
        // 2. 运行update-homepage.js（更新主页）
        console.log('➡️ 步骤2: 更新主页游戏列表');
        await runScript(homepageScriptPath);
        
        console.log('✅ 网站更新完成!');
      } catch (error) {
        console.error('❌ 更新过程中出错:', error);
      } finally {
        isProcessing = false;
      }
    }
  }
});

// 辅助函数：运行脚本并等待完成
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const process = spawn('node', [scriptPath], { stdio: 'inherit' });
    
    process.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`脚本执行失败，退出代码: ${code}`));
      }
    });
    
    process.on('error', err => {
      reject(err);
    });
  });
}
