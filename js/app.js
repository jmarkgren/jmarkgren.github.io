//Create global variables
var map;
var markers = [];
var infoWindow;

//Hardcoded restaurant locations for map
var restaurants = [
  {title: 'Cafe Nicolas', location: {lat: -33.421020, lng: -70.606640}},
  {title: 'Flanner\'s Irish Pub', location: {lat: -33.417150, lng: -70.601728}},
  {title: 'Insert Coin', location: {lat: -33.427433, lng: -70.618138}},
  {title: 'Italita', location: {lat: -33.423880, lng: -70.607210}},
  {title: 'La Mechada Nacional', location: {lat: -33.422159, lng: -70.608724}},
  {title: 'Liguria', location: {lat: -33.428310, lng: -70.619139}},
  {title: 'Lomit\'s', location: {lat: -33.423880, lng: -70.612827}},
  {title: 'The Black Rock', location: {lat: -33.418958, lng: -70.603924}},
  {title: 'Poké Bar', location: {lat: -33.414486, lng: -70.601975}}
]



var Restaurant = function(location, i){
  this.title = location.title;
  this.marker = markers[i];
};

var ViewModel = function (){
  var self = this;

  self.userInput = ko.observable('');

  //self.message = ko.observable('');

  self.restaurantsList = ko.observableArray([]);

  restaurants.forEach(function(location, i) {
    self.restaurantsList.push(new Restaurant(location, i));
  });

  //self.currentRestuarant = ko.observable( self.restaurantsList()[0] );
  // self.openInfoWindow = function(location) {
  //   google.maps.event.trigger(location.marker, 'click')
  // }


  //List of all restaurants
  self.filterableList = ko.computed(function() {
    // Convert user input to lower case
    var filterText = self.userInput().toLowerCase();
    self.restaurantsList().forEach(function(place) {
      place.marker.setVisible(true);
    });
    return self.restaurantsList();
  });


// Synchronizes location menu list to coorosponding markers evoking actions when triggered with click.
// Examples of click binding from: http://knockoutjs.com/documentation/click-binding.html

  self.openInfoWindow = function(location){
    var marker = location.marker;
    google.maps.event.trigger( marker, 'click' );
  };
};

var initMap = function() {
  // Constructor creates a new map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.417728, lng: -70.611727},
    zoom: 14,
  });


  var bounds = new google.maps.LatLngBounds();

  //Loop to use the location array to create markers
  for (var i = 0; i < restaurants.length; i++) {
    var position = restaurants[i].location;
    var title = restaurants[i].title;

    //Create a marker for every location and put into the markers array
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });

    //Push marker to array
    markers.push(marker);
    //Create onclick event to open an info window for each marker
    marker.addListener('click', function(){
      var marker = this;
      populateInfoWindow(marker, marker.title);
    });

    bounds.extend(markers[i].position);
  }
  // Allows a pop up window when user clicks on a marker
  var infowindow = new google.maps.InfoWindow({
    maxWidth:250
  });
  //Extend the boundaries of the map for each marker
  map.fitBounds(bounds);

  var infoWindow = new google.maps.InfoWindow();
  ko.applyBindings(new ViewModel());

  //Funtion that populates the info window when the marker is clicked
  // only one info window will show up at a time
  populateInfoWindow = function(marker, name) {
    //Check to make sure the info window isn't already open on this marker
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent('<div>' + marker.title + '</div>');
      infowindow.open(map, marker);
      //make sure the marker is properly cleared if hte window is closed
      infowindow.addListener('closeclick',function(){
        infowindow.setmarker = null;
      });
    }
  }
};
