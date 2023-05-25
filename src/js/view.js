import * as _ from 'lodash';
// eslint-disable-next-line import/no-cycle
import { markPostSeen } from './application.js';

const renderFeeds = (feeds, feedsContainer) => {
  const list = document.createElement('ul');
  const elements = feeds.map((feed) => {
    const liElement = document.createElement('li');
    const h3Element = document.createElement('h3');
    const pElement = document.createElement('p');
    h3Element.textContent = feed.title;
    pElement.textContent = feed.description;
    liElement.replaceChildren(h3Element, pElement);
    return liElement;
  });
  list.replaceChildren(...elements);
  feedsContainer.replaceChildren(list);
};

const renderModal = (guid, state, modal) => {
  const post = _.find(state.data.posts, { guid });
  const modalTitle = modal.querySelector('.modal-title');
  const modalDescription = modal.querySelector('#modalDescription');
  const modalLink = modal.querySelector('#modalLink');
  modalTitle.textContent = post.title;
  modalDescription.textContent = post.description;
  modalLink.href = post.link;
};

const createButton = (post, i18next) => {
  const button = document.createElement('button');
  button.textContent = i18next.t('forms.viewButton');
  button.classList.add('btn', 'btn-primary', 'btn-sm');
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#modal');
  button.setAttribute('data-bs-guid', post.guid);
  return button;
};

const renderPosts = (state, postsContainer, i18next) => {
  const { posts } = state.data;
  const list = document.createElement('ul');
  list.classList.add('list-group');
  const elements = posts.map((post) => {
    const liElement = document.createElement('li');
    const aElement = document.createElement('a');
    aElement.textContent = post.title;
    aElement.href = post.link;
    if (post.seen) {
      aElement.classList.add('fw-normal', 'link-secondary');
    } else {
      aElement.classList.add('fw-bold');
    }
    aElement.setAttribute('target', '_blank');
    const buttonElement = createButton(post, i18next);
    aElement.addEventListener('click', () => {
      const { guid } = post;
      // eslint-disable-next-line no-param-reassign
      state.currentGuid = guid;
      markPostSeen(guid, state);
    });
    liElement.replaceChildren(aElement, buttonElement);
    liElement.classList.add('justify-content-between', 'd-flex', 'list-group-item');
    return liElement;
  });
  list.replaceChildren(...elements);
  postsContainer.replaceChildren(list);
};

const renderStatus = (addFeedStatus, state, ui) => {
  // eslint-disable-next-line no-param-reassign
  ui.feedback.textContent = state.feedback;
  ui.inputElement.classList.remove('is-invalid');
  switch (addFeedStatus) {
    case 'processing':
    case 'sending':
      ui.inputElement.setAttribute('readonly', 'true');
      ui.addbuttonElement.setAttribute('disabled', 'true');
      ui.feedback.classList.remove('text-danger');
      break;
    case 'error':
      ui.inputElement.classList.add('is-invalid');
      ui.feedback.classList.add('text-danger');
      ui.inputElement.removeAttribute('readonly');
      ui.addbuttonElement.removeAttribute('disabled');
      break;
    case 'ready':
      ui.inputElement.removeAttribute('readonly');
      // eslint-disable-next-line no-param-reassign
      ui.inputElement.value = '';
      ui.addbuttonElement.removeAttribute('disabled');
      break;
    default:
      break;
  }
};

const buildUiRefs = () => {
  const ui = {
    inputElement: document.querySelector('#input'),
    addbuttonElement: document.querySelector('#addbutton'),
    feedback: document.querySelector('#feedback'),
    feedsContainer: document.querySelector('#feeds'),
    postsContainer: document.querySelector('#posts'),
    modal: document.querySelector('#modal'),
  };
  return ui;
};

const render = (state, path, value, _previous, i18next) => {
  const ui = buildUiRefs();
  switch (path) {
    case 'feedback':
      break;
    case 'data.feeds':
      renderFeeds(value, ui.feedsContainer);
      break;
    case 'addFeedStatus':
      renderStatus(value, state, ui);
      break;
    case 'currentGuid':
      renderModal(value, state, ui.modal);
    // eslint-disable-next-line no-fallthrough
    case 'data.posts':
      renderPosts(state, ui.postsContainer, i18next);
      break;
    default:
      renderPosts(state, ui.postsContainer, i18next);
  }
};

export default render;
