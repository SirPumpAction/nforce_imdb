// ==UserScript==
// @name         NFOrce IMDB
// @namespace    http://www.nfohump.com/
// @version      1.1.1
// @description  Show inline IMDB.com ratings and movie details
// @author       https://github.com/SirPumpAction
// @match        http://*.nfohump.com/forum/*
// @match        https://*.nfohump.com/forum/*
// @grant        GM_addStyle
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
            $.getJSON("http://www.omdbapi.com/?i=" + ttid[1] + "&plot=short&r=json&random="+Math.round(Math.random()*100000), function( data ) {
                data.date = Date.now();
                localStorage["nforce."+ttid[1]] = JSON.stringify(data);
                renderData(data, $link);
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
    $.each( data, function( key, val ) {
        switch (key.toLowerCase()) {
            case "poster":
                $kvp.prepend("<hr><dt><center><a target='_BLANK' href='https://www.google.com/search?q=altyazı+izle+" + encodeURIComponent(data.Title) + "+" + data.Year + "&btnI'>► Watch online(beta)</a> - Click on \"Reklamı geç\"</center></dt>");
                if (val!='N/A')
                    $kvp.prepend( "<dt><center><a href='"+val+"' target='_BLANK' rel = 'noreferrer'>Poster link (opens in new tab)</a></center></dt>" );
                break;
            case "date":
                var $forceRefresh = $("<button>Force refresh</button>");
                $forceRefresh.on('click', function() {forceRefresh()});
                var $dd = $("<dd>" + (new Date(val)).toLocaleString() + " </dd>");
                $dd.append($forceRefresh);
                
                $kvp.append( "<dt>Last updated on</dt>" );
                $kvp.append( $dd);
                break;
            default:
                $kvp.append( "<dt>" + key + "</dt><dd>" + val + "</dd>" );
                break;
        }
    });
    $kvp.prepend( "<dt><center>NFOrce IMDB by <a href='https://github.com/SirPumpAction/nforce_imdb'>SirPumpAction</a></center></dt><dd></dd>" );

    var $span = $('<span class="details">');

    var $rating = $('<span>');
    $rating.addClass('nforating');

    $rating.html('[<span class="det" style="color:' + setColor(parseFloat(data.imdbRating)*12-20)+ ';">' + data.imdbRating + '</span>, ' + data.Genre + ']');

    $span.append($kvp);

    $rating.prepend($span);

    $link.after($rating);
}
