const topDiv = document.getElementById('top-div');
const bottomDiv = document.getElementById('bottom-div');
let r = null;
function appendRatings(ratings) {

    r = ratings;
    console.log("RATINGS::", ratings);

    for (let i = 0; i < ratings.length; i++) {
        let rating = ratings[i];
        let numOfStars = Math.round(rating.rating);
        let leftOverStars = 5 - numOfStars;
        let comment = rating.comment;

        let ratingHolder = document.createElement('div');
        ratingHolder.classList.add('rating-holder');

        ratingHolder.innerHTML = `<h1>${rating.ratedByUsername} <span class="user-stars">${'<i class="fas fa-star"></i>'.repeat(numOfStars)}${'<i class="far fa-star"></i>'.repeat(leftOverStars)}</span></h1>
            <p>${comment}</p>
        `

        bottomDiv.appendChild(ratingHolder)

        console.log("Comment:", rating.comment)
    }


}

window.onload = () => {

    socket.emit("getUsersRatingsByID", userID, callback => {
        if (callback != false) {
            appendRatings(callback);
        } else {
            console.log("Error getting users ratings");
        }
    });
}