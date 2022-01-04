const $catsList = document.querySelector('.cats-list');

let cats = [];

const render = () => {
  $catsList.innerHTML = cats
    .map(
      ({ id, url, liked, hashtags, content }) => `
      <li>
        <div data-id="${id}" class="card">
          <div class="edit-container">
            <button class="btn edit-post">
              <i class="far fa-edit"></i> 
            </button>
            <button class="btn delete-post">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          <div class="img-container">
            <img src="${url}" class="post-img" alt="고양이">
          </div>
          <button class="like" title="좋아요 누르기">
            <i class="${liked ? 'fas fa-heart fa-2x' : 'far fa-heart fa-2x'}"></i>
          </button>
          <div class="hash-list">
            ${hashtags.map(hashtag => `<span>${hashtag}</span>`).join('')}
          </div>
          <p class="comment">${content}</p>
        </div>
      </li>
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
    const { data: cats } = await axios.patch(`/cats/${id}`, { liked: !liked });
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

$catsList.onclick = ({ target }) => {
  if (!target.matches('.like, .like *')) return;

  const { id } = target.closest('.card').dataset;
  toggleLiked(id);
};
