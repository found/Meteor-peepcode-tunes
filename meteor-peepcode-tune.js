Albums = new Meteor.Collection("albums");


if (Meteor.isClient) {
	Template.library.albums = function () {
		console.log("oatheu");
		return Albums.find();
	};

  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
	// var alb = Albums.findOne();
	// console.log(alb.tracks);
	
	if (Albums.find().count() === 0) {
	
	Meteor.http.get("http://localhost:3000/albums.json", function(err, dat) {
		var albums = JSON.parse(dat.content);
		Albums.insert(albums[0]);
		Albums.insert(albums[1]);
		// for (var i = 0; i < 2; i++) {
		// 	console.log(albums[i].tracks);
		// }
		// Albums.insert({name: albums[i].title, artist: albums[i].artist, tracks: albums[i].tracks});
	});
} else {
	console.log("Database already loaded");
}
    // code to run on server at startup
  });
}
