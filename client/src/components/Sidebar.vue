<template>
    <div class="overlay"></div>
    <!-- modal form sign up -->
    <div class="modal_form-sign">
        <div class="modal_form-sign-heading">
            <h1>Đăng Ký</h1>
        </div>
        <div class="icon-close">
            <i class="bx bx-x"></i>
        </div>
        <Form @submit="signUp()" :validation-schema="dataSignUpFormSchema" class="form-sign" ref="formSignUp">
            <div class="form-group">
                <label for="fullName">Họ và tên</label>
                <Field name="fullName" type="text" class="form-control" v-model="dataSignUp.fullName" />
                <ErrorMessage name="fullName" class="error-feedback" />
            </div>
            <div class="form-group">
                <label for="phone">Điện thoại</label>
                <Field name="phone" type="tel" class="form-control" v-model="dataSignUp.phone" />
                <ErrorMessage name="phone" class="error-feedback" />
            </div>
            <div class="form-group">
                <label for="password">Mật Khẩu</label>
                <Field name="password" type="password" class="form-control" v-model="dataSignUp.password" />
                <ErrorMessage name="password" class="error-feedback" />
            </div>
            <div class="form-group">
                <label for="confirmPassword">Xác nhận lại mật khẩu</label>
                <Field name="confirmPassword" type="password" class="form-control" v-model="dataSignUp.confirmPassword" />
                <ErrorMessage name="confirmPassword" class="error-feedback" />
            </div>
            <div class="form-group">
                <label>Ảnh đại diện: </label>
                <button type="button" @click="openUploadModal()">
                    {{ (this.dataSignUp.avatar === '') ? "Upload ảnh làm ảnh đại diện." : this.nameFileAvatar }}
                </button>
                <Field name="avatar" type="text" class="form-control" v-model="dataSignUp.avatar" style="display: none;"/>
                <ErrorMessage name="avatar" class="error-feedback" />
            </div>
            <button class="btn btn-signup">Đăng ký</button>
            <div class="login-signup">
                <span class="text">Đã có tài khoản</span>
                <span href="#" class="text login-link">Đăng nhập</span>
            </div>
        </Form>

        <!-- </form>  -->
    </div>
    <!-- modal form sign in -->
    <div class="modal_form-login">
        <div class="modal_form-sign-heading">
            <h1>Đăng Nhập</h1>
        </div>
        <div class="icon-close">
            <i class="bx bx-x"></i>
        </div>
        <Form @submit="signIn()" :validation-schema="dataSignInFormSchema" class="form-sign" ref="formSignIn">
            <div class="form-group">
                <label for="phone">Điện thoại</label>
                <Field name="phone" type="tel" class="form-control" v-model="dataSignIn.phone" />
                <ErrorMessage name="phone" class="error-feedback" />
            </div>
            <div class="form-group">
                <label for="password">Mật Khẩu</label>
                <Field name="password" type="password" class="form-control" v-model="dataSignIn.password" />
                <ErrorMessage name="password" class="error-feedback" />
            </div>
            <button class="btn btn-signup">Đăng nhập</button>
            <div class="login-signup">
                <span class="text">Bạn chưa có tài khoản? Hãy chọn</span>
                <span class="text signup-link">Đăng ký</span>
            </div>
        </Form>
    </div>

    <div class="sidebar">
        <div class="sidebar_list">
            <div class="sidebar_item-search" v-if="statusSidebar !== 'notSignIn'">
                <form @submit.prevent="this.findUser()">
                    <input type="text" placeholder="Tìm kiếm" v-model="this.searchText" />
                </form>
                <i class="bx bx-search"></i>
            </div>

            <template v-if="statusSidebar === 'notSignIn' || statusSidebar === 'chat'">
                <template v-for="(chatRoom, index) in this.chatRooms" :key="index">
                    <div class="sidebar_item" :title=chatRoom.fullNameFriend @click="openChatContent(chatRoom)"
                        :class="[(chatRoom._id === this.currentChatRoom._id) ? 'active' : '', (chatRoom.lastMessage) ? (!chatRoom.lastMessage.seen && chatRoom.lastMessage.sender !== this.user._id ? 'new' : '') : '']">
                        <img :src=chatRoom.avatar alt="" />
                        <i class="fa-solid fa-circle" v-if="chatRoom.online"></i>
                        <div class="sidebar_content">
                            <h3 class="sidebar_name">{{ chatRoom.fullNameFriend }}</h3>
                            <template v-if="chatRoom.lastMessage">
                                <span class="sidebar_message" v-if="chatRoom.lastMessage.type === 'image'">Hình ảnh</span>
                                <span class="sidebar_message" v-else>{{ chatRoom.lastMessage.content }}</span>
                            </template>
                        </div>
                    </div>
                </template>

            </template>

            <!-- SignUp - SignIn Button -->
            <div class="content_body-signup" v-show="statusSidebar === 'notSignIn'">
                <button href="#" class="btn btn-sign" id="open-form-dangnhap1">Đăng Ký</button>
                <button href="#" class="btn btn-log">Đăng Nhập</button>
            </div>

            <!-- Contacts -->
            <template v-if="statusSidebar.includes('ontact') && !this.checkSearchByPhone">
                <div @click="clickContactsSidebar()">
                    <div class="sidebar_item" :class="[(statusSidebar === 'contacts') ? 'active' : '']">
                        <i class="bx bxs-group"></i>
                        <div class="sidebar_content">
                            <h3 class="sidebar_name">Danh sách bạn bè</h3>
                        </div>
                    </div>
                </div>
                <div @click="clickRequestContactSidebar() && !this.checkSearchByPhone">
                    <div class="sidebar_item" :class="[(statusSidebar === 'requestContact') ? 'active' : '']">
                        <i class="bx bxs-user-plus"></i>
                        <div class="sidebar_content">
                            <h3 class="sidebar_name">Danh sách kết bạn</h3>
                        </div>
                    </div>
                </div>
            </template>


            <div class="sidebar_item" :title=this.foundUserByPhone.fullName
                v-if="this.foundUserByPhone.fullName && this.chatRooms.length < 1">
                <img :src=this.foundUserByPhone.avatar alt="" />
                <div class="sidebar_content">
                    <h3 class="sidebar_name">{{ this.foundUserByPhone.fullName }}</h3>
                </div>
                <button id="btn-requestContact" @click="sendFriendRequest()"
                    v-if="!this.foundUserByPhone.sentFriendRequest">
                    Kết bạn
                </button>
                <button id="btn-requestContact" disabled v-else>
                    Đã gửi lời mời kết bạn
                </button>
            </div>
        </div>
    </div>
</template>
  
<script lang="js">
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";
import AuthService from "../services/auth.service"
import SocketioService from "../services/socketio.service";
import { useStore } from '../stores/Store';
import { storeToRefs } from 'pinia';
import Redi from '../funtions/reid.funtion'
export default {
    name: 'Sidebar',
    components: {
        Form,
        Field,
        ErrorMessage,
    },
    mounted() {
        this.processFormSignInSignUp()
        this.verifyToken()
    },
    data() {
        let store = useStore();
        const { statusSidebar } = storeToRefs(store);
        const { statusContent } = storeToRefs(store);
        const { statusMenu } = storeToRefs(store);
        const { user } = storeToRefs(store);
        const { currentChatRoom } = storeToRefs(store);
        const { foundUserByPhone } = storeToRefs(store);
        const dataSignUpFormSchema = yup.object().shape({
            fullName: yup
                .string()
                .required("Họ và tên phải có giá trị.")
                .min(8, "Họ và tên phải ít nhất 8 ký tự.")
                .matches('[a-zA-Z]', "Họ và tên phải ít một ký tự chữ cái.")
                .max(50, "Họ và tên có nhiều nhất 50 ký tự."),
            password: yup
                .string()
                .required("Mật khẩu phải có giá trị."),
            phone: yup
                .string()
                .required("Số điện thoại không hợp lệ.")
                .min(10, "Số điện thoại không hợp lệ."),
            confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Mật khẩu không trùng khớp.'),
            avatar: yup
                .string()
                .required("Vui lòng tải ảnh đại diện lên !")
        });

        const dataSignInFormSchema = yup.object().shape({
            password: yup
                .string()
                .required("Mật khẩu phải có giá trị."),
            phone: yup
                .string()
                .required("Số điện thoại không hợp lệ.")
                .min(10, "Số điện thoại không hợp lệ."),
        });
        return {
            statusSidebar,
            statusContent,
            statusMenu,
            dataSignUp: {
                phone: "",
                password: "",
                fullName: "",
                confirmPassword: "",
                avatar: ""
            },
            dataSignIn: {
                phone: "",
                password: "",
            },
            dataSignUpFormSchema,
            dataSignInFormSchema,
            nameFileAvatar: '',
            user,
            searchText: '',
            currentChatRoom,
            foundUserByPhone,
            checkSearchByPhone: false
        };
    },
    watch: {
        searchText() {
            let check = this.searchText.match(/((09|03|07|08|05)+([0-9]{8})\b)/);
            if (!check) {
                this.foundUserByPhone = {
                    fullName: "",
                    _id: "",
                    avatar: "",
                    phone: "",
                    sentFriendRequest: false
                }
                this.checkSearchByPhone = false
            }
        }
    },
    computed: {
        chatRoomsString() {
            let x = this.user.chatRooms.map(chatRoom => {
                // console.log(chatRoom.owner)
                const id = (chatRoom.owner[0] === this.user._id) ? chatRoom.owner[1] : chatRoom.owner[0];
                let phone;
                this.user.contacts.forEach(contact => {
                    if (id === contact._id) {
                        phone = contact.phone;
                    }
                })
                return phone //[phone, Redi.removeAccents(chatRoom.fullNameFriend)].join("");
            })
            // console.log(x);
            return x;
        },
        chatRooms() {
            if (this.searchText === "") {
                let filteredChatRooms = this.user.chatRooms;
                filteredChatRooms.sort(Redi.compareFn);
                return filteredChatRooms;
            } else {
                let searchText = Redi.removeAccents(this.searchText);
                let filteredChatRooms = this.user.chatRooms.filter((chatRoom, index) => {
                    return this.chatRoomsString[index].includes(searchText);
                }).sort(Redi.compareFn);
                return filteredChatRooms;
            }
        }
    },
    methods: {
        processFormSignInSignUp() {
            const btnSign = document.querySelector(".btn-sign");
            const mdalSign = document.querySelector(".modal_form-sign");
            const btnClose = document.querySelectorAll(".icon-close");
            const btnLog = document.querySelector(".btn-log");
            const mdalLog = document.querySelector(".modal_form-login");
            const overlay = document.querySelector(".overlay");
            const signUp = document.querySelector(".signup-link");
            const login = document.querySelector(".login-link");
            // khi click vào button đăng ký nào thì modal nào mở ra và mở luôn lớp phủ mờ
            btnSign.addEventListener("click", function () {
                // click open modal
                mdalSign.classList.add("open");
                overlay.classList.add("open");
            });
            // khi click vào button đăng nhập nào thì modal nào mở ra và mở luôn lớp phủ mờ
            btnLog.addEventListener("click", function () {
                // click close modal
                mdalLog.classList.add("open");
                overlay.classList.add("open");
            });
            // khi click vào icon close thì đóng modal lại và tắt lớp phủ mờ
            btnClose.forEach((btn) => {
                btn.addEventListener("click", function () {
                    // click close modal
                    mdalSign.classList.remove("open");
                    mdalLog.classList.remove("open");
                    overlay.classList.remove("open");
                });
            });
            //chuyển đổi đăng nhập và đăng ký
            signUp.addEventListener("click", function () {
                mdalSign.classList.add("open");
                mdalLog.classList.remove("open");
            });
            login.addEventListener("click", function () {
                mdalLog.classList.add("open");
                mdalSign.classList.remove("open");
            });
        },
        async verifyToken() {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const user = await AuthService.verifyToken({ token: token });
                    if (user) {
                        useStore().setInfoUser(user.message);
                        SocketioService.setupSocketFriendConnection(user.message.token, user.message.phone);
                        SocketioService.receiveMessageFriend((err, data) => {
                            // console.log(data);
                            if (data.roomID === this.currentChatRoom._id) {
                                data.seen = true;
                                this.currentChatRoom.messages.push(data);
                                SocketioService.seenAllMessage(this.currentChatRoom._id);
                                Redi.autoSrcollTop(".content_body");
                            }
                            this.user.chatRooms.forEach((chatRoom, index) => {
                                if (data.roomID === chatRoom._id) {
                                    this.user.chatRooms[index].lastMessage = data;
                                    this.user.chatRooms[index].lastMessageDate = data.createAt;
                                    return
                                }
                            })
                        });
                        useStore().clickChatMenu();
                    }
                }
            } catch (error) {
                console.log(error);
            }
        },
        clickContactsSidebar() {
            useStore().clickContactsSidebar();
        },
        clickRequestContactSidebar() {
            useStore().clickRequestContactSidebar();
        },
        openChatContent(chatRoom) {
            if (chatRoom._id === this.currentChatRoom._id)
                return;
            this.currentChatRoom = { ...chatRoom, messages: [] };
                SocketioService.loadContentChatRoom(chatRoom._id.toString());
                this.user.chatRooms.forEach(room => {
                    if (chatRoom._id === room._id && room.lastMessage) {
                        room.lastMessage.seen = true;
                    }
                })
                SocketioService.seenAllMessage(chatRoom._id);
                useStore().switchChatContent();
        },
        openUploadModal() {
            Redi.openUploadModal('Sidebar', (data) => {
                this.dataSignUp.avatar = data.url;
                this.nameFileAvatar = data.nameFileAvatar
            })
        },
        async signUp() {
            try {
                if (this.dataSignUp.avatar === '') {
                    this.dataSignUp.avatar = "https://res.cloudinary.com/dwnunieno/image/upload/v1678895187/ojzoerhuvkv8ealatzqz.png"
                }
                await AuthService.signUp(this.dataSignUp);
                document.querySelector(".modal_form-sign").classList.remove('open');
                this.dataSignIn = {
                    phone: this.dataSignUp.phone,
                    password: this.dataSignUp.password
                };
                useStore().showNotify("Chào mừng bạn đến với Redi !");
                this.signIn();
                this.dataSignUp = {
                    phone: "",
                    password: "",
                    fullName: "",
                    address: "",
                    avatar: ""
                };
                setTimeout(this.$refs.formSignUp.resetForm, 500);
            } catch (error) {
                alert(error.response.data.message.toString())
                if (this.dataSignUp.avatar === "https://res.cloudinary.com/dwnunieno/image/upload/v1678895187/ojzoerhuvkv8ealatzqz.png") {
                    this.dataSignUp.avatar = "";
                }
            }
        },
        async signIn() {
            try {
                const meg = await AuthService.signIn(this.dataSignIn);
                useStore().setInfoUser(meg.message)
                SocketioService.setupSocketFriendConnection(meg.message.token, meg.message.phone);
                document.querySelector(".modal_form-login").classList.remove('open');
                document.querySelector(".overlay").classList.remove('open');
                this.currentChatRoom = {
                    fullName: "",
                    avatar: "",
                    messages: [],
                    _id: "",
                    online: false
                },
                    useStore().clickChatMenu();
                this.dataSignIn = {
                    phone: "",
                    password: "",
                };
                SocketioService.receiveMessageFriend((err, data) => {
                    // console.log(data);
                    if (data.roomID === this.currentChatRoom._id) {
                        data.seen = true;
                        this.currentChatRoom.messages.push(data);
                        SocketioService.seenAllMessage(this.currentChatRoom._id);
                        Redi.autoSrcollTop(".content_body");
                    }
                    this.user.chatRooms.forEach((chatRoom, index) => {
                        if (data.roomID === chatRoom._id) {
                            this.user.chatRooms[index].lastMessage = data;
                            this.user.chatRooms[index].lastMessageDate = data.createAt;
                            return
                        }
                    })
                });
                setTimeout(this.$refs.formSignIn.resetForm, 1000);
                // if (meg) console.log(meg.message);
            } catch (error) {
                alert(error.response.data.message.toString())
            }
        },
        findUser() {
            if (this.chatRooms.length > 0) return
            if (this.searchText === this.user.phone) {
                alert(this.user.phone + " là số điện thoại của bạn mà !");
                this.searchText = ''
                return;
            }

            let check = this.searchText.length >= 10;

            if (!check) {
                alert(`Số điện thoại: "${this.searchText}" chưa hợp lệ !`);
                return;
            }

            this.user.requestContact.forEach(contact => {
                if (contact.phone === this.searchText) {
                    alert(`Số điện thoại: "${this.searchText}" (${contact.fullName}) đã gửi lời mời kết bạn cho bạn !`)
                    this.searchText = '';
                    check = false;
                    return;
                }
            })
            if (!check) return;
            SocketioService.findUserByPhone(this.searchText);
            this.checkSearchByPhone = true;
            // console.log(this.searchText);
            this.currentChatRoom = {
                fullName: "",
                avatar: "",
                messages: [],
                _id: "",
            }
            if (this.statusMenu === 'chat')
                this.statusContent = 'noChatSelected'
            // this.searchText = ''
        },
        sendFriendRequest() {
            SocketioService.sendFriendRequest(this.foundUserByPhone.phone);
            this.searchText = ""
            this.foundUserByPhone = {
                fullName: "",
                _id: "",
                avatar: "",
                phone: "",
                sentFriendRequest: false
            }
            // this.statusSidebar = 'chat';
            // this.statusMenu = 'chat'
        }
    },
}
</script>

<style scoped>
div.note {
    text-align: justify;
    font-size: 14px;
    font-weight: 300;
}

form,
form * {
    width: 100%;
}

.form-group {
    padding-bottom: 5px;
}

.form-control {
    outline: none;
    border: 1px solid black;
    border-radius: 5px;
    padding: 5px 10px;
    font-size: 18px;
}

.error-feedback {
    font-size: 13px;
    color: red;
}

#btn-requestContact {
    width: 120px;
    background-color: #0091ff;
    border: none;
    color: white;
    border-radius: 3px;
    padding: 8px 3px;
}

.login-signup {
    margin-top: 10px;
    text-align: right;
}
</style>
