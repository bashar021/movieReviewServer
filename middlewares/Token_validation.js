var jwt = require('jsonwebtoken');
// const User = require('../modals/User')
const User = require('../schema_modals/user_profile') // importing user schema

async function Token_validation(req,res,next){
    if(req.cookies.jwt == null){
        return res.redirect('/login')// if user session has expired rediret it to the login page 
    }
    jwt.verify(req.cookies.jwt, process.env.SECRET_KEY, async function(err, decoded) {
        if(err){
            return res.redirect('/login')// if user session has expired rediret it to the login page 
        } 
        const user =  await User.findById({_id:decoded.user.id}).catch(err=>{
            return res.status(500).send()
        })
        req.userId = decoded.user.id
        next()
    });
}
module.exports = Token_validation;