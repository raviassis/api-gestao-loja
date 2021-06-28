var express = require('express');
var router = express.Router();
const products = require('./products');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/products', products);

module.exports = router;
