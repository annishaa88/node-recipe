/**
 * Created by Anna on 6/6/2015.
 */

module.exports = function () {

    var Promise = require('bluebird');

    var AWS = require('aws-sdk');
    AWS.config.loadFromPath('./config/conf_aws.json');
    var dynamodb = new AWS.DynamoDB();
    Promise.promisifyAll(dynamodb);


    var dir = require('node-dir');
    var _dirname = './output/';
    var _recpTabl = 'recipe';


    function insertRecpToDB(unprocessedItemsBulk) {

        var recpBulk = [];
        var recpBulkIds = {};
        return new Promise(function (fulfill, reject) {

            if (typeof unprocessedItemsBulk !== "undefined"){

                var recpBulkChunks = unprocessedItemsBulk.chunk(25);
                console.log('number of unprocessed recp:', recpBulk.length);
                console.log('number of unprocessed recp chunks:', recpBulkChunks.length);

                fulfill(recpBulkChunks);
                return;
            }

            // match only filenames with a .txt extension and that don't start with a
            dir.readFiles(_dirname, {
                    match: /.txt$/,
                    exclude: /^\./
                }, function (err, content, next) {
                    if (err) throw err;

                    var rows = content.split(/\n/g);
                    rows.forEach(function (elem) {

                        try {
                            var elemObj = JSON.parse(elem);

                            var url = elemObj.url;
                            if (url.indexOf("?") > -1) {
                                url = url.substr(0, url.indexOf("?"));
                                elemObj.url = url;
                            }

                            var recipeId = url.hashCode();

                            //check cache, do we have this url?
                            if (typeof recpBulkIds[recipeId] !== "undefined"){
                                return;
                            }
                            recpBulkIds[recipeId] = url;

                            var putReqRecp = {
                                "PutRequest": {
                                    "Item": {
                                        "recipeId": {
                                            "S": ''+recipeId
                                        },
                                        "url": {
                                            "S": elemObj.url
                                        },
                                        "name": {
                                            "S": elemObj.name
                                        }
                                    }
                                }
                            };

                            recpBulk.push(putReqRecp);

                        } catch (err) {
                            console.log("could not parse", err);
                        }

                    });

                    //console.log('content:', content);
                    next();
                },
                function (err, files) {
                    if (err) throw err;

                    var recpBulkChunks = recpBulk.chunk(25);
                    console.log('finished reading files:', files);
                    console.log('number of recp:', recpBulk.length);
                    console.log('number of recp chunks:', recpBulkChunks.length);

                    fulfill(recpBulkChunks);
                });
        }).then(function (recpBulk) {

                var tasks = recpBulk.map(function (recpBatch) {
                    return doBatchWriteItem(recpBatch, _recpTabl);
                });

                return Promise.reduce(tasks, function (arrayData, task) {
                    arrayData.push(task);
                    return arrayData;
                }, []);

            }).then(function (data) {
                //console.log(data);

                var unprocessedItemsBulk = [];
                data.forEach(function(item){

                    if ( typeof item.UnprocessedItems.recipe !== "undefined"){
                        unprocessedItemsBulk = unprocessedItemsBulk.concat(item.UnprocessedItems.recipe);
                    }
                });

                //console.log(unprocessedItems);
                console.log("unprocessedItems: " + unprocessedItemsBulk.length);
                if (unprocessedItemsBulk.length == 0){
                    return data;
                }

               return insertRecpToDB(unprocessedItemsBulk)

            }).catch(function (err) {
                console.error(err);
                return err;
            });
    }

    function doBatchWriteItem(batch, batchTableName) {
        var params = {RequestItems: {}};
        params.RequestItems[batchTableName] = batch;

        return dynamodb.batchWriteItemAsync(params);
    }

    function queryDB(recipeId) {
        var params = {
            TableName: _recpTabl,
            KeyConditions: {
                "recipeId": {
                    "AttributeValueList": [
                        {
                            "S": recipeId
                        }
                    ],
                    "ComparisonOperator": "EQ"
                }
            }
        };

        return dynamodb.queryAsync(params).then(function (data) {
            if (data.length === 0)
                return data;
            return data.Items;
        });

    }

    return {
        query: queryDB,
        insertRecpToDB: insertRecpToDB
    };
}
;
