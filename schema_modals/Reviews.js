//schema to for storing the data into db
const mongoose = require('mongoose')
const {Schema} = mongoose;

const ReviewsSchema = new Schema({
    ReviewList:[
        {
            userName: {type:String,required:true},
            userId: {type:String,required:true},
            movieName: {type:String,required:true},
            tags: [{type:String,required:true}],
            downloadLink: {type:String,required:true},
            description:{type:String,required:true},
            moviePosterUrl:{type:String},
            movieRating:{type:String},
            movieReleaseDate:{type:String},
            movieTmdbReference:{type:String},
            commentCount: { type: Number, default: 0 },
            date: { type: Date, default: Date.now }
        }
    ]
});
const Reviews = mongoose.model('Reviews', ReviewsSchema);
module.exports = Reviews
