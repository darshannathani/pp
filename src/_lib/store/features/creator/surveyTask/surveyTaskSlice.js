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
    instruction: "",
    noOfQuestions: 0,
    questions: []
};

export const surveyTaskSlice = createSlice({
    name: 'surveyTask',
    initialState,
    reducers: {
        addSurveyTask: (state, action) => {
            return { ...state, ...action.payload };
        },
        addQuestion: (state, action) => {
            state.questions.push(action.payload.question)
        },
        clearSurveyTask: () => {
            // Return the initial state to reset the store
            return initialState;
        },
    },
});

export const { 
    addSurveyTask, addQuestion, clearSurveyTask } = surveyTaskSlice.actions;

export default surveyTaskSlice.reducer;
