let mongoose=require('mongoose');

let jobSchema=new mongoose.Schema({
  name:String,
  address:String,
  image: String,
	package: Number,
	description: String
});

//Creating model.It's first letter is always capital.It takes collection name as first arg.
let Job=mongoose.model('job',jobSchema);
module.exports=Job;
