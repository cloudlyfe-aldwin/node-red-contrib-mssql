module.exports = function (RED) {
    var sql = require('mssql');

    function connection(n) {
        RED.nodes.createNode(this, n);
        const node = this;
        this.config = {
            user: node.credentials.username,
            password: node.credentials.password,
            domain: node.credentials.domain,
            server: n.server,
            database: n.database,
            options: {
                trustedConnection: n.integrated,
                encrypt: n.encryption,
                useUTC: n.useUTC
            }
        };
        if (n.integrated)
            sql = require('mssql/msnodesqlv8');
        this.connection = sql;
    }

    RED.nodes.registerType('MSSQL-CN', connection, {
        credentials: {
            username: { type: 'text' },
            password: { type: 'password' },
            domain: { type: 'text' }
        }
    });
};