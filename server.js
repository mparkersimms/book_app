const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

app.use(express.static('./public'));
// urlencoded for forms to request body
app.use(express.urlencoded({extended:true}));
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;


app.get('/hello', getHello);
function getHello(req, res){
    res.render('pages/index')
}


app.listen(PORT, () => console.log('app is up on http://localhost:' + PORT));

