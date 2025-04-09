const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('开始更新游戏数据...');

// 执行命令的函数
function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    console.log(`\n执行脚本: ${scriptName}`);
    
    const scriptPath = path.join(__dirname, scriptName);
    const process = spawn('node', [scriptPath], { stdio: 'inherit' });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`脚本 ${scriptName} 执行失败，错误代码: ${code}`));
      }
    });
  });
}

// 添加更新首页游戏列表的函数
async function updateHomepage() {
  console.log('🔄 更新首页游戏列表...');
  
  try {
    const gamesJsonPath = path.join(__dirname, '../js/games.json');
    
    // 检查游戏数据文件是否存在
    if (!fs.existsSync(gamesJsonPath)) {
      throw new Error(`游戏数据文件不存在: ${gamesJsonPath}`);
    }
    
    const gamesData = JSON.parse(fs.readFileSync(gamesJsonPath, 'utf8'));
    console.log(`已加载 ${Object.keys(gamesData).length} 个游戏数据`);
    
    // 按添加时间排序的最新游戏
    const latestGames = Object.entries(gamesData)
      .sort((a, b) => new Date(b[1].added || 0) - new Date(a[1].added || 0))
      .slice(0, 8); // 取前8个
    
    console.log(`已选择 ${latestGames.length} 个最新游戏`);
    
    // 获取评分最高的推荐游戏
    const featuredGames = Object.entries(gamesData)
      .filter(([_, game]) => game.featured || (game.rating && game.rating > 4))
      .slice(0, 4); // 取前4个
      
    console.log(`已选择 ${featuredGames.length} 个推荐游戏`);
    
    // 如果没有足够的推荐游戏，就用最新游戏代替
    if (featuredGames.length < 4) {
      console.log('推荐游戏不足4个，使用最新游戏补充');
      for (let i = 0; featuredGames.length < 4 && i < latestGames.length; i++) {
        if (!featuredGames.some(([id]) => id === latestGames[i][0])) {
          featuredGames.push(latestGames[i]);
        }
      }
    }
    
    // 生成HTML代码
    const latestGamesHTML = generateGamesHTML(latestGames);
    const featuredGamesHTML = generateGamesHTML(featuredGames);
    
    // 更新首页HTML
    const indexPath = path.join(__dirname, '../index.html');
    
    // 检查首页文件是否存在
    if (!fs.existsSync(indexPath)) {
      throw new Error(`首页文件不存在: ${indexPath}`);
    }
    
    let indexHTML = fs.readFileSync(indexPath, 'utf8');
    console.log(`已加载首页HTML，大小: ${indexHTML.length} 字节`);
    
    // 查找游戏容器的不同可能的类名或ID
    const possibleNewGamesContainers = [
      '<div class="new-games-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">',
      '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">', 
      '<div class="new-games"',
      '<!-- 最新游戏部分 -->'
    ];
    
    const possibleFeaturedGamesContainers = [
      '<div class="featured-games-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">',
      '<div class="featured-games"',
      '<!-- 推荐游戏部分 -->'
    ];
    
    // 尝试更新最新游戏部分
    let newGamesUpdated = false;
    for (const container of possibleNewGamesContainers) {
      if (indexHTML.includes(container)) {
        console.log(`找到最新游戏容器: ${container.substring(0, 30)}...`);
        
        // 找到容器的开始和结束位置
        const startPos = indexHTML.indexOf(container);
        const endMarker = '</div><!-- 加载更多按钮 -->';
        const endPos = indexHTML.indexOf(endMarker, startPos);
        
        if (startPos >= 0 && endPos >= 0) {
          // 提取并替换这个区域
          const beforeSection = indexHTML.substring(0, startPos + container.length);
          const afterSection = indexHTML.substring(endPos);
          
          indexHTML = beforeSection + '\n' + latestGamesHTML + '\n' + afterSection;
          newGamesUpdated = true;
          console.log('已更新最新游戏部分');
          break;
        }
      }
    }
    
    if (!newGamesUpdated) {
      console.warn('⚠️ 无法找到最新游戏容器，跳过此部分更新');
    }
    
    // 尝试更新推荐游戏部分
    let featuredGamesUpdated = false;
    for (const container of possibleFeaturedGamesContainers) {
      if (indexHTML.includes(container)) {
        console.log(`找到推荐游戏容器: ${container.substring(0, 30)}...`);
        
        // 找到容器的开始和结束位置
        const startPos = indexHTML.indexOf(container);
        let endPos = -1;
        
        // 寻找结束标记
        const endMarkers = ['</div></div>', '</div><!-- 推荐游戏结束 -->'];
        for (const marker of endMarkers) {
          const pos = indexHTML.indexOf(marker, startPos);
          if (pos >= 0) {
            endPos = pos;
            break;
          }
        }
        
        if (startPos >= 0 && endPos >= 0) {
          // 提取并替换这个区域
          const beforeSection = indexHTML.substring(0, startPos + container.length);
          const afterSection = indexHTML.substring(endPos);
          
          indexHTML = beforeSection + '\n' + featuredGamesHTML + '\n' + afterSection;
          featuredGamesUpdated = true;
          console.log('已更新推荐游戏部分');
          break;
        }
      }
    }
    
    if (!featuredGamesUpdated) {
      console.warn('⚠️ 无法找到推荐游戏容器，跳过此部分更新');
    }
    
    // 如果两部分都没有更新成功，给出警告但不抛出错误
    if (!newGamesUpdated && !featuredGamesUpdated) {
      console.warn('⚠️ 未能更新任何游戏列表。首页HTML结构可能与脚本不匹配。');
      console.warn('请修改脚本以适应当前HTML结构，或手动更新首页。');
      // 不抛出错误，让脚本继续执行
    } else {
      // 至少有一部分更新成功，保存文件
      fs.writeFileSync(indexPath, indexHTML);
      console.log('✅ 首页游戏列表更新完成');
    }
  } catch (error) {
    console.error('❌ 更新首页失败:', error.message);
    throw error;
  }
}

// 生成游戏卡片HTML，确保处理undefined值
function generateGamesHTML(games) {
  if (!games || !games.length) {
    console.warn('⚠️ 没有游戏数据可生成HTML');
    return '';
  }
  
  return games.map(([gameId, game]) => {
    // 确保game对象存在
    if (!game) {
      console.warn(`⚠️ 游戏ID ${gameId} 的数据无效`);
      return '';
    }
    
    const title = game.title || '未命名游戏';
    const image = game.image || `https://via.placeholder.com/320x180/10B981/FFFFFF?text=${title.replace(/\s+/g, '+')}`;
    
    return `
    <div class="game-card">
      <a href="game-detail.html?game=${gameId}">
        <div class="relative">
          <img src="${image}" alt="${title}" class="w-full h-44 object-cover">
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-lg mb-1">${title}</h3>
        </div>
      </a>
    </div>
    `;
  }).join('\n');
}

// 按顺序执行脚本
async function updateGames() {
  try {
    // 1. 转换 CSV 到 JSON
    await runScript('convert-csv-to-json.js');
    
    // 2. 生成游戏页面
    await runScript('generate-game-pages.js');
    
    // 3. 更新首页游戏列表
    console.log('\n🔄 更新首页游戏列表...');
    await runScript('update-homepage.js');
    
    console.log('\n✨ 所有更新已完成！');
  } catch (error) {
    console.error('\n❌ 更新过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 执行更新
updateGames(); 