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
    res.header('Access-Control-Allow-Origin', opts.allow_origin || req.get('origin'));
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', opts.allow_headers);
    res.header('Access-Control-Expose-Headers', opts.expose_headers);
    next();
  };
};
