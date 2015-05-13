var addToObject = function(_obj, _key, _value) {
	if (_obj[_key] == null) {
		_obj[_key] = _value;
	} else if (!(_obj[_key] instanceof Array)) {
		var tmp = _obj[_key];
		var arr = [tmp, _value];
		_obj[_key] = arr;
	} else {
		_obj[_key].push(_value);
	}
	return _obj;
};

var traverseTree = function(_node) {
	var textOnly = true;
	var part = {};
	if (_node.hasChildNodes()) {
		for (var ch_index = 0; ch_index < _node.childNodes.length; ch_index++) {
			var ch = _node.childNodes.item(ch_index);
			if (ch.nodeName == '#text' && ch.textContent.replace(/\n/g, '').replace(/ /g, '') == "")
				continue;
			//skip blank text element
			if (ch.nodeType === 3 || ch.nodeType === ch.CDATA_SECTION_NODE) {//Text Node
				if (_node.childNodes.length === 1 && !_node.hasAttributes()) {
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
	if (_node.hasAttributes()) {
		for (var att_index = 0; att_index < _node.attributes.length; att_index++) {
			var att = _node.attributes.item(att_index);
			//part = addToObject(part, att.nodeName, att.nodeValue);
			part[att.nodeName] = att.nodeValue;
		}
		textOnly = false;
	}
	return part;
};

var traverseObject = function(_v, _name, _ind) {
	var xml = "";
	if ( _v instanceof Array) {
		for (var i = 0,
		    n = _v.length; i < n; i++)
			xml += _ind + traverseObject(_v[i], _name, _ind + "\t") + "\n";
	} else if ( typeof (_v) == "object") {
		var hasChild = false;
		xml += _ind + "<" + _name;
		for (var m in _v) {
			if (m.charAt(0) == "@")
				xml += " " + m.substr(1) + "=\"" + _v[m].toString() + "\"";
			else
				hasChild = true;
		}
		xml += hasChild ? ">" : "/>";
		if (hasChild) {
			for (var m in _v) {
				if (m == "#text")
					xml += _v[m];
				else if (m == "#cdata")
					xml += "<![CDATA[" + _v[m] + "]]>";
				else if (m.charAt(0) != "@")
					xml += traverseObject(_v[m], m, _ind + "\t");
			}
			xml += (xml.charAt(xml.length - 1) == "\n" ? _ind : "") + "</" + _name + ">";
		}
	} else {
		xml += _ind + "<" + _name + ">" + _v.toString() + "</" + _name + ">";
	}
	return xml;
};

var XMLTools = function(_inputXml) {
	if ( typeof _inputXml == 'string') {
		this.doc = Ti.XML.parseString(_inputXml).documentElement;
	}
	if ( typeof _inputXml == 'object') {
		this.doc = _inputXml.documentElement;
	}
};

XMLTools.prototype.getDocument = function() {
	return this.doc;
};

XMLTools.prototype.toObject = function() {
	if (this.doc == null) {
		return null;
	}
	this.obj = traverseTree(this.doc);
	return this.obj;
};

XMLTools.prototype.toJSON = function() {
	if (this.doc == null) {
		return null;
	}
	if (this.obj == null) {
		this.obj = traverseTree(this.doc);
	}
	return (JSON.stringify(this.obj));
};

exports.toJSON = function(_xmlStr) {
	return new XMLTools(_xmlStr).toObject();
};

exports.toXML = function(_jsonObj) {
	var xml = "";
	for (var m in _jsonObj)
	xml += traverseObject(_jsonObj[m], m, "");
	return xml.replace(/\t|\n/g, "");
};
