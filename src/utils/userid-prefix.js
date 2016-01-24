var idPrefix = "org.couchdb.user:";

export function add(name) {
	if (typeof name !== "string" || name === "") throw new Error("Invalid username.");
	if (name.substr(0, idPrefix.length) !== idPrefix) name = idPrefix + name;
	return name;
}

export function strip(name) {
	if (typeof name !== "string" || name === "") throw new Error("Invalid username.");
	if (name.substr(0, idPrefix.length) === idPrefix) name = name.substr(idPrefix.length);
	return name;
}
