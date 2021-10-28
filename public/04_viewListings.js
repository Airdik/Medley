const allListingsDiv = document.getElementById('allListingsDiv');
const popup = document.getElementById('popup');
const selectedImg = document.getElementById('selectedImg');

const mapImg = document.getElementById('mapImg');
const username = document.getElementById('username');
const userAddress = document.getElementById('userAddress');
const willingPrice = document.getElementById('willingPrice');
const description = document.getElementById('description');
const inputMsg = document.getElementById('inputMsg');
const sendMsgBtn = document.getElementById('sendMsgBtn');

let currentListingUser = null;

var listings = []; // This would be listing data pulled from DB
const selectedIndex = null;

const appendListings = () => {
    
    listings.forEach(listing => {
        console.log("HERE");
        const div = document.createElement('div');
        div.classList.add('individualListing');


        /////////////////
        const image = document.createElement('img');
        image.src = `/images/indexBackground${1}.jpg`;

        image.alt = `Image ${listing.description}`;
        image.classList.add('listingImg');
        //////////////////

        const summaryDiv = document.createElement('div');
        summaryDiv.classList.add('summaryDiv');

        let usernameDiv = document.createElement('div');
        let priceDiv = document.createElement('div');
        let descriptionDiv = document.createElement('div');

        usernameDiv.classList.add('summaryInfo','summaryUsername');
        priceDiv.classList.add('summaryInfo', 'summaryPrice');
        descriptionDiv.classList.add('summaryInfo', 'summaryDescription');

        usernameDiv.innerText = listing.listingPoster;
        priceDiv.innerText = `$${listing.price}`;
        descriptionDiv.innerText = `${listing.description.substring(0, 150)}...`

        summaryDiv.appendChild(usernameDiv);
        summaryDiv.appendChild(priceDiv);
        summaryDiv.appendChild(descriptionDiv);






        ///////////////////////
    
        // When clicked on img
        div.addEventListener('click', async () => {

            currentListingUser = listing.listingPoster;

            popup.style.transform = `translateY(0)`;
            selectedImg.src = `/images/indexBackground${1}.jpg`;
            selectedImg.alt = `Image ${listing.description}`;

            username.innerText = listing.listingPoster;
            userAddress.innerText = listing.location;
            willingPrice.innerText = `$${listing.price}`;
            description.innerText = `${listing.description}`;
            inputMsg.placeholder = `Send ${listing.listingPoster} a message`;
            sendMsgBtn.addEventListener('click', sendMsg)
            
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
    console.log(`Sending ${inputMsg.value} to ${currentListingUser}`);
    inputMsg.value = "";

    popup.click();
}

popup.addEventListener('click', (evt) => {
    if (evt.target.id != "popup") { return;}
    popup.style.transform = `translateY(-115%)`;
    popup.src = '';
    popup.alt = '';
    mapImg.src = '';
    mapImg.alt = '';
    

    sendMsgBtn.removeEventListener('click', sendMsg);
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



        })

}