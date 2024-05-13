const express = require('express')
const bcrypt = require('bcrypt');
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
async function userbcryptpassword(req,res,next){
    const salt = await bcrypt.genSalt(10)
    const securepassword = await bcrypt.hash(req.body.password,salt)
    req.securepassword = securepassword;
    next()
}
module.exports = userbcryptpassword;