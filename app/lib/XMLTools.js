function addToObject(obj, key, value) {
	if (!obj[key]) {
		obj[key] = value;
	} else if (!(obj[key] instanceof Array)) {
		var tmp = obj[key];
		var arr = [tmp, value];
		obj[key] = arr;
	} else {
		obj[key].push(value);
	}
	return obj;
};

function traverseTree(node) {
	var textOnly = true;
	var part = {};
	if (node.hasChildNodes()) {
		for (var chindex = 0; chindex < node.childNodes.length; chindex++) {
			var ch = node.childNodes.item(chindex);
			if (ch.nodeName === '#text' && ch.textContent.replace(/\n/g, '').replace(/ /g, '') === "")
				continue;
			//skip blank text element
			if (ch.nodeType === 3 || ch.nodeType === ch.CDATA_SECTIONnode) {//Text Node
				if (node.childNodes.length === 1 && !node.hasAttributes()) {
					return ch.textContent;
				} else {
					part.text = ch.textContent;
				}
			} else {
				part = addToObject(part, ch.tagName, traverseTree(ch));
			}
		}
		textOnly = false;
	}
	if (node.hasAttributes()) {
		for (var attindex = 0; attindex < node.attributes.length; attindex++) {
			var att = node.attributes.item(attindex);
			//part = addToObject(part, att.nodeName, att.nodeValue);
			part[att.nodeName] = att.nodeValue;
		}
		textOnly = false;
	}
	return part;
};

function traverseObject(v, name, ind) {
	var xml = "";
	if ( v instanceof Array) {
		for (var i = 0,
		    n = v.length; i < n; i++)
			xml += ind + traverseObject(v[i], name, ind + "\t") + "\n";
	} else if ( typeof (v) == "object") {
		var hasChild = false;
		xml += ind + "<" + name;
		for (var m in v) {
			if (m.charAt(0) == "@")
				xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
			else
				hasChild = true;
		}
		xml += hasChild ? ">" : "/>";
		if (hasChild) {
			for (var k in v) {
				if (k == "#text")
					xml += v[k];
				else if (k == "#cdata")
					xml += "<![CDATA[" + v[k] + "]]>";
				else if (k.charAt(0) != "@")
					xml += traverseObject(v[k], k, ind + "\t");
			}
			xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
		}
	} else {
		xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
	}
	return xml;
};

exports.toJSON = function(inputXml) {
	if ( typeof inputXml == "object") {
		inputXml = inputXml.documentElement;
	} else {
		inputXml = Ti.XML.parseString(inputXml).documentElement;
	}
	return traverseTree(inputXml);
};

exports.toXML = function(jsonObj) {
	var xml = "";
	for (var m in jsonObj)
	xml += traverseObject(jsonObj[m], m, "");
	return xml.replace(/\t|\n/g, "");
};
