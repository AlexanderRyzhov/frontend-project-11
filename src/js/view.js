const render = (state, path, value, _previous, i18next) => {
  const inputElement = document.querySelector('input');
  const addbuttonElement = document.querySelector('#addbutton');
  const errorElement = document.querySelector('.invalid-feedback');
  const feedsContainer = document.querySelector('#feeds');
  const postsContainer = document.querySelector('#posts');

  switch (path) {
    case 'data.currentUrl':
      console.log(`currentUrl = ${value}`);
      inputElement.value = value;
      break;
    case 'error':
      console.log(`error = ${value}`);
      if (value) {
        inputElement.classList.add('is-invalid');
        errorElement.textContent = value;
      } else {
        inputElement.classList.remove('is-invalid');
        errorElement.textContent = '';
      }
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
    case 'data.posts': {
      const posts = value;
      const list = document.createElement('ul');
      const elements = posts.map((post) => {
        const liElement = document.createElement('li');
        const aElement = document.createElement('a');
        const buttonElement = document.createElement('button');
        aElement.textContent = post.title;
        aElement.href = post.link;
        aElement.setAttribute('target', '_blank');
        buttonElement.textContent = i18next.t('forms.viewButton');
        buttonElement.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        liElement.replaceChildren(aElement, buttonElement);
        liElement.classList.add('justify-content-between', 'd-flex');
        return liElement;
      });
      list.replaceChildren(...elements);
      postsContainer.replaceChildren(list);
      break;
    }
    case 'status':
      if (value === 'sending') {
        inputElement.setAttribute('readonly', 'true');
        addbuttonElement.setAttribute('disabled', 'true');
      } else {
        inputElement.removeAttribute('readonly');
        addbuttonElement.removeAttribute('disabled');
      }
      break;
    default:
      throw new Error(`unexpected change path: ${path}`);
  }
};

export default render;
