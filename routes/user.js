// Express.js
const router = require('express').Router();

// other Node.js packages
const bcrypt = require('bcrypt');

// model
const User = require('../models/User');

// other imports
const generateCookie = require('../util/generateCookie');
const generateStringOfDigits = require('../util/generateStringOfDigits');

router.post('/register', async (req, res) => {
    // hash
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    // find email
    const email = await User.findOne({
        where: {
            email: req.body.email
        }
    });
    
    if(email) {
        res.status(400).json({ msg: 'Email must be unique!' });
        return;
    }

    // create username for user
    const username = (req.body.firstname.charAt(0) + req.body.lastname).toLowerCase() + generateStringOfDigits(5);

    // create user
    const newUser = await User.create({
        first_name: req.body.firstname.trim(),
        last_name: req.body.lastname.trim(),
        username: username,
        email: req.body.email.trim(),
        password: hashedPass
    });

    res.status(200).json({
        msg: 'Your account has been successfully created. You may log in!',
    });
});

router.post('/login', async (req, res) => {

    let user = [];

    // look for user based on email
    if(req.body.email.includes('@')) {
        user = await User.findOne({
            where: {
                email: req.body.email
            }
        });
    
        if(!user) {
            res.status(400).json({ msg: 'Email does not exist!' });
            return;
        }
    }
    // look for user based on username
    else {
        user = await User.findOne({
            where: {
                username: req.body.email
            }
        });
    
        if(!user) {
            res.status(400).json({ msg: 'Username does not exist!' });
            return;
        }
    }
    
    // validate password
    const valid = await bcrypt.compare(req.body.password, user.password);

    if(!valid) {
        res.status(400).json({ msg: 'Wrong password!' });
        return;
    }

    // update cookie
    const salt = await bcrypt.genSalt(10);
    const cookie = generateCookie(80);
    const hashedCookie = await bcrypt.hash(cookie, salt);
    user.update({ hashed_cookie: hashedCookie });

    // save
    user.save();

    res.status(200).json({
        msg: 'You have logged in successfully!',
        data: user,
        cookie: cookie + '@' + user.username
    });
});

router.get('/', async (req, res) => {
    await User.findAll().then(response => {
        res.json(response);
    });
});

router.get('/cookie/:username/:cookie', async (req, res) => {
    const user = await User.findOne({
        where: {
            username: req.params.username
        }
    });

    if(!user) {
        res.status(200).json({ msg: 'Cookie missing in browser!' });
        return;
    }

    const valid = await bcrypt.compare(req.params.cookie, user.hashed_cookie);

    if(!valid) {
        res.status(200).json({ msg: 'Browser cookie does not match stored hashed cookie in database!' });
        return;
    }

    res.status(200).json({
        data: user,
    });
});

router.get('/:id', async (req, res) => {
    await User.findOne({
        where: {
            id: req.params.id
        }
    }).then(response => {
        res.json(response);
    });
});

router.get('/name/:username', async (req, res) => {
    await User.findOne({
        where: {
            username: req.params.username
        }
    })
    .then(response => {
        res.json(response);
    });
});

router.put('/update/:userchange', async (req, res) => {
    const user = await User.findOne({where: {username: req.params.userchange}});
    const email = await User.findOne({where: {email: req.body.email}});
    let emailChange = false;
    let passwordChange = false;
    let message = '';
    
    if(email) {
        return res.status(400).json({ msg: 'Email must be unique!' });
    }

    if(req.body.email !== '') {
        user.email = req.body.email;
        emailChange = true;
    }

    if(req.body.oldPassword !== '' && req.body.newPassword !== '') {
        const validate = await bcrypt.compare(req.body.oldPassword, user.password);
        if(!validate) {
            return res.status(400).json({ msg: 'Old password is wrong!' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.newPassword, salt);
        user.password = hashedPass;
        passwordChange = true;
    }

    user.save();

    if(emailChange === true && passwordChange === true) message = 'Infomation has been updated!';
    else if(emailChange === true) message = 'Email has been updated!';
    else if(passwordChange === true) message = 'Password has been updated!';

    res.send({
        email: user.email,
        msg: message
    });
});

module.exports = router;