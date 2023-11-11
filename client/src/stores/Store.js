import { defineStore } from "pinia";
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import SocketioService from "../services/socketio.service";
import Redi from '../funtions/reid.funtion'

export const useStore = defineStore("store", {
    state: () => {
        return {
            statusMenu: "notSignIn",
            statusSidebar: "notSignIn",
            statusContent: "notSignIn",
            user: {
                '_id': '',
                'phone': '',
                'fullName': '',
                'avatar': '',
                'requestContact': [],
                'contacts': [],
                'chatRooms': [],
                'token': ''
            },
            currentChatRoom: {
                fullName: "",
                avatar: "",
                messages: [],
                _id: "",
                online: false
            },
            foundUserByPhone: {
                fullName: "",
                _id: "",
                avatar: "",
                phone: "",
                sentFriendRequest: false
            },
            notifyText: "",
            flag: 0
        }
    },
    actions: {
        setFoundUserByPhone(foundUserByPhone) {
            this.foundUserByPhone = foundUserByPhone;
        },
        showNotify(text) {
            this.flag = 1 - this.flag;
            this.notifyText = text;
        },
        clickContactMenu() {
            this.statusMenu = 'contacts'
            this.statusSidebar = 'contacts';
            this.statusContent = 'contacts';
            this.currentChatRoom = {
                fullName: "",
                avatar: "",
                messages: [],
                _id: "",
            }
        },
        clickChatMenu() {
            this.statusMenu = 'chat'
            this.statusSidebar = 'chat';
            this.statusContent = 'noChatSelected';
        },
        clickContactsSidebar() {
            this.statusMenu = 'contacts'
            this.statusSidebar = 'contacts';
            this.statusContent = 'contacts';
        },
        clickRequestContactSidebar() {
            this.statusMenu = 'contacts'
            this.statusSidebar = 'requestContact';
            this.statusContent = 'requestContact';
        },
        clickUpdateMenu() {
            this.statusMenu = 'update'
        },
        clickCloseUpdateMenu() {
            if (this.statusSidebar === 'chat') {
                this.statusMenu = 'chat'
            } else {
                this.statusMenu = 'contacts'
            }
        },
        signOut() {
            this.statusMenu = 'notSignIn'
            this.statusSidebar = 'notSignIn';
            this.statusContent = 'notSignIn';
            this.user = {
                '_id': '',
                'phone': '',
                'fullName': '',
                'avatar': '',
                'requestContact': [],
                'contacts': [],
                'chatRooms': [],
                'token': ''
            };
            this.currentChatRoom = {
                fullName: "",
                avatar: "",
                messages: [],
                _id: "",
            }
        },
        switchChatContent() {
            this.statusContent = 'chat';
        },
        setInfoUser(data) {
            this.user = data
            this.user.token = this.user.token.toString();
            localStorage.setItem('token', data.token);
        },
        changeOnlineStatus(roomID, online) {
            const length = this.user.chatRooms.length;
            if (roomID === this.currentChatRoom._id)
                this.currentChatRoom.online = online;

            for (let i = 0; i < length; i++) {
                if (this.user.chatRooms[i]._id === roomID) {
                    this.user.chatRooms[i].online = online;
                    break;
                }
            }
        },
        async reloadData() {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    SocketioService.disconnect();
                    const userUpdated = await AuthService.verifyToken({ token: token });
                    if (userUpdated) {
                        this.user = userUpdated.message;
                    }
                    SocketioService.setupSocketFriendConnection(this.user.token, this.user.phone);
                    SocketioService.receiveMessageFriend((err, data) => {
                        // console.log(data);
                        if (data.roomID === this.currentChatRoom._id) {
                            data.seen = true
                            this.currentChatRoom.messages.push(data);
                            SocketioService.seenAllMessage(this.currentChatRoom._id);
                            Redi.autoSrcollTop(".content_body");
                        }
                        this.user.chatRooms.forEach((chatRoom, index) => {
                            if (data.roomID === chatRoom._id) {
                                this.user.chatRooms[index].lastMessageDate = data.createAt;
                                this.user.chatRooms[index].lastMessage = data;
                                return
                            }
                        })
                    });

                }
            } catch (error) {
                console.log(error)
            }
        },
        setMessagesChatRoom(messages) {
            this.currentChatRoom.messages = messages;
            Redi.autoSrcollTop(".content_body");
        },
        updateMessages(roomId) {
            // console.log("updateMessages");
            if (this.currentChatRoom._id === roomId) {
                // console.log("updating Messages");
                this.currentChatRoom.messages.forEach(message => {
                    if (!message.seen) {
                        message.seen = true;
                    }
                })
            }
        },
        async updateInfo(data) {
            try {
                await UserService.updateInfo(data);
                this.user.fullName = data.fullName;
                this.user.avatar = data.avatar;
                this.showNotify("Cập nhật thông tin cơ bản thành công !");
            } catch (error) {
                console.log(error);
            }
        },

        async changePassword(data) {
            try {
                await UserService.changePassword(data);
                this.showNotify("Cập nhật mật khẩu thành công !");
            } catch (error) {
                this.showNotify(error.response.data.message)
            }
        }
    }
})