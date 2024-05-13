
const Notifications  = require('../schema_modals/Notification.js')
async function SendNotification(receiver,notification){
    // console.log('notification to send ',notification)
    try{
        let result;
        // console.log(receiver)
        const user = await Notifications.findOne({userId:receiver})
        console.log(user)
        if(user === null){
            console.log('user first notification ')
            result = await  Notifications.create({userId:receiver,notifications:notification})
        }
        else{
            // console.log(receiver)
            // console.log(notification)
            result = await  Notifications.findOneAndUpdate({userId:receiver},{'$push':{'notifications':notification}})
            // console.log(result)
        }
        if(result){
            return true
        }
        console.log('error in sending notification ')
        console.log(result)
        return false
        
    }catch(error){
        console.log('error in sending notification ')
        console.log(error)
        return false
    }
}
// export default  SendNotification

module.exports = SendNotification;