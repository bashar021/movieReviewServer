const express = require('express')
var router = express.Router()
// var dotenv = require('dotenv')
const Reviews = require('../schema_modals/Reviews')
const UserProfile = require('../schema_modals/user_profile')

const verifyAuthToken = require('../middlewares/verify_auth_token')

router.get('/', verifyAuthToken, async (req, res) => {
    // req.user_id  contains the authentic user unique id 
    try {
        const user = await UserProfile.findById({ _id: req.user_id })
        const watchList = user.watchList
        const watchListIds = []
        watchList.forEach((item) => {
            watchListIds.push(item.reviewId)
        })
        const watchListReviews = await Reviews.aggregate([
            { $unwind: '$ReviewList' },
            { $project: { reviewObject: '$ReviewList' } }
        ]);
        const filteredReviews = watchListReviews.filter(review => {
            return watchListIds.includes(review.reviewObject._id.toString());
        });
        // console.log(filteredReviews)
        //   console.log(filteredReviews)
        res.status(200).json({ data: filteredReviews })

    } catch (error) {
        console.log('error in getting the watch list')
        res.status(500).json({ error: 'internal server error can not delete it from your watchlist' })
    }
})


router.get('/review/add/:userId/:reviewId',verifyAuthToken,async (req,res)=>{
    // console.log(req.params.userId)
    // console.log(req.params.reviewId)
    try {
        const review = await UserProfile.findOne({ _id: req.user_id, "watchList.reviewId": req.params.reviewId })
        if (!review) {
            const response = await UserProfile.findByIdAndUpdate({ _id: req.user_id }, { '$push': { 'watchList': { reviewId: req.params.reviewId } } }, { new: true })
            // successfully added to watchList
            res.status(201).json({ data: response })
        } else {
            // already in the WatchList
            res.status(204).json({data:{ message: " already saved in watchList" }})
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({data:{ error: 'unable to add due to internal error try again ' }})
    }
})


router.get('/review/delete/:reviewId',verifyAuthToken,async (req,res)=>{
    try {
        // console.log(req.params.reviewId)
        const updatedReviews = await UserProfile.findByIdAndUpdate({ _id: req.user_id }, { $pull: { watchList: { reviewId: req.params.reviewId } } }, { new: true })
        if (updatedReviews) {
            // console.log(updatedReviews)
           return  res.status(201).json({ data: updatedReviews })
        }
        return  res.status(204).json({message:"unable to delete please try again"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "internal error please try again " })
    }
})



router.get('/review/add/:userId/:reviewId',verifyAuthToken,async (req,res)=>{
     // console.log(req.params.userId)
    // console.log(req.params.reviewId)
    try {
        const review = await UserProfile.findOne({ _id: req.user_id, "watchList.reviewId": req.params.reviewId })
        if (!review) {
            const response = await UserProfile.findByIdAndUpdate({ _id: req.user_id }, { '$push': { 'watchList': { reviewId: req.params.reviewId } } }, { new: true })
            // successfully added to watchList
            res.status(201).json({ data: response })
        } else {
            // already in the WatchList
            res.status(204).json({data:{ message: " already saved in watchList" }})
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({data:{ error: 'unable to add due to internal error try again ' }})
    }
})

module.exports = router;