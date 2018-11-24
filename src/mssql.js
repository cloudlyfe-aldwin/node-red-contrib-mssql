module.exports = function (RED) {
    var mustache = require('mustache');

    function mssql(n) {
        RED.nodes.createNode(this, n);
        this.mssqlCN = RED.nodes.getNode(n.mssqlCN);
        this.query = n.query;
        this.outField = n.outField;
        var node = this;

        node.sqlerror = false;
        node.debug = n.debug;
        node.status({});

        if (this.mssqlCN != null) {
            const config = node.mssqlCN.config;
            node.pool = new node.mssqlCN.connection.ConnectionPool(config);
            node.pool.connect(err => {
                if (err) {
                    node.error(`Error connecting to server ${err}`);
                    if (node.debug) {
                        node.log('SQL config:');
                        console.log(config);
                        node.log('Error:');
                        console.log(err);
                    }
                    node.status({ fill: 'red', shape: 'ring', text: 'Error connecting to server' });
                }
                else {
                    node.status({ fill: 'green', shape: 'dot', text: 'Connected' });
                }
            });
            node.pool.on('error', function (err) {
                node.error(`Connection pool error${err}`);
                if (node.debug) {
                    node.log('Error:');
                    console.log(err);
                }
                node.status({ fill: 'red', shape: 'ring', text: 'Connection pool error' });
            });
            this.on('input', function (msg) {
                let query = mustache.render(node.query, msg);
                if (!query || (0 === query.length))
                    query = msg.payload;

                const request = node.pool.request();
                node.status({ fill: 'green', shape: 'dot', text: 'querying' });
                request.query(query)
                    .then(result => {
                        if (node.debug) {
                            node.log('RecordSet');
                            console.log(result);
                        }
                        msg.payload = result;
                        node.send(msg);
                        node.status({ fill: 'green', shape: 'dot', text: 'Connected' });
                        return result;
                    }).catch(function (err) {
                        node.error(`Error executing query ${err}`, msg);
                        if (node.debug) {
                            node.log('Error:');
                            console.log(err);
                        }
                        node.status({ fill: 'red', shape: 'dot', text: 'Error executing query' });
                    });
            });
        }
    }

    RED.nodes.registerType('MSSQL', mssql);
};
