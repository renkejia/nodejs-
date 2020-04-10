const { SuccessModel, ErrorModel } = require('../model/resModel')
const { login } = require('../controller/user')
const { setRedis } = require('../db/redis')

const handleUserRouter = (req, res) => {
    const method = req.method

    // 登录
    if (method === 'POST' && req.path === '/api/user/login') {
        const { username, password } = req.body
        // const { username, password } = req.query
        // 从数据库中查询对应数据
        const result = login(username, password)
        return result.then(data => {
            if (data.username) {
                // 设置 session
                req.session.username = data.username
                req.session.realname = data.realname
                // 同步到redis中
                setRedis(req.sessionId, req.session)
                console.log('req.sessionId is', req.sessionId,' req.session is', req.session)

                return new SuccessModel()
            }
            return new ErrorModel('登录失败')
        })
    }

    // // 登录验证测试
    // if (method === 'GET' && req.path === '/api/user/login-test') {
    //     // 如果cookie中存在username 则登录成功
    //     // console.log('req.session is ',req.session)
    //     if (req.session.username) {
    //         return Promise.resolve(
    //             new SuccessModel({
    //                 session: req.session
    //             })
    //         )
    //     }
    //     return Promise.resolve(
    //         new ErrorModel('尚未登录')
    //     )
    // }
}

module.exports = handleUserRouter