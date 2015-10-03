// ==UserScript==
// @name         NFOrce IMDB
// @namespace    http://www.nfohump.com/
// @version      0.6
// @description  Show inline IMDB.com ratings and movie details
// @author       https://github.com/SirPumpAction
// @match        http://www.nfohump.com/forum/*
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle("\
.nforating {font-weight: bold; margin-left: 10px; color: #ffa;}\
.nforating > span.details {position: absolute; font-weight: normal; display: inline-block; margin-left: 30px; opacity: 0; pointer-events: all; transition: all 300ms; visibility: hidden;}\
.nforating > span.details > dl {margin:0; background:#ffc; color: #000; padding: 10px; font-family: helvetica, arial; max-width: 300px; box-shadow: 0px 2px 5px 0px #000;}
.nforating > span.details > dl > dd {margin-bottom: 5px;}\
.nforating > span.details > dl > dt {font-weight: bold;}\
.nforating > span.details > dl > dt a{color: #000;}\
.nforating > span.det {text-shadow:0px 1px 2px #000;    padding: 0px 5px;}\
.nforating:hover > span.details {opacity: 1; visibility: visible;}\
");
