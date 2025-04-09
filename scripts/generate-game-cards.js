const fs = require('fs');
const path = require('path');

// 读取游戏数据
const gamesJsonPath = path.join(__dirname, '../js/games.json');
const gamesData = JSON.parse(fs.readFileSync(gamesJsonPath, 'utf8'));

// 转换为数组并排序
const gamesArray = Object.keys(gamesData).map(key => ({
  id: key,
  ...gamesData[key]
}));

// 获取最新游戏
const latestGames = [...gamesArray]
  .sort((a, b) => new Date(b.added || '2000-01-01') - new Date(a.added || '2000-01-01'))
  .slice(0, 8);

// 生成HTML
const html = latestGames.map(game => {
  const imageUrl = game.image || `https://via.placeholder.com/320x180/10B981/FFFFFF?text=${encodeURIComponent(game.title)}`;
  
  return `
<div class="game-card">
    <a href="games/${game.id}.html">
        <div class="relative">
            <img src="${imageUrl}" alt="${game.title}" class="w-full h-44 object-cover">
        </div>
        <div class="p-4">
            <h3 class="font-semibold text-lg mb-1">${game.title}</h3>
        </div>
    </a>
</div>`;
}).join('\n');

// 输出到文件
const outputPath = path.join(__dirname, '../latest-games.html');
fs.writeFileSync(outputPath, html);

console.log(`已生成最新游戏卡片HTML到: ${outputPath}`);
console.log('请手动将此内容替换到index.html中的游戏卡片区域'); 