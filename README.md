# PouchDB CouchDB

[![npm](https://img.shields.io/npm/v/pouchdb-couchdb.svg)](https://www.npmjs.com/package/pouchdb-couchdb) [![David](https://img.shields.io/david/tyler-johnson/pouchdb-couchdb.svg)](https://david-dm.org/tyler-johnson/pouchdb-couchdb) [![Build Status](https://travis-ci.org/tyler-johnson/pouchdb-couchdb.svg?branch=master)](https://travis-ci.org/tyler-johnson/pouchdb-couchdb)

This is some sugar for PouchDB to make handling true CouchDB servers a little easier.

- Set a base url for all databases.
- Maintains instance-level authorization for all databases, with support for basic auth and cookies.
- Change authentication at any point, ensuring that all existing databases switch as well.
- Configure CouchDB.

## Install

Grab a copy from NPM:

```bash
npm install pouchdb-couchdb --save
```

## Usage

PouchDB traditionally returns a class to create databases from. PouchDB-CouchDB on the other hand returns a function to create those classes so that a base url and default options can be passed in.

```js
var CouchDB = require("pouchdb-couchdb")("http://localhost:5984");
var db = new CouchDB("mydb");
```

For reference, here's how the same code would be accomplished using pure PouchDB. Keep in mind that this would need to be repeated for *every* database.

```js
var PouchDB = require("pouchdb");
var db = new PouchDB("http://localhost:5984/mydb");
```

You have your class sign in and out of the database with the `signIn()` and `signOut()` methods. This will ensure the same authentication is applied for all databases created with this class.

```js
CouchDB.signIn("user","password").then(function() {
  console.log("signed in!");

  return CouchDB.signOut();
}).then(function() {
  console.log("signed out!");
});
```
