export interface ApiClient {
  get: <T>(path: string) => Promise<T | null>;
  post: <T>(path: string, body: unknown) => Promise<T | null>;
}

export const apiClient: ApiClient = {
  async get(_path) {
    return null;
  },
  async post(_path, _body) {
    return null;
  },
};
