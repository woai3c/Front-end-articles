# 阿里云服务器部署个人网站(nodejs + mongodb)
* [项目在线预览](http://118.190.217.8:3389/index)
* [项目 github 地址](https://github.com/woai3c/node-blog)

1. 购买阿里云服务器，选择操作系统，我选的 ubuntu
2. 在云服务器管理控制台选择实例->更多->密钥->重置实例密码（一会登陆用） 
3. 选择远程连接->VNC，会弹出一个密码，记住它，以后远程连接要用（ctrl + alt + f1~f6 切换终端，例如 ctrl + alt + f1 是第一个终端）
4. 进入后是一个命令行 输入 `root`（用户名），密码为你刚才重置的实例密码
5. 登陆成功， 更新安装源 `sudo apt-get update && sudo apt-get upgrade -y`
6. 安装 npm `sudo apt-get install npm`
7. 安装 npm 管理包 `sudo npm install -g n`
8. 安装 node 最新稳定版 `sudo n stable`
9. `ctrl+d` 重新登陆
10. 查看版本 `node -v` `npm -v`
11. 安装 git  `sudo apt-get install git`
12. 克隆项目 `git clone https://github.com/woai3c/node-blog.git`
13. [安装图形化界面](https://zhuanlan.zhihu.com/p/55604183)（此处可跳过）
14. 安装 mongodb `sudo apt install -y mongodb`，运行数据库 `sudo mongod` 
15. 如果报错 `exception in initAndListen: NonExistentPath: Data directory /data/db not found., terminating`，请执行命令 `mkdir /data/db/ -p`，再重新运行数据库 `sudo mongod`
16. 如果报错 `SocketException: Address already in use MONGODB`，输入 `sudo killall mongod` 关掉所有的 mongod 进程，，再重新运行数据库 `sudo mongod`
17. 进入项目安装依赖 `npm i`  打包项目 `npm run build` 运行项目 `npm run server`
18. 监听 IP 必须为 `0.0.0.0` ，详情请看第 19 项
19. [部署Node.js项目注意事项](https://www.alibabacloud.com/help/zh/doc-detail/50775.htm)
