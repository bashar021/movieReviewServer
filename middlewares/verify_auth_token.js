
var jwt = require('jsonwebtoken'); // for user authentication 
function verifyAuthToken(req, res, next) {
    jwt.verify(req.headers.jwt, process.env.SECRET_KEY, function (err, result) { // verifying the user from its auth token with the help of middelware 
        if (err) {
            return res.status(401).json({ error: "session expired please login", }) //  if the auth token is invalid return 'pleas login'
        } else {
            req.user_id = result.user.id
            next()//  if the auth token is valid move ahead
        }
    })

}
module.exports = verifyAuthToken
