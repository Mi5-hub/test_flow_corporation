const path = require('path')
const cors = require('cors')

require('dotenv').config();
const express = require('express')
const logger = require('morgan')
const expressLayouts = require('express-ejs-layouts');
var _ = require('lodash');
//When doing ._ calls lodash, defined globally
global._ = _;


const app = express()

app.set('port', process.env.PORT || 5060 );

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);


const { indexRouter } = require("./routes");

app.use("/", indexRouter)


app.listen(app.get('port'), () => console.log('Server on port ' + app.get('port')))


