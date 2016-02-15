import {assign} from "lodash";

export default function defaults(defaultOpts) {
	let CouchDB = this;
	let CouchAlt = this.extend({
		constructor: function(name, opts, callback) {
			if (!(this instanceof CouchAlt)) {
				return new CouchAlt(name, opts, callback);
			}

			if (typeof opts === 'function' || typeof opts === 'undefined') {
				callback = opts;
				opts = {};
			}
			if (name && typeof name === 'object') {
				opts = name;
				name = undefined;
			}

			opts = assign({}, defaultOpts, opts);
			CouchDB.call(this, name, opts, callback);
		}
	});

	return CouchAlt;
}
