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



var cl = null;

function locationSuccess(pos) {
    let coords = pos.coords;

    socket.emit("getCurrentLocation", coords.latitude, coords.longitude, callback => {
        console.log("LOCATION::", callback);
        if (callback.address != undefined) { loc.value = `${callback.address}`;}
    });

    return;
    let address = fetch(`/currentLocation?lat=${coords.latitude}&lng=${coords.longitude}`)
        .then(response => response.json())
        .then((cl) => { console.log(cl); if (cl.address !== undefined) { loc.value = `${cl.address}`; } });
    
    
}
function locError(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`)
}

navigator.geolocation.getCurrentPosition(locationSuccess, locError, locationOptions);
