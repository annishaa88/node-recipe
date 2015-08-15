/**
 * Created by Anna on 8/8/2015.
 */
function init(){
    $(".nav-side").hide();
    handleSearch();
}

function handleSearch(){
    $("#searchForm").submit(function (event) {

        //init search
        $(".nav-details").empty();
        $(".nav-rec").hide();
        $(".nav-search").show();

        var searchValue = $("#searchInput").val();

        $.ajax({
            url: "/recpIdx/query",
            data: {
                searchValue: searchValue
            }
        }).done(function (resp) {
            console.log(resp);

            if (resp && resp.ok) {
                handleSearchResults(resp.data.hits.hits);
            } else {
                $("#response_err").html(resp.error);
            }

        });

        return false;

    });
}

function handleSearchResults(searchResults){
    $("#response-search").append("<ul>");
    searchResults.forEach(function (resp1) {

        var recipeId = resp1._id;
        var url = resp1._source.url;
        var name = resp1._source.name;

        var recpNode = $('<li><a href="#">'+name+'</a></li>');
        recpNode.data({src: url, recipeId : recipeId });
        $("#response-search").append(recpNode);

    });
    $("#response-search").append("</ul>");
    addSearchResultsEvents();
}

function addSearchResultsEvents(){
    $("nav li").click(function(event){
        var url = $(this).data("src");
        var recipeId = $(this).data("recipeId");

        $("#recp-site").attr("src", url);

        addRecommendations(recipeId)
        return false;
    });
}

function addRecommendations(recipeId) {

    $.ajax({
        url: "/recpdb/findRecipeRecommendation",
        data: {
            recipeId: recipeId
        }
    }).done(function (resp) {
        console.log(resp);

        if (resp && resp.ok) {
            handleReccomendationResults(resp.data);
        } else {
            $("#response_err").html(resp.error);
        }

    });
}

function handleReccomendationResults(searchResults) {

    //init widgets
    $(".nav-details").empty();
    $(".nav-rec").show();
    $(".nav-search").hide();

    $("#response-rec").append("<ul>");
    searchResults.forEach(function (resp1) {

        var name = resp1.name.S;
        var url = resp1.url.S;
        var recipeId = resp1.recipeId.S;

        var recpNode = $('<li><a href="#">'+name+'</a></li>');
        recpNode.data({src: url, recipeId : recipeId });
        $("#response-rec").append(recpNode);
    });
    $("#response-rec").append("</ul>");

    addSearchResultsEvents();
}