import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';
import * as AD from './artists.json';
import * as new_artists from './united.json';
import _ from 'underscore';

const Artists = new Mongo.Collection('artists');

if (Meteor.isServer) {

	const response = Artists.find({ data: { $exists: true }}).fetch();
	
	const genre = _.groupBy(response, "genre");

	_.each(genre['comedy'], (i) => {
		Artists.remove(i);
	});

	const authorizeUrl = "https://accounts.spotify.com";
	const spotifyWebAPIUrl = "https://api.spotify.com/v1";

	Meteor.methods({
		OAuth () {
			const result = HTTP.call("GET", authorizeUrl + "/authorize", {params: {
				client_id : "bdb6255dfd2146a9834228d1562831c5",
				client_secret : "2ec6366dfe58446f8fa3444464504223",
				redirect_uri: "http://localhost:3000/",
				response_type: "code"
			}});

			return result;
		},
		map(){
			return HTTP.call("GET", "http://maps.googleapis.com/maps/api/js?key=AIzaSyCnorYnHzyF3e2HivyBpjgdk87hqSDT0nk");
		},
		getArtistData (artist) {
			return HTTP.call("GET", spotifyWebAPIUrl + "/search?q=" + artist + "&type=artist");
		},
		getArtistShows (artist) {
			return HTTP.call("GET", "http://api.bandsintown.com/artists/" + artist + "/events.json?api_version=2.0&app_id=ONTOUR_1638&date=all");
		},
		getArtistCollection () {
			return new_artists;
		},
		getArtists(){
			return Artists.find({ data: { $exists: true }}).fetch();
		}
	});
};

export default Artists;