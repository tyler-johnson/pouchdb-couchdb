import {utils as PouchDBUtils} from "pouchdb";

// taken from https://github.com/pouchdb/pouchdb/blob/c9143d64dbdd381bf969bd5066d0cee6a4c2fcf7/lib/adapters/http/index.js#L77-L99
// Get all the information you possibly can about the URI given by name and
// return it as a suitable object.
export function getHost(name) {
	// Prase the URI into all its little bits
	var uri = PouchDBUtils.parseUri(name);

	// Store the user and password as a separate auth object
	if (uri.user || uri.password) {
		uri.auth = {username: uri.user, password: uri.password};
	}

	// Split the path part of the URI into parts using '/' as the delimiter
	// after removing any leading '/' and any trailing '/'
	var parts = uri.path.replace(/(^\/|\/$)/g, '').split('/');

	// Store the first part as the database name and remove it from the parts
	// array
	uri.db = parts.pop();

	// Restore the path by joining all the remaining parts (all the parts
	// except for the database name) with '/'s
	uri.path = parts.join('/');

	return uri;
}

export function prefixHost(baseUrl) {
	if (!baseUrl) baseUrl = "/";
	if (baseUrl.substr(-1) !== "/") baseUrl += "/";

	return function(name, opts) {
		if (!/^https?:\/\//.test(name)) {
			if (!opts.encoded_name) name = encodeURIComponent(name);
			name = baseUrl + name;
		}
		return getHost(name, opts);
	};
}
