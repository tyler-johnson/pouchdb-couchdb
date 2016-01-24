

export default function callbackify(promise, cb) {
	if (typeof cb === "function") {
		promise.then(function(res) {
			cb(null, res);
		}, function(err) {
			cb(err);
		});
	}

	return promise;
}
