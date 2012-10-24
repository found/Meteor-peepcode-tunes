Albums = new Meteor.Collection("albums");
Player = new Meteor.Collection("player");

var audio;

var player,
    playlist = [],
    paused = false,
    current = {
      album: 0,
      track: 0
    };

player = {
  playlist: playlist,
  current: current,
  playing: false,
};

play = function(song) {
	console.log("PLAYING SONG");
	console.log(song);
	var pl = Player.findOne();
	if (!pl.playlist.length) return;
	
	Player.update({_id: pl._id}, {$set: {"current.track": song.title, "playing": true}});
	
	if (pl.playing) audio.src = song.url;
	audio.play();
}

pause = function() {
	pl = Player.findOne();
	console.log(pl);
	if (pl.playing) {
		audio.pause();
		Player.update({_id: pl._id}, {$set: {"playing": false}});
	}
}

reset = function(){
	console.log("RESET");
	pause();
	var pl = Player.findOne();
	Player.update({_id: pl._id}, {$set: {"current.album": 0, "current.track":0}});
}

if (Meteor.isClient) {
	
	audio = new Audio();

	Template.library.albums = function () {
		console.log("oatheu");
		return Albums.find();
	};
	
	Template.playlist.playing = function() {
		return false;
	};
	
	Template.playlist.albumsInPlaylist = function() {
		var pl = Player.findOne();
		if (pl)
			return pl.playlist;
		else 
		return "";
	};
	
	Template.album.events({
		'click': function (evt) {
			// if (playlist.indexOf(this) != -1) return;
			// playlist.push(this);
			var album = this;
			// delete album['_id'];
			console.log(album);
			
			var pl = Player.findOne();
			console.log("WHY");
			console.log(pl);
			
			if (Player.findOne({"playlist.title": album.title}) == undefined) {
				Player.update({_id: pl._id}, {$addToSet: {playlist: album}});
		}
	}
	});
	
	Template.albumPl.isCurrent = function(title) {
		var player = Player.findOne();
		var current = player.current.album;
		
		if (typeof current == 'number') {
			var currentTitle = player.playlist[current].title;
			if (title == currentTitle)
				return "current";
			else
				return "";
		} else {
			if (title == current)
				return "current";
			else
				return "";
		}
		
	};
	
	Template.track.isCurrent = function(title) {
		var player = Player.findOne();
		var currentAlbum = player.current.album;
		var currentTrack = player.current.track;
				
		if (typeof currentTrack == 'number') {
			var currentTitle = player.playlist[currentAlbum].tracks[currentTrack].title;
			if (title == currentTitle)
				return "current";
			else
				return "";
		} else {
			if (title == currentTrack)
				return "current";
			else
				return "";
		}
	};
	
	Template.albumPl.events({
		'click .remove': function (evt) {
			var album = this;
			var pl = Player.findOne();
			console.log(pl.current.album);
			console.log(album.title);
			if (album.title == pl.current.album) {
				reset();
			}
			Player.update({_id: pl._id}, {$pull: {playlist: album}});
		}
	});
	
	Template.track.events({
		'click .track': function(evt) {
			console.log(this);
			var song = this;
			play(song);
		}
	});
	
	Template.test.events({
		'click button': function (evt) {
			Meteor.call("play", "cool");
			console.log("CLICKKED IT");
		}
	});

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
		console.log(player);
		Player.insert(player);
		var pl = Player.findOne();
		Player.update({_id: pl._id}, {$set: {"playing": false}});
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

Meteor.methods({
	play: function(track, album) {
		console.log(player);
		console.log(playlist);
    // if (!playlist.length) return;
    // 
    // if (angular.isDefined(track)) current.track = track;
    // if (angular.isDefined(album)) current.album = album;
    // 
    // if (!paused) audio.src = playlist[current.album].tracks[current.track].url;
    // audio.play();
    // player.playing = true;
    // paused = false;
  },

  pause: function() {
    if (player.playing) {
      audio.pause();
      player.playing = false;
      paused = true;
    }
  },

  reset: function() {
    player.pause();
    current.album = 0;
    current.track = 0;
  },

  next: function() {
    if (!playlist.length) return;
    paused = false;
    if (playlist[current.album].tracks.length > (current.track + 1)) {
      current.track++;
    } else {
      current.track = 0;
      current.album = (current.album + 1) % playlist.length;
    }
    if (player.playing) player.play();
  },

  previous: function() {
    if (!playlist.length) return;
    paused = false;
    if (current.track > 0) {
      current.track--;
    } else {
      current.album = (current.album - 1 + playlist.length) % playlist.length;
      current.track = playlist[current.album].tracks.length - 1;
    }
    if (player.playing) player.play();
  }, 
	playlistAdd: function(album) {
		  // if (playlist.indexOf(album) != -1) return;
		  // playlist.push(album);
		Playlist.update(album)
	}, 
	playlistRemove: function(album) {
		  var index = playlist.indexOf(album);
		  if (index == current.album) player.reset();
		  playlist.splice(index, 1);
	}
});
