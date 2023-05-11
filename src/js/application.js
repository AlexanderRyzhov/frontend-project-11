import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import * as _ from 'lodash';

import ru from './locales/ru.js';
import render from './view.js';
import parseFeed from './parsefeed.js';

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

const addNewPosts = (posts, state) => {
  const newPosts = posts.filter((post) => (_.findIndex(state.data.posts, { guid: post.guid }) < 0));
  if (newPosts.length > 0) {
    state.data.posts = [...state.data.posts, ...newPosts]; // eslint-disable-line no-param-reassign
  }
};

const httpGet = (url) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
  return axios.get(proxyUrl);
};

const checkFeedsUpdate = (state) => {
  const promises = state.data.feeds
    .map((feed) => httpGet(feed.url)
      .then((response) => {
        const { posts } = parseFeed(response.data.contents);
        addNewPosts(posts, state);
      })
      .catch((error) => {
        console.log(error);
      }));
  return Promise.all(promises);
};

const buildInitialState = () => {
  const state = {
    data: {
      currentUrl: '',
      urls: [],
      feeds: [],
      posts: [],
      seenGuids: [],
    },
    feedback: null,
    status: '',
  };
  return state;
};

/* eslint no-param-reassign:
["error", { "props": true, "ignorePropertyModificationsFor": ["watchedState"] }] */
const addModalListener = (watchedState) => {
  const exampleModal = document.querySelector('#modal');
  exampleModal.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    const guid = button.getAttribute('data-bs-guid');
    if (!watchedState.data.seenGuids.includes(guid)) {
      watchedState.data.seenGuids = [guid, ...watchedState.data.seenGuids];
    }
  });
};

const loadFeed = (watchedState) => {
  watchedState.feedback = i18next.t('forms.isLoading');
  watchedState.status = 'sending';
  axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(watchedState.data.currentUrl)}`)
    .then((response) => {
      const { feed, posts } = parseFeed(response.data.contents);
      feed.url = watchedState.data.currentUrl;
      watchedState.data.urls = [...watchedState.data.urls, feed.url];
      watchedState.data.feeds = [...watchedState.data.feeds, feed];
      addNewPosts(posts, watchedState);
      watchedState.data.currentUrl = '';
      watchedState.feedback = i18next.t('forms.success');
      watchedState.status = 'success';
    })
    .catch((error) => {
      switch (error.name) {
        case 'TypeError':
          watchedState.feedback = i18next.t('errors.invalidXml');
          break;
        case 'AxiosError':
          watchedState.feedback = i18next.t('errors.network');
          break;
        default:
          watchedState.feedback = i18next.t('errors.unexpected');
      }
      watchedState.status = 'error';
    });
};

const addFormListener = (watchedState) => {
  const form = document.querySelector('form');
  const inputElement = document.querySelector('input');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const url = inputElement.value;
    watchedState.data.currentUrl = url;
    validate(url, watchedState)
      .then(() => loadFeed(watchedState))
      .catch((error) => {
        [watchedState.feedback] = error.errors;
        watchedState.status = 'error';
      });
  });
};

const app = () => {
  // Model
  const state = buildInitialState();
  // View
  const watchedState = onChange(
    state,
    (path, current, previous) => (render(watchedState, path, current, previous, i18next)),
  );
  // Controller
  addModalListener(watchedState);
  addFormListener(watchedState);

  const fetchFeeds = () => {
    console.log('checkFeedsUpdate');
    checkFeedsUpdate(watchedState)
      .finally(() => setTimeout(fetchFeeds, 5000));
  };
  setTimeout(fetchFeeds, 5000);
};

export default () => {
  init().then(() => app());
};
