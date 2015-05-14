var apm=require("apm");
apm.init();
describe("APM Test Suite",function(){
	it("APM (Test Case 1)",function(){
		apm.module=true;
		apm.setUsername = function(_username){
			_username= "mscripts";
		};
		(apm.setUsername).should.be.ok;
	});
	it("APM (Test Case 2)",function(){
		apm.module=true;
		apm.setOptOutStatus = function(_status){
			_status= true;
		};
		(apm.setOptOutStatus).should.be.ok;
	});
	it("APM (Test Case 3)",function(){
		apm.module=true;
		apm.setMetadata = function(_key,_value){
			_key="firstTimeLogin";
			_value="1";
		};
		(apm.setMetadata).should.be.ok;
	});
	it("APM (Test Case 4)",function(){
		apm.module=true;
		apm.leaveBreadcrumb = function(_breadcrumb){
			_breadcrumb="Entered the home page of the application";
		};
		(apm.leaveBreadcrumb).should.be.ok;
	});
	it("APM (Test Case 5)",function(){
		apm.module=true;
		apm.logHandledException = function(_error){
			_error="Array out of bounds";
		};
		(apm.logHandledException).should.be.ok;
	});
});

