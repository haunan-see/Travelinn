var express = require("express");
var router = express.Router({mergeParams: true});
var Accommodation = require("../models/accommodation");
var Review = require("../models/review");
var middleware = require("../middleware");

// REVEIEW INDEX
router.get("/", (req, res) => {
	Accommodation.findById(req.params.id).populate({
		path: "reviews",
		options: {sort: {createdAt: -1}}
	}).exec((err, accommodation) => {
		if (err || !accommodation) {
			req.flash("error", err.message);
			// console.log(req.params.author.id);
			return res.redirect("back");
		}
		// TROUBLESHOOT
		
		 // Review.findById(accommodation.reviews, (err, foundReview) => {
		 // if (err) {
		 // req.flash("error", err.message);
		 // return res.redirect("back");
		 // }
			// console.log(foundReview.author.username);
			//  console.log(accommodation.reviews);
			 // console.log(foundReview.author.username);
			var currentUser = req.user;
			res.render("reviews/index", {accommodation: accommodation, currentUser: currentUser});
		// });
	});
});

// NEW REVIEW
router.get("/new", middleware.isLoggedIn, middleware.isReviewExist, (req, res) => {
	// check if user is logged in and reviewed the post
	Accommodation.findById(req.params.id, (err, accommodation) => {
		if (err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
		res.render("reviews/new", {accommodation: accommodation});
	});
});

// CREATE REVIEW
router.post("/", middleware.isLoggedIn, middleware.isReviewExist, (req, res) => {
	Accommodation.findById(req.params.id).populate("reviews").exec((err, accommodation) => {
		if (err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
		Review.create(req.body.review, (err, review) => {
			if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
			//add author username/id and associated campground to the review
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            review.accommodation = accommodation;
            //save review
            review.save();
            accommodation.reviews.push(review);
            // calculate the new average review for the accommodation
            accommodation.rating = calculateAverage(accommodation.reviews);
            //save accommodation
            accommodation.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect("/accommodations/" + accommodation._id);
		});
	});
});

// EDIT REVIEW
router.get("/:review_id/edit", middleware.isReviewOwner, function (req, res) {
    Review.findById(req.params.review_id, function (err, foundReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/edit", {accommodation_id: req.params.id, review: foundReview});
    });
});

// UPDATE REVIEW
router.put("/:review_id", middleware.isReviewOwner, function (req, res) {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Accommodation.findById(req.params.id).populate("reviews").exec(function (err, accommodation) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate accommodation average
            accommodation.rating = calculateAverage(accommodation.reviews);
            //save changes
            accommodation.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/accommodations/' + accommodation._id);
        });
    });
});

// DELETE REVIEW
router.delete("/:review_id", middleware.isReviewOwner, function (req, res) {
    Review.findByIdAndRemove(req.params.review_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Accommodation.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function (err, accommodation) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate accommodation average
            accommodation.rating = calculateAverage(accommodation.reviews);
            //save changes
            accommodation.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/accommodations/" + req.params.id);
        });
    });
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
};


module.exports = router;