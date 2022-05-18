const axios = require('axios');
const Figma = require('figma-api');
const {quiet} = require("nodemon/lib/utils");
const express = require('express');
const fetch = require('isomorphic-fetch')
const { response } = require('express')
var app = express()

class InfoController{
    async info(req, res) {
        const {link, token} = req.query;

        console.log("start");


        const result = await figmaFileFetch(link, token).catch(error => console.log(error))
        res.send(result)


        console.log("end");


    }
}

module.exports = new InfoController();