var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Accommodation = require("../models/accommodation");
var middleware = require("../middleware");

// Root route
router.get("/", (req, res) => {
    res.render("landing");
});


// AUTH ROUTE
// show register form
router.get("/register", (req, res) => {
	res.render("register");
});

// handle sign up logic
router.post("/register", (req, res) => {
	var newUser = new User({username: req.body.username, firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email});
	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			req.flash("error", err.message + ".");
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, () => {
			req.flash("success", "Hello, " + user.lastName + ". Welcome to Travelinn.");
			res.redirect("/accommodations");
		});
	});
});

// Show login form
router.get("/login", (req, res) => {
	res.render("login");
})

// handle login logic
router.post("/login", passport.authenticate("local", 
		{
			successRedirect: "/accommodations", 
			successFlash: "Welcome back.",
			failureRedirect: "/login",
			failureFlash: "Please enter correct username and password."
		}), (req, res) => {
	console.log(User.username);
});

// LOGOUT ROUTE
router.get("/logout", (req, res) => {
	req.logout();
	req.flash("danger", "You've logged out.");
	res.redirect("/accommodations");
});


// USER PROFILE
router.get("/users/:id", (req, res) => {
	User.findById(req.params.id, (err, foundUser) => {
		if (err) {
			req.flash("error", err.message + ".");
			res.redirect("back");
		} else {
			res.render("users/profile", {user: foundUser});
		}
	})
});

// EDIT USER PROFILE
router.get("/users/:id/edit", middleware.isAccountOwner, (req, res) => {
	User.findById(req.params.id, (err, foundUser) => {
		if (err) {
			console.log(err);
		} else {
		var currentUser = req.user;
		res.render("users/edit", {user: foundUser, currentUser: currentUser});
		}
	});
});

// UPDATE USER PROFILE
router.put("/users/:id", middleware.isAccountOwner, (req, res) => {
    User.findByIdAndUpdate(req.params.id, req.body.user, (err, updatedUser) => {
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Profile Edited Successfully!");
            res.redirect("/users/" + updatedUser._id);
        }
  });
});

module.exports = router;
