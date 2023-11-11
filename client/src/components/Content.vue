<template>
    <div class="content" v-if="statusContent === 'chat'">
        <div class="content_header">
            <img class="content_header-img" :src="this.currentChatRoom.avatar" alt="" />
            <span>
                <i class="fa-solid fa-circle" v-if="this.currentChatRoom.online"></i>
            </span>
            <div class="content_header-title">
                <h1> {{ this.currentChatRoom.fullNameFriend }}</h1>
            </div>
        </div>
        <div class="content_body">
            <div class="chat-box">
                <template v-for="(message, index) in this.messages" :key="index">
                    <div>
                        <div class="mess-incoming" v-if="message.sender !== this.user._id">
                            <div class="mess-avatar">
                                <img :src="this.currentChatRoom.avatar" alt="" />
                            </div>
                            <div class="details" v-if="message.type === 'text'">
                                <div class="mess-text">
                                    <div class="mess-name">{{ this.currentChatRoom.fullNameFriend }}</div>
                                    {{ message.content }}
                                    <div class="mess-time"><br />{{ formatTime(message.createAt) }}</div>
                                </div>
                            </div>
                            <div class="mess-img" v-else-if="message.type === 'image'" style="margin-bottom: 10px;">
                                <img :src=message.content alt="" />
                            </div>
                        </div>

                        <div class="mess-outgoing" v-else>
                            <div class="mess-text" v-if="message.type === 'text'"
                                :title="[(message.seen) ? 'Đã xem' : 'Đã gửi']">
                                {{ message.content }}
                                <div class="mess-time"><br />{{ formatTime(message.createAt) }}</div>
                            </div>
                            <div class="mess-img" v-else-if="message.type === 'image'" style="margin-bottom: 10px;"
                                :title="[(message.seen) ? 'Đã xem' : 'Đã gửi']">
                                <img :src=message.content alt="" />
                            </div>
                        </div>
                        <div v-if="(index === this.lastSeenMessage)" class="mess-seen">
                            <img :src="this.currentChatRoom.avatar" alt="" />
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <div class="chat-footer">
            <div class="chat-footer">
                <button @click="openUploadModal()">
                    <i class="fa-solid fa-image"></i>
                </button>
                <form class="" @submit.prevent="sendMessageFriend('text')">
                    <input type="text" placeholder="Nhập vào nội dung bạn muốn nhắn...." v-model="inputMessageText" />
                    <button type="submit">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </div>
    </div>

    <div class="content" v-if="statusContent === 'chatWithStranger'">
        <div class="content_header">
            <img class="content_header-img" src="../assets/avatar-stranger.png" alt="" />
            <div class="content_header-title">
                <h1>Người lạ</h1>
            </div>
            <div class="content_header-right ">
                <button id="btn-newChat" style="margin-right: 15px;" @click="connectSocketStranger()">
                    <i class="fa-solid fa-comment-medical"></i> Phòng nhắn tin mới
                </button>
                <button id="btn-stopChat" @click="stopChatStranger()">
                    <i class="fa-solid fa-comment-slash"></i> Kết thúc
                </button>
            </div>
        </div>
        <div class="content_body">
            <div class="chat-box">
                <template v-for="(message, index) in messagesChatWithStranger" :key="index">
                    <div>
                        <div class="mess-incoming" v-if="message.name === 'Người lạ'">
                            <div class="mess-avatar">
                                <img src="../assets/avatar-stranger.png" alt="" />
                            </div>
                            <div class="details" v-if="message.type === 'text'">
                                <div class="mess-text">
                                    <div class="mess-name">{{ message.name }}</div>
                                    {{ message.content }}
                                    <div class="mess-time"><br />{{ formatTime(message.createAt) }}</div>
                                </div>
                            </div>
                            <div class="mess-img" v-else-if="message.type === 'image'">
                                <img :src=message.content alt="" />
                            </div>
                        </div>
                        <div class="mess-incoming" v-else-if="message.name === 'Bot'">
                            <div class="mess-avatar">
                                <img src="../assets/avatar-bot.png" alt="" />
                            </div>
                            <div class="details">
                                <div class="mess-text">
                                    <div class="mess-name">{{ message.name }}</div>
                                    {{ message.content }}
                                    <div class="mess-time"><br />{{ formatTime(message.createAt) }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="mess-outgoing" v-else>
                            <div class="mess-text" v-if="message.type === 'text'">
                                {{ message.content }}
                                <div class="mess-time"><br />{{ formatTime(message.createAt) }}</div>
                            </div>
                            <div class="mess-img" v-else-if="message.type === 'image'">
                                <img :src=message.content alt="" />
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <div class="chat-footer">
            <button @click="openUploadModal()" id="btn-sendImg">
                <i class="fa-solid fa-image"></i>
            </button>
            <form class="" @submit.prevent="sendMessageStranger('text')">
                <input id="input-sendMess" type="text" placeholder="Nhập vào nội dung bạn muốn nhắn...."
                    v-model="inputMessageTextChatWithStranger" />
                <button id="btn-sendMess" type="submit">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </form>
        </div>
    </div>

    <div class="contact_main" v-if="statusContent === 'requestContact'">
        <div class="content_header">
            <i class="bx bxs-user-plus"></i>
            <div class="content_header-title">
                <h1>Danh sách kết bạn</h1>
            </div>
        </div>
        <div class="contact_list">
            <template v-for="(contact, index) in user.requestContact" :key="index">
                <div class="contact_item" :title=contact.fullName>
                    <img :src=contact.avatar alt="" />
                    <div class="contact_content">
                        <h3 class="contact_name">{{ contact.fullName }}</h3>
                    </div>
                    <div class="contact_action">
                        <button class="btn btn_accept"
                            @click="this.actionFriendRequest({ phone: contact.phone, accept: true })">Chấp nhận</button>
                        <button class="btn btn_deny"
                            @click="this.actionFriendRequest({ phone: contact.phone, accept: false })">Từ chối</button>
                    </div>
                </div>
            </template>
        </div>
    </div>

    <div class="contact_main" v-if="statusContent === 'contacts'">
        <div class="content_header">
            <i class="bx bxs-group"></i>
            <div class="content_header-title">
                <h1>Danh sách bạn bè</h1>
            </div>
        </div>
        <div class="contact_list">
            <template v-for="(contact, index) in user.contacts" :key="index">
                <div class="contact_item" :title=contact.fullName>
                    <img :src=contact.avatar alt="" />
                    <div class="contact_content">
                        <h3 class="contact_name">{{ contact.fullName }}</h3>
                    </div>
                </div>
            </template>
        </div>
    </div>

    <div class="contact_main introduce" v-if="statusContent === 'notSignIn'">
        <img src="../assets/redi-chat.svg" alt="">
        <h1>REDI</h1>
        <h2>XOÁ NHOÀ KHOẢNG CÁCH</h2>
    </div>

    <div class="contact_main no-chat-selected" v-if="statusContent === 'noChatSelected'">
        <img src="../assets/redi-chat.svg" alt="">
        <p>Xin chào {{ this.user.fullName.substr(this.user.fullName.toString().lastIndexOf(" ")) }} </p>
        <p>chào mừng bạn đến với REDI, </p>
        <p>bắt đầu trò chuyện với những người mà bạn yêu thương nào !</p>
    </div>
</template>
  
<script lang="js">
import SocketioService from '../services/socketio.service.js';
import Redi from "../funtions/reid.funtion";
import { useStore } from '../stores/Store';
import { storeToRefs } from 'pinia'
export default {
    name: 'Content',
    data() {
        let store = useStore();
        let { statusContent } = storeToRefs(store);
        let { chatRoomStranger } = storeToRefs(store);
        let { user } = storeToRefs(store);
        const { currentChatRoom } = storeToRefs(store);
        const eFormInput = ['#btn-sendImg', '#btn-sendMess', '#input-sendMess'];
        const eNewChat = ['#btn-newChat'];
        const eStopChat = ['#btn-stopChat'];
        return {
            statusContent,
            messagesChatWithStranger: [],
            inputMessageTextChatWithStranger: '',
            url: '',
            chatRoomStranger,
            user,
            inputMessageText: "",
            currentChatRoom,
            eFormInput,
            eNewChat,
            eStopChat
        };
    },
    computed: {
        messages() {
            if (this.currentChatRoom.messages.length > 0)
                return this.currentChatRoom.messages;
            return [];
        },
        lastSeenMessage() {
            if (this.currentChatRoom.messages.length > 0) {
                for (let i = this.currentChatRoom.messages.length - 1; i >= 0; i--) {
                    if (this.currentChatRoom.messages[i].sender === this.user._id && this.currentChatRoom.messages[i].seen) {
                        return i;
                    }
                }
            }
            return -1;
        }
    },
    watch: {
        statusContent(newValue, oldValue) {
            if (newValue === "chatWithStranger") {
                setTimeout(() => {
                    if (!this.chatRoomStranger) {
                        Redi.disableElements(this.eNewChat, false);
                        Redi.disableElements(this.eFormInput.concat(this.eStopChat), true);
                    }
                    else {
                        Redi.disableElements(this.eFormInput.concat(this.eStopChat).concat(this.eNewChat), false);
                    }
                    oldValue.toString();
                }, 80);
            }
        },
        messagesChatWithStranger: {
            deep: true,
            handler() {
                Redi.autoSrcollTop(".content_body");
            }
        }
    },
    methods: {
        sendMessageFriend(type) {
            if (!type) return;
            let message;
            if (type === "text" && this.inputMessageText !== '') {
                message = { content: this.inputMessageText, type: type, roomID: this.currentChatRoom._id };
                this.inputMessageText = '';
            }
            if (type === 'image') {
                message = { content: this.url, type: type, roomID: this.currentChatRoom._id };
                this.url = ''
            }
            if (!message) return;
            console.log("sending message friend....");
            SocketioService.sendMessageFriend(message, cb => {
                // callback is acknowledgement from server
                // console.log(cb);
                this.currentChatRoom.messages.push({
                    ...message,
                    createAt: cb.createAt,
                    sender: this.user._id,
                    seen: false
                });
                Redi.autoSrcollTop(".content_body");
            });
        },
        // openUploadModal() {
        //     Redi.openUploadModal("Content", (data) => {
        //         this.url = data.url;
        //         if (this.currentChatRoom._id === '000') {
        //             this.sendMessageStranger('image');
        //         } else {
        //             this.sendMessageFriend('image');
        //         }
        //     })

        // },
        openUploadModal() {
            window.cloudinary.createUploadWidget(
                {
                    cloud_name: 'dwnunieno',
                    upload_preset: 'ma9pfovj',
                    maxImageFileSize: 10000000,
                    autoMinimize: true,
                    sources: ["local"],
                    clientAllowedFormats: ["image"],
                    maxFiles: 5
                },
                (error, result) => {
                    if (!error && result && result.event === "success") {
                        console.log('Done uploading..: ', result.info);
                        this.url = result.info.url;
                        console.log(this.url)
                        if (this.currentChatRoom._id === '000') {
                            this.sendMessageStranger('image');
                        } else {
                            this.sendMessageFriend('image');
                        }
                    }
                }).open();
        },
        connectSocketStranger() {
            setTimeout(() => {
                const chatRoom = this.chatRoomStranger;
                // console.log(chatRoom)
                if (chatRoom !== '') {
                    this.messagesChatWithStranger = [{ content: "Đang đợi người lạ ...", name: "Bot" }];
                    Redi.disableElements(this.eFormInput.concat(this.eNewChat), true);
                    Redi.disableElements(this.eStopChat, false);
                    SocketioService.nextRoomStranger(chatRoom);
                }
                else {
                    SocketioService.setupSocketStrangerConnection();
                    SocketioService.statusRoomStranger((err, data) => {
                        // console.log(data);
                        if (data.content === 'Đang đợi người lạ ...') {
                            Redi.disableElements(this.eFormInput.concat(this.eNewChat), true);
                            Redi.disableElements(this.eStopChat, false);
                        }
                        if (data.content.includes("NextRoom")) {
                            data.content = "Người lạ đã rời đi. Đang đợi người lạ ..."
                            Redi.disableElements(this.eFormInput.concat(this.eNewChat), true);
                            Redi.disableElements(this.eStopChat, false);
                            useStore().setChatRoomStranger('');
                        }
                        else if (this.messagesChatWithStranger.length > 0) {
                            this.messagesChatWithStranger = [];
                        }
                        if (data.content.includes("Người lạ đã vào phòng")) {
                            const chatRoom = data.content.substr(data.content.indexOf("|") + 1, data.content.length - 1);
                            useStore().setChatRoomStranger(chatRoom);
                            data.content = data.content.substr(0, data.content.indexOf("|"));
                            Redi.disableElements(this.eFormInput.concat(this.eStopChat).concat(this.eNewChat), false);
                        }
                        if (data.content === 'Người lạ đã rời đi. Đang đợi người lạ kế tiếp ...') {
                            Redi.disableElements(this.eFormInput.concat(this.eNewChat), true);
                            Redi.disableElements(this.eStopChat, false);
                        }
                        this.messagesChatWithStranger.push({
                            name: data.name,
                            content: data.content,
                            type: "text",
                            createAt: data.createAt
                        });
                    });
                    SocketioService.receiveMessageStranger((err, data) => {
                        // console.log(data);
                        this.messagesChatWithStranger.push(data);
                    });
                }
            }, 80);
        },
        sendMessageStranger(type) {
            if (!type) return;

            let message;
            if (type === "text" && this.inputMessageTextChatWithStranger !== '') {
                message = { content: this.inputMessageTextChatWithStranger, type: type };
                this.inputMessageTextChatWithStranger = '';
            }
            if (type === 'image') {
                message = { content: this.url, type: type };
                this.url = ''
            }
            if (!message) return;
            console.log("sending message stranger....");
            SocketioService.sendMessageStranger(message, cb => {
                // callback is acknowledgement from server
                // console.log(cb);
                this.messagesChatWithStranger.push({
                    ...message,
                    createAt: cb.createAt,
                    name: "Me"
                });
            });
        },
        stopChatStranger() {
            setTimeout(() => {
                SocketioService.disconnectStranger();
                this.messagesChatWithStranger.push({
                    type: "text",
                    createAt: Redi.getTime(),
                    content: "Bạn đã rời khỏi phòng !",
                    name: "Bot"
                });
                useStore().setChatRoomStranger('');
                Redi.disableElements(this.eFormInput.concat(this.eStopChat), true);
                Redi.disableElements(this.eNewChat, false);
                this.inputMessageTextChatWithStranger = '';
            }, 69)
            this.messagesChatWithStranger = [];
        },
        formatTime(time) {
            return Redi.formatTime(time)
        },
        actionFriendRequest(data) {
            SocketioService.actionFriendRequest(data)
        }
    },
    beforeUnmount() {
        SocketioService.disconnectStranger();
        SocketioService.disconnect();
    }
}
</script>

<style scoped>
.introduce {
    background-color: rgb(244, 239, 233);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
}

.introduce img {
    max-width: 50vh;
}

.introduce h1 {
    font-size: 100px;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    font-weight: 800;
    color: #0091ff;
    letter-spacing: 20px;
    margin-top: -30px;
}

.introduce h2 {
    margin-left: -20px;
    margin-top: -20px;
    font-size: 20px;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    font-weight: 800;
    color: #0091ff;
    /* letter-spacing: 10px; */
}

.no-chat-selected {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-weight: 800;
    color: #0091ff;
    font-size: 21px;
    background-color: rgb(244, 239, 233);
}

.no-chat-selected img {
    max-width: 200px;
}

.no-chat-selected p {
    text-align: center;
    margin-bottom: 0;
}

.content_header-right button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px;
    border-radius: 8px;
}

.content_header-right button i {
    margin-right: 4px;
}

.chat-footer button {
    border: none;
    background-color: transparent;
}
</style>