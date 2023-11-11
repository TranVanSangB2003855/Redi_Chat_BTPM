const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const redi = require("./app/function/rediFunct");
const USER = require("./app/models/user.model.js");
const CHATROOM = require("./app/models/chatRoom.model.js");
const MESSAGE = require("./app/models/message.model.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  cookieSession({
    name: "redi-session",
    secret: "COOKIE_SECRET",
    httpOnly: true
  })
);

app.get("/", (res, req) => {
  req.json({ message: "Welcome to Redi Chat App." });
})

require('./app/routes/auth.route')(app);
require('./app/routes/user.route')(app);
require('./app/routes/room.route')(app);

app.use((err, req, res, next) => {

  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const serverForUserChat = require('http').createServer(app);

const ioForUserChat = require("socket.io")(serverForUserChat, {
  cors: {
    origins: "*",
    credentials: true
  },
});

const config = require("./app/config/index");
let jwt = require("jsonwebtoken");

ioForUserChat.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log("ioForUserChat: ", token);
  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      return;
    }
    else {
      next();
    }
  });
});

ioForUserChat.on('connection', (socket) => {
  let userPhone;
  let user;
  let chatRooms;

  socket.on('sendUser', async data => {
    userPhone = data;
    user = await USER.findOne({ phone: userPhone });
    socket.join(userPhone.toString());
    console.log("User " + user.fullName + " đã kết nối");
    chatRooms = await CHATROOM.find({ owner: user });
    chatRooms.forEach(chatRoom => {
      socket.join(chatRoom._id.toString());
      let countUser = ioForUserChat.sockets.adapter.rooms.get(chatRoom._id.toString()).size;
      if (countUser > 1) {

        socket.to(chatRoom._id.toString()).emit('onlineStatus', {
          
          roomID: chatRoom._id.toString(),
          online: true
        });

        
        socket.emit('onlineStatus', {
          
          roomID: chatRoom._id.toString(),
          online: true
        });
      }
    });
  });

  
  
  socket.on('findUser', async targetPhone => {
    try {
      let target = await USER.findOne({ phone: targetPhone });
      console.log("findUser", targetPhone)
      if (target) {
        let sentFriendRequest = false;
        for (let i = 0; i < target.requestContact.length; i++) {
          if (target.requestContact[i]._id.toString() == user._id.toString()) {
            sentFriendRequest = true;
            console.log("sentFriendRequest", sentFriendRequest)
            break;
          }
        }
        socket.emit('foundUser', {
          _id: target._id,
          fullName: target.fullName,
          avatar: target.avatar,
          phone: target.phone,
          sentFriendRequest: sentFriendRequest
        });
      } else {
        socket.emit('message', 'Không tìm thấy tài khoản với số điện thoại này !');
      };
    } catch (error) {
      console.error(error);
    }
  });
  
  
  socket.on('sendFriendRequest', async targetPhone => {
    if (await USER.findOne({ phone: targetPhone, requestContact: user })) {
      socket.emit('message', 'Đã gửi lời mời kết bạn rồi !');
    } else {
      try {
        console.log("targetPhone", targetPhone);
        console.log("user", user);
        await USER.findOneAndUpdate(
          { phone: targetPhone },
          { $push: { requestContact: user } },
          { new: true }
        );
        socket.emit('message', 'Đã gửi lời mời kết bạn !');
        socket.to(targetPhone.toString()).emit('message', 'Có một lời mời kết bạn mới !');

      } catch (error) {
        console.error(error);
      }
    }
  });

  
  
  
  
  
  
  socket.on('actionFriendRequest', async data => {
    let target = await USER.findOne({ phone: data.phone });
    let accept = data.accept;
    console.log(data.phone)
    let check = await USER.findOne({ phone: user.phone, requestContact: { $in: [target] }, });
    if (check) {
      try {
        user = await USER.findOneAndUpdate(
          { phone: user.phone },
          { $pull: { requestContact: target._id } },
          { new: true }
        );

        if (accept) {
          user = await USER.findOneAndUpdate(
            { phone: user.phone },
            { $push: { contacts: target } },
            { new: true }
          );
          
          await USER.findByIdAndUpdate(
            target._id,
            { $push: { contacts: user } },
            { new: true }
          );

          
          try {
            const room = await CHATROOM.findOne({
              owner: { $all: [user, target] }
            }).populate('owner');

            if (room) {
              socket.emit('message', 'Phòng đã tồn tại !');
            } else {
              const chatRoom = new CHATROOM({
                message: [],
                owner: [user, target],
                createAt: redi.getTime(),
                lastMessageDate: redi.getTime(),
              });
              await chatRoom.save();
              setTimeout(() => {
                socket.emit('message', "Đã chấp nhận lời mời kết bạn của " + target.fullName + " ");
              }, 200);
              setTimeout(() => {
                socket.to(target.phone.toString()).emit("message", user.fullName + " đã chấp nhận lời mời kết bạn của bạn !")
              }, 350);
            }
          } catch (error) {
            console.error(error);
          };
        } else {
          socket.emit('message', "Đã từ chối lời mời kết bạn của " + target.fullName + " ");
        }

      } catch (error) {
        console.error(error);
      }
    } else {
      socket.emit('message', 'Người dùng không có trong danh sách kết bạn !');
    }
  });

  
  
  socket.on('deleteFriend', async targetPhone => {
    let target = await USER.findOne({ phone: targetPhone });
    if (await USER.findOne({ phone: user.phone, contacts: target })) {
      try {
        user = await USER.findOneAndUpdate(
          { phone: user.phone },
          { $pull: { contacts: target._id } },
          { new: true }
        );
        socket.emit('message', 'Đã xóa kết bạn với ' + target.fullName);
      } catch (error) {
        console.error(error);
      }
    } else {
      socket.emit('message', 'Không có người này trong danh bạ');
    }
  });

  
  socket.on('loadContentChatRoom', async roomId => {
    let messages = await MESSAGE.find({ chat: roomId });
    socket.emit('receiveContentChatRoom', messages)
  });

  
  socket.on('seenAllMessage', async roomId => {
    let messages = await MESSAGE.find({ $and: [{ chat: roomId }, { sender: { $ne: user._id } }] });
    messages.forEach(async message => {
      if (!message.seen) {
        await MESSAGE.findOneAndUpdate(
          { _id: message._id },
          { $set: { seen: true } },
          { new: true }
        );
      }
    })
    socket.to(roomId).emit('updateMessages', roomId);
  });

  
  
  
  
  
  
  
  socket.on('sendMessageFriend', async function (message, callback) {
    console.log(message)
    let currentRoom = await CHATROOM.findById(message.roomID);
    let createAt = redi.getTime()
    socket.to(currentRoom._id.toString()).emit('receiveMessageFriend', {
      ...message,
      sender: user._id,
      seen: false,
      createAt: createAt
    });

    if (typeof callback === 'function') {
      callback({
        "status": "ok",
        "createAt": createAt
      });
    }

    newMessage = new MESSAGE({
      content: message.content.toString(),
      sender: user,
      chat: currentRoom,
      createAt: createAt,
      seen: false,
      type: message.type.toString()
    });
    await newMessage.save();

    await CHATROOM.findOneAndUpdate(
      { _id: currentRoom._id },
      {
        $push: { message: newMessage },
        $set: { lastMessageDate: redi.getTime() }
      },
      { new: true }
    );
  })

  socket.on("disconnecting", (reason) => {
    console.log("[Socket Friend] ["+user.fullName+"] Bị ngắt kết nối do: "+reason);
  });

  
  socket.on('disconnect', async () => {
    try {
      console.log("User " + user.fullName + " đã ngắt kết nối");
      chatRooms.forEach(chatRoom => {
        socket.to(chatRoom._id.toString()).emit('onlineStatus', {
          
          roomID: chatRoom._id.toString(),
          online: false
        });
        socket.leave(chatRoom._id.toString());
      });
    } catch { };
    if (user) {
      try {
        await USER.findOneAndUpdate(
          { phone: userPhone },
          { $set: { lastAccess: redi.getTime() } },
          { new: true }
        );
      } catch (error) {
        console.error(error);
      }
    }
  });
})


serverForUserChat.listen(3002, () => {
  console.log('listening on *:3002');
});

module.exports = app