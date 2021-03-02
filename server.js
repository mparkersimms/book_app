const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

app.use(express.static('./public'));
// urlencoded for forms to request body
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;

let searchArr = [];
let bookArr = [];

app.get('/', (req, res) => {
    res.render('pages/index');
});
app.get('/searches/new', (req, res) => {
    res.render('pages/searches/new');
});

app.post('/searches', (req, res) => {
    searchArr = [];
    // console.log('this is from searches', req.body);
    searchArr.push(req.body);
    res.redirect('/show');
});

app.get('/show', getShow);
function getShow(req, res) {
    superagent.get(`https://www.googleapis.com/books/v1/volumes?q=in${searchArr[0].searchBy}:${searchArr[0].name}&limit=10`)
        .then(data => {
            // console.log(data.body.items[0])
            const bookData = data.body.items.map(bookOutput);
            function bookOutput(info) {
                return new Book(info)
            }
            bookArr = bookData;
            console.log(bookArr);
            res.render('pages/show', { bookArr })
        });
}
// console.log(bookArr);

function Book(data) {
    console.log(data.volumeInfo.imageLinks);
    this.image_url = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : `https://i.imgur.com/J5LVHEL.jpg`;
    this.title = data.volumeInfo.title;
    this.author = data.volumeInfo.authors ? data.volumeInfo.authors[0] : 'unknown author';
    this.description = data.volumeInfo.description
}


app.listen(PORT, () => console.log('app is up on http://localhost:' + PORT));


// default for no image available
// `https://i.imgur.com/J5LVHEL.jpg`
// default for book image icon
// `https://www.freeiconspng.com/uploads/book-icon--icon-search-engine-6.png`