const fetch = require('node-fetch');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const https = require('https');

// 创建下载图片的函数
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(`Failed to download image: ${response.statusCode}`);
      }
    }).on('error', reject);
  });
}

async function fetchGames() {
  try {
    // 创建Excel工作簿
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Games');

    // 设置表头
    worksheet.columns = [
      { header: 'id', key: 'id' },
      { header: 'name', key: 'name' },
      { header: 'category', key: 'category' },
      { header: 'thumbnail', key: 'thumbnail' },
      { header: 'iframeUrl', key: 'iframeUrl' },
      { header: 'description', key: 'description' },
      { header: 'playtime', key: 'playtime' },
      { header: 'plays', key: 'plays' }
    ];

    // 从GameFlare API获取游戏数据（示例URL，实际使用时需要替换为真实API）
    const response = await fetch('https://business.gamezop.com/html5-games');
    const data = await response.json();

    // 确保images/games目录存在
    const imagesDir = path.join(__dirname, '../images/games');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // 处理每个游戏
    for (const game of data.games) {
      // 生成唯一ID
      const id = game.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // 下载并保存游戏缩略图
      const imageExt = path.extname(game.thumbnail) || '.jpg';
      const imagePath = `images/games/${id}${imageExt}`;
      await downloadImage(game.thumbnail, path.join(__dirname, '..', imagePath));

      // 添加游戏数据到Excel
      worksheet.addRow({
        id,
        name: game.title,
        category: game.category,
        thumbnail: imagePath,
        iframeUrl: game.embedUrl,
        description: game.description,
        playtime: `${(Math.random() * 5 + 1).toFixed(1)}`,
        plays: Math.floor(Math.random() * 1000000)
      });
    }

    // 保存Excel文件
    await workbook.xlsx.writeFile(path.join(__dirname, '../data/games.xlsx'));
    console.log('Successfully generated games.xlsx!');

    // 自动运行CSV转换脚本
    console.log('Converting Excel to JSON...');
    require('./csv-to-json.js');

  } catch (error) {
    console.error('Error:', error);
  }
}

// 运行脚本
fetchGames();
