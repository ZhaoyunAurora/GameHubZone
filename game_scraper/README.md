# Gamezop 游戏缩略图抓取工具

这个工具可以帮助你从 Gamezop 网站抓取游戏缩略图。由于 Gamezop 网站使用了大量的 JavaScript 动态加载内容，我们使用 Playwright 来实现自动化抓取。

## 安装依赖

在使用这个工具前，你需要先安装所需的 Python 依赖库：

```bash
pip install -r requirements_selenium.txt
```

然后安装 Playwright 所需的浏览器：

```bash
python -m playwright install chromium
```

## 使用方法

运行以下命令开始抓取：

```bash
python scraper_playwright.py
```

## 工作原理

这个脚本使用 Playwright 来：
1. 启动一个无头浏览器（Chromium）
2. 访问 Gamezop 网站
3. 等待页面加载完成
4. 自动滚动页面以加载更多内容
5. 提取游戏卡片中的图片
6. 下载并保存图片到本地

## 主要特点

- 使用 Playwright 实现浏览器自动化
- 支持动态加载的内容
- 自动处理等待和滚动
- 智能提取游戏信息
- 自动保存图片到指定目录

## 注意事项

- 抓取的图片会保存在 `images/games` 文件夹中
- 如果网站结构发生变化，脚本可能需要更新
- 请合理使用，避免频繁请求给网站带来压力
- 尊重网站的版权和使用条款
- 仅用于学习和个人用途，不要用于商业用途

## 故障排除

如果遇到问题，请尝试以下方法：

1. 确保你的网络连接正常
2. 确保已正确安装所有依赖
3. 尝试增加等待时间（在代码中调整 `page.wait_for_timeout()` 的值）
4. 检查是否有新版本的 Playwright 可用
5. 确保 Python 版本兼容（建议使用 Python 3.8+）

## 系统要求

- Python 3.8 或更高版本
- 稳定的网络连接
- 足够的磁盘空间用于保存图片

## 如何调整选择器

如果脚本无法正确找到游戏卡片或图片，你可能需要调整 CSS 选择器。你可以：

1. 打开浏览器的开发者工具 (F12)
2. 检查游戏卡片元素的 HTML 结构
3. 更新脚本中的 CSS 选择器以匹配网站的实际结构

## 故障排除

如果遇到问题，请尝试以下方法：

1. 确保你的网络连接正常
2. 更新脚本中的 User-Agent
3. 增加等待时间，以便页面完全加载
4. 如果使用 Selenium 方法，确保 ChromeDriver 版本与 Chrome 浏览器版本匹配 