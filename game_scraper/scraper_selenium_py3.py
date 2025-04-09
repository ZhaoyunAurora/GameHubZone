#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
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

def setup_driver():
    """设置Selenium WebDriver"""
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # 无界面模式
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument(f"user-agent={headers['User-Agent']}")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        print(f"设置WebDriver时出错: {e}")
        print("\n请确保已安装Chrome浏览器和对应版本的ChromeDriver")
        return None

def scrape_with_selenium():
    """使用Selenium抓取Gamezop网站的游戏缩略图"""
    url = 'https://business.gamezop.com/html5-games'
    print(f"正在使用Selenium获取 {url} 的内容...")
    
    driver = setup_driver()
    if not driver:
        return
    
    try:
        # 访问网页
        driver.get(url)
        
        # 等待页面加载
        print("等待页面加载...")
        time.sleep(5)  # 等待页面初始加载
        
        # 滚动页面以加载更多内容
        print("滚动页面加载更多内容...")
        last_height = driver.execute_script("return document.body.scrollHeight")
        
        for _ in range(5):  # 滚动几次以确保内容加载
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height
        
        img_count = 0
        
        # 先尝试查找游戏卡片
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
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    print(f"使用选择器 '{selector}' 找到 {len(elements)} 个游戏卡片")
                    cards = elements
                    break
            except:
                continue
        
        # 如果找到了游戏卡片
        if cards:
            for i, card in enumerate(cards):
                try:
                    # 尝试获取游戏名称
                    name = None
                    for name_selector in ['.game-title', '.title', 'h3', 'h4', 'p']:
                        try:
                            name_elem = card.find_element(By.CSS_SELECTOR, name_selector)
                            name = name_elem.text.strip()
                            if name:
                                break
                        except:
                            continue
                    
                    if not name:
                        name = f"game_card_{i}"
                    
                    name = clean_filename(name)
                    
                    # 查找图片元素
                    img_elem = None
                    try:
                        img_elem = card.find_element(By.TAG_NAME, 'img')
                    except:
                        pass
                    
                    if img_elem:
                        img_url = img_elem.get_attribute('src')
                        if img_url:
                            filename = f"images/games/{name}.jpg"
                            save_image(img_url, filename)
                            img_count += 1
                    else:
                        # 尝试获取背景图片
                        try:
                            style = card.get_attribute('style')
                            if style and 'background-image' in style:
                                # 提取背景图片URL
                                bg_match = re.search(r'url\(["\']?(.*?)["\']?\)', style)
                                if bg_match:
                                    img_url = bg_match.group(1)
                                    filename = f"images/games/{name}.jpg"
                                    save_image(img_url, filename)
                                    img_count += 1
                        except:
                            pass
                except Exception as e:
                    print(f"处理游戏卡片时出错: {e}")
        
        # 如果没有找到游戏卡片或没有找到图片，尝试从页面上所有图片中查找
        if img_count == 0:
            print("尝试获取所有图片...")
            img_elements = driver.find_elements(By.TAG_NAME, 'img')
            
            for i, img in enumerate(img_elements):
                try:
                    img_url = img.get_attribute('src')
                    if not img_url or img_url.startswith('data:'):
                        continue
                    
                    # 检查图片大小，过滤掉小图标
                    width = img.get_attribute('width')
                    height = img.get_attribute('height')
                    
                    # 如果获取不到尺寸属性，尝试从style中获取
                    if (not width or not height) and img.get_attribute('style'):
                        style = img.get_attribute('style')
                        width_match = re.search(r'width:\s*(\d+)px', style)
                        height_match = re.search(r'height:\s*(\d+)px', style)
                        
                        if width_match:
                            width = width_match.group(1)
                        if height_match:
                            height = height_match.group(1)
                    
                    # 尽量只保存尺寸较大的图片（可能是游戏缩略图）
                    if width and height and int(width) > 80 and int(height) > 80:
                        # 尝试获取alt属性作为名称
                        name = img.get_attribute('alt') or f"game_img_{i}"
                        name = clean_filename(name)
                        
                        filename = f"images/games/{name}.jpg"
                        if save_image(img_url, filename):
                            img_count += 1
                except Exception as e:
                    print(f"处理图片时出错: {e}")
        
        # 尝试从JavaScript中提取数据
        print("尝试从JavaScript提取游戏数据...")
        try:
            # 执行JavaScript获取窗口变量
            js_variables = driver.execute_script("""
                var data = {};
                // 尝试获取可能的游戏数据变量
                if (window.gamesList) data.gamesList = window.gamesList;
                if (window.games) data.games = window.games;
                if (window.appData && window.appData.games) data.appGames = window.appData.games;
                
                // 查找所有脚本标签中可能包含的游戏数据
                var scriptTags = document.getElementsByTagName('script');
                var gameData = null;
                for (var i = 0; i < scriptTags.length; i++) {
                    var content = scriptTags[i].textContent;
                    if (content && (content.includes('"games":') || content.includes('gamesList ='))) {
                        data.scriptContent = content;
                        break;
                    }
                }
                
                return data;
            """)
            
            if js_variables:
                games = []
                
                # 处理直接找到的游戏数据
                if 'gamesList' in js_variables:
                    games = js_variables['gamesList']
                elif 'games' in js_variables:
                    games = js_variables['games']
                elif 'appGames' in js_variables:
                    games = js_variables['appGames']
                elif 'scriptContent' in js_variables:
                    # 处理脚本内容中的游戏数据
                    script_content = js_variables['scriptContent']
                    pattern = r'"games"\s*:\s*(\[.*?\])'
                    matches = re.search(pattern, script_content, re.DOTALL)
                    if matches:
                        try:
                            js_data = matches.group(1)
                            games = json.loads(js_data)
                        except:
                            print("解析脚本中的游戏数据失败")
                
                if games:
                    print(f"从JavaScript中找到 {len(games)} 个游戏数据")
                    
                    for i, game in enumerate(games):
                        if isinstance(game, dict):
                            # 查找可能的图片URL字段
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
        
        # 尝试直接提取网页中的内联JSON数据（Next.js应用常用方式）
        print("尝试提取内联JSON数据...")
        try:
            inline_scripts = driver.find_elements(By.CSS_SELECTOR, 'script[id^="__NEXT_DATA__"]')
            if inline_scripts:
                for script in inline_scripts:
                    try:
                        json_data = json.loads(script.get_attribute('innerHTML'))
                        # 遍历JSON树寻找游戏数据
                        def search_games(obj, path=""):
                            if isinstance(obj, dict):
                                for key, value in obj.items():
                                    if key in ['games', 'gamesList', 'topGames'] and isinstance(value, list):
                                        return value
                                    result = search_games(value, f"{path}.{key}")
                                    if result:
                                        return result
                            elif isinstance(obj, list) and len(obj) > 0:
                                for i, item in enumerate(obj):
                                    result = search_games(item, f"{path}[{i}]")
                                    if result:
                                        return result
                            return None
                        
                        games_data = search_games(json_data)
                        if games_data:
                            print(f"从内联JSON中找到 {len(games_data)} 个游戏数据")
                            
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
                        print(f"解析内联脚本时出错: {e}")
        except Exception as e:
            print(f"提取内联JSON数据时出错: {e}")
        
        # 结果统计
        if img_count > 0:
            print(f"总共下载了 {img_count} 张游戏图片!")
        else:
            print("未能找到任何游戏图片! 网站结构可能发生了变化。")
            
    except Exception as e:
        print(f"使用Selenium抓取时出错: {e}")
    
    finally:
        # 关闭浏览器
        driver.quit()
        print("浏览器已关闭")

if __name__ == "__main__":
    print("开始使用Selenium抓取Gamezop网站游戏缩略图...")
    scrape_with_selenium()
    print("抓取完成！") 