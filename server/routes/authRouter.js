const Router = require('express')
const router = new Router()
const authController = require('../controllers/authController');


router.get('/login', authController.login);

module.exports = router