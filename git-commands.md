# git 常用命令介绍

### 1. `git add <file>` 
将 `file.txt` 文件添加到暂存区。
```
git add file.txt
```
将当前所有有变动的文件添加到暂存区。
```
git add .
```
### 2. `git commit`
将暂存区的文件提交到当前分支。
```git
git commit -m '将刚才添加到暂存区的文件提交到当前分支，-m 代表要加注释'
```
### 3. `git push <远程主机名> <分支名>`
推送分支，就是把该分支上的所有本地提交推送到远程库。
```
git push origin master
```
上面命令表示，将本地的 master 分支推送到 origin 主机的 master 分支。如果 master 不存在，则会被新建。

远程库的名字就是 origin，这是 Git 默认的叫法，也可以改成别的，但是 origin 这个名字一看就知道是远程库。

推送到远程仓库 dev 分支。
```
git push origin dev
```
**第一次使用时要带上 `-u` 参数**
```
git push -u origin master
```
以后每次提交就可以直接使用 `git push` 了，不用每次都输上一串命令。
```
git push
```
### 4. `git pull`
`git pull` 将远程仓库的更新拉取下来，再和本地分支进行合并。

### 5. `git branch` `git checkout`...
* `git branch` 查看当前所有分支
* `git branch <name>` 创建分支
* `git checkout <name>` 切换分支
* `git branch -d <branchName>` 删除本地分支
* `git push origin --delete <branchName>` 删除远程分支

创建分支 dev
```
git branch dev
```
切换到分支 dev
```
git checkout dev
```
`git checkout` 命令加上 `-b` 参数表示创建并切换，`git checkout -b dev` 相当于以下两条命令:
```
git branch dev
git checkout dev
```
强制切换分支到指定的 commit
```
git branch -f <branchName> <commitID>
```
将当前 HEAD 分支的记录树往后移动 2 个 commit
```
git checkout HEAD~2
```

### 6. `git log`
`git log` 命令可以查看提交的历史记录。
```
E:\res\platform>git log
commit 783ec77f1447125971aa2651e4320a768938d453 (HEAD -> 3.0, origin/3.0)
Author: woai3c <411020382@qq.com>
Date:   Wed Apr 22 14:19:00 2020 +0800

    chore: 只有打包时才应用忽略 console.log 语句

commit 514cf81798a14b3bf273019d02885f87bf8ad2ac
Author: woai3c <411020382@qq.com>
Date:   Wed Apr 22 13:40:11 2020 +0800

    feat: 添加全局 log 函数
```
如果不想显示无用的信息，可以使用 `git log --pretty=oneline`
```
E:\res\platform>git log --pretty=oneline
783ec77f1447125971aa2651e4320a768938d453 (HEAD -> 3.0, origin/3.0) chore: 只有打包时才应用忽略 console.log 语句
514cf81798a14b3bf273019d02885f87bf8ad2ac feat: 添加全局 log 函数
2f0e28962d3f2d5e9c047387560986411d2a07d0 chore: 更新 eslint 规则
```
### 7. `git reset` 版本回退
`git reset` 命令用于版本回退。
假如你正在开发一个项目，有一天产品提了个新功能，要求三天内完成，于是你快马加鞭、加班加点终于在三天内完成了。
结果第四天产品告诉你新功能不要了。你想打死产品的心都有了，话虽如此，工作还是得继续，这时 `git reset` 就可以派上用场了。

将版本回退到上一版本。
```
git reset --hard HEAD~1
```
将版本回退到三个版本前。
```
git reset --hard HEAD~3
```
也可以指定固定的版本进行回退，先使用 `git log --pretty=oneline` 命令查看历史记录，将想要回退版本的 commit id 复制一下，回退时使用这个 commit id 进行回退。
```
git reset --hard 485776d96f57db88c6a6f31146532d21fc01b1ab
```
接着使用 `git push -f` 将回退版本后的分支强制推送到远程仓库，这样本地分支和远程分支就同步了。
```
git push -f
```

用远程分支覆盖本地分支
```
git fetch --all
git reset --hard origin/master（这里的 master 为远程分支）
```

### 9. `git revert`
`git revert` 也可以撤销记录，只不过它撤销的记录不会消失，这一点和 `git reset` 不一样。`git reset` 撤销的记录就跟消失了一样。

假设现在当前分支有 `a b c d` 记录，执行 `git reset b` 后，当前的分支记录会变成 `a b`。

如果用 `git revert` 来撤销记录，即执行 `git revert b`，会在当前分支上再生成一个新的 commit 记录，变成 `a b c d b'`，这个 `b'` 的状态和记录 `b` 是一样的。

如果你想让别人知道你撤销过记录，就使用 `git revert`，因为它会留下撤销的记录，否则用 `git reset`。

### 10. `git rebase`
如果你想将多个 commit 合并成一个，可以使用 `git rebase`。假设你有三次提交，分别为 abc。并且需要合并 ab，则输入以下命令：
```
git rebase -i <c 的 commit id>
```
下面是一个真实示例：
```
git rebase -i c486fa803767ff75780c8df7e18b560fdc332b1e
```
执行命令后，会弹出一个框，上面会显示 a 和 b 的 commit 消息。类似于这样：
```vim
pick 9fe8f12 chore: 全局命令 mvl -> mvc(mini-vue-cli)
pick 645156a chore(create): 美化下载格式提示语
```
同时有一些命令需要了解一下：
```
p, pick = use commit
r, reword = use commit, but edit the commit message
e, edit = use commit, but stop for amending
s, squash = use commit, but meld into previous commit
f, fixup = like “squash”, but discard this commit’s log message
x, exec = run command (the rest of the line) using shell
d, drop = remove commit
```
按照上述命令的解释，这时只要保证第一个 commit 不动，将第二个 commit 的 pick 改为 s 就可以了。由于这是 vi 编辑模式，所以你需要按一下 i 才可以开始编辑，编辑完成按一个 esc 然后输入 :wq 回车即可。

这时还会弹出一个提示框，让你更改 commit message。按照刚才的操作修改完后保存即可。最后在命令行执行 `git push -f` 推送到远程仓库。

### 11. 解决冲突
当执行 `git pull`，将远程分支和本地分支合并时，有可能会出现冲突的情况。
例如有 A 和 B 两个人，对同一文件 `test.txt` 进行了修改。A 修改完后先提交到了远程分支，当 B 要提交时，执行 `git pull`，发现远程仓库的 `test.txt` 和自己本地的版本有冲突。
```
### 以太网的的信道利用率
### 以太网的的信道利用率
<<<<<<< HEAD
aaaaaa
=======
bbb
>>>>>>> 9ccc398514d6a80a6ea2e44ade8171660d15cacf
### 以太网的的信道利用率
### 以太网的的信道利用率
```
从上面的代码可以看出，当前版本的文件内容 `aaaaaa` 和远程仓库文件的内容 `bbb` 产生了冲突。
冲突用 `<<<` `====` `>>>>` 将产生冲突的内容分隔开，如果你觉得远程仓库的内容不对，要换成自己的，那可以这样改。
```
### 以太网的的信道利用率
### 以太网的的信道利用率
aaaaaa
### 以太网的的信道利用率
### 以太网的的信道利用率
```
把 `<<<` `===` `>>>` 删除掉，并替换成自己的内容，再执行 `git add` `git commit` 提交内容。 这时，执行 `git pull`，你会发现没有更新，刚修改的内容也不会变，最后再执行 `git push` 将内容推送到远程仓库。

### 10. `git merge`
将指定分支合并到当前分支。例如你想将 a 分支合并到 b 分支，则切换到 b 分支，并执行：
```
git merge a
```

git merge 合并分支后可能不是一条直线，所以可以使用 git rebase 来合并分支。这样合并后在历史记录上看起来就是一条直线了。
```
git rebase a
```

### 12. `git tag`
打标签
```
git tag <tagName>
```

如果忘记打标签了，可以指定以前的 commit 打标签
```
git tag -a <tagName> <commitid>
```

推送标签
```
git push origin --tags
```

删除标签
```
git tag -d <tagName>
```

删除远程标签
```
git push origin --delete <tagname>
```

### 13. `git cherry-pick`
如果你想将某个指定 commit 放到当前分支上，可以使用 `git cherry-pick <commitid1> <commitid2>...`。

假设当前分支为 master，历史记录为 `x y`。现在 dev 分支上有 `a b c d` 四个记录，你想将其中的 b 记录合并到当前分支，可以执行 `git cherry-pick b`。执行后 master 分支变为 `x y b`。

或者想批量提交 dev 分支中的 `b d` 两个记录，可以执行 `git cherry-pick b d`。这样 dev 分支的 `b d` 记录就合并到 master 分支了，变成 `x y b d`。

另外批量连续合并还有省略语法
```
git cherry-pick A..B 
```
这表示合并从 A 到 B 的所有记录。


## 参考资料
* [Git教程-廖雪峰](https://www.liaoxuefeng.com/wiki/896043488029600)
* [learngitbranching](https://learngitbranching.js.org/?locale=zh_CN)
