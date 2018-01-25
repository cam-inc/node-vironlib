const constants = require('../constants');

/**
 * レスポンスヘッダ−にpagination情報を付加する
 * @param {Response} res
 * @param {number} limit
 * @param {number} offset
 * @param {number} count
 */
const setResHeader = options => {
  return (res, limit, offset, count) => {
    limit = Number(limit || options.limit || constants.DEFAULT_PAGER_LIMIT);
    offset = Number(offset || 0);

    const totalPages = Math.ceil(count / limit);
    const currentPage = Math.ceil((offset + 1) / limit);

    res.setHeader('X-Pagination-Limit', limit);
    res.setHeader('X-Pagination-Total-Pages', totalPages);
    res.setHeader('X-Pagination-Current-Page', currentPage);
  };
};

module.exports = options => {
  if (options.limit) {
    constants.DEFAULT_PAGER_LIMIT = options.limit;
  }
  return {
    setResHeader: setResHeader(options),
    defaultLimit: constants.DEFAULT_PAGER_LIMIT,
  };
};
