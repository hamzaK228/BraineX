const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getItems, createItem, updateItem, deleteItem } = require('../controllers/goalController');

router.use(protect);

router.route('/')
    .get(getItems)
    .post(createItem);

router.route('/:id')
    .put(updateItem)
    .delete(deleteItem);

module.exports = router;
