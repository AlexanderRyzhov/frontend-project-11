const render = (path, value) => {
  const inputElement = document.querySelector('input');
  const errorElement = document.querySelector('.invalid-feedback');

  switch (path) {
    case 'currentUrl':
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
    case 'urls':
      break;
    default:
      throw new Error(`unexpected change path: ${path}`);
  }
};

export default render;
