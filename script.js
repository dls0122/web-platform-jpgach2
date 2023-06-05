const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const API_KEY = '22f7aeddd3f874f0255a0a898e3a9fbe';


let currentPage = 1;
let currentCategory = 'popular';
let allMovies = [];
let likedMovies = [];

const movieList = document.getElementById('movie-list');
const movieCategory = document.getElementById('movie-category');
const previousPageButton = document.getElementById('previous-page');
const nextPageButton = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const tabs = document.querySelectorAll('.tab');

function fetchMovies(page, category) {
  fetch(`${BASE_URL}/movie/${category}?api_key=${API_KEY}&page=${page}`)
    .then(response => response.json())
    .then(data => {
      allMovies = data.results;
      movieList.innerHTML = allMovies.map(movie => createMovieCard(movie)).join('');
      pageInfo.textContent = `Page ${page} of ${data.total_pages}`;
      previousPageButton.disabled = page === 1;
      nextPageButton.disabled = page === data.total_pages;
    });
}

function fetchLikedMovies() {
  movieList.innerHTML = allMovies.filter(movie => likedMovies.includes(movie.id)).map(movie => createMovieCard(movie)).join('');
}

function createMovieCard(movie) {
  const isLiked = likedMovies.includes(movie.id);
  return `
    <div class="movie-card">
      <img src="${IMAGE_URL + movie.poster_path}" alt="">
      <h2 class="movie-title" id="${movie.id}">${movie.title}</h2>
      <div class="movie-rating">
        <i class="icon ion-ios-star"></i>${movie.vote_average / 2}
      </div>
      <i class="icon ion-ios-heart${isLiked ? '' : '-outline'} like-icon" data-movie-id="${movie.id}"></i>
    </div>
  `;
}

movieCategory.addEventListener('change', () => {
  currentPage = 1;
  currentCategory = movieCategory.value;
  fetchMovies(currentPage, currentCategory);
});

previousPageButton.addEventListener('click', () => {
  currentPage--;
  fetchMovies(currentPage, currentCategory);
});

nextPageButton.addEventListener('click', () => {
  currentPage++;
  fetchMovies(currentPage, currentCategory);
});

for (const tab of tabs) {
  tab.addEventListener('click', () => {
    document.querySelector('.tab.active').classList.remove('active');
    tab.classList.add('active');
    if (tab.id === 'liked-list-tab') {
      fetchLikedMovies();
    } else {
      fetchMovies(currentPage, currentCategory);
    }
  });
}

movieList.addEventListener('click', event => {
  if (event.target.className.includes('movie-title')) {
    fetchMovieDetails(event.target.id);
  }
  if (event.target.className.includes('like-icon')) {
    const movieId = parseInt(event.target.dataset.movieId);
    if (likedMovies.includes(movieId)) {
      likedMovies = likedMovies.filter(id => id !== movieId);
      event.target.classList.replace('ion-ios-heart', 'ion-ios-heart-outline');
    } else {
      likedMovies.push(movieId);
      event.target.classList.replace('ion-ios-heart-outline', 'ion-ios-heart');
    }
  }
});

function fetchMovieDetails(movieId) {
  fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`)
    .then(response => response.json())
    .then(movie => {
      document.getElementById('movie-modal-title').textContent = movie.title;
      document.getElementById('movie-modal-overview').textContent = movie.overview;
      document.getElementById('movie-modal-rating').textContent = movie.vote_average / 2;
      document.getElementById('movie-modal-poster').src = IMAGE_URL + movie.poster_path;

      const genreList = document.getElementById('movie-modal-genres');
      genreList.innerHTML = movie.genres.map(genre => genre.name).join(', ');

      const productionLogosContainer = document.getElementById('movie-modal-production-logos');
      productionLogosContainer.innerHTML = '';
      for (const company of movie.production_companies) {
        if (company.logo_path) {
          const img = document.createElement('img');
          img.src = IMAGE_URL + company.logo_path;
          img.alt = company.name;
          productionLogosContainer.appendChild(img);
        }
      }

      const modal = document.getElementById('movie-modal');
      modal.style.display = 'block';

      document.querySelector('.close-button').addEventListener('click', () => {
        modal.style.display = 'none';
      });
    });
}

fetchMovies(currentPage, currentCategory);
