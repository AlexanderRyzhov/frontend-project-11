import onChange from 'on-change';
import * as yup from 'yup';

import render from './view.js';

// const urlSchema = yup.string().url();
const validate = async (url, state) => {
  const urlSchema = yup.string()
    .url('введите валидный URL')
    .notOneOf(state.urls, 'Данный URL уже присутствует в списке');
  return urlSchema.validate(url, { abortEarly: false });
};

export default () => {
  // Model
  const state = {
    currentUrl: '',
    urls: [],
    error: null,
    status: '',
  };

  // View
  const watchedState = onChange(state, render);

  // Controller
  const form = document.querySelector('form');
  const inputElement = document.querySelector('input');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const { value } = inputElement;
    watchedState.currentUrl = value;
    validate(value, watchedState)
      .then(() => {
        console.log(`valid currentUrl = ${value}`);
        watchedState.error = null;
        watchedState.urls = [...watchedState.urls, value];
        watchedState.currentUrl = '';
      })
      .catch((error) => {
        console.log(`set watchedState.error = ${error}`);
        [watchedState.error] = error.errors;
      });
  });
};
