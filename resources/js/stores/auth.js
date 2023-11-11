import { defineStore } from "pinia";
import axios from "axios";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        authUser: null,
        authErrors: [],
        authStatus: null,
    }),
    getters: {
        user: (state) => state.authUser,
        errors: (state) => state.authErrors,
        status: (state) => state.authStatus,
    },
    actions: {
        async getToken() {
            await axios.get("/sanctum/csrf-cookie");
        },
        async handleRegister(data) {
            this.authErrors = [];
            await this.getToken();

            if (!data.name || data.name.length < 3 || data.name.length > 20) {
                this.authErrors.name = 'Name must be between 3 and 20 characters.';
            }

            if (!data.email) {
                this.authErrors.email = 'Please enter email address.';
            }

            if (!data.password || data.password.length < 3 || data.password.length > 20) {
                this.authErrors.password = 'Password must be between 3 and 20 characters.';
            }

            if (data.password !== data.password_confirmation) {
                this.authErrors.confirmPassword = 'Passwords do not match.';
            }

            if (Object.keys(this.authErrors).length === 0) {
                try {
                    await axios.post("/register", {
                        name: data.name,
                        email: data.email,
                        password: data.password,
                        password_confirmation: data.password_confirmation,
                    });
                    if (Object.keys(this.authErrors).length === 0) {
                        // Form is valid, submit or save data
                        this.authStatus = 'Registration successful!';
                        this.data = {}; // Clear form data
                    }
                } catch (error) {
                    if (error.response.status === 422) {
                        this.authErrors = error.response.data.errors;
                    }
                }
                this.authStatus = 'Registration successful!';
                data.reset();
            }
        },
    },
});
