// ==UserScript==
// @name         NFOrce IMDB
// @namespace    http://www.nfohump.com/
// @version      1.0.0
// @description  Show inline IMDB.com ratings and movie details
// @author       https://github.com/SirPumpAction
// @match        http://*.nfohump.com/forum/*
// @match        https://*.nfohump.com/forum/*
// @grant        GM_addStyle
// @downloadURL  https://github.com/SirPumpAction/nforce_imdb/raw/master/nforce_imdb.user.js
// @updateURL    https://github.com/SirPumpAction/nforce_imdb/raw/master/nforce_imdb.user.js
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

var $jq = $;
function setColor(p){
    p=p<0?0:p>100?100:p;
    var red = p<50 ? 255 : Math.round(256 - (p-50)*5.12);
    var green = p>50 ? 255 : Math.round((p)*5.12);
    return "rgb(" + red + "," + green + ",0)";
}

$jq('a.nav[href*="imdb.com/title"]').each(function(){
    var $link = $jq(this);
    
    var href = $link.attr('href');
    
    var ttid = href.match(/imdb\.com\/title\/(\w*)/i);
    
    if (ttid){
        var fetch = false;
        var storageid = "nfohump."+ttid[1];
        
        if (!localStorage[storageid])
            fetch = true;
        else
            if (Date.now() - (JSON.parse(localStorage[storageid])).date > 172800000)
                fetch = true;
                
        if (fetch) {
            $link.after("<span class='nforating'>loading...</span>");
            $jq.getJSON("http://www.omdbapi.com/?i=" + ttid[1] + "&plot=short&r=json", function( data ) {
                data.date = Date.now();
                localStorage["nfohump."+ttid[1]] = JSON.stringify(data);
                renderData(data, $link);
            });
        } else {
            renderData(JSON.parse(localStorage["nfohump."+ttid[1]]), $link);
        }
    }
});

function renderData(data, $link){
    $link.next('span.nforating').remove();
    
    var $kvp = $jq('<dl>');
    $jq.each( data, function( key, val ) {
        switch (key) {
            case "Poster":
                if (val!='N/A')
                    $kvp.prepend( "<dt><center><a href='"+val+"' target='_BLANK' rel = 'noreferrer'>Poster link (opens in new tab)</a></center></dt>" );
                break;
            case "date":
                $kvp.append( "<dt>Last updated on</dt><dd>" + (new Date(val)).toUTCString() + "</dd>" );
                break;
            default:
                $kvp.append( "<dt>" + key + "</dt><dd>" + val + "</dd>" );
                break;
        }
    });
    $kvp.prepend( "<dt><center>IMDB extra info by Pumpy</center></dt><dd></dd>" );

    var $span = $jq('<span class="details">');

    var $rating = $jq('<span>');
    $rating.addClass('nforating');

    $rating.html('[<span class="det" style="color:' + setColor(parseFloat(data.imdbRating)*12-20)+ ';">' + data.imdbRating + '</span>, ' + data.Genre + ']');

    $span.append($kvp);

    $rating.prepend($span);

    $link.after($rating);
}
