const MongoCrud = require('./mongo');
const seneca = require('./seneca');
const hapiSeneca = require('./hapiSeneca');

module.exports.Mongo = MongoCrud;
module.exports.seneca = seneca;
module.exports.hapiSeneca = hapiSeneca;
