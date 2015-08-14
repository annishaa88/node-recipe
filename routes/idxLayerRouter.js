/**
 * Created by Anna on 8/7/2015.
 */
var express = require('express');
var router = express.Router();

var idxLayer = require('./idxLayer')();

router.get('/query', function(req, res, next) {
    if (!req.query.searchValue) {
        res.send({ok: false, error: "query param searchValue not set"});
        return;
    }


    idxLayer.query( req.query.searchValue).then(function (data) {
        res.send({ok:true, data: data});
    }).catch(function (err) {
        res.send({ok:false, data: err});
    });
});

module.exports = router;
