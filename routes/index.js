var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

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
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			req.flash("error", err.message + ".");
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, () => {
			req.flash("success", "Hello, " + user.username + ". Welcome to Travelinn.");
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


module.exports = router;
