//schema to for storing the data into db
const mongoose = require('mongoose')
const {Schema} = mongoose;

const CommentsSchema = new Schema(
    {
    reviewId:{type:String,required:true},
    commentUserName:{type:String,required:true},
    commentUserId:{type:String,required:true},
    commentDescription:{type:String,required:true},
    replies:[{type: Schema.Types.ObjectId,ref: 'Comments'}],
    date:{ type: Date, default: Date.now }
    }
    
)
const Comments = mongoose.model('Comments', CommentsSchema);
module.exports = {Comments}

// {
        //     reviewId:{type:String,required:true},
        //     commentUserName:{type:String,required:true},
        //     commentUserId:{type:String,required:true},
        //     commentDescription:{type:String,required:true},
        //     date:{ type: Date, default: Date.now }
        // }
        // replies:[{ type: Schema.Types.ObjectId, ref: 'Comments' }],