import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';

export default class ApiService {
  constructor() {
    this.q = '';
    this.page = 1;
    this.perPage = 40;
  }

  async fetchGallery() {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          key: '40060997-8db7535f2e92ac0989f3352cd',
          q: this.q,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: true,
          per_page: this.perPage,
          page: this.page,
        },
      });

      this.incrementPage();
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  incrementPage() {
    this.page += 1;
  }
  resetPage() {
    this.page = 1;
  }
  get p() {
    return this.page;
  }
  set p(newP) {
    this.page = newP;
  }
  get query() {
    return this.q;
  }
  set query(newQuery) {
    this.q = newQuery;
  }
}
