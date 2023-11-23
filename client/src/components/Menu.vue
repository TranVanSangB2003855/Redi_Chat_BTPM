<template>
    <!-- Modal -->
    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel" style="align-items: center;">Cập nhật thông tin cơ bản</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                        @click="clickCloseUpdateMenu()"></button>
                </div>
                <div class="modal-body">
                    
                    <div class="tab-content" id="pills-tabContent">
                        <div class="tab-pane fade show active" id="pills-home" role="tabpanel"
                            aria-labelledby="pills-home-tab" tabindex="0">
                            <Form @submit="updateInfo()" :validation-schema="dataUpdateInfoFormSchema" class="form-sign"
                                ref="formUpdateInfo">
                                <div class="form-group" disable>
                                    <label for="phone">Số điện thoại</label>
                                    <input type="text" name="" id="phone" :value="this.user.phone" class="form-control"
                                        disabled>
                                </div>
                                <div class="form-group">
                                    <label for="fullName">Họ và tên</label>
                                    <Field name="fullName" type="text" class="form-control"
                                        v-model="dataUpdateInfo.fullName" />
                                    <ErrorMessage name="fullName" class="error-feedback" />
                                </div>
                                <div class="form-group">
                                    <label>Ảnh đại diện: </label>
                                    <button type="button" @click="openUploadModal()">
                                        {{ (this.dataUpdateInfo.avatar === '') ? "Upload ảnh làm ảnh đại diện." :
                                            this.nameFileAvatar }}
                                    </button>
                                </div>
                                <button class="btn btn-signup">Cập nhật</button>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <ul class="menu">
        <li class="menu_item">
            <div class="menu_avatar" :title=this.user.fullName href="#">
                <img :src=this.user.avatar alt="avatar" v-if="statusMenu !== 'notSignIn'" />
                <img src="../assets/redi.svg" alt="avatar" v-else />
            </div>
        </li>
        <li @click="clickChatMenu()" :class="[(statusMenu === 'chat' || statusMenu === 'notSignIn') ? 'active' : '']"
            class="menu_item">
            <div class="icon-message" href="#"><i class="bx bxs-message-rounded-dots"></i></div>
        </li>
        <li @click="clickContactMenu()" class="menu_item" :class="[(statusMenu === 'contacts') ? 'active' : '']"
            v-if="statusMenu !== 'notSignIn'">
            <a class="icon-message"><i class="bx bxs-contact"></i></a>
        </li>
        <li @click="clickUpdateMenu()" data-bs-toggle="modal" data-bs-target="#exampleModal" class="menu_item"
            :class="[(statusMenu === 'update') ? 'active' : '']" v-if="statusMenu !== 'notSignIn'">
            <a class="icon-message"><i class="fa-sharp fa-solid fa-square-pen"></i></a>
        </li>
        <li class="menu_item menu_item-logout" v-if="statusMenu !== 'notSignIn'" @click="signOut()">
            <div class="icon-message"><i class="fa-solid fa-right-from-bracket"></i></div>
        </li>
    </ul>
</template>
  
<script>
import SocketioService from '../services/socketio.service.js';
import { useStore } from '../stores/Store';
import { storeToRefs } from 'pinia'
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";
import AuthService from '../services/auth.service.js';
import Redi from '../funtions/reid.funtion'
export default {
    name: 'Menu',
    components: {
        Form,
        Field,
        ErrorMessage,
    },
    data() {
        let store = useStore();
        const { statusMenu } = storeToRefs(store);
        const { user } = storeToRefs(store);
        const dataUpdateInfoFormSchema = yup.object().shape({
            fullName: yup
                .string()
                .required("Họ và tên phải có giá trị.")
                .min(8, "Họ và tên phải ít nhất 8 ký tự.")
                .matches('[a-zA-Z]', "Họ và tên phải ít một ký tự chữ cái.")
                .max(50, "Họ và tên có nhiều nhất 50 ký tự."),
        });

        const dataChangePasswordFormSchema = yup.object().shape({
            currentPassword: yup
                .string()
                .required("Mật khẩu phải có giá trị.")
                .min(8, "Mật khẩu phải ít nhất 8 ký tự."),
            password: yup
                .string()
                .required("Mật khẩu phải có giá trị.")
                .min(8, "Mật khẩu phải ít nhất 8 ký tự."),
            confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Mật khẩu phải trùng khớp.')
        });
        return {
            statusMenu,
            user,
            dataChangePasswordFormSchema,
            dataUpdateInfoFormSchema,
            dataUpdateInfo: {
                fullName: "",
                avatar: ""
            },
            dataChangePassword: {
                currentPassword: "",
                password: "",
                confirmPassword: ""
            },
            nameFileAvatar: ""
        };
    },
    watch: {
        user() {
            this.dataUpdateInfo.fullName = this.user.fullName
        }
    },
    methods: {
        openUploadModal() {
            Redi.openUploadModal('Menu', (data) => {
                this.nameFileAvatar = data.nameFileAvatar
                this.dataUpdateInfo.avatar = data.url
            })
        },
        clickContactMenu() {
            useStore().clickContactMenu();
        },
        clickUpdateMenu() {
            useStore().clickUpdateMenu();
        },
        clickChatMenu() {
            if (this.statusMenu !== 'notSignIn') {
                useStore().clickChatMenu();
            } else {
                alert("Bạn phải đăng nhập để thực hiện chức năng này !");
            }
        },
        clickCloseUpdateMenu() {
            useStore().clickCloseUpdateMenu();
        },
        async signOut() {
            try {
                if (confirm("Bạn muốn đăng xuất khỏi tài khoản này ?")) {
                    await AuthService.signOut({ phone: this.user.phone });
                    SocketioService.disconnect()
                    localStorage.removeItem('token');
                    useStore().signOut();
                    location.reload();
                }
            } catch (error) {
                console.log(error)
            }
        },
        async updateInfo() {
            if (this.dataUpdateInfo.avatar !== "" || this.dataUpdateInfo.fullName !== this.user.fullName) {
                if (this.dataUpdateInfo.avatar === "") {
                    this.dataUpdateInfo.avatar = this.user.avatar;
                    this.nameFileAvatar = "Ảnh đại diện hiện tại."
                }
                await useStore().updateInfo({ ...this.dataUpdateInfo, "_id": this.user._id });
                this.user.avatar = this.dataUpdateInfo.avatar;
                this.dataUpdateInfo.avatar = "";
            } else {
                alert("Không có thông tin mới để cập nhật !");
            }
        },
        async changePassword() {
            await useStore().changePassword({ ...this.dataChangePassword, "_id": this.user._id });
            setTimeout(this.$refs.formChangePassWord.resetForm, 50);
            this.dataChangePassword = {
                currentPassword: "",
                password: "",
                confirmPassword: ""
            }
        }
    },
}
</script>

<style scoped>
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
</style>