import {omit,clone,assign} from "lodash";
import PouchDB from "pouchdb";
import * as methods from "./methods";
import {get as getMode,apply as applyMode} from "./modes/index.js";
import * as utils from "./utils/index.js";
import extend from "backbone-extend-standalone";

// fixes http adapter's need to use the prefix value
PouchDB.adapters.http.use_prefix = false;

export default function(baseUrl, defaultOpts, callback) {
	if (typeof baseUrl === "object") {
		[callback,defaultOpts,baseUrl] = [defaultOpts,baseUrl,void 0];
	} else if (typeof defaultOpts === "function") {
		[callback,defaultOpts] = [defaultOpts,void 0];
	}

	defaultOpts = clone(defaultOpts || {});
	if (baseUrl) defaultOpts.baseUrl = baseUrl;
	defaultOpts = utils.parseOptions(baseUrl, {
		authmode: "basic",
		ajax: { headers: {} }
	});

	let PouchAlt = PouchDB.defaults();

	function CouchDB(name, opts, callback) {
		if (!(this instanceof CouchDB)) {
			return new CouchDB(name, opts, callback);
		}

		if (typeof opts === "function" || typeof opts === "undefined") {
			callback = opts;
			opts = {};
		}

		if (name && typeof name === 'object') {
			opts = name;
			name = undefined;
		}

		opts = assign({}, omit(defaultOpts, "auth"), opts);
		opts.adapter = "http";
		if (!opts.getHost) opts.getHost = utils.prefixHost(opts.baseUrl);

		if (typeof callback !== "function") callback = (e)=>{ if (e) throw e; };
		this._auth_mode = CouchDB._auth_mode;
		let modeobj = CouchDB;
		let p = [];

		if (opts.authmode !== defaultOpts.authmode || opts.auth) {
			if (!opts.auth) return callback(new Error("Missing auth with custom authmode."));
			this._auth_mode = getMode(opts.authmode || defaultOpts.authmode);
			modeobj = this;
		}

		PouchDB.call(this, name, opts, function(err, res) {
			if (err) return callback(err);
			utils.callbackify(Promise.all(p), (e) => callback(e, res));
		});

		// PouchDB uses an excessive number of clones on the options value
		// this makes it impossible to hack before we pass it the PouchDB constructor
		// so instead we hack the headers value right after we set up, but
		// still synchronously with the constructor
		p.push(applyMode(this._auth_mode, "setup", CouchDB, [ this.getHeaders(), this ]));
	}

	CouchDB.prototype = Object.create(PouchAlt.prototype);
	CouchDB.prototype.constructor = CouchDB;
	assign(CouchDB, PouchAlt, methods);

	CouchDB.baseUrl = defaultOpts.baseUrl;
	CouchDB._auth_mode = getMode(defaultOpts.authmode);
	CouchDB.request = utils.makeRequest(defaultOpts.ajax);
	CouchDB.users = new CouchDB("_users");

	CouchDB.extend = extend;
	CouchDB.defaults = defaults;

	let p = [];
	p.push(applyMode(CouchDB._auth_mode, "setup", CouchDB, [ defaultOpts.ajax.headers ]));

	Promise.all(p).then(() => {
		if (callback) callback(null, CouchDB);
	}, (e) => process.nextTick(() => {
		if (callback) callback(e);

		// we don't want to auto-throw errors if something is going to catch it
		// but we still definitely want the error event to run
		if (!callback || this.listenerCount("error")) CouchDB.emit("error", e);
	}));

	return CouchDB;
}

function defaults(defaultOpts) {
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
