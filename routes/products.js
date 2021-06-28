var express = require('express');
var router = express.Router();
let products = [
  {id: 1, name: 'Caneta', prize: 1.5},
  {id: 2, name: 'Borracha', prize: 2.5},
  {id: 3, name: 'Caderno', prize: 10.0}
];
router.get('/', function(req, res, next) {
  res.status(200).json(products);
});

module.exports = router;
