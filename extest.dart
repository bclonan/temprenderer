const IntegerContainerInterface = require('./integerContainerInterface');

class IntegerContainer extends IntegerContainerInterface {
  constructor() {
    super();
    // TODO: implement
    this.data = [];
  }
  
    /**
   * add(value) -> number
   * Adds value and returns the count after addition.
   */
  add(value) {
    this.data.push(value);
    return this.data.length;
  }

  /**
   * delete(value) -> boolean
   * Removes one occurrence if present, returns true if removed else false.
   */
  delete(value) {
    const idx = this.data.indexOf(value);
    if (idx === -1) return false;

    this.data.splice(idx, 1);
    return true;
  }
  
  getMedian() {
    if(Array.isArray(this.data) && this.data.length) {
      const sorted = [...this.data].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      
      return sorted.length % 2 !== 0 
        ? sorted[mid]
        : (sorted[mid-1])
    }
    return null;
  }
}

module.exports = IntegerContainer;
