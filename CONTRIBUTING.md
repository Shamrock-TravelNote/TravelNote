# 协作指南

## 分支管理
1. 从develop分支创建feature分支
2. feature分支命名规范: feature/[功能名称]
3. 完成功能后提交PR到develop分支

## 开发流程
1. 更新本地develop分支
```bash
git checkout develop
git pull origin develop
```

2. 创建新功能分支
```bash
git checkout -b feature/your-feature
```

3. 提交代码
```bash
git add .
git commit -m "feat: 添加xxx功能"
```

4. 合并最新develop
```bash
# 切换到develop分支
git checkout develop
# 拉取远程最新代码
git pull origin develop
# 切换回功能分支
git checkout feature/your-feature
# 重新基准化 - 这会把你的修改建立在最新的develop之上
git rebase develop
```

注意：
- rebase会重写提交历史，使提交记录更加整洁
- 如果出现冲突，需要手动解决每个提交的冲突
- 解决冲突后使用 git rebase --continue 继续
- 如果要取消rebase，使用 git rebase --abort

如果rebase过程中遇到冲突：
```bash
# 1. 解决冲突的文件
# 2. 添加修改的文件
git add .
# 3. 继续rebase
git rebase --continue
# 如果想取消rebase
git rebase --abort
```

5. 推送分支并创建PR
```bash
git push origin feature/your-feature
```

## 代码提交规范
提交信息格式：`type: subject`

type类型：
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试用例
- chore: 构建过程或辅助工具的变动

## Code Review规范
1. 至少需要1个协作者approve
2. 解决所有冲突
3. 通过CI检查
4. 满足代码规范要求
