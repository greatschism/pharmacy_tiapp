require('ti-mocha');

var alloy = require('alloy');

var anal = require('analytics');


// create the test suite
describe('Unit Test suite - Analytics', function() {
    
 	it('Analytics for feature events', function(){
 		anal.Analytics.featureEvent("SomeTestName");

		expect(Ti.Analytics.featureEvent).toHaveBeenCalled();
	    
 	});
 	
 	it('Analytics for nav events', function(){
 		anal.Analytics.navEvent("from", "to");

	    expect(Ti.Analytics.navEvent("to","from")).toHaveBeenCalled();
 	});

});

// run the tests
mocha.run();
