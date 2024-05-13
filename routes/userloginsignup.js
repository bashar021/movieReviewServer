'use strict'
const express = require('express')
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var dotenv = require('dotenv')
const bcrypt = require('bcrypt');
var app = express()
var router = express.Router()
var { body, validationResult } = require('express-validator');


app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
router.use(cookieParser())


router.post('/login',(req,res)=>{
    console.log(req.body)
    // 200 status code for ok message 
    res.status(200).json({data:'this is a login page '})
})
router.post('/signup',(req,res)=>{
    console.log(req.body)
    console.log(req.body)
    // 201 status code fo created status 
    res.status(201).json({data:"this is signup page "})
})

router.get('/login',(req,res)=>{
    res.send('hello this is a login page ')
})

module.exports = router;