function ResourceConfig(source){
	//get xml file
	var request=new XMLHttpRequest();
	request.open("GET",source,false);//synchronous loading
	request.send();
	// console.log(request.responseText)
	var xml = (new DOMParser()).parseFromString(request.responseText,'text/xml');
	var files = xml.getElementsByTagName('file');
	for(var i in files){
		if(files[i].parentNode){
			var parentName = files[i].parentNode.tagName;
			if(parentName == 'resourceConfig'){
				this.merge(new ResourceConfig(files[i]))
			}else{
				if(!this[parentName]) this[parentName] = [];
				this[parentName].push(files[i]);
			}
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
			}
		}
	}
}

