const controller = require('./controller');
const email = require('./email');
const google = require('./google');
const jwt = require('./jwt');

module.exports = options => {
  if (!options.AdminUsers) {
    return console.warn('[DMCLIB] auth options.AdminUsers required.');
  }
  if (!options.AdminRoles) {
    return console.warn('[DMCLIB] auth options.AdminRoles required.');
  }
  if (!options.super_role) {
    return console.warn('[DMCLIB] auth options.super_role required.');
  }
  if (!options.auth_jwt) {
    return console.warn('[DMCLIB] auth options.auth_jwt required.');
  }
  if (!options.auth_jwt.algorithm) {
    return console.warn('[DMCLIB] auth options.auth_jwt.algorithm required.');
  }
  if (!options.auth_jwt.rsa_private_key) {
    return console.warn('[DMCLIB] auth options.auth_jwt.rsa_private_key required.');
  }
  if (!options.auth_jwt.rsa_public_key) {
    return console.warn('[DMCLIB] auth options.auth_jwt.rsa_public_key required.');
  }

  return {
    controller: controller(options),
    email: email(),
    google: google(),
    jwt: jwt(options.auth_jwt),
  };
};
