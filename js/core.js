
function viewModel() {
    this.searchO = ko.observable("");
    this.markers = [];
    this.start = function() {
              var map = new google.maps.Map(document.getElementById('map'), {
              center: {lat: -15.7922334, lng: -47.8851567}, 
              zoom: 15
              });


              var largeInfowindow = new google.maps.InfoWindow();
              // The following group uses the location array to create an array of markers on initialize.
              for (var i = 0; i < locations.length; i++) {
                  var mTitle = locations[i].title;
                  var Latt = locations[i].lat;
                  var Longit = locations[i].lng;
                  // Create a marker per location, and put into markers array.
                  var marker = new google.maps.Marker({
                    map: map,
                    position: {lat: Latt, lng: Longit},
                    title: mTitle,
                    lat: Latt,
                    lng: Longit,
                    id: i,
                    animation: google.maps.Animation.DROP
                  });
                  marker.setMap(map);
                 this.markers.push(marker);
                 marker.addListener('click', function() {
                    populateInfoWindow(this, largeInfowindow);
                  });
              }
    } 

    this.start();

        // This block appends our locations to a list using data-bind
        // It also serves to make the filter work
        this.Filter = ko.computed(function() {
            var result = [];
            for (var i = 0; i < this.markers.length; i++) {
                var markerLocation = this.markers[i];
                if (markerLocation.title.toLowerCase().includes(this.searchO().toLowerCase())) {
                    result.push(markerLocation);
                    this.markers[i].setVisible(true);
                } else {
                    this.markers[i].setVisible(false);
                }
            }
            return result;
        }, this);  
}

       this.populateInfoWindow = function(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          // Clear the infowindow content to give the streetview time to load.
          infowindow.setContent('');
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
        
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }

          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }
          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        


      var apiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
                marker.lat + ',' + marker.lng + '&client_id=' + 'RWNDOVPGXCP4DMT32E5J4YVQYO13QNDAQOV1MJT2MPTTTKBQ' +
                '&client_secret=' + 'EGWZ10Q0PP0YFQ0CWZZA5QCXBAYBEGXPOEYGVAMMYFE0RYZB' + '&query=' + marker.title +
                '&v=20190114' + '&m=foursquare'; // Foursquare API
            $.getJSON(apiUrl).done(function(marker) {
                var response = marker.response.venues[0];
                this.street = response.location.formattedAddress[0];
                this.city = response.location.formattedAddress[1];
                this.zip = response.location.formattedAddress[3];


                this.htmlContentFoursquare =
                    '<h6 class="iw_addresstitle"> Address: </h6>' +
                    '<p class="iw_address">' + this.street + '</p>' +
                    '<p class="iw_address">' + this.city + '</p>' +
                    '<p class="iw_address">' + this.zip + '</p>' +
                    '</p>' + '</div>' + '</div>';
                infowindow.setContent(this.htmlContentFoursquare);
            }).fail(function() {
                // Send alert
                window.alert(
                    "Something is wrong,Please refresh your page to try again."
                );
              });

      }


}

function initMap() {
    ko.applyBindings(new viewModel());
}