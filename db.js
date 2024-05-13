var mongoose = require('mongoose');
var {Schema} = mongoose;

function db(){
  mongoose.set('strictQuery', false);
  mongoose.connect(process.env.DB_URL,{ useNewUrlParser: true, useUnifiedTopology: true  })
  .then(() => console.log('Connected!'))
  .catch(err=> console.log(err));
}
module.exports = db;