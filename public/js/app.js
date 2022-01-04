const $homeContainer = document.querySelector('.home-container');

let cats = [];

const render = () => {
  $homeContainer.innerHTML = cats
    .map(
      ({ id, url, liked, hashtags, content }) => `
    <div data-id="${id}" class="card">
      <img src="${url}" alt="고양이">
      <button class="like"><i></i></button>
      <div class="hash-list">
        ${hashtags.map(hashtag => `<span>${hashtag}</span>`).join('')}
      </div>
      <p class="comment">${content}</p>
    </div>
    `
    )
    .join('');
};

const setCats = _cats => {
  cats = _cats;
  render();
};

const fetchCats = async () => {
  try {
    const { data: cats } = await axios.get('/cats');
    setCats(cats);
  } catch (e) {
    console.error(e);
  }
};

const generateId = () => Math.max(...cats.map(todo => todo.id), 0) + 1;

const addCats = async cat => {
  try {
    const { data: cats } = await axios.post('/cats', { id: generateId(), cat });
    setCats(cats);
  } catch (e) {
    console.error(e);
  }
};

const toggleLiked = async id => {
  const { liked } = cats.find(cat => cat.id === +id);

  try {
    const { data: cats } = await axios.post(`/cats/${id}`, { liked: !liked });
    setCats(cats);
  } catch (e) {
    console.error(e);
  }
};

const removeCats = async id => {
  try {
    const { data: cats } = await axios.delete(`/cats/${id}`);
    setCats(cats);
  } catch (e) {
    console.error(e);
  }
};

window.addEventListener('DOMContentLoaded', fetchCats);
