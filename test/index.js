// var _ = require("lodash");
var test = require("tape");
var makeCouchDB = require("../");
var utils = require("./utils");

test("generates PouchDB class and calls the callback", function(t) {
	t.plan(4);

	var CouchDB = utils.create(function(err) {
		t.pass("ran the callback");
		t.error(err, "didn't error");
	});

	CouchDB.setup().then(function() {
		t.pass("setup() returns and resolves promise");
	});

	t.equals(typeof CouchDB, "function", "creates a function/class");
});

test("calls the ready event after initial setup", function(t) {
	t.plan(4);
	var after = false;
	var CouchDB = utils.create(function(err) {
		t.error(err, "didn't error");
		after = true;
	});

	CouchDB.on("ready", function() {
		t.pass("called ready event");
		t.ok(CouchDB.session(), "has a session");
		t.ok(after, "event called after callback");
	});
});

// - auth mode tests: setup, signIn, signOut
test("registers custom auth mode", function(t) {
	t.plan(1);

	var mode = function(CouchDB) {
		if (typeof CouchDB !== "function") {
			t.fail("expecting authmode method to be called with a function/class");
		}

		return {
			setup: function(auth, headers) {
				if (typeof auth === "object" && auth != null) this._auth_harness = auth;
				if (typeof headers !== "object") {
					t.fail("expecting object for headers during setup.");
				}
				if (this._auth_harness && this._auth_harness.setup) {
					this._auth_harness.setup.apply(this, arguments);
				}
			},
			signIn: function(auth) {
				if (typeof auth === "object" && auth != null) this._auth_harness = auth;
				if (this._auth_harness && this._auth_harness.signIn) {
					this._auth_harness.signIn.apply(this, arguments);
				}
			},
			signOut: function() {
				if (this._auth_harness && this._auth_harness.signOut) {
					this._auth_harness.signOut.apply(this, arguments);
				}
				delete this._auth_harness.signOut;
			}
		};
	};

	makeCouchDB.modes.register("test", mode);
	t.pass("registered custom auth mode");
});

test("calls auth setup method immediately", function(t) {
	t.plan(4);

	var immediate = false;
	var waited = false;

	var CouchDB = utils.create({
		authmode: "test",
		auth: {
			setup: function() {
				immediate = true;
				t.pass("calls setup");

				return new Promise(function(resolve) {
					process.nextTick(function() {
						waited = true;
						resolve();
					});
				});
			}
		}
	});

	t.ok(immediate, "called immediately");
	t.ok(!waited, "still waiting");

	CouchDB.setup().then(function() {
		t.ok(waited, "setup method waited for authmode setup");
	});
});

test("calls signIn method", function(t) {
	t.plan(1);

	var CouchDB = utils.create({
		authmode: "test",
		auth: {
			signIn: function() {
				t.pass("called sign in");
			}
		}
	});

	CouchDB.signIn().catch(t.error.bind(t));
});

test("calls signOut method", function(t) {
	t.plan(1);

	var CouchDB = utils.create({
		authmode: "test",
		auth: {
			signOut: function() {
				t.pass("called sign out");
			}
		}
	});

	CouchDB.signOut().catch(t.error.bind(t));
});

// - class gen tests: events, callback, setup
// - method tests: configure, fetch user doc, change password
// - db tests: create database, basic db read/write


// test("has admin credentials", function(t) {
// 	t.plan(2);
// 	var CouchDB = utils.create();
//
// 	CouchDB.setup().then(function() {
// 		var sess = CouchDB.session();
// 		t.ok(sess, "has a session");
// 		t.ok(_.includes(sess.roles, "_admin"), "is a super admin");
// 	}).catch(t.error.bind(t));
// });
//
// test("calls the ready event after initial setup", function(t) {
// 	t.plan(3);
// 	var CouchDB = utils.create();
//
// 	CouchDB.on("ready", function() {
// 		t.pass("called ready event");
// 		var sess = CouchDB.session();
// 		t.ok(sess, "has a session");
// 		t.ok(_.includes(sess.roles, "_admin"), "is a super admin");
// 	});
//
// 	CouchDB.setup().catch(t.error.bind(t));
// });
