class XmlParseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'XmlParseError';
  }
}

const parseFeed = (contents) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(contents, 'text/xml');
  const errorNode = xmlDoc.querySelector('parsererror');
  if (errorNode) {
    throw new XmlParseError();
  }
  const feedTitle = xmlDoc.querySelector('channel > title').textContent;
  const feedDescription = xmlDoc.querySelector('channel > description').textContent;
  const feed = { title: feedTitle, description: feedDescription };
  const postElements = xmlDoc.querySelectorAll('item');
  const posts = [...postElements].map((element) => {
    const title = element.querySelector('title').textContent;
    const description = element.querySelector('description').textContent;
    const link = element.querySelector('link').textContent;
    const guid = element.querySelector('guid').textContent;
    const post = {
      title,
      description,
      link,
      guid,
    };
    return post;
  });
  return { feed, posts };
};

export default parseFeed;
