const ApiError = require('../error/ApiError')
const axios = require('axios');
const Figma = require('figma-api');
const express = require('express');


class AuthController {
    async login(req, res, next) {
        const app = express();
        const {code} = req.query;
        if(!code){
           return next(ApiError.badRequest('code is required'));
        }
        const client_id = process.env.client_id
        const callback_url = process.env.callback_url
        const client_secret = process.env.client_secret
        const response = await axios({
            method: 'post',
            url: `https://www.figma.com/api/oauth/token?client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${callback_url}&code=${code.toString()}&grant_type=authorization_code`
        })
        console.log(response.data.access_token);

        const api = new Figma.Api({
            oAuthToken: '' + response.data.access_token
        });
        const me = await api.getMe();


        res.redirect('http://localhost:3000/home?name=' + me.handle + '&icon=' + me.img_url + '&token=' + response.data.access_token);


    }

}

module.exports = new AuthController();