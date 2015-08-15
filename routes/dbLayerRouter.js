/**
 * Created by Anna on 6/2/2015.
 */

var express = require('express');
var router = express.Router();
var dbLayer = require('./dbLayer')();


router.get('/findRecipe', function(req, res, next) {
    if (!req.query.recipeId) {
        res.send({ok: false, error: "query recipeId word not set"});
        return;
    }


    dbLayer.findRecipe( req.query.recipeId).then(function (data) {
        res.send({ok:true, data: data});
    }).catch(function (err) {
        res.send({ok:false, data: err});
    });
});

router.get('/findRecipeRecommendation', function(req, res, next) {
    if (!req.query.recipeId) {
        res.send({ok: false, error: "query recipeId word not set"});
        return;
    }


    dbLayer.findRecipeRecommendation( req.query.recipeId).then(function (data) {
        res.send({ok:true, data: data});
    }).catch(function (err) {
        res.send({ok:false, data: err});
    });
});




module.exports = router;