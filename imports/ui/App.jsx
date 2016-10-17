import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import { Meteor } from 'meteor/meteor';
import Fuse from 'fuse';

const MarkerClusterer = require('node-js-marker-clusterer');

class App extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = 'App';

        this.state = {
        	data: this.props.data,
            googleMaps: false,
            activeMarkers: []
        };

        this.artists = this.props.data;
        this.composeEvents();
        this.composeVenues();
        //this.cities = _.groupBy(this.events, "city");
        //this.countries = _.groupBy(this.events, "city");

        console.log(this);
    }
    searchVenues(keys, value){

        const options = {
            include: ["score"],
            shouldSort: true,
            tokenize: true,
            matchAllTokens: true,
            threshold: 0.05,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            keys: keys
        };

        let fuse = new Fuse(this.venues, options);

        return results = fuse.search(value);

    }
    composeEvents(){
        let array = [];

        _.each(this.state.data, (i) => {
            _.each(i.events, (show) => {
                _.extend(show.venue, 
                    {tags: i.data.genres}, 
                    {category: i.genre},
                    {name: i.name}, 
                    {avg_ticket_sold: i.avg_tickets_sold},
                    {avg_ticket_revenue: i.avg_ticket_revenue});
            });

            array = array.concat(i.events);
        });

        array = _.map(array, (i) => {
            return i.venue;
        });

        this.events = array;
    }
    composeVenues() {
        let array = _.groupBy(this.events, "place");

        array = _.map(array, (show, index) => {

             const venue = {
                name: index,
                city: show[0].city,
                region: show[0].region,
                latitude: show[0].latitude,
                longitude: show[0].longitude,
                tokenize: true,
                country: show[0].country,
                tags: []
             }

             _.each(show, (artist) => {
                venue.tags = venue.tags.concat(artist.tags);
             });

             venue.tags = _.groupBy(venue.tags);

             const count = Object.keys(venue.tags).length;

             venue.tags = _.map(venue.tags, (tag, index) => {
                return { 
                    name : index, 
                    weight: tag.length / count
                }
             });

             venue.tags = _.sortBy(venue.tags, "weight").reverse();

             return venue;
        });

        this.venues = array;
    }
    componentDidMount(){
        this.initGoogleMaps();      
    }
    initGoogleMaps(){
        const map = Meteor.call("map", (err, response) => {
            if(err){
                console.log(err);
            }
            eval(response.content);

            this.generateMap();
        });  
    }
    componentWillUpdate(nextProps, nextState) {
        console.log(this);
    }
    generateMap(){
        this.map = new google.maps.Map(document.getElementById('mapTarget'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: 3
        });

        MarkerClusterer.prototype.onRemove = function () {
            this.setReady_(true);
        };

        this.markerCluster = new MarkerClusterer(this.map, [],
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
    }
    findVenue(e){
        e.preventDefault();

        let form = document.getElementById('findVenueForm');

        let venues = this.searchVenues(["tags.name", "city", "country", "region", "name"], form.artistName.value);

        console.log(venues);

        form.reset();

        venues = _.map(venues, (i) => {
            return i.item;
        });

        this.markerCluster.clearMarkers();

        this.setState({activeMarkers: venues});
    }
    render(){

        let venues = [];

        if(this.state.activeMarkers.length > 0){
            venues.list = this.state.activeMarkers.map((item, index) => {
                return(
                    <li key={index + "_" + item.name}>{item.name}</li>
                )
            });
        }

        if(this.map !== undefined){

            const markers = this.state.activeMarkers.map((i) => {

                const marker = new google.maps.Marker({
                    position: {lat: i.latitude, lng: i.longitude},
                    title: i.name,
                    tags: i.tags
                });

                google.maps.event.addListener(marker, 'click', function () {
                   // do something with this marker ...
                   ReactDOM.render(<div className="info-box">{this.title}</div>, document.getElementById('info-box-target'));
                }); 

                return marker;
            });



            this.markerCluster = new MarkerClusterer(this.map, markers,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
        }

        return (
        	<div id="app" className="app-container">
                <div className="title">OnTour</div>
                <div className="inputWrapper">
                    <form id="findVenueForm" onSubmit={this.findVenue.bind(this)}>
                    <input name="artistName" type="text" placeholder="enter artist name"/>
                    <input type="submit" value="Submit"/>
                    </form>
                </div>
                <div ref={"googleMap"} id="mapTarget" className="map"></div>
                <div id="info-box-target" className="info-box-container"></div>
                <div id="sidebar" className="sidebar-container"><ul>{venues.list}</ul></div>
            </div>
        );
    }
}

export default App;
