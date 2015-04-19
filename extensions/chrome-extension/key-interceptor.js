var debug = false;

/******************************************************************************
 * HotKey Detector
 *****************************************************************************/

var map = [];
onkeydown = onkeyup = function(e){
	e = e || event;
	map[e.keyCode] = e.type == 'keydown';
	
	if(e.altKey && map[16] && map[65]){ //AltShiftA
        gatherAndProcess();
		sendMessageToBackground({hotkey: 301 + " " + 16 + " " + 65});
		map.length = 0;
	}
	else if(e.altKey && map[16] && map[72]){ //AltShiftH
        gatherAndProcess();
		sendMessageToBackground({hotkey: 301 + " " + 16 + " " + 72});
		map.length = 0;
	}
	else if(e.altKey && map[16] && map[67]){ //AltShiftC
        gatherAndProcess();
		sendMessageToBackground({hotkey: 301 + " " + 16 + " " + 67});
		map.length = 0;
	}
}


/******************************************************************************
 * Scraper
 *****************************************************************************/


// The array of links to be processed
var links = [];

// An array of buzz words to be matched against
var buzzWords = [
    "aboutus",
    "contactus",
    "support", "help",
];

function gatherAndProcess() {
    gatherAnchorTags();
    processLinks();
}

/**
 * Gathers all of the anchor tags from a web page and stores
 * their text and href info in an object placed into the links array
 */
function gatherAnchorTags(){
    if(debug) console.log("here");
    $("a").each(function(){
        links.push({
            text: this.text,
            url: this.href
        });
    });
    if(debug) console.log("links: " + links[0].url);
}

function processLinks(){
    if(debug) console.log("plinks: " + links);
    for (var i = 0; i < links.length; i++) {
        for (var j = 0; j < buzzWords.length; j++) {
            if(debug) console.log("linkdata: " + links[i]);
            var word = buzzWords[j];
            if(debug) console.log("linkurl: " + links[i].url);
            if(doesURLContainMatch(removePunctuationFromURL(links[i].url), word)){
                var action = "";
                
                if(word == "aboutus" || word == "about"){
                    action = "aboutus";
                }else if(word == "contact" || word == "contactus"){
                    action = "contactus";
                }else if(word == "support"){
                    action = "support";
                }
                    
                sendMessageToBackground({url: links[i].url, action: action});
 
                break;
            }
        }
    }
}

/**
 * Given a string url and a buzz word see if any matches are found
 */
function doesURLContainMatch(url, word){
    return url.indexOf(word) != -1;
}

/**
 * Removes the punctuation from the passed parameter
 * Does not account for extraneous whitespace craeted by 
 * the replace but this shouldn't be a problem
 * for URLs
 */
function removePunctuationFromURL(url){
    if(debug) console.log("removePunc: " + url)
    return url.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, "");
}

/******************************************************************************
 * Utility Functions
 *****************************************************************************/

function sendMessageToBackground(message) {
	if(debug) console.log("Sending Message.");
	chrome.runtime.sendMessage(message);
}

// handle incoming messages from background.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//    location.href = request.url;
    window.open(request.url, "_self");
});
