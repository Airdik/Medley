const allListingsDiv = document.getElementById('allListingsDiv');
const popup = document.getElementById('popup');
const selectedImg = document.getElementById('selectedImg');

const mapImg = document.getElementById('mapImg');
const username = document.getElementById('username');
const title = document.getElementById('title');
const userAddress = document.getElementById('userAddress');
const willingPrice = document.getElementById('willingPrice');
const description = document.getElementById('description');
const inputMsg = document.getElementById('inputMsg');
const sendMsgBtn = document.getElementById('sendMsgBtn');
const imageHolder = document.getElementById('imageHolder');

//Filter elements
const filterTitle = document.getElementById('inputTitle');
const filterDescription = document.getElementById('inputDescription');
const filterPrice = document.getElementById('inputPrice');
const searchBtn = document.getElementById('btnSearch');

var testData;

let currentListingUsersID = null;
let currentListingToken = null;

var listings = []; // This would be listing data pulled from DB
const selectedIndex = null;

const appendListings = () => {
    
    listings.forEach(listing => {
        console.log("HERE");
        const div = document.createElement('div');
        div.classList.add('individualListing');

        let data;
        let images = fetch(`/api-getListingImages?listingToken=${listing.listingToken}`)
            .then(response => response.json())
            .then(d => {
                
                console.log(data);
                data = d;
                testData = d;
                image.src = `/ListingImages/${listing.listingToken}/${data.at(0).file[0]}`; // Setting thumbnail
            });


        /////////////////
        const image = document.createElement('img');
        //image.src = `/images/indexBackground${1}.jpg`;


        image.alt = `Image ${listing.description}`;
        image.classList.add('listingImg');
        //////////////////

        const summaryDiv = document.createElement('div');
        summaryDiv.classList.add('summaryDiv');

        let usernameDiv = document.createElement('div');
        let titleDiv = document.createElement('div');
        let priceDiv = document.createElement('div');
        let descriptionDiv = document.createElement('div');

        usernameDiv.classList.add('summaryInfo', 'summaryUsername');
        titleDiv.classList.add('summaryInfo', 'summaryTitle');
        priceDiv.classList.add('summaryInfo', 'summaryPrice');
        descriptionDiv.classList.add('summaryInfo', 'summaryDescription');

        usernameDiv.innerText = listing.listingPoster;
        titleDiv.innerText = listing.listingTitle;
        priceDiv.innerText = `$${listing.price}`;
        descriptionDiv.innerText = `${listing.description.substring(0, 150)}...`

        summaryDiv.appendChild(usernameDiv);
        summaryDiv.appendChild(titleDiv);
        summaryDiv.appendChild(priceDiv);
        summaryDiv.appendChild(descriptionDiv);






        ///////////////////////
    
        // When clicked on img
        div.addEventListener('click', async () => {

            currentListingUsersID = listing.listingPosterID;
            currentListingToken = listing.listingToken;
            console.log("listingToken", currentListingToken);

            popup.style.transform = `translateY(0)`;
            // selectedImg.src = `/images/indexBackground${1}.jpg`;
            // selectedImg.alt = `Image ${listing.description}`;

            username.innerText = listing.listingPoster;
            title.innerText = listing.listingTitle;
            userAddress.innerText = listing.location;
            willingPrice.innerText = `$${listing.price}`;
            description.innerText = `${listing.description}`;
            inputMsg.placeholder = `Send ${listing.listingPoster} a message`;
            sendMsgBtn.addEventListener('click', sendMsg)

            console.log(listing.listingToken);

            // Appending images on click
            data.at(0).file.forEach((fileName) => {
                let image = document.createElement('img');
                image.src = `/ListingImages/${listing.listingToken}/${fileName}`;
                image.classList.add('listingImg');
                image.alt = "Listing Image";
                imageHolder.appendChild(image);
            })
            
            
            let locationImg = await fetch(`/getMapImage?location=${listing.location}`)
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    mapImg.src = `${data.mapUrl}`
                    mapImg.alt = "Listing location."
                
                });


        });

        div.appendChild(image);
        div.appendChild(summaryDiv);
        allListingsDiv.appendChild(div);
    });
}

function sendMsg() {
    let acceptListing = fetch(`http://localhost:3000/api-sendMessage?message=${inputMsg.value}&to=${currentListingUsersID}&listingToken=${currentListingToken}`)
        .then(response => console.log(response));
    
    
    // Clearing value then dismissing popup
    inputMsg.value = "";
    popup.click();
}

popup.addEventListener('click', (evt) => {
    if (evt.target.id != "popup") { return; }
    popup.style.transform = `translateY(-115%)`;
    popup.src = '';
    popup.alt = '';
    mapImg.src = '';
    mapImg.alt = '';
    imageHolder.innerHTML = '';  // removing all images from the popup

    sendMsgBtn.removeEventListener('click', sendMsg);
});


function clearAllListings() {
    allListingsDiv.innerHTML = "";
}

btnSearch.addEventListener('click', (evt) => {

    console.log("TITLE:",filterTitle.value);
    
    fetch(`http://localhost:3000/api-getListings?title=${filterTitle.value}&description=${filterDescription.value}&price=${filterPrice.value}`) // Filters will go in here as query params
    .then(response => response.json())
    .then(data => {
        listings = data;
        console.log(listings);
        clearAllListings();
        appendListings();



    });
})

window.onload = () => {
    console.log('Window Loaded');


    // Get listings form the api
    fetch(`http://localhost:3000/api-getListings`) // Filters will go in here as query params
        .then(response => response.json())
        .then(data => {
            listings = data;
            console.log(listings);
            appendListings();



        });

}