module.exports = senecaCrud;

function senecaCrud(seneca, role, options) {
	options = options || {};

	if (typeof(options.list) === 'function') {
		seneca.add({
			role: role,
			cmd: 'list',
		}, options.list);
	}

	if (typeof(options.save) === 'function') {
		seneca.add({
			role: role,
			cmd: 'save',
		}, options.save);
	}

	if (typeof(options.get) === 'function') {
		seneca.add({
			role: role,
			cmd: 'get',
		}, options.get);
	}

	if (typeof(options.delete) === 'function') {
		seneca.add({
			role: role,
			cmd: 'delete',
		}, options.delete);
	}
}
