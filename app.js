if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
console.log(process.env.SECRET);
const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();
const monogoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js")
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport = require("passport");
const flash = require("connect-flash");
const LocalStatergy = require("passport-local");
const User = require("./models/user.js");

main().then((res)=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect(dbUrl);
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate); 
app.use(express.json())
app.use(express.static(path.join(__dirname,"/public")))

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret : process.env.SECRET,
    },
    touchAfter : 24 * 3600 //sec
})

store.on("error",()=>{
    console.log("Error in MONGO SESSION STORE",err);
});

const sessionOptions = {
    store,
    secret : process.env.SECRET || "mySuperSecretCode",
    resave : false,
    saveUnitialized : true,
    cookie : {
        expires : Date.now() * 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
}



app.use(session(sessionOptions));
app.use(flash());

//AUTHENITCATION
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStatergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//ROOT PAGE
// app.get("/",(req,res)=>{
//     res.send("Hi i am Root Page");
// });

//FLASH MIDDLEWARE
app.use((req,res,next)=>{
    res.locals.currUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})
app.use("/listings",listingRouter);
app.use("/listings",reviewsRouter);
app.use("/",userRouter);

// //DEMO USER
// app.get("/demouser",async (req,res)=>{
//     let fakeUser = new User({
//         email : "student@gmail.com",
//         username : "delta-student"
//     });
//     let registeredUser = await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })

//ERROR PAGE
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
})

//MIDDLEWARE
app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong"} = err;
    res.render("listings/error.ejs",{err});
})

//LISTEN
app.listen(8080,()=>{
    console.log("port is listening on 8080");
})