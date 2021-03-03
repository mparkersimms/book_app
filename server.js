
// ================== packages==========================

const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
require('dotenv').config();
const pg = require('pg');


// ================== app ==============================



const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;


// ----------SQL-------------

const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
client.on('error', error => console.log(error));

// --------DB TABLE set up ------
// const tempSqlString = '';
// const tempSqlArray = [];
// client.query(tempSqlString,tempSqlArray);


// ----------EJS---------------

app.use(express.static('./public'));
// urlencoded for forms to request body
app.set('view engine', 'ejs');

// ----------POST--------------

app.use(express.urlencoded({ extended: true }));





// ================== Routes. ==========================



let searchArr = [];
let bookArr = [];

app.get('/', (req, res) => {
    const SqlString = 'SELECT * FROM books;';
    client.query(SqlString)
        .then(results => {
            console.log(results.rows);
            const booksFromDB = results.rows;
            res.render('pages/index', { booksFromDB });
        });

});

app.get('/books/:id', getSingleBook);
function getSingleBook(req, res) {
    console.log('params', req.params)
    const SqlString = 'SELECT * FROM books WHERE id=$1';
    const SqlArray = [req.params.id];
    client.query(SqlString, SqlArray)
        .then(result => {
            const ejsObject = result.rows[0];
            console.log(result.rows[0]);
            res.render('pages/books/show', { ejsObject });
        })

}

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
            res.render('pages/searches/show', { bookArr })
        })
        .catch((errorMessage) => {
            res.status(500).send('Something went wrong', errorMessage)
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




// ================== Initialization====================




client.connect().then(() => {
    app.listen(PORT, () => console.log('app is up on http://localhost:' + PORT));
});


// default for no image available
// `https://i.imgur.com/J5LVHEL.jpg`
// default for book image icon
// `https://www.freeiconspng.com/uploads/book-icon--icon-search-engine-6.png`