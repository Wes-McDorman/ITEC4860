function showErrorForm(element) {
	var parent = $(element).parent();
    element.style.display = "none";
    parent.find(".error_form")[0].style.display = "block";
    sendFeedbackMessage(parent.find(".prof_name").text(),
    					parent.find(".class_name").text(),
                        parent.find(".userID").text());
}
function submitErrorForm(element) {
	var parent = $(element).parent().parent();
    parent.find(".feedback_input")[0].disabled = true;
    parent.find(".feedback_submit")[0].style.display = "none";
    parent.find(".feedback_thanks")[0].style.display = "block";
    sendFeedbackMessage(parent.find(".prof_name").text(),
    					parent.find(".class_name").text(),
                        parent.find(".userID").text(),
    					parent.find(".feedback_input").val());
}

function sendFeedbackMessage(profName, corsName, userID, addInfo) {
    var feedbackEvent = document.createEvent('Event');
    feedbackEvent.initEvent('sendMessage', true, true);
    messageDiv = $('#send_message_div')[0];
    messageDiv.innerText = JSON.stringify({
        type : "feedback",
        profName : profName,
        corsName : corsName,
        feedback : addInfo,
        userID : userID
    });
    messageDiv.dispatchEvent(feedbackEvent);
}
