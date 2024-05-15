const express = require('express')
var router = express.Router()
// var dotenv = require('dotenv')
const Reviews = require('../schema_modals/Reviews')
const UserProfile = require('../schema_modals/user_profile')

const verifyAuthToken = require('../middlewares/verify_auth_token')



router.get('/', verifyAuthToken, async (req, res) => {
    try {
        const user = await UserProfile.findById({ _id: req.user_id });
        const reviews = await Reviews.findOne({ _id: req.user_id })
        if (user) {
            // console.log(user)
            return res.status(200).json({ data: { userDetails: user, reviews: reviews } });
        }
        return res.status(500).json({ error: 'internal server error please try again later ' })
    }
    catch (error) {
        return res.status(500).json({ error: 'internal server error please try again later ' })
    }
})


router.post('/update',verifyAuthToken, async (req, res) => {
    try {
        const user = await UserProfile.findOneAndUpdate({ _id: req.user_id }, { '$set': { 'name': req.body.name, 'userName': req.body.userName, 'email': req.body.email, 'number': req.body.phone } }, { new: false })
        if (user) {
            console.log('user has been updated', user)
            return res.status(200).json({ data: user });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'internal server error please try again later ' })
    }


})

module.exports = router;