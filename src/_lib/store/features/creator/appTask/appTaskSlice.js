import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    creator: "",
    post_date: "",
    end_date: "",
    tester_no: 0,
    tester_age: 0,
    tester_gender: "",
    country: "",
    heading: "",
    instruction: ""
};

export const appTaskSlice = createSlice({
    name: 'appTask',
    initialState,
    reducers: {
        addAppTask: (state, action) => {
            return { ...state, ...action.payload };
        },
        clearAppTask: () => {
            return initialState;
        },
    },
});

export const {
    addAppTask,
    clearAppTask,
} = appTaskSlice.actions;

export default appTaskSlice.reducer;