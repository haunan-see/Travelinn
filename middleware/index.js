
var Accommodation = require("../models/accommodation");
var Comment = require("../models/comment");
var middlewareObject = {

	isAccommodationOwnership: (req, res, next) => {
		if (req.isAuthenticated()){
			Accommodation.findById(req.params.id, function(err, foundAccommodation){
				if (err) {
					req.flash("error", "Accommodation not found.");
					res.redirect("back");
				} else {
					if (foundAccommodation.author.id.equals(req.user._id)){
						next();
					} else {
						req.flash("error", "Permission Denied.");
						res.redirect("back");
					}
				}
			});
		} else {
			req.flash("error", "Log in required.");
			res.redirect("back");
		}
	},

	isCommentOwnership: (req, res, next) => {
		if (req.isAuthenticated()){
			Comment.findById(req.params.comment_id, function(err, foundComment){
				if (err) {
					res.redirect("back");
				} else {
					if (foundComment.author.id.equals(req.user._id)){
						next();
					} else {
						req.flash("error", "Permission Denied.");
						res.redirect("back");
					}
				}
			});
		} else {
			req.flash("error", "Log in required.");
			res.redirect("back");
		}
	},

	isLoggedIn: (req, res, next) => {
		if (req.isAuthenticated()){
			return next();
		}
		req.flash("error", "Log in required.");
		res.redirect("/login");
	}
	
};

module.exports = middlewareObject;