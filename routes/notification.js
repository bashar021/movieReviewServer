const express = require('express')
const router = express.Router()
const Notifications = require('../schema_modals/Notification')

const verifyAuthToken = require('../middlewares/verify_auth_token')



router.get('/',verifyAuthToken,async (req,res)=>{
    try{
        const data = await Notifications.findOne({userId:req.user_id})
        if(data.notifications.length>0){
            return res.status(200).json({data:data})
        }else{
            return res.status(204).json({error:'no data found '})
        }
    }catch(error){
        return res.status(500).json({error:'internal server error'})
    }
})

module.exports  = router;