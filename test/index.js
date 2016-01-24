// require('request-debug')(require("request"));

function panic(e) {
	console.error(e.stack || e);
}

var CouchDB = require("../")("http://localhost:5984");

// console.log(CouchDB.baseUrl);
// console.log(CouchDB.signedIn());
//
// CouchDB.on("error", panic);
// CouchDB.on("signin", function(sess) {
// 	console.log(CouchDB.signedIn());
// 	console.log(sess);
// });

var db = new CouchDB("pagedip$directory");
var superdb = new CouchDB("pagedip$directory", {
	auth: { username: "admin", password: "12345" }
});

function ignore401(e) {
	if (e.status !== 401) throw e;
}

Promise.all([
	superdb.allDocs().catch(ignore401),
	db.allDocs().catch(ignore401)
]).then(function(res) {
	console.log(res);
}).catch(panic);
