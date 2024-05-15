"strict"
const express = require('express')
const app = express()
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken'); // for user authentication 
var dotenv = require('dotenv').config();
var cookieParser = require('cookie-parser')
const Reviews = require('./schema_modals/Reviews.js')
const ConnectToDb = require('./db.js') // importing mongodb connection 
const cors = require('cors');
const server = require('http').createServer(app);
const io = require('socket.io')(server,{
    cors: {
      origin: 'http://localhost:3000',
      methods:['GET','POST']
    }
  });

const port = process.env.PORT || 8080


// app.use(cors({ origin: false })); //origin false means  that blocked all teh other origin requests 
// app.use(cors({ origin: process.env.CLIENT_URL,methods: ['GET', 'POST','PUT', 'DELETE'],credentials: true }));
// app.use(cors({ credentials: true }))
app.use(cors());

// app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(express.json()) 
// app.use('/static', express.static((path.join(__dirname, 'public'))))
// app.set('views', path.join(__dirname, 'views'));  


// routes 
app.use('/user',require('./routes/userloginsignup.js'))
app.use('/user/watchlist',require('./routes/watchList.js')) 
app.use('/user/comment',require('./routes/comments.js'))
app.use('/user/review',require('./routes/reviews.js'))
app.use('/user/details',require('./routes/userdetails.js'))
app.use('/user/notifications',require('./routes/notification.js'))


ConnectToDb()  // calling the mongodb connection function exported from the db.js




io.on('connection', client => {
    client.on('event', data => {
        console.log('user is online ')
    });
    client.on('disconnect', () => {
        console.log('user is offline ')
    } );
  });


app.get('/', (req, res) => {
    res.send('hii')
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
            return res.status(200).json({ data: extractedObjects });
        }

    } catch (error) {
        return res.status(500).json({ error: 'please try again ' })
    }
})

app.listen(port, () => {
    console.log(`app is running on ${port} `)
})