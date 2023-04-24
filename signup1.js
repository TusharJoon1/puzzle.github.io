
const express=require('express');

const cookieParser = require('cookie-parser');

const app=express();
app.use(cookieParser());
const cors=require('cors')
app.use(cors())


let flag=false;


app.listen(5000);
app.use(express.json());

//learn the case of id;
//that why we make router;
const authRouter=require('./authRouter');
app.use('/auth',authRouter);

