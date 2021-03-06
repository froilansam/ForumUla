module.exports = (req, res) => {
    console.log(req.session);
    /**
     * This is a TEMPORARY checker if you want to enable the database part of
     * the app or not. In the .env file, there should be an ENABLE_DATABASE field
     * there that should either be 'true' or 'false'.
     */
    if (typeof process.env.ENABLE_DATABASE !== 'undefined' && process.env.ENABLE_DATABASE === 'false') {
        /**
         * If the database part is disabled, then pass a blank array to the
         * render function.
         */
        return render([]);
    }

    /**
     * Import the database module that is located in the lib directory, under app.
     */
    var db = require('../../../lib/database')();

    /**
     * If the database part is enabled, then use the database module to query
     * from the database specified in your .env file.
     */
    db.query('SELECT * FROM sub JOIN category ON sub.intSubCategoryID = category.intCategoryID where categoryname = ?',[req.params.id] , function (err, results, fields) {
        /**
         * Temporarily, if there are errors, send the error as is.
         */
        if (err) return res.send(err);
        console.log('puta')
        console.log(typeof results[0]);
        var puta = req.session.user;
        if (typeof results[0] === 'undefined'){
            render(results, puta);
        }
        else{
            if (puta.isMod == 0 && results[0].isMod == 1) return res.redirect ('/index');
        }
        /**
         * If there are no errors, pass the results (which is an array) to the
         * render function.
         */
        render(results, puta);
    });

    function render(users,puta) {
        console.log('yehey');
        console.log(puta);
        console.log('yehey');
        
        res.render('home/views/forum', { puta: puta, users: users , categName: req.params.id});
    }
}