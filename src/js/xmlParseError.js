class XmlParseError extends Error {
  constructor(message) {
    super(message); // (1)
    this.name = 'XmlParseError'; // (2)
  }
}

export default XmlParseError;
