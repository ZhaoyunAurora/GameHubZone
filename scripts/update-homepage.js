/**
 * 更新首页游戏列表的独立脚本
 * 功能：读取games.json，完全重写首页游戏列表部分
 */

const fs = require('fs');
const path = require('path');

// 主函数
function updateHomepage() {
    console.log('开始更新首页游戏列表...');
    
    try {
        // 1. 读取游戏数据
        const gamesJsonPath = path.join(__dirname, '../js/games.json');
        const indexPath = path.join(__dirname, '../index.html');
        
        if (!fs.existsSync(gamesJsonPath)) {
            throw new Error(`游戏数据文件不存在: ${gamesJsonPath}`);
        }
        
        if (!fs.existsSync(indexPath)) {
            throw new Error(`首页文件不存在: ${indexPath}`);
        }
        
        const gamesData = JSON.parse(fs.readFileSync(gamesJsonPath, 'utf8'));
        let indexHTML = fs.readFileSync(indexPath, 'utf8');
        
        // 2. 将游戏数据转换为数组格式，以便排序
        const gamesArray = Object.keys(gamesData).map(key => {
            return {
                id: key,
                ...gamesData[key]
            };
        });
        
        // 3. 选择最新的8个游戏
        const latestGames = [...gamesArray]
            .sort((a, b) => new Date(b.added || '2000-01-01') - new Date(a.added || '2000-01-01'))
            .slice(0, 8);
        
        // 4. 生成游戏卡片HTML
        const gameCardsHTML = latestGames.map(game => {
            // 确保图片路径正确，如果没有图片则使用占位符
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
                </div>
            `;
        }).join('\n');
        
        // 5. 手动定位游戏卡片区域
        // 尝试多种可能的标记来找到游戏列表区域
        const possibleGameSectionMarkers = [
            '<section class="new-games py-12 bg-light">',
            '<section class="mt-28 mb-20">',
            '<!-- 增加这里的间距，添加mt-16顶部外边距 -->',
            '<!-- 游戏网格 -->'
        ];
        
        let gamesSectionStart = -1;
        for (const marker of possibleGameSectionMarkers) {
            const pos = indexHTML.indexOf(marker);
            if (pos !== -1) {
                gamesSectionStart = pos;
                console.log(`找到游戏区域标记: ${marker}`);
                break;
            }
        }
        
        if (gamesSectionStart === -1) {
            console.warn('警告：无法在首页找到游戏区域，请检查HTML结构');
            return;
        }
        
        // 尝试多种可能的标记来找到游戏卡片区域
        const possibleCardAreaMarkers = [
            '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">',
            '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">',
            '<div class="game-card">'
        ];
        
        let cardsStart = -1;
        for (const marker of possibleCardAreaMarkers) {
            const pos = indexHTML.indexOf(marker, gamesSectionStart);
            if (pos !== -1) {
                cardsStart = pos;
                console.log(`找到游戏卡片区域标记: ${marker}`);
                break;
            }
        }
        
        if (cardsStart === -1) {
            console.warn('警告：无法在首页找到游戏卡片区域，请检查HTML结构');
            return;
        }
        
        // 尝试多种可能的标记来找到游戏卡片结束区域
        const possibleCardEndMarkers = [
            '<!-- 加载更多按钮 -->',
            '<div class="text-center mb-12">',
            '</div><!-- 游戏网格 结束 -->'
        ];
        
        let cardsEnd = -1;
        for (const marker of possibleCardEndMarkers) {
            const pos = indexHTML.indexOf(marker, cardsStart);
            if (pos !== -1) {
                cardsEnd = pos;
                console.log(`找到游戏卡片结束标记: ${marker}`);
                break;
            }
        }
        
        // 如果找不到明确的结束标记，尝试查找下一个大的div结束标签
        if (cardsEnd === -1) {
            const nextDivEnd = indexHTML.indexOf('</div>', cardsStart + 50); // 跳过当前div的开始标签
            if (nextDivEnd !== -1) {
                cardsEnd = nextDivEnd;
                console.log('使用下一个</div>作为游戏卡片结束标记');
            } else {
                console.warn('警告：无法在首页找到游戏卡片结束区域，请检查HTML结构');
                return;
            }
        }
        
        // 6. 准备新的HTML内容
        const gridClassPart = indexHTML.substring(cardsStart, indexHTML.indexOf('>', cardsStart) + 1);
        const newCardsSection = `${gridClassPart}
${gameCardsHTML}
            </div>

            `;
        
        // 7. 替换游戏卡片区域
        const beforeCards = indexHTML.substring(0, cardsStart);
        const afterCards = indexHTML.substring(cardsEnd);
        const newIndexHTML = beforeCards + newCardsSection + afterCards;
        
        // 8. 写入新的HTML
        fs.writeFileSync(indexPath, newIndexHTML);
        
        console.log(`成功更新首页！已添加 ${latestGames.length} 个最新游戏到首页。`);
        
    } catch (error) {
        console.error('更新首页失败:', error.message);
    }
}

// 执行更新
updateHomepage(); 