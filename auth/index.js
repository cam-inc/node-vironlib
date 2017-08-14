const logger = require('../logger');
const controller = require('./controller');
const email = require('./email');
const google = require('./google');
const jwt = require('./jwt');

module.exports = options => {
  if (!options.admin_users) {
    return logger.warn('[DMCLIB] auth options.admin_users required.');
  }
  if (!options.admin_roles) {
    return logger.warn('[DMCLIB] auth options.admin_roles required.');
  }
  if (!options.super_role) {
    return logger.warn('[DMCLIB] auth options.super_role required.');
  }
  if (!options.auth_jwt) {
    return logger.warn('[DMCLIB] auth options.auth_jwt required.');
  }
  if (!options.auth_jwt.algorithm) {
    return logger.warn('[DMCLIB] auth options.auth_jwt.algorithm required.');
  }
  if (options.auth_jwt.algorithm.startsWith('HS')) {
    // HMAC
    if (!options.auth_jwt.secret) {
      return logger.warn('[DMCLIB] auth options.auth_jwt.secret required.');
    }
  } else {
    // RSA
    if (!options.auth_jwt.rsa_private_key) {
      return logger.warn('[DMCLIB] auth options.auth_jwt.rsa_private_key required.');
    }
    if (!options.auth_jwt.rsa_public_key) {
      return logger.warn('[DMCLIB] auth options.auth_jwt.rsa_public_key required.');
    }
  }

  return {
    controller: controller(options),
    email: email(),
    google: google(),
    jwt: jwt(options.auth_jwt),
  };
};
