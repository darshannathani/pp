import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    response: [],
};

export const responseTaskSlice = createSlice({
    name: 'responseTask',
    initialState,
    reducers: {
        addResponseTasks: (state, action) => {
            action.payload.forEach(newResponse => {
                const existingResponseIndex = state.response.findIndex(
                    response => response.questionId === newResponse.questionId
                );

                if (existingResponseIndex !== -1) {
                    // Update the existing response
                    state.response[existingResponseIndex] = newResponse;
                } else {
                    // Add the new response
                    state.response.push(newResponse);
                }
            });
        },
        clearResponseTask: () => {
            return initialState;
        },
    },
});

export const { addResponseTasks, clearResponseTask } = responseTaskSlice.actions;

export default responseTaskSlice.reducer;
