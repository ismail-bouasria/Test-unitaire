import axios from 'axios';

// Simple API wrapper. Uses JSONPlaceholder for demo purposes.
const API_BASE = 'https://jsonplaceholder.typicode.com';

const client = axios.create({ baseURL: API_BASE, timeout: 5000 });

export async function postSignup(payload) {
  // POST to /posts (JSONPlaceholder) to simulate creation
  const res = await client.post('/posts', payload);
  return res;
}

export async function getSignups() {
  const res = await client.get('/posts');
  return res;
}

export default { postSignup, getSignups };
