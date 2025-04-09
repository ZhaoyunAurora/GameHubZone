const https = require('https');
const fs = require('fs');
const path = require('path');

// 创建目录（如果不存在）
const imagesDir = path.join(__dirname, '../images/games');
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// 简单的HTTP GET请求函数
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { 
        try {
          resolve(JSON.parse(data)); 
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

// 下载图片函数
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`Downloaded image: ${filepath}`);
          resolve();
        });
      } else {
        reject(`Failed to download image: ${response.statusCode}`);
      }
    }).on('error', reject);
  });
}

// 主函数
async function scrapeGames() {
  try {
    // 设置游戏源 - 这里你可以更改为你想要抓取的游戏API
    // ============= 在这里修改游戏来源 =============
    const gameSource = {
      // CrazyGames API (示例)
      url: 'https://business.gamezop.com/html5-games',
      transform: (data) => {
        return data.map(game => ({
          title: game.title,
          category: game.category.name,
          thumbnail: game.thumbnailUrl,
          embedUrl: `https://www.gamezop.com/embed/${game.slug}`,
          description: game.description
        }));
      }
    };
    
    // 也可以使用GameMonetize作为替代 (示例)
    // const gameSource = {
    //   url: 'https://api.gamemonetize.com/games',
    //   transform: (data) => {
    //     return data.games.map(game => ({
    //       title: game.name,
    //       category: game.category,
    //       thumbnail: game.thumb,
    //       embedUrl: `https://games.gamemonetize.com/embed/${game.id}`,
    //       description: game.description
    //     }));
    //   }
    // };
    // =============================================

    // 获取游戏数据
    console.log(`Fetching games from: ${gameSource.url}`);
    const apiData = await httpGet(gameSource.url);
    const games = gameSource.transform(apiData);
    
    console.log(`Found ${games.length} games`);

    // 创建CSV文件
    let csvContent = 'id,name,category,thumbnail,iframeUrl,description,playtime,plays\n';
    
    // 处理每个游戏
    for (const game of games.slice(0, 20)) { // 限制为前20个游戏，避免过多
      // 生成唯一ID
      const id = game.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // 创建图片路径
      const imagePath = `images/games/${id}.jpg`;
      const localImagePath = path.join(__dirname, '..', imagePath);
      
      // 下载图片
      try {
        await downloadImage(game.thumbnail, localImagePath);
      } catch (err) {
        console.error(`Failed to download image for ${game.title}: ${err}`);
        // 使用占位图
        fs.copyFileSync(
          path.join(__dirname, '../images/placeholder.jpg'), 
          localImagePath
        );
      }
      
      // 清理描述文本 (移除引号避免CSV问题)
      const cleanDescription = game.description
        .replace(/"/g, '""')
        .replace(/\n/g, ' ');
      
      // 添加到CSV
      csvContent += `${id},"${game.title}",${game.category},"${imagePath}","${game.embedUrl}","${cleanDescription}",${(Math.random() * 5 + 1).toFixed(1)},${Math.floor(Math.random() * 1000000)}\n`;
    }

    // 保存CSV文件
    fs.writeFileSync(path.join(__dirname, '../data/games.csv'), csvContent);
    console.log('Successfully generated games.csv!');

    // 转换为JSON
    const gamesJson = games.slice(0, 20).map(game => {
      const id = game.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      return {
        id,
        name: game.title,
        category: game.category,
        thumbnail: `images/games/${id}.jpg`,
        iframeUrl: game.embedUrl,
        description: game.description,
        playtime: `${(Math.random() * 5 + 1).toFixed(1)} mins`,
        plays: `${Math.floor(Math.random() * 1000000)}`,
        controls: getDefaultControls(game.category)
      };
    });

    // 保存为JSON
    fs.writeFileSync(
      path.join(__dirname, '../js/games.json'), 
      JSON.stringify(gamesJson, null, 2)
    );
    console.log('Successfully generated games.json!');

    // 提示运行页面生成器脚本
    console.log('\nNext step: Run the page generator:');
    console.log('node scripts/generate-game-pages.js');

  } catch (error) {
    console.error('Error:', error);
  }
}

// 默认控制说明
function getDefaultControls(category) {
  // 默认控制设置
  category = category.toLowerCase();
  
  if (category.includes('arcade') || category.includes('action')) {
    return [
      { key: 'Arrow Keys', action: 'Move' },
      { key: 'Space', action: 'Action/Jump' }
    ];
  } else if (category.includes('puzzle') || category.includes('board')) {
    return [
      { key: 'Mouse', action: 'Select and Move' },
      { key: 'Click', action: 'Place Item' }
    ];
  } else if (category.includes('strategy') || category.includes('simulation')) {
    return [
      { key: 'Mouse', action: 'Select Units' },
      { key: 'Right Click', action: 'Move Units' }
    ];
  } else if (category.includes('racing') || category.includes('sports')) {
    return [
      { key: 'Arrow Keys', action: 'Control Vehicle' },
      { key: 'Space', action: 'Brake/Action' }
    ];
  } else {
    return [
      { key: 'Arrow Keys', action: 'Move' },
      { key: 'Mouse', action: 'Aim/Select' },
      { key: 'Space', action: 'Action' }
    ];
  }
}

// 运行脚本
scrapeGames();
