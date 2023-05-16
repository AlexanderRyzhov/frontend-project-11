/* eslint no-param-reassign: ["error",
{ "props": true, "ignorePropertyModificationsFor": ["watchedState"] }] */
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
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return axios.get(urlWithProxy);
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

const markGuidSeen = (guid, watchedState) => {
  if (!watchedState.data.seenGuids.includes(guid)) {
    watchedState.data.seenGuids = [guid, ...watchedState.data.seenGuids];
  }
};

const addLinkClickListener = (watchedState) => {
  const links = document.querySelectorAll('#posts>ul>li>a');
  links.forEach((linkElement) => {
    console.log(linkElement);
    linkElement.addEventListener('click', () => {
      const button = linkElement.nextSibling;
      const guid = button.getAttribute('data-bs-guid');
      markGuidSeen(guid, watchedState);
    });
  });
};

const loadFeed = (watchedState) => {
  watchedState.feedback = i18next.t('forms.isLoading');
  watchedState.status = 'sending';
  httpGet(watchedState.data.currentUrl)
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
        case 'XmlParseError':
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

const app = () => {
  // Model
  const state = buildInitialState();
  // View
  const watchedState = onChange(
    state,
    (path, current, previous) => {
      render(watchedState, path, current, previous, i18next);
      addLinkClickListener(watchedState);
    },
  );

  // Controller
  // add show modal listener
  const exampleModal = document.querySelector('#modal');
  exampleModal.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    const guid = button.getAttribute('data-bs-guid');
    markGuidSeen(guid, watchedState);
  });
  // add form submit listener
  const form = document.querySelector('form');
  const inputElement = document.querySelector('input');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = inputElement.value;
    watchedState.data.currentUrl = url;
    validate(url, watchedState)
      .then(() => loadFeed(watchedState))
      .catch((error) => {
        [watchedState.feedback] = error.errors;
        watchedState.status = 'error';
      });
  });
  // set periodical fetch feeds
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
