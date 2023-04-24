

const jwt=require('jsonwebtoken');
const JWT_KEY='ygjdsbvfukjfn';


 async function protectRouter(req,res,next){
    let token;
      if(req.cookies.login ){
        console.log(req.cookies);
        token=req.cookies.login;
        let payload=jwt.verify(token,JWT_KEY);
        if(payload){
          const user=await userModel.findbyId(payload.payload);
          req.role=user.role;
          req.id=user.id;
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
          message:"Login again"
        });
      }
    }

// module.exports=protectRouter;