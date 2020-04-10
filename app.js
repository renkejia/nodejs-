const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')
const { setRedis, getRedis } = require('./src/db/redis')
const { access } = require('./src/utils/log')
const querystring = require('querystring')


// 获取 cookie 的过期时间
const getCookieExpires = () => {
    const d = new Date()
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
    console.log('d.toGMTString() is ', d.toGMTString())
    return d.toGMTString()
}

// session 数据
const SESSION_DATA = {}

// 用来处理post data
const getPostData = (req) => {
    const promise = new Promise((resolve, reject) => {
        if (req.method !== 'POST') {
            // 如果是get请求
            resolve({})
            return
        }
        if (req.headers['content-type'] !== 'application/json') {
            // 如果不为JSON数据
            resolve({})
            return
        }

        let postData = ''
        req.on('data', chunk => {
            // console.log('chunk:', chunk)
            postData += chunk.toString()
        })
        req.on('end', () => {
            if (!postData) {
                resolve({})
                return
            }
            resolve(
                JSON.parse(postData)
            )
        })
    })
    return promise
}


const serverHandle = (req, res) => {
    // 记录 access log
    access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}` )
    
    
    // 设置返回格式 JSON
    res.setHeader('Content-type', 'application/json')

    // 获取 path
    const url = req.url
    req.path = url.split('?')[0]

    // 解析query
    req.query = querystring.parse(url.split('?')[1])

    // 解析cookie
    req.cookie = {}
    const cookieStr = req.headers.cookie || ''  //k1=v1;k2=v2;k3=v3
    cookieStr.split(';').forEach(item => {
        if (!item) {
            return
        }
        const arr = item.split('=')
        const key = arr[0].trim()
        const val = arr[1].trim()
        req.cookie[key] = val
    })
    // console.log('req.cookie is ',req.cookie)



    // // 解析session
    // let needSetCookie = false
    // let userId = req.cookie.userid
    // if (userId) {
    //     if (!SESSION_DATA[userId]) {
    //         SESSION_DATA[userId] = {}
    //     }
    // } else {
    //     needSetCookie = true
    //     userId = `${Date.now()}_${Math.random()}`
    //     SESSION_DATA[userId] = {}
    // }
    // req.session = SESSION_DATA[userId]

    // 解析 session (使用 redis)
    let needSetCookie = false
    let userId = req.cookie.userid
    if (!userId) {
        needSetCookie = true
        userId = `${Date.now()}_${Math.random()}`
        // 初始化 redis 中的seesion值
        setRedis(userId, {})
    }
    // 获取session
    req.sessionId = userId
    getRedis(req.sessionId).then(sessionData => {
        if (sessionData == null) {
            // 初始化 redis 中的session 值
            setRedis(req.session, {})
            // 设置session值
            req.session = {}
        } else {
            // 设置session
            req.session = sessionData
        }
        console.log('app_req.session is ', req.session)
        return getPostData(req)
    })
        // 处理POST data的请求
        .then(postData => {
            req.body = postData

            // 处理blog路由
            // const blogData = handleBlogRouter(req, res)
            // if (blogData) {
            //     res.end(
            //         JSON.stringify(blogData)
            //     )
            //     return
            // }
            const blogResult = handleBlogRouter(req, res)

            if (blogResult) {
                blogResult.then(blogData => {
                    if (needSetCookie) {
                        // 操作cookie
                        res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
                    }
                    res.end(
                        JSON.stringify(blogData)
                    )
                })
                return
            }


            // 处理登录路由
            const userResult = handleUserRouter(req, res)
            if (userResult) {
                userResult.then(userData => {
                    if (needSetCookie) {
                        // 操作cookie
                        res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
                    }
                    res.end(
                        JSON.stringify(userData)
                    )
                })
                return
            }

            // 未命中路由返回404、
            res.writeHead(404, { "Content-type": "text/plain" })
            res.write("404 Not Found\n")
            res.end()
        })


}

module.exports = serverHandle