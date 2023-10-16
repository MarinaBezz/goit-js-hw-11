import './sass/index.scss';
import ApiService from './js/api-service';
import { lightbox } from './js/lightbox';
import { Notiflix } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

const apiService = new ApiService();
let errorShown = false;
let lastItem;
let totalPages = 1;
let currentPage = 0;
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
});

scrollToTopBtn.addEventListener('click', scrollToTop);
window.addEventListener('scroll', toggleScrollToTopBtn);
refs.searchForm.addEventListener('submit', searchPictures);

const optionsForObserver = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1,
};

async function searchPictures(e) {
  e.preventDefault();
  try {
    apiService.query = e.currentTarget.elements.searchQuery.value;
    apiService.p = 1;
    errorShown = false;
    const data = await apiService.fetchPictures();

    if (data.hits[0] !== undefined && apiService.query.trim() !== '') {
      clearGallery();
      totalPages = Math.ceil(data.totalHits / apiService.perPage);
      refs.gallery.insertAdjacentHTML('beforeend', hitsMarkup(data.hits));
      lightbox.refresh();
      newHitsNotification(data.totalHits);
      currentPage = 1;
      infiniteScroll();
      if (totalPages === 1) {
        if (!errorShown) {
          showErrorNotification();
          errorShown = true;
        }
      }
    } else {
      throw new Error();
    }
  } catch (error) {
    clearGallery();
    showErrorNotification('true');
  }
}

async function onLoadMore(entries, observer) {
  for (const entry of entries) {
    if (totalPages > 1) {
      if (entry.isIntersecting) {
        try {
          const data = await apiService.fetchPictures();
          refs.gallery.insertAdjacentHTML('beforeend', hitsMarkup(data.hits));
          lightbox.refresh();
          smoothScroll();
          currentPage += 1;

          if (currentPage < totalPages) {
            lastItem = document.querySelector('.photo-card:last-child');
            observer.unobserve(entry.target);
            observer.observe(lastItem);
          } else {
            observer.unobserve(entry.target);
            if (!errorShown) {
              showErrorNotification();
              errorShown = true;
            }
          }
        } catch (error) {
          console.log('error');
        }
      }
    }
  }
}

function hitsMarkup(hits) {
  return hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
      <div class="photo-card">
      <a class = "link" href="${largeImageURL}">
  <img class ="small-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads ${downloads}</b>
    </p>
  </div>
  </a>
</div>`
    )
    .join('');
}

function showErrorNotification(msg) {
  if (msg === 'true') {
    msg =
      'Sorry, there are no images matching your search query. Please try again.';
  } else {
    msg = `We're sorry, but you've reached the end of search results.`;
  }
  Notiflix.Notify.failure(msg, {
    position: 'right-top',
    timeout: 5000,
  });
}

function newHitsNotification(totalHits) {
  Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`, {
    position: 'right-top',
    timeout: 5000,
  });
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

function smoothScroll() {
  const { height: cardHeight } =
    refs.gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

function toggleScrollToTopBtn() {
  if (window.scrollY > 300) {
    scrollToTopBtn.style.display = 'block';
  } else {
    scrollToTopBtn.style.display = 'none';
  }
}
function infiniteScroll() {
  const observer = new IntersectionObserver(onLoadMore, optionsForObserver);
  lastItem = document.querySelector('.photo-card:last-child');
  observer.observe(lastItem);
}

// import './sass/index.scss';
// import NewsApiService from './js/api-service';
// import { lightbox } from './js/lightbox';
// import { Notify } from 'notiflix/build/notiflix-notify-aio';

// const refs = {
//   searchForm: document.querySelector('.search-form'),
//   galleryContainer: document.querySelector('.gallery'),
//   loadMoreBtn: document.querySelector('.load-more'),
// };
// let isShown = 0;
// const newsApiService = new NewsApiService();

// refs.searchForm.addEventListener('submit', onSearch);
// refs.loadMoreBtn.addEventListener('click', onLoadMore);

// const options = {
//   rootMargin: '50px',
//   root: null,
//   threshold: 0.3,
// };
// const observer = new IntersectionObserver(onLoadMore, options);

// function onSearch(element) {
//   element.preventDefault();

//   refs.galleryContainer.innerHTML = '';
//   newsApiService.query =
//     element.currentTarget.elements.searchQuery.value.trim();
//   newsApiService.resetPage();

//   if (newsApiService.query === '') {
//     Notify.warning('Please, fill the main field');
//     return;
//   }

//   isShown = 0;
//   fetchGallery();
//   onRenderGallery(hits);
// }

// function onLoadMore() {
//   newsApiService.incrementPage();
//   fetchGallery();
// }

// async function fetchGallery(e) {
//   refs.loadMoreBtn.classList.add('is-hidden');
//   e.preventDefault();

//   try {
//     apiService.query = e.currentTarget.elements.searchQuery.value;
//     apiService.p = 1;
//     errorShown = false;
//     const data = await apiService.fetchPictures();

//     if (data.hits[0] !== undefined && apiService.query.trim() !== '') {
//       clearGallery();
//       totalPages = Math.ceil(data.totalHits / apiService.perPage);
//       refs.gallery.insertAdjacentHTML('beforeend', hitsMarkup(data.hits));
//       lightbox.refresh();
//       newHitsNotification(data.totalHits);
//       currentPage = 1;
//       infiniteScroll();
//       if (totalPages === 1) {
//         if (!errorShown) {
//           showErrorNotification();
//           errorShown = true;
//         }
//       }
//     } else {
//       throw new Error();
//     }
//   } catch (error) {
//     clearGallery();
//     showErrorNotification('true');
//   }
// }

// //   const result = await newsApiService.fetchGallery();
// //   const { hits, total } = result;
// //   isShown += hits.length;

// //   if (!hits.length) {
// //     Notify.failure(
// //       `Sorry, there are no images matching your search query. Please try again.`
// //     );
// //     refs.loadMoreBtn.classList.add('is-hidden');
// //     return;
// //   }

// //   onRenderGallery(hits);
// //   isShown += hits.length;

// //   if (isShown < total) {
// //     Notify.success(`Hooray! We found ${total} images !!!`);
// //     refs.loadMoreBtn.classList.remove('is-hidden');
// //   }

// //   if (isShown >= total) {
// //     Notify.info("We're sorry, but you've reached the end of search results.");
// //   }
// //

// function onRenderGallery(elements) {
//   const markup = elements
//     .map(
//       ({
//         webformatURL,
//         largeImageURL,
//         tags,
//         likes,
//         views,
//         comments,
//         downloads,
//       }) => {
//         return `<div class="photo-card">
//     <a href="${largeImageURL}">
//       <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
//     </a>
//     <div class="info">
//       <p class="info-item">
//         <b>Likes</b>
//         ${likes}
//       </p>
//       <p class="info-item">
//         <b>Views</b>
//         ${views}
//       </p>
//       <p class="info-item">
//         <b>Comments</b>
//         ${comments}
//       </p>
//       <p class="info-item">
//         <b>Downloads</b>
//         ${downloads}
//       </p>
//     </div>
//     </div>`;
//       }
//     )
//     .join('');
//   refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
//   lightbox.refresh();
// }
