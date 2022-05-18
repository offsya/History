const Router = require('express')
const router = new Router()
const infoController = require('../controllers/infoController');


router.get('/file', infoController.info);

module.exports = router