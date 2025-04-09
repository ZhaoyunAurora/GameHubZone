const fs = require('fs');
const path = require('path');

// 定义路径
const gamesJsonPath = path.join(__dirname, '../js/games.json');
const outputDir = path.join(__dirname, '../games');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`创建目录: ${outputDir}`);
}

// 读取游戏数据
try {
  const gamesData = fs.readFileSync(gamesJsonPath, 'utf8');
  const games = JSON.parse(gamesData);
  
  console.log(`找到 ${games.length} 个游戏，开始生成页面...`);
  
  // 为每个游戏生成HTML页面
  games.forEach(game => {
    const htmlContent = generateGameHTML(game, games);
    const outputPath = path.join(outputDir, `${game.id}.html`);
    
    fs.writeFileSync(outputPath, htmlContent);
    console.log(`已生成: ${outputPath}`);
  });
  
  console.log('所有游戏页面生成完成！');
} catch (error) {
  console.error('发生错误:', error.message);
}

// 生成游戏HTML的函数
function generateGameHTML(game, allGames) {
  // 生成随机游戏时长和播放次数（仅用于演示）
  const playTime = game.playTime ? parseInt(game.playTime) : Math.floor(Math.random() * 10) + 1;
  const plays = Math.floor(Math.random() * 10000) + 1000;
  const addedDate = new Date().toLocaleDateString('en-US');
  
  // 根据游戏类别生成游戏控制说明或使用自定义控制说明
  let gameControls = '';
  
  if (game.customControls) {
    // 使用自定义控制说明
    gameControls = `
      <p class="mb-2">Use the following controls:</p>
      <div class="space-y-2">
        ${game.customControls}
      </div>
    `;
  } else {
    // 根据游戏类别生成默认控制说明
    if (game.category === 'action' || game.category === 'adventure') {
      gameControls = `
        <p class="mb-2">Use the following controls:</p>
        <ul class="space-y-2">
          <li><span class="control-key">W</span> <span class="control-key">A</span> <span class="control-key">S</span> <span class="control-key">D</span> or <span class="control-key">↑</span> <span class="control-key">←</span> <span class="control-key">↓</span> <span class="control-key">→</span> - Move</li>
          <li><span class="control-key">Space</span> - Jump/Confirm</li>
          <li><span class="control-key">Left Mouse</span> - Attack/Select</li>
        </ul>
      `;
    } else if (game.category === 'puzzle' || game.category === 'strategy') {
      gameControls = `
        <p class="mb-2">Use the following controls:</p>
        <ul class="space-y-2">
          <li><span class="control-key">Left Mouse</span> - Select/Move</li>
          <li><span class="control-key">Right Mouse</span> - Cancel/Return</li>
          <li><span class="control-key">R</span> - Reset Level</li>
        </ul>
      `;
    } else {
      gameControls = `
        <p class="mb-2">Use the following controls:</p>
        <ul class="space-y-2">
          <li><span class="control-key">Left Mouse</span> - Primary Action</li>
          <li><span class="control-key">Space</span> - Pause/Resume</li>
        </ul>
      `;
    }
  }
  
  // 随机选择相关游戏（排除当前游戏）
  let relatedGames = getRandomRelatedGames(game, allGames, 8);
  
  // 生成相关游戏HTML
  let relatedGamesHTML = '';
  relatedGames.forEach(relatedGame => {
    // 生成随机评分（3.0-5.0之间）
    const rating = (Math.random() * 2 + 3).toFixed(1);
    const stars = generateStars(parseFloat(rating));
    
    // 简单的颜色生成（基于游戏类别）
    let bgColor = '6366F1'; // 默认紫色
    if (relatedGame.category.includes('Puzzle')) {
      bgColor = '10B981'; // 绿色
    } else if (relatedGame.category.includes('Action')) {
      bgColor = 'EF4444'; // 红色
    } else if (relatedGame.category.includes('Arcade')) {
      bgColor = 'F59E0B'; // 橙色
    } else if (relatedGame.category.includes('Sports')) {
      bgColor = '3B82F6'; // 蓝色
    } else if (relatedGame.category.includes('Strategy')) {
      bgColor = '8B5CF6'; // 紫色
    } else if (relatedGame.category.includes('Card')) {
      bgColor = 'EC4899'; // 粉色
    }
    
    // 使用游戏的实际缩略图URL或占位图
    const thumbnailUrl = relatedGame.thumbnail || `https://via.placeholder.com/80x80/${bgColor}/FFFFFF?text=Game`;
    
    relatedGamesHTML += `
      <div class="flex space-x-3">
        <a href="./${relatedGame.id}.html" class="w-20 h-20 flex-shrink-0">
          <img src="../${thumbnailUrl}" alt="${relatedGame.name}" class="w-20 h-20 rounded-md object-cover flex-shrink-0">
        </a>
        <div>
          <h3 class="font-semibold"><a href="./${relatedGame.id}.html" class="hover:text-primary">${relatedGame.name}</a></h3>
          <p class="text-sm text-gray-500">${relatedGame.category}</p>
          <div class="flex items-center mt-1">
            ${stars}
            <span class="text-xs text-gray-500 ml-1">${rating}</span>
          </div>
        </div>
      </div>
    `;
  });
  
  const baseUrl = 'https://gamehubzone.cc';
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${game.name} - GameHubZone</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="canonical" href="${baseUrl}/games/${game.id}.html" />
    <meta property="og:url" content="${baseUrl}/games/${game.id}.html" />
    <meta property="og:image" content="${baseUrl}/images/games/${game.id}/thumbnail.jpg" />
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#4F46E5',
                        secondary: '#10B981',
                        accent: '#F59E0B',
                        dark: '#1F2937',
                        light: '#F3F4F6'
                    }
                }
            }
        }
    </script>
    <style type="text/tailwindcss">
        @layer utilities {
            .game-card {
                @apply bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1;
            }
            .game-stats {
                @apply flex items-center text-sm text-gray-600;
            }
            .nav-link {
                @apply px-4 py-2 rounded-md hover:bg-gray-100 transition-colors;
            }
            .nav-link.active {
                @apply bg-primary text-white hover:bg-primary/90;
            }
            .control-key {
                @apply bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm font-mono;
            }
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Navigation Bar -->
    <header id="navbar" class="bg-white shadow-sm fixed w-full top-0 z-50 transition-transform duration-300">
        <div class="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-3">
            <div class="flex justify-between items-center">
                <a href="../index.html" class="flex items-center space-x-2">
                    <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">G</div>
                    <span class="text-xl font-bold text-dark">GameHubZone</span>
                </a>
                
                <!-- Search Box -->
                <div class="hidden md:block ml-6 w-64">
                    <div class="relative">
                        <input type="text" placeholder="Search games..." class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                        <button class="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-1.5 rounded-md">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Spacer to prevent content from being hidden under fixed navbar -->
    <div class="h-16"></div>

    <main class="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8">
        <!-- Game Title and Breadcrumb Navigation -->
        <div class="mb-6">
            <div class="flex items-center text-sm text-gray-500 mb-2">
                <a href="../index.html" class="hover:text-primary">Home</a>
                <span class="mx-2">/</span>
                <a href="../index.html" class="hover:text-primary">Games</a>
                <span class="mx-2">/</span>
                <span id="game-breadcrumb">${game.name}</span>
            </div>
            <h1 id="game-title" class="text-3xl font-bold text-dark">${game.name}</h1>
        </div>

        <!-- Game Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Game Content -->
            <div class="lg:col-span-2">
                <!-- Game iframe -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                    <div id="game-frame-container" class="aspect-video bg-gray-900">
                        <iframe src="${game.iframeUrl}" frameborder="0" allowfullscreen class="w-full h-full"></iframe>
                    </div>
                </div>

                <!-- Game Description -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                    <div class="p-6">
                        <h2 class="text-xl font-bold mb-4">Game Description</h2>
                        <p id="game-description" class="text-gray-700 mb-4">
                            ${game.description}
                        </p>
                    </div>
                </div>

                <!-- Game Controls and Info Side by Side -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8" id="game-info-section">
                    <!-- Game Information -->
                    <div class="bg-white rounded-lg shadow-md overflow-hidden">
                        <div class="p-6">
                            <h2 class="text-xl font-bold mb-4">Game Information</h2>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Category:</span>
                                    <span id="game-category" class="font-medium">${game.category}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Play Time:</span>
                                    <span id="game-playtime" class="font-medium">${playTime} minutes</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Total Plays:</span>
                                    <span id="game-plays" class="font-medium">${plays.toLocaleString()}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Added Date:</span>
                                    <span id="game-added" class="font-medium">${addedDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Game Controls -->
                    <div class="bg-white rounded-lg shadow-md overflow-hidden">
                        <div class="p-6">
                            <h2 class="text-xl font-bold mb-4">Game Controls</h2>
                            <div id="game-controls" class="text-gray-700">
                                ${gameControls}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="lg:col-span-1">
                <!-- Similar Games -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden" id="similar-games-section">
                    <div class="p-6">
                        <h2 class="text-xl font-bold mb-4">Similar Games</h2>
                        <div class="space-y-4">
                            ${relatedGamesHTML}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-dark text-white">
        <div class="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8">
            <!-- Flex layout with logo on left, other content on right -->
            <div class="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center">
                <!-- Logo Section - Left -->
                <div class="flex items-center space-x-2 mb-6 md:mb-0">
                    <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
                        <span class="font-bold text-xl">G</span>
                    </div>
                    <span class="text-xl font-bold">GameHubZone</span>
                </div>
                
                <!-- Right Content -->
                <div class="flex flex-col items-center md:items-end">
                    <!-- Links Section -->
                    <div class="flex flex-wrap justify-center md:justify-end space-x-6 mb-4">
                        <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" class="hover:text-white transition-colors">Terms of Use</a>
                        <a href="#" class="hover:text-white transition-colors">Cookie Policy</a>
                    </div>
                    
                    <!-- Copyright Info -->
                    <p class="text-center md:text-right text-gray-400 text-sm">© 2023 GameHubZone Technologies Pvt. Ltd. All rights reserved.</p>
                </div>
            </div>
        </div>
    </footer>

    <script>
        let lastScrollTop = 0;
        const navbar = document.getElementById('navbar');
        const navbarHeight = navbar.offsetHeight;
        
        window.addEventListener('scroll', function() {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > navbarHeight) {
                // Scrolling down and past navbar height
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
        
        // Adjust similar games section height to match game info section
        function adjustSimilarGamesHeight() {
            const gameInfoSection = document.getElementById('game-info-section');
            const similarGamesSection = document.getElementById('similar-games-section');
            
            if (gameInfoSection && similarGamesSection && window.innerWidth >= 1024) {
                // Only adjust height on large screens (lg and above)
                const gameInfoHeight = gameInfoSection.offsetHeight;
                const gameFrameContainer = document.getElementById('game-frame-container');
                const gameDescription = document.querySelector('.mb-8:nth-child(2)');
                
                // Calculate total height of left content
                const totalLeftHeight = gameFrameContainer.offsetHeight + 
                                       gameDescription.offsetHeight + 
                                       gameInfoHeight + 
                                       32; // Add margin-bottom (multiple of 8)
                
                // Set similar games section height
                similarGamesSection.style.height = \`\${totalLeftHeight}px\`;
            }
        }
        
        // Adjust height when page loads
        window.addEventListener('load', adjustSimilarGamesHeight);
        // Readjust height when window is resized
        window.addEventListener('resize', adjustSimilarGamesHeight);
    </script>
</body>
</html>`;
}

// 随机获取相关游戏的函数
function getRandomRelatedGames(currentGame, allGames, count) {
  // 过滤掉当前游戏
  const otherGames = allGames.filter(g => g.id !== currentGame.id);
  
  // 首先尝试找到相同类别的游戏
  const sameCategory = otherGames.filter(g => g.category === currentGame.category);
  
  // 准备结果数组
  let result = [];
  
  // 如果同类别游戏足够，随机选择一些
  if (sameCategory.length >= count / 2) {
    // 随机选择一半数量的同类别游戏
    const sameCategoryCount = Math.min(Math.ceil(count / 2), sameCategory.length);
    result = getRandomItems(sameCategory, sameCategoryCount);
  }
  
  // 如果结果数量不足count，从其他类别中随机选择补充
  if (result.length < count) {
    const remainingOtherGames = otherGames.filter(g => !result.includes(g));
    const remainingCount = count - result.length;
    
    const additional = getRandomItems(remainingOtherGames, remainingCount);
    result = [...result, ...additional];
  }
  
  return result;
}

// 从数组中随机选择指定数量的元素
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 生成星级评分HTML的辅助函数
function generateStars(rating) {
  let starsHTML = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // 添加实心星星
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star text-yellow-400 text-xs"></i>';
  }
  
  // 添加半星（如果需要）
  if (hasHalfStar) {
    starsHTML += '<i class="fas fa-star-half-alt text-yellow-400 text-xs"></i>';
  }
  
  // 添加空心星星
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star text-yellow-400 text-xs"></i>';
  }
  
  return starsHTML;
}