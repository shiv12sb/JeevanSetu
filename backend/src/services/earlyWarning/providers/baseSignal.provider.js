/**
 * Abstract Base Signal Provider Interface
 */
class BaseSignalProvider {
  constructor(name, sourceType, isAvailable = false) {
    this.name = name;
    this.sourceType = sourceType;
    this.isAvailable = isAvailable;
  }

  /**
   * Check if data source is currently connected and available
   */
  isSourceAvailable() {
    return this.isAvailable;
  }

  /**
   * Fetch aggregated signal observations for a given geographic scope and time window
   * @param {Object} params
   * @param {string} [params.phcId]
   * @param {string} params.district
   * @param {number} [params.days]
   * @returns {Promise<Array<{date: string, count: number, metricType: string}>>}
   */
  async fetchAggregatedSignal(params) {
    throw new Error(`fetchAggregatedSignal must be implemented by ${this.name}`);
  }
}

module.exports = BaseSignalProvider;
