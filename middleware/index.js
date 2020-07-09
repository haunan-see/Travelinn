var Accommodation = require("../models/accommodation");
var Comment = require("../models/comment");
var Review = require("../models/review");

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
	
	isReviewExist: (req, res, next) => {
		if (req.isAuthenticated()) {
			Accommodation.findById(req.params.id).populate("reviews").exec(function (err, foundAccommodation) {
				if (err || !foundAccommodation) {
					req.flash("error", "Accommodation not found.");
					res.redirect("back");
				} else {
					// check if req.user._id exists in foundAccommodation.reviews
					var foundUserReview = foundAccommodation.reviews.some(function (review) {
						return review.author.id.equals(req.user._id);
					});
					if (foundUserReview) {
						req.flash("error", "You already wrote a review.");
						return res.redirect("/accommodations/" + foundAccommodation._id);
					}
					// if the review was not found, go to the next middleware
					next();
				}
			});
		} else {
			req.flash("error", "Log in required.");
			res.redirect("back");
		}
	},
	
	isReviewOwner: (req, res, next) => {
		if(req.isAuthenticated()){
			Review.findById(req.params.review_id, function(err, foundReview){
				if(err || !foundReview){
					res.redirect("back");
				}  else {
					// does user own the comment?
					if(foundReview.author.id.equals(req.user._id)) {
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