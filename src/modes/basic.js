import {strip as stripUserIdPrefix} from "../utils/userid-prefix";
import authHeader from "../utils/basic-auth-header";

export default function basicAuth(CouchDB) {
	function setup(auth, headers) {
		let self = this;
		Object.defineProperty(headers, "Authorization", {
			get: function() {
				return authHeader(self._authorization);
			},
			enumerable: true,
			configurable: false
		});

		return signIn.call(this, auth);
	}

	function signIn(payload) {
		this._authorization = payload ? {
			name: stripUserIdPrefix(payload.username || payload.name),
			pass: payload.password || payload.pass
		} : null;

		return CouchDB.getSession();
	}

	function signOut() {
		delete this._authorization;
	}

	return { setup, signIn, signOut };
}

basicAuth.authHeader = authHeader;
