let lat = 34.2454653;
let lng = -118.5286373;
let zoomLevel = 13;

// Create the map
const map = L.map('map').setView([lat, lng], zoomLevel);

// Add OpenStreetMap tiles
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Create marker
let marker = L.marker([lat, lng]).addTo(map);

marker.bindPopup('Current location').openPopup();

// Get HTML elements
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const submitButton = document.getElementById('submit-button');
const convertButton = document.getElementById('convert-button');
const output_easting = document.getElementById('easting');
const output_northing = document.getElementById('northing');
const output_zone = document.getElementById('zone');

// Function to move the map
function goToLocation() {

    const latitude = parseFloat(latitudeInput.value);
    const longitude = parseFloat(longitudeInput.value);

    // Check if values are numbers
    if (isNaN(latitude) || isNaN(longitude)) {
        alert('Please enter both latitude and longitude.');
        return;
    }

    // Check latitude
    if (latitude < -90 || latitude > 90) {
        alert('Latitude must be between -90 and 90.');
        return;
    }

    // Check longitude
    if (longitude < -180 || longitude > 180) {
        alert('Longitude must be between -180 and 180.');
        return;
    }

    // Move map
    map.setView([latitude, longitude], 15);

    // Move marker
    marker.setLatLng([latitude, longitude]);

    // Update popup
    marker
        .setPopupContent(
            'Latitude: ' + latitude +
            '<br>Longitude: ' + longitude
        )
        .openPopup();
}

// Submit button
submitButton.addEventListener('click', goToLocation);

// Press Enter in latitude input
latitudeInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        goToLocation();
    }
});

// Press Enter in longitude input
longitudeInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        goToLocation();
    }
});

function convert(){
    let latitude = parseFloat(latitudeInput.value);
    //Zone Letter check
    let list = ["C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X"];
    let calc = Math.floor(latitude/8)+10;
    let zone_letter = ""
    //if the calculation is less than 0 or more than 19 it's out of bounds
    // from -80 to 80, set zone_letter to "Z"
    if(calc <0 || calc > 19)
        zone_letter = "Z"
    else zone_letter = list[Math.floor(latitude/8)+10]
    //special case for X from 72 to 84
    if(latitude<=84 && latitude>=72)
        zone_letter = list[19]//list[19]="X"

    let longitude = parseFloat(longitudeInput.value);
    let south_hemisphere = false
//if latitude is negative that means it's on south hemisphere
//meaning you add 10,000,000 to the final northing
    if (latitude < 0)
        south_hemisphere = true

    z = Math.floor((longitude+180)/6)+1;
    console.log("z is "+z);
    let central_meridian = 6 * z - 183;
    console.log("central_meridian is "+central_meridian);

//convert to radians
    latitude = latitude * Math.PI / 180.0;
    longitude = longitude * Math.PI / 180.0;
    central_meridian = central_meridian * Math.PI / 180.0;

//WGS84 values:
    let a = 6378137.0;
    let e_squared = 0.00669438;

    let N = a/(Math.sqrt(1.0-(e_squared*(Math.sin(latitude)*Math.sin(latitude)))));

    let T = Math.tan(latitude)*Math.tan(latitude);

    let e_primed_squared = e_squared / (1.0-e_squared);

    let C = e_primed_squared * (Math.cos(latitude)*Math.cos(latitude));

    let A = Math.cos(latitude)*(longitude-central_meridian);

    let A0 = 1 - (e_squared/4.0) - ((3.0*e_squared*e_squared)/64.0) - ((5.0*e_squared*e_squared*e_squared)/256.0);
    let A2 = ((3.0*e_squared)/8.0) + ((3.0*e_squared*e_squared)/32.0) + ((45.0*e_squared*e_squared*e_squared)/1024.0);
    let A4 = ((15.0*e_squared*e_squared)/256.0) + ((45.0*e_squared*e_squared*e_squared)/1024.0);
    let A6 = (35.0*e_squared*e_squared*e_squared)/3072.0;

    let Meridional_arc = a*((A0*latitude)-(A2*Math.sin(2.0*latitude))+(A4*Math.sin(4.0*latitude))-(A6*Math.sin(6.0*latitude)));

    let k0 = 0.9996
    let easting = 500000.0 + (k0*N*(A+(((1.0-T+C)*A*A*A)/6.0)+(((5.0-(18.0*T)+(T*T)+(72.0*C)-(58.0*e_primed_squared))*A*A*A*A*A)/120.0)));
    let northing = k0*(Meridional_arc+N*Math.tan(latitude)*(((A*A)/2.0)+(((5.0-T+(9.0*C)+(4.0*C*C))*A*A*A*A)/24.0)+(((61.0-(58.0*T)+(T*T)+(600.0*C)-(330.0*e_primed_squared))*A*A*A*A*A*A)/720.0)));
    if (south_hemisphere)
        northing = northing+10000000;


    output_easting.value = easting + "E";
    output_northing.value = northing + "N";
    output_zone.value = z+zone_letter;
}
convertButton.addEventListener('click', convert);

// ---- Saved locations (only active when logged in) ----
const saveButton = document.getElementById('save-button');
const savedMarkers = L.layerGroup().addTo(map);

async function loadFinds() {
    const res = await fetch('/api/finds');
    if (!res.ok) return;

    const finds = await res.json();
    savedMarkers.clearLayers();
    finds.forEach(f => {
        L.marker([f.latitude, f.longitude])
            .bindPopup('Saved find<br>Lat: ' + f.latitude + '<br>Lng: ' + f.longitude)
            .addTo(savedMarkers);
    });
}

async function saveFind() {
    const latitude = parseFloat(latitudeInput.value);
    const longitude = parseFloat(longitudeInput.value);

    if (isNaN(latitude) || isNaN(longitude)) {
        alert('Enter a valid latitude and longitude first.');
        return;
    }

    const res = await fetch('/api/finds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: latitude, longitude: longitude })
    });

    if (res.ok) {
        loadFinds();
    } else {
        const err = await res.json();
        alert(err.error || 'Could not save.');
    }
}

if (isLoggedIn && saveButton) {
    saveButton.addEventListener('click', saveFind);
    loadFinds();
}
