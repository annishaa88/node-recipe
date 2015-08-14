/**
 * Created by Anna on 8/8/2015.
 */
function init(){
    handleSearch();
}

function handleSearch(){
    $("#searchForm").submit(function (event) {

        $("#response").empty();
        $("#response_err").empty();

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
    $("#response").append("<ul>");
    searchResults.forEach(function (resp1) {

        var name = resp1._source.name;
        var url = resp1._source.url;
        $("#response").append('<li><a href="#" src="'+url+'">'+name+'</a></li>');
    });
    $("#response").append("</ul>");
    addSearchResultsEvents();
}

function addSearchResultsEvents(){
    $("nav a").click(function(event){
        var url = $(this).attr("src");

        $("#recp-site").attr("src", url);
        return false;
    });
}