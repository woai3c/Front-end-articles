# gitlab 自动化部署
## 安装
```bash
sudo curl --output /usr/local/bin/gitlab-runner "https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-darwin-amd64"

sudo chmod +x /usr/local/bin/gitlab-runner
```
## 启动
```bash
cd ~
gitlab-runner install
gitlab-runner start
```
## 注册
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
gitlab-runner verify
```
进行激活，看到 gitlab-runner 左边的圆点变成绿色就代表激活了。

**注意事项**：创建的 gitlab-runner 是运行在本机上的，如果你的电脑关机了，其他人推送代码就没有 gitlab-runner 去执行自动部署任务。所以建议项目相关人员都创建一个 gitlab-runner。

## .gitlab-ci.yml 文件
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

## 部署
将文件发布到 nginx，是需要密码的，如果你不知道密码，可以找运维要。通常情况下，每次将文件发布到 nginx 都需要账号密码。为了减少这种繁琐的操作，可以使用 `ssh-keygen -t rsa` 生成一对密钥，然后将公钥上传到服务器（如果你不确定电脑上有没有，可以在终端上执行 `cd ~/.ssh` 和 `ls` 看一下有没有 `id_rsa.pub` 文件）。这样每次传文件都不需要密码了。 

如果没有密钥对，在执行 `ssh-keygen -t rsa` 命令后不停回车就可以了。

### 将公钥上传到服务器
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
