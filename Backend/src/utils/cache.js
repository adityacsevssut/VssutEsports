const NodeCache = require('node-cache');
// Cache lasts for 10 minutes by default (600 seconds)
const apiCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

module.exports = apiCache;
