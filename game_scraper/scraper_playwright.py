#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import asyncio
from playwright.async_api import async_playwright
import os
import requests
import re
import json
from urllib.parse import urljoin
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 创建保存图片的文件夹
if not os.path.exists('images/games'):
    os.makedirs('images/games')

# 请求头，模拟浏览器访问
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
}

def save_image(img_url, filename):
    """下载并保存图片"""
    try:
        if not img_url:
            print(f"图片URL为空")
            return False
            
        # 处理相对URL和数据URL
        if img_url.startswith('data:'):
            print(f"跳过数据URL图片")
            return False
        elif img_url.startswith('//'):
            img_url = 'https:' + img_url
        elif not img_url.startswith(('http://', 'https://')):
            img_url = urljoin('https://business.gamezop.com', img_url)

        print(f"正在下载: {img_url}")
        
        # 下载图片
        response = requests.get(img_url, headers=headers, timeout=15, verify=False)
        response.raise_for_status()
        
        # 保存图片
        with open(filename, 'wb') as f:
            f.write(response.content)
            
        print(f"已保存为: {filename}")
        return True
    except Exception as e:
        print(f"下载图片失败 {img_url}: {e}")
        return False

def clean_filename(name):
    """清理文件名，移除不合法字符"""
    # 替换不允许在文件名中使用的字符
    return ''.join(c if c.isalnum() or c in ' -_' else '_' for c in name)

async def scrape_games():
    """使用Playwright抓取Gamezop网站的游戏缩略图"""
    async with async_playwright() as p:
        # 启动浏览器
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print("正在访问网站...")
        await page.goto('https://business.gamezop.com/html5-games')
        
        # 等待页面加载
        print("等待页面加载...")
        await page.wait_for_load_state('networkidle')
        
        # 滚动页面以加载更多内容
        print("滚动页面加载更多内容...")
        for _ in range(5):
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
            await page.wait_for_timeout(1000)
        
        img_count = 0
        
        # 查找游戏卡片
        print("查找游戏卡片...")
        card_selectors = [
            ".MuiCard-root", 
            ".game-card", 
            ".game-item",
            "[data-game-id]",
            ".games-list-item"
        ]
        
        cards = []
        for selector in card_selectors:
            cards = await page.query_selector_all(selector)
            if cards:
                print(f"使用选择器 '{selector}' 找到 {len(cards)} 个游戏卡片")
                break
        
        # 处理游戏卡片
        if cards:
            for i, card in enumerate(cards):
                try:
                    # 获取游戏名称
                    name = None
                    for name_selector in ['.game-title', '.title', 'h3', 'h4', 'p']:
                        name_elem = await card.query_selector(name_selector)
                        if name_elem:
                            name = await name_elem.text_content()
                            name = name.strip()
                            if name:
                                break
                    
                    if not name:
                        name = f"game_card_{i}"
                    
                    name = clean_filename(name)
                    
                    # 查找图片
                    img = await card.query_selector('img')
                    if img:
                        img_url = await img.get_attribute('src')
                        if img_url:
                            filename = f"images/games/{name}.jpg"
                            if save_image(img_url, filename):
                                img_count += 1
                    else:
                        # 尝试获取背景图片
                        style = await card.get_attribute('style')
                        if style and 'background-image' in style:
                            bg_match = re.search(r'url\(["\']?(.*?)["\']?\)', style)
                            if bg_match:
                                img_url = bg_match.group(1)
                                filename = f"images/games/{name}.jpg"
                                if save_image(img_url, filename):
                                    img_count += 1
                except Exception as e:
                    print(f"处理游戏卡片时出错: {e}")
        
        # 如果没有找到游戏卡片，尝试获取所有图片
        if img_count == 0:
            print("尝试获取所有图片...")
            images = await page.query_selector_all('img')
            
            for i, img in enumerate(images):
                try:
                    img_url = await img.get_attribute('src')
                    if not img_url or img_url.startswith('data:'):
                        continue
                    
                    # 检查图片大小
                    width = await img.get_attribute('width')
                    height = await img.get_attribute('height')
                    
                    # 如果获取不到尺寸属性，尝试从style中获取
                    if (not width or not height):
                        style = await img.get_attribute('style')
                        if style:
                            width_match = re.search(r'width:\s*(\d+)px', style)
                            height_match = re.search(r'height:\s*(\d+)px', style)
                            width = width_match.group(1) if width_match else None
                            height = height_match.group(1) if height_match else None
                    
                    # 只保存较大的图片
                    if width and height and int(width) > 80 and int(height) > 80:
                        name = await img.get_attribute('alt') or f"game_img_{i}"
                        name = clean_filename(name)
                        filename = f"images/games/{name}.jpg"
                        if save_image(img_url, filename):
                            img_count += 1
                except Exception as e:
                    print(f"处理图片时出错: {e}")
        
        # 尝试从JavaScript中提取数据
        print("尝试从JavaScript提取游戏数据...")
        try:
            js_data = await page.evaluate("""() => {
                const data = {};
                if (window.gamesList) data.gamesList = window.gamesList;
                if (window.games) data.games = window.games;
                if (window.appData?.games) data.appGames = window.appData.games;
                return data;
            }""")
            
            if js_data:
                games = []
                if 'gamesList' in js_data:
                    games = js_data['gamesList']
                elif 'games' in js_data:
                    games = js_data['games']
                elif 'appGames' in js_data:
                    games = js_data['appGames']
                
                if games:
                    print(f"从JavaScript中找到 {len(games)} 个游戏数据")
                    for i, game in enumerate(games):
                        if isinstance(game, dict):
                            img_field = next((f for f in ['thumbnail', 'image', 'imgUrl', 'icon', 'coverImage']
                                            if f in game and game[f]), None)
                            if img_field:
                                img_url = game[img_field]
                                name = game.get('name', f"game_js_{i}")
                                name = clean_filename(name)
                                filename = f"images/games/{name}.jpg"
                                if save_image(img_url, filename):
                                    img_count += 1
        except Exception as e:
            print(f"从JavaScript提取数据时出错: {e}")
        
        # 尝试获取Next.js数据
        print("尝试获取Next.js数据...")
        try:
            next_data = await page.query_selector('#__NEXT_DATA__')
            if next_data:
                json_str = await next_data.text_content()
                data = json.loads(json_str)
                
                def search_games(obj):
                    if isinstance(obj, dict):
                        for key, value in obj.items():
                            if key in ['games', 'gamesList', 'topGames'] and isinstance(value, list):
                                return value
                            result = search_games(value)
                            if result:
                                return result
                    elif isinstance(obj, list):
                        for item in obj:
                            result = search_games(item)
                            if result:
                                return result
                    return None
                
                games_data = search_games(data)
                if games_data:
                    print(f"从Next.js数据中找到 {len(games_data)} 个游戏")
                    for i, game in enumerate(games_data):
                        if isinstance(game, dict):
                            img_field = next((f for f in ['thumbnail', 'image', 'imgUrl', 'icon', 'coverImage']
                                            if f in game and game[f]), None)
                            if img_field:
                                img_url = game[img_field]
                                name = game.get('name', f"game_next_{i}")
                                name = clean_filename(name)
                                filename = f"images/games/{name}.jpg"
                                if save_image(img_url, filename):
                                    img_count += 1
        except Exception as e:
            print(f"获取Next.js数据时出错: {e}")
        
        # 结果统计
        if img_count > 0:
            print(f"总共下载了 {img_count} 张游戏图片!")
        else:
            print("未能找到任何游戏图片! 网站结构可能发生了变化。")
        
        # 关闭浏览器
        await browser.close()
        print("浏览器已关闭")

async def main():
    print("开始抓取Gamezop网站游戏缩略图...")
    await scrape_games()
    print("抓取完成！")

if __name__ == "__main__":
    asyncio.run(main()) 