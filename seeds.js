const mongoose = require("mongoose");
var Accommodation = require("./models/accommodation");
var Comment = require("./models/comment");

// var data = [
// 	{
// 		name: "The Parkland", 
//         image: "https://images.unsplash.com/photo-1571992579655-8134e2b8df0b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
//         description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
// 		price: 120
//     },
//     {
//         name: "Mesa Resort", 
//         image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
//         description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
// 		price: 150
//     },
//     {
//         name: "Canyon Floor", 
//         image: "https://images.unsplash.com/photo-1542928658-22251e208ac1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1267&q=80",
//         description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
// 		price: 100
// 	}
// ];

function seedDB(){
	// Remove all accommodations
	Accommodation.deleteMany({}, function(err){
		if (err) {
			console.log(err);
		}
		console.log("Accommodations removed.");
		// add new accommodations
		// data.forEach(function(seed){
		// 	Accommodation.create(seed, function(err, accommodation){
		// 		if (err) {
		// 			console.log(err);
		// 		} else {
		// 			console.log("Accommodation added.");
		// 			// create comment
		// 			Comment.create({
		// 				text: "Great accommodation, will be better with Internet.",
		// 				author: "Jayden"
		// 			}, function(err, comment){
		// 				if (err) {
		// 					console.log(err);
		// 				} else {
		// 					accommodation.comments.push(comment);
		// 					accommodation.save();
		// 					console.log("New comment added.");
		// 				}
		// 			});
		// 		}
		// 	})
		// })
	})
}

module.exports = seedDB;