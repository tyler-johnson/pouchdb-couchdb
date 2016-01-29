import {pick,omit,clone,assign} from "lodash";
import PouchDB from "pouchdb";
import * as methods from "./methods";
import {get as getMode} from "./modes/index.js";
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
	defaultOpts = utils.parseOptions(defaultOpts, {
		authmode: "basic",
		ajax: { headers: {} }
	});

	let auth = defaultOpts.auth;
	delete defaultOpts.auth;

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

		opts = assign({}, defaultOpts, opts);
		opts.adapter = "http";
		if (!opts.getHost) opts.getHost = utils.prefixHost(opts.baseUrl);

		if (typeof callback !== "function") callback = (e)=>{ if (e) throw e; };
		this._auth_mode = CouchDB._auth_mode;
		let p = [];

		if (opts.authmode !== defaultOpts.authmode || opts.auth) {
			this._auth_mode = getMode(opts.authmode || defaultOpts.authmode, CouchDB);
		}

		PouchDB.call(this, name, omit(opts, "authmode", "auth"), function(err, res) {
			if (err) return callback(err);
			utils.callbackify(Promise.all(p), (e) => callback(e, res));
		});

		// PouchDB uses an excessive number of clones on the options value
		// this makes it impossible to hack before we pass it the PouchDB constructor
		// so instead we hack the headers value right after we set up, but
		// still synchronously with the constructor
		if (this._auth_mode !== CouchDB._auth_mode) {
			assign(this, pick(methods, "_applyModeMethod", "signIn", "signOut"));
			p.push(this._applyModeMethod("setup", [ opts.auth, this.getHeaders() ]));
		}
	}

	CouchDB.prototype = Object.create(PouchAlt.prototype);
	CouchDB.prototype.constructor = CouchDB;
	assign(CouchDB, PouchAlt, methods);

	CouchDB.baseUrl = defaultOpts.baseUrl;
	CouchDB._auth_mode = getMode(defaultOpts.authmode, CouchDB);
	CouchDB.request = utils.makeRequest(defaultOpts.ajax);
	CouchDB.users = new CouchDB("_users");

	CouchDB.extend = extend;
	CouchDB.defaults = defaults;

	let p = [];
	p.push(CouchDB._applyModeMethod("setup", [ auth, defaultOpts.ajax.headers ]));

	Promise.all(p).then(() => {
		if (callback) callback(null, CouchDB);
	}, (e) => {
		if (callback) callback(e);
		throw e;
	}).catch((e) => process.nextTick(() => {
		// we don't want to auto-throw errors if something is going to catch it
		// but we still definitely want the error event to run
		if (!callback || CouchDB.listenerCount("error")) CouchDB.emit("error", e);
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
