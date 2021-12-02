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

        ratingHolder.innerHTML = `<h1><span class="user-stars">${'<i class="fas fa-star"></i>'.repeat(numOfStars)}${'<i class="far fa-star"></i>'.repeat(leftOverStars)}</span> <a href="/userRatings?userID=${rating.ratedBy}">${rating.ratedByUsername}</a></h1>
            <p>${comment == undefined ? '' : comment}</p>
        `

        bottomDiv.appendChild(ratingHolder)

        console.log("Comment:", rating.comment)
    }


}

var x = null;
window.onload = () => {

    socket.emit("getUsersRatingsStats", userID, callback => {
        if (callback != false) {
            x = callback;
            let username = callback.username;
            let ratingStats = callback.ratingStats[0];
            let avgRating = ratingStats.averageRating.$numberDecimal;
            let totalRaters = ratingStats.numberOfRaters;

            topDiv.innerHTML = `<span class="rating-stat">${username}</span> has an average rating of <span class="rating-stat">${(Math.round((avgRating) * 100) / 100)}</span> from <span class="rating-stat">${totalRaters}</span> total ratings. `;
            socket.emit("getUsersRatingsByID", userID, callback => {
                if (callback != false) {
                    appendRatings(callback);
                } else {
                    console.log("Error getting users ratings");
                }
            });


        } else {
            console.log("Error occurred");
        }
    })
    
}