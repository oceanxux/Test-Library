"""
cron: 0 */5 * * * *
new Env('fuxiaoquan jiankong');
"""
import time
import os
import json
import notify
import requests
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
# ==================== PushPlus 推送配置 ====================
PUSHPLUS_TOKEN = "TOKEN"  # 

def pushplus_notify(title, content):
    """使用 PushPlus 发送通知（纯文本）"""
    if not PUSHPLUS_TOKEN:
        print("⚠️ 未设置 PushPlus TOKEN，跳过推送。")
        return

    url = "http://www.pushplus.plus/send"
    data = {
        "token": PUSHPLUS_TOKEN,
        "title": title,
        "content": content,
        "template": "txt"  
    }

    try:
        resp = requests.post(url, json=data, timeout=10)
        res = resp.json()
        if res.get("code") == 200:
            print("✅ PushPlus 推送成功")
        else:
            print("⚠️ PushPlus 推送失败:", res)
    except Exception as e:
        print("❌ PushPlus 推送异常:", e)

# ==================== 配置监控 ====================
DETAIL_PAGE_URL_TEMPLATE = ("https://dev.coc.10086.cn/coc3/canvas/rightsmarket-h5-canvas/online/detail?aid=10163&memberId=1026&ruleCode=C00020250509003R000&channelCode=P00000008211&paytype=1&pageRecorded=true&mid={mid}&tc={tc}&onetc={onetc}")

API_URL_TO_INTERCEPT = "https://dev.coc.10086.cn/coc3/coc3-market-activity/arrange/getProductByActivityId"

MONITOR_LIST = [
    {"name": "Alipay 15元⚡️费", "mid": "22373", "tc": "9732", "onetc": "2980"},
    {"name": "Wechat 20元⚡️费", "mid": "22559", "tc": "2990", "onetc": "9735"}
]

push_messages = []

# ==================== 核心功能 ====================
def check_stock(page, current_item):
    """使用 Playwright 访问页面并拦截API请求来检查库存"""
    url = DETAIL_PAGE_URL_TEMPLATE.format(
        mid=current_item['mid'], tc=current_item['tc'], onetc=current_item['onetc']
    )
    try:
        print(f"\n--- 正在检查: {current_item['name']} ---")
        stock = -1

        def handle_response(response):
            nonlocal stock
            if API_URL_TO_INTERCEPT in response.url and response.ok:
                try:
                    data = response.json()
                    all_goods = data.get('data', {}).get('list', [])
                    found = False
                    for good_info in all_goods:
                        if str(good_info.get('mid')) == current_item['mid']:
                            stock_text = good_info.get('availableNum', '-1')
                            stock = int(stock_text)
                            found = True
                            break
                    if not found and stock == -1:
                        print(f"❌ 在API返回的列表中未找到商品ID: {current_item['mid']}")
                except (json.JSONDecodeError, ValueError) as e:
                    print(f"解析拦截到的JSON时出错: {e}")
                    stock = -2

        page.on("response", handle_response)
        page.goto(url, wait_until='networkidle', timeout=30000)
        page.remove_listener("response", handle_response)

        # 只有库存大于0才推送
        if stock > 0:
            print(f"✅ 成功获取库存: {stock}，商品有货！")
            message = (
                f"🎉 {current_item['name']} 有货啦！\n\n"
                f"商品名称: {current_item['name']}\n"
                f"库存数量: {stock}\n"
                f"请尽快前往兑换！"
            )
            push_messages.append(message)
        elif stock == 0:
            print(f"库存为 0，不推送。")
        elif stock == -1:
            print("❌ 未能截获到或在返回数据中找到有效的库存信息。")
        elif stock == -2:
            print("❌ 截获到API请求，但解析JSON内容失败。")

    except PlaywrightTimeoutError:
        print("❌ 页面加载超时，请检查网络或目标网站是否可用。")
    except Exception as e:
        print(f"❌ 发生未知错误: {e}")
# ==================== 主程序 ====================
def main():
    is_ql_env = 'QL_DIR' in os.environ or 'DEBIAN_FRONTEND' in os.environ
    with sync_playwright() as p:
        browser_args = ['--no-sandbox'] if is_ql_env else []
        try:
            browser = p.chromium.launch(headless=True, args=browser_args)
        except Exception as e:
            print(f"""❌ 启动浏览器失败: {e}
🤔 可能是 Playwright 浏览器驱动未安装。
请尝试在终端运行 `playwright install`。""")
            return

        user_agent = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/13.0 MQQBrowser/10.1.1 Mobile/15B87 Safari/604.1 QBWebViewUA/2 QBWebViewType/1 WKType/1"
        page = browser.new_page(user_agent=user_agent)

        for item in MONITOR_LIST:
            check_stock(page, item)
            time.sleep(2)

        browser.close()

    # ==================== 统一推送 ====================
    if push_messages:
        final_content = "\n\n".join(push_messages)
        title = f"🎉 共 {len(push_messages)} 个商品有货"
        pushplus_notify(title, final_content)
#        notify.send(title, final_content)
        print("✅ 推送完成")
    else:
        print("🚫 本次监控没有商品有货，不发送推送。")

if __name__ == "__main__":
    main()
