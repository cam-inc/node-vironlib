/**
 * Middleware : Set Access-Control Response Headers
 *
 * @param {Object} options
 * @param {string} options.allow_origin
 * @param {string} options.allow_headers
 * @param {string} options.expose_headers
 * @returns {function(*, *, *)}
 */
module.exports = options => {
  const opts = Object.assign({
    allow_headers: 'X-Requested-With, Origin, Content-Type, Accept, Authorization, X-Pagination-Limit, X-Pagination-Total-Pages, X-Pagination-Current-Page',
    expose_headers: 'X-Requested-With, Origin, Content-Type, Accept, Authorization, X-Pagination-Limit, X-Pagination-Total-Pages, X-Pagination-Current-Page',
  }, options);

  return (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', opts.allow_origin || req.get('origin'));
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', opts.allow_headers);
    res.setHeader('Access-Control-Expose-Headers', opts.expose_headers);
    next();
  };
};
