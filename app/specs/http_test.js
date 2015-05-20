/**
 * @author lraj
 */
var http=require("http");
describe("http Test Suite",function(){
	
	var reqObject = {
  	url: 'https://trvpc.remscripts.com/tronphonehandler/appload',
  	type: 'POST',
  	format: 'xml',
  	data: '<request><appload><phonemodel></phonemodel><phoneos></phoneos><phoneplatform>IP</phoneplatform><deviceid></deviceid><appversion>v1</appversion><carrier></carrier><clientname></clientname><featurecode>TH038</featurecode></appload></request>'
  	
  	};
	it("http - To verify the json response- TC001",function(){
		http.request(reqObject).should.be.true;	
	});
	/*
	it("XML Tools - Convert XML to JSON success",function(){ 
	(typeof(request(""))== "string").should.be.true;
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
*/
});

