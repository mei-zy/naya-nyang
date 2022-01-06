const $catsList = document.querySelector('.cats-list');
const $postModal = document.querySelector('.post-modal');
const $postForm = document.querySelector('.post-form');
const $editForm = document.querySelector('.edit-form');
const $closeModals = [...document.querySelectorAll('.close-modal')];
const $editModal = document.querySelector('.edit-modal');
const $postInputFile = document.querySelector('.post-modal #upload');
const $editInputFile = document.querySelector('.edit-modal #upload');
const $postDescription = document.querySelector('.post-modal .description');
const $editDescription = document.querySelector('.edit-modal .description');
const $btnContainer = document.querySelector('.btn-container');
const $inputHashtags = [...document.querySelectorAll('#tag')];
const $hashtagsLists = [...document.querySelectorAll('.hashtags-list')];

let cats = [];
let currentFilter = 'all';

const render = () => {
  const _cats = cats.filter(({ liked }) => (currentFilter === 'all' ? true : liked));

  const $slogan = document.querySelector('.slogan');
  $slogan.textContent = currentFilter === 'all' ? '주변 집사들의 고양이를 둘러 보세요' : '내가 좋아하는 고양이들';

  $catsList.innerHTML = _cats
    .map(
      ({ id, url, liked, hashtags, content }) => `
      <li>
        <div data-id="${id}" class="card">
        <div class="img-container">
        <img src="${url}" class="post-img" alt="고양이">
        </div>
        <div class="edit-container">
          <button class="like" title="좋아요 누르기">
            <i class="${liked ? 'fas fa-heart fa-2x' : 'far fa-heart fa-2x'}"></i>
          </button>
          <div class="edit-del">
            <button class="btn edit-post">
              <i class="far fa-edit fa-lg"></i> 
            </button>
            <button class="btn delete-post">
              <i class="fas fa-trash-alt fa-lg"></i>
            </button>
          </div>
        </div>
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
    const { data: cats } = await axios.post('/cats', {
      id: generateId(),
      url,
      hashtags,
      content,
      liked: false,
    });
    setCats(cats);
  } catch (e) {
    console.error(e);
  }
};

const editCats = async (id, url, hashtags, content) => {
  try {
    const { data: cats } = await axios.patch(`/cats/${id}`, { url, hashtags, content });
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

const hashtag = (() => {
  let hashtags = [];
  return {
    get() {
      return hashtags;
    },

    set(inputHashtags) {
      hashtags = [...inputHashtags];
    },

    reset() {
      hashtags = [];
    },

    remove(toBeRemoved) {
      hashtags = hashtags.filter(hash => hash !== toBeRemoved);
    },

    add(newHashtag) {
      if (hashtags.find(hash => hash === newHashtag.trim())) return;
      hashtags = [...hashtags, newHashtag.trim()];
    },
  };
})();

const showEditModal = id => {
  const { url, content, hashtags } = cats.find(cat => cat.id === +id);
  const $uploadedImage = $editModal.querySelector('.uploaded-image img');
  const $hashtagsList = $editModal.querySelector('.hashtags-list');

  $hashtagsList.innerHTML = hashtags.map(hashtag => `<li class="hashtags-item">${hashtag}</li>`).join('');

  $uploadedImage.src = url;
  $editDescription.textContent = content;
  $editModal.dataset.id = +id;

  const { hashtags: editHashtags } = cats.find(cat => cat.id === +id);
  hashtag.set(editHashtags);

  $editModal.classList.remove('hidden');
};

window.addEventListener('DOMContentLoaded', fetchCats);

$catsList.onclick = ({ target }) => {
  if (!target.matches('.card *')) return;
  const { id } = target.closest('.card').dataset;

  if (target.matches('.delete-post, .delete-post *')) {
    removeCats(id);
  }

  if (target.matches('.like, .like *')) {
    toggleLiked(id);
  }

  if (target.matches('.edit-post, .edit-post *')) {
    showEditModal(id);
  }
};

$btnContainer.onclick = e => {
  if (e.target.matches('.post')) $postModal.classList.remove('hidden');
  else {
    currentFilter = e.target.matches('.home') ? 'all' : 'liked';
    render();
  }
};

const closeModal = e => {
  e.preventDefault();
  e.target.closest('.modal').classList.add('hidden');
  e.target.closest('form').reset();
  e.target.closest('form').querySelector('.description').textContent = '';
  e.target.closest('form').querySelector('.hashtags-list').innerHTML = '';
  e.target.closest('form').querySelector('.uploaded-image img').src = 'img/image_blank.jpeg';
  hashtag.reset();
};

$closeModals.forEach(closeButton => {
  closeButton.onclick = closeModal;
});

$postInputFile.onchange = async e => {
  const uploadedFile = $postInputFile.files[0];
  const formData = new FormData();
  formData.append('img', uploadedFile);

  const res = await fetch('/temporarilyUpload', {
    method: 'POST',
    // headers: { 'Content-Type': 'multipart/form-data' },
    // body: JSON.stringify(formData)
    body: formData,
  });

  const { success, file } = await res.json();

  if (success) {
    console.log('UPLOAD SUCCESS!', file);
  }

  const url = `/temporarySaved/${file.originalname}`;

  const $uploadedPreview = $postForm.querySelector('.uploaded-image img');
  $uploadedPreview.src = url;
};

$postForm.onsubmit = async e => {
  e.preventDefault();

  const uploadedFile = $postInputFile.files[0];
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
  const hashtags = hashtag.get();
  const content = $postDescription.textContent;

  closeModal(e);
  addCats(url, hashtags, content);
};

$editForm.onsubmit = async e => {
  e.preventDefault();

  const uploadedFile = $editInputFile.files[0];
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

  const { id } = e.target.closest('.modal').dataset;
  const { url: prevUrl } = cats.find(cat => cat.id === +id);
  const url = file ? `/img/${file.originalname}` : prevUrl;
  const content = $editDescription.textContent;

  const editHashtags = hashtag.get();
  closeModal(e);
  editCats(id, url, editHashtags, content);
};

$inputHashtags.forEach($inputHash => {
  $inputHash.onkeyup = e => {
    if (e.code !== 'Space') return;
    const $hashtagsList = e.target.closest('.modal').querySelector('.hashtags-list');

    hashtag.add(e.target.value);
    $hashtagsList.innerHTML = hashtag
      .get()
      .map(hash => `<li class="hashtags-item">${hash}</li>`)
      .join('');

    e.target.value = '';
  };
});

const removeHashtag = e => {
  const $hashtagsList = e.target.closest('.hashtags-list');
  hashtag.remove(e.target.textContent);
  $hashtagsList.innerHTML = hashtag
    .get()
    .map(hash => `<li class="hashtags-item">${hash}</li>`)
    .join('');
};

$hashtagsLists.forEach(hashtagList => {
  hashtagList.onclick = removeHashtag;
});
