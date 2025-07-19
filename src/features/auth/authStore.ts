import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';

import { getToken, getUserInfo } from './shared';

const initialState = {
  token: getToken(),
  userInfo: getUserInfo()
};

export const authSlice = createSlice({
  initialState,
  name: 'auth',
  reducers: {
    resetAuth: () => initialState,
    setToken: (state, { payload }: PayloadAction<string>) => {
      state.token = payload;
    },
    setUserInfo: (state, { payload }: PayloadAction<Api.User.Info>) => {
      state.userInfo = payload;
    }
  },
  selectors: {
    selectToken: auth => auth.token,
    selectUserInfo: auth => auth.userInfo
  }
});

export const { resetAuth, setToken, setUserInfo } = authSlice.actions;

export const { selectToken, selectUserInfo } = authSlice.selectors;

/** Is login */
export const getIsLogin = createSelector([selectToken], token => Boolean(token));

/** Is static super role */
export const isStaticSuper = createSelector([selectUserInfo], userInfo => {
  const { VITE_AUTH_ROUTE_MODE } = import.meta.env;

  // return VITE_AUTH_ROUTE_MODE === 'static' && userInfo.roles.includes(VITE_STATIC_SUPER_ROLE);
  return VITE_AUTH_ROUTE_MODE === 'static' && userInfo.root;
});
