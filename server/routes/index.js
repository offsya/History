const Router = require('express')
const router = new Router()
const authRouter = require('./authRouter')
const infoRouter = require('./infoRouter')

router.use('/auth', authRouter)

module.exports = router