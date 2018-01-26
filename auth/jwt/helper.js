const jwt = require('jsonwebtoken');

/**
 * jwt claimsに署名し、トークンを取得する
 * @param claims {object} jwt claims
 * @param options {object}
 */
const sign = (claims, options) => {
  return jwt.sign(
    Object.assign({
      exp: Math.floor((Date.now() + (options.token_expire || 24*60*60*1000)) / 1000), // Tokenの有効期限
      iat: Math.floor(Date.now() / 1000), // Tokenを発行した日時
      nbf: 0, // Tokenが有効になる日時
      // claimsでoverride
      sub: '', // ユーザー識別子
      // options.claimsでoverride
      iss: '', // Token発行者
      aud: '', // このTokenを利用する対象の識別子
    }, options.claims, claims),
    options.algorithm.startsWith('HS') ? options.secret : new Buffer(options.rsa_private_key),
    {
      algorithm: options.algorithm,
    }
  );
};

/**
 * jwt をデコードする
 * @param {string} token - jwt
 */
const decode = token => {
  return jwt.decode(token);
};

module.exports = {
  sign,
  decode,
};
