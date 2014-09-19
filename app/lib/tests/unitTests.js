require('ti-mocha');
//mocha.setup({ reporter: 'ti-spec-studio' });

var alloy = require('alloy');

var anal = require('analytics');


// create the test suite
describe('Unit Test suite - Analytics', function() {
    
 	it('Analytics for breadcrumbs', function(){
 		var results = anal.analytis("breadcrumb", {foo: 1});

	    if(results == 1) {
	    		throw new ("Analytics for breadcrumb FAILED");
	    }
 	});
 	
 	it('Analytics for feature events', function(){
 		var results = anal.analytis("featureEvent", 'Analytic.index.click');

	    if(results !== 2) {
	    		throw new ("Analytics for feature events FAILED");
	    }
 	});
 	
 	it('Analytics for nav events', function(){
 		var results = anal.analytis("navEvent", 'Home', 'Page1');

	    if(results !== 3) {
	    		throw new ("Analytics for nav events FAILED");
	    }
 	});

});

// run the tests
mocha.run();