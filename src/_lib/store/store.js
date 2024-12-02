import { configureStore } from '@reduxjs/toolkit';
import userInfoReducer from '@/_lib/store/features/userInfo/userInfoSlice';
import surveyTaskReducer from './features/creator/surveyTask/surveyTaskSlice';
import availableTaskReducer from './features/tester/availableTask/availableTaskSlice';
import responseTaskReducer from './features/tester/responseTask/responseTaskSlice';
import historyUserReducer from './features/shared/history/historyTesterSlice';
import analyticsDataReducer from './features/creator/analyticsData/analyticsDataSlice';
import youTubeTaskReducer from './features/creator/youTubeTask/youTubeTaskSlice';

export const makeStore = () => {

  return configureStore({
    reducer: {
      userInfo: userInfoReducer,
      surveyTask: surveyTaskReducer,
      youTubeTask: youTubeTaskReducer,
      availableTask: availableTaskReducer,
      responseTask: responseTaskReducer,
      historyUser: historyUserReducer,
      analyticsData: analyticsDataReducer
    },
  });
}
