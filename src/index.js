import {omit,clone,assign} from "lodash";
import PouchDB from "pouchdb";
import * as methods from "./methods";
import {get as getMode} from "./modes/index.js";
import * as utils from "./utils/index.js";

// fixes http adapter's need to use the prefix value
PouchDB.adapters.http.use_prefix = false;

export default function(baseUrl, defaultOpts, callback) {
	if (typeof baseUrl === "object") {
		[callback,defaultOpts,baseUrl] = [defaultOpts,baseUrl,void 0];
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

		if (typeof callback !== "function") callback = (e)=>{ throw e; };
		this._auth_mode = CouchDB._auth_mode;
		let modeobj = CouchDB;

		if (opts.authmode !== defaultOpts.authmode || opts.auth) {
			if (!opts.auth) return callback(new Error("Missing auth with custom authmode."));
			this._auth_mode = getMode(opts.authmode || defaultOpts.authmode);
			modeobj = this;
			let signinPromise;

			PouchDB.call(this, name, opts, function(err, res) {
				if (err) return callback(err);
				utils.callbackify(signinPromise, (e) => callback(e, res));
			});

			signinPromise = Promise.resolve().then(() => {
				return this._auth_mode.signIn.call(this, opts.auth);
			});
		} else {
			// call Pouchdb constructor directly
			PouchDB.call(this, name, opts, callback);
		}

		// PouchDB uses an excessive number of clones on the options value
		// this makes it impossible to hack before we pass it the PouchDB constructor
		// so instead we hack the headers value right after we set up
		this._auth_mode.setup.call(modeobj, this.getHeaders());
	}

	CouchDB.prototype = Object.create(PouchAlt.prototype);
	CouchDB.prototype.constructor = CouchDB;
	assign(CouchDB, PouchAlt, methods);

	CouchDB.baseUrl = defaultOpts.baseUrl;
	CouchDB._auth_mode = getMode(defaultOpts.authmode);
	CouchDB._auth_mode.setup.call(CouchDB, defaultOpts.ajax.headers);
	CouchDB.request = utils.makeRequest(defaultOpts.ajax);
	CouchDB.users = new CouchDB("_users");

	let done = (err) => {
		if (callback) callback(err, CouchDB);
	};

	if (defaultOpts.auth) {
		utils.callbackify(CouchDB.signIn(defaultOpts.auth).catch((e) => {
			CouchDB.emit("error", e);
			throw e;
		}), done);
	} else if (callback) {
		process.nextTick(done);
	}

	return CouchDB;
}
