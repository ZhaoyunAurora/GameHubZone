const fs = require('fs');
const path = require('path');

// 创建目录（如果不存在）
const imagesDir = path.join(__dirname, '../images/games');
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// 主函数
async function scrapeGames() {
  try {
    // 基于Gamezop网站上的游戏创建模拟数据
    // 数据来源: https://business.gamezop.com/html5-games
    const gamezopGames = [
      {
        title: 'Viking Siege',
        category: 'Strategy',
        thumbnail: 'images/games/viking-siege.jpg',
        embedUrl: 'https://www.gamezop.com/games/viking-siege',
        description: 'Lead your Viking army to conquer enemy territories in this exciting strategy game.',
        playtime: '11.8 mins',
        plays: '344.7K'
      },
      {
        title: 'Kingdom Fight 2.0',
        category: 'Strategy',
        thumbnail: 'images/games/kingdom-fight-2.jpg',
        embedUrl: 'https://www.gamezop.com/games/kingdom-fight-2',
        description: 'Build your kingdom and battle with other players in this upgraded version of the strategy classic.',
        playtime: '13.7 mins',
        plays: '1.2M'
      },
      {
        title: 'Animal Connection',
        category: 'Puzzle & Logic',
        thumbnail: 'images/games/animal-connection.jpg',
        embedUrl: 'https://www.gamezop.com/games/animal-connection',
        description: 'Connect matching animals to clear the board in this adorable puzzle game.',
        playtime: '9.6 mins',
        plays: '224.8K'
      },
      {
        title: 'Slide And Divide',
        category: 'Puzzle & Logic',
        thumbnail: 'images/games/slide-and-divide.jpg',
        embedUrl: 'https://www.gamezop.com/games/slide-and-divide',
        description: 'Slide blocks and divide them to solve challenging puzzles.',
        playtime: '13.6 mins',
        plays: '692K'
      },
      {
        title: 'Dragon Annihilation',
        category: 'Action',
        thumbnail: 'images/games/dragon-annihilation.jpg',
        embedUrl: 'https://www.gamezop.com/games/dragon-annihilation',
        description: 'Battle fierce dragons in this action-packed adventure game.',
        playtime: '12.1 mins',
        plays: '3.3M'
      },
      {
        title: 'Fruity Fiesta',
        category: 'Puzzle & Logic',
        thumbnail: 'images/games/fruity-fiesta.jpg',
        embedUrl: 'https://www.gamezop.com/games/fruity-fiesta',
        description: 'Match colorful fruits in this addictive puzzle game with special power-ups.',
        playtime: '17.3 mins',
        plays: '17.2M'
      },
      {
        title: 'Ludo With Friends',
        category: 'Board',
        thumbnail: 'images/games/ludo-with-friends.jpg',
        embedUrl: 'https://www.gamezop.com/games/ludo-with-friends',
        description: 'Play the classic board game Ludo with friends or against the computer.',
        playtime: '11.6 mins',
        plays: '97.3M'
      },
      {
        title: 'Rampage Racer',
        category: 'Sports & Racing',
        thumbnail: 'images/games/rampage-racer.jpg',
        embedUrl: 'https://www.gamezop.com/games/rampage-racer',
        description: 'Race through challenging tracks and beat your opponents in this high-speed racing game.',
        playtime: '6.9 mins',
        plays: '10.5M'
      },
      {
        title: 'ZUNO',
        category: 'Card',
        thumbnail: 'images/games/zuno.jpg',
        embedUrl: 'https://www.gamezop.com/games/zuno',
        description: 'Play the classic card game with special cards and challenging opponents.',
        playtime: '12.2 mins',
        plays: '2.9M'
      },
      {
        title: 'Pool Master',
        category: 'Sports',
        thumbnail: 'images/games/pool-master.jpg',
        embedUrl: 'https://www.gamezop.com/games/pool-master',
        description: 'Show off your pool skills in this realistic billiards simulation game.',
        playtime: '8.5 mins',
        plays: '3.9M'
      }
    ];

    console.log(`找到 ${gamezopGames.length} 个游戏`);

    // 创建CSV文件
    let csvContent = 'id,name,category,thumbnail,iframeUrl,description,playtime,plays\n';
    
    // 处理每个游戏
    const games = [];
    for (const game of gamezopGames) {
      // 生成唯一ID
      const id = game.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // 创建图片路径 - 我们使用相对路径
      const imagePath = `images/games/${id}.jpg`;
      
      // 创建占位图文件
      const placeholderPath = path.join(__dirname, '..', imagePath);
      // 如果文件不存在，创建一个占位符
      if (!fs.existsSync(placeholderPath)) {
        fs.writeFileSync(
          placeholderPath,
          'This is a placeholder for game image. Please replace with actual game image.'
        );
        console.log(`创建占位图: ${imagePath}`);
      }
      
      // 添加到CSV
      csvContent += `${id},"${game.title}",${game.category},"${imagePath}","${game.embedUrl}","${game.description}",${game.playtime},${game.plays}\n`;
      
      // 添加到JSON数组
      games.push({
        id,
        name: game.title,
        category: game.category,
        thumbnail: imagePath,
        iframeUrl: game.embedUrl,
        description: game.description,
        playtime: game.playtime,
        plays: game.plays,
        controls: getDefaultControls(game.category)
      });
    }

    // 保存CSV文件
    fs.writeFileSync(path.join(__dirname, '../data/games.csv'), csvContent);
    console.log('成功生成games.csv文件！');

    // 保存为JSON
    fs.writeFileSync(
      path.join(__dirname, '../js/games.json'), 
      JSON.stringify(games, null, 2)
    );
    console.log('成功生成games.json文件！');

    console.log('\n下一步: 运行页面生成器脚本:');
    console.log('node scripts/generate-game-pages.js');

  } catch (error) {
    console.error('错误:', error);
  }
}

// 默认控制说明
function getDefaultControls(category) {
  // 默认控制设置
  category = category.toLowerCase();
  
  if (category.includes('action') || category.includes('arcade')) {
    return [
      { key: 'Arrow Keys', action: 'Move' },
      { key: 'Space', action: 'Action/Jump' }
    ];
  } else if (category.includes('puzzle') || category.includes('logic')) {
    return [
      { key: 'Mouse', action: 'Select and Move' },
      { key: 'Click', action: 'Place Item' }
    ];
  } else if (category.includes('strategy')) {
    return [
      { key: 'Mouse', action: 'Select Units' },
      { key: 'Right Click', action: 'Move Units' }
    ];
  } else if (category.includes('sports') || category.includes('racing')) {
    return [
      { key: 'Arrow Keys', action: 'Control Vehicle' },
      { key: 'Space', action: 'Brake/Action' }
    ];
  } else if (category.includes('board') || category.includes('card')) {
    return [
      { key: 'Mouse', action: 'Select Card/Piece' },
      { key: 'Click', action: 'Place Card/Move Piece' }
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
