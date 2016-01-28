var test = require("tape");
// var makeCouchDB = require("../");
var utils = require("./utils");

test("generates PouchDB class and calls the callback", function(t) {
	t.plan(3);

	var CouchDB = utils.setup(function(err) {
		t.pass("ran the callback");
		t.error(err, "didn't error");
	});

	t.equals(typeof CouchDB, "function", "creates a function/class");
});
