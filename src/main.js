import { fetchImages } from './js/pixabay-api.js';
import { renderImages } from './js/render-functions.js';
import iziToast from 'izitoast';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'izitoast/dist/css/iziToast.min.css';

const searchForm = document.getElementById('search-form');
const galleryElement = document.getElementById('gallery');
const loadMoreButton = document.querySelector('.btn');
const loaderElement = document.getElementById('loader');

let query = '';
let page = 1;
let totalHits = 0;
let loadedImages = 0;
let lightbox = new SimpleLightbox('.gallery a');

searchForm.addEventListener('submit', function (e) {
  e.preventDefault();
  query = document.getElementById('search-input').value.trim();
  page = 1;
  totalHits = 0;
  loadedImages = 0;

  if (!query) {
    iziToast.error({
      title: 'Error',
      message: 'Please enter a search term!',
    });
    return;
  }

  galleryElement.innerHTML = '';
  loadMoreButton.classList.add('hidden');
  fetchAndRenderImages();
});

loadMoreButton.addEventListener('click', function () {
  page += 1;
  fetchAndRenderImages();
});

async function fetchAndRenderImages() {
  showLoader();

  try {
    const response = await fetchImages(query, page);
    hideLoader();

    const images = response.hits;
    totalHits = response.totalHits;

    if (images.length === 0 && page === 1) {
      iziToast.error({
        title: 'Info',
        message: 'Sorry, no images match your search. Try again!',
        position: 'topRight',
      });
      return;
    }

    renderImages(images, galleryElement);
    lightbox.refresh();

    loadedImages += images.length;

    if (loadedImages >= totalHits) {
      loadMoreButton.classList.add('hidden');
      iziToast.info({
        title: 'End of Results',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      loadMoreButton.classList.remove('hidden');
    }

    smoothScroll();
  } catch (error) {
    hideLoader();
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Please try again later.',
    });
    console.error('Error:', error);
  }
}

function showLoader() {
  loaderElement.classList.remove('hidden');
}

function hideLoader() {
  loaderElement.classList.add('hidden');
}

function smoothScroll() {
  if (galleryElement.firstElementChild) {
    const { height: cardHeight } =
      galleryElement.firstElementChild.getBoundingClientRect();

    setTimeout(() => {
      window.scrollBy({
        top: cardHeight * 4,
        behavior: 'smooth',
      });
    }, 200);
  }
}
