import createApiClient from "./api.service";
class UserService {
    constructor(baseUrl = process.env.VUE_APP_SOCKET_ENDPOINT_AUTH) {
        this.api = createApiClient(baseUrl);
    }
    async updateInfo(data) {
        return (await this.api.put("/updateinfo", data)).data;
    }
    async changePassword(data) {
        return (await this.api.put("/changepassword", data)).data;
    }
}
export default new UserService();