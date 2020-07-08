const express 		   = require("express"),
	  app 			   = express(),
	  bodyParser 	   = require("body-parser"),
	  mongoose 		   = require("mongoose"),
	  flash			   = require("connect-flash"),
	  passport 		   = require("passport"),
	  LocalStrategy    = require("passport-local"),
	  methodOverride   = require("method-override"),
	  Accommodation    = require("./models/accommodation"),
	  Comment 		   = require("./models/comment"),
	  User 			   = require("./models/user"),
	  seedDB 		   = require("./seeds");

const commentRoutes    = require("./routes/comments"),
	  accommodationRoutes = require("./routes/accommodations"),
      indexRoutes      = require("./routes/index");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

mongoose.connect("mongodb://localhost:27017/travelinn", {
        // useCreateIndex:true,
		useFindAndModify: false,
        useUnifiedTopology:true,
        useNewUrlParser:true
    }).then( () => {
          console.log("Connected To Travelinn DataBase");
      }).catch((err) => {
        console.log("DataBase Connection Error " + err);
});


// seedDB();

// MOMENT.JS
app.locals.moment = require("moment");

// 	PASSPORT CONFIG
app.use(require("express-session")({
	secret: "Bypassed",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// FLASH MESSAGE
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   res.locals.info = req.flash("info");
   res.locals.danger = req.flash("danger");
   next();
});

// Require ROUTES
app.use("/accommodations", accommodationRoutes);
app.use("/accommodations/:id/comments", commentRoutes);
app.use(indexRoutes);

app.listen(3000, () => {
	console.log("Travelinn server started...");
})