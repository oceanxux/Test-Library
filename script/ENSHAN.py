"""
cron: 2 50 9 ? * *
new Env('恩山论坛签到');
"""
import json
import os
import re
import requests
import urllib3

urllib3.disable_warnings()

try:
    import notify
except ImportError:
    print("错误：未找到 `notify.py` 文件，无法发送通知。")
    notify = None


def sign(cookie):
    msg = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.125 Safari/537.36",
        "Cookie": cookie,
    }
    response = requests.get(
        url="https://www.right.com.cn/FORUM/home.php?mod=spacecp&ac=credit&showcredit=1",
        headers=headers,
        verify=False,
    )
    try:
        coin = re.findall("恩山币: </em>(.*?)&nbsp;", response.text)[0]
        point = re.findall("<em>积分: </em>(.*?)<span", response.text)[0]
        msg = [
            {
                "name": "恩山币",
                "value": coin,
            },
            {
                "name": "积分",
                "value": point,
            },
        ]
    except Exception as e:
        msg = [
            {
                "name": "签到失败",
                "value": str(e),
            }
        ]
    return msg


def main():
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
