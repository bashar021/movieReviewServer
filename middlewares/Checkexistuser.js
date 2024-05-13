const User = require('../schema_modals/user_profile') // importing user schema
async function Checkexistuser(req,res,next){
    const email = req.body.email
    const user = await User.find({ email:req.body.email});
    // User.find({ email:req.body.email},function(err,result){ // cheking is the user with that email is eixst or not 
    //     if(err){
    //         console.log(err)
    //     }
    //     if(result != null){
    //         // 409 status code for conflict 
    //         return res.status(409).json({error:"user already signup with this account"});

    //     }else{
    //         next()
    //     }
    // })
    try {
        const existingUser = await User.findOne({ email: req.body.email });
      
        if (existingUser) {
          return res.status(409).json({ error: "User already signed up with this email" });
        } else {
          next();
        }
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
}
module.exports = Checkexistuser;