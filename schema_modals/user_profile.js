//schema to for storing the data into db
const mongoose = require('mongoose')
const {Schema} = mongoose;

const UserSchema = new Schema({
    name:{type:String,required:true},
    userName:{type:String,required:true},
    email :{type:String,required:true,unique:true},
    number:{type:String,minLength:10,required:true},
    password:{type:String,required:true},
    watchList:[{
        reviewId:{type:String}
    }],
    date: { type: Date, default: Date.now }
});
const User = mongoose.model('user', UserSchema);
module.exports = User