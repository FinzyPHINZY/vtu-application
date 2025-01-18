import NodeCache from 'node-cache';

class TokenCache {
  constructor() {
    this.cache = new NodeCache({
      checkPeriod: 60, //60 seconds --update to 40 mins later
    });
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl) {
    return this.cache.set(key, value, ttl);
  }

  delete(key) {
    return this.cache.del(key);
  }
}

export default TokenCache;
