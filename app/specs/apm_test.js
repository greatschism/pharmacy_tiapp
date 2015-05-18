var apm=require("apm");
apm.init();
describe("APM Test Suite",function(){
	it("APM - Performance module",function(){
		apm.setUsername("mscripts");
		(typeof(apm.module) == "object").should.be.true;
	});	
});
;
