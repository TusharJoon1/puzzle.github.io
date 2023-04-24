const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const crypto=require('crypto');
const multer=require('multer');

const axios=require('axios')
const cheerio=require('cheerio')
const cors=require('cors')
app.use(cors())

let flag=false;

const {sendMail}=require('./nodemailer')

const jwt=require('jsonwebtoken');
const JWT_KEY='ygjdsbvfukjfn';

  //  res.cookie('isLoggedIn',true);
  //  console.log(req.cookies.isLoggedIn);


  const authRouter=express.Router();

const userModel=require('./userModel');
// const protectRouter=require('./protectRouter')


authRouter.route('/signup')
.get(getsignup)
.post(postsignup)


authRouter.route('/login')
.get(getlogin)
.post(postlogin)





authRouter.route('/:id')
// .get(userbyid)
.patch(updateUser)
.delete(deleteUser)


//multer for fileupload
const multerStorage=multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,'./public\images')
  },

  filename:function(req,file,cb){
    cb(null,`user-${Date.now()}.jpeg`)
  }
})

const filter=function(req,file,cb){
  if(file.mimetype.startsWith("image")){
    cb(null,true)
  }
  else{
    cb(new Error("Not an Image! please upload an image"),false)
  }
}

const upload=multer({
  storage:multerStorage,
  fileFilter:filter
});

authRouter.post("/ProfileImage",upload.single('photo'),updateProfileImage);
//get request
authRouter.get('/ProfileImage',(req,res)=>{
  res.sendFile('./multer.html',{root:__dirname});
  // res.sendFile('./signup1.html',{root:__dirname});
})



function updateProfileImage(req,res){

  console.log("updated photo");
  res.json({
    message:'file uploaded sucessfully'
  });
}



// profile page  main

  authRouter.use(protectRouter)
authRouter.route('/profile')
.get(home,getUser)

authRouter.route('/profile2')
.get(home2,getUser)

// authRouter.use(isAuthorised(['admin']))
authRouter.route('/admin')
.get(getalluser);

authRouter.route('/page1')
.get(getpage1)

authRouter.route('/page2')
.get(getpage2)

authRouter.route('/page3')
.get(getpage3)



authRouter.route('/forgetpassword')
.post(forgetpassword)

authRouter.route('/resetpassword/:token')
.post(resetpassword)

authRouter.route('/logout')
.get(logout)




// .authRouter.route('/cooki')
// .get(cooki)



function logout(req,res){
  if(req.cookies.login){
    res.cookie('login',' ',{maxAge:1});
    res.json({
      message:"user logged out sucessfully"
    });
  }
  else{
    //browser se req
    const client=req.get('User-Agent');
    if(client.include("Mozilla")==true){
      return res.redirect('/login');

    }
    //postman se req
    res.json({
      message:"please login"
    });
  }

 
}

async function forgetpassword(req,res){
let {email}=req.body;
try{
  const user=await userModel.findOne("email=email");
  if (user){
    //create new token
    const resetToken=user.createResetToken();
    //   https://abc.com/resetpassword/resettoken
   let resetpasswordlink=`${req.protocol}://${req.get('host')}/resetpassword/${resetToken}`;
 
   //send mail to user
   let obj={
    resetpasswordlink:resetpasswordlink,
    email:email
   }
   sendMail("resetpassword",obj);
  }
  else{
    return res.json({
      message:"please signup"
    }); 
  }
  
}
catch(err){

    return res.json({
      message:"Invalid please login"
    }); 
}
}


async function resetpassword(req,res){
  const token=req.params.token;
  let {password,confirmpassword}=req.body;
  const user=await userModel.findOne({resetToken:token});

  //reset passwordhandler change password in db
  if(user){
    user.resetpasswordhandler(password,confirmpassword);
    await user.save();
   
    res,json({
     message:"Password change sucessfully",
    });
  }
  else{
    return  res,json({
      message:"user not found",
     });
  }

}

// all function

async function adminpage(res,req){
  let alluser=await userModel.find();

  // console.log('data from db is ',alluser);

  res.json(alluser);
  // res.json({
  //   message:'LIst of all user',
  //   data:alluser
  //   });
}


function getpage1(req,res){
  res.sendFile('./page1.html',{root:__dirname});
}

function getpage2(req,res){
  res.sendFile('./page3.html',{root:__dirname});
}

function getpage3(req,res){
  res.sendFile('./towerofhanoiaj.html',{root:__dirname});
}





function home2(req,res,next){
  console.log("check id in home",req.id);
  if(req.id){
    res.sendFile('./home2.html',{root:__dirname});
    next();
  }
  else{
    return res.json({
      message:'User not found in home'
    });
  }
}

function home(req,res,next){
  console.log("check id in home",req.id);
  if(req.id){
    res.sendFile('./home.html',{root:__dirname});
    next();
  }
  else{
    return res.json({
      message:'User not found in home'
    });
  }
}

async function getUser(req,res){
   let id=req.id;
  

   console.log(" id id",id);
   let user=await userModel.findById(id);
    console.log("user in getuser after login profile",user);
   if(user){
    console.log("reached here");
    return 
   
   }
   else{
    return res.json({
      message:'User not found'
    });

   }
}


async function updateUser(req,res){
  let id=req.params.id;
  let user=await userModel.findById(id);
  let dataTobeUpdated=req.body;
  if(user){
    const keys=[];
    for(let key in dataTobeUpdated){
      keys.push(key);
    }
    for(let i=0;i<keys.length;i++){
      user[keys[i]]=dataTobeUpdated[keys[i]];
    }
    const updatedData=await user.save();
    res.json({
      message:"DATA UPDATED SUCESSFULLY",
      data:user
    });
  }
  else{
    res.json({
      message:"User not found",
     
    });
  }
  // let user=await userModel.findById(id);

}

async function deleteUser(req,res){
  let id=req.params.id;
  let user=await userModel.findByIdAndDelete(id);

    if(!user){
      return res.json({
        message:"Empty field"
      });
  }
  else{
    res.json({
      message:"data deleted sucessfully"
     });
  }
 

} 

function getlogin(req,res){
  res.sendFile('./login.html',{root:__dirname});
};


async function postlogin(req,res){
 
  let data=req.body;
  
  if(!data.email){
    return res.json({
      message:"Empty field"
    });
  }
  let user=await userModel.findOne({email: data.email});
  //user contain all details with given emaill
try{
  if(user){
    //bcrypt not used
  if(user.password==data.password){
    console.log('user login');
        flag=true

       // flag=true;
      // res.cookie('isLoggedIn',true);
        //   let Uid=user['_id'];   //Uid
        //  let token=jwt.sign({payload:Uid},JWT_KEY);
        //  res.cookie('login',token,{httpOnly:true});
        const token = jwt.sign({ id: user._id }, JWT_KEY);
        console.log("token",token);

        res.cookie('login', token, { maxAge: 60*30* 1000 });
    return res.json({
       
      message:"USER LOGGED IN",
      data:user
      //userdata:user  //full data show 
    });
  }
  else{
    return res.json({
      message:"DATA NOT FOUND(pass)"
    });
  }
  }
  else{
    return res.json({
      message:"DATA NOT FOUND"
    });
  }
  
}
catch(err){
  return res.json({
    message:"Invalid message"
  })
}
  
}



async function getalluser(req,res){ 
  let alluser=await userModel.find();

  console.log('data from db is ',alluser);

  res.json({
    message:'LIst of all user',
    data:alluser
    });

}


// function userbyid(req,res){
//   console.log(req.params.id);
//   //user is a array of userperson
//   let paramID=req.params.id;
//   let obj={};
//   for(let i=0;i<user.length;i++){
//     if(user[i]['id']==paramId){
//       obj=user[i];
//     }

//   }
//   res.json({
//     message:"klsn ssas",
//     data:obj

//   });
// }

function getsignup(req,res){
  res.sendFile('index.html',{root:__dirname});
}


async function postsignup(req,res){
  let obj=req.body;
  let user=await userModel.create(obj);  //CRUD OPERATION
  console.log('backend',obj);
  sendMail("postsignup",user);
  

  if(user){
    console.log("in user");
  //  res.redirect('/auth/login');
    res.json({
      message:"user",
      data:obj
    });
  }
  else{
    res.json({
      message:"Something went Wrong try with proper cresenditial",

    });
  }
  
}



  //IS AUTHORISED FUNCTION 

  function isAuthorised(roles){  //roles==admin
    return function(req,res,next){
      if(roles.includes(req.role)==true){
        next();
      }
   
    
    else{
      res.status(401).json({
        message:"Unotharised user isAuthorised"
        
      });
      
    }
   };
  };
  


  async function protectRouter(req,res,next){
    let token;
    
      if(req.cookies.login ){
        console.log("cookie in protectRouter",req.cookies.login);
        token=req.cookies.login;
        let payload=jwt.verify(token,JWT_KEY);
        if(payload){
          const user=await userModel.findById(payload.id);
          console.log('payload:m id::' ,user);
          req.role=user.role;
          req.id=user.id;
          console.log('payload:m id::' ,req.id);
          flag=false;
          next();

        }
      
        else{
            return res.json({
                message:"Not a accesed user pleade try"
              });
        }
   
      } 
      else{ 
        return res.json({
          message:"please Login in"
        });
      }
  }

  


module.exports=authRouter;
