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

router.get('/mark/read/:notificationId',verifyAuthToken,async (req,res)=>{
    // rq.params.notificationID 
    // req.user_id
    try{
        const result = await Notifications.updateOne(
        
            { userId: req.user_id, 'notifications._id':req.params.notificationId },
            { $set: { 'notifications.$.seen': true } }
          );
          if(result.modifiedCount !== 0){
            return res.status(200).json({message:'successfully done',count:result.modifiedCount })
          }
        //   console.log(result)
        //   console.log(req.user_id)
        // console.log(req.params.notification
        return res.status(204).json({message:"there is nothing to update",count:0})

    }catch(error){
        console.log(error)
        return res.status(500).json({error:error})
    }
   

    
})
module.exports  = router;