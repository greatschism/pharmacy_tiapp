var Alloy = require("alloy"),
    utilities = require("utilities"),
    apiCodes = Alloy.CFG.apiCodes,
    isEnabled = false;

function updateCounter(action) {
	/**
	 * check whether feedback feature is enabled
	 * and current action matches feedback action trigger
	 */
	if (Alloy.CFG.feedback_action === action && !isEnabled) {
		/**
		 * when option is cancel / remind
		 * continue based on counter value
		 */
		var feedbackOpt = utilities.getProperty(Alloy.CFG.latest_feedback_option, apiCodes.feedback_option_cancel, "int", false);
		switch(feedbackOpt) {
		case apiCodes.feedback_option_cancel:
		case apiCodes.feedback_option_remind:
			//add counter
			var count = utilities.getProperty(Alloy.CFG.latest_feedback_action_count, 0, "int", false);
			//increment
			count++;
			if (Alloy.CFG.feedback_action_count < count) {
				//if counter crossed the limit then reset
				count = 0;
				//set enabled flag
				isEnabled = true;
			}
			//update counter property
			utilities.setProperty(Alloy.CFG.latest_feedback_action_count, count, "int", false);
			break;
		case apiCodes.feedback_option_submitted:
		case apiCodes.feedback_option_not_submitted:
			/**
			 * if user had selected needs improvement
			 * on previous version and has improvements
			 * flag is true, ask him for feedbacks again
			 */
			if (Alloy.CFG.has_improvements && (parseInt(Alloy.CFG.app_version.substring(1)) || 0) > utilities.getProperty(Alloy.CFG.latest_feedback_app_version, 0, "int", false)) {
				//now user will be asked for feedback again once the counter hits limit
				utilities.setProperty(Alloy.CFG.latest_feedback_option, apiCodes.feedback_option_cancel, "int", false);
			}
			break;
		}
	}
}

function setOption(option) {
	if (isEnabled) {
		//once shown, flag should be reset
		isEnabled = false;
		//if one of these, then save the app version too
		if (option === apiCodes.feedback_option_submitted || option === apiCodes.feedback_option_not_submitted) {
			utilities.setProperty(Alloy.CFG.latest_feedback_app_version, parseInt(Alloy.CFG.app_version.substring(1)) || 0, "int", false);
		}
		//update option
		utilities.setProperty(Alloy.CFG.latest_feedback_option, option, "int", false);
	}
}

Object.defineProperty(exports, "isEnabled", {
	get : function() {
		return isEnabled;
	}
});

Object.defineProperty(exports, "option", {
	set : setOption,
	get : function() {
		return utilities.getProperty(Alloy.CFG.latest_feedback_option, apiCodes.feedback_option_cancel, "int", false);
	}
});

exports.updateCounter = updateCounter;
