const $catsList = document.querySelector('.cats-list');
const $postButton = document.querySelector('.btn.post');
const $postModal = document.querySelector('.post-modal');
const $postForm = document.querySelector('.post-form');
const $closeModal = document.querySelector('.close-modal');
const $inputFile = document.getElementById('upload');
const $description = document.querySelector('.description');

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

const addCats = async (url, hashtags, content) => {
  try {
    const { data: cats } = await axios.post('/cats', { id: generateId(), url, hashtags, content, liked: false });
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

$postButton.onclick = e => {
  $postModal.classList.remove('hidden');
};

const closeModal = e => {
  e.preventDefault();
  $postModal.classList.add('hidden');
};

$closeModal.onclick = closeModal;

$postForm.onsubmit = async e => {
  e.preventDefault();

  const uploadedFile = $inputFile.files[0];
  const formData = new FormData();
  formData.append('img', uploadedFile);

  const res = await fetch('/upload', {
    method: 'POST',
    // headers: { 'Content-Type': 'multipart/form-data' },
    // body: JSON.stringify(formData)
    body: formData,
  });
  const { success, file } = await res.json();

  if (success) {
    console.log('UPLOAD SUCCESS!', file);
  }

  const url = `/img/${file.originalname}`;
  const tempHashtags = ['고양이', '임시', '냥스타그램'];
  const content = $description.textContent;
  $description.textContent = '';

  $postForm.reset();
  closeModal(e);
  addCats(url, tempHashtags, content);
};
