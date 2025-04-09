# GameHubZone

GameHubZone 是一个在线游戏平台，允许用户浏览、搜索和玩各种网页游戏。该平台提供了友好的用户界面，支持游戏分类、游戏详情展示以及管理功能。

## 项目结构

/Users/chen/Trae/GameHub/
├── admin/                 # 管理员相关页面
│   └── add-game.html      # 添加新游戏页面
├── css/                   # CSS 样式文件
├── data/                  # 数据文件
│   └── games.csv          # 游戏数据（CSV格式）
├── games/                 # 游戏详情页面
├── images/                # 图片资源
│   └── games/             # 游戏缩略图
├── js/                    # JavaScript 文件
│   ├── main.js            # 主要 JavaScript 逻辑
│   └── games.json         # 由CSV转换生成的JSON数据
├── scripts/               # 脚本工具
│   ├── convert-csv-to-json.js  # 将CSV转换为JSON的脚本
│   ├── generate-game-cards.js  # 生成游戏卡片的脚本
│   ├── generate-game-pages.js  # 生成游戏页面的脚本
│   ├── update-games.js         # 自动化更新流程的脚本
│   ├── update-homepage.js      # 更新首页游戏列表的脚本
│   └── watch-games.js          # 自动监控CSV文件变化的脚本
├── game_scraper/          # 游戏缩略图抓取工具
│   └── README.md          # 抓取工具说明文档
├── game-detail.html       # 游戏详情通用模板
└── index.html             # 首页模板

## 核心功能

- 游戏浏览：首页展示最新和热门游戏
- 游戏详情：每个游戏都有详细介绍、操作说明和相关推荐
- 游戏搜索：快速查找感兴趣的游戏
- 响应式设计：适配不同屏幕尺寸
- 自动隐藏导航栏：提升用户体验
- 游戏管理：管理员可以通过管理界面添加新游戏
- 自动生成页面：通过脚本自动为每个游戏生成详情页面
- 游戏数据管理：使用 CSV 格式存储游戏数据，便于维护和更新
- 自动化工作流：一键更新从CSV到网页的全流程
- 实时监控：自动监控CSV文件变化并更新网站内容
- 游戏缩略图抓取：通过 Playwright 自动从 Gamezop 网站抓取游戏缩略图

## 技术栈

- 前端框架：使用 Tailwind CSS 进行样式设计
- JavaScript：原生 JavaScript 处理交互逻辑
- 图标库：Font Awesome 提供图标支持
- Node.js：用于运行游戏页面生成脚本
- 数据存储：使用 CSV 格式存储游戏数据
- 自动化工具：Playwright 用于抓取游戏缩略图

## 开发指南

### 添加新游戏

1. 在 `data/games.csv` 中添加游戏数据，格式如下：

```csv
id,name,category,thumbnail,iframeUrl,description,playtime,plays
game-id,游戏名称,游戏类别,images/games/游戏名称 game.jpg,游戏URL,游戏描述,游戏时长,游戏次数
```

2. 将游戏缩略图添加到 `images/games/` 目录，命名格式为：`游戏名称 game.jpg`

3. 运行游戏更新脚本：

```bash
node scripts/update-games.js
```

4. 脚本会自动完成以下步骤：
   - 将 CSV 数据转换为 JSON 格式
   - 为每个游戏生成详情页面
   - 更新首页游戏列表

### 自动更新游戏数据

本项目支持自动监控CSV文件变化并更新网站内容。使用以下命令启动自动更新服务：

```bash
node scripts/watch-games.js
```

启动后，只需编辑 `data/games.csv` 文件并保存，网站内容将自动更新，无需手动运行更新脚本。系统会显示以下提示信息：

💡 提示: 修改CSV文件后，网站将自动更新

监控服务会自动执行以下操作：
1. 将CSV数据转换为JSON
2. 生成新游戏的详情页面
3. 更新主页上的游戏列表

按 Ctrl+C 可以停止监控服务。

### 自动抓取游戏缩略图

如果需要自动抓取 Gamezop 网站上的游戏缩略图，可以使用 `game_scraper` 工具：

1. 进入 `game_scraper` 目录
2. 按照 README.md 中的说明安装依赖:
   ```bash
   pip install -r requirements_selenium.txt
   python -m playwright install chromium
   ```
3. 运行以下命令开始抓取：
   ```bash
   python scraper_playwright.py
   ```

抓取的图片会自动保存到 `images/games/` 目录，可以直接用于游戏数据。

### 数据管理工作流程

项目采用了以下数据管理工作流程：

1. 所有游戏数据以 CSV 格式存储在 `data/games.csv` 文件中
2. 通过 `convert-csv-to-json.js` 脚本将 CSV 数据转换为 JSON 格式
3. 转换后的 JSON 数据存储在 `js/games.json` 文件中
4. `generate-game-pages.js` 脚本读取 JSON 数据，生成静态 HTML 页面
5. `update-homepage.js` 脚本更新首页上的游戏列表
6. `update-games.js` 脚本整合了上述步骤，一键完成从 CSV 到网页的更新
7. `watch-games.js` 脚本监控 CSV 文件变化，自动执行更新流程

这种工作流程的优点：
- CSV 格式便于编辑和维护
- 自动化转换减少人为错误
- 一键式更新提高工作效率
- 实时监控提供即时反馈

### 图片资源管理

- 所有游戏缩略图统一存放在 `images/games/` 目录下
- 图片命名格式为：`游戏名称 game.jpg`
- 图片路径在 `games.csv` 中使用相对路径：`images/games/游戏名称 game.jpg`
- 图片格式统一使用 JPG 格式，确保良好的加载性能
- 可以使用 `game_scraper` 工具自动抓取游戏缩略图

### 自定义游戏控制说明
在 `games.csv` 中，可以添加 `customControls` 字段来自定义游戏控制说明，否则系统会根据游戏类别自动生成默认控制说明。

### 修改页面样式
所有页面使用 Tailwind CSS 进行样式设计，可以通过修改 HTML 中的类名来调整样式。主题颜色在每个页面的 `tailwind.config` 中定义：

```javascript
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
```

## 页面说明
### 首页 (index.html)
首页展示游戏列表，包括最新游戏和所有游戏分类。用户可以通过导航栏搜索游戏或浏览不同类别的游戏。

### 游戏详情页 (game-detail.html)
游戏详情页面是一个通用模板，通过 URL 参数加载特定游戏的数据。页面包含：

- 游戏标题和面包屑导航
- 游戏 iframe 嵌入
- 游戏描述
- 游戏信息（类别、游戏时长、游戏次数等）
- 游戏操作说明
- 相关游戏推荐

## 最新更新

- 2025-06-15：新增游戏缩略图抓取工具，支持从 Gamezop 网站自动抓取游戏缩略图
- 2025-06-12：新增自动监控CSV文件变化功能，支持修改CSV文件后自动更新网站
- 2025-06-10：新增自动更新首页游戏列表功能，动态展示最新和推荐游戏
- 2025-06-05：新增自动化脚本 `update-games.js`，实现一键更新从CSV到网页的全流程
- 2025-06-05：新增CSV转JSON脚本 `convert-csv-to-json.js`，优化数据处理流程
- 2025-06-03：更新游戏缩略图路径格式，统一使用 `游戏名称 game.jpg` 的命名方式
- 2025-06-01：将游戏数据从 JSON 格式迁移到 CSV 格式，便于维护和更新
- 2025-05-28：优化图片资源管理，统一存放于 `images/games/` 目录

## 脚本工具

### watch-games.js
这个脚本用于监控 `data/games.csv` 文件的变化，当文件被修改时自动触发更新流程：
1. 显示用户友好的提示信息
2. 监听CSV文件的变化事件
3. 当检测到变化时，自动调用 `update-games.js` 脚本
4. 提供实时反馈，让用户知道更新是否成功

### update-games.js
这个脚本整合了数据转换和页面生成的流程，提供一键式更新功能：
1. 自动调用 `convert-csv-to-json.js` 将 CSV 数据转换为 JSON
2. 自动调用 `generate-game-pages.js` 生成游戏页面
3. 自动调用 `update-homepage.js` 更新首页游戏列表
4. 提供友好的命令行界面反馈
5. 错误处理和状态报告

### update-homepage.js
这个脚本负责更新首页上的游戏列表：
1. 读取 `js/games.json` 中的游戏数据
2. 选择最新添加的游戏和推荐游戏
3. 生成游戏卡片的 HTML 代码
4. 更新首页 HTML 文件中的游戏列表部分

### convert-csv-to-json.js
这个脚本负责将 `data/games.csv` 中的数据转换为 JSON 格式：
1. 读取 CSV 文件并解析数据
2. 处理格式不一致的情况
3. 过滤无效数据
4. 将处理后的数据保存到 `js/games.json`

### generate-game-pages.js
这个脚本读取 `js/games.json` 中的游戏数据，为每个游戏生成独立的 HTML 页面。脚本会：
1. 根据游戏类别生成默认的游戏控制说明
2. 生成随机的游戏时长和游戏次数（用于演示）
3. 生成相关游戏推荐
4. 创建完整的 HTML 页面并保存到 `games/` 目录

### generate-game-cards.js
这个脚本用于生成游戏卡片的 HTML 代码：
1. 读取 `js/games.json` 中的游戏数据
2. 根据指定的模板生成游戏卡片的 HTML 代码
3. 输出可以直接插入到页面中的 HTML 片段

### game_scraper
这个工具用于自动抓取 Gamezop 网站上的游戏缩略图：
1. 使用 Playwright 启动无头浏览器
2. 访问 Gamezop 网站并等待页面加载
3. 自动滚动页面以加载更多内容
4. 提取游戏卡片中的图片
5. 下载并保存图片到本地的 `images/games/` 目录

## 注意事项
1. 所有页面都使用响应式设计，适配不同屏幕尺寸。
2. 导航栏在滚动时会自动隐藏，提升用户体验。
3. 游戏详情页面的相关游戏区域会自动调整高度，与左侧内容保持一致。
4. 使用 `watch-games.js` 可以自动监控CSV文件变化并更新网站，无需手动运行更新脚本。
5. 如果未运行监控脚本，更新游戏数据后需要手动运行 `update-games.js` 以更新网页。
6. 使用游戏缩略图抓取工具时，请合理使用，避免频繁请求给源网站带来压力。

## 未来计划
1. 添加用户登录和注册功能
2. 实现游戏评分和评论系统
3. 添加游戏收藏功能
4. 优化游戏加载性能
5. 增加更多游戏分类和标签
6. 优化数据管理工作流程，添加数据验证功能
7. 实现游戏统计分析功能，追踪游戏受欢迎程度
8. 添加游戏推荐算法，根据用户喜好推荐游戏
9. 扩展游戏缩略图抓取工具，支持从更多游戏源网站抓取
10. 开发批量导入游戏数据功能，提高内容更新效率
