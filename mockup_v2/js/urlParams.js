/*
	URL Params management
	This allows to move data as a page is loaded by using URL parameters.
	params is a json object with the form {"parameter":"value"}.
	params  is automatically filled with the URL parameters when a page is loaded.
	New parameters can be added to params with the usual method of params[key]=value;
*/
var url = new URL(window.location.href);
var params={};
for([key,val] of url.searchParams){
	params[key]=val;
}


//	Clears all url parameters;
function clearParams(){
	params={};
}

/*
	Clears url parameteres, but keeps the specified ones.
	KEYS must be an array of parameter names. These are the keys that will be kept.
*/
function clearParamsKeep(keys){
	for(param in params){
		if(keys.indexOf(param)==-1){
			delete params[param]
		}
	}
}

/*
	Load a new page. Doing so this way allows the URL parameters to be passed correctly.
	Loading a new page without using a moveTo method clears all parameters.
	newParams, if it exists, should be an array of [k,v] pairs, where k is the key, and v
	is the value. For instance, newParams could be [["key1","val1"],["key2","val2"]].
*/
function moveTo(newPage,newParams){
	if(newParams!=null){
		for(pair of newParams){
			params[pair[0]]=pair[1];
		}
	}
	var appendParams="?";
	for(key in params){
		appendParams+=`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}&`;
	}
	appendParams=appendParams.substring(0,appendParams.length-1);
	window.location.href=newPage+appendParams;
}

/*
	Load a new page, replacing the current page in the history. Doing so this way allows the
	URL parameters to be passed correctly.
	Loading a new page without using a moveTo method clears all parameters.
	newParams, if it exists, should be an array of [k,v] pairs, where k is the key, and v
	is the value. For instance, newParams could be [["key1","val1"],["key2","val2"]].
*/
function moveToReplace(newPage,newParams){
	if(newParams!=null){
		for(pair of newParams){
			params[pair[0]]=pair[1];
		}
	}
	var appendParams="?";
	for(key in params){
		appendParams+=`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}&`;
	}
	appendParams=appendParams.substring(0,appendParams.length-1);
	window.location.replace(newPage+appendParams);
}