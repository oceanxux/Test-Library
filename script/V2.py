"""
new Env('V2EX 论坛签到');
cron: 2 50 14 * * *
"""

import requests
import os
import re
from notify import send

class V2ex:
    name = "V2EX 论坛签到"

    def __init__(self, check_item):
        self.check_item = check_item

    @staticmethod
    def sign(session, cookie, proxies=None):
        msg = []
        try:
            daily_mission_url = "https://www.v2ex.com/mission/daily"
            response = session.get(url=daily_mission_url, verify=True, cookies=cookie)
            response.raise_for_status()

            pattern = (
                r"<input type=\"button\" class=\"super normal button\""
                r" value=\".*?\" onclick=\"location\.href = \'(.*?)\';\" />"
            )
            urls = re.findall(pattern=pattern, string=response.text)
            url = urls[0] if urls else None

            if url is None:
                if "每日登录奖励已领取" not in response.text:
                    return "无法找到签到按钮，Cookie 可能过期或页面结构已更改"
            elif url != "/balance":
                headers = {"Referer": daily_mission_url}
                signin_response = session.get(
                    url="https://www.v2ex.com" + url,
                    verify=True,
                    headers=headers,
                    cookies=cookie,
                )
                signin_response.raise_for_status()
                
                response = session.get(url=daily_mission_url, verify=True, cookies=cookie)
                response.raise_for_status()
                if "每日登录奖励已领取" not in response.text:
                    return "签到失败，请检查 Cookie 或 V2EX 状态"

            balance_url = "https://www.v2ex.com/balance"
            response_balance = session.get(url=balance_url, verify=True, cookies=cookie)
            response_balance.raise_for_status()
            
            total = re.findall(
                pattern=r"<td class=\"d\" style=\"text-align: right;\">(\d+\.\d+)</td>",
                string=response_balance.text,
            )
            total = total[0] if total else "获取余额失败"
            
            today = re.findall(
                pattern=r'<td class="d"><span class="gray">(.*?)</span></td>',
                string=response_balance.text,
            )
            today = today[0] if today else "获取今日签到奖励失败"
            
            username = re.findall(
                pattern=r"<a href=\"/member/.*?\" class=\"top\">(.*?)</a>",
                string=response_balance.text,
            )
            username = username[0] if username else "用户名获取失败"
            
            msg.extend([
                {"name": "帐号信息", "value": username},
                {"name": "今日签到", "value": today},
                {"name": "帐号余额", "value": total},
            ])
            
            data = re.findall(
                pattern=r"已连续登录 (\d+) 天", string=response.text
            )
            data = f"{data[0]} 天" if data else "获取连续签到天数失败"
            msg.append({"name": "签到天数", "value": data})

        except requests.RequestException as e:
            return f"请求异常: {e}"
        except Exception as e:
            return f"发生错误: {e}"
        return msg

    def main(self):
        cookie_str = os.environ.get("V2EX_COOKIE")
        if not cookie_str:
            return "未设置 V2EX_COOKIE 环境变量，请检查是否已正确设置"
        cookie = {}
        for item in cookie_str.split(";"):
            key, value = item.strip().split("=", 1)
            cookie[key] = value

        session = requests.Session()
        session.headers.update(
            {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66",
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            }
        )
        
        # 代理设置 适合被阻断的地方
        # proxies = {
        #     "http": "http://192.168.31.188:7890",  # 代理地址
        #     "https": "http://192.168.31.188:7890"  # 代理地址
        # }

        msg = self.sign(session=session, cookie=cookie)
        msg_str = "\n".join([f"{one.get('name')}: {one.get('value')}" for one in msg]) if isinstance(msg, list) else msg
        print("V2EX签到结果:")
        print(msg_str)
        send('V2EX签到结果', msg_str)
        return msg_str

if __name__ == "__main__":
    print("----------V2EX 论坛开始尝试签到----------")
    V2ex(check_item={}).main()
    print("----------V2EX 论坛签到执行完毕----------")
