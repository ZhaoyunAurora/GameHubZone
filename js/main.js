// 游戏数据 - 在实际项目中，这些数据通常来自后端API
const gamesData = {
    'witch-flight': {
        title: 'Witch Flight',
        description: 'Help the young witch navigate through a spooky forest filled with obstacles. Collect magical pumpkins to boost your score and avoid flying bats that will slow you down. How far can you fly?',
        category: 'Arcade',
        playtime: '3.1 mins',
        plays: '363.6K',
        added: 'October 15, 2023',
        controls: [
            { key: 'Space', action: 'Jump/Fly up' },
            { key: 'Down Arrow', action: 'Dive down' },
            { key: 'P', action: 'Pause game' }
        ],
        iframe: 'https://www.gameflare.com/embed/witch-flight/'
    },
    'shape-smash': {
        title: 'Shape Smash',
        description: 'A colorful 3D puzzle game where you need to match and smash shapes of the same color. Clear levels by removing all shapes within the time limit. Features increasingly challenging puzzles and special power-ups.',
        category: 'Puzzle & Logic',
        playtime: '4.4 mins',
        plays: '9.6M',
        added: 'September 28, 2023',
        controls: [
            { key: 'Mouse Click', action: 'Select and match shapes' },
            { key: 'R', action: 'Reset level' },
            { key: 'Space', action: 'Use power-up' }
        ],
        iframe: 'https://www.gameflare.com/embed/shape-smash/'
    },
    'soccer-wizard': {
        title: 'Soccer Wizard',
        description: 'Become a soccer legend in this fast-paced arcade football game. Score goals with perfect timing and precision. Unlock special abilities and compete against increasingly difficult goalkeepers.',
        category: 'Sports & Racing',
        playtime: '2.4 mins',
        plays: '121.7K',
        added: 'October 5, 2023',
        controls: [
            { key: 'Mouse Movement', action: 'Aim shot' },
            { key: 'Mouse Click', action: 'Power and shoot' },
            { key: '1-3 Keys', action: 'Select special abilities' }
        ],
        iframe: 'https://www.gameflare.com/embed/soccer-wizard/'
    },
    'viking-siege': {
        title: 'Viking Siege',
        description: 'Lead your Viking clan to victory in this strategic tower defense game. Build defenses, train warriors, and repel enemy invasions. Upgrade your fortress and unlock powerful Viking heroes with special abilities.',
        category: 'Strategy',
        playtime: '12.8 mins',
        plays: '337.6K',
        added: 'August 12, 2023',
        controls: [
            { key: 'Mouse Click', action: 'Place defenses and select units' },
            { key: 'Q, W, E, R', action: 'Activate special abilities' },
            { key: 'Space', action: 'Pause/Resume game' }
        ],
        iframe: 'https://www.gameflare.com/embed/viking-siege/'
    },
    'kingdom-fight': {
        title: 'Kingdom Fight 2.0',
        description: 'An epic battle strategy game where you must build your kingdom while defending against waves of enemies. Collect resources, upgrade your castle, and command powerful heroes to defeat the invading forces.',
        category: 'Strategy',
        playtime: '13.5 mins',
        plays: '1.2M',
        added: 'July 30, 2023',
        controls: [
            { key: 'Mouse Click', action: 'Select buildings and units' },
            { key: 'A-Z Keys', action: 'Hotkeys for different actions' },
            { key: 'Tab', action: 'Switch between different areas' }
        ],
        iframe: 'https://www.gameflare.com/embed/kingdom-fight/'
    },
    'animal-connection': {
        title: 'Animal Connection',
        description: 'Connect matching animal tiles in this adorable puzzle game. Clear the board by finding all pairs before time runs out. Features cute animal graphics and increasingly challenging levels with special tiles.',
        category: 'Puzzle & Logic',
        playtime: '5.8 mins',
        plays: '220K',
        added: 'September 10, 2023',
        controls: [
            { key: 'Mouse Click', action: 'Select tiles' },
            { key: 'H', action: 'Hint (limited uses)' },
            { key: 'R', action: 'Reshuffle (limited uses)' }
        ],
        iframe: 'https://www.gameflare.com/embed/animal-connection/'
    },
    'slide-and-divide': {
        title: 'Slide And Divide',
        description: 'A challenging number puzzle where you slide and divide blocks to reach the target number. Combine strategy and math skills to solve increasingly difficult puzzles across multiple colorful worlds.',
        category: 'Puzzle & Logic',
        playtime: '13.3 mins',
        plays: '682.3K',
        added: 'August 25, 2023',
        controls: [
            { key: 'Arrow Keys', action: 'Move blocks' },
            { key: 'Z', action: 'Undo last move' },
            { key: 'R', action: 'Restart level' }
        ],
        iframe: 'https://www.gameflare.com/embed/slide-and-divide/'
    }
};

// 调试信息
console.log('正在初始化游戏页面...');

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查当前页面是否为游戏详情页并实现重定向
    if (window.location.pathname.includes('game-detail.html')) {
        // 从URL获取游戏ID
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = urlParams.get('game');
        
        if (gameId) {
            // 重定向到games目录下的对应游戏页面
            window.location.href = `games/${gameId}.html`;
            return; // 重定向后不再执行后续代码
        }
        
        loadGameDetails(); // 如果没有gameId，仍然调用原来的函数
    }
    
    // 添加轮播按钮事件监听
    setupCarousel();
    
    // 添加搜索功能
    setupSearch();
    
    // 加载首页游戏数据
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        loadHomePageGames();
        
        // 绑定"加载更多"按钮事件
        const loadMoreBtn = document.querySelector('.text-center.mb-12 button');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMoreGames);
        }
    }
    
    // 设置导航
    setupNavigation();
    
    // 显示最新添加的游戏
    displayNewlyAddedGames();
});

// 加载游戏详情
function loadGameDetails() {
    // 从URL获取游戏ID
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('game');
    
    // 如果找不到游戏ID或游戏数据，显示错误信息
    if (!gameId || !gamesData[gameId]) {
        document.getElementById('game-title').textContent = 'Game Not Found';
        document.getElementById('game-description').textContent = 'Sorry, the requested game could not be found.';
        return;
    }
    
    // 获取游戏数据
    const game = gamesData[gameId];
    
    // 更新页面标题
    document.title = `${game.title} - GameHubZone`;
    
    // 更新面包屑导航和游戏标题
    document.getElementById('game-breadcrumb').textContent = game.title;
    document.getElementById('game-title').textContent = game.title;
    
    // 更新游戏描述
    document.getElementById('game-description').textContent = game.description;
    
    // 更新游戏信息
    document.getElementById('game-category').textContent = game.category;
    document.getElementById('game-playtime').textContent = game.playtime;
    document.getElementById('game-plays').textContent = game.plays;
    document.getElementById('game-added').textContent = game.added;
    
    // 更新游戏控制说明
    const controlsContainer = document.getElementById('game-controls');
    controlsContainer.innerHTML = '';
    
    if (game.controls && game.controls.length > 0) {
        const controlsList = document.createElement('ul');
        controlsList.className = 'space-y-2';
        
        game.controls.forEach(control => {
            const controlItem = document.createElement('li');
            controlItem.className = 'flex items-center';
            controlItem.innerHTML = `
                <span class="control-key mr-2">${control.key}</span>
                <span>${control.action}</span>
            `;
            controlsList.appendChild(controlItem);
        });
        
        controlsContainer.appendChild(controlsList);
    } else {
        controlsContainer.textContent = 'No specific controls information available for this game.';
    }
    
    // 加载游戏iframe
    const frameContainer = document.getElementById('game-frame-container');
    if (game.iframe) {
        frameContainer.innerHTML = `
            <iframe src="${game.iframe}" 
                    class="w-full h-full" 
                    frameborder="0" 
                    allowfullscreen>
            </iframe>
        `;
    }
}

// 设置轮播功能
function setupCarousel() {
    const carouselButtons = document.querySelectorAll('.relative > button');
    if (carouselButtons.length >= 2) {
        const prevButton = carouselButtons[0];
        const nextButton = carouselButtons[1];
        const carousel = document.querySelector('.flex.space-x-4.overflow-x-auto');
        
        if (carousel) {
            // 向前滚动
            prevButton.addEventListener('click', function() {
                carousel.scrollBy({ left: -300, behavior: 'smooth' });
            });
            
            // 向后滚动
            nextButton.addEventListener('click', function() {
                carousel.scrollBy({ left: 300, behavior: 'smooth' });
            });
        }
    }
}

// 设置搜索功能
function setupSearch() {
    const searchInput = document.querySelector('input[placeholder="Search games..."]');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            // 按下回车键时执行搜索
            if (event.key === 'Enter') {
                const searchTerm = searchInput.value.toLowerCase().trim();
                if (searchTerm) {
                    // 在实际项目中，这里会跳转到搜索结果页或过滤当前页面的游戏
                    alert(`Searching for: ${searchTerm}`);
                    
                    // 简单的游戏搜索示例
                    const matchingGames = Object.entries(gamesData).filter(([id, game]) => 
                        game.title.toLowerCase().includes(searchTerm) || 
                        game.description.toLowerCase().includes(searchTerm) ||
                        game.category.toLowerCase().includes(searchTerm)
                    );
                    
                    console.log('Search results:', matchingGames);
                }
            }
        });
    }
}

// 显示新添加的游戏
function displayNewGames(games) {
    const newGamesContainer = document.querySelector('.grid-cols-1.md\\:grid-cols-3');
    if (!newGamesContainer) return;
    
    newGamesContainer.innerHTML = '';
    
    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'w-full';
        gameCard.innerHTML = `
            <a href="games/${game.id}.html">
                <div class="relative rounded-xl overflow-hidden shadow-lg">
                    <img src="${game.thumbnail}" alt="${game.name}" class="w-full h-48 sm:h-52 md:h-56 object-cover">
                </div>
                <div class="mt-3 text-center">
                    <h3 class="font-medium text-base">${game.name}</h3>
                </div>
            </a>
        `;
        newGamesContainer.appendChild(gameCard);
    });
}

// 显示所有游戏
function displayAllGames(games) {
    const allGamesContainer = document.querySelector('.grid-cols-1.sm\\:grid-cols-2');
    if (!allGamesContainer) return;
    
    allGamesContainer.innerHTML = '';
    
    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.innerHTML = `
            <a href="games/${game.id}.html">
                <div class="relative">
                    <img src="${game.thumbnail}" alt="${game.name}" class="w-full h-44 object-cover">
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-lg mb-1">${game.name}</h3>
                </div>
            </a>
        `;
        allGamesContainer.appendChild(gameCard);
    });
}

// 加载首页游戏
function loadHomePageGames() {
    // 获取游戏容器元素
    const featuredGamesContainer = document.querySelector('.featured-games .grid');
    const newGamesContainer = document.querySelector('.new-games .grid');
    
    if (!featuredGamesContainer || !newGamesContainer) return;
    
    // 清空现有内容
    featuredGamesContainer.innerHTML = '';
    newGamesContainer.innerHTML = '';
    
    // 获取游戏数据
    fetch('js/games.json')
        .then(response => response.json())
        .then(games => {
            // 处理推荐游戏
            const featuredGames = Object.entries(games).filter(([_, game]) => game.featured).slice(0, 4);
            featuredGames.forEach(([gameId, game]) => {
                featuredGamesContainer.appendChild(createGameCard(gameId, game));
            });
            
            // 处理最新游戏
            const sortedGames = Object.entries(games).sort((a, b) => {
                const dateA = new Date(a[1].added || '2000-01-01');
                const dateB = new Date(b[1].added || '2000-01-01');
                return dateB - dateA;
            }).slice(0, 4);
            
            sortedGames.forEach(([gameId, game]) => {
                newGamesContainer.appendChild(createGameCard(gameId, game));
            });
        })
        .catch(error => console.error('加载游戏数据失败:', error));
}

// 创建游戏卡片元素
function createGameCard(gameId, game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    
    const imageUrl = game.image || `https://via.placeholder.com/320x180/10B981/FFFFFF?text=${game.title.replace(/\s+/g, '+')}`;
    
    card.innerHTML = `
        <a href="game-detail.html?game=${gameId}">
            <div class="relative">
                <img src="${imageUrl}" alt="${game.title}" class="w-full h-44 object-cover">
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-lg mb-1">${game.title}</h3>
            </div>
        </a>
    `;
    
    return card;
}

// 生成随机颜色代码（用于占位图片）
function getRandomColor() {
    const colors = ['EF4444', '3B82F6', '10B981', '8B5CF6', 'F472B6', '0EA5E9', '9333EA'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 加载更多游戏功能
function loadMoreGames() {
    if (!window.allGames) return;
    
    const nextBatch = window.allGames.slice(window.currentlyLoaded, window.currentlyLoaded + 4);
    if (nextBatch.length > 0) {
        const container = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4');
        
        nextBatch.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.innerHTML = `
                <a href="game-detail.html?game=${game.id}">
                    <div class="relative">
                        <img src="${game.thumbnail || `https://via.placeholder.com/320x180/${getRandomColor()}/FFFFFF?text=${encodeURIComponent(game.name)}`}" 
                            alt="${game.name}" class="w-full h-44 object-cover">
                    </div>
                    <div class="p-4">
                        <h3 class="font-semibold text-lg mb-1">${game.name}</h3>
                    </div>
                </a>
            `;
            container.appendChild(gameCard);
        });
        
        window.currentlyLoaded += nextBatch.length;
        
        // 如果已加载所有游戏，隐藏"加载更多"按钮
        if (window.currentlyLoaded >= window.allGames.length) {
            const loadMoreBtn = document.querySelector('.text-center.mb-12 button');
            if (loadMoreBtn) {
                loadMoreBtn.style.display = 'none';
            }
        }
    }
}

// 设置全局导航，确保在所有页面上添加正确的活动状态
function setupNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.includes(linkPath) || 
            (currentPath.includes('game-detail.html') && linkPath.includes('games'))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// 加载CSV文件的函数
async function loadGamesCSV() {
    console.log('开始加载游戏数据...');
    try {
        // 注意：确保这里的路径是正确的
        const response = await fetch('data/games.csv');
        console.log('fetch响应状态:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }
        const data = await response.text();
        console.log('CSV数据加载成功，前100个字符:', data.substring(0, 100));
        return parseCSV(data);
    } catch (error) {
        console.error('加载游戏数据失败:', error);
        return [];
    }
}

// 解析CSV数据
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    console.log(`CSV行数: ${lines.length}`);
    
    // 修正标题，删除可能的回车符
    const headers = lines[0].split(',').map(header => header.trim().replace(/\r/g, ''));
    console.log('清理后的CSV标题:', headers);
    
    const games = lines.slice(1)
        .filter(line => line.trim() !== '')
        .map(line => {
            const values = line.split(',');
            const game = {};
            
            headers.forEach((header, index) => {
                if (header !== '') {
                    game[header] = values[index] ? values[index].trim() : '';
                }
            });
            
            return game;
        });
    
    console.log(`解析到 ${games.length} 个游戏`);
    return games;
}

// 显示最新添加的游戏
async function displayNewlyAddedGames() {
    console.log('开始显示新添加的游戏...');
    const container = document.getElementById('newly-added-games');
    if (!container) {
        console.error('找不到newly-added-games容器');
        return;
    }
    
    // 清空加载指示器
    container.innerHTML = '';
    
    try {
        // 加载游戏数据
        const games = await loadGamesCSV();
        console.log(`加载了 ${games.length} 个游戏`);
        
        // 筛选标记为isNew的游戏
        const newGames = games.filter(game => 
            game.isNew === 'true' || game.isNew === true || game.isNew === 'TRUE'
        );
        
        console.log(`找到 ${newGames.length} 个新游戏`);
        
        // 如果没有新游戏，显示提示信息
        if (newGames.length === 0) {
            console.log('没有找到标记为新的游戏');
            container.innerHTML = '<p class="col-span-3 text-center text-gray-500">暂无新游戏</p>';
            return;
        }
        
        // 设置容器样式，使其支持平滑滚动
        container.classList.add('overflow-hidden');
        
        // 创建内部滚动容器
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'flex transition-transform duration-500 ease-in-out';
        scrollContainer.id = 'newGames-scroll-container';
        container.appendChild(scrollContainer);
        
        // 添加所有新游戏卡片
        newGames.forEach(game => {
            console.log(`创建游戏卡片: ${game.name}`);
            const gameCard = document.createElement('div');
            gameCard.className = 'w-full flex-shrink-0 px-3';
            gameCard.style.width = 'calc(100% / 3)'; // 确保每张卡片占据1/3宽度
            gameCard.innerHTML = `
                <a href="games/${game.id}.html">
                    <div class="relative rounded-xl overflow-hidden shadow-lg">
                        <img src="${game.thumbnail}" alt="${game.name}" class="w-full h-48 sm:h-52 md:h-56 object-cover">
                    </div>
                    <div class="mt-3 text-center">
                        <h3 class="font-medium text-base">${game.name}</h3>
                    </div>
                </a>
            `;
            scrollContainer.appendChild(gameCard);
        });
        
        // 初始位置
        container.dataset.currentIndex = 0;
        
        // 设置滑动功能（有超过3个新游戏时才启用）
        setupNewGamesCarousel(newGames.length);
        
    } catch (error) {
        console.error('显示最新游戏失败:', error);
        container.innerHTML = `<p class="col-span-3 text-center text-gray-500">加载游戏失败: ${error.message}</p>`;
    }
}

// 设置新游戏轮播功能
function setupNewGamesCarousel(totalGames) {
    // 获取前进和后退按钮
    const prevButton = document.getElementById('newGames-prev');
    const nextButton = document.getElementById('newGames-next');
    
    if (!prevButton || !nextButton) {
        console.error('找不到滑动按钮');
        return;
    }
    
    // 如果游戏数量不超过3个，隐藏滑动按钮
    if (totalGames <= 3) {
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
        return;
    }
    
    // 显示滑动按钮
    prevButton.style.display = 'block';
    nextButton.style.display = 'block';
    
    // 获取滚动容器
    const container = document.getElementById('newly-added-games');
    const scrollContainer = document.getElementById('newGames-scroll-container');
    
    // 更新轮播状态
    function updateCarouselState() {
        const currentIndex = parseInt(container.dataset.currentIndex || '0');
        
        // 更新按钮状态
        // 第一个游戏时禁用上一个按钮
        if (currentIndex === 0) {
            prevButton.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            prevButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        
        // 到达最后一组游戏时禁用下一个按钮
        if (currentIndex >= totalGames - 3) {
            nextButton.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
    
    // 滑动到指定索引的游戏
    function slideToIndex(index) {
        // 确保索引在有效范围内
        if (index < 0) index = 0;
        if (index > totalGames - 3) index = totalGames - 3;
        
        // 计算滑动距离
        const slidePercent = (index / 3) * 100;
        
        // 应用平滑滑动效果
        scrollContainer.style.transform = `translateX(-${index * (100/3)}%)`;
        
        // 更新当前索引
        container.dataset.currentIndex = index;
        
        // 更新按钮状态
        updateCarouselState();
    }
    
    // 设置点击事件
    prevButton.onclick = function() {
        const currentIndex = parseInt(container.dataset.currentIndex || '0');
        // 向后滑动一个游戏
        slideToIndex(currentIndex - 1);
    };
    
    nextButton.onclick = function() {
        const currentIndex = parseInt(container.dataset.currentIndex || '0');
        // 向前滑动一个游戏
        slideToIndex(currentIndex + 1);
    };
    
    // 初始化按钮状态
    updateCarouselState();
    console.log('轮播功能设置完成');
    
    // 添加触摸滑动支持
    let startX, moveX;
    const touchThreshold = 50; // 触发滑动的阈值
    
    scrollContainer.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    });
    
    scrollContainer.addEventListener('touchmove', function(e) {
        if (!startX) return;
        
        moveX = e.touches[0].clientX;
        // 防止页面滚动
        e.preventDefault();
    });
    
    scrollContainer.addEventListener('touchend', function() {
        if (!startX || !moveX) return;
        
        const difference = startX - moveX;
        const currentIndex = parseInt(container.dataset.currentIndex || '0');
        
        if (difference > touchThreshold) {
            // 向左滑动 -> 下一个
            slideToIndex(currentIndex + 1);
        } else if (difference < -touchThreshold) {
            // 向右滑动 -> 上一个
            slideToIndex(currentIndex - 1);
        }
        
        // 重置
        startX = null;
        moveX = null;
    });
}