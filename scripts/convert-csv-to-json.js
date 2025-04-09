const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

// 定义路径
const csvPath = path.join(__dirname, '../data/games.csv');
const jsonPath = path.join(__dirname, '../js/games.json');

// 读取CSV文件
const csvContent = fs.readFileSync(csvPath, 'utf8');

// 解析CSV数据
const records = csv.parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true // 允许列数不一致
});

// 转换数据格式
const games = records.map(record => ({
  id: record.id,
  name: record.name,
  category: record.category,
  thumbnail: record.thumbnail,
  iframeUrl: record.iframeUrl,
  description: record.description,
  playTime: record.playtime,
  plays: record.plays
})).filter(game => game.id && game.name); // 过滤掉无效数据

// 写入JSON文件
fs.writeFileSync(jsonPath, JSON.stringify(games, null, 2));
console.log(`已将CSV数据转换为JSON并保存到: ${jsonPath}`); 