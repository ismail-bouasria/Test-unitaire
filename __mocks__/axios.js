const axios = {
  create: () => axios,
  post: jest.fn(() => Promise.resolve({ status: 201, data: {} })),
  get: jest.fn(() => Promise.resolve({ status: 200, data: [] })),
};

export default axios;
