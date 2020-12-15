const router = require('express').Router();
const passport = require('../pass').passport;
const db = require('../database');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

let local_host = 'localhost:1337';
if (process.env.BURP_HOST) {
    // will work this way on only MAC!!!
    local_host = process.env.BURP_HOST; // for docker to connect to host
}

let key = '/OBjN20fycNr77DOUz5Pi9fiiuTZUv3gX'

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

/*
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
 */



// read bu id
router.get('/api/users', passport.authenticate('cookie'), function (req, res) {
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
router.post('/api/register',  function (req, res) {
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
router.put('/api/users', passport.authenticate('cookie'), function (req, res) {
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
router.delete('/api/users', passport.authenticate('cookie'), function (req, res) {
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


router.get('/api/base', function (req, res) {
    let url ='http://'+local_host+key+'/v0.1/knowledge_base/issue_definitions';

    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send( null );
    res.send(xmlHttp.responseText);

});

router.get('/api/scan', function (req, res) {
    let help = "{" +
        "  \"urls\": [String],\n" +
        "  \"name\": String,                           // defaults to: null\n" +
        "  \"scope\": Scope,                           // defaults to: null\n" +
        "  \"application_logins\": [ApplicationLogin], // defaults to: []\n" +
        "  \"scan_configurations\": [Configuration],   // defaults to: []\n" +
        "  \"resource_pool\": String,                  // defaults to: null\n" +
        "  \"scan_callback\": Callback                 // defaults to: null\n" +
        "}";

    res.send(JSON.stringify({"data":help}));
});

router.post('/api/scan', function (req, res) {
    let url ='http://'+local_host+key+'/v0.1/scan';

    //console.log(req.data);
    let data = req.body;//{"urls":["http://google.com"]}
    console.log(JSON.stringify(data))
    //res.send(data.toString());

    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", url, false ); // false for synchronous request
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send( JSON.stringify(data) );
    console.log(xmlHttp.responseText);
    res.send(JSON.stringify({"data":xmlHttp.responseText}));



});

router.get('/api/scan/:id', function (req, res) {

    let url ='http://'+local_host+key+'/v0.1/scan/'+req.params.id;

    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false );
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send();
    res.send(xmlHttp.responseText);
})

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