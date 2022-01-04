const express = require('express');

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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
