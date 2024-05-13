//schema to for storing the data into db
const mongoose = require('mongoose')
const {Schema} = mongoose;

const NotificationSchema = new Schema({
    userId:{type:String,required:true,unique:false},
    notifications:[
        {
            reviewId: {type:String,required:true},
            reviewName:{type:String,required:true},
            senderUserName: {type:String,required:true},
            senderUserId:{type:String,required:true},
            message:{type:String,required:true},
            createdCommentId:{type:String},
            commentedOnCommentId:{type:String},
            commentedOnComment:{type:String},
            commentDescription:{type:String,required:true},
            seen:{type:Boolean,default:false},
            date: { type: Date, default: Date.now }
        }
    ]
});
const Notifications = mongoose.model('Notifications', NotificationSchema);
module.exports = Notifications