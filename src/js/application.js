import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';

import ru from './locales/ru.js';
import render from './view.js';

const init = async () => {
  i18next.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  }).then(() => {
    yup.setLocale({
      mixed: {
        required: i18next.t('forms.validation.required'),
        notOneOf: i18next.t('forms.validation.notUnique'),
      },
      string: {
        url: i18next.t('forms.validation.url'),
      },
    });
  });
};

const validate = async (url, state) => {
  const urlSchema = yup.string().required().url().notOneOf(state.urls);
  return urlSchema.validate(url, { abortEarly: false });
};

const app = () => {
  // Model
  const state = {
    currentUrl: '',
    urls: [],
    error: null,
    status: '',
  };

  // View
  const watchedState = onChange(
    state,
    (path, current, previous) => (render(watchedState, path, current, previous)),
  );

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

export default () => {
  init()
    .then(() => app());
};
