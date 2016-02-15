var toBase64;
if (typeof global.btoa === "function") toBase64 = global.btoa;
else toBase64 = function(str) { return new Buffer(str, "utf-8").toString("base64"); };

export default function authHeader(auth) {
	if (auth) {
		let name = auth.username || auth.name;
		let pass = auth.password || auth.pass;
		return "Basic " + toBase64((name || "") + ":" + (pass || ""));
	}
}
