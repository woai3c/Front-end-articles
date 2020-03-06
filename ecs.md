# 阿里云服务器部署个人网站

1. 在云服务器管理控制台选择实例->更多->密钥->重置实例密码（一会登陆用） 
2. 选择远程连接->VNC，会弹出一个密码，记住它，以后远程连接要用
3. 进入后是一个命令行 输入 `root`（用户名），密码为你刚才重置的实例密码
5. 登陆成功， 更新安装源 `sudo apt-get update && sudo apt-get upgrade -y`
6. 安装 npm `sudo apt-get install npm`
7. 安装 npm 管理包 `sudo npm install -g n`
8. 安装 node 最新稳定版 `sudo n stable`
9. `ctrl+d` 重新登陆
10. 查看版本 `node -v` `npm -v`
11. 安装 git  `sudo apt-get install git`
12. 克隆项目 `git clone https://github.com/woai3c/node-blog.git`
13. [安装图形化界面](https://zhuanlan.zhihu.com/p/55604183)
14. 安装 mongodb `sudo apt install -y mongodb`，运行 `sudo mongod` 再运行 `mongo` 打开数据库命令行
15. 进入项目安装依赖 `npm i`  运行项目 `npm run build` 
16. [部署Node.js项目注意事项](https://www.alibabacloud.com/help/zh/doc-detail/50775.htm)
