"strict"
const express = require('express')
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken'); // for user authentication 
var dotenv = require('dotenv').config();
const bcrypt = require('bcrypt'); // for password encryption 
var cookieParser = require('cookie-parser')
const { body, validationResult } = require('express-validator');
const UserProfile = require('./schema_modals/user_profile.js')
const Reviews = require('./schema_modals/Reviews.js')
const { Comments } = require('./schema_modals/Comments.js')
const ConnectToDb = require('./db.js') // importing mongodb connection 
var userbcryptpassword = require('./middlewares/BcryptedPass.js')
var checkexistuser = require('./middlewares/Checkexistuser.js')
const Notifications = require('./schema_modals/Notification.js')
const SendNotification = require('./middlewares/SendNotification.js')
const http = require('http');
const socketIo = require('socket.io');
const app = express()
const port = process.env.PORT || 500
const cors = require('cors');



const server = http.createServer(app);
// const server = require('http').createServer(app);
// const io = require('socket.io')(server);
// const server = require('http').createServer();
// const io = require('socket.io')(server);

const io = socketIo(server,{ cors: {
    origin: 'http://localhost:3000'
  }});


app.use(cors({ origin: true })); // using cors for fetching the data from fetch api easily
app.use(cors({origin: 'http://localhost:3000',credentials: true,optionsSuccessStatus: 200}))
app.use(cors({ credentials: true }))
app.use(cookieParser())
// app.use('/user/',require('./routes/userloginsignup')) // using seprate route
app.use(bodyParser.urlencoded({ extended: false }));
// app.use('/static', express.static((path.join(__dirname, 'public'))))
app.use(bodyParser.json());
app.use(express.json())
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())  // body pareser to encode the data into json format 
// app.use('/static', express.static((path.join(__dirname, 'public'))))
// app.set('views', path.join(__dirname, 'views'));  
// app.use('/user/',require('./routes/userauth')) // using seprate route
// app.use(express.json()) // is used to deal withe json file to send it to client side 
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cors());
app.use(cookieParser()) // adding cookieparser to get the cookie from client

// routes 
app.use('/user/watchlist',require('./routes/watchList.js')) // using seprate route


ConnectToDb()  // calling the mongodb connection function exported from the db.js




// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('Client connected');
  
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
});





// auth token verification middelware 
function verify_auth_token(req, res, next) {
    jwt.verify(req.headers.jwt, process.env.SECRET_KEY, function (err, result) { // verifying the user from its auth token with the help of middelware 
        if (err) {
            return res.status(401).json({ error: "session expired please login", }) //  if the auth token is invalid return 'pleas login'
        } else {
            req.user_id = result.user.id
            next()//  if the auth token is valid move ahead
        }
    })

}


app.get('/', (req, res) => {
    res.send('hii')
})
app.post('/signup', [body('password', 'password must be atleast 6 chracter').isLength({ min: 6 }), body('email', 'email is not valid').isEmail(), body('phone', 'number is not valid').isLength({ min: 10 })], [checkexistuser, userbcryptpassword], async (req, res) => {
    // console.log(req.body)
    // giving an error of express validations when the userser input data foes not match 
    const notification = {
        reviewId: '',
        reviewName: '',
        senderUserName: "Website Bot",
        senderUserId: '',
        message: 'hii welcome to the movie reviews website ',
        createdCommentId: '',
        commentDescription: '',
        seen: false,
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // 400  staus code for bad request 
        return res.status(400).json({ error: errors.array()[0].msg }); // retruning the array of errors ocuring in the user data 
    }
    try {
        const user = await UserProfile.create({ name: req.body.name, userName: req.body.userName, email: req.body.email, number: req.body.phone, password: req.securepassword })
        if (user) {
            const data = {
                user: { id: user.id }
            }
            // console.log(user)
            const authtoken = jwt.sign(data, process.env.SECRET_KEY) // genrating the authtoken for user 
            // console.log('this is an authtoken', authtoken)
            // we can not set cookie here directly becuase of not same origin so we will send it as a  data 
            // res.cookie("jwt", authtoken, {httpOnly: true,secure:true,expires:new Date(Date.now()+1000000)}) // saving the authtoken for the user in the cookie
            notification.senderUserId = user._id.toString()
            const result = await SendNotification(user._id);
            if(result){
                console.log('welcome notifications has send to the user ')
            }
            return res.status(201).json({ data: user, jwt: authtoken })
        }
    } catch (error) {
        console.log("unable to singup please try again ")
        console.log(error)
        // 500 status code for internal server error 
        res.status(500), json({ error: 'unable to singUp please try again' })

    }
})

app.post('/login', [body('password', 'password must be atleast 6 chracter').isLength({ min: 6 }), body('email', 'email is not valid').isEmail()], async (req, res) => {
    // console.log(req.body)

    try {
        const user = await UserProfile.findOne({ email: req.body.email })
        if (!user) {
            return res.status(404).json({ error: 'your account does not exist please signUp' }) //rediret user to signup page it does not exists 
            // return res.status(400).json({ message: "please insert valid username or password "});
        }
        else if (user) {
            const userPass = await bcrypt.compare(req.body.password, user.password);
            if (!userPass) {
                return res.status(401).json({ error: "please insert valid username or password " });
            }
            const data = {
                user: { id: user.id }
            }
            const authtoken = jwt.sign(data, process.env.SECRET_KEY) // genrating the authtoken for user 
            // res.cookie("jwt", authtoken, {httpOnly: true,secure:true,expires:new Date(Date.now()+1000000)}) // 
            res.status(200).json({ data: user, jwt: authtoken })
        }

    } catch (error) {
        return res.status(500).json({ error: 'internal server error' });

    }
})
app.get('/details', verify_auth_token, async (req, res) => {
    try {
        const user = await UserProfile.findById({ _id: req.user_id });
        const reviews = await Reviews.findOne({ _id: req.user_id })
        if (user) {
            // console.log(user)
            return res.status(200).json({ data: { userDetails: user, reviews: reviews } });

        }
    }
    catch (error) {
        res.status(500).json({ error: 'internal server error please try again later ' })
    }
})

app.post('/update-details', verify_auth_token, async (req, res) => {
    try {
        const user = await UserProfile.findOneAndUpdate({ _id: req.user_id }, { '$set': { 'name': req.body.name, 'userName': req.body.userName, 'email': req.body.email, 'number': req.body.phone } }, { new: false })
        if (user) {
            console.log('user has been updated', user)
            return res.status(200).json({ data: user });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'internal server error please try again later ' })
    }


})







app.post('/upload-review', verify_auth_token, async (req, res) => {
    console.log(req.user_id)
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
                console.log('revew has been added')
                return res.status(201).json({ data: review });
            } else {
                console.log('can not add revew try again ')
                return res.status(500).json({ error: "internal server error" });

            }
        }
        const result = await Reviews.create({ _id: req.user_id, ReviewList: data })
        console.log('user first review saved ')
        return res.status(201).json({ data: result })

    }
    catch (error) {
        console.log('can not save review there is any error ')
        console.log(error)
        res.status(500).json({ error: 'internal server error ' })
    }

})


app.get('/user-reviews', verify_auth_token, async (req, res) => {
    try {
        const reviews = await Reviews.findById({ _id: req.user_id })
        if (reviews) {
            // console.log(reviews)
            console.log('fetching reveiws ')
            // console.log(reviews)
            return res.status(200).json({ data: reviews });
        }
        return res.status(204).json({ data: "no conttent found"});
        console.log(reviews)
    } catch (error) {
        console.log('can not fetch the user reviews ')
        res.status(500).json({ error: 'internal server error ' })
    }
})
app.post('/user/reviews/delete', verify_auth_token, async (req, res) => {
    // console.log(req.body)
    try {
        const updatedReviews = await Reviews.findOneAndUpdate({ _id: req.user_id }, { '$pull': { ReviewList: { _id: req.body.reviewId } } }, { new: true })
        if (updatedReviews) {
            // console.log('user review has been deleted')
            res.status(200).json({ data: updatedReviews })
        }
    } catch (error) {
        res.status(500).json({ error: 'not deleted due to internal error please try again ' })
        console.log(error)
    }
})
app.post('/user/reviews/update/', verify_auth_token, async (req, res) => {
    console.log(req.body.reviewId)
    try {

        // const data = {
        //      movieName: req.body.movieName, 
        //     tags: req.body.tags, 
        //     downloadLink: req.body.downloadLink, 
        //     description: req.body.description }
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
            res.status(201).json({ data: updatedReviews })
        }

    } catch (error) {
        console.log(error,'unable to update the review due to internal error ')
        res.status(500).json({ error: 'unable to update the review due to internal error ' })
    }
})
app.get('/reviews', async (req, res) => {
    const extractedObjects = [];
    try {
        const allReviews = await Reviews.find({}, 'ReviewList');
        // const allReviewLists = await Reviews.aggregate([{$project: {ReviewList: 1}}]);
        if (allReviews) {
            allReviews.forEach(reviewListDoc => {
                reviewListDoc.ReviewList.forEach(review => {
                    extractedObjects.push(review);
                });
            });
            // console.log(extractedObjects)
            res.status(200).json({ data: extractedObjects });
        }

    } catch (error) {
        res.status(500).json({ error: 'please try again ' })
    }


    // res.status(200).json({error:'we are working on you request '})
})







app.get('/review/comments/:reviewId', async (req, res) => {
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
            res.status(200).json({ data: comments })
        }

    } catch (error) {
        res.status(500).json({ error: "internal server error" })
        console.log(error)
    }
})

app.post('/user/comment/add', verify_auth_token, async (req, res) => {
    // req.body.reviewId
    // req.body.comment
    const user = await UserProfile.findById({ _id: req.user_id })
    const data = {
        reviewId: req.body.reviewId,
        commentUserName: user.userName,
        commentUserId: req.user_id,
        commentDescription: req.body.comment
    }
    const notification = {
        reviewId: req.body.reviewId,
        reviewName: '',
        senderUserName: user.userName,
        senderUserId: req.user_id,
        message: ' has commented on your review ',
        createdCommentId: '',
        commentedOnCommentId:'',
        commentedOnComment:'',
        commentDescription: req.body.comment,
        seen: false,
    }
    try {
        if (user) {
            const comment = await Comments.create(data)
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
                    if (data) {
                        console.log('notification for :', receiver, "hass ben send")
                        // console.log(notification)
                    }
                } else {
                    console.log('same user')
                }


                return res.status(201).json({ data: comment })
            }
        }
        res.status(500).json({ error: 'internal server error' })

    } catch (error) {
        res.status(500).json({ error: 'internal server error' })
    }
})

app.post('/user/comment/reply', verify_auth_token, async (req, res) => {
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

app.get('/comment/reply/more/:reviewId/:commentId', async (req, res) => {
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
        res.status(500).json({ error: 'internal server error ' })
        console.log(error)
    }
})

app.get('/user/comment/delete/:commentId/:parentId', verify_auth_token, async (req, res) => {

    const commentId = req.params.commentId
    try {
        if (req.params.parentId !== 'none') {
            // console.log(req.params.parentId)
            const removeFromParent = await Comments.findByIdAndUpdate({ _id: req.params.parentId }, { $pull: { 'replies': commentId } })
        }

        // const comment = await Comments.findOneAndDelete({ _id: req.params.commentId })
        // if (comment.replies) {
        //     console.log("replies are there ")
        //     const result = await Comments.deleteMany({ _id: { $in: comment.replies } })
        //     console.log(result)
        //     return res.status(204).json({ data: result })
        // }

        // Define a recursive function to delete replies and their nested replies
        const deleteRepliesRecursively = async (commentId) => {
            const comment = await Comments.findOneAndDelete({ _id: commentId });
            if (comment.replies) {
                for (const reply of comment.replies) {
                    await deleteRepliesRecursively(reply)
                }
            }
        };
        await deleteRepliesRecursively(commentId);
        // console.log(removeFromParent)
        console.log('deleted succesfull')
        return res.status(204).json({ data: 'successfully deleted' })
    } catch (error) {
        res.status(500).json({ error: 'internal server error' })
        console.log(error)
    }
})



app.post('/user/comment/update', verify_auth_token, async (req, res) => {
    try {

        const result = await Comments.findByIdAndUpdate({ _id: req.body.commentId }, { $set: { commentDescription: req.body.commentDescription } })
        console.log(result)
        res.status(200).json({ error: 'working on your request' })
    } catch {
        res.status(500).json({ error: 'internal server error ' })
    }
    // res.status(200).json({error:'working on your request'})
})


app.get('/user/notifications',verify_auth_token,async (req,res)=>{
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

app.listen(port, () => {
    console.log(`app is running on ${port} `)
})