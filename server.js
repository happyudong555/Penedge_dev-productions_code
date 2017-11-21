// node.js plugin import

var express = require('express');
var app = express();
var router = express.Router();
var server = require('http').Server(app);
var multiparty = require('multiparty');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var io = require('socket.io')(server);
var ss = require('socket.io-stream');
var passport = require('passport');
var GridStore = require('mongodb').GridStore;
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, __dirname + '/images/')
    },
    filename: function(req, file, cb) {
        // cb(null, file.originalname+ '-' + Date.now()+'.jpg')
        cb(null, file.originalname)
    }
});

var upload = multer({ storage: storage });

app.post('/api/upload', upload.single('file'), function(req, res) {
    res.send("successs");
});

// สร้าง mongoDB ขึ้นมา

var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient
var mongodb;

// เชื่อมต่อ server mongo หรือ config server
MongoClient.connect("mongodb://localhost:27017/PenedgeshopDB", function(err, db) {
    console.log('err', err);
    mongodb = db;
});

//MongoClient.connect('mongodb://'+process.env.MONGO_PORT_27017_TCP_ADDR+':'+process.env.MONGO_PORT_27017_TCP_PORT+'/PenedgeshopDB', function(err, db) {
    //console.log('err', err);
    //mongodb = db;
//});

// express config express

var server = app.listen(3000, function() {
    console.log("server running port 3000");
});

// config facebook login & set up

FacebookStrategy = require('passport-facebook').Strategy;
passport.use(new FacebookStrategy({
        clientID: '133758567104408',
        clientSecret: 'c6bf8ed4998109a98991a9c7c0046a42',
        //callbackURL: 'http://penedge.com/auth/facebook/callback',
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
        profileFields: ['email', 'name', 'picture']
    },
    function(req, accessToken, refreshToken, profile, done) {

        process.nextTick(function() {
            new Promise(function(resolve, reject) {
                    mongodb.collection('users').findOne({ 'id': profile.id }, function(err, item) {
                        if (err === null) resolve(item);
                        else reject(err);
                    })
                })
                .then(function(item) {
                    if (item === null) {
                        mongodb.collection('users').insert(profile._json, function(err, result) {
                            console.log('insert', result);
                        })
                    } else {
                        mongodb.collection('users').update({ id: profile.id }, { $set: profile._json }, {}, function(err, result) {
                            console.log('update', result.result);
                        });
                    }
                });

            return done(null, profile._json);
        });
    }
));

GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(new GoogleStrategy({
        clientID: '498303797453-v8aqa5pvjs2febsgrn1284qnqvpvcobf.apps.googleusercontent.com',
        clientSecret: 'cHip9Vhy6WF8INY1u-OBolwE',
        //callbackURL: 'http://penedge.com/auth/google/callback',
        callbackURL: 'http://localhost:3000/auth/google/callback',
        passReqToCallback: true
    },

    function(req, accessToken, refreshToken, profile, done) {

        process.nextTick(function() {
            new Promise(function(resolve, reject) {
                    mongodb.collection('admins').findOne({ 'id': profile.id }, function(err, item) {
                        if (err === null) resolve(item);
                        else reject(err);
                    })
                })
                .then(function(item) {
                    if (item === null) {
                        mongodb.collection('admins').insert(profile._json, function(err, result) {
                            console.log('insert', result);
                        })
                    } else {
                        mongodb.collection('admins').update({ id: profile.id }, { $set: profile._json }, {}, function(err, result) {
                            console.log('update', result.result);
                        });
                    }
                });

            return done(null, profile._json);
        });
    }
));

passport.serializeUser(function(user, done) {
    //console.log('user', user);
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    // console.log('obj', obj);
    done(null, obj);
});

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

// ต้องใส่เมื่อ link java script ทุกครั้ง
app.use(express.static(__dirname));
app.use('/images', express.static(__dirname + '/images/'));
app.use('/controllers', express.static(__dirname + '/controllers/'));
app.use('/angular', express.static(__dirname + '/node_modules/angular/'));
app.use('/js', express.static(__dirname + '/js/'));
app.use(expressSession({ secret: 'mySecretKey' }));
app.use(passport.initialize());
app.use(passport.session());

// log in with user & admin account data

app.get('/info', function(req, res) {
    if (req.isAuthenticated()) {
        res.json({
            isAuthenticated: true,
            data: req.user
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});

app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
);

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/profile.html'
    }));

// google login

app.get('/auth/google',
passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/plus.profile.emails.read']
}));

app.get('/auth/google/callback',
passport.authenticate('google', {
    successRedirect: '/admin.html'
}));

// log out from user account

app.get('/auth/logout', function(req, res) {
    req.logout();
    res.redirect('/index.html');
});

// log out from admin account

app.get('/auth/exit', function(req, res) {
    req.logout();
    res.redirect('/login.admin.html');
});

// insert data หรือการโยนเอาข้อมูลขึ้น mongoDB
app.post('/api/bookshops', function(req, res) {
    var dat = req.body;
    var adminProfileImage = req.body;
    dat.user_id = req.user.id;
    dat.name = req.user.first_name + ' ' + req.user.last_name;
    adminProfileImage.imageUrl = req.user.picture.data.url;
    mongodb.collection('bookshops').insertOne(dat, function(err, result) {
        res.send(result);

    });
});

// update data

app.put('/api/bookshops/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);

    let params = {
        bookname: req.body.bookname,
        content: req.body.content,
        price: req.body.price,
        shipping: req.body.shipping
       
    }

    if (req.body.image) {
        params.image = req.body.image
    }

    mongodb.collection('bookshops').updateOne({
        _id: o_id
    }, {
        $set: params
    },
    function(err, result) {
        console.log('err', err);
        res.send(result);
    });
});

// connect $scope data from database

app.get('/api/bookshops', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('bookshops').find({ user_id: req.user.id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// call data for update data

app.get('/api/bookshops/load/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('bookshops').find({ _id: o_id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// delete database from mongoDB

app.delete('/api/bookshops/:id',
function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    var dat = { _id: o_id };
    var admin = { _id: o_id };
    mongodb.collection('bookshops').deleteOne(dat, admin, function(err, result) {

        res.send(result);

    });

});

// data from user account

app.post('/api/CardFeeds', function(req, res) {
    var dat = req.body;

    var adminProfileImage = req.body;
    dat.user_id = req.user.id;
    dat.name = req.user.first_name + ' ' + req.user.last_name;
    adminProfileImage.imageUrl = req.user.picture.data.url;
    mongodb.collection('CardFeeds').insertOne(dat, function(err, result) {
        res.send(result);

    });
});

// update data

app.put('/api/CardFeeds/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);

    let params = {
        storyname: req.body.storyname,
        content: req.body.content
       
    }

    if (req.body.image) {
        params.image = req.body.image
    }

    mongodb.collection('CardFeeds').updateOne({
        _id: o_id
    }, {
        $set: params
    },
    function(err, result) {
        console.log('err', err);
        res.send(result);
    });
});

// connect $scope data from database

app.get('/api/CardFeeds', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('CardFeeds').find({ user_id: req.user.id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// call data for update data

app.get('/api/CardFeeds/load/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('CardFeeds').find({ _id: o_id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// delete database from mongoDB

app.delete('/api/CardFeeds/:id',
    function(req, res) {
        var o_id = new mongo.ObjectID(req.params.id);
        var dat = { _id: o_id };
        var admin = { _id: o_id };
        mongodb.collection('CardFeeds').deleteOne(dat, admin, function(err, result) {

            res.send(result);

        });

    });
app.post('/api/promotionsSliders', function(req, res) {
    var dat = req.body;
    var adminProfileImage = req.body;
    dat.user_id = req.user.id;
    dat.name = req.user.first_name + ' ' + req.user.last_name;
    adminProfileImage.imageUrl = req.user.picture.data.url;
    mongodb.collection('promotionsSliders').insertOne(dat, function(err, result) {
        res.send(result);

    });
});

// update data

app.put('/api/promotionsSliders/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);

    let params = {
        bookname: req.body.bookname,
        content: req.body.content,
        price: req.body.price,
        shipping: req.body.shipping
       
    }

    if (req.body.image) {
        params.image = req.body.image
    }

    mongodb.collection('promotionsSliders').updateOne({
        _id: o_id
    }, {
        $set: params
    },
    function(err, result) {
        console.log('err', err);
        res.send(result);
    });
});

// connect $scope data from database

app.get('/api/promotionsSliders', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('promotionsSliders').find({ user_id: req.user.id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// call data for update data

app.get('/api/promotionsSliders/load/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('promotionsSliders').find({ _id: o_id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// delete database from mongoDB

app.delete('/api/promotionsSliders/:id',
    function(req, res) {
        var o_id = new mongo.ObjectID(req.params.id);
        var dat = { _id: o_id };
        mongodb.collection('promotionsSliders').deleteOne(dat, function(err, result) {

            res.send(result);

        });

    });


app.post('/api/cartItems', function(req, res) {
    var dat = {};
    console.log('req.user', req.user);
    dat.user_id = req.user.id;
    dat.name = req.user.first_name + ' ' + req.user.last_name;
    dat.image = req.body.image;
    dat.bookname = req.body.bookname;
    dat.price = req.body.price;
    dat.content = req.body.content;
    dat.PromotionsDetail = req.body.PromotionsDetail;
    mongodb.collection('cartItems').insertOne(dat, function(err, result) {

        res.send(result);

    });
});

// connect $scope data from database

app.get('/api/cartItems', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('cartItems').find({ user_id: req.user.id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// call data for update data

app.get('/api/cartItems/load/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('cartItems').find({ _id: o_id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// delete database from mongoDB

app.delete('/api/cartItems/:id',
    function(req, res) {
        var o_id = new mongo.ObjectID(req.params.id);
        var dat = { _id: o_id };
        mongodb.collection('cartItems').deleteOne(dat, function(err, result) {

            res.send(result);

        });

    });

app.post('/api/banksSupports', function(req, res) {
    var dat = req.body;
    var adminProfileImage = req.body;
    dat.user_id = req.user.id;
    dat.name = req.user.first_name + ' ' + req.user.last_name;
    adminProfileImage.imageUrl = req.user.picture.data.url;
    mongodb.collection('banksSupports').insertOne(dat, function(err, result) {
        res.send(result);

    });
});

// update data

app.put('/api/banksSupports/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('banksSupports').updateOne({
            _id: o_id
        }, {
            $set: req.body
        },
        function(err, result) {
            res.send(result);
        });
});

// connect $scope data from database

app.get('/api/banksSupports', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('banksSupports').find({ user_id: req.user.id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// call data for update data

app.get('/api/banksSupports/load/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('banksSupports').find({ _id: o_id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// delete database from mongoDB

app.delete('/api/banksSupports/:id',
    function(req, res) {
        var o_id = new mongo.ObjectID(req.params.id);
        var dat = { _id: o_id };
        mongodb.collection('banksSupports').deleteOne(dat, function(err, result) {

            res.send(result);

        });

    });

app.post('/api/orders', function(req, res) {
    var dat = req.body;
    console.log(dat);
    dat.user_id = req.body.userpostid;
    dat.name = req.user.first_name + ' ' + req.user.last_name;
    mongodb.collection('orders').insertOne(dat, function(err, result) {

        res.send(result);

    });
});

// update data

app.put('/api/orders/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('orders').updateOne({
            _id: o_id
        }, {
            $set: req.body
        },
        function(err, result) {
            res.send(result);
        });
});

// connect $scope data from database

app.get('/api/orders', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('orders').find({ user_id: req.user.id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

app.get('/api/allbook', (req, res)=>{
    mongodb.collection('bookshops').find().sort({_id: -1}).toArray(function(err, respone) {
        if(!err){
            res.status(200).send(respone);
        }
    });
});

app.get('/api/allpro', (req, res)=>{
    mongodb.collection('promotionsSliders').find().sort({_id: -1}).toArray(function(err, respone) {
        if(!err){
            res.status(200).send(respone);
        }
    });
});

// call data for update data

app.get('/api/orders/load/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('orders').find({ _id: o_id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// delete database from mongoDB

app.delete('/api/orders/:id',
    function(req, res) {
        var o_id = new mongo.ObjectID(req.params.id);
        var dat = { _id: o_id };
        mongodb.collection('orders').deleteOne(dat, function(err, result) {

            res.send(result);

        });

    });

// data from admin account

app.post('/api/admin/CardFeeds', function(req, res) {
    var admin = req.body;
    var dat = req.body;
    var adminProfileImage = req.body;
    //console.log('req.user', req.user);
    admin.name = req.user.name.givenName + ' ' + req.user.name.familyName;
    adminProfileImage.imageUrl = req.user.image.url
    dat.user_id = req.user.id;
    mongodb.collection('CardFeeds').insertOne(admin,dat, function(err, result) {

        res.send(result);

    });
});

// update data

app.put('/api/admin/CardFeeds/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);

    let params = {
        storyname: req.body.storyname,
        content: req.body.content
       
    }

    if (req.body.image) {
        params.image = req.body.image
    }

    mongodb.collection('CardFeeds').updateOne({
        _id: o_id
    }, {
        $set: params
    },
    function(err, result) {
        console.log('err', err);
        res.send(result);
    });
});

// connect $scope data from database

app.get('/api/admin/CardFeeds', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('CardFeeds').find({ user_id: req.user.id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// call data for update data

app.get('/api/admin/CardFeeds/load/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('CardFeeds').find({ _id: o_id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// delete database from mongoDB

app.delete('/api/admin/CardFeeds/:id',
    function(req, res) {
        var o_id = new mongo.ObjectID(req.params.id);
        var dat = { _id: o_id };
        var admin = { _id: o_id };
        mongodb.collection('CardFeeds').deleteOne(dat, admin, function(err, result) {

            res.send(result);

        });

    });


app.post('/api/admin/PostFeeds', function(req, res) {
    var admin = req.body;
    var dat = req.body;
    var adminProfileImage = req.body;
    //console.log('req.user', req.user);
    admin.name = req.user.name.givenName + ' ' + req.user.name.familyName;
    adminProfileImage.imageUrl = req.user.image.url
    dat.user_id = req.user.id;
    mongodb.collection('PostFeeds').insertOne(admin,dat, function(err, result) {

        res.send(result);

    });
});

// update data

app.put('/api/admin/PostFeeds/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);

    let params = {
        storyname: req.body.storyname,
        content: req.body.content
       
    }

    if (req.body.image) {
        params.image = req.body.image
    }

    mongodb.collection('PostFeeds').updateOne({
        _id: o_id
    }, {
        $set: params
    },
    function(err, result) {
        console.log('err', err);
        res.send(result);
    });
});

// connect $scope data from database

app.get('/api/admin/PostFeeds', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('PostFeeds').find({ user_id: req.user.id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// call data for update data

app.get('/api/admin/PostFeeds/load/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('PostFeeds').find({ _id: o_id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// delete database from mongoDB

app.delete('/api/admin/PostFeeds/:id',
    function(req, res) {
        var o_id = new mongo.ObjectID(req.params.id);
        var dat = { _id: o_id };
        var admin = { _id: o_id };
        mongodb.collection('PostFeeds').deleteOne(dat, admin, function(err, result) {

            res.send(result);

        });

    });


app.post('/api/admin/bookshops', function(req, res) {
    var admin = req.body;
    var dat = req.body;
    var adminProfileImage = req.body;
    //console.log('req.user', req.user);
    admin.name = req.user.name.givenName + ' ' + req.user.name.familyName;
    adminProfileImage.imageUrl = req.user.image.url
    dat.user_id = req.user.id;
    mongodb.collection('bookshops').insertOne(admin,dat, function(err, result) {

        res.send(result);

    });
});

// update data

app.put('/api/admin/bookshops/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);

    let params = {
        bookname: req.body.bookname,
        content: req.body.content,
        price: req.body.price,
        shipping: req.body.shipping
       
    }

    if (req.body.image) {
        params.image = req.body.image
    }

    mongodb.collection('bookshops').updateOne({
        _id: o_id
    }, {
        $set: params
    },
    function(err, result) {
        console.log('err', err);
        res.send(result);
    });
});

// connect $scope data from database

app.get('/api/admin/bookshops', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('bookshops').find({ user_id: req.user.id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// call data for update data

app.get('/api/admin/bookshops/load/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('bookshops').find({ _id: o_id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// delete database from mongoDB

app.delete('/api/admin/bookshops/:id',
    function(req, res) {
        var o_id = new mongo.ObjectID(req.params.id);
        var dat = { _id: o_id };
        var admin = { _id: o_id };
        mongodb.collection('bookshops').deleteOne(dat, admin, function(err, result) {

            res.send(result);

        });

    });

app.post('/api/admin/promotionsSliders', function(req, res) {
    var admin = req.body;
    var dat = req.body;
    var adminProfileImage = req.body;
    //console.log('req.user', req.user);
    admin.name = req.user.name.givenName + ' ' + req.user.name.familyName;
    adminProfileImage.imageUrl = req.user.image.url
    dat.user_id = req.user.id;
    mongodb.collection('promotionsSliders').insertOne(admin,dat, function(err, result) {

        res.send(result);

    });
});

// update data

app.put('/api/admin/promotionsSliders/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);

    let params = {
        bookname: req.body.bookname,
        content: req.body.content,
        price: req.body.price,
        shipping: req.body.shipping
       
    }

    if (req.body.image) {
        params.image = req.body.image
    }

    mongodb.collection('promotionsSliders').updateOne({
        _id: o_id
    }, {
        $set: params
    },
    function(err, result) {
        console.log('err', err);
        res.send(result);
    });
});

// connect $scope data from database

app.get('/api/admin/promotionsSliders', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('promotionsSliders').find({ user_id: req.user.id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// call data for update data

app.get('/api/admin/promotionsSliders/load/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('promotionsSliders').find({ _id: o_id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// delete database from mongoDB

app.delete('/api/admin/promotionsSliders/:id',
    function(req, res) {
        var o_id = new mongo.ObjectID(req.params.id);
        var dat = { _id: o_id };
        var admin = { _id: o_id };
        mongodb.collection('promotionsSliders').deleteOne(dat, admin, function(err, result) {

            res.send(result);

        });

    });


app.post('/api/admin/banksSupports', function(req, res) {
    var admin = req.body;
    var dat = req.body;
    var adminProfileImage = req.body;
    //console.log('req.user', req.user);
    admin.name = req.user.name.givenName + ' ' + req.user.name.familyName;
    adminProfileImage.imageUrl = req.user.image.url
    dat.user_id = req.user.id;
    mongodb.collection('banksSupports').insertOne(admin,dat, function(err, result) {

        res.send(result);

    });
});

app.put('/api/admin/banksSupports/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('banksSupports').updateOne({
            _id: o_id
        }, {
            $set: req.body
        },
        function(err, result) {
            res.send(result);
        });
});

// connect $scope data from database

app.get('/api/admin/banksSupports', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('banksSupports').find({ user_id: req.user.id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// call data for update data

app.get('/api/admin/banksSupports/load/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('banksSupports').find({ _id: o_id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// delete database from mongoDB

app.delete('/api/admin/banksSupports/:id',
    function(req, res) {
        var o_id = new mongo.ObjectID(req.params.id);
        var dat = { _id: o_id };
        var admin = { _id: o_id };
        mongodb.collection('banksSupports').deleteOne(dat, admin, function(err, result) {

            res.send(result);

        });

    });


app.post('/api/admin/cartItems', function(req, res) {
    var dat = {};
    var admin = req.body;
    var adminProfileImage = req.body;
    console.log('req.user', req.user);
    dat.user_id = req.user.id;
    dat.name = req.user.first_name + ' ' + req.user.last_name;
    dat.image = req.body.image;
    adminProfileImage.imageUrl = req.user.image.url;
    dat.bookname = req.body.bookname;
    admin.name = req.user.name.givenName + ' ' + req.user.name.familyName;
    dat.price = req.body.price;
    dat.content = req.body.content;
    dat.PromotionsDetail = req.body.PromotionsDetail;
    mongodb.collection('cartItems').insertOne(dat,admin, function(err, result) {

        res.send(result);

    });
});

// connect $scope data from database

app.get('/api/admin/cartItems', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('cartItems').find({ user_id: req.user.id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// call data for update data

app.get('/api/admin/cartItems/load/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('cartItems').find({ _id: o_id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// delete database from mongoDB

app.delete('/api/admin/cartItems/:id',
    function(req, res) {
        var o_id = new mongo.ObjectID(req.params.id);
        var dat = { _id: o_id };
        mongodb.collection('cartItems').deleteOne(dat, function(err, result) {

            res.send(result);

        });

    });

// Feed of index & store page

app.get('/api/index.html', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('CardFeeds').find().sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

app.get('/api/SliderCardFeeds', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('CardFeeds').find().sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

app.get('/api/PostFeedSlider', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('PostFeeds').find().sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

app.get('/api/store.html', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('bookshops').find().sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

app.get('/api/FeedPromotionSliders', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('promotionsSliders').find().sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

app.get('/api/banksFeeds', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('banksSupports').find().sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// control user contents

app.get('/api/admin/CardFeeds/control', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('CardFeeds').find().sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

app.get('/api/admin/PostFeeds/control', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('PostFeeds').find().sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

app.get('/api/admin/bookshops/control', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('bookshops').find().sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

app.get('/api/admin/promotionsSliders/control', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('promotionsSliders').find().sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});



// favorite

app.post('/api/favorites', function(req, res) {
    var dat = {};
    console.log('req.user', req.user);
    dat.user_id = req.user.id;
    dat.name = req.user.first_name + ' ' + req.user.last_name;
    dat.image = req.body.image;
    dat.imageUrl = req.body.imageUrl;
    dat.storyname = req.body.storyname;
    dat.content = req.body.content;
    mongodb.collection('favorites').insertOne(dat, function(err, result) {

        res.send(result);

    });
});

// connect $scope data from database

app.get('/api/favorites', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('favorites').find({ user_id: req.user.id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// call data for update data

app.get('/api/favorites/load/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    mongodb.collection('favorites').find({ _id: o_id }).sort({_id: -1}).toArray(function(err, result) {
        res.send(result);
    });
});

// delete database from mongoDB

app.delete('/api/favorites/:id',
    function(req, res) {
        var o_id = new mongo.ObjectID(req.params.id);
        var dat = { _id: o_id };
        mongodb.collection('favorites').deleteOne(dat, function(err, result) {

            res.send(result);

        });

});
