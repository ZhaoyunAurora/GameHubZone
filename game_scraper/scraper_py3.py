#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup
import os
import re
import time
import json
import ssl
import sys
from urllib.parse import urljoin

# 忽略SSL警告
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 创建保存图片的文件夹
if not os.path.exists('images'):
    os.makedirs('images')

def get_url_content(url):
    """获取URL内容"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15, verify=False)
        response.raise_for_status()  # 如果状态码不是200，抛出异常
        return response.content
    except Exception as e:
        print(f"获取URL内容失败: {e}")
        return None

def save_image(img_url, filename):
    """保存图片到文件"""
    try:
        if not img_url:
            return False
            
        # 处理相对URL
        if img_url.startswith('//'):
            img_url = 'https:' + img_url
        elif not img_url.startswith(('http://', 'https://')):
            img_url = urljoin('https://business.gamezop.com', img_url)
            
        print(f"正在下载: {img_url}")
        
        # 下载图片
        response = requests.get(img_url, timeout=15, verify=False)
        response.raise_for_status()
        
        # 保存图片
        with open(filename, 'wb') as f:
            f.write(response.content)
            
        print(f"已保存为: {filename}")
        return True
    except Exception as e:
        print(f"保存图片失败: {e}")
        return False

def clean_filename(name):
    """清理文件名，移除不合法字符"""
    # 替换不允许在文件名中使用的字符
    return ''.join(c if c.isalnum() or c in ' -_' else '_' for c in name)

def extract_json_data(text):
    """尝试从文本中提取JSON数据"""
    # 常见的JavaScript变量模式
    js_patterns = [
        r'var\s+gamesList\s*=\s*(\[.+?\]);',
        r'var\s+games\s*=\s*(\[.+?\]);',
        r'window\.gamesList\s*=\s*(\[.+?\]);',
        r'window\.games\s*=\s*(\[.+?\]);',
        r'"games"\s*:\s*(\[.+?\])',
        r'games:\s*(\[.+?\])',
    ]
    
    for pattern in js_patterns:
        try:
            matches = re.findall(pattern, text, re.DOTALL)
            if matches:
                js_data = matches[0]
                # 尝试修复常见的JSON格式问题
                js_data = js_data.replace("'", '"')
                js_data = re.sub(r'(\w+):', r'"\1":', js_data)  # 将属性名称加上引号
                # 尝试解析JSON
                return json.loads(js_data)
        except:
            continue
    
    return None

def scrape_gamezop():
    """抓取Gamezop网站的游戏缩略图"""
    url = 'https://business.gamezop.com/html5-games'
    print(f"正在获取网页内容: {url}")
    
    try:
        html_content = get_url_content(url)
        if not html_content:
            return
            
        # 使用BeautifulSoup解析HTML
        soup = BeautifulSoup(html_content, 'html.parser')
        img_count = 0
        
        # 方法1: 使用BeautifulSoup查找所有图片
        img_tags = soup.find_all('img')
        print(f"使用BeautifulSoup找到 {len(img_tags)} 个图片标签")
        
        for i, img in enumerate(img_tags):
            img_url = img.get('src')
            if not img_url:
                continue
                
            # 尝试获取alt属性作为名称
            name = img.get('alt') or f"game_bs_{i}"
            name = clean_filename(name)
            
            # 获取图片扩展名
            ext = os.path.splitext(img_url)[1]
            if not ext or len(ext) > 5:
                ext = '.jpg'
                
            filename = f"images/{name}{ext}"
            if save_image(img_url, filename):
                img_count += 1
            time.sleep(0.5)  # 避免请求过快
        
        # 方法2: 查找所有游戏卡片
        game_cards = soup.select('.game-card, .game-item, [data-game-id], .MuiCard-root')
        if game_cards:
            print(f"找到 {len(game_cards)} 个游戏卡片")
            
            for i, card in enumerate(game_cards):
                # 尝试找到游戏名称
                name_elem = card.select_one('.game-title, .title, h3, h4')
                name = name_elem.text.strip() if name_elem else f"game_card_{i}"
                name = clean_filename(name)
                
                # 尝试找到图片
                img = card.find('img')
                if img and img.get('src'):
                    img_url = img['src']
                    ext = os.path.splitext(img_url)[1]
                    if not ext or len(ext) > 5:
                        ext = '.jpg'
                    
                    filename = f"images/{name}{ext}"
                    if save_image(img_url, filename):
                        img_count += 1
                    time.sleep(0.5)
        
        # 方法3: 从JavaScript中提取数据
        html_text = html_content.decode('utf-8', errors='ignore')
        games_data = extract_json_data(html_text)
        
        if games_data:
            print(f"从JavaScript数据中找到 {len(games_data)} 条记录")
            
            for i, game in enumerate(games_data):
                if not isinstance(game, dict):
                    continue
                    
                # 查找可能的图片URL字段
                img_field = next((f for f in ['thumbnail', 'image', 'imgUrl', 'icon', 'coverImage'] 
                                 if f in game and game[f]), None)
                                 
                if img_field:
                    img_url = game[img_field]
                    name = game.get('name', f"game_js_{i}")
                    name = clean_filename(name)
                    
                    ext = os.path.splitext(img_url)[1]
                    if not ext or len(ext) > 5:
                        ext = '.jpg'
                    
                    filename = f"images/{name}{ext}"
                    if save_image(img_url, filename):
                        img_count += 1
                    time.sleep(0.5)
        
        # 结果统计
        if img_count == 0:
            print("未能找到任何图片! 网站可能使用了高级的JavaScript技术来动态加载内容。")
            print("你可能需要尝试使用Selenium来模拟浏览器行为。")
        else:
            print(f"总共下载了 {img_count} 张图片!")
            
    except Exception as e:
        print(f"抓取过程中出错: {e}")

if __name__ == "__main__":
    print("开始抓取Gamezop网站游戏缩略图...")
    scrape_gamezop()
    print("抓取完成！") 