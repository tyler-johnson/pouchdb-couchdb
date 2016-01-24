import {add as addUserIdPrefix, strip as stripUserIdPrefix} from "./userid-prefix.js";
import makeRequest from "./request.js";
import parseOptions from "./parse-options.js";
import callbackify from "./callbackify.js";
import {getHost,prefixHost} from "./get-host.js";

export {
	makeRequest,
	getHost,
	prefixHost,
	parseOptions,
	addUserIdPrefix,
	stripUserIdPrefix,
	callbackify
};
