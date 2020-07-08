var express = require("express");
var router = express.Router();
var Accommodation = require("../models/accommodation");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//INDEX - show all accommodations
router.get("/", function(req, res){
    // Get all accommodations from DB
    Accommodation.find({}, function(err, allAccommodations){
       if(err){
           console.log(err);
       } else {
          res.render("accommodations/index",{accommodations: allAccommodations});
       }
    });
});

//CREATE - add new accommodation to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to accommodations array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
	var price = req.body.price;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
    var newAccommodation = {name: name, image: image, description: desc, price: price, author: author}
    // Create a new accommodation and save to DB
    Accommodation.create(newAccommodation, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to accommodations page
			req.flash("success", "New accommodation added successfully.")
            res.redirect("/accommodations");
        }
    });
});

// NEW route
router.get("/new", middleware.isLoggedIn, (req, res) => {
   res.render("accommodations/new"); 
});

// SHOW - shows more info about one accommodation
router.get("/:id", function(req, res){
    //find the accommodation with provided ID
    Accommodation.findById(req.params.id).populate("comments").exec(function(err, foundAccommodation){
        if(err){
            console.log(err);
        } else {
            //render show template with that accommodation
			var currentUser = req.user;
			// console.log(foundAccommodation.author.id);// how to get id of currentUser
			// console.log(req.user._id); // id of accommodation

            res.render("accommodations/show", {accommodation: foundAccommodation, currentUser:currentUser});
        }
    });
});

// EDIT accommodation
router.get("/:id/edit", middleware.isAccommodationOwnership, (req, res) => {
	Accommodation.findById(req.params.id, (err, foundAccommodation) => {
		if (err) {
			console.log(err);
		} else {
		res.render("accommodations/edit", {accommodation: foundAccommodation});
		}
	});
});

// UPDATE
router.put("/:id", (req,res) => {
	Accommodation.findByIdAndUpdate(req.params.id, req.body.accommodation, (err, updatedAccommodation) => {
		if (err) {
			res.redirect("/accommodations");
		} else {
			res.redirect("/accommodations/" + req.params.id);
		}
	});
});

// DESTROY
router.delete("/:id", middleware.isAccommodationOwnership, (req, res) => {
	Accommodation.findByIdAndRemove(req.params.id, (err) => {
		if (err) {
			res.redirect("/accommodations");
		} else {
			req.flash("error", "Accommodation Deleted.")
			res.redirect("/accommodations");
		}
	});
});



module.exports = router;