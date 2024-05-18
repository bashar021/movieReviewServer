const express = require('express')
const router = express.Router()
const verifyAuthToken = require('../middlewares/verify_auth_token')
const {Comments} = require('../schema_modals/Comments.js')
const UserProfile = require('../schema_modals/user_profile')
const Reviews = require('../schema_modals/Reviews')
const SendNotification = require('../middlewares/SendNotification')






router.get('/', verifyAuthToken, async (req, res) => {
    try {
        const reviews = await Reviews.findById({ _id: req.user_id })
        if (reviews) {
            // console.log(reviews)
            console.log('fetching reveiws ')
            // console.log(reviews)
            return res.status(200).json({ data: reviews });
        }
        console.log('fetching reviews from routes ')
        return res.status(204).json({ data: "no content found"});
        
    } catch (error) {
        console.log('can not fetch the user reviews ')
        res.status(500).json({ error: 'internal server error ' })
    }
})






router.post('/upload', verifyAuthToken, async (req, res) => {
    // console.log(req.user_id)
    try {

        const review = await Reviews.findById({ _id: req.user_id })
        const user = await UserProfile.findById({ _id: req.user_id });
        const data = { 
            userName: user.userName, 
            userId: user._id,
            movieName: req.body.myReviewMovieName, 
            tags: req.body.myReviewTags, 
            downloadLink: req.body.myReviewDownloadLink, 
            description: req.body.myReviewDescription ,
            moviePosterUrl:req.body.moviePosterUrl,
            movieRating:req.body.movieRating,
            movieReleaseDate:req.body.movieReleaseDate,
            movieTmdbReference:req.body.movieTmdbReference
        }
        if (review && user) {
            // console.log(user.userName)
            // {new:true } if it will be false then it will return the data before updating and fi false then fater updating 
            const review = await Reviews.findOneAndUpdate({ _id: req.user_id }, { '$push': { 'ReviewList': data } }, { new: true })
            if (review) {
                // console.log(review)
                // console.log('revew has been added')
                return res.status(201).json({ data: review });
            } else {
                // console.log('can not add revew try again ')
                return res.status(500).json({ error: "internal server error" });

            }
        }
        const result = await Reviews.create({ _id: req.user_id, ReviewList: data })
        // console.log('user first review saved ')
        return res.status(201).json({ data: result })

    }
    catch (error) {
        // console.log('can not save review there is any error ')
        console.log(error)
        res.status(500).json({ error: 'internal server error ' })
    }

})




router.post('/update', verifyAuthToken, async (req, res) => {
    // console.log(req.body.reviewId)
    try {
            const user = await UserProfile.findById({ _id: req.user_id });
            const data = { 
                userName: user.userName, 
                userId: req.user_id,
                movieName: req.body.myReviewMovieName, 
                tags: req.body.myReviewTags, 
                downloadLink: req.body.myReviewDownloadLink, 
                description: req.body.myReviewDescription ,
                moviePosterUrl:req.body.moviePosterUrl,
                movieRating:req.body.movieRating,
                movieReleaseDate:req.body.movieReleaseDate,
                movieTmdbReference:req.body.movieTmdbReference
            }
        // console.log(data)
        const updatedReviews = await Reviews.findOneAndUpdate({ _id: req.user_id, "ReviewList._id": req.body.reviewId }, { '$set': { 'ReviewList.$': data } }, { new: true })
        if (updatedReviews) {
            // console.log(updatedReviews) 
            console.log('review has been updated')
            return res.status(201).json({ data: updatedReviews })
        }
        return res.status(500).json({ error: 'unable to update the review due to internal error ' })

    } catch (error) {
        console.log(error,'unable to update the review due to internal error ')
       return  res.status(500).json({ error: 'unable to update the review due to internal error ' })
    }
})


router.post('/delete', verifyAuthToken, async (req, res) => {
    // console.log(req.body)
    try {
        const updatedReviews = await Reviews.findOneAndUpdate({ _id: req.user_id }, { '$pull': { ReviewList: { _id: req.body.reviewId } } }, { new: true })
        if (updatedReviews) {
            // console.log('user review has been deleted')
            return res.status(200).json({ data: updatedReviews })
        }
        return res.status(500).json({ error: 'not deleted due to internal error please try again ' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'not deleted due to internal error please try again ' })
        
    }
})


module.exports = router;