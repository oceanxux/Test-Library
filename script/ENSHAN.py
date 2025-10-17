"""
cron: 5 30 15 * * *
new Env('ENSHAN签到');
"""
import json
import os
import re
import requests
import time
import tempfile
from pathlib import Path
import urllib3

urllib3.disable_warnings()

try:
    import notify
except ImportError:
    print("错误：未找到 `notify.py` 文件，无法发送通知。")
    notify = None


def sign(cookie):
    msg = []
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
        "Cookie": cookie,
    })

    total_credit = "未知"
    try:
        # Get total credits from the main page
        home_url = "https://www.right.com.cn/forum/"
        home_res = session.get(home_url, verify=False)
        home_res.raise_for_status()
        credit_match = re.search(r'id="extcreditmenu".*?>积分: (\d+)<', home_res.text)
        if credit_match:
            total_credit = credit_match.group(1)
    except Exception as e:
        print(f"获取总积分失败: {e}")
        total_credit = "获取失败"

    try:
        page_url = "https://www.right.com.cn/forum/erling_qd-sign_in.html"
        page_res = session.get(page_url, verify=False)
        page_res.raise_for_status()

        # Helper function to parse details from HTML
        def get_details(html_text):
            user_match = re.search(r'<span class="erqd-nickname">(.+?)</span>', html_text)
            points_match = re.search(r'今日积分：<span class="erqd-current-point">(\d+)</span>', html_text)
            days_match = re.search(r'连续签到：<span class="erqd-continuous-days">(\d+)</span> 天', html_text)
            user = user_match.group(1) if user_match else "未知"
            points = points_match.group(1) if points_match else "未知"
            days = days_match.group(1) if days_match else "未知"
            return user, points, days

        if 'id="signin-btn" class="erqd-checkin-btn erqd-checkin-btn2" disabled>已签到</button>' in page_res.text:
            username, points_today, continuous_days = get_details(page_res.text)
            msg = [
                {"name": "账户名称", "value": username},
                {"name": "签到结果", "value": "今天已经签到过了"},
                {"name": "今日积分", "value": points_today},
                {"name": "连续签到", "value": f"{continuous_days} 天"},
                {"name": "总积分", "value": total_credit}
            ]
            return msg

        formhash_match = re.search(r"var FORMHASH = '(\w+)'", page_res.text)
        if not formhash_match:
            return [{"name": "签到失败", "value": "无法获取formhash，页面结构可能已更新"}]
        
        formhash = formhash_match.group(1)
        
        sign_url = "https://www.right.com.cn/forum/plugin.php?id=erling_qd:action&action=sign"
        post_data = {'formhash': formhash}
        session.headers.update({
            "Referer": page_url,
            "X-Requested-With": "XMLHttpRequest",
        })
        
        sign_res = session.post(sign_url, data=post_data, verify=False)
        sign_res.raise_for_status()
        
        print("签到接口返回内容:", sign_res.text)
        data = sign_res.json()

        if data.get("success"):
            # Reload the page to get updated info after signing in
            page_res_after_signin = session.get(page_url, verify=False)
            username, points_today, continuous_days = get_details(page_res_after_signin.text)
            msg = [
                {"name": "账户名称", "value": username},
                {"name": "签到结果", "value": data.get("message", "成功")},
                {"name": "今日积分", "value": points_today},
                {"name": "连续签到", "value": f"{continuous_days} 天"},
                {"name": "总积分", "value": total_credit}
            ]
        else:
             msg = [{"name": "签到失败", "value": data.get("message", "未知错误")}]

    except requests.exceptions.RequestException as e:
        msg = [{"name": "网络请求异常", "value": str(e)}]
    except Exception as e:
        msg = [{"name": "签到处理异常", "value": str(e)}]
        
    return msg


def main():
    lock_file = Path(tempfile.gettempdir()) / "enshan_signin.lock"
    lock_timeout = 60  # seconds

    if lock_file.exists():
        try:
            last_run_time = float(lock_file.read_text())
            if time.time() - last_run_time < lock_timeout:
                print("脚本在短时间内被重复执行，已跳过本次运行。")
                return
        except (ValueError, IOError):
            pass

    try:
        lock_file.write_text(str(time.time()))
    except IOError:
        print("警告：无法写入锁定文件。")
        pass
        
    cookie = os.environ.get("ENSHAN_COOKIE")
    if not cookie:
        print("请设置环境变量 ENSHAN_COOKIE")
        return

    result = sign(cookie=cookie)
    message = "\n".join([f"{one.get('name')}: {one.get('value')}" for one in result])
    print(message)
    if notify:
        notify.send("恩山论坛签到通知", message)


if __name__ == "__main__":
    main()
