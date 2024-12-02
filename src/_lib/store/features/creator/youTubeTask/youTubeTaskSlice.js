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
    noOfThumbNails: 2,
    youtube_thumbnails: [],
    "web_link": "https://www.example.com/product-review"
};

export const youTubeTaskSlice = createSlice({
    name: 'youTubeTask',
    initialState,
    reducers: {
        addYouTubeTask: (state, action) => {
            return { ...state, ...action.payload };
        },
        clearYouTubeTask: () => {
            return initialState;
        },
        addThumbnail: (state, action) => {
            state.youtube_thumbnails.push({ title: action.payload });
        },
        removeThumbnail: (state, action) => {
            state.youtube_thumbnails = state.youtube_thumbnails.filter(thumbnail => thumbnail.title !== action.payload);
        },
        clearThumbnails: (state) => {
            state.youtube_thumbnails = [];
        },
    },
});

export const {
    addYouTubeTask,
    clearYouTubeTask,
    addThumbnail,
    removeThumbnail,
    clearThumbnails
} = youTubeTaskSlice.actions;

export default youTubeTaskSlice.reducer;