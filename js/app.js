//Create global variables
var map;
var markers = [];
var infoWindow;

//Hardcoded restaurant locations for map
var restaurants = [{
  title: 'Nicolas',
  venue: '4c62e07bde1b2d7fba55e370',
  location: {
    lat: -33.421020,
    lng: -70.606640
  }},
  {
    title: 'Flanner\'s Irish Pub',
    venue: '4b5fc3def964a520f3cb29e3',
    location: {
      lat: -33.417150, lng: -70.601728
    }},
  {
    title: 'Insert Coin',
    venue: '54de97f3498e2232c9e3bf34',
    location: {
      lat: -33.427433,
      lng: -70.618138
    }},
  {
    title: 'La Mechada Nacional',
    venue: '54286265498e5abfe7469a3b',
    location: {
      lat: -33.422159,
      lng: -70.608724}},
  {
    title: 'Liguria',
    venue: '4b5279b8f964a520097f27e3',
    location: {
      lat: -33.428310,
      lng: -70.619139}},
  {
    title: 'Lomit\'s',
    venue: '4b44cc8df964a52083fc25e3',
    location: {
      lat: -33.423880,
      lng: -70.612827}},
  {
    title: 'The Black Rock',
    venue: '4fdfcc28e4b02857f08c186e',
    location: {
      lat: -33.418958,
      lng: -70.603924}}
];

//Restaurant constructor
var Restaurant = function(location, i){
  this.title = location.title;
  this.marker = markers[i];
};

//Create a ViewModel for the restaurant list
var ViewModel = function (){
  var self = this;

  self.filter = ko.observable('');

  self.restaurantsList = ko.observableArray([]);

  restaurants.forEach(function(location, i) {
    self.restaurantsList.push(new Restaurant(location, i));
  });

  //Create the list of all restaurants with filtering capability
  //Simple example of filtering found at https://stackoverflow.com/questions/29667134/knockout-search-in-observable-array
  //More complex example of filtering an array found at http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
  self.filterableList = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    //Show all restaurants by default
    if (!filter) {
      self.restaurantsList().forEach(function(place) {
      place.marker.setVisible(true);
    });
      return self.restaurantsList();
      //Filter results based on user input and show only matching names and markers
    } else {
        return ko.utils.arrayFilter(self.restaurantsList(), function(place) {
          var title = place.title.toLowerCase();
          var marker = place.marker;
          var match = title.indexOf(filter) !== -1;
            if (!match) {
              marker.setVisible(false);
            } else {
              marker.setVisible(true);
            }
            return match;
        });
    }
  });
  //Open the info window for the corresponding marker/restaurant name
  self.openInfoWindow = function(location){
    var marker = location.marker;
    google.maps.event.trigger( marker, 'click' );
  };
};

var initMap = function() {
  // Create a new map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.417728, lng: -70.611727},
    zoom: 14,
  });
  //Create a bounds variable to set the bounds of the map later on
  var bounds = new google.maps.LatLngBounds();

  //Loop to use the restaurants array & create a marker for each one
  for (var i = 0; i < restaurants.length; i++) {
    var position = restaurants[i].location;
    var title = restaurants[i].title;
    var venue = restaurants[i].venue;

    //Create a marker for every location and put into the markers array
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      venue: venue,
      animation: google.maps.Animation.DROP,
      icon: 'img/markpoint.png',
      id: i
    });

    //Push marker to array
    markers.push(marker);
    //Open the info window when a marker is clicked
    marker.addListener('click', function(){
      var marker = this;
      populateInfoWindow(marker, marker.title);
      marker.setIcon('img/markpoint-active.png');
    });
    //Use the markers to set the bounds of the map
    bounds.extend(markers[i].position);
  }
  //Extend the boundaries of the map for each marker
  map.fitBounds(bounds);

  // Allow a pop up window when user clicks on a marker
  var infowindow = new google.maps.InfoWindow({
    maxWidth:250
  });

  var infoWindow = new google.maps.InfoWindow();
  ko.applyBindings(new ViewModel());



  //Funtion that populates the info window when the marker is clicked
  // only one info window will show up at a time
  populateInfoWindow = function(marker, title) {
    //Check to make sure the info window isn't already open on this marker
    if (infowindow.marker != marker) {
      infowindow.marker = marker;

      //make sure the marker is properly cleared if the window is closed
      infowindow.addListener('closeclick',function(){
        infowindow.setmarker = null;
        marker.setIcon('img/markpoint.png');
      });
    }

    //Use Foursquare API to display address, price tier
    //Set the Foursquare venue value
    var foursquareVenue = marker.venue;

    //Use foursquare venue number to create foursquare url
    var foursquareURL = 'https://api.foursquare.com/v2/venues/' +
    foursquareVenue +
    '?&client_id=5ATN4OQMRW4ETRIO2JLNNQMJYKYIHOKWBPAGJFINYYRYXBX5' +
    '&client_secret=UQ5RAMV0H2LFV534MD5LVPOBMJCN0QOE2P1CPMXNLNFBLVJL&v=20171002';
    //Request info from foursquare api
    $.ajax({
      type: "GET",
      url: foursquareURL,
      dataType: "json",
      success: function(data) {
        var name = marker.title;

        //Store response from Foursquare
        var venueData = data.response.venue;

        //Define the info that will appear in info window
        var address = venueData.location.address;
        //This is a trick so that undefined data will still be returned
        var price = venueData && venueData.price && venueData.price.message;

        //Set the info window content and open it
        infowindow.setContent('<h5>' + name + '</h5>' +
          '<p>' + address + '</p>' +
          '<p>' + 'Price: ' + price + '</p>');
        infowindow.open(map, marker);

      },
      error: function (textStatus, errorThrown) {
        //Set the info window error content and open it
        infowindow.setContent('<h5>' + marker.title + '</h5>' +
          '<p>' + 'Foursquare data temporarily unavailable' + '</p>');
        infowindow.open(map, marker);
      }
    });
  };
};

function googleError () {
  alert("Google Maps is temporarily unavailable, please try again later.");
}

