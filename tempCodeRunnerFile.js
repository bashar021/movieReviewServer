
// app.get('/details', verify_auth_token, async (req, res) => {
//     try {
//         const user = await UserProfile.findById({ _id: req.user_id });
//         const reviews = await Reviews.findOne({ _id: req.user_id })
//         if (user) {
//             // console.log(user)
//             return res.status(200).json({ data: { userDetails: user, reviews: reviews } });

//         }
//     }
//     catch (error) {
//         res.status(500).json({ error: 'internal server error please try again later ' })
//     }
// })
