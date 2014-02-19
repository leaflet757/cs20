function ResourceConfig(source){
	var config = new XMLConfig(source);
	
	this.configs = {};
	for(var i in config.children){
		var n = config.children[i];
		if(n.name == "configs"){
			for(var j in n.children){
				this.configs[n.children[j].attributes["name"]] =  new XMLConfig(n.children[j].text)
			}
		}else if(n.name == "resourceConfigs"){
			for(var j in n.children){
				this.merge(new ResourceConfig(n.children[j].text))
			}
		}else{
			this[n.name] = n.children;
		}
	}
}
ResourceConfig.prototype = {
	merge: function(config){
		for(var o in config){
			if(config[o] instanceof Array){
				if(this[o]){
					for(var i in config[o]){
						this[o].push(config[o][i]);
					}
				}else{
					this[o] = config[o];
				}
			}else{
				if(this[o]){
					fillProperties(this[o],config[o]);
				}else{
					this[o] = config[o];
				}
			}
		}
	}
}

/**
* sorts an xml file into a more convienient data structure
*/
var XMLConfig = (function(){

	var ConfigNode = function(element){
		this.attributes = {}
		this.children = []
		this.text = "";
		this.name = element.nodeName;
		
		for(var i = 0; i<element.childNodes.length; i++){
			var n = element.childNodes[i];
			if(n.parentNode == element){
				if(n.nodeType ==  Node.TEXT_NODE){
					this.text = n.data;
					this.text =this.text.replace("\n","").trim();
				}else if(n.nodeType == Node.ELEMENT_NODE){
					this.children.push(new ConfigNode(n))
				}else if(n.nodeType == Node.ATTRIBUTE_NODE){
					this.attributes[n.nodeName] = n.nodeValue;
				}
			}
		}
		for(var i = 0; i<element.attributes.length; i++){
			this.attributes[element.attributes[i].nodeName] = element.attributes[i].nodeValue;
		}
	}
	ConfigNode.prototype = {
		toString:function(){
			var str = this.name+'{text:"'+this.text+'" ,attributes:{'
			for(var o in this.attributes){
				str+="["+o+":"+this.attributes[o]+"]";
			}
			str+="}}"
			return str;
		},
		print:function(){
			if(this.name == 'root'){
				console.log(this.toString());
			}
			if(this.children.length>0){
				var str = "";
				for(var i in this.children){
					str+=this.children[i]; 
				}
				console.log(str);
				for(var i in this.children){
					this.children[i].print(); 
				}
			}
		}
	}
	return function(source){
		//get xml file
		var request=new XMLHttpRequest();
		request.open("GET",source,false);//synchronous loading
		request.send();
		// console.log(request.responseText)
		var xml = (new DOMParser()).parseFromString(request.responseText,'text/xml');
		
		return new ConfigNode(xml.documentElement)
	}
})();
