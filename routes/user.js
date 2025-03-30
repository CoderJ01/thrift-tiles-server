// Express.js
const router = require('express').Router();

// other Node.js packages
const bcrypt = require('bcrypt');

// model
const User = require('../models/User');

// other imports
const generateCookie = require('../util/generateCookie');
const generateStringOfDigits = require('../util/generateStringOfDigits');

// register user
router.post('/register', async (req, res) => {
    // hash
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    // find email in database
    const email = await User.findOne({
        where: {
            email: req.body.email
        }
    });
    
    // prevent the use of a duplicate email
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

    // notify user of successful account creation
    res.status(200).json({
        msg: 'Your account has been successfully created. You may log in!',
    });
});

// log user into website
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
    const cookie = generateCookie(80); // cookie will be a random long string of characters
    const hashedCookie = await bcrypt.hash(cookie, salt);
    user.update({ hashed_cookie: hashedCookie }); // cookie will be hashed in database

    // save the updated information for the user
    user.save();

    res.status(200).json({
        msg: 'You have logged in successfully!', // notify user of successful login
        data: user,
        cookie: cookie + '@' + user.username // this cookie will be created on the browser for the client
    });
});

// get all users
router.get('/', async (req, res) => {
    await User.findAll().then(response => {
        res.json(response);
    });
});

// get user by username and cookie
// this tells the backend precisely which user is logged into the site
router.get('/cookie/:username/:cookie', async (req, res) => {
    // find user
    const user = await User.findOne({
        where: {
            // req.params.username is retrieved from the cookie in the browser (client)
            username: req.params.username
        }
    });

    // prohibit access to user's account if cookie is missing
    if(!user) {
        res.status(200).json({ msg: 'Cookie missing in browser!' });
        return;
    }

    // validate cookie, which is hashed in the database
    const valid = await bcrypt.compare(req.params.cookie, user.hashed_cookie);
    if(!valid) {
        res.status(200).json({ msg: 'Browser cookie does not match stored hashed cookie in database!' });
        return;
    }

    res.status(200).json({
        data: user,
    });
});

// get a single user by id
router.get('/:id', async (req, res) => {
    await User.findOne({
        where: {
            id: req.params.id
        }
    }).then(response => {
        res.json(response);
    });
});

// get a single user by username
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

// update user info
router.put('/update/:userchange', async (req, res) => {
    const user = await User.findOne({where: {username: req.params.userchange}}); // userchange = username
    const email = await User.findOne({where: {email: req.body.email}});

    let emailChange = false;
    let passwordChange = false;
    let message = '';
    
    // updated email must be unique
    if(email) {
        return res.status(400).json({ msg: 'Email must be unique!' });
    }

    // if email is not blank (and is unique), change email to updated email
    if(req.body.email !== '') {
        user.email = req.body.email;
        emailChange = true;
    }

    // if old password and new password is not blank, update the old password to be the new password
    if(req.body.oldPassword !== '' && req.body.newPassword !== '') {
        // user must first input old password correctly 
        const validate = await bcrypt.compare(req.body.oldPassword, user.password);
        if(!validate) {
            return res.status(400).json({ msg: 'Old password is wrong!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.newPassword, salt); // hash new password in database
        user.password = hashedPass; // update user's password to be the new password
        passwordChange = true;
    }

    user.save(); // save updated information

    // create one of these messages depending on which piece of info was changed
    if(emailChange === true && passwordChange === true) message = 'Infomation has been updated!';
    else if(emailChange === true) message = 'Email has been updated!';
    else if(passwordChange === true) message = 'Password has been updated!';

    res.send({
        email: user.email,
        msg: message // display message to user
    });
});

module.exports = router;