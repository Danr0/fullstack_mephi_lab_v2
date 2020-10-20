const router = require('express').Router();
const passport = require('../pass').passport;
const db = require('../database');

const logger = require('../logger');
const {
    HttpError,
    FORBIDDEN,
    NOT_FOUND,
    BAD_REQUEST,
    UNAUTHORIZED,
    INTERNAL_SERVER_ERROR
} = require("../httpError");


router.use(logger.logRequestToConsole);

router.get('/', function (req, res) {
    res.render("index.hbs");
});

router.get('/login', function (req, res) {

    let message = req.flash();

    res.render("login.hbs", {
        message: message.error
    });

});
router.post('/login', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/register', function (req, res) {
    let message = req.flash();

    res.render("register.hbs", {
        message: message.error
    });
});

router.post('/register', passport.authenticate('register', {
    successRedirect: '/',
    failureRedirect: '/register',
    failureFlash: true
}));

router.get('/register', function (req, res) {

    let message = req.flash();

    res.render("register.hbs", {
        message: message.error
    });

});

router.get('/settings', passport.authenticate('cookie', {
    failureRedirect: '/login',
    failureFlash: {message: "You should authorize to access this page"}
}), function (req, res) {
    res.render('settings.hbs');
});

router.post('/settings', passport.authenticate('cookie', {
    failureRedirect: '/login',
    failureFlash: true
}), db.updateData, function (req, res) {
    res.render('settings.hbs');
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});


router.get('/profile', passport.authenticate('cookie', {
    failureRedirect: '/login',
    failureFlash: {message: "You should authorize to access this page"}
}), function (req, res) {
    res.render('profile.hbs', {
        username: req.user.username,
        is_admin: req.user.is_admin.toString()
    })
});

// read bu id
router.get('/api', passport.authenticate('cookie', {
    failureRedirect: '/login',
    failureFlash: {message: "You should authorize to access this page"}
}), function (req, res) {
    if(req.query.id){
        db.findUserById(req.query.id).then(user => {
            if (user !== undefined && user !== null)
                res.json({success:true,username:user.username,is_admin:user.is_admin});
            else
                res.json({success:false,message:"user not found"})
        })
            .catch(e => res.json({success:false,message:e.toString()}));
    }
    else
        res.json({success:false,message:"id is required"});
});

// register
router.post('/api',  function (req, res) {
    if(!req.body.username || !req.body.password)
        res.json({success:false,message:"username and password are required"});
    let username = req.body.username;
    let password = req.body.password;
    db.isUserExist(username).then(exist => {
        if (exist) {
            res.json({success:false,message: "User already exist"});
        } else {
            db.createNewUser(username, password).then(user => {
                res.json({success: true});
            }).catch(e => {
                res.json({success:false,message: e.toString()});
            });
        }
    }).catch(e => {
        res.json({success:false,message: e.toString()});
    });
});

//edit
router.put('/api', passport.authenticate('cookie', {
    failureRedirect: '/login',
    failureFlash: {message: "You should authorize to access this page"}
}), function (req, res) {
    let id = req.user.id;
    if(req.query.id)
        id = req.query.id;
    let password = req.body.password;
    console.log(password);
    if(password){
        if(id === req.user.id || req.user.is_admin){
            db.isUserExistById(id).then(exist => {
                if (exist){
                    db.updateDataById(id,password)
                        .then(user =>
                            res.json({success:true}))
                        .catch(e =>
                            res.json({success:false,message:e.toString()})
                        )
                } else
                    res.json({success:false,message:"user not found"})}
            ).catch(e => res.json({success:false,message:e.toString()}));
        }
        else
            res.json({success:false,message: "Invalid id"});
    }
    else
        res.json({success:false,message: "Password is required"});


});

//delete
router.delete('/api', passport.authenticate('cookie', {
    failureRedirect: '/login',
    failureFlash: {message: "You should authorize to access this page"}
}), function (req, res) {
    if(req.user.is_admin){
        if(req.query.id){
            db.findUserById(req.query.id).then(user => {
                if (user !== undefined && user !== null){
                    db.deleteUserById(req.query.id).then(u =>
                        res.json({success:true}))
                        .catch(e =>
                            res.json({success:false,message:e.toString()}))
                }
                else
                    res.json({success:false,message:"user not found"})
            })
                .catch(e => res.json({success:false,message:e.toString()}));
        }
        else
            res.json({success:false,message:"id is required"});
    } else
        res.json({success:false,message:"only for admins"});

});

//==============Error handle and logging===========================

router.use(function (req, res, next) {
    throw new HttpError(NOT_FOUND, 'Not Found');
});


router.use(function (err, req, res, next) {

    if (!err.statusCode) {
        err.statusCode = INTERNAL_SERVER_ERROR;
        err.name = INTERNAL_SERVER_ERROR + " ERROR";
    }


    res.status(err.statusCode).render("error.hbs", {
        message: err.message,
        error_name: err.name
    });
    next(err);
});

router.use(logger.logErrorsToFile);

module.exports = router;