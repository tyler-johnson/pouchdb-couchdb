import {has} from "lodash";
import basic from "./basic";

const modes = {};

export function register(name, fn) {
	modes[name] = fn;
}

export function get(name, CouchDB) {
	if (!has(modes, name)) throw new Error(`Unknown auth mode '${name}'.`);
	return modes[name](CouchDB);
}

register("basic", basic);
