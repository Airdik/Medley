const gallery = document.getElementById('gallery');
const popup = document.getElementById('popup');
const selectedImage = document.getElementById('selectedImage');

const imageIndexes = [1, 2, 3, 4, 5, 6];
const selectedIndex = null;

imageIndexes.forEach(i => {
    const image = document.createElement('img');
    image.src = `/images/indexBackground${i}.jpg`;

    image.alt = `Image ${i}`;
    image.classList.add('galleryImg');

    // When clicked on img
    image.addEventListener('click', () => {

        popup.style.transform = `translateY(0)`;
        selectedImage.src = `/images/indexBackground${i}.jpg`;
        selectedImage.alt = `Image ${i}`;

    })

    gallery.appendChild(image);
});

popup.addEventListener('click', () => {
    popup.style.transform = `translateY(-100%)`;
    popup.src = '';
    popup.alt = '';

})