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
  list.replaceChildren(...elements);
  feedsContainer.replaceChildren(list);
};

const renderModal = (guids, state, modal) => {
  console.log(`data.seenGuids = ${guids}`);
  const guid = guids[0];
  const post = _.find(state.data.posts, { guid });
  const modalTitle = modal.querySelector('.modal-title');
  const modalDescription = modal.querySelector('#modalDescription');
  const modalLink = modal.querySelector('#modalLink');
  modalTitle.textContent = post.title;
  modalDescription.textContent = post.description;
  modalLink.href = post.link;
};

const renderPosts = (state, postsContainer, i18next) => {
  const { posts } = state.data;
  const list = document.createElement('ul');
  list.classList.add('list-group');
  const elements = posts.map((post) => {
    const liElement = document.createElement('li');
    const aElement = document.createElement('a');
    const buttonElement = document.createElement('button');
    aElement.textContent = post.title;
    aElement.href = post.link;
    if (state.data.seenGuids.includes(post.guid)) {
      aElement.classList.add('fw-normal', 'link-secondary');
    } else {
      aElement.classList.add('fw-bold');
    }
    aElement.setAttribute('target', '_blank');
    buttonElement.textContent = i18next.t('forms.viewButton');
    buttonElement.classList.add('btn', 'btn-primary', 'btn-sm');
    buttonElement.setAttribute('data-bs-toggle', 'modal');
    buttonElement.setAttribute('data-bs-target', '#modal');
    buttonElement.setAttribute('data-bs-guid', post.guid);
    liElement.replaceChildren(aElement, buttonElement);
    liElement.classList.add('justify-content-between', 'd-flex', 'list-group-item');
    return liElement;
  });
  list.replaceChildren(...elements);
  postsContainer.replaceChildren(list);
};

/* eslint no-param-reassign:
["error", { "props": true, "ignorePropertyModificationsFor": ["ui"] }] */
const renderStatus = (status, state, ui) => {
  ui.feedback.textContent = state.feedback;
  ui.inputElement.classList.remove('is-invalid');
  switch (status) {
    case 'sending':
      ui.inputElement.setAttribute('readonly', 'true');
      ui.addbuttonElement.setAttribute('disabled', 'true');
      ui.feedback.classList.remove('text-danger');
      break;
    case 'error':
      ui.inputElement.classList.add('is-invalid');
      ui.feedback.classList.add('text-danger');
      // fall through
    case 'success':
      ui.inputElement.removeAttribute('readonly');
      ui.addbuttonElement.removeAttribute('disabled');
      break;
    default:
      break;
  }
};

const render = (state, path, value, _previous, i18next) => {
  const ui = {
    inputElement: document.querySelector('#input'),
    addbuttonElement: document.querySelector('#addbutton'),
    feedback: document.querySelector('#feedback'),
    feedsContainer: document.querySelector('#feeds'),
    postsContainer: document.querySelector('#posts'),
    modal: document.querySelector('#modal'),
  };
  switch (path) {
    case 'data.currentUrl':
      ui.inputElement.value = value;
      break;
    case 'feedback':
      break;
    case 'data.urls':
      break;
    case 'data.feeds': {
      renderFeeds(value, ui.feedsContainer);
      break;
    }
    case 'data.seenGuids': {
      renderModal(value, state, ui.modal);
      // falls through
    }
    case 'data.posts': {
      renderPosts(state, ui.postsContainer, i18next);
      break;
    }
    case 'status': {
      renderStatus(value, state, ui);
      break;
    }
    default:
      throw new Error(`unexpected change path: ${path}`);
  }
};

export default render;
