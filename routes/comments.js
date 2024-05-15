const express = require('express')
const router = express.Router()
const verifyAuthToken = require('../middlewares/verify_auth_token')
const {Comments} = require('../schema_modals/Comments.js')
const UserProfile = require('../schema_modals/user_profile')
const Reviews = require('../schema_modals/Reviews')
const SendNotification = require('../middlewares/SendNotification')
router.get('/',async (req,res)=>{
    res.send('hellow world ')
})




router.post('/add', verifyAuthToken, async (req, res) => {
    // req.body.reviewId
    // req.body.comment
    // req.user_id
    console.log(req.user_id)
    console.log('user comment request ')
    const data = {
        reviewId: req.body.reviewId,
        commentUserName: '',
        commentUserId: req.user_id,
        commentDescription: req.body.comment
    }
    const notification = {
        reviewId: req.body.reviewId,
        reviewName: '',
        senderUserName: '',
        senderUserId: req.user_id,
        message: ' has commented on your review ',
        createdCommentId: '',
        commentedOnCommentId:'',
        commentedOnComment:'',
        commentDescription: req.body.comment,
        seen: false,
    }
    try {
        const user = await UserProfile.findById({ _id: req.user_id })
            // console.log(user)
        if (user) {
            data.commentUserName = user.userName
            notification.senderUserName = user.userName
            const comment = await Comments.create(data)
            console.log(comment)
            
            notification.createdCommentId = comment._id.toString()
            if (comment) {
                const reviewName = await Reviews.findOne({ 'ReviewList._id': req.body.reviewId })
                // reviewName._id  review owner id 
                const newReviewName = await Reviews.findOne({ _id: reviewName._id }, { ReviewList: { $elemMatch: { _id: req.body.reviewId } } })
                // newReviewName.ReviewList[0].mvovieName 
                notification.reviewName = newReviewName.ReviewList[0].movieName
                // console.log(newReviewName.ReviewList[0].movieName) 
                const sender = req.user_id
                const receiver = reviewName._id.toString()
                if (sender !== receiver) {
                    const data = await SendNotification(receiver, notification)
                    // if (data) {
                    //     console.log('notification for :', receiver, "hass ben send")
                    // }
                } 
                return res.status(201).json({ data: comment })
            }
            return res.status(500).json({error:'can not save comment due to server error'})
        }
        return res.status(401).json({ error: 'un identified user ' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'internal server error' })
    }
})



router.post('/update', verifyAuthToken, async (req, res) => {
    try {
        const result = await Comments.findByIdAndUpdate({ _id: req.body.commentId }, { $set: { commentDescription: req.body.commentDescription } })
        if(result){
            return res.status(200).json({ data: result })
        }
        return res.status(500).json({ error: "internal server error "})
    } catch {
        console.log(error)
        return res.status(500).json({ error: 'internal server error ' })
    }
})


router.get('/delete/:commentId/:parentId', verifyAuthToken, async (req, res) => {
    const commentId = req.params.commentId
    try {
        if (req.params.parentId !== 'none') {
            const removeFromParent = await Comments.findByIdAndUpdate({ _id: req.params.parentId }, { $pull: { 'replies': commentId } })
        }
        const deleteRepliesRecursively = async (commentId) => {
            const comment = await Comments.findOneAndDelete({ _id: commentId });
            if (comment.replies) {
                for (const reply of comment.replies) {
                    await deleteRepliesRecursively(reply)
                }
            }
        };
        await deleteRepliesRecursively(commentId);
        // console.log('deleted succesfull')
        return res.status(204).json({ data: 'successfully deleted' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'internal server error' })
    }
})





router.post('/reply/add', verifyAuthToken, async (req, res) => {
    // req.body.reviewId   req.body.commentId    req.body.comment   req.user_id
    const notification = {
        reviewId: req.body.reviewId,
        reviewName: '',
        senderUserName: '',
        senderUserId: req.user_id,
        message: 'has replied on your comment',
        createdCommentId: '',
        commentedOnComment: '',
        commentedOnCommentId: req.body.commentId,
        commentDescription: req.body.comment,
        seen: false
    }
    try {
        const user = await UserProfile.findById({ _id: req.user_id })
        notification.senderUserName = user.userName
        if (user) {
            const data = { reviewId: req.body.reviewId, commentUserName: user.userName, commentUserId: req.user_id, commentDescription: req.body.comment }
            const reply = await Comments.create(data)
            const comment = await Comments.findByIdAndUpdate({ _id: req.body.commentId }, { '$push': { 'replies': reply._id } }, { new: true })
            const moreComments = await Comments.findOne({ _id: comment._id }).populate('replies');
            notification.createdCommentId = reply._id.toString() // comment created _id
            notification.commentedOnCommentId = comment._id.toString()  // comment  _id on which user has replied
            notification.commentedOnComment = comment.commentDescription   // comment where the user has replied 
            console.log(comment)
            // const reviewName = await Reviews.findOne({ ReviewList: { $elemMatch: { _id: req.body.reviewId } } })
            const reviewName = await Reviews.findOne({ 'ReviewList._id': req.body.reviewId })
            // reviewName._id  review owner id 
            const newReviewName = await Reviews.findOne({ _id: reviewName._id }, { ReviewList: { $elemMatch: { _id: req.body.reviewId } } })
            // newReviewName.ReviewList[0].mvovieName 
            notification.reviewName = newReviewName.ReviewList[0].movieName
            const sender = req.user_id
            const receiver = comment.commentUserId
            if (sender !== receiver) {
                const data = await SendNotification(receiver, notification)
                if (data) {
                    console.log(notification.senderUserName, ' reply on your comment ')
                    console.log('notification for :', receiver)
                }
            } else {
                console.log('same user')
            }
            if (moreComments) {
                return res.status(200).json({ data: moreComments })
            }
        }
        return res.status(500).json({ error: 'internal server error ' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'internal server error ' })

    }
})

router.get('/reply/more/:reviewId/:commentId', async (req, res) => {
    // console.log(req.params.reviewId)
    // console.log(req.params.commentId)
    try {
        const moreComments = await Comments.findOne({
            _id: req.params.commentId
            // reviewId: req.params.reviewId,
            // _id: { $nin: await Comments.distinct('replies', { reviewId:req.params.reviewId}) }
        }).populate('replies');
        if (moreComments) {
            // console.log(moreComments)
            res.status(200).json({ data: moreComments })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'internal server error ' })
       
    }
})



router.get('/review/:reviewId', async (req, res) => {
    const reviewId = req.params.reviewId;
    try {
        const comments = await Comments.find({
            reviewId: req.params.reviewId,
            _id: { $nin: await Comments.distinct('replies', { reviewId: req.params.reviewId }) }
        }).populate('replies');
        // const comments = await Comments.aggregate([
        //     // Match the initial comments with the specified reviewId
        //     { $match: { reviewId: reviewId, 'replies': { $exists: false } } },
        //     // Add a field to hold the path of each comment
        //     { $addFields: { path: '$_id' } },
        //     // Perform a recursive lookup to populate the replies
        //     {
        //       $graphLookup: {
        //         from: 'Comments',
        //         startWith: '$_id',
        //         connectFromField: '_id',
        //         connectToField: 'replies',
        //         as: 'replies',
        //         maxDepth: 10, // Adjust this value according to your maximum nesting level
        //       }
        //     },
        //   ]);
        if (comments) {
            // console.log(comments)
            return res.status(200).json({ data: comments })
        }
        return res.status(500).json({error:"internal server error "})

    } catch (error) {
        console.log(error)
       return  res.status(500).json({ error: "internal server error" })
        
    }
})









module.exports = router ;
