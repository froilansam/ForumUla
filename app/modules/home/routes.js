/**
 * We load the ExpressJS module.
 * More than just a mere framework, it is also a complementary library
 * to itself.
 */
var express = require('express');

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


/**
 * Having that in mind, this is one of its robust feature, the Router.
 * You'll appreciate this when we hit RESTful API programming.
 * 
 * For more info, read this: https://expressjs.com/en/4x/api.html#router
 */
var router = express.Router();
var forumRouter = express.Router();
var subforumRouter = express.Router();

var category ="";

//Middleware
var authMiddleware = require('../auth/middlewares/auth');

router.use(authMiddleware.hasAuth);

// For index Page
var indexController = require('./controllers/index');
router.get('/', indexController);


//For Admin Page
var indexadminController = require('./controllers/indexadmin');
router.get('/admin', authMiddleware.AdminAuth, indexadminController);


//POST for Add Forum
router.post('/admin/addforum', (req, res) => {
    var db = require('../../lib/database')();
    var categoryname = req.body.categoryname;
    var categorydes = req.body.categorydes;

    console.log(categoryname +' '+ categorydes);
    const queryString = `INSERT INTO category (categoryname, categorydes, isMod) VALUES (?, ?, ?)`

    db.query(queryString, [req.body.categoryname, req.body.categorydes, req.body.isMod],  function (err, results, fields) {
        if (err) return res.redirect('/index/admin?forum=duplicate');
        
        console.log(results);
        res.redirect('/index/admin');
        
    });
});

//POST for Add Subform
router.post('/admin/addsubforum', (req, res) => {
    var db = require('../../lib/database')();
    const queryString = 'SELECT * FROM category WHERE categoryname = ?';
    const queryString1 = `INSERT INTO sub (intSubCategoryID, subname, subdescription) VALUES (?, ?, ?)`;
    db.query(queryString, [req.body.categoryname],  function (err, results, fields) {
        if (err) return res.send(err);
        
        db.query(queryString1, [results[0].intCategoryID, req.body.subname, req.body.subdescription],  function (err, results, fields) {
            if (err) return res.redirect('/index/admin?subforum=duplicate');
            console.log(results);
            res.redirect('/index/admin');
        });
    });
});

//For edit forum page
router.get('/admin/editforum/:name', authMiddleware.AdminAuth, (req, res) => {
    var db = require('../../lib/database')();
    const queryString = 'SELECT * FROM category WHERE categoryname = ?';
    db.query(queryString, [req.params.name],  function (err, results, fields) {
        if (err) return res.send(err);
        req.session.categoryname = req.params.name;
        console.log(results[0]);
        var puta = req.session.user;
        res.render('home/views/editforum', {puta:puta, users: results[0], query: req.query.forum});
    });
    
});

//POST for edit forum page
router.post('/admin/editforum', (req, res) => {
    console.log('fuck'+req.body.categoryname)
    res.redirect('/index/admin/editforum/'+ req.body.categoryname);
});

//POST for edit forum
router.post('/admin/editforum/save/:id', (req, res) => {
    var db = require('../../lib/database')();
    const queryString = `UPDATE category SET categoryname = ?, categorydes = ?, isMod = ? WHERE intCategoryID = ?`;
    db.query(queryString, [req.body.categoryname, req.body.categorydes, req.body.isMod, req.params.id],  function (err, results, fields) {
        if (err) return res.redirect('/index/admin/editforum/'+ req.session.categoryname+'?forum=duplicate');

        res.redirect('/index/admin');
    });
});

//for edit subforum
router.get('/admin/editsubforum/:name', authMiddleware.AdminAuth, (req, res) => {
    var db = require('../../lib/database')();
    const queryString = 'SELECT * FROM sub WHERE subname = ?';
    db.query(queryString, [req.params.name],  function (err, results, fields) {
        if (err) return res.send(err);
        req.session.subname = req.params.name;
        console.log(results[0]);
        var puta = req.session.user;
        res.render('home/views/editsubforum', {puta: puta, users: results[0], subquery: req.query.subforum});
    });
    
});

//post for edit subforum
router.post('/admin/editsubforum', (req, res) => {
    console.log('fuck'+req.body.subname)
    res.redirect('/index/admin/editsubforum/'+ req.body.subname);
});


//post for saving edited subforum
router.post('/admin/editsubforum/save/:id', (req, res) => {
    var db = require('../../lib/database')();
    const queryString = `UPDATE sub SET subname = ?, subdescription = ? WHERE intSubID = ?`;
    db.query(queryString, [req.body.subname, req.body.subdescription, req.params.id],  function (err, results, fields) {
        if (err) return res.redirect('/index/admin/editsubforum/'+ req.session.subname+'?subforum=duplicate');

        res.redirect('/index/admin');
    });
});

//for user lounge
router.get('/admin/usermanip/:id/:ban', (req, res) => {
    var db = require('../../lib/database')();
    const queryString = `UPDATE user SET isBan = ? WHERE id = ?`;
    db.query(queryString, [req.params.ban, req.params.id],  function (err, results, fields) {
        if (err) return res.send(err);

        res.redirect(`/index/admin/usermanip/${req.session.state}`)
    });
});

//Updating role
router.get('/mod/:id/:state', (req, res) => {
    console.log('FUCK!');
    var db = require('../../lib/database')();
    var parameter = req.params.id;
    var state = req.params.state;
    const queryString = 'SELECT * FROM user WHERE id = ?'
    db.query(queryString, [parameter],  function (err, results, fields) {
        if (err) return res.send(err);
        
        var userResult = results[0];

        if(userResult.isMod == 0){
            const queryString = `UPDATE user SET isMod = ? WHERE id = ?`;
            var db = require('../../lib/database')();
            db.query(queryString, [1, parameter],  function (err, results, fields) {
                if (err) return res.send(err);


               res.redirect(`/index/admin/usermanip/${state}`);
            });
        }
        else if(userResult.isMod == 1){
            const queryString = `UPDATE user SET isMod = ? WHERE id = ?`;
            var db = require('../../lib/database')();
            db.query(queryString, [0, parameter],  function (err, results, fields) {
                if (err) return res.send(err);

                res.redirect(`/index/admin/usermanip/${state}`);
            });
        }

        
    });
    
});




//For viewing users whi is banned or active
router.get('/admin/usermanip/:state', (req, res) => {
    var db = require('../../lib/database')();
    const queryString = `SELECT * FROM user WHERE isBan = ? AND type = 'normal'`;
    if (req.params.state === 'Active'){
        db.query(queryString, [0],  function (err, active, fields) {
            if (err) return res.send(err);

            var date = []; 
            for(var i=0; i<active.length; i++)
            {       
                
                    var today = active[i].bday;
                    var dd = today.getDate();
                    var mm = today.getMonth()+1; //January is 0!
                    var yyyy = today.getFullYear();

                    if(dd<10) {
                        dd = '0'+dd
                    } 

                    if(mm<10) {
                        mm = '0'+mm
                    } 

                    active[i].bday = mm + '•' + dd + '•' + yyyy;
            }
                var puta = req.session.user;

            res.render('home/views/users', {puta: puta, users: active, state: req.params.state})
        });
    }
    else if (req.params.state === 'Banned'){
        db.query(queryString, [1],  function (err, active, fields) {
            if (err) return res.send(err);

            var date = []; 
            for(var i=0; i<active.length; i++)
            {       
                
                    var today = active[i].bday;
                    var dd = today.getDate();
                    var mm = today.getMonth()+1; //January is 0!
                    var yyyy = today.getFullYear();

                    if(dd<10) {
                        dd = '0'+dd
                    } 

                    if(mm<10) {
                        mm = '0'+mm
                    } 

                    active[i].bday = mm + '•' + dd + '•' + yyyy;
            }
            var puta = req.session.user;
            res.render('home/views/users', {puta:puta, users: active, state: req.params.state})
        });
    }

    
});

//For Userlounge page
router.post('/admin/usermanip', (req, res) => {
    var state = req.body.isBan;
    req.session.state = state;
    res.redirect(`/index/admin/usermanip/${state}`);
});


//Profile
router.get('/profile', (req, res) => {

	var puta= req.session.user;
	
	var today = new Date(puta.bday);
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	console.log('2222222222222222222222222222222222222222222222');
	console.log(yyyy);
	console.log('2222222222222222222222222222222222222222222222');
	if(dd<10) {
		dd = '0'+dd
	} 
	if(mm<10) {
		mm = '0'+mm
	} 

	today = mm + '•' + dd + '•' + yyyy;
    res.render('home/views/profile', {puta: puta, today: today});
});

router.get('/messages', (req, res) => {

	var puta= req.session.user;
	var db = require('../../lib/database')();
    const queryString = `SELECT * FROM message WHERE receiver = ? ORDER BY sender`;
    db.query(queryString, [puta.username],  function (err, active, fields) {
        if(err) return res.send(err);
        
        res.render('home/views/chatPage', {puta: puta, active: active});
    });
    
});

router.get('/messages/:sender', (req, res) => {
    var userMessage = req.params.sender;
    var puta= req.session.user;

	var db = require('../../lib/database')();
    const queryString = `SELECT * FROM forum.message WHERE (receiver = ? OR receiver = ?) AND (sender = ? OR sender = ?)`;
    db.query(queryString, [puta.username, userMessage, puta.username, userMessage],  function (err, active, fields) {
        if(err) return res.send(err);
        console.log('tieitieitie')
        console.log(active)
        console.log('tieitieitie')
        res.render('home/views/chat', {puta: puta, active: active, userMessage: userMessage});
    });
    
});

router.post('/messages/:receiver', (req, res) => {
    var userMessage = req.params.receiver;
    var puta= req.session.user;

	var db = require('../../lib/database')();
    const queryString = 'INSERT INTO message (messageContent, sender, receiver) VALUES (?, ?, ?)'
    db.query(queryString, [req.body.messageContent, puta.username, userMessage],  function (err, active, fields) {
        if(err) return res.send(err);

        res.redirect(`/index/messages/${userMessage}`);
    });
    
});

router.get('/profile/:username', (req, res) => {

    var db = require('../../lib/database')();
    const queryString = `SELECT * FROM user WHERE username = ?`;
    db.query(queryString, [req.params.username],  function (err, active, fields) {
		if(err) return res.send(err);

		var today = active[0].bday;
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();

		if(dd<10) {
			dd = '0'+dd
		} 
		if(mm<10) {
			mm = '0'+mm
		} 

		active[0].bday = mm + '•' + dd + '•' + yyyy;
		
    	res.render('home/views/otherprofile', {puta: active[0]});
    });
});

router.get('/editprofile/:username', (req, res) => {

    var db = require('../../lib/database')();
    const queryString = `SELECT * FROM user WHERE username = ?`;
    db.query(queryString, [req.params.username],  function (err, active, fields) {
		if(err) return res.send(err);

		var today = active[0].bday;
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();

		if(dd<10) {
			dd = '0'+dd
		} 
		if(mm<10) {
			mm = '0'+mm
		} 

		active[0].bday = mm + '-' + dd;
		
    	res.render('home/views/editprofile', {puta: active[0], year: yyyy, query: req.query.user});
    });
});

router.get('/fuck', (req, res) => {
    res.render('home/views/chat');
})

router.post('/editprofile/:username', upload.single('imagefile'), (req, res) => {
        var db = require('../../lib/database')();
		console.log(req.body)
       
		
		
		if (typeof req.file !== 'undefined'){
			req.body.image = req.file.filename;
			
		

			var username = req.body.username;
			var email = req.body.email;
			var pw = req.body.pw;
			var bday = req.body.year+'-'+req.body.bday;
			var image = req.body.image;

			req.session.user.username = username;
			req.session.user.email = email;
			req.session.user.pw = pw;
			req.session.user.bday = bday;
			req.session.user.image = image;
			console.log('22222222222222222222222ss2222222222222222222222');
			console.log(req.session);
			console.log('2222222222222222222222ss222222222222222222222222');
			const queryString = 'UPDATE user SET username = ?, email = ?, pw = ?, bday = ?, image = ? WHERE username = ?' ;
			db.query(queryString ,[username, email, pw, bday, image, req.params.username] , (err, results, fields) => {
				if (err) return res.redirect(`/index/editprofile/${req.params.username}?user=kaparehas`);

				delete req.session.user.pw;
			
				return res.redirect(`/index/profile`);
			});
		}

		else if (typeof req.file === 'undefined'){
			
			var username = req.body.username;
			var email = req.body.email;
			var pw = req.body.pw;
			var bday = req.body.year +'-'+req.body.bday;

			req.session.user.username = username;
			req.session.user.email = email;
			req.session.user.pw = pw;
			req.session.user.bday = bday;
			console.log('22222222222222222222222ss2222222222222222222222');
			console.log(req.session);
			console.log('2222222222222222222222ss222222222222222222222222');

			const queryString = 'UPDATE user SET username = ?, email = ?, pw = ?, bday = ? WHERE username = ?' ;
			db.query(queryString ,[username, email, pw, bday, req.params.username] , (err, results, fields) => {
				if (err) return res.redirect(`/index/editprofile/${req.params.username}?user=kaparehas`);

				delete req.session.user.pw;
			
				return res.redirect(`/index/profile`);
			});
		}

})





forumRouter.use(authMiddleware.hasAuth);

var indexforumController = require('./controllers/indexforum');
forumRouter.get('/:id', indexforumController);


subforumRouter.get('/:id', authMiddleware.hasAuth, (req, res) => {
    console.log(req.session);

    if (typeof process.env.ENABLE_DATABASE !== 'undefined' && process.env.ENABLE_DATABASE === 'false') {

        return render([]);
    }


    var db = require('../../lib/database')();

    db.query('SELECT * FROM (sub JOIN category ON sub.intSubCategoryID = category.intCategoryID) JOIN post ON sub.intSubID = post.intPostSubID where isdeleted = 0 AND subname = ?',[req.params.id] , function (err, results, fields) {
        
        if (err) return res.send(err);
        console.log('kalito!');
        console.log(results);
        var date = []; 
        for(var i=0; i<results.length; i++)
        {       
               
                var today = results[i].postdate;
                var dd = today.getDate();
                var mm = today.getMonth()+1; //January is 0!
                var yyyy = today.getFullYear();

                if(dd<10) {
                    dd = '0'+dd
                } 

                if(mm<10) {
                    mm = '0'+mm
                } 

                date.push(yyyy + '-' + mm + '-' + dd);
        }
        var puta = req.session.user;

        render(results, puta, date);
    });

    function render(users,puta, date) {
        var db = require('../../lib/database')();

        db.query(`SELECT * FROM user`, function (err, results, fields){
            if (err) res.send(err);
            category = req.params.id;
            res.render('home/views/subforum', { results: results, puta: puta, users: users, date: date, categName: req.params.id});
        });
    }
});


subforumRouter.post('/:id', (req, res) => {
  
    console.log(req.session);

    if (typeof process.env.ENABLE_DATABASE !== 'undefined' && process.env.ENABLE_DATABASE === 'false') {

        return render([]);
    }


    var db = require('../../lib/database')();
    const queryString = 'SELECT * FROM sub WHERE subname = ?'
    db.query(queryString, [category] , function (err, results, fields) {

        
        if (err) return res.send(err);
        console.log(results);
        var puta = req.session.user.username;
        

        render(results[0].intSubID, puta);
    });

    function render(firstPost,puta) {
       console.log('yelo')
        console.log(puta)
        var db = require('../../lib/database')();
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();

        if(dd<10) {
            dd = '0'+dd
        } 

        if(mm<10) {
            mm = '0'+mm
        } 

        today = yyyy + '-' + mm + '-' + dd;
        const queryString1 = 'INSERT INTO post (intPostSubID, author, title, content, postdate) VALUES (?, ?, ?, ?, ?)'
        db.query(queryString1, [firstPost, puta, req.body.title, req.body.content, today] , function (err, results, fields) {

            
            if (err) return res.send(err);
            console.log(results);
            

            res.redirect('/subforum/' + category);
        });

       


    }

});
//DELETE
subforumRouter.get('/delete/:name/:id', authMiddleware.hasAuth, (req, res) => {

    var db = require('../../lib/database')();
    db.query(`SELECT * FROM post WHERE intPostID=${req.params.id}`, (err, results, fields) => {
        if (err) throw err;
        const queryString = `UPDATE post SET
        isdeleted = 1
        WHERE intPostID=?`;
        db.query(queryString,[req.params.id] , (err, results, fields) => {
            res.redirect('/subforum/' + req.params.name);
        });
    });
});

subforumRouter.get('/:id/edit/:num', authMiddleware.hasAuth, (req, res) => {

    console.log(req.session);

    if (typeof process.env.ENABLE_DATABASE !== 'undefined' && process.env.ENABLE_DATABASE === 'false') {

        return render([]);
    }


    var db = require('../../lib/database')();

    db.query('SELECT * FROM (sub JOIN category ON sub.intSubCategoryID = category.intCategoryID) JOIN post ON sub.intSubID = post.intPostSubID where isdeleted = 0 AND subname = ?',[req.params.id] , function (err, results, fields) {
        
        if (err) return res.send(err);
        console.log('kalito!');
        console.log(results);
        
        var date = [];
        for(var i=0; i<results.length; i++)
        {       
               
                var today = results[i].postdate;
                var dd = today.getDate();
                var mm = today.getMonth()+1; //January is 0!
                var yyyy = today.getFullYear();

                if(dd<10) {
                    dd = '0'+dd
                } 

                if(mm<10) {
                    mm = '0'+mm
                } 

                date.push(yyyy + '-' + mm + '-' + dd);
        }
        var puta = req.session.user;

        render(results, puta, date);
    });

    function render(users,puta, date) {
        var db = require('../../lib/database')();

        db.query(`SELECT * FROM user`, function (err, results, fields){
            if (err) res.send(err);
            category = req.params.id;
            res.render('home/views/editpost', { results: results, puta: puta, users: users, date: date, categName: req.params.id, fucker: req.params.num});
        });
    }
});

subforumRouter.get('/delete/:name/:id', authMiddleware.hasAuth, (req, res) => {

    var db = require('../../lib/database')();
    db.query(`SELECT * FROM post WHERE intPostID=${req.params.id}`, (err, results, fields) => {
        if (err) throw err;
        const queryString = `UPDATE post SET
        isdeleted = 1
        WHERE intPostID=?`;
        db.query(queryString,[req.params.id] , (err, results, fields) => {
            if (err) throw err;
            res.redirect('/subforum/' + req.params.name);
        });
    });
});

subforumRouter.post('/update/:name/:id/:num', authMiddleware.hasAuth, (req, res) => {

    var db = require('../../lib/database')();

    queryString = `UPDATE post SET title = ?, content = ? WHERE intPostID = ?`
    db.query(queryString, [req.body.title, req.body.content, req.params.id], (err, results, fields) => {
        if (err) throw err;
        res.redirect('/subforum/' + req.params.name);
    }); 
});
/**
 * Here we just export said router on the 'index' property of this module.
 */
exports.index = router;
exports.forum = forumRouter;
exports.subforum = subforumRouter;
