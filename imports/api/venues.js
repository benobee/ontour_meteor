import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import * as VD from './venues.json';
import _ from "underscore";

const Venues = new Mongo.Collection('venues');

if (Meteor.isServer) {

// const array = Venues.find().fetch();
// _.each(array, (i) => {
// 	Venues.remove(i);
// });

	Meteor.methods({
		'venue.dataFetch'() {
			return VD;
		},
		'venue.insert'(item){
			Venues.insert(item);
		},
		'venue.getAll'() {
			return Venues.find().fetch();
		}
	});
};

export default Venues;