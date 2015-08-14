/**
 * Created by Anna on 7/25/2015.
 */
module.exports = function () {

    var request = require('request');
    var cheerio = require('cheerio');
    var Promise = require('bluebird');
    var fs = require('fs');

    var Crawler = require("simplecrawler");

    var recipies = [];
    var chunk = 99;
    var _dirname = './output/';
    var crawler;

    function crawle(){
        crawler = Crawler.crawl("http://allrecipes.com/");

        //crawler.interval = 500;
        var conditionID = crawler.addFetchCondition(function(parsedURL) {
            return parsedURL.path.match(/\/recipe\/.*detail.aspx/i);
        });

        defrost();


        crawler.on("fetchcomplete",function(queueItem, responseBuffer , response){
            var html = responseBuffer.toString();
            var $ = cheerio.load(html);

            if (!hasTemplateRecipe($)){
                console.log("Completed fetching resource:", queueItem.url);
                return;
            }

            var recipe = getTemplateRecipe($,queueItem);
            recipies.push(recipe);

            saveRecipies();

            console.log("Completed fetching resource recipe:", queueItem.url, recipies.length);

        });

        crawler.on("complete",onSaveRecipies);

        crawler.start();
    }

    function hasTemplateRecipe($){
        var name = $("#itemTitle").text();
        return name !== "";
    }
    function getTemplateRecipe($,queueItem ){

        var name = $("#itemTitle").text();
        var url = queueItem.url;

        var numReviews = $("#btnScrollToReview > span").text();
        numReviews = parseInt(numReviews) || 0;
        var rating = $("#zoneRecipe > div.detail-section.greydotted.ingredients > div.detail-right.fl-right > div:nth-child(4) > div > div.rating-stars-img > meta").attr("content");
        rating = parseFloat(rating) || 0;
        var mainCategory = $("#breadcrumbs > div:nth-child(3) > a > span").text();
        var subCategory =$("#breadcrumbs > div:nth-child(4) > a > span").text();
        var subCategoryCollection =$("#breadcrumbs > div:nth-child(5) > a > span").text();

        var prepMins = $("#prepMinsSpan > em").text();
        prepMins = parseInt(prepMins) || 0;
        var prepHours = $("#prepHoursSpan > em").text();
        prepHours = parseInt(prepHours) || 0;
        prepMins+= prepHours*60;

        var cookMins = $("#cookMinsSpan > em").text();
        cookMins = parseInt(cookMins) || 0;
        var cookHours = $("#cookHoursSpan > em").text();
        cookHours = parseInt(cookHours) || 0;
        cookMins+= cookHours*60;

        var totalHours = $("#totalHoursSpan > em").text();
        var totalMins = $("#totalMinsSpan > em").text();
        totalMins = parseInt(totalMins) || 0;
        totalHours = parseInt(totalHours) || 0;
        totalMins+= totalHours*60;

        var ingredients = [];
        $("#lblIngName").each(function(i, elem) {
            ingredients[i] = $(this).text();
        });

        var recipe = {
            name : name,
            numReviews :numReviews,
            rating : rating,
            mainCategory : mainCategory,
            subCategory : subCategory,
            subCategoryCollection: subCategoryCollection,
            url : url,
            prepMins : prepMins,
            cookMins : cookMins,
            totalMins : totalMins,
            ingredients : ingredients
        };

        return recipe;
    }

    function saveRecipies(){
        if (recipies.length < 500){
           return;
        }

        onSaveRecipies();

        recipies = [];

        // Freeze queue
        crawler.queue.freeze(_dirname + "mysavedqueue_recipies.json", function() {
            //process.exit();
        });
    }

    function defrost(){
        // Defrost queue
        crawler.queue.defrost(_dirname + "mysavedqueue_recipies.json");
    }

    function onSaveRecipies(){
        /*if (!fs.exists(_dirname)) {
            fs.mkdir(_dirname);
        }*/
        var filename = _dirname + "recipies" + (chunk++) +".txt";

        var file = fs.createWriteStream(filename);
        file.on('error', function(err) { console.log ("error", err);});
        recipies.forEach(function(r) { file.write(JSON.stringify(r) + '\n'); });
        file.end();

    }

    return {
        crawle: crawle
    };
};