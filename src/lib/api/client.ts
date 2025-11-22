export interface ApiClient {
  get: <T>(path: string) => Promise<T | null>;
  post: <T>(path: string, body: unknown) => Promise<T | null>;
}

export const apiClient: ApiClient = {
  async get(path) {
    void path;
    return null;
  },
  async post(path, body) {
    void path;
    void body;
    return null;
  },
};
