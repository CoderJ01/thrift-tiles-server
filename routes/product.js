// Express.js
const router = require('express').Router();

// other Node.js packages
const bcrypt = require('bcrypt');

// model
const Product = require('../models/Product');
const User = require('../models/User');

// create new product
router.post('/', async (req, res) => {
    // find name
    const name = await Product.findOne({
        where: {
            name: req.body.name
        }
    });
    
    // product name must be unique
    if(name) {
        res.status(400).json({ msg: 'Product name must be unique!' });
        return;
    }

    // create product in database
    const newProduct = await Product.create({
        name: req.body.name.trim(),
        cost: req.body.cost,
        storage_amount: req.body.amount,
        image: req.body.image
    });

    // display success message to admin on client
    res.status(200).json({
        msg: 'The new product has been successfully created!',
    });
});

// get all products
router.get('/', async (req, res) => {
    await Product.findAll().then(response => {
        res.json(response);
    });
});

// remove product
router.delete('/:id', async (req, res) => {
    await Product.destroy({
        where: {
            id: req.params.id
        }
    });
});

module.exports = router;