const seneca = require('seneca')();

module.exports = hapiSeneca;

function hapiSeneca(server, role) {
	server.route({
		method: 'POST',
		path: '/' + role,
		handler: function save(request, reply) {
			if (!request.payload) {
				reply().code(400);
				return;
			}
			seneca.act({
				role: role,
				cmd: 'save',
				model: request.payload.model,
				options: {},
			},
			function savedResponse(err, res) {
				if (err) {
					reply(null, err).code(400);
				}
				else {
					reply(null, res);
				}
			});
		},
	});

	server.route({
		method: 'GET',
		path: '/' + role,
		handler: function list(request, reply) {
			seneca.act({role: role, cmd: 'list'},
			function statusResponse(err, res) {
				reply({result: err ? 'error' : res, err: err});
			});
		},
	});

	server.route({
		method: 'GET',
		path: '/' + role + '/{id}',
		handler: function getApp(request, reply) {
			seneca.act({role: role, cmd: 'get', _id: request.params.id},
			function statusResponse(err, res) {
				reply({result: err ? 'error' : res, err: err});
			});
		},
	});

	server.route({
		method: 'DELETE',
		path: '/' + role + '/{id}',
		handler: function deleteModel(request, reply) {
			seneca.act({role: role, cmd: 'delete', _id: request.params.id},
			function statusResponse(err, res) {
				reply({result: err ? 'error' : res, err: err});
			});
		},
	});
}
