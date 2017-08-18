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
    db.query(`SELECT * FROM category`, function (err, results, fields) {
        /**
         * Temporarily, if there are errors, send the error as is.
         */
        
        if (err) return res.send(err);
        console.log(results);
        var puta = req.session.user;
        
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

        today = mm + '-' + dd;

        var today2 = new Date(puta.bday);
        var dd2 = today2.getDate();
        var mm2 = today2.getMonth()+1; //January is 0!
        var yyyy2 = today2.getFullYear();

        if(dd2<10) {
            dd2 = '0'+dd2
        } 

        if(mm2<10) {
            mm2 = '0'+mm2
        } 

        today2 = mm2 + '-' + dd2;

        console.log(today2+'whathe')
        
        res.render('home/views/index', {today2: today2, today: today, puta: puta, users: users });
    }
}