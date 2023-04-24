const mongoose=require("mongoose");
const emailvalidator=require('email-validator');
const bcrypt=require('bcrypt'); 

const db_link='mongodb+srv://Admin:4o69mMB0GYgmlNDe@cluster0.oyk4qg8.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(db_link)
.then(function(db){
    console.log("db connected");

});

//SCHEMA
const userSchema=mongoose.Schema({
  name:{
      type:String,
      required:true
  },
email:{
  type:String,
  required:true,
  unique:true,
  validator:function(){
      return emailvalidator.validate(this.email);
  }
  //this se hum pura schema mil jayega
},
password:{
  type:String,
  require:true,
  minLength:8
},
confirmPassword:{
  type:String,
  require:true,
  minLength:8,
  validate:function(){
      return this.confirmPassword=this.password
  }
},
role:{
  type:String,
  enum:['admin','user','resturantowner','dileveryboy'],
  default:'user'
},
profileOImage:{
  type:String,
  default:'img/user/default.jpeg'
},
resetToken:String
});




//use of HOOKS to do some work before or after save in database
//with the help of .pre and .post
// this se hum pura schema mil jayega
userSchema.pre('save',function(){
  this.confirmPassword=undefined
});

// userSchema.pre('save',async function(){
//   console.log('introducing salt ');
//     let salt=await bcrypt.genSalt();
//     let hashedString=await bcrypt.hash(this.password,salt);
//    this.password=hashedString;
//   });


userSchema.methods.createResetToken=function(){
  //creating unique token using npm i crypto
  const resetToken=crypto.randomBytes(32).toString("hex");
  this.resettoken=resetToken;
  return resetToken;
}


userSchema.methods.resetpasswordhandler=function(password,confirmpassword){
   this.password=password;  //this.password mr=eans schema ka password
   this.confirmpassword=confirmpassword;
   this.resetToken=undefined;
}

//model
const userModel=mongoose.model('userModel',userSchema);
module.exports=userModel;

 


//-=-=-=--=-=-=-===-==-==-==-==-==-user to check
// (async function createUser(){
//   let user={
//       name:'Meena',
//       email:'rty=h@gmail.com',
//       password:'12345675',
//       confirmPassword:'12345678'
//   };
// let data=await userModel.create(user);
// console.log(data);

// })();
