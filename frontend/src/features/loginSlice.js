/* eslint-disable no-param-reassign */
import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  entities: {
    token: '',
    username: '',
  },
  loginError: null,
  signupError: null,
};

export const loginUser = createAsyncThunk('@@login/login-user', async (userData, thunkAPI) => {
  try {
    const { username, password } = userData;
    const res = await axios.post('/api/v1/login', {
      username,
      password,
    });
    const { data } = res;

    return data;
  } catch (error) {
    if (error.response && error.response.status === 500) {
      return thunkAPI.rejectWithValue('validation.connectionError');
    }
    if (error.response && error.response.status === 401) {
      return thunkAPI.rejectWithValue('validation.loginError');
    }

    return thunkAPI.rejectWithValue('validation.unknownError');
  }
});

export const signupUser = createAsyncThunk('@@login/signup-user', async (newUserData, thunkAPI) => {
  try {
    const { username, password } = newUserData;
    const res = await axios.post('/api/v1/signup', {
      username,
      password,
    });
    const { data } = res;

    return data;
  } catch (error) {
    if (error.response && error.response.status === 500) {
      return thunkAPI.rejectWithValue('validation.connectionError');
    }
    if (error.response && error.response.status === 409) {
      return thunkAPI.rejectWithValue('validation.existingUser');
    }

    return thunkAPI.rejectWithValue('validation.unknownError');
  }
});

const loginSlice = createSlice({
  name: '@@login',
  initialState,
  reducers: {
    setUser: (state, { payload }) => {
      state.entities.token = payload.token;
      state.entities.username = payload.username;
    },
    logoutUser: (state) => {
      state.entities.token = '';
      state.entities.username = '';
      localStorage.removeItem('userData');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loginError = payload;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        localStorage.setItem('userData', JSON.stringify(payload));
        state.entities.token = payload.token;
        state.entities.username = payload.username;
        state.loginError = null;
      })
      .addCase(signupUser.rejected, (state, { payload }) => {
        state.signupError = payload;
      })
      .addCase(signupUser.fulfilled, (state, { payload }) => {
        localStorage.setItem('userData', JSON.stringify(payload));
        state.entities.token = payload.token;
        state.entities.username = payload.username;
        state.signupError = null;
      });
  },
});

export default loginSlice.reducer;
export const { setUser, logoutUser } = loginSlice.actions;
