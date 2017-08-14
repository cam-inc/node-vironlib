const controller = require('./controller');
const email = require('./email');
const google = require('./google');
const jwt = require('./jwt');

module.exports = options => {
  if (!options.admin_users) {
    return console.warn('[DMCLIB] auth options.admin_users required.');
  }
  if (!options.admin_roles) {
    return console.warn('[DMCLIB] auth options.admin_roles required.');
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
