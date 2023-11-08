# gitlab 自动化部署

gitlab-runner 是与 GitLab CI / CD一起使用的应用程序，用于自动构建、测试、部署等操作。本文主要介绍如何使用 gitlab-runner 来实现项目的自动化部署，并且分两种情况：安装在本机与服务器。

## 将 gitlab-runner 安装在本机（Mac）

```bash
sudo curl --output /usr/local/bin/gitlab-runner "https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-darwin-amd64"

sudo chmod +x /usr/local/bin/gitlab-runner
```

### 启动

```bash
cd ~
gitlab-runner install
gitlab-runner start
```

### 注册

```bash
gitlab-runner register
```

在终端输入上面的命令后会弹出一个交互语句，具体如下图所示：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210421115653783.png)
总共需要交互五次：

1. 输入 gitlab 项目的 URL
2. 要进行自动部署的项目 token
3. 输入描述
4. 输入 tag，如果没有特殊要求，建议为空。
5. 执行脚本的运行器，这里输入 `shell`

上面第一、第二项的 URL 和 token 请按照下面的指示获取：

```bash
在 gitlab 上打开项目 -> settings -> CI/CD -> Runners settings
```

选择 `Runners settings` 后就能看到下图，在 `Specific Runners` 里面有所需的 URL 和 token。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210421191422842.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)

创建成功后还需要运行

```bash
gitlab-runner start
```

进行激活，看到 gitlab-runner 左边的圆点变成绿色就代表激活了。

**注意事项**：创建的 gitlab-runner 是运行在本机上的，如果你的电脑关机了，其他人推送代码就没有 gitlab-runner 去执行自动部署任务。所以建议项目相关人员都创建一个 gitlab-runner。

### 配置多个 runner 同时运行多个任务

gitlab-runner 可以注册多个，但是默认只能同时并发一个 runner。如果需要多个 runner 同时运行多个 job，则需要修改一下 gitlab-runner 的全局配置。

```shell
vim /etc/gitlab-runner/config.toml
```

打开文件后可以看到 `concurrent = 1`，这个 1 就是 runner 的并发数。例如将它设为 10，则可以同时运行 10 个 job。具体配置项请看 [高级配置](https://docs.gitlab.cn/runner/configuration/advanced-configuration.html)。

### .gitlab-ci.yml 文件

创建 gitlab-runner 后，还需要在项目根目录下创建一个 `.gitlab-ci.yml` 文件。这样只要执行 `push` 操作，gitlab 就会自动调用 gitlab-runner 去执行 `.gitlab-ci.yml` 文件。下面来看一个简单的示例：

```yml
stages: # 总共有两个阶段，分别是 build 和 deploy。
  - build
  - deploy

# 构建阶段 
build: # 这是一个 job，名称为 build
  stage: build
  script:
    - npm install
    - npm run build:h5-${CI_COMMIT_REF_NAME} # CI_COMMIT_REF_NAME 分支名称
    - cp -a dist/build/h5/ ${CI_PROJECT_NAME} # 这行命令是将打包后的文件，复制到项目根目录下，并用项目名称重新全名。CI_PROJECT_NAME是一个变量，即项目名称
  only: 
    - dev # dev 表示只有 dev 分支推送的时候才触发这个 job
    - test
  artifacts: # 将打包后的文件上传到 GitLab，可以在其他地方使用。
    name: ${CI_PROJECT_NAME}
    paths:
      - ${CI_PROJECT_NAME}

# 部署阶段
deploy_dev: # 这是一个 job，名称为 deploy_dev
  stage: deploy
  script:
    - ls
    - scp -r ${CI_PROJECT_NAME} xxx@1.2.7.135:/usr/local/nginx/html/ # 将上一阶段上传的文件传到 nginx 服务器。这里需要写 nginx 服务器的用户名和地址，为了安全需要，这里是乱填的
  only: 
    - dev

deploy_test:
  stage: deploy
  script:
    - ls
    - scp -r ${CI_PROJECT_NAME} xxx@1.2.6.6:/usr/local/nginx/html/
  only: 
    - test
```

这个 yml 脚本做了两件事情：build 和 deploy，也就是构建项目，然后将构建的文件发部到 nginx 服务器。

#### stages

stages 表示这个脚本总共有几个阶段，上面写了 build 和 deploy。脚本将会按照顺序串行的执行不同的阶段，也就是先执行 build 再执行 deploy。

#### job

每个 job 都有一个 stage 属性，表示这是什么阶段。如果有多个同阶段的 job，则会并行执行。

#### script

script 里面的语句就是要执行的脚本。

#### only

only 表示在符合条件的情况执行这个 job。

还有更多的 yml 命令可以看一下[官方文档](https://docs.gitlab.com/ee/ci/yaml/gitlab_ci_yaml.html)。

### 部署

将文件发布到 nginx，是需要密码的，如果你不知道密码，可以找运维要。通常情况下，每次将文件发布到 nginx 都需要账号密码。为了减少这种繁琐的操作，可以使用 `ssh-keygen -t rsa` 生成一对密钥，然后将公钥上传到服务器（如果你不确定电脑上有没有，可以在终端上执行 `cd ~/.ssh` 和 `ls` 看一下有没有 `id_rsa.pub` 文件）。这样每次传文件都不需要密码了。

如果没有密钥对，在执行 `ssh-keygen -t rsa` 命令后不停回车就可以了。

#### 将公钥上传到服务器

执行下面的命令将你的公钥上传到服务器：

```bash
scp ~/.ssh/id_rsa.pub user@1.2.6.6:~
```

然后通过 ssh 远程登录服务器：

```bash
ssh user@1.2.6.6
```

以上两个操作都需要密码。登录服务器后再次执行：

```bash
cd ~
cat id_rsa.pub >> .ssh/authorized_keys
```

将公钥的内容追加到 `authorized_keys` 文件，这时再次部署就不需要带上密码了。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210421201619206.png)

## gitlab-runner 与服务器是同一机器

### 安装 gitlab-runner

```bash
# For RHEL/CentOS/Fedora
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.rpm.sh | sudo bash

yum install gitlab-runner
# 注册要加 sudo
sudo gitlab-runner register
```

### 安装 node

```bash
# 下载
wget https://nodejs.org/dist/v14.16.1/node-v14.16.1-linux-x64.tar.gz
# 解压
tar -zxvf node-v14.16.1-linux-x64.tar.gz
#重命名并移动到 /usr/local/
mv node-v14.16.1-linux-x64 /usr/local/node
# 设置系统路径
echo 'export PATH=$PATH:/usr/local/node/bin' >> /etc/profile
source /etc/profile
# 测试
node -v
npm -v
```

如果提示报错，则先卸载 node，重新安装一遍。

```js
/usr/local/node/lib/node_modules/npm/bin/npm-cli.js:87
      let notifier = require('update-notifier')({pkg})
          ^^^^^^^^
SyntaxError: Unexpected identifier
    at Module._compile (module.js:439:25)
    at Object.Module._extensions..js (module.js:474:10)
    at Module.load (module.js:356:32)
    at Function.Module._load (module.js:312:12)
    at Function.Module.runMain (module.js:497:10)
    at startup (node.js:119:16)
    at node.js:945:3
```

```bash
yum remove nodejs npm -y
```

### 修改 nginx 访问权限

```bash
 chmod -R 777 /usr/local/nginx/html
 ```

### 将要部署的目录添加到 gitlab-runner 用户组

```bash
chgrp -R gitlab-runner test // 这里是 test 目录
```

### .gitlab-ci.yml 文件

 与安装在本机上的脚本差不多，只是部署阶段的命令有所不同：

 ```yml
 - scp -r ${CI_PROJECT_NAME} xxx@1.2.7.135:/usr/local/nginx/html/
 # 将上面的命令改成下面的命令
 - cp -fr ${CI_PROJECT_NAME} /usr/local/nginx/html/
 ```

## 迁移 gitlab-runner 临时作业目录

停止 gitlab-runner 服务

```sh
gitlab-runner stop
```

复制数据到新位置

```sh
rsync -av /home/gitlab-runner/ /app/gitlab-runner/
```

更新 gitlab runner 配置文件 `/etc/gitlab-runner/config.toml`，在每个 `[[runners]]` 下添加这几行代码：

```sh
builds_dir = "/app/gitlab-runner/builds"
cache_dir = "/app/gitlab-runner/cache"
environment = ["DOCKER_TLS_CERTDIR=/app/gitlab-runner"]
```

然后重新启动 gitlab-runner 服务并删除旧数据：

```sh
gitlab-runner start

rm -rf /home/gitlab-runner
```

### 踩坑

配置成功后运行 gitlab ci 报错：

```sh
Could not create directory '/home/gitlab-runner/.ssh'.
```

实际上在 gitlab ci 远程登录机器时需要访问 .ssh 目录，虽然配置了新的目录，但是不生效。网上找了很久，也问了 chatgpt 还是找不到解决方案。
所以最后把新目录下的 `/app/gitlab-runner/.ssh` 所有内容又复制了一份，放到 `/home/gitlab-runner/.ssh` 下，这样就可以正常工作了。

## 在 gitlab-runner 中使用 docker 来跑 ci

### 安装 docker 并修改配置

首先需要将 gitlab runner 的 `executor` 设置为 `docker`，并修改相关配置。编辑 `/etc/gitlab-runner/config.toml` 文件：
将 `[[runners]]` 的配置改成下面这样：

```sh
[[runners]]
name = "nodejs-172"
url = "http://gitlab.jcinfo.com/"
id = 108
token = "2GEBw3M5PTS3-gxZPLzH"
token_obtained_at = 2023-11-03T07:13:35Z
token_expires_at = 0001-01-01T00:00:00Z
environment = ["HOME=/app/gitlab-runner"]
executor = "docker"
[runners.custom_build_dir]
[runners.docker]
  tls_verify = false
  image = "docker:19.03.12"
  privileged = true
  disable_entrypoint_overwrite = false
  oom_kill_disable = false
  disable_cache = false
  # 将 docker 容器上的文件和宿主机对应起来
  volumes = ["/app/gitlab-runner/cache", "/app/gitlab-runner/.ssh:/root/.ssh", "/usr/share/nginx/html:/usr/share/nginx/html", "/root/gitlab-runner:/root/gitlab-runner"]
  shm_size = 0
```

然后在 gitlab-runner 服务器上安装 docker，安装教程网上有很多，这里就不再赘述了。安装完后记得添加国内镜像源，不然拉取镜像会很慢。编辑 `/etc/docker/daemon.json` 文件：

```json
{
  "registry-mirrors": [
    "https://dockerproxy.com",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com",
    "https://ccr.ccs.tencentyun.com"
  ]
}
```

修改文件后，执行 `sudo systemctl restart docker` 进行重启。

### 修改 `.gitlab-ci.yml` 文件

在原来的基础上添加以下代码：

```yml
# 使用 node:16 镜像
image: node:16

stages:
  - build
  - deploy

before_script:
  - echo 'install pnpm'
  - npm install -g pnpm
  # 将 172.16.71.15 机器（docker 宿主机）的私钥添加到当前机器的 ~/.ssh/id_rsa 文件中
  - mkdir -p ~/.ssh
  - echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
  - chmod 600 ~/.ssh/id_rsa
```

可以看到在 `before_script` 阶段安装了 `pnpm` 和写入了 ssh key。这里的 `SSH_PRIVATE_KEY` 是一个变量，需要在 gitlab ci 上设置。只需要将 key 设为 `SSH_PRIVATE_KEY`，然后值是 gitlab-runner 服务器的私钥。
如果不写入私钥，那么在远程登录机器时会报错（如果不需要远程登录，那么这行可以去掉）。

安装 `pnpm` 是因为这个镜像只声明了 node，其他的全局依赖都得自己手动安装。
