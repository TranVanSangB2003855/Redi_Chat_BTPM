import createApiClient from "./api.service";
class AuthService {
    constructor(baseUrl = process.env.VUE_APP_SOCKET_ENDPOINT_AUTH) {
        this.api = createApiClient(baseUrl);
    }
    async signIn(data) {
        return (await this.api.post("/signin", data)).data;
    }
    async signUp(data) {
        return (await this.api.post("/signup", data)).data;
    }
    async signOut(data){
        return (await this.api.put("/signout", data)).data;
    }
    async verifyToken(data) {
        return (await this.api.post("/getinfo", data)).data;
    }
}
export default new AuthService();