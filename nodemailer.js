// "use strict";
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
module.exports.sendMail=async function sendMail(str,data) {

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'tusharjoon190@gmail.com', // generated ethereal user
      pass: 'ygonfmycbzrvljqf', // generated ethereal password
    },
  });

 var Osubject,Otext,Ohtml;
 if(str=="postsignup"){
    Osubject=`Thanks u for signing ${data.name}`;
    Ohtml=`
    <h1> Welcome to Puzzle Mater </h1>
    hope u have a good time!
    here are your details--
   <div> Name - ${data.name}</div>
    Email-${data.email}
    `
 }
 else if(str=="resetpassword"){
    Osubject=`Reset Password`;
    Ohtml=`
    <h1> Puzzle.com image.png</h1>
   <h3> here is the link to reset password --</h3>
  <h6> ${data.resetpasswordlink}<h6>`
 }

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Puzzle Master " <tusharjoon190@gmail.com>', // sender address
    to: data.email, // list of receivers
    subject: Osubject, // Subject line
     // plain text body
    html: Ohtml, // html body
  });

  console.log("Message sent: %s", info.messageId);
  
};

// sendMail().catch(console.error);