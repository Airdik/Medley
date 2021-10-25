const textarea = document.getElementById('description');
const loc = document.getElementById('location');
const price = document.getElementById('price');

const descriptionError = document.getElementById('description-error');
const locationError = document.getElementById('location-error');
const priceError = document.getElementById('price-error');



textarea.addEventListener('input', () => {
    let textLength = textarea.value.length;
    if (textLength < 100) {
        descriptionError.innerText = `Must be 100 characters or longer - (${textLength}/100)`;
    } else {
        descriptionError.innerText = "";
    }
});

loc.addEventListener('input', () => {
    locationError.innerText = loc.value.trim() === "" ? "Invalid" : "";
});

price.addEventListener('input', () => {
    priceError.innerText = price.value.trim() === "" ? "Invalid" : "";
});

var locationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
}

function validate(evt) {
    let no_errors = true;
    if (textarea.value.length < 100) { descriptionError.innerText = `Must be 100 characters or longer`; no_errors = false; }
    if (loc.value.trim() === "") { locationError.innerText = "Invalid"; no_errors = false; }
    if (price.value.trim() === "") { priceError.innerText = "Invalid"; no_errors = false; }
    
    return no_errors;

    
}





function locationSuccess(pos) {
    let coords = pos.coords;
    let address = fetch(`http://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&sensor=true`)
        .then(response => response.json())
        .then(data => console.log(data))
    
    console.log(pos.coords);
    loc.value = `${coords.latitude},${coords.longitude}`;
}
function locError(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`)
}

navigator.geolocation.getCurrentPosition(locationSuccess, locError, locationOptions);
