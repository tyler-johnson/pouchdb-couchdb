var _ = require("lodash");
var makeCouchDB = require("../");

exports.BASE_URL = process.env.COUCHDB_URL || 'http://localhost:5984';

var auth = process.env.COUCHDB_AUTH;
if (auth) {
	auth = auth.split(":");
	exports.HTTP_AUTH = {
		username: auth[0],
		password: auth.slice(1).join(":")
	};
}

exports.setup = function(opts, cb) {
	if (typeof opts === "function") {
		cb = opts;
		opts = null;
	}

	return makeCouchDB(_.assign({
		baseURl: exports.BASE_URL,
		auth: exports.HTTP_AUTH
	}, opts), cb);
};
