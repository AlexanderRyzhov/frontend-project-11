import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';

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
  const urlSchema = yup.string().required().url().notOneOf(state.data.urls);
  return urlSchema.validate(url, { abortEarly: false });
};

const parseFeed = (contents) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(contents, 'text/xml');
  console.log(xmlDoc);
  const title = xmlDoc.querySelector('channel > title').textContent;
  const description = xmlDoc.querySelector('channel > description').textContent;
  const feed = { title, description };
  const postElements = xmlDoc.querySelectorAll('item');
  const posts = [...postElements].map((element) => {
    const postTitle = element.querySelector('title').textContent;
    const postDescription = element.querySelector('description').textContent;
    const postLink = element.querySelector('link').textContent;
    const post = {
      title: postTitle,
      description: postDescription,
      link: postLink,
    };
    return post;
  });
  return { feed, posts };
};

const app = () => {
  // Model
  const state = {
    data: {
      currentUrl: '',
      urls: [],
      feeds: [],
      posts: [],
    },
    error: null,
    status: '',
  };

  // View
  const watchedState = onChange(
    state,
    (path, current, previous) => (render(watchedState, path, current, previous, i18next)),
  );

  // Controller
  const form = document.querySelector('form');
  const inputElement = document.querySelector('input');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    event.stopImmediatePropagation();
    const { value } = inputElement;
    watchedState.data.currentUrl = value;
    validate(value, watchedState)
      .then(() => {
        console.log(`valid currentUrl = ${value}`);
        watchedState.error = null;
        watchedState.status = 'sending';
        axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(watchedState.data.currentUrl)}`)
          .then((response) => {
          // handle success
            const { feed, posts } = parseFeed(response.data.contents);
            console.log(feed);
            console.log(posts);
            watchedState.data.urls = [...watchedState.data.urls, value];
            watchedState.data.feeds = [...watchedState.data.feeds, feed];
            watchedState.data.posts = [...watchedState.data.posts, ...posts];
            watchedState.data.currentUrl = '';
            watchedState.status = 'ready';
          })
          .catch((error) => {
            console.log(error);
            switch (error.name) {
              case 'TypeError':
                watchedState.error = i18next.t('errors.invalidXml');
                break;
              case 'AxiosError':
                watchedState.error = i18next.t('errors.network');
                break;
              default:
                watchedState.error = i18next.t('errors.unexpected');
            }
            watchedState.status = 'ready';
          });
      })
      .catch((error) => {
        console.log(`set watchedState.error = ${error}`);
        [watchedState.error] = error.errors;
      });
  });
};

export default () => {
  init().then(() => app());
};
