import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    id: "",
    role: ""
};

export const userInfoSlice = createSlice({
    name: 'userInfo',
    initialState,
    reducers: {
        login: (state, action) => {
            state.id = action.payload.id;
            state.role = action.payload.role;
        },
        logout: (state) => {
            state.id = "";
            state.role = "";
        },

    },
});

export const { login, logout } = userInfoSlice.actions;

export default userInfoSlice.reducer;
