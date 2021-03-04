

// ================== packages==========================


const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
require('dotenv').config();
const pg = require('pg');
const methodOverride = require('method-override');


// ================== app ==============================



const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;


// ----------SQL-------------

const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
client.on('error', error => console.log(error));


// --------DB TABLE set up ------
/*
const SqlString = '';
const SqlArray = [];
client.query(SqlString,SqlArray);
*/


// ----------EJS---------------

app.use(express.static('./public'));
// urlencoded for forms to request body
app.set('view engine', 'ejs');


// ----------POST--------------

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));



// ================== Routes. ==========================



// ----- global arrays----------
let searchArr = [];
let bookArr = [];



// -------app calls -------------
app.get('/', getCollection);
app.get('/books/:id', getSingleBook);
app.get('/searches/new', getNew);
app.post('/searches', postSearches);
app.get('/show', getShow);
app.post('/add', addToCollection);
app.put('/update/:id', updateBook);
app.put('/books/:id', updateBookData)
app.delete('/books/:id', deleteBook)



// -------functions--------------

function getCollection(req, res) {
    const SqlString = 'SELECT * FROM books;';
    client.query(SqlString)
        .then(results => {
            // console.log(results.rows);
            const booksFromDB = results.rows;
            res.render('pages/index', { booksFromDB });
        })
        .catch((errorMessage) => {
            res.status(500).send('Something went wrong', errorMessage)
        });

}


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
        .catch((errorMessage) => {
            res.status(500).send('Something went wrong', errorMessage)
        });

}


function getNew(req, res) {
    res.render('pages/searches/new');
}


function postSearches(req, res) {
    searchArr = [];
    searchArr.push(req.body);
    res.redirect('/show');
}


function getShow(req, res) {
    superagent.get(`https://www.googleapis.com/books/v1/volumes?q=in${searchArr[0].searchBy}:${searchArr[0].name}&limit=10`)
        .then(data => {
            const bookData = data.body.items.map(bookOutput);
            function bookOutput(info) {
                return new Book(info)
            }
            bookArr = bookData;

            res.render('pages/searches/show', { bookArr })
        })
        .catch((errorMessage) => {
            res.status(500).send('Something went wrong', errorMessage)
        });
}


function Book(data) {
    console.log(data.volumeInfo.imageLinks);
    this.image_url = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : `https://i.imgur.com/J5LVHEL.jpg`;
    this.title = data.volumeInfo.title;
    this.author = data.volumeInfo.authors ? data.volumeInfo.authors[0] : 'unknown author';
    this.description = data.volumeInfo.description;
    this.isbn = data.volumeInfo.industryIdentifiers[0].identifier
}


function addToCollection(req, res) {
    console.log('you clicked on the add to collection button', req.body);
    const SqlString = 'INSERT INTO books (author , title, isbn, image_url, description) VALUES ($1,$2,$3,$4,$5) RETURNING id;';
    const SqlArray = [req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.description];
    client.query(SqlString, SqlArray)
        .then((result) => {
            console.log(result.rows)
            res.redirect(`/books/${result.rows[0].id}`)
        })
        .catch((errorMessage) => {
            res.status(500).send('Something went wrong', errorMessage)
        });
}

function updateBook(req, res) {
    console.log('about to update a book', req.body);
    const ejsObject = req.body;
    res.render('pages/books/edit', ejsObject);
}

function updateBookData(req, res) {
    console.log(req.body);
    const SqlString = 'UPDATE books SET author=$1 , title=$2, isbn=$3, image_url=$4, description=$5 WHERE id=$6';
    const SqlArray = [req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.description, req.params.id];
    client.query(SqlString, SqlArray)
        .then((result) => {
            console.log(result.rows)
            res.redirect(`/books/${req.params.id}`)

        })
        .catch((errorMessage) => {
            res.status(500).send('Something went wrong', errorMessage)
        });
}

function deleteBook(req, res) {
    console.log(req.params);
    const SqlString = 'DELETE FROM books WHERE id=$1';
    const SqlArray = [req.params.id];
    client.query(SqlString, SqlArray)
        .then(() =>{
            res.redirect('/')
        })
}

// ================== Initialization====================




client.connect().then(() => {
    app.listen(PORT, () => console.log('app is up on http://localhost:' + PORT));
});

// ------ default image/icon------------
/*
--------image---------
https://i.imgur.com/J5LVHEL.jpg

---------icon---------
https://www.freeiconspng.com/uploads/book-icon--icon-search-engine-6.png
*/
