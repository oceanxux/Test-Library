# -- coding: utf-8 --
"""
new Env('ns论坛签到');
cron: 21 25 11 * * *
"""

import os
import time
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from curl_cffi import requests
import json
import re

# 尝试导入青龙通知模块
try:
    from notify import send
except ImportError:
    print("通知模块加载失败，请检查环境")
    def send(title, content):
        print(f"通知标题: {title}")
        print(f"通知内容: {content}")

def sign(ns_cookie, ns_random):
    """签到函数"""
    if not ns_cookie:
        return "invalid", "Cookie无效或为空"
        
    headers = {
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0",
        'origin': "https://www.nodeseek.com",
        'referer': "https://www.nodeseek.com/board",
        'Content-Type': 'application/json',
        'Cookie': ns_cookie
    }
    try:
        url = f"https://www.nodeseek.com/api/attendance?random={ns_random}"
        response = requests.post(url, headers=headers, impersonate="chrome110")
        data = response.json()
        msg = data.get("message", "")
        if "鸡腿" in msg or data.get("success"):
            return "success", msg
        elif "已完成签到" in msg:
            return "already", msg
        elif data.get("status") == 404:
            return "invalid", "Cookie已失效"
        return "fail", msg
    except Exception as e:
        return "error", str(e)

def get_signin_stats(ns_cookie, days=30):
    """查询签到收益统计"""
    if not ns_cookie:
        return None, "Cookie无效或为空"
    
    headers = {
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0",
        'origin': "https://www.nodeseek.com",
        'referer': "https://www.nodeseek.com/board",
        'Cookie': ns_cookie
    }
    
    try:
        shanghai_tz = ZoneInfo("Asia/Shanghai")
        now_shanghai = datetime.now(shanghai_tz)
        query_start_time = now_shanghai - timedelta(days=days)
        
        all_records = []
        page = 1
        
        while page <= 20:
            url = f"https://www.nodeseek.com/api/account/credit/page-{page}"
            response = requests.get(url, headers=headers, impersonate="chrome110")
            data = response.json()
            
            if not data.get("success") or not data.get("data"):
                break
                
            records = data.get("data", [])
            if not records:
                break
                
            last_record_time = datetime.fromisoformat(records[-1][3].replace('Z', '+00:00')).astimezone(shanghai_tz)
            if last_record_time < query_start_time:
                for record in records:
                    record_time = datetime.fromisoformat(record[3].replace('Z', '+00:00')).astimezone(shanghai_tz)
                    if record_time >= query_start_time:
                        all_records.append(record)
                break
            else:
                all_records.extend(records)
                
            page += 1
            time.sleep(0.5)
        
        signin_records = []
        for amount, _, description, timestamp in all_records:
            record_time_shanghai = datetime.fromisoformat(timestamp.replace('Z', '+00:00')).astimezone(shanghai_tz)
            if record_time_shanghai >= query_start_time and "签到收益" in description and "鸡腿" in description:
                signin_records.append({
                    'amount': amount,
                    'date': record_time_shanghai.strftime('%Y-%m-%d'),
                    'description': description
                })
        
        period_desc = f"近{days}天" if days != 1 else "今天"
        
        if not signin_records:
            return {'total_amount': 0, 'average': 0, 'days_count': 0, 'period': period_desc}, f"未找到{period_desc}的签到记录"
        
        total_amount = sum(r['amount'] for r in signin_records)
        days_count = len(signin_records)
        average = round(total_amount / days_count, 2) if days_count > 0 else 0
        
        return {'total_amount': total_amount, 'average': average, 'days_count': days_count, 'period': period_desc}, "查询成功"
        
    except Exception as e:
        return None, f"查询异常: {str(e)}"

if __name__ == "__main__":
    ns_cookie_str = os.getenv("NS_COOKIE")
    ns_random = os.getenv("NS_RANDOM", "true")

    if not ns_cookie_str:
        print("错误: 环境变量 NS_COOKIE 未设置")
        send("NodeSeek 签到失败", "环境变量 NS_COOKIE 未设置，请检查青龙面板配置")
    else:
        # 支持使用 &、换行符或 && 分隔多个Cookie
        cookies = re.split(r'&|\n|&&', ns_cookie_str)
        cookies = [c.strip() for c in cookies if c.strip()]
        
        print(f"检测到 {len(cookies)} 个Cookie")
        
        for i, cookie in enumerate(cookies):
            account_name = f"账号{i+1}"
            print(f"\n==== 正在处理 {account_name} ====")
            
            result, msg = sign(cookie, ns_random)
            
            notification_title = f"NodeSeek {account_name} 签到"
            notification_content = ""

            if result in ["success", "already"]:
                print(f"{account_name} 签到成功: {msg}")
                notification_content = f"签到结果: {msg}"
                
                stats, stats_msg = get_signin_stats(cookie, 30)
                if stats:
                    stats_str = (f"{stats['period']}已签到 {stats['days_count']} 天，"
                                 f"共获得 {stats['total_amount']} 个鸡腿，"
                                 f"平均 {stats['average']} 个/天")
                    print(stats_str)
                    notification_content += f"\n统计: {stats_str}"
                else:
                    print(f"统计查询失败: {stats_msg}")
                    notification_content += f"\n统计查询失败: {stats_msg}"
            else:
                print(f"{account_name} 签到失败: {msg}")
                notification_content = f"签到失败: {msg}"

            send(notification_title, notification_content)
