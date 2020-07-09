var express = require("express");
var router = express.Router();
var Accommodation = require("../models/accommodation");
var Comment = require("../models/comment");
var Review = require("../models/review");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

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
	geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
		console.log(err);
      req.flash("error", "Invalid address.");
      return res.redirect("back");
    };
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newAccommodation = {name: name, image: image, description: desc, location: location, lat: lat, lng: lng, price: price, author: author};
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
});

// NEW route
router.get("/new", middleware.isLoggedIn, (req, res) => {
   res.render("accommodations/new"); 
});

// SHOW - shows more info about one accommodation
router.get("/:id", function(req, res){
    //find the accommodation with provided ID
    Accommodation.findById(req.params.id).populate("comments").populate({
		path: "reviews",
		options: {sort: {createdAt: -1}}
	}).exec(function(err, foundAccommodation){
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
router.put("/:id", middleware.isAccommodationOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address.");
      return res.redirect("back");
    }
    req.body.accommodation.lat = data[0].latitude;
    req.body.accommodation.lng = data[0].longitude;
    req.body.accommodation.location = data[0].formattedAddress;

    Accommodation.findByIdAndUpdate(req.params.id, req.body.accommodation, function(err, accommodation){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/accommodations/" + accommodation._id);
        }
    });
  });
});

// DESTROY
// router.delete("/:id", middleware.isAccommodationOwnership, (req, res) => {
// 	Accommodation.findByIdAndRemove(req.params.id, (err) => {
// 		if (err) {
// 			res.redirect("/accommodations");
// 		} else {
// 			req.flash("error", "Accommodation Deleted.")
// 			res.redirect("/accommodations");
// 		}
// 	});
// });

// DESTROY ACCOMMODATION ROUTE
router.delete("/:id", middleware.isAccommodationOwnership, function (req, res) {
    Accommodation.findById(req.params.id, function (err, accommodation) {
        if (err) {
            res.redirect("/accommodations");
        } else {
            // deletes all comments associated with the accommodation
            Comment.remove({"_id": {$in: accommodation.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/accommodations");
                }
                // deletes all reviews associated with the accommodation
                Review.remove({"_id": {$in: accommodation.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/accommodations");
                    }
                    //  delete the accommodation
                    accommodation.remove();
                    req.flash("success", "Accommodation Deleted.");
                    res.redirect("/accommodations");
                });
            });
        }
    });
});

module.exports = router;