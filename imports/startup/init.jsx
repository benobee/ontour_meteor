import React, {PropTypes, Component} from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { Mongo } from 'meteor/mongo';
import { Session } from 'meteor/session';

import Artists from '../api/artists.js';
import Venues from '../api/venues.js';

import _ from 'underscore';
import $ from 'jquery';

import util from '../util/util.js';
import App from '../ui/App.jsx';

if(Meteor.isClient){

	Meteor.startup(() => {
		const APIcall = {
			data(artist){

				const artistName = util.removeDiacritics(artist.name);

				Meteor.call("getArtistData", artistName, (error, response) => {
					if(error) { 
						console.log("error data: " + artistName);
					} else {

						if (response.data.artists.items.length > 0) {

							Artists.update({_id: artist._id}, {
								$set: {
									data: response.data.artists.items[0]
								} 
							});

							console.log("updated: " + artist.name + " data");
						}
					}
				});				
			},
			events(artist){

				const artistName = util.removeDiacritics(artist.name);

				return Meteor.call("getArtistShows", artistName, (error, response) => {
					if(error) {
						console.log("error events: " + artistName);
					} else {
						//console.log(response);

						Artists.update({_id: artist._id}, {
							$set: {
								events: response.data
							} 
						});

						console.log("updated: " + artist.name + " " + response.data.length + " events");				
					}
				});
			}
		};

		Meteor.call("getArtists", (error, response) => {
			if(error) {
				console.log(error);
			}  

			const genre = _.groupBy(response, "genre");

			console.log(genre);

			// let counter = [];

			// const APIcallThrottle = setInterval( () => {
			// 	counter.push(1);

			// 	console.log(counter.length - 1, response.length);

			// 	const data = APIcall.data(response[counter.length - 1]);
			// 	//const events = APIcall.events(response[counter.length - 1]);

			// 	if (response.length == counter.length) {
			// 		clearInterval(APIcallThrottle);
			// 	}
			// }, 1000);

			//render(<App data={response} />, document.querySelectorAll('#render-target')[0]);
	
		});
	});
}

