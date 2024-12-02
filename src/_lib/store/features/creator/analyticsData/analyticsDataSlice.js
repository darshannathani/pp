import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    analyticsData: [],
    isDataAvailable: false
};

export const analyticsDataSlice = createSlice({
    name: 'analyticsData',
    initialState,
    reducers: {
        setAnalyticsData: (state, action) => {
            action.payload.forEach(newData => {
                const existingDataIndex = state.analyticsData.findIndex(
                    data => data.task.id === newData.task.id && data.task.type === newData.task.type
                );

                if (existingDataIndex !== -1) {
                    // Update the existing data if found
                    state.analyticsData[existingDataIndex] = newData;
                } else {
                    // Add the new data if it doesn't exist
                    state.analyticsData.push(newData);
                }
            });
            state.isDataAvailable = true;
        },
        clearAnalyticsData: () => {
            return initialState;
        },
    },
});

export const { setAnalyticsData, clearAnalyticsData } = analyticsDataSlice.actions;

export default analyticsDataSlice.reducer;
