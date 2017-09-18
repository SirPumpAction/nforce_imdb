// ==UserScript==
// @name         NFOrce IMDB
// @namespace    http://www.nfohump.com/
// @version      1.2.1
// @description  Show inline IMDB.com ratings and movie details
// @author       https://github.com/SirPumpAction
// @match        http://*.nfohump.com/forum/*
// @match        https://*.nfohump.com/forum/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @downloadURL  https://github.com/SirPumpAction/nforce_imdb/raw/master/nforce_imdb.user.js
// @updateURL    https://github.com/SirPumpAction/nforce_imdb/raw/master/nforce_imdb.user.js
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// ==/UserScript==

GM_addStyle("\
.nforating {font-weight: bold; margin-left: 10px; color: #ffa;}\
.nforating > span.details {position: absolute; font-weight: normal; display: inline-block; margin-left: 30px; opacity: 0; pointer-events: all; transition: all 300ms; visibility: hidden;}\
.nforating > span.details > dl {margin:0; background:#ffc; color: #000; padding: 10px; font-family: helvetica, arial; max-width: 300px; box-shadow: 0px 2px 5px 0px #000;}\
.nforating > span.details > dl > dd {margin-bottom: 5px;}\
.nforating > span.details > dl > dt {font-weight: bold;}\
.nforating > span.details > dl > dt a{color: #000;}\
.nforating > span.det {text-shadow:0px 1px 2px #000;    padding: 0px 5px;}\
.nforating:hover > span.details {opacity: 1; visibility: visible;}\
");

function setColor(p){
    p=p<0?0:p>100?100:p;
    var red = p<50 ? 255 : Math.round(256 - (p-50)*5.12);
    var green = p>50 ? 255 : Math.round((p)*5.12);
    return "rgb(" + red + "," + green + ",0)";
}

$('a.nav[href*="imdb.com/title/"]').each(function(){
    var $link = $(this);
    var href = $link.attr('href');
    var ttid = href.match(/imdb\.com\/title\/(\w*)/i);
    if (ttid){
        var fetch = false;
        var storageid = "nforce." + ttid[1];
        if (!localStorage[storageid])
            fetch = true;
        else
            if (Date.now() - (JSON.parse(localStorage[storageid])).date > 14400000) //updates every 4 hours
                fetch = true;
        if (fetch) {
            $link.after("<span class='nforating'>loading...</span>");

            GM_xmlhttpRequest({
                method: "GET",
                url: "http://www.imdb.com/title/" + ttid[1],
                onload: function(response) {
                    var $response = $(response.responseText);
                    var data = {};
                    $response.find('[itemprop]').each(function(i, item){
                        var attr = item.getAttribute('itemprop');
                        if (!data[attr])
                            data[attr] = [];
                        switch (attr){
                            case "image":
                                data[attr].push(item.src);
                                break;
                            case "ratingValue":
                                var r = item.innerText.trim();
                                if (r.indexOf(",")>=0)
                                    r = r.replace(",", ".");
                                data[attr].push(r);
                                break;
                            default:
                                data[attr].push(item.innerText.trim());
                        };

                    });
                    data.date = Date.now();
                    localStorage["nforce."+ttid[1]] = JSON.stringify(data);
                    renderData(data, $link);
                }
            });
        } else {
            renderData(JSON.parse(localStorage["nforce."+ttid[1]]), $link);
        }
    }
});

function forceRefresh(){
    localStorage.clear();
    document.location.reload();
}

function renderData(data, $link){
    $link.next('span.nforating').remove();

    var $kvp = $('<dl>');
    try {
        $kvp.prepend("<dt><center><a href='"+data.image[0]+"' target='_BLANK' rel = 'noreferrer'>Poster link (opens in new tab)</a></center></dt>");
        $kvp.append("<dt>Title</dt><dd>" + data.name[0] + "</dd>");
        $kvp.append("<dt>Director</dt><dd>" + data.director[0] + "</dd>");
        $kvp.append("<dt>Duration</dt><dd>" + data.duration[0] + "</dd>");
        $kvp.append("<dt>Actors</dt><dd>" + data.actor.join(", ") + "</dd>");
        $kvp.append("<dt>Rating</dt><dd><b>" + data.ratingValue[0] + "</b></dd>");
        $kvp.append("<dt>Ratings received</dt><dd>" + data.ratingCount[0] + "</dd>");
        $kvp.append("<dt>Tagged</dt><dd>" + data.keywords.slice(1,data.keywords.length-1).join(", ") + "</dd>");
    }catch(e){
        console.log(e);
    }
    var $forceRefresh = $("<button>Force refresh</button>");
    $forceRefresh.on('click', function() {
        forceRefresh();
    });
    var $dd = $("<dd>" + (new Date(data.date)).toLocaleString() + " </dd>");
    $dd.append($forceRefresh);
    $kvp.append( "<dt>Last updated on</dt>" );
    $kvp.append( $dd);

    $kvp.prepend( "<dt><center>NFOrce IMDB by <a href='https://github.com/SirPumpAction/nforce_imdb'>SirPumpAction</a></center></dt><dd></dd>" );

    var $span = $('<span class="details">');

    var $rating = $('<span>');
    $rating.addClass('nforating');

    var genre = "";
    try {
        genre = data.genre.slice(0, data.genre.length-1).join(", ");
    } catch(e){
        console.log(e);
    }
    $rating.html('[<span class="det" style="color:' + setColor(parseFloat(data.ratingValue[0])*12-20)+ ';">' + data.ratingValue[0] + '</span>, ' + genre + ']');

    $span.append($kvp);

    $rating.prepend($span);

    $link.after($rating);
}
