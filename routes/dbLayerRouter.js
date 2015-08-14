/**
 * Created by Anna on 6/2/2015.
 */

var express = require('express');
var router = express.Router();
var dbLayer = require('./dbLayer')();


/* GET home page. */
router.get('/query', function(req, res, next) {
    if (!req.query.recipeId) {
        res.send({ok: false, error: "query recipeId word not set"});
        return;
    }


    dbLayer.query( req.query.recipeId).then(function (data) {
        res.send({ok:true, data: data});
    }).catch(function (err) {
        res.send({ok:false, data: err});
    });
});


module.exports = router;