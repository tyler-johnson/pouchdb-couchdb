var _ = require("lodash");
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

test("has admin credentials", function(t) {
	t.plan(3);
	
	var CouchDB = utils.setup(function(err) {
		t.error(err, "didn't error");

		var sess = CouchDB.session();
		t.ok(sess, "has a session");
		t.ok(_.includes(sess.roles, "_admin"), "is a super admin");
	});
});
