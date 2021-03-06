import axios from 'axios';
import { GET_ERRORS, GET_PROFILE, PROFILE_LOADING, CLEAR_CURRENT_PROFILE, SET_USER } from './types';

export const getCurrentProfile = () => dispatch => {
  dispatch(setProfileLoading());
  axios.get('/api/profile')
    .then(res => {
      dispatch({
        type: GET_PROFILE,
        payload: res.data
      })
    })
    .catch(err => {
      // A newly registered user will not have a profile
      dispatch({
        type: GET_PROFILE,
        payload: {}
      })
    });
}

export const createProfile = (profileData, history) => dispatch => {
  axios.post('/api/profile', profileData)
    .then(() => history.push('/dashboard'))
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      });
    });
}

export const setProfileLoading = () => {
  return {
    type: PROFILE_LOADING
  }
}

export const clearCurrentProfile = () => {
  return {
    type: CLEAR_CURRENT_PROFILE
  }
}

export const deleteProfile = () => dispatch => {
  if (window.confirm('Are you sure?')) {
    axios
      .delete('/api/profile')
      .then(res => {
        dispatch({
          type: SET_USER,
          payload: {}
        })
      })
      .catch(err => {
        dispatch({
          type: GET_ERRORS,
          payload: err.response.data
        })
      })
  }
}