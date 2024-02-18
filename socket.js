const { Server } = require("socket.io");
let IO;

module.exports.initIO = (httpServer) => {
  try {
    IO = new Server(httpServer);

    IO.use((socket, next) => {
      if (socket.handshake.query) {
        let callerId = socket.handshake.query.callerId;
        console.log('callerId:', callerId);
        socket.user = callerId;
        next();
      }
    });

    IO.on("connection", (socket) => {
      console.log(`${socket.user} connected`);
      socket.join(socket.user);

      socket.on("call", (data) => {
        let calleeId = data.calleeId;
        let rtcMessage = data.rtcMessage;

        socket.to(calleeId).emit("newCall", {
          callerId: socket.user,
          rtcMessage: rtcMessage,
        });
      });

      socket.on("answerCall", (data) => {
        let callerId = data.callerId;
        rtcMessage = data.rtcMessage;

        socket.to(callerId).emit("callAnswered", {
          callee: socket.user,
          rtcMessage: rtcMessage,
        });
      });

      socket.on("ICEcandidate", (data) => {
        console.log(`ICE Candidate from ${socket.user} to ${data.calleeId}`);
        let calleeId = data.calleeId;
        let rtcMessage = data.rtcMessage;

        socket.to(calleeId).emit("ICEcandidate", {
          sender: socket.user,
          rtcMessage: rtcMessage,
        });
      });

      socket.on("disconnect", () => {
        console.log(`${socket.user} disconnected`);
        socket.leave(socket.user);
      });
    });

    console.log("Socket.IO server initialized successfully.");
  } catch (error) {
    console.error("Error initializing Socket.IO server:", error.message);
  }
};

module.exports.getIO = () => {
  if (!IO) {
    throw Error("IO not initialized.");
  } else {
    return IO;
}};