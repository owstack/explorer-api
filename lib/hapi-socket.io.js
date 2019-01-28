const pkg = require('../package.json');
const SocketIO = require('socket.io');

module.exports.plugin = {
    name: `${pkg.name}-socket.io`,
    version: pkg.version,
    register: async function (server) {
        server.app.io = SocketIO(server.listener);
        server.app.io.on('connection', function (socket) {
            console.log('socket connected', socket.id);
            socket.on('subscribe', function (room) {
                socket.join(room);
            });

            socket.on('unsubscribe', function (room) {
                socket.leave(room);
            });
        });
    }
};
