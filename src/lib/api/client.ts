export interface ApiClient {
  get: <T>(path: string) => Promise<T | null>;
  post: <T>(path: string, body: unknown) => Promise<T | null>;
  put: <T>(path: string, body: unknown) => Promise<T | null>;
  delete: <T>(path: string) => Promise<T | null>;
}

// Mock delay to simulate network latency (realistic feedback)
const simulateNetworkDelay = () => 
  new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

export const apiClient: ApiClient = {
  async get(path) {
    await simulateNetworkDelay();
    console.log(`[API] GET ${path}`);
    return null;
  },
  async post(path, body) {
    await simulateNetworkDelay();
    console.log(`[API] POST ${path}`, body);
    return null;
  },
  async put(path, body) {
    await simulateNetworkDelay();
    console.log(`[API] PUT ${path}`, body);
    return null;
  },
  async delete(path) {
    await simulateNetworkDelay();
    console.log(`[API] DELETE ${path}`);
    return null;
  },
};
