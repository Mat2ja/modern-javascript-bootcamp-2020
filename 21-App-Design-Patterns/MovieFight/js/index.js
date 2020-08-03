const autoCompleteConfig = {
    // how to show individual item
    renderOption(movie) {
        const imgPlaceholder = 'https://semantic-ui.com/images/wireframe/image.png';
        const imgSrc = movie.Poster === 'N/A' ? imgPlaceholder : movie.Poster;

        return `
            <img src="${imgSrc}">
            ${movie.Title} (${movie.Year})
        `;
    },

    // what to backfill in the input when someobody clicks on the item
    inputValue(movie) {
        return movie.Title;
    },

    // how to fetch the data
    async fetchData(searchTerm) {
        const response = await axios.get('http://www.omdbapi.com/', {
            params: {
                apikey: 'ee59ae23',
                s: searchTerm
            }
        });
        if (response.data.Error) {
            console.log('No movies found');
            return [];
        }
        return response.data.Search;
    }
};


// create left autocomplete widget
createAutocomplete({
    // where to render autocomplete to
    root: document.querySelector('#left-autocomplete'),

    // what to do when someone click on the item
    onOptionSelect(movie) {
        // fetch more elaborate movie details
        onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
        document.querySelector('.tutorial').classList.add('is-hidden');
    },

    // unpack all object properties and put it here
    ...autoCompleteConfig
});

// create right autocomplete widget
createAutocomplete({
    root: document.querySelector('#right-autocomplete'),
    onOptionSelect(movie) {
        onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
        document.querySelector('.tutorial').classList.add('is-hidden');
    },
    ...autoCompleteConfig
});

let leftMovie;
let rightMovie;
// function to fetch elaborate data for the movie
const onMovieSelect = async (movie, summaryElement, side) => {
    const response = await axios.get('http://www.omdbapi.com/', {
        params: {
            apikey: 'ee59ae23',
            i: movie.imdbID
        }
    });
    // print to console data for the movie
    console.log(`%c${response.data.Title} (${response.data.Year})`, 'font-size: 18px', response.data);

    summaryElement.innerHTML = movieTemplate(response.data);

    if (side === 'left') {
        leftMovie = response.data;
    } else if (side === 'right') {
        rightMovie = response.data;
    }

    // run comparison when both movies are defined
    if (leftMovie && rightMovie) {
        runComparison();
    }
};

const runComparison = () => {
    const leftSideStats = document.querySelectorAll('#left-summary .notification');
    const rightSideStats = document.querySelectorAll('#right-summary .notification');

    leftSideStats.forEach((leftStat, index) => {
        const rightStat = rightSideStats[index];

        const leftSideValue = +leftStat.dataset.value;
        const rightSideValue = +rightStat.dataset.value;

        console.log(leftSideValue, rightSideValue);
        console.log('leftSideValue > rightSideValue', leftSideValue > rightSideValue);
        console.log('leftSideValue < rightSideValue', leftSideValue < rightSideValue);
        console.log('leftSideValue == rightSideValue', leftSideValue == rightSideValue);


        if (leftSideValue > rightSideValue) {
            // TODO classes stays

            // remove leftovers
            // leftStat.classList.remove('is-warning');
            rightStat.classList.remove('is-primary');

            leftStat.classList.add('is-primary');
            // rightStat.classList.add('is-warning');

        } else if (leftSideValue < rightSideValue) {

            leftStat.classList.remove('is-primary');
            // rightStat.classList.remove('is-warning');

            // leftStat.classList.add('is-warning');
            rightStat.classList.add('is-primary');
        } else {
            // leftStat.classList.remove('is-warning');
            leftStat.classList.remove('is-primary');
            rightStat.classList.remove('is-primary');
            // rightStat.classList.remove('is-warning');
        }

    });
}

// return HTML for movie stats
const movieTemplate = (movieDetail) => {
    const dollars = parseInt(movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, '')) || 0;
    const metascore = parseInt(movieDetail.Metascore) || 0;
    const imdbRating = parseFloat(movieDetail.imdbRating) || 0;
    const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, '')) || 0;

    // console.log(metascore, imdbRating, imdbVotes);

    const awards = movieDetail.Awards.split(' ').reduce((total, curr) => {
        let value = parseInt(curr);

        if (isNaN(value)) {
            return total;
        }
        return total + value;
    }, 0);
    console.log(awards);

    // TODO fix Rotten tomatoes
    return `
        <article class="media">
            <figure class="media-left">
                <p class="image">
                    <img src="${movieDetail.Poster}" alt="Movie Poster">
                </p>
            </figure>
            <div class="media-content">
                <div class="content">
                    <h1>${movieDetail.Title}</h1>
                    <h4>${movieDetail.Genre}</h4>
                    <h6>
                    <span class="tag is-primary is-light">${movieDetail.Year}</span>
                        <span class="tag is-link is-light">${movieDetail.Country.split(',')[0]}</span> 
                        <span class="tag is-danger is-light">${movieDetail.Rated}</span>
                    </h6>
                    <p>${movieDetail.Plot}</p>
                </div>
            </div>
        </article>

        <article data-value=${awards} class="notification">
            <p class="title">${movieDetail.Awards}</p>
            <p class="subtitle">Awards</p>
        </article>
        <article data-value=${dollars} class="notification">
            <p class="title">${movieDetail.BoxOffice || 'idk tbh 🤷‍♂️'}</p>
            <p class="subtitle">Box Office</p>
        </article>
        <article data-value=${metascore} class="notification">
            <p class="title">${movieDetail.Metascore}</p>
            <p class="subtitle">Metascore</p>
        </article>
        <article data-value=${imdbRating} class="notification">
            <p class="title">${movieDetail.imdbRating}</p>
            <p class="subtitle">IMDB Rating</p>
        </article>
        <article data-value=${imdbVotes} class="notification">
            <p class="title">${movieDetail.imdbVotes}</p>
            <p class="subtitle">IMBD Votes</p>
        </article>
    `;
};

/*
<article class="notification is-primary">
            <p class="title">${movieDetail.Ratings[1] ?
            movieDetail.Ratings[1].Source === 'Rotten Tomatoes' ?
                movieDetail.Ratings[1].Value : 'N/A' : 'N/A'}</p>
            <p class="subtitle">Rotten Tomatoes</p>
        </article>
*/
