chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if(request.type === "feedback") {
        var url = 'http://www.asuprofessorratings.com/submitFeedback2.php';
        var xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
            // console.log(xhttp.responseText);
        }
        xhttp.onerror = function() {
            // console.log(xhttp.responseText);
        }
        xhttp.open('POST', url, true);
        xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhttp.send('profName=' + request.profName + '&' +
                   'corsName=' + request.corsName + '&' +
                   (request.feedback ? 'type=update' : 'type=initial') + '&' +
                   (request.feedback ? 'feedback=' + request.feedback : '') + '&' +
                   'userID='   + request.userID);
    }
    else if(request.type === "cleanup") {
        var url = 'http://www.asuprofessorratings.com/mergeSearch.php';
        var xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
            // console.log(xhttp.responseText);
        }
        xhttp.onerror = function() {
            // console.log(xhttp.responseText);
        }
        xhttp.open('POST', url, true);
        xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhttp.send('searchID=' + request.search);
    }
    else {
        var url = 'http://www.asuprofessorratings.com/getRatings.php';
        var xhttp = new XMLHttpRequest();
        
        xhttp.onload = function() {
            callback(xhttp.responseText + '&' + request.partition);
        };
        xhttp.onerror = function() {
            callback();
        };
        xhttp.open('POST', url, true);
        xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhttp.send('names=' + request.names + '&' +
                   'courses=' + request.courses + '&' +
                   'searchID=' + request.search + '&' +
                   'platform=' + request.pltform + '&' +
                   'version=' + request.vers + '&' +
                   'userID=' + request.user);
        return true; // prevents the callback from being called too early on return
    }
});

function sendNotification(text) {
    Notification.requestPermission();
    var options = {
        body: text,
        icon: chrome.extension.getURL("images/logo128.png")
    }
    var n = new Notification("ASU Professor Ratings", options);
    setTimeout(function(){n.close();}, 7000);
}

chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        var url = tabs[0].url;
        var matches = ["https://webapp4.asu.edu/catalog/"];
        var exclude_matches = ["https://webapp4.asu.edu/catalog/",
                               "https://webapp4.asu.edu/catalog/?t=*",
                               "https://webapp4.asu.edu/catalog/course?s=*"];
        var match = false;
        if(matches[0] == url.substring(0, matches[0].length)) {
            match = true;
            for(var i = 0; i < exclude_matches.length; i++) {
                var truncation = exclude_matches[i].slice();
                var comparison = url.slice();
                if(truncation[truncation.length - 1] == "*") {
                    truncation = truncation.substring(0, truncation.length - 1);
                    comparison = comparison.substring(0, truncation.length);
                }

                if(truncation == comparison) {
                    match = false;
                    break;
                }
            }
        }
        if(match) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {doAction: true}, function(response) {
                    if(!response) {
                        sendNotification("ASU Professor Ratings has already been run on this page.");
                    }
                });
            });
        } else {
            if(url != exclude_matches[0] &&
               url.substring(0, exclude_matches[1].length - 1) != exclude_matches[1].substring(0, exclude_matches[1].length - 1)) {
                chrome.tabs.create({'url': "https://webapp4.asu.edu/catalog/"});
                sendNotification("Perform a search and ASU Professor Ratings will autorun. If autorun is disabled, " + 
                                 "click the extension icon to show ratings.");
            }
        }
    });
});