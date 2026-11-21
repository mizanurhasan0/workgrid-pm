export default function detectURL(message) {
  // var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  // return message.match(urlRegex);
  const regex = /<a\s+href="([^"]+)"/g;

  // Array to store the extracted URLs
  const urls = [];

  let match;
  while ((match = regex.exec(message)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}