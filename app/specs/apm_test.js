var apm=require("apm");

describe("APM Test Suite",function(){
	it("APM - Performance module",function(){
		apm.init();
		apm.setUsername("mscripts");
		(typeof(apm.module) == "object").should.be.false;
	});	
});

