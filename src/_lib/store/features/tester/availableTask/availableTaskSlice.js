import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  surveys: [],
  youtube: [],
  app: [],
  marketingTask: [],
  isTaskAvailable: false,
};

export const availableTaskSlice = createSlice({
  name: 'availableTask',
  initialState,
  reducers: {
    addAvailableTasks: (state, action) => {
      const { surveys, youtube, app, marketingTask } = action.payload;

      // Filter unique surveys
      const existingSurveyIds = new Set(state.surveys.map(survey => survey._id));
      const uniqueSurveys = surveys.filter(survey => !existingSurveyIds.has(survey._id));
      state.surveys = [...state.surveys, ...uniqueSurveys];

      // Filter unique YouTube tasks
      const existingYouTubeIds = new Set(state.youtube.map(task => task._id));
      const uniqueYouTubeTasks = youtube.filter(task => !existingYouTubeIds.has(task._id));
      state.youtube = [...state.youtube, ...uniqueYouTubeTasks];

      // Filter unique App tasks
      const existingAppIds = new Set(state.app.map(task => task._id));
      const uniqueAppTasks = app.filter(task => !existingAppIds.has(task._id));
      state.app = [...state.app, ...uniqueAppTasks];

      // Filter unique Marketing tasks
      const existingMarketingTaskIds = new Set(state.marketingTask.map(task => task._id));
      const uniqueMarketingTasks = marketingTask.filter(task => !existingMarketingTaskIds.has(task._id));
      state.marketingTask = [...state.marketingTask, ...uniqueMarketingTasks];

      // Update isTaskAvailable flag
      state.isTaskAvailable =
        state.surveys.length > 0 ||
        state.youtube.length > 0 ||
        state.app.length > 0 ||
        state.marketingTask.length > 0;
    },
    clearAvailableTask: () => {
      return initialState;
    },
  },
});

export const { addAvailableTasks, clearAvailableTask } = availableTaskSlice.actions;
export default availableTaskSlice.reducer;