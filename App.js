const express = require('express');
const { default: mongoose } = require('mongoose');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.listen(3000,()=>{
    console.log('server is listening port 3000');
});

//mini app
const userRouter = express.Router();
app.use('/user',userRouter);

userRouter
.route('/')
.get(midddleware1,getUsers) 
.post(postUser) 
.patch(updateUser)
.delete(deleteUser)

userRouter
.route('/setCookie')
.get(setCookie)  

userRouter
.route('/getCookie')
.get(getCookie) 

//middleware1
function midddleware1(req,res,next){
    console.log("middleware1 called");
    next();
}

async function getUsers(req,res){
    console.log("getUsers called");
    let allUsers = await userModel.find();
    // console.log(allUsers);
    res.json({
        message:"List of all Users from dB",
        data:allUsers
    });
}

async function postUser(req,res){
    // console.log(req.body);
    let user = await userModel.create(req.body);
    res.json({
        Message: "Data is received",
        data: user
    })
}

async function updateUser(req,res){
    // for(key in req.body){
    //     user[key] = req.body[key];
    // }
    let user = await userModel.findOneAndUpdate({email:'abc@gmail.com'},req.body);
    res.json({
        message:"Data successfully updated",
        data:user
    })
}

async function deleteUser(req,res){
    let user = await userModel.findOneAndDelete({email:'abc@gmail.com'});
    res.json({
        message:"Data successfully deleted",
        data:user
    })
}

// Connect mongodB
//TODO -> get db_link from website dB and Add your password
const db_link = '<momgodb uri>';
mongoose.connect(db_link)
.then((db)=>{
    // console.log(db);
    console.log('Database Connected');
})
.catch((err)=>{
    console.log(err);
})

//Make Schema (document format)
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: function(){
            return emailValidator.validate(this.email);
        }
    },
    password: {
        type: String,
        required: true,
        minlength:8,
        maxlength:15
    },
    confirmPassword: {
        type: String,
        required: true,
        minlength:8,
        maxlength:15,
        validate: function(){
            return this.confirmPassword===this.password;
        }
    },

})

//Remove redundant data from being saved (Before Model)
userSchema.pre('save',function(){
    this.confirmPassword = undefined;
})

// Hashed Password
userSchema.pre('save',async function(){
    const salt = await bcrypt.genSalt();
    const hashedString = await bcrypt.hash(this.password,salt);
    // console.log(hashedString);
    this.password = hashedString;
})

//Make model (collection) and connect model to schema
const userModel = mongoose.model('userModel', userSchema);

// Cookies
function setCookie(req,res){
    // res.setHeader('set-cookie','isLoggedIn=false');
    res.cookie('isLoggedIn',true,{maxAge:1000*60*60*24, secure:true, httpOnly:true});
    res.cookie('isPrime',false);
    res.send('cookies has been set');
}

function getCookie(req,res){
   let cookies = req.cookies;
   console.log(cookies);
   res.send('cookies recevied');
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//.findOne() -> search specific key

//C = .create() -> used for POST
//R = .find() -> used for GET
//U = .findOneAndUpdate() -> used for PATCH
//D = .findOneAndDelete() -> used for DELETE

/*
An ObjectId is a 12-byte BSON type having the following structure −
- The first 4 bytes representing the seconds since the unix epoch
- The next 3 bytes are the machine identifier
- The next 2 bytes consists of process id
- The last 3 bytes are a random counter value
- MongoDB uses ObjectIds as the default value of _id field of each document, which is generated while the creation of any document. 
The complex combination of ObjectId makes all the _id fields unique.
*/

// Hooks -> post and pre (middleware)
/*
//Middleware for save.
//Before Save event occurs in dB
userSchema.pre('save',()=>{
    console.log('before saving in dB',this);
})

//After Save event occurs in dB
userSchema.post('save',(doc)=>{
    console.log('after saving in dB',doc);
})

// // Only document middleware
// userSchema.pre('remove', { document: true, query: false }, function() {
//     console.log('Removing doc!');
//   });
  
// // Only query middleware. This will get called when you do `Model.remove()`
// // but not `doc.remove()`.
// userSchema.pre('remove', { query: true, document: false }, function() {
//     console.log('Removing!');
//   });

userSchema.pre('remove', function() { 
    console.log('Removing!'); 
});

doc.remove();       // Prints "Removing!"

Model.remove();     // Does **not** print "Removing!". Query middleware for `remove` is not executed by default.

// All pre('validate') and post('validate') hooks get called before any pre('save') hooks.

*/
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Validate e-mails - use NPM or use RegX, Npm (validator) using here.
// write validate key in schema which takes a callback function as value.
