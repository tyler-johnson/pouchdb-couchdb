import {assign} from "lodash";
import {parse} from "url";
import {utils as PouchDBUtils} from "pouchdb";
import promisify from "es6-promisify";
import callbackify from "./callbackify";

const ajax = promisify(PouchDBUtils.ajax);

export default function(defaultOpts) {
	return function(opts, cb) {
		opts = assign({}, opts, defaultOpts);
		let uri = parse(opts.url, false, true);
		if (!uri.host) {
			let baseUrl = this.baseUrl;
			if (baseUrl.substr(-1) !== "/") baseUrl += "/";
			if (opts.url[0] === "/") opts.url = opts.url.substr(1);
			opts.url = baseUrl + opts.url;
		}

		return callbackify(ajax(opts).then(r => opts.full ? r[1] : r[0]), cb);
	};
}
