var express = require('express');
var loginRouter = express.Router();
var logoutRouter = express.Router();
var signupRouter = express.Router();
var multer  = require('multer')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/uploads')
  },
  filename: function (req, file, cb) {
    
    cb(null, file.fieldname + '-' + Date.now()+'.jpg')
  }
})

var upload = multer({ storage: storage})

var authMiddleware = require('./middlewares/auth');

loginRouter.route('/')
    .get(authMiddleware.noAuthed, (req, res) => {
        res.render('auth/views/login', req.query);
    })
    .post((req, res) => {
        var db = require('../../lib/database')();

        db.query(`SELECT * FROM user WHERE username=?`, [req.body.username], (err, results, fields) => {
            if (err) throw err;
            if (results.length === 0) return res.redirect('/login?incorrect');
            
            
            var user = results[0];
            if (user.isBan == 1) return res.redirect('/login?banned');

            if (user.pw !== req.body.pw) return res.redirect('/login?incorrect');

            delete user.pw;

            req.session.user = user;
            
            return res.redirect('/index');
        });
    });
signupRouter.get('/', (req, res) => {
    res.render('auth/views/signup', {query: req.query.user});
})
signupRouter.post('/', upload.single('imagefile'), (req, res) => {
        var db = require('../../lib/database')();
        if (typeof req.file !== 'undefined')
            req.body.image = req.file.filename;
        else
            req.body.image = 'anon.jpg'

        var user = req.body;
        req.session.user = user;

        var username = req.body.username;
        var email = req.body.email;
        var pw = req.body.pw;
        var bday = req.body.year+'/'+req.body.bday;
        var image = req.body.image;
        const queryString = 'INSERT INTO user (username, email, pw, bday, image) VALUES (?, ?, ?, ?,?)' ;
        db.query(queryString ,[username, email, pw, bday, image] , (err, results, fields) => {
            if (err) return res.redirect('/signup?user=kaparehas');

            delete user.pw;
        
            return res.redirect('/logout');
        });
})

logoutRouter.get('/', (req, res) => {
    req.session.destroy(err => {
        if (err) throw err;
        res.redirect('/login');
    });
});

exports.login = loginRouter;
exports.logout = logoutRouter;
exports.signup = signupRouter;
