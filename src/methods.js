import {isEqual,omit,clone} from "lodash";
import {add as addUserIdPrefix} from "./utils/userid-prefix.js";

export function allDbs(opts, cb) {
	if (typeof opts === "function") [cb,opts] = [opts,null];
	return this.request({ url: "/_all_dbs" }, cb);
}

const emptySession = { name: null, roles: [] };

function updateSession(Pouch, sess) {
	let prev = Pouch._auth_session || emptySession;
	sess = Pouch._auth_session = sess || clone(emptySession);
	if (!isEqual(sess, prev)) {
		if (sess) Pouch.emit("signin", sess);
		else Pouch.emit("signout", prev);
	}
	return sess;
}

export function _applyModeMethod(name, args) {
	return Promise.resolve().then(() => {
		return this._auth_mode[name].apply(this, args);
	}).then((res) => updateSession(this, res));
}

export function signIn() {
	return this._applyModeMethod("signIn", arguments);
}

export function signOut() {
	return this._applyModeMethod("signOut", arguments);
}

export function signUp(user) {
	if (user == null) user = {};

	if (typeof user.name !== "string" || user.name === "") {
		throw new Error("Missing or invalid user name.");
	}

	// appease couchdb
	user = clone(user);
	user._id = addUserIdPrefix(user.name);
	user.roles = [].concat(user.roles).filter(Boolean);
	user.type = "user";

	// verify password
	if (typeof user.password !== "string" || user.password === "") {
		throw new Error("Missing or invalid password.");
	}

	// create the user
	return this.users.put(user).then((res) => {
		user._rev = res.rev;
		return user;
	});
}

export function getSession() {
	return this.request({ url: "/_session" }).then(function(res) {
		return res.userCtx;
	});
}

export function refreshSession() {
	return this.getSession().then((sess) => {
		updateSession(this, sess);
		return this.session();
	});
}

export function signedIn() {
	return Boolean(this.session().name);
}

export function session() {
	return this._auth_session || clone(emptySession);
}

export function getUser(name) {
	if (typeof name === "object" && name != null) {
		name = name.name;
	}

	if (!name) return null;

	return this.users.get(addUserIdPrefix(name)).catch(function(e) {
		if (e.status !== 404) throw e;
		return null;
	});
}

export function currentUser() {
	return this.getUser(this.session());
}

export function changePassword(user, pass) {
	if (typeof pass !== "string" || pass === "") {
		throw new Error("Invalid password.");
	}

	user = omit(user, "derived_key", "iterations", "password_scheme", "salt");
	user.password = pass;
	return user;
}

export function configure(config) {
	if (typeof config !== "object" || config == null) {
		throw new Error("Expecting object for configuration.");
	}

	return Promise.all(Object.keys(config).map((section_key) => {
		let section = config[section_key];
		return Promise.all(Object.keys(section).map((key) => {
			return this.request({
				url: "_config/" + section_key + "/" + key,
				method: "PUT",
				body: section[key] != null ? section[key].toString() : null
			});
		}));
	}));
}
