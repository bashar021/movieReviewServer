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
const UserProfile = require('../schema_modals/user_profile.js')
const checkexistuser = require('../middlewares/Checkexistuser.js')
const userbcryptpassword = require('../middlewares/BcryptedPass.js')
const SendNotification = require('../middlewares/SendNotification.js')


app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
router.use(cookieParser())


router.post('/login', [body('password', 'password must be atleast 6 chracter').isLength({ min: 6 }), body('email', 'email is not valid').isEmail()], async (req, res) => {
    // console.log(req.body)
    try {
        const user = await UserProfile.findOne({ email: req.body.email })
        if (!user) {
            return res.status(404).json({ error: 'your account does not exist please signUp' }) //rediret user to signup page it does not exists 
            // return res.status(400).json({ message: "please insert valid username or password "});
        }
        else if (user) {
            const userPass = await bcrypt.compare(req.body.password, user.password);
            if (!userPass) {
                return res.status(401).json({ error: "please insert valid username or password " });
            }
            const data = {
                user: { id: user.id }
            }
            const authtoken = jwt.sign(data, process.env.SECRET_KEY) // genrating the authtoken for user 
            // res.cookie("jwt", authtoken, {httpOnly: true,secure:true,expires:new Date(Date.now()+1000000)}) // 
            res.status(200).json({ data: user, jwt: authtoken })
        }

    } catch (error) {
        return res.status(500).json({ error: 'internal server error' });

    }
})


router.post('/signup', [body('password', 'password must be atleast 6 chracter').isLength({ min: 6 }), body('email', 'email is not valid').isEmail(), body('phone', 'number is not valid').isLength({ min: 10 })], [checkexistuser, userbcryptpassword], async (req, res) => {
    // console.log(req.body)
    // giving an error of express validations when the userser input data foes not match 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // 400  staus code for bad request 
        return res.status(400).json({ error: errors.array()[0].msg }); // retruning the array of errors ocuring in the user data 
    }
    try {
        const user = await UserProfile.create({ name: req.body.name, userName: req.body.userName, email: req.body.email, number: req.body.phone, password: req.securepassword })
        if (user) {
            const data = {
                user: { id: user.id }
            }
            // console.log(user)
            const authtoken = jwt.sign(data, process.env.SECRET_KEY) // genrating the authtoken for user 
            // console.log('this is an authtoken', authtoken)
            // we can not set cookie here directly becuase of not same origin so we will send it as a  data 
            // res.cookie("jwt", authtoken, {httpOnly: true,secure:true,expires:new Date(Date.now()+1000000)}) // saving the authtoken for the user in the cookie
            const notification = {
                reviewId: '',
                reviewName:'',
                senderUserName: " Owner ",
                senderUserId:'',
                message:"Welcome to movies review website here you can get the reviews of movies and download link also ",
                createdCommentId:'',
                commentedOnCommentId:'',
                commentedOnComment:'',
                commentDescription:'',
                seen:false,
                
            }
            
            const result = await SendNotification(user._id.toString(),notification);
            if (result) {
                console.log('welcome notifications has send to the user ')
            }
            return res.status(201).json({ data: user, jwt: authtoken })
        }
        return res.status(500), json({ error: 'unable to singUp please try again' })

    } catch (error) {
        console.log("unable to singup please try again ")
        console.log(error)
        // 500 status code for internal server error 
        return res.status(500), json({ error: 'unable to singUp please try again' })

    }
})






module.exports = router;