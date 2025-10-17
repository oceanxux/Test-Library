#拉库命令

```markdown
ql repo https://github.com/oceanxux/Test-Library.git "script/*" "" "" main
````

名称：Test-Library
类型：公开仓库
链接：https://github.com/oceanxux/Test-Library.git
分支：main
定时更新：0 0 * * *      # 每天 0 点自动拉取更新
白名单：script/*





变量名称: MAOTAI_CONFIG
格式为（如图）：省份,城市,经度,维度,设备id,token,MT-Token-Wap



配置获取: http://api.vus.tax/
app获取验证码，到这里获取配置即可，替换省和市，然后在省市后面后面加上经纬度，经纬度可以在这里获取自己位置的：获取经纬度
