var _ = require("lodash");
var test = require("tape");
// var makeCouchDB = require("../");
var utils = require("./utils");

test("generates PouchDB class and calls the callback", function(t) {
	t.plan(3);

	var CouchDB = utils.create(function(err) {
		t.pass("ran the callback");
		t.error(err, "didn't error");
	});

	t.equals(typeof CouchDB, "function", "creates a function/class");
});

test("has admin credentials", function(t) {
	t.plan(2);
	var CouchDB = utils.create();

	CouchDB.setup().then(function() {
		var sess = CouchDB.session();
		t.ok(sess, "has a session");
		t.ok(_.includes(sess.roles, "_admin"), "is a super admin");
	}).catch(t.error.bind(t));
});

test("calls the signin event on initial setup", function(t) {
	t.plan(2);
	var CouchDB = utils.create();

	CouchDB.on("signin", function(sess) {
		t.pass("called signin event");
		t.ok(sess, "signin event includes admin session");
	});

	CouchDB.setup().catch(t.error.bind(t));
});
