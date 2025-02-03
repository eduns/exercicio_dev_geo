export default function generateId () {
  const timestamp = Date.now();

  const randomNumber = Math.floor(Math.random() * 9000) + 1000;

  return parseInt(`${timestamp}${randomNumber}`);
}