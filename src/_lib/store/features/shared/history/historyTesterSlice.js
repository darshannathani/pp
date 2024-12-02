import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    history: [],
    isHistoryAvailable: false
};

export const historyUserSlice = createSlice({
    name: 'historyUser',
    initialState,
    reducers: {
        addHistoryUser: (state, action) => {
            action.payload.forEach(newTask => {
                const existingTaskIndex = state.history.findIndex(
                    task => task.id === newTask.id // Match tasks by `id` to ensure uniqueness
                );

                if (existingTaskIndex !== -1) {
                    // Update the existing task if found
                    state.history[existingTaskIndex] = newTask;
                } else {
                    // Add the new task if it doesn't exist
                    state.history.push(newTask);
                }
            });
            state.isHistoryAvailable = state.history.length > 0;
        },
        clearHistoryUser: () => {
            return initialState;
        },
    },
});

export const { addHistoryUser, clearHistoryUser } = historyUserSlice.actions;

export default historyUserSlice.reducer;
