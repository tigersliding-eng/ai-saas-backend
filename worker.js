export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Route to backend
    const backendUrl = `http://127.0.0.1:3000${url.pathname}${url.search}`;
    
    return fetch(backendUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
  }
};
