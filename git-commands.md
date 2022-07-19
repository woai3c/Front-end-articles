# git 常用命令介绍
## 基础命令
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
```
git commit -m '将刚才添加到暂存区的文件提交到当前分支，-m 代表要加注释'
```

修改最近一次提交的消息：
```
git commit --amend
```

修改最近一次提交的用户信息：
```
git commit --amend --author="xxx <yyy@ccc.com>" --no-edit
```

#### 全局修改邮箱地址
另一个常见的情形是在你开始工作时忘记运行 git config 来设置你的名字与邮箱地址， 或者你想要开源一个项目并且修改所有你的工作邮箱地址为你的个人邮箱地址。 任何情形下，你也可以通过 filter-branch 来一次性修改多个提交中的邮箱地址。 需要小心的是只修改你自己的邮箱地址，所以你使用 --commit-filter：
```
git filter-branch --commit-filter '
    if [ "$GIT_AUTHOR_EMAIL" = "schacon@localhost" ];
    then
            GIT_AUTHOR_NAME="Scott Chacon";
            GIT_AUTHOR_EMAIL="schacon@example.com";
            git commit-tree "$@";
    else
            git commit-tree "$@";
    fi' HEAD
```
这会遍历并重写每一个提交来包含你的新邮箱地址。 因为提交包含了它们父提交的 SHA-1 校验和，这个命令会修改你的历史中的每一个提交的 SHA-1 校验和， 而不仅仅只是那些匹配邮箱地址的提交。

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
以后每次提交就可以直接使用 `git push` 了，不用每次都输上一串命令
```
git push
```

要同时为源和目的地指定 <分支名> 的话，只需要用冒号 : 将二者连起来就可以了：
```
git push origin <source>:<destination>
```
例如 `git push origin a:b` 命令，它会把本地分支 a 推送到远程分支 b，如果分支 b 不存在，还会创建它。而且还能这样使用 `git push origin a^:b`，这样将把 a 分支的父提交推送到远程分支 b。

**注意**，如果 source 为空，它将删除远程分支。`git push origin :foo` 这条命令将删除远程分支 foo。

### 4. `git fetch <远程主机名> <分支名>`
`git fetch origin foo`， Git 会到远程仓库的 foo 分支上，然后获取所有本地不存在的提交，放到本地的 origin/foo 上。`git fetch` 它不会更新你的本地的非远程分支, 只是下载提交记录。所以它把提交记录放在 origin/foo 上，而不是 foo 分支。

如果一定要直接更新本地分支，可以使用 `git fetch origin <source>:<destination>`，其中 source 是指远程分支，destination 是本地分支，正好与 `git pull` 相反。
例如 `git fetch origin foo~1:bar`，它把远程分支 foo 的上一个记录更新到本地分支 bar。

如果 git fetch 没有参数，它会下载所有的提交记录到各个远程分支...

**注意**，如果 fetch 空到本地，它将创建一个分支。`git fetch origin :foo` 将在本地创建一个 foo 分支。

### 5. `git pull`
`git pull` 将远程仓库的更新拉取下来，再和本地分支进行合并。它相当于 `git fetch` `git merge` 这两个操作的结合。
`git pull origin foo` 相当于 `git fetch origin foo; git merge origin/foo`。

![image](https://user-images.githubusercontent.com/22117876/134711798-6320f10f-81e0-4d9d-b8f1-d5144da94142.png)


### 6. `git branch` `git checkout`...
* `git branch` 查看当前所有分支
* `git branch <name>` 创建分支
* `git checkout <name> [commitid--可选的 commitid]` 切换分支
* `git branch -d <branchName>` 删除本地分支
* `git push origin --delete <branchName>` 删除远程分支
* `git checkout <commitid>` 将 HEAD 切换到该记录

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

### 7. `git log`
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
### 8. `git reset` 版本回退
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

#### 合并分支
`git rebase <branchName>`，假设要将 test 分支合到 main 分支上，可以在 test 分支上执行 `git rebase main`。

也可以用 `git rebase main test`，这时不管你在哪个分支上执行这条命令，都会把 test 分支 rebase 到 main 分支上。

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

### 12. `git merge`
将指定分支合并到当前分支。例如你想将 a 分支合并到 b 分支，则切换到 b 分支，并执行：
```
git merge a
```

git merge 合并分支后可能不是一条直线，所以可以使用 git rebase 来合并分支。这样合并后在历史记录上看起来就是一条直线了。
```
git rebase a
```

### 13. `git tag`
打标签
```
git tag <tagName>
```

如果忘记打标签了，可以指定以前的 commit 打标签
```
git tag <tagName> <commitid>
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

### 14. `git cherry-pick`
如果你想将某个指定记录（该记录的当前所有文件的快照状态）放到当前分支上，可以使用 `git cherry-pick <commitid1> <commitid2>...`。

假设当前分支为 master，历史记录为 `x y`。现在 dev 分支上有 `a b c d` 四个记录，你想将其中的 b 记录合并到当前分支，可以执行 `git cherry-pick b`。执行后 master 分支变为 `x y b`。

或者想批量提交 dev 分支中的 `b d` 两个记录，可以执行 `git cherry-pick b d`。这样 dev 分支的 `b d` 记录就合并到 master 分支了，变成 `x y b d`。

另外批量连续合并还有省略语法
```
git cherry-pick A..B 
```
这表示合并从 A 到 B 的所有记录。

### 15. `git describe`
`git describe` 的语法是：
```
git describe <ref>
```
<ref> 可以是任何能被 Git 识别成提交记录的引用，如果你没有指定的话，Git 会以你目前所检出的位置（HEAD）。

它输出的结果是这样的：
```
<tag>_<numCommits>_g<hash>
```
tag 表示的是离 ref 最近的标签， numCommits 是表示这个 ref 与 tag 相差有多少个提交记录， hash 表示的是你所给定的 ref 所表示的提交记录哈希值的前几位。

当 ref 提交记录上有某个标签时，则只输出标签名称。
    
![image](https://user-images.githubusercontent.com/22117876/132954224-2a6a7cea-be85-4719-930e-fd614980eb45.png)

### 16. `^` 和 `~` 的区别
操作符 `^` 与 `~` 符一样，后面也可以跟一个数字。

但是 `^` 操作符后面的数字与 `~` 后面的不同，并不是用来指定向上返回几代，而是指定合并提交记录的第几个父记录。还记得前面提到过的一个合并提交有两个记录吧，所以遇到这样的节点时该选择哪条路径就不是很清晰了。

Git 默认选择合并提交的“第一个”父记录，在操作符 `^` 后跟一个数字可以改变这一默认行为。

![image](https://user-images.githubusercontent.com/22117876/132990602-5038f4ec-4c57-48e5-aa35-dfe26f8076a1.png)

![image](https://user-images.githubusercontent.com/22117876/132990627-0fa9c6b2-78c7-4ce6-905d-a686ee798244.png)

![image](https://user-images.githubusercontent.com/22117876/132990636-d984e9c4-84f1-4efa-9a1d-a43988b3ecbe.png)

![image](https://user-images.githubusercontent.com/22117876/132990701-643719be-989e-4236-99d7-f938e0c8ba09.png)

从下面的示例也可以看出它们俩的区别：
```
G   H   I   J
 \ /     \ /
  D   E   F
   \  |  / \
    \ | /   |
     \|/    |
      B     C
       \   /
        \ /
         A
A =      = A^0
B = A^   = A^1     = A~1
C = A^2  = A^2
D = A^^  = A^1^1   = A~2
E = B^2  = A^^2
F = B^3  = A^^3
G = A^^^ = A^1^1^1 = A~3
H = D^2  = B^^2    = A^^^2  = A~2^2
I = F^   = B^3^    = A^^3^
J = F^2  = B^3^2   = A^^3^2
```
    
### 17. 本地分支与远程分支
大家都知道，本地分支 main 是和远程分支 origin/main 关联的。这种关联在以下两种情况下可以清楚地得到展示：
* pull 操作时, 提交记录会被先下载到 origin/main 上，之后再合并到本地的 main 分支。隐含的合并目标由这个关联确定的。
* push 操作时, 我们把工作从 main 推到远程仓库中的 main 分支(同时会更新远程分支 origin/main) 。这个推送的目的地也是由这种关联确定的！

![image](https://user-images.githubusercontent.com/22117876/134705044-f3194ef2-739e-4ee5-8fce-33e333f258bd.png)

改变本地分支与远程分支关联的方法：
1. `git checkout -b foo origin/main`，就可以创建一个名为 foo 的分支，它跟踪远程分支 origin/main。
2. `git branch -u origin/main foo`，这样也可以让 foo 跟踪 origin/main。
    
## 高级技巧
### 1. 修改历史 commit 的消息
假设当前分支有 `a b c d` 四个 commit 记录:
```
a
b
c
d
```
如果你想对 `c` 记录的消息进行修改。可以使用 `git rebase` 将 `c` 记录换到最前面，然后使用 `git commit --amend` 对其消息进行修改。

#### 具体操作步骤

执行以下命令对记录 `d` 前面的三个 commit 进行编辑：
```
git rebase -i d
```
进行 vim 编辑界面后，移动光标到 c 记录上，按下 `dd` 剪切该记录，然后移动光标到第一行，按下 `p` 粘贴，再输入 `:wq` 保存。

执行 `git commit --amend` 对切换顺序后的 `c` 记录进行修改。然后按照刚才的操作将 `c` 记录恢复到原来的位置。最后执行 `git push -f` 强推到远程仓库。

![image](https://user-images.githubusercontent.com/22117876/132132078-4de2cf12-8529-4556-9b6b-77f048fa347d.png)

就和上图一样，这是当前分支修改后和远程分支上的对比，箭头指向的记录消息就是修改后的消息。

#### 第二种方式
1. 使用 `git checkout -b <branchName> c` 从指定记录切出一个分支
2. 在新分支使用 `git commit --amend` 修改提交消息
3. 使用 `git cherry-pick` 将 `b a` 记录，追加到新分支（**注意**，这里的 `b a` 提交记录是指原分支上的 commit，也就是选取原分支上的 `b a` 记录添加到新分支上，这样新分支上的记录就变成了 `a b c`，并且 c 记录的提交消息在第二步已经修改过）
4. 使用 `git checout 原分支名` 切换回原来的分支，再执行 `git rebase <branchName>` 合并新分支，最后强推到远程分支


### 2. 合并分支前，先整理当前分支的记录
假设你切了一个 bugFix 分支来修复线上 bug，经过一段时间的努力后终于将 bug 修复了。但是为了调试（加了很多 debug 代码）或其他原因，bugFix 上多了很多无用的记录消息。
```
commit3: 修复登录 bug
commit2: 添加 debug 语句
commit1: 添加 console 语句
```
例如上面的三个记录，前面的两个记录添加了很多调试代码，在最后一个记录终于修复了 bug，并且删除了调试代码。这时如果直接将 bugFix 分支合到 master 分支，就会把调试的记录也合并进来。

这时可以使用 `git cherry-pick` 只将最后一个记录合并到 master 分支。或者使用 `git rebase` 将 bugFix 分支另外两个记录抛弃，然后再合并。

### 3. commit 落后的分支向 commit 领先的分支进行强推
请看 [Git如何优雅地回退代码](https://www.eet-china.com/mp/a22448.html) 中的升级融合一节
## 参考资料
* [Git教程-廖雪峰](https://www.liaoxuefeng.com/wiki/896043488029600)
* [learngitbranching](https://learngitbranching.js.org/?locale=zh_CN)
