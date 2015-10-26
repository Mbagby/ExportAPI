//1. Create a get request
//Seems simple right...

//Issue 1: Node.js isnt following redirect. (301)
//Notes: Node.js does NOT automatically follow redirects. Awesome.
//Solution: Force it to & use https

//Issue 2: Basic Auth is acting up
//Solution: Put auth as one large variable instead of seperate user and pass

//Other Things: Now we have 200 status code BUT we really should do some error handling :/

//npm packages we would like to use
var https = require("https");
var fs = require('fs');
var util = require('util');
var json2csv = require('json2csv');

//In case we dont want MY account we could use a prompt in the command line to change auth and host variables
//var prompt = require('prompt') and then take input and put into auth variable; 

var options = {
  host: 'desk.com', //Whatever account
  path: '/api/v2/cases',
  method: 'GET',
  auth: 'email:password'  //account email and password
  //used random password for this account
};
https.get(options, function(res) {

  //Create a file with the headers in it before pushing in case data
  //Strategy: Save Json data file and manipulate it seperately into csv file 
  //Then combine into one script

  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  var data = "";
  res.on('data', function (chunk){
  	data += chunk;
  	// This should def be a string!
  	// console.log(typeof data);
   });
   
   res.on('end', function(err) {
   	   if (err){
   	   	console.log("Error" + err)
   	   }else {
   	   	var result = JSON.parse(data);
   	   	// console.log(typeof result); double check type: result should def be an object
   	   	var array = result._embedded.entries
   	   	//lets look through our now nicely(it better be, according to typeof) formatted JSON 
   	   	//We only want specific values
   	   	var cases = [];
   	   	for (var i = 0; i < array.length; i++){
   	   		//Case Number(Id) -id
			//Subject - subject
			//Description - description
			//Status - status
			//Assigned User- links, assigned_user
			//Number of Replies- links, replies
			//Seconds since creation- opened_at - created_at (Change into type Date)
			//Message direction and body- _embedded.draft.body / direction
			var id = array[i].id
			var status = array[i].status
			var subject = array[i].subject
		    var description = array[i].description
		    //make an object for each case
   	   		var cas = {id: id, status: status, subject: subject, description: description};
   	   		//push object into our cases array!
   	   		cases.push(cas);
   	   	}
   	   	console.log(cases);
   	   	
   	   }
    //write cases to a .json file! //now we have an array of objects(cases)
 	fs.writeFileSync('caseData.json', util.inspect(cases) , 'utf-8', function(err){
   		if(err){
  			console.log(err);
  		} else {
  			console.log('JSONData > caseData.json')
  		}
   	});

   	//write a json to csv file!

	var fields = ['id', 'subject', 'status', 'desciption'];
	json2csv({ data: cases, fields: fields }, function(err, csv) {
	  if (err) {
	  	console.log(err)
	  }else{
	  	fs.writeFile('caseData.csv', csv, function(err){
	  		if (err){
	  			console.log(err);
	  		}else{
	  			console.log("File Saved!");
	  		}
		});
	  }
	});

   	});	
   }).end();


//2. Parse JSON data into CSV file.
//Instead of doing it manually with Stream and piping, we can just use a node package(reason why people love node! npm!)
//Basically the csv to json piping but backwards
//....I got ahead of myself.... 


//2. Lets push JSON data into a json file
//Issue: fs.writeFile will overwrite the file each time it loops through to find another case
//Solution: write the file before the loop, and then append the file to add each case to the end

//3. Select specific keys and values that I want (get rid of unessesary JSON)
//Come back later for "extras"
//Case Number(Id) -id
//Subject - subject
//Description - description
//Status - status

//4. Make those into an array of cases (objects)

//5. Put those into a json file 

//Issue: My file just has [object] [object] written in it...
//Notes: Node does not specifically read the objects before putting them into a file
//Solution: Need to use "util" to inspect the object and fully read it.

//Adding additional fields and values for later

// if (array[i].subject = null || array[i].subject == ""){
// 				var subject = "None"
// 			} else {
// 				var subject = array[i].subject
// 			}
// 			if (array[i].description == "" || array[i].description = null){
// 				var description = "None"
// 			} else {
// 				var description = array[i].description
// 			}
   	   		// console.log("Status:" + status);
   	   		// console.log("Opened:" + opened);
			// var created = array[i].created_at.replace("Z", "")
			// if (typeof created == "string"){
   // 	   			created = Date.parse(created)
   // 	   		}
			// if (array[i].opened_at){
   // 	   			var opened = array[i].opened_at.replace("Z", "")
   // 	   			if (typeof opened == "string"){
   // 	   				opened = Date.parse(opened)
   // 	   			}
   // 	   		}