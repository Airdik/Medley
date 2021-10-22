const allListingsDiv = document.getElementById('allListingsDiv');
const popup = document.getElementById('popup');
const selectedImg = document.getElementById('selectedImg');

const listings = [1, 2, 3, 4, 5, 6]; // This would be listing data pulled from DB
const selectedIndex = null;

listings.forEach(i => {

    const div = document.createElement('div');
    div.classList.add('individualListing');


    /////////////////
    const image = document.createElement('img');
    image.src = `/images/indexBackground${i}.jpg`;

    image.alt = `Image ${i}`;
    image.classList.add('listingImg');
    //////////////////






    ///////////////////////
    
    // When clicked on img
    div.addEventListener('click', () => {

        popup.style.transform = `translateY(0)`;
        selectedImg.src = `/images/indexBackground${i}.jpg`;
        selectedImg.alt = `Image ${i}`;

    });

    div.appendChild(image);
    allListingsDiv.appendChild(div);
});

popup.addEventListener('click', (evt) => {
    if (evt.target.id != "popup") { return;}
    popup.style.transform = `translateY(-115%)`;
    popup.src = '';
    popup.alt = '';

})