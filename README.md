### 目录树
```
Blog1
├── blog-1
│   ├── app.js
│   ├── bin
│   │   └── www.js
│   ├── logs    // 日志文件夹    
│   │   ├── access.log
│   │   ├── error.log
│   │   └── event.log
│   ├── package-lock.json
│   ├── package.json
│   └── src
│       ├── config  // 环境相关配置
│       │   └── db.js
│       ├── controller  // 数据处理
│       │   ├── blog.js
│       │   └── user.js
│       ├── db  // 连接相关数据库
│       │   ├── mysql.js
│       │   └── redis.js
│       ├── model   
│       │   └── resModel.js
│       ├── router  // 路由
│       │   ├── blog.js
│       │   └── user.js
│       └── utils   // 工具脚本
│           ├── cryp.js
│           ├── log.js
│           └── readline.js
└── README.md
```
博客结构
![](https://ae01.alicdn.com/kf/H39744d25124e4c5ba61d5e5daa82228fd.png)