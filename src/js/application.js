/* eslint no-param-reassign: ["error",
{ "props": true, "ignorePropertyModificationsFor": ["watchedState"] }] */
import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import * as _ from 'lodash';

import resources from './locales/index.js';
// eslint-disable-next-line import/no-cycle
import render from './view.js';
import parseFeed from './parsefeed.js';

const init = async () => {
  const i18nextInstance = i18next.createInstance();
  return i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  }).then(() => {
    yup.setLocale({
      mixed: {
        required: i18nextInstance.t('forms.validation.required'),
        notOneOf: i18nextInstance.t('forms.validation.notUnique'),
      },
      string: {
        url: i18nextInstance.t('forms.validation.url'),
      },
    });
    return i18nextInstance;
  });
};

const validate = async (url, urls) => {
  const urlSchema = yup.string().required().url().notOneOf(urls);
  return urlSchema.validate(url, { abortEarly: false });
};

const addNewPosts = (posts, state) => {
  const newPosts = posts.filter((post) => (_.findIndex(state.data.posts, { guid: post.guid }) < 0));
  if (newPosts.length > 0) {
    state.data.posts.push(...newPosts);
  }
};

const getUrlWithProxy = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const httpGet = (url) => {
  const urlWithProxy = getUrlWithProxy(url);
  return axios.get(urlWithProxy);
};

const buildInitialState = () => {
  const state = {
    data: {
      feeds: [],
      posts: [],
    },
    feedback: null,
    addFeedStatus: 'ready',
  };
  return state;
};

export const markPostSeen = (guid, watchedState) => {
  const post = watchedState.data.posts.find((feed) => feed.guid === guid);
  post.seen = true;
};

const loadFeed = (url, watchedState, i18nextInstance) => {
  watchedState.feedback = i18nextInstance.t('forms.isLoading');
  watchedState.addFeedStatus = 'sending';
  httpGet(url)
    .then((response) => {
      const { feed, posts } = parseFeed(response.data.contents);
      feed.url = url;
      watchedState.data.feeds.push(feed);
      addNewPosts(posts, watchedState);
      watchedState.feedback = i18nextInstance.t('forms.success');
      watchedState.addFeedStatus = 'ready';
    })
    .catch((error) => {
      switch (error.name) {
        case 'XmlParseError':
          watchedState.feedback = i18nextInstance.t('errors.xmlParseError');
          break;
        case 'AxiosError':
          watchedState.feedback = i18nextInstance.t('errors.network');
          break;
        default:
          watchedState.feedback = i18nextInstance.t('errors.unexpected');
      }
      watchedState.addFeedStatus = 'error';
    });
};

const app = (i18nextInstance) => {
  // Model
  const state = buildInitialState();
  // View
  const watchedState = onChange(
    state,
    (path, current, previous) => {
      render(watchedState, path, current, previous, i18nextInstance);
    },
  );

  // Controller
  // add show modal listener
  const exampleModal = document.querySelector('#modal');
  exampleModal.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    const guid = button.getAttribute('data-bs-guid');
    watchedState.currentGuid = guid;
    markPostSeen(guid, watchedState);
  });
  // add form submit listener
  const form = document.querySelector('form');
  const inputElement = document.querySelector('input');
  form.addEventListener('submit', (event) => {
    watchedState.addFeedStatus = 'processing';
    event.preventDefault();
    const url = inputElement.value;
    const urls = watchedState.data.feeds.map((feed) => feed.url);
    validate(url, urls)
      .then(() => loadFeed(url, watchedState, i18nextInstance))
      .catch((error) => {
        [watchedState.feedback] = error.errors;
        watchedState.addFeedStatus = 'error';
      });
  });
  // set periodical fetch feeds
  const repeatIntervalMs = 5000;
  const fetchFeeds = () => {
    const promises = watchedState.data.feeds
      .map((feed) => httpGet(feed.url)
        .then((response) => {
          const { posts } = parseFeed(response.data.contents);
          addNewPosts(posts, watchedState);
        }).catch((error) => {
          console.log(error);
        }));
    Promise.all(promises)
      .finally(() => setTimeout(fetchFeeds, 5000));
  };
  setTimeout(fetchFeeds, repeatIntervalMs);
};

export default () => {
  init().then((i18nextInstance) => app(i18nextInstance));
};
