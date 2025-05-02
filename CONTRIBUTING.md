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
git checkout develop
git pull origin develop
git checkout feature/your-feature
git rebase develop
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
