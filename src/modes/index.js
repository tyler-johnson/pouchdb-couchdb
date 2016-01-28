import * as basic from "./basic";

const modes = {};

export function register(name, methods) {
	modes[name] = methods;
}

export function get(name) {
	let mode = modes[name];
	if (!mode) throw new Error(`Unknown auth mode '${name}'.`);
	return mode;
}

export function apply(mode, name, ctx, args) {
	if (typeof mode === "string") mode = get(mode);
	return mode[name].apply(ctx, args);
}

register("basic", basic);
