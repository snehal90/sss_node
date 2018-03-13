$(document).ready(function() {
	$(document).on('click', '.link_slide', function(ev) {
		ev.preventDefault();
		$('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top -80
        }, 2000, 'swing');
		console.log($(this).attr('href'), ":::href");
	});
});

/* ==========  START GOOGLE MAP ========== */
if($('#map-canvas').length != 0) {
    // When the window has finished loading create our google map below
    google.maps.event.addDomListener(window, 'load', init);
}

function init() {
    // Basic options for a simple Google Map
    // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions

        var myLatLng = new google.maps.LatLng(19.1628567,72.8761027);

        var mapOptions = {
            zoom: 17,
            center: myLatLng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
            // disableDefaultUI: true,
            // scrollwheel: false,
            // navigationControl: true,
            // mapTypeControl: false,
            // scaleControl: false,
            // draggable: true,

        // How you would like to style the map. 
        // This is where you would paste any style found on Snazzy Maps.
        // styles: [{
        //     featureType: 'water',
        //     stylers: [{
        //         color: '#46bcec'
        //     }, {
        //         visibility: 'on'
        //     }]
        // }, {
        //     featureType: 'landscape',
        //     stylers: [{
        //         color: '#f2f2f2'
        //     }]
        // }, {
        //     featureType: 'road',
        //     stylers: [{
        //         saturation: -100
        //     }, {
        //         lightness: 45
        //     }]
        // }, {
        //     featureType: 'road.highway',
        //     stylers: [{
        //         visibility: 'simplified'
        //     }]
        // }, {
        //     featureType: 'road.arterial',
        //     elementType: 'labels.icon',
        //     stylers: [{
        //         visibility: 'off'
        //     }]
        // }, {
        //     featureType: 'administrative',
        //     elementType: 'labels.text.fill',
        //     stylers: [{
        //         color: '#444444'
        //     }]
        // }, {
        //     featureType: 'transit',
        //     stylers: [{
        //         visibility: 'off'
        //     }]
        // }, {
        //     featureType: 'poi',
        //     stylers: [{
        //         visibility: 'off'
        //     }]
        // }]
    };

    // Get the HTML DOM element that will contain your map 
    // We are using a div with id="map" seen below in the <body>
    var mapElement = document.getElementById('map-canvas');

    // Create the Google Map using our element and options defined above
    var map = new google.maps.Map(mapElement, mapOptions);

    // Let's also add a marker while we're at it
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(19.1628567,72.8761027),
        map: map,
        // icon: 'img/icons/map-marker.png',
    });
}

// ========== END GOOGLE MAP ========== //