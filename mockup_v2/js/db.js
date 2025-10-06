var debugging=true;
function debugLog(s){if(debugging)console.log(s)}

/*
	Database Management
	This allows the site to retrieve data from a pseudo-database. This "database" is a json
	file named "db.json", and structured as follows:
	{
		"table1":[
			{"column1":"value","column2":value},
			{"column1":"value","column2":value}
		],
		"table2":[
			{"column1":"value","column2":value},
			{"column1":"value","column2":value}
		]
	}
*/


//	selectAll() returns the whole db.json object.
async function selectAll(){
	debugLog("Retrieving DB data...");
	var res;
	await fetch("../js/db.json").then(r=>r.json()).then(j=>res=j);
	debugLog("DB data retrieved.")
	return res;
}


//	selectAllFrom(table) returns the array that corresponds to the specified table from the "database".
async function selectAllFrom(table){
	debugLog(`Retrieving data from DB at table [${table}]`);
	var db = await selectAll();
	if(table in db){
		debugLog(`Data from table [${table}] retrieved.`);
		return db[table];
	} else {
		debugLog(`Table [${table}] not found`);
		return null;
	}
}

/*
	selectAllWhere(table, compFunc) returns an array that corresponds to the specified table from
	the database. For each entry in the array, a developer-defined comparison function, compFunc(row),
	is called. This comparison function should return true if the row being compared should be included
	in the final returned array.
*/
async function selectAllWhere(table,compFunc){
	debugLog(`Retrieving data from DB at table [${table}] where [${compFunc}]`)
	var res=[];
	var db = await selectAll();
	if(!(table in db)){
		debugLog(`Table [${table}] not found.`)
		return [];
	} else {
		for(var i of db[table]){
			if(compFunc(i))res.push(i)
		}
		debugLog(`Retrieved ${res.length} rows from table [${table}]`);
	}
	return res;
}