import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import Notiflix from 'notiflix';

const apiKey = '37017406-53d78b8b42616f89f9425447d';
const perPage = 40;

let page = 1;
let searchQuery = '';

const searchForm = document.getElementById('search-form');
const gallery = document.getElementById('gallery');
const loadMoreBtn = document.getElementById('load-more');

searchForm.addEventListener('submit', handleFormSubmit);
loadMoreBtn.addEventListener('click', loadMoreImages);
loadMoreBtn.style.display = 'none'; 

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
});

function handleFormSubmit(event) {
  event.preventDefault();
  page = 1;
  searchQuery = event.target.elements.searchQuery.value.trim();
  gallery.innerHTML = '';
  loadMoreBtn.style.display = 'none'; // Скрыть кнопку при новом поиске
  searchImages();
}

function loadMoreImages() {
  page++;
  searchImages();
}

async function searchImages() {
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}`;


  try {
    const response = await axios.get(url);
    const data = response.data;
    const { totalHits, hits } = data;

    if (hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);

      hits.forEach(image => {
        const {
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        } = image;

        const photoCard = document.createElement('div');
        photoCard.classList.add('photo-card');

        const img = document.createElement('img');
        img.src = webformatURL;
        img.alt = tags;
        img.loading = 'lazy';

        const likesInfo = createInfoItem('Likes', likes);
        const viewsInfo = createInfoItem('Views', views);
        const commentsInfo = createInfoItem('Comments', comments);
        const downloadsInfo = createInfoItem('Downloads', downloads);

        const info = document.createElement('div');
        info.classList.add('info');
        info.appendChild(likesInfo);
        info.appendChild(viewsInfo);
        info.appendChild(commentsInfo);
        info.appendChild(downloadsInfo);

        photoCard.appendChild(img);
        photoCard.appendChild(info);

        gallery.appendChild(photoCard);
      });

      if (hits.length < perPage) {
        loadMoreBtn.style.display = 'none';
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      } else {
        loadMoreBtn.style.display = 'block';
      }

      lightbox.refresh();

      const cardHeight =
        gallery.firstElementChild.getBoundingClientRect().height;
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }
  } catch (error) {
    console.error('Error:', error);
    Notiflix.Notify.failure(
      'An error occurred while fetching images. Please try again later.'
    );
  }
}

function createInfoItem(label, value) {
  const infoItem = document.createElement('p');
  infoItem.classList.add('info-item');
  infoItem.innerHTML = `<span class="info-label">${label}: </span>${value}`;
  return infoItem;
}