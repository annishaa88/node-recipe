var express = require('express');
var router = express.Router();

var recpCrawler = require('./recpcrawler_imp')();

/* GET users listing. */
router.get('/', function(req, res, next) {
    recpCrawler.crawle();
    res.send({ok:true, data: {}})
});

module.exports = router;