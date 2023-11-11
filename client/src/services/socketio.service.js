import { io } from 'socket.io-client';
import { useStore } from '../stores/Store';

class SocketioService {
  socketStranger;
  socketFriend;
  chatRoom ='';

  setupSocketFriendConnection(token, phone) {
    this.socketFriend = io(process.env.VUE_APP_SOCKET_ENDPOINT_CHAT_WITH_FRIEND, {
      auth: {
        token,
      },
    });
    
    console.log(`Connecting socket friend...`);
    // console.log(`socketFriend`, this.socketFriend);
    this.socketFriend.on('onlineStatus', data => {
      useStore().changeOnlineStatus(data.roomID, data.online);
    })

    this.socketFriend.emit('sendUser', phone)

    this.socketFriend.on('message',data => {
      useStore().reloadData();
      useStore().showNotify(data);
      // console.log("message",data);
    })

    this.socketFriend.on('updateMessages', (roomId) => {
      useStore().updateMessages(roomId);
    });

    this.socketFriend.on('receiveContentChatRoom', (messages) => {
      // console.log(messages);
      // lưu data vào Pinia
      useStore().setMessagesChatRoom(messages);
    });

    this.socketFriend.on("disconnect", (reason) => {
      if (reason === "transport close" || reason === "ping timeout" || reason === "transport error") {
        // the disconnection was initiated by the server, you need to reconnect manually
        console.log("[Socket Friend]Bị mất kết nối do: "+reason);
        useStore().reloadData();
      }
      // else the socket will automatically try to reconnect
    });
  }

  loadContentChatRoom(roomID){
    this.socketFriend.emit("loadContentChatRoom", roomID)
  }

  findUserByPhone(phone){
    this.socketFriend.emit('findUser',phone);
    this.socketFriend.on('foundUser', data => {
      // console.log('foundUser',data)
      useStore().setFoundUserByPhone(data);
    })
  }

  actionFriendRequest(data){
    this.socketFriend.emit('actionFriendRequest', data);
  }

  sendFriendRequest(data){
    this.socketFriend.emit('sendFriendRequest',data);
  }

  receiveMessageFriend(cb){
    if(!this.socketFriend) return true;
    // console.log("receiveMessageFriend")
    this.socketFriend.on("receiveMessageFriend", data => {
      return cb(null, data);
    })
  }

  sendMessageFriend(message, cb) {
    // console.log(message);
    if(this.socketFriend) this.socketFriend.emit('sendMessageFriend',message,cb);
  }

  seenAllMessage(roomId){
    // console.log("seenAllMessage")
    if(this.socketFriend) this.socketFriend.emit('seenAllMessage',roomId);
  }

  disconnect() {
    if(this.socketFriend) {
      this.socketFriend.disconnect();
    }
  }

  setupSocketStrangerConnection() {
    this.socketStranger = io(process.env.VUE_APP_SOCKET_ENDPOINT_CHAT_WITH_STRANGER);
    console.log(`Connecting socket stranger...`);

    this.socketStranger.on("disconnect", (reason) => {
      if (reason === "ping timeout" || reason === "transport error" || reason === "transport close") {
        // the disconnection was initiated by the server, you need to reconnect manually
        console.log("[Socket Stranger]Bị mất kết nối do: "+reason);
        alert("Phòng nhắn tin bị đóng do internet không ổn định !")
        this.socketStranger.disconnect();
      }
      // else the socket will automatically try to reconnect
    });
  }

  receiveMessageStranger(cb){
    if(!this.socketStranger) return true;
    this.socketStranger.on("receiveMessageStranger", data => {
      return cb(null, {
        ...data,
        name: "Người lạ",
      });
    })
  }

  statusRoomStranger(cb){
    if(!this.socketStranger) return true;
    this.socketStranger.on("statusRoomStranger", message => {
      return cb(null, {...message, name: "Bot"});
    })
  }

  nextRoomStranger(chatRoom){
      this.socketStranger.emit("nextRoomStranger",chatRoom);
    // console.log("id",this.socketStranger.id);
  }

  sendMessageStranger(message, cb) {
    if(this.socketStranger) this.socketStranger.emit('sendMessageStranger',message,cb);
  }
  
  disconnectStranger() {
    if(this.socketStranger) {
      this.socketStranger.disconnect();
    }
  }
}

export default new SocketioService();