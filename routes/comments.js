var express = require("express");
var router = express.Router({mergeParams: true});
var Accommodation = require("../models/accommodation");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// COMMENT route
router.get("/new", middleware.isLoggedIn, (req, res) => {
	// find accommodation by id
	Accommodation.findById(req.params.id, (err, accommodation) => {
		if (err) {
			console.log(err);
		} else {
			res.render("comments/new", {accommodation: accommodation});
		}
	})
});

// create new comment -> connect new comment to accommodation -> redirect accommodation show page
router.post("/", middleware.isLoggedIn, (req, res) => {
		// lookup accommodation using ID
	Accommodation.findById(req.params.id, function(err, accommodation){
       if(err){
           console.log(err);
           res.redirect("/accommodations");
       } else {
			Comment.create(req.body.comment, (err, comment) => {
				if (err) {
					console.log(err);
				} else {
					// get info from author and save comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					accommodation.comments.push(comment);
					accommodation.save();
					res.redirect("/accommodations/" + accommodation._id);
				}
			})
		}
	});
});

// EDIT comment
router.get("/:comment_id/edit", middleware.isCommentOwnership, (req, res) => {
	Comment.findById(req.params.comment_id, (err, foundComment) => {
		if (err) {
			res.redirect("back");
		} else {
			res.render("comments/edit",{campground_id: req.params.id, comment: foundComment});
		}
	})
	
});

// UPDATE comment
router.put("/:comment_id", middleware.isCommentOwnership, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
		if (err) {
			res.redirect("back");
		} else {
			req.flash("info", "Comment updated.")
			res.redirect("/accommodations/" + req.params.id);
		}
	});
});

// DESTROY comment
router.delete("/:comment_id", middleware.isCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id, (err) => {
		if (err) {
			res.redirect("back");
		} else {
			req.flash("error", "Comment deleted.")
			res.redirect("/accommodations/" + req.params.id);
		}
	});
})


module.exports = router;