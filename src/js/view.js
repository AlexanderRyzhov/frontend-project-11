import * as _ from 'lodash';

const render = (state, path, value, _previous, i18next) => {
  const inputElement = document.querySelector('#input');
  const addbuttonElement = document.querySelector('#addbutton');
  const feedback = document.querySelector('#feedback');
  const feedsContainer = document.querySelector('#feeds');
  const postsContainer = document.querySelector('#posts');
  const modal = document.querySelector('#modal');

  switch (path) {
    case 'data.currentUrl':
      console.log(`currentUrl = ${value}`);
      inputElement.value = value;
      break;
    case 'feedback':
      break;
    case 'data.urls':
      break;
    case 'data.feeds': {
      const feeds = value;
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
      break;
    }
    case 'data.seenGuids': {
      console.log(`data.seenGuids = ${value}`);
      const guid = value[0];
      const post = _.find(state.data.posts, { guid });
      const modalTitle = modal.querySelector('.modal-title');
      const modalDescription = modal.querySelector('#modalDescription');
      const modalLink = modal.querySelector('#modalLink');
      modalTitle.textContent = post.title;
      modalDescription.textContent = post.description;
      modalLink.href = post.link;
      // falls through
    }
    case 'data.posts': {
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
      break;
    }
    case 'status': {
      const status = value;
      feedback.textContent = state.feedback;
      inputElement.classList.remove('is-invalid');
      switch (status) {
        case 'sending':
          inputElement.setAttribute('readonly', 'true');
          addbuttonElement.setAttribute('disabled', 'true');
          feedback.classList.remove('text-danger');
          break;
        case 'error':
          inputElement.classList.add('is-invalid');
          feedback.classList.add('text-danger');
          // fall through
        case 'success':
          inputElement.removeAttribute('readonly');
          addbuttonElement.removeAttribute('disabled');
          break;
        default:
          break;
      }
      break;
    }
    default:
      throw new Error(`unexpected change path: ${path}`);
  }
};

export default render;
