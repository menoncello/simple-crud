const MongoClient = require('mongodb').MongoClient;
const uuidV4 = require('uuid/v4');

module.exports = MongoCrud;

function MongoCrud(url, collection, options) {
	if (!(this instanceof MongoCrud)) {
		return new MongoCrud(url, collection, options);
	}
	const crud = this;

	crud.url = url;
	crud.collection = collection;
	crud.options = options || {};

	crud.save = save;
	crud.delete = remove;
	crud.get = get;
	crud.list = list;

	crud.authorize = authorize;

	function authorize(method, object, user, callback) {
		if (!(typeof(crud.options.authorize) === 'function')) {
			callback(null, true);
			return;
		}

		crud.options.authorize(crud.collection, method, object, user, callback);
	}

	function save(object, user, callback) {
		crud.authorize('save', object, user, function authorized(err, passed) {
			if (err) {
				callback(err);
				return;
			}

			if (!passed) {
				callback({
					msg: 'not authorized',
				});
				return;
			}

			if (object.model._id) {
				update(object, callback);
			}
			else {
				create(object, callback);
			}
		});
	}

	function create(object, user, callback) {
		crud.authorize('save', object, user, function authorized(err, passed) {
			if (err) {
				callback(err);
				return;
			}

			if (!passed) {
				callback({
					msg: 'not authorized',
				});
				return;
			}

			const model = object.model;
			model._id = (crud.options.idPrefix ? crud.options.idPrefix + '-' : '') + uuidV4();
			if (typeof(crud.options.createValidation) === 'function') {
				crud.options.createValidation(model, validated);
			}
			else {
				validated();
			}

			function validated(errValidation, inconsistencies) {
				if (errValidation) {
					callback(errValidation);
					return;
				}

				if (!inconsistencies || inconsistencies.length === 0) {
					MongoClient.connect(crud.url, function listConnected(connectErr, db) {
						if (connectErr) {
							callback(connectErr);
							return;
						}

						db.collection(crud.collection).insertOne(model, {}, function inserted(dbErr) {
							if (dbErr) {
								callback(dbErr);
								return;
							}
							callback(null, {
								response: true,
								savedId: model._id,
							});
						});
					});
				}
				else {
					callback(null, {
						response: false,
						inconsistencies: inconsistencies,
					});
				}
			}
		});
	}

	function update(object, user, callback) {
		crud.authorize('update', object, user, function authorized(err, passed) {
			if (err) {
				callback(err);
				return;
			}

			if (!passed) {
				callback({
					msg: 'not authorized',
				});
				return;
			}

			const model = object.model;

			if (typeof(crud.options.updateValidation) === 'function') {
				crud.options.updateValidation(model, validated);
			}
			else {
				validated();
			}

			function validated(errValidation, inconsistencies) {
				if (errValidation) {
					callback(errValidation);
					return;
				}

				if (!inconsistencies || inconsistencies.length === 0) {
					MongoClient.connect(crud.url, function listConnected(connectErr, db) {
						if (connectErr) {
							callback(connectErr);
							return;
						}

						db.collection(crud.collection).updateOne({
							_id: model._id,
						}, model, function inserted(dbErr, dbRes) {
							if (dbErr) {
								callback(dbErr);
								return;
							}
							callback(null, {
								response: dbRes.result.n === 1,
							});
						});
					});
				}
				else {
					callback(null, {
						response: false,
						inconsistencies: inconsistencies,
					});
				}
			}
		});
	}

	function remove(object, user, callback) {
		crud.authorize('delete', object, user, function authorized(err, passed) {
			if (err) {
				callback(err);
				return;
			}

			if (!passed) {
				callback({
					msg: 'not authorized',
				});
				return;
			}

			const id = object._id;

			if (typeof(crud.options.updateValidation) === 'function') {
				crud.options.deleteValidation(id, validated);
			}
			else {
				validated();
			}

			function validated(errValidation, inconsistencies) {
				if (errValidation) {
					callback(errValidation);
					return;
				}

				if (!inconsistencies || inconsistencies.length === 0) {
					MongoClient.connect(crud.url, function listConnected(connectErr, db) {
						if (connectErr) {
							callback(connectErr);
							return;
						}

						db.collection(crud.collection).deleteOne({
							_id: id,
						}, function deleted(dbErr, dbRes) {
							if (dbErr) {
								callback(dbErr);
								return;
							}
							callback(null, {
								response: dbRes.result.n === 1,
							});
						});
					});
				}
				else {
					callback(null, {
						response: false,
						inconsistencies: inconsistencies,
					});
				}
			}
		});
	}

	function get(object, user, callback) {
		list({filter: {_id: object._id}}, user, function got(err, docs) {
			if (err) {
				callback(err);
				return;
			}

			if (!docs || docs.length === 0) {
				callback();
			}
			else {
				callback(null, docs[0]);
			}
		});
	}

	function list(object, user, callback) {
		crud.authorize('save', object, user, function authorized(err, passed) {
			if (err) {
				callback(err);
				return;
			}

			if (!passed) {
				callback({
					msg: 'not authorized',
				});
				return;
			}

			const filter = object.filter;
			MongoClient.connect(crud.url, function listConnected(errDB, db) {
				if (errDB) {
					callback(errDB);
					return;
				}

				db.collection(crud.collection).find(filter).toArray(function appFound(dbErr, docs) {
					if (dbErr) {
						callback(dbErr);
						return;
					}

					callback(null, docs);
					db.close();
				});
			});
		});
	}
}
