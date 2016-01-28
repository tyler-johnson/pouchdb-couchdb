var test = require("tape");
var makeCouchDB = require("../");

test("generates PouchDB class", function(t) {
	t.plan(1);
	var CouchDB = makeCouchDB();
	t.equals(typeof CouchDB, "function", "creates a function");
});
