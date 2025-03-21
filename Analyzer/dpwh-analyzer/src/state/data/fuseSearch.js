import Fuse from 'fuse.js';

const fuseOptions = {
  keys: ['dsc'], // Keys to search in
  includeScore: true,        // Include score in results
  threshold: 0.1  ,            // Lower threshold for more accurate matches
  findAllMatches: true,
  ignoreLocation: true,
  includeMatches: false,
  ignoreFieldNorm: true,
  useExtendedSearch: true
};

class FuseSearch {
    constructor() {
      this.fuseIndex = null;
    }
  
    setFuse(items) {
      console.log('[FUSE] Initialized', items.length);
      this.fuseIndex = Fuse.createIndex(fuseOptions.keys, items)
    }
  
    search(query, items) {
      if (!this.fuseIndex) {
        throw new Error('fuseIndex instance not initialized');
      }
      console.log('[FUSE] search', query);
      const fuse = new Fuse(items, fuseOptions, this.fuseIndex);
      const ret =  fuse.search(query);
      return ret;
    }
  }
  
export const fuseSearch = new FuseSearch(); // singleton object