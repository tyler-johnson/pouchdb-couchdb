import {strip as stripUserIdPrefix} from "../utils/userid-prefix";

export var toBase64;
if (typeof global.btoa === "function") toBase64 = global.btoa;
else toBase64 = function(str) { return new Buffer(str, "utf-8").toString("base64"); };

function authHeader(auth) {
	if (auth) return "Basic " + toBase64((auth.name || "") + ":" + (auth.pass || ""));
}

export default function (CouchDB) {
	function setup(auth, headers) {
		let self = this;
		Object.defineProperty(headers, "Authorization", {
			get: function() {
				return authHeader(self._authorization);
			},
			enumerable: true,
			configurable: false
		});

		if (auth) return signIn.call(this, auth);
	}

	function signIn(payload) {
		this._authorization = {
			name: stripUserIdPrefix(payload.username || payload.name),
			pass: payload.password || payload.pass
		};

		return CouchDB.request({
			url: "/_session"
		}).then((res) => {
			return res.userCtx;
		});
	}

	function signOut() {
		delete this._authorization;
	}

	return { setup, signIn, signOut };
}
