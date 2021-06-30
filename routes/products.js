const router = require('express').Router();
const db = require('../data');
const { body, validationResult } = require('express-validator');

const valid = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validationMiddleware = (arr) => {
  arr.push(valid);
  return arr;
};

router.get('/', async (req, res, next) => {
  try {
    let { q, limit, offset } = req.query;
    q = q || '';
    limit = limit || 10;
    offset = offset || 0;
    const products = await db('products')
                            .where('code', 'like', `%${q}%`)
                            .orWhere('name', 'like', `%${q}%`)
                            .limit(limit)
                            .offset(offset);
    res.status(200).json({
      q,
      limit,
      offset,
      data: products
    });
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
  
});

router.post(
  '/', 
  validationMiddleware([
    body('code').notEmpty(),
    body('name').notEmpty(),
    body('price').isFloat({min: 0})
  ]), 
  async (req, res) => {
    const {code, name, price} = req.body;
    const results = await db('products').insert({code, name, price}, '*');
    res.status(201).json(results[0]);
  }
);

module.exports = router;
