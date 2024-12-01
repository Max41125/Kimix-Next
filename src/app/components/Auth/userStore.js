import { makeAutoObservable } from 'mobx';

class UserStore {
    user = null;
    token = '';

    constructor() {
        makeAutoObservable(this);
    }

    // Устанавливаем данные пользователя и токен
    setUser(userData) {
        this.user = userData;
    }

    setToken(authToken) {
        this.token = authToken;
    }

    // Логаут: очищаем состояние
    logout() {
        this.user = null;
        this.token = '';
    }
}

const userStore = new UserStore();
export default userStore;
