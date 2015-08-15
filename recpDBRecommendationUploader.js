/**
 * Created by eladcohen on 8/6/15.
 *
 * upload mahout recommendations results to dynamodb
 */

var Promise = require('bluebird');
var dir = require('node-dir');
var dbLayer = require('./routes/dbLayer')();

Array.prototype.chunk = function (chunkSize) {
    var R = [];
    for (var i = 0; i < this.length; i += chunkSize)
        R.push(this.slice(i, i + chunkSize));
    return R;
};


var _dirname = './recipe_recommendations/';
var _recpTabl = 'recipe_recommendation'; //recipeId (String), recommendationSet (StringSet)

/**
 * Uploads recommendations data to data store
 * @param unprocessedItemsBulk
 * @returns {*}
 */
function uploadRecommendations(unprocessedItemsBulk){

    var bulk = [];
    return new Promise(function (fulfill, reject) {

        //if received data to upload upload it
        if (typeof unprocessedItemsBulk !== "undefined"){

            var recpBulkChunks = unprocessedItemsBulk.chunk(25);
            console.log('number of unprocessed recipes:', bulk.length);
            console.log('number of unprocessed recipes chunks:', recpBulkChunks.length);

            fulfill(recpBulkChunks);
            return;
        }

        //else read data from files
        dir.readFiles(_dirname, {
            match: /^part/
        }, function(err, content, next){
            if(err) throw err;

            var rows = content.split(/\n/g);
            rows.forEach(function(element){
                try{
                    //split by line structure
                    var elements = element.split(/\t/);

                    if(elements.length < 2){
                        throw "invalid line, must have recipe id and recommendations";
                    }

                    //get recipe and recommendation
                    var recipeId = elements[0];
                    var recommendationsData = elements[1].substring(1, elements[1].length - 1);
                    recommendationsData = recommendationsData.split(",");

                    var recommendations = [];
                    var recommended;
                    for(var i = 0; i < recommendationsData.length; i++){
                        recommended = recommendationsData[i].split(":");
                        recommendations.push(recommended[0]);
                    }


                    //take only first five recipes
                    if(recommendations.length > 5){
                        recommendations = recommendations.slice(0, 5);
                    }

                    //create
                    var putReqRecp = {
                        "PutRequest": {
                            "Item": {
                                "recipeId": {
                                    "S": ''+recipeId
                                },
                                "recommendationSet": {
                                    "SS": recommendations
                                }
                            }
                        }
                    };

                    bulk.push(putReqRecp);

                }catch(e){
                    console.log("cannot parse " + element, e);
                }

            });

            next();
        }, function (err, files) {
                if (err) throw err;

                //split into bulks
                var recpBulkChunks = bulk.chunk(25);
                console.log('number of recipes to recommend:', bulk.length);

                fulfill(recpBulkChunks);
            });
        }).then(function (recpBulk) {


            var tasks = recpBulk.map(function (recpBatch) {
                return dbLayer.doBatchWriteItem(recpBatch, _recpTabl);
            });

            return Promise.reduce(tasks, function (arrayData, task) {
                arrayData.push(task);
                return arrayData;
            }, []);

        }).then(function (data) {

            var unprocessedItemsBulk = [];
            data.forEach(function(item){

                if ( typeof item.UnprocessedItems[_recpTabl] !== "undefined"){
                    unprocessedItemsBulk = unprocessedItemsBulk.concat(item.UnprocessedItems[_recpTabl]);
                }
            });

            console.log("unprocessedItems: " + unprocessedItemsBulk.length);
            if (unprocessedItemsBulk.length == 0){
                return data;
            }

            return uploadRecommendations(unprocessedItemsBulk)

        }).catch(function (err) {
            console.error(err);
            return err;
        });
}

uploadRecommendations();

module.exports = function () {

    return {
        uploadRecommendations : uploadRecommendations
    };
}
;
