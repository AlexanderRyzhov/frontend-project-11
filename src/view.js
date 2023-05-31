/* eslint no-param-reassign: ["error",
{ "props": true, "ignorePropertyModificationsFor": ["ui"] }] */
import * as _ from 'lodash';

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
  list.append(...elements);
  feedsContainer.replaceChildren(list);
};

const renderModal = (state, modal) => {
  const post = _.find(state.data.posts, { guid: state.currentGuid });
  const modalTitle = modal.querySelector('.modal-title');
  const modalDescription = modal.querySelector('#modalDescription');
  const modalLink = modal.querySelector('#modalLink');
  modalTitle.textContent = post.title;
  modalDescription.textContent = post.description;
  modalLink.href = post.link;
};

const createViewDetailsButton = (post, i18next) => {
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
    if (state.seenGuids.includes(post.guid)) {
      aElement.classList.add('fw-normal', 'link-secondary');
    } else {
      aElement.classList.add('fw-bold');
    }
    aElement.setAttribute('target', '_blank');
    const buttonElement = createViewDetailsButton(post, i18next);
    liElement.replaceChildren(aElement, buttonElement);
    liElement.classList.add('justify-content-between', 'd-flex', 'list-group-item');
    return liElement;
  });
  list.append(...elements);
  postsContainer.replaceChildren(list);
};

const renderStatus = (addFeedStatus, state, ui, i18next) => {
  ui.inputElement.classList.remove('is-invalid');
  switch (addFeedStatus) {
    case 'processing':
      ui.feedback.textContent = i18next.t('forms.isLoading');
      ui.inputElement.setAttribute('readonly', 'true');
      ui.addbuttonElement.setAttribute('disabled', 'true');
      ui.feedback.classList.remove('text-danger');
      break;
    case 'error':
      ui.feedback.textContent = i18next.t(state.errorMessage);
      ui.inputElement.classList.add('is-invalid');
      ui.feedback.classList.add('text-danger');
      ui.inputElement.removeAttribute('readonly');
      ui.addbuttonElement.removeAttribute('disabled');
      break;
    case 'ready':
      ui.feedback.textContent = i18next.t('forms.success');
      ui.inputElement.removeAttribute('readonly');
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

const checkPostSeen = (guid, postsContainer) => {
  const button = postsContainer.querySelector(`button[data-bs-guid="${guid}"]`);
  const link = button.previousSibling;
  link.classList.add('fw-normal', 'link-secondary');
  link.classList.remove('fw-bold');
};

const render = (state, path, value, _previous, i18next) => {
  const ui = buildUiRefs();
  switch (path) {
    case 'errorMessage':
      break;
    case 'data.feeds':
      renderFeeds(value, ui.feedsContainer);
      break;
    case 'addFeedStatus':
      renderStatus(value, state, ui, i18next);
      break;
    case 'currentGuid':
      renderModal(state, ui.modal);
      checkPostSeen(value, ui.postsContainer);
      break;
    case 'seenGuids':
      break;
    case 'data.posts':
      renderPosts(state, ui.postsContainer, i18next);
      break;
    default:
      throw Error(`unknown path: ${path}`);
  }
};

export default render;
