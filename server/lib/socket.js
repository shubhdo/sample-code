/**********************************************************
 * Required libraries.
 *********************************************************/
const Server = require('http').Server;
const ioConstructor = require('socket.io');
let io;

/********************************************
 * This method creates socket server
 * @param {*} app This is express app object.
 *******************************************/
function socketInit(app) {
    let http = Server(app);
    io = ioConstructor(http);
    io.on('connection', (socket) => {

        let userId = socket.request._query.userId;
        socket.join(userId);
        socket.on('disconnect', function () {
            socket.leave(socket.request._query.userId);
        });
    });

    http.listen(process.env.SOCKET_PORT);
}

/** ********************************************************
 * This method provides socket to use in the application.
 *********************************************************/
socketInit.socket = function socket() {
    return io;
};

module.exports = socketInit;
