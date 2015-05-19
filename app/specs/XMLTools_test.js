var XMLTools=require("XMLTools");
describe("XML Tools Test Suite",function(){
	it("XML Tools - Convert XML to JSON success",function(){
		(typeof(XMLTools.toJSON("<company></company>"))== "object").should.be.true;	
	});
	it("XML Tools - Convert XML to JSON success",function(){
	(typeof(XMLTools.toJSON("<company>mscripts</company>"))== "string").should.be.true;
	});
	it("XML Tools - Convert JSON to XML success",function(){
		(typeof(XMLTools.toXML({ "company": "mscripts" }))== "string").should.be.true;
	});
	it("XML Tools - Convert XML to JSON failure",function(){
		(typeof(XMLTools.toJSON("<company></company>"))== "string").should.be.false;	
	});
	it("XML Tools - Convert XML to JSON failure",function(){
	(typeof(XMLTools.toJSON("<company>mscripts</company>"))== "object").should.be.false;
	});
	it("XML Tools - Convert JSON to XML failure",function(){
		(typeof(XMLTools.toXML({ "company": "mscripts" }))== "object").should.be.false;
	});
});

