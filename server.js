const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = 9000;

// Mock data
let cats = [
  {
    id: 1,
    url: 'img/image01.jpeg',
    content: '고양이는 귀엽다',
    liked: true,
    hashtags: ['고양이', '귀엽다', '냥스타그램'],
  },
  {
    id: 2,
    url: 'img/image02.jpeg',
    content: '고양이는 귀엽다',
    liked: false,
    hashtags: ['고양이', '귀엽다', '냥스타그램'],
  },
  {
    id: 3,
    url: 'img/image03.jpeg',
    content: '고양이는 귀엽다',
    liked: true,
    hashtags: ['고양이', '귀엽다', '냥스타그램'],
  },
  {
    id: 4,
    url: 'img/image04.jpeg',
    content: '고양이는 귀엽다',
    liked: false,
    hashtags: ['고양이', '귀엽다', '냥스타그램'],
  },
];

app.use(express.static('public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/cats', (req, res) => {
  res.send(cats);
});

app.post('/cats', (req, res) => {
  console.log(req.body);
  cats = [req.body, ...cats];
  res.send(cats);
});

app.patch('/cats/:id', (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  cats = cats.map(cat => (cat.id === +id ? { ...cat, ...payload } : cat));
  res.send(cats);
});

app.delete('/cats/:id', (req, res) => {
  const { id } = req.params;

  cats = cats.filter(cat => cat.id !== +id);
  res.send(cats);
});

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  storage: multer.diskStorage({
    destination(req, file, cb) {
      // public/img 폴더에 파일을 저장한다. public/img 폴더가 존재해야 한다.
      cb(null, 'public/img/');
    },
    filename(req, file, cb) {
      // 전송된 파일 자신의 이름으로 파일을 저장한다.
      cb(null, file.originalname);
    },
  }),
});

app.post('/upload', upload.single('img'), (req, res) => {
  console.log('UPLOAD SUCCESS!', req.file);
  res.json({ success: true, file: req.file });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
