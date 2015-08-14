/**
 * Created by Anna on 8/7/2015.
 */

module.exports = function () {

    var Promise = require('bluebird');
    var fs = require('fs');
    var dir = require('node-dir');

    var _dirname = './output/';

    var elasticsearch = require('elasticsearch');

    var client = new elasticsearch.Client({
        host: '0.0.0.0:9200',
        log: 'trace'
    });

    function indexDirectory(){


        var idxBulk = [];
        // match only filenames with a .txt extension and that don't start with a `.�
        dir.readFiles(_dirname, {
                match: /.txt$/,
                exclude: /^\./
            }, function(err, content, next) {
                if (err) throw err;

                var idxBulk = [];

                var rows = content.split(/\n/g);
                rows.forEach(function(elem) {

                    try {
                        var elemObj = JSON.parse(elem);

                        var url =  elemObj.url;
                        if (url.indexOf("?")>-1){
                            url = url.substr(0,url.indexOf("?"));
                            elemObj.url = url;
                        }

                        var recpid = url.hashCode();
                        var idxCommand =  { index:  { _index: 'recpidx', _type: 'recptype', _id : recpid } };

                        idxBulk.push(idxCommand);
                        idxBulk.push(elemObj);
                    }catch (err){
                        console.log("could not parse", elem);
                    }

                });

                index(idxBulk);

                //console.log('content:', content);
                next();
            },
            function(err, files){
                if (err) throw err;
                console.log('finished reading files:',files);
            });
    }

    function index(bulkBody) {

        client.bulk({

            body: bulkBody
        }, function (error, response) {
            if (error) {
                console.trace('error in index', error);
            } else {
                console.log('All is well');
            }
        });

    }



    function ping(){
        client.ping({
            // ping usually has a 3000ms timeout
            requestTimeout: Infinity,

            // undocumented params are appended to the query string
            hello: "elasticsearch!"
        }, function (error) {
            if (error) {
                console.trace('elasticsearch cluster is down!');
            } else {
                console.log('All is well');
            }
        });
    }

    function query(text){
        return client.search({
            index: 'recpidx',
            body: {
                query: {
                    "multi_match": {
                        "query":    text,
                        "fields":   [ "name", "mainCategory", "subCategory" , "subCategoryCollection", "ingredients"]
                    }
                }
            }
        }).then(function (body) {
            return body;
        });
    }

    return {
        index: indexDirectory,
        query: query
    };
};