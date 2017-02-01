var hasRun = false;
var userID = "";
var notify = false;
var preferredQualityArray = ['Overall_Quality', 'Difficulty'];
var preferredQuality = 'Overall_Quality';

// Needed to check if extension is installed
var isInstalledNode = document.createElement('div');
isInstalledNode.id = 'extension-is-installed';
document.body.appendChild(isInstalledNode);
// Adding div to listen for events from the page
var messageDiv = document.createElement('div');
messageDiv.id = "send_message_div";
messageDiv.hidden = true;
messageDiv.addEventListener('sendMessage', function() {
    chrome.runtime.sendMessage(JSON.parse(this.innerHTML));
});
document.body.appendChild(messageDiv);
// Autorun
checkStorageAndRunScript(false);

// Manual
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(!hasRun && request.doAction) {
        sendResponse(true);
        checkStorageAndRunScript(true);
    } else {
        sendResponse(false);
    }
});

function checkStorageAndRunScript(overrideAuto) {
    chrome.storage.sync.get(['autorun', 'notify','user_id', 'show'], function(items) {
        if(!('autorun' in items) || !('notify' in items) || !('user_id' in items) || !('show' in items)) {
            userID = generateUniqueID();
            console.log("shoud not reach");
            chrome.storage.sync.set({
                'autorun': true,
                'notify': false,
                'user_id': userID,
                'show' : 0
            }, function(items) {
                notify = false;
                hasRun = true;
                preferredQuality = preferredQualityArray[0];
                readyScript();
            });
        } else if(overrideAuto || items.autorun == true) {
            notify = items.notify;
            userID = items.user_id;
            hasRun = true;
            preferredQuality = preferredQualityArray[items.show];
            readyScript();
        }
    });
}

function generateUniqueID() {
    // Get current millisecond time as a string
    var time = Date.now().toString();

    // Get a random number 10,000-99,000 (5 digits) as a string
    var num = Math.floor(Math.random() * (90000) + 10000).toString();

    // Return the concatenation of the 2
    return time + num;
}

var feedbackTemplate;
var tableHeaderTemplate;
var profRatingTemplate;
var loadingAnimation = chrome.extension.getURL("images/loading.gif");
var calloutImage = chrome.extension.getURL("images/callout.png");
var contentScriptHelper = chrome.extension.getURL("/js/content_script_helper.js");
function readyScript() {
    $.when(
        $.get(chrome.extension.getURL('/html/feedback.html'), function(data) {
            feedbackTemplate = data;
        }),
        $.get(chrome.extension.getURL('/html/table_header.html'), function(data) {
            tableHeaderTemplate = data;
        }),
        $.get(chrome.extension.getURL('/html/prof_rating.html'), function(data) {
            profRatingTemplate = data;
        })
    ).then(function() {
        runScript();
    });
}

function runScript() {
    // Get the current version number from the manifest and manually set
    // the platform as Chrome
    var manifestData = chrome.runtime.getManifest();
    var platform = "Chrome";
    var version = manifestData.version;

    Notification.requestPermission();
    chrome.storage.sync.get('notify', function(items) {
        if(items.notify == true) {
            var options = {
                body: "ASU Professor Ratings is now running on this page. To change this behavior, go to the options page.",
                icon: chrome.extension.getURL("images/logo128.png")
            }
            var n = new Notification("ASU Professor Ratings", options);
            setTimeout(function(){n.close();}, 7000);
        }
    });

    var instructorLinks = [];
    var instructorNames = [];
    var instructorCours = [];

    function formatName(name) {
    	return name.split(' ').join('+');
    }

    var seatsOpenHeader = $("#CatalogList > thead > tr > th.hoursColumnHeader.sorting");
    if(seatsOpenHeader == null)
        return;
    $(tableHeaderTemplate).insertAfter(seatsOpenHeader);

    var courseCodeCol = document.getElementsByClassName("subjectNumberColumnValue");
    var instructorCol = document.getElementsByClassName("instructorListColumnValue");
    var availSeatsCol = document.getElementsByClassName("availableSeatsColumnValue");
    var instructorRatings = [];
    var instructorCount = [];

    for(var i = 0; i < availSeatsCol.length; i++) {
        var newTD = document.createElement("td");
        newTD.className = "RMPtd";
        instructorRatings.push(newTD);
        var par = availSeatsCol[i].parentNode;
        par.insertBefore(newTD, availSeatsCol[i]);

        instructorCount.push(0);
        var rowLinks = $(instructorCol[i]).find('a');
        if(rowLinks) {
            for(var j = 0; j < rowLinks.length; j++) {
                if(rowLinks[j].title.indexOf('Instructor') != -1) {
                    instructorCount[i]++;
                    instructorLinks.push(rowLinks[j]);
                    instructorNames.push(formatName(rowLinks[j].title.substring(11)));
                    instructorCours.push(courseCodeCol[i].innerHTML.match(/[A-Z]{3} [0-9]{3}/)[0]);
                    if(j == 0) {
                        var node = document.createElement("img");
                        node.src = loadingAnimation;
                        node.className = 'RMPimg';
                        newTD.appendChild(node);
                    }
                }
            }
        }
    }
    
    var instructorIter = 0;
    var partitionedNames;
    var partitionedCours;
    var partitionStart = 0;
    var partitionSize = 10;
    var partitionsTotal = Math.floor(instructorCount.length / partitionSize) + 1;
    
    var searchID = generateUniqueID();

    // We track the number of partitions we have gotten back since they
    // don't come back in the order sent. When they're all back we can
    // run the cleanup script
    var numPartitionsBack = 0;

    for(var part = 0; part < partitionsTotal; part++) {
        partitionedNames = [];
        partitionedCours = [];
        partitionStart = part * partitionSize;
        for(var iter = partitionStart; iter < partitionStart + partitionSize && iter < instructorCount.length; iter++) {
            for(var instrCountIter = 0; instrCountIter < instructorCount[iter]; instrCountIter++) {
                partitionedNames.push(instructorNames[instructorIter]);
                partitionedCours.push(instructorCours[instructorIter]);
                instructorIter++;
            }
        }

        // Here we add the partition number to the searchID. ex. 1234567-1
        // After the searches ALL come back we can search for this ID with a
        // wildcard at the end and merge them all
        var searchIDwithPart = searchID + '-' + part;

        chrome.runtime.sendMessage({
            type: "ratings",
            names: JSON.stringify(partitionedNames),
            courses: JSON.stringify(partitionedCours),
            partition: part,
            search: JSON.stringify(searchIDwithPart),
            user: JSON.stringify(userID),
            pltform: JSON.stringify(platform),
            vers: JSON.stringify(version)
        }, function(responseText) {
            var partition = responseText.substring(responseText.lastIndexOf('&') + 1);
            var json = responseText.substring(0, responseText.lastIndexOf('&'));
            var json_index = 0;
            var partStart = partition * partitionSize;
            json = JSON.parse(json);

            var s = document.createElement('script');
            s.src = contentScriptHelper;
            s.onload = function() {
                this.parentNode.removeChild(this);
            };
            (document.head || document.documentElement).appendChild(s);

            for(var i = partStart; i < partStart + partitionSize && i < instructorCount.length; i++) {
                var injection = "";
                for(var j = 0; j < instructorCount[i]; j++) {
                    if(json[json_index].Result === "true") {
                        injection += fillProfRatingTemplate(json[json_index]);
                    } else {
                        var aTag = '<a style= "border-bottom: none !important;"class="RMPa" target="_blank">';
                        var aText = '<span class= "RMPatext notfound">NR</span>';
                        var popupCallout = '<img class="RMPcallout" src="' + chrome.extension.getURL("images/callout.png") + '"/>';
                        injection += aTag + aText + '<span class= "RMPpopup">' + popupCallout + fillFeedbackTemplate(json[json_index]) + '</span></a>';
                    }
                    json_index++;
                }
                // instructorRatings[i].innerHTML = injection;
                //injectionArr.push(injection);
                $(instructorRatings[i]).css({ opacity : 0});
                $(instructorRatings[i]).html(injection);
                $(instructorRatings[i]).animate({ opacity: 1 }, 200);
                $(".img-wrap").hover(
                    function() {
                        $(this).find("span").show();
                    },
                    function() {
                        $(this).find("span").hide();
                    });
            }

            // We are done processing that partition so we increment our partitionsBack var
            numPartitionsBack++;

            // We check to see if all partitions are back, and if so we can call the
            // cleanup script. We only send the original searchID
            if (numPartitionsBack == partitionsTotal) {
                chrome.runtime.sendMessage({
                    type: "cleanup",
                    search: JSON.stringify(searchID)
                });
            }
        });
    }
}

var ratingColors = ['F91D06', 'FC6F22', 'E6D600', '4EEB51', '00B13D'];
function fillProfRatingTemplate(profData) {
    var div = document.createElement('div');
    var ratingColors = getRatingColors(profData);
    div.innerHTML = profRatingTemplate.slice();
    $(div).find(".RMPa").attr('href', profData.ProfURL);
    $(div).find(".RMPatext").attr('style', 'background-color: #' + ratingColors[preferredQuality]);
    $(div).find(".RMPatext").html(profData[preferredQuality]);
    $(div).find(".RMPcallout").attr('src', calloutImage);
    $(div).find(".ProfName").html(profData.ProfName + " (" + profData.NumReviews + " Reviews)");
    $(div).find(".OverallQuality").html(profData.Overall_Quality);
    $(div).find(".OverallQuality").css('color', '#' + ratingColors.Overall_Quality);
    $(div).find(".Difficulty").html(profData.Difficulty);
    $(div).find(".Difficulty").css('color', '#' + ratingColors.Difficulty);
    $(div).find(".WouldTake").html(profData.Would_Take);
    if(profData.HasReview === 'true') {
        if(profData.ReviewForSearched === 'true') {
            $(div).find(".AnyReviewCourse").html(profData.ReviewCourse);
            $(div).find(".AnyReview").html('<q>' + profData.Review + '</q>');
        }
        else {
            $(div).find(".AnyReviewCourse").html(profData.SearchedCourse);
            $(div).find(".RelReview").html('<q>' + profData.Review + '</q>');
            $(div).find(".RelReviewDiv").attr('style', 'display: block');
        }
    }

    if(profData.Points > 0) {
        var star_div = $(div).find(".img-wrap");
        star_div.append($("<img class=\"gold-star\">").attr("src", chrome.extension.getURL("images/gold-star.png")));
        star_div.append($("<span class=\"star-text\">You submitted feedback that helped us improve our database. Thanks!</span>"));
    }

    return div.innerHTML;
}

function fillFeedbackTemplate(profData) {
    var div = document.createElement('div');
    div.innerHTML = feedbackTemplate.slice();
    $(div).find(".prof_name").html(profData.ProfName);
    $(div).find(".class_name").html(profData.CorsName);
    $(div).find(".userID").html(userID);
    return div.innerHTML;
}

function getRatingColors(review) {
    return (
    {"Overall_Quality" : ratingColors[parseInt((parseFloat(review.Overall_Quality) - 1) / 4.01 * ratingColors.length)],
     "Difficulty"      : ratingColors[parseInt((parseFloat(5 - review.Difficulty)) / 4.01 * ratingColors.length)]
    });
}