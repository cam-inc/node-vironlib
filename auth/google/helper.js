const axios = require('axios');
const {google} = require('googleapis');
const contains = require('mout/array/contains');
const get = require('mout/object/get');

const errors = require('../../errors');

const AUTH_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
];

const getClient = options => {
  return new google.auth.OAuth2(
    options.client_id,
    options.client_secret,
    options.redirect_url
  );
};

const genAuthUrl = (options, stateUrl) => {
  const client = getClient(options);
  return client.generateAuthUrl({
    approval_prompt: 'force',
    access_type: 'offline',
    scope: AUTH_SCOPES,
    state: stateUrl,
  });
};

const getToken = (code, options) => {
  const client = getClient(options);
  return new Promise((resolve, reject) => {
    client.getToken(code, (err, token) => {
      if (err) {
        const e = errors.external.ExternalServerError(err.code);
        e.orig_error = err;
        return reject(e);
      }
      resolve(token);
    });
  });
};

const getMailAddress = async token => {
  const url = 'https://www.googleapis.com/oauth2/v2/userinfo';
  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `OAuth ${token.access_token}`,
      },
    });
    return res.data.email;
  } catch (err) {
    const status = get(err, 'response.status');
    const e = errors.external.ExternalServerError(status);
    e.orig_error = err;
    throw e;
  }
};

const allowMailDomain = async (token, options) => {
  const email = await getMailAddress(token);
  const domain = email.split('@')[1];
  return contains(options.allow_email_domains, domain) && email;
};

const refreshToken = (token, options) => {
  const client = getClient(options);

  if (client.refreshToken) {
    return client.refreshToken(token.refresh_token)
      .then(newToken => {
        if (!newToken.refresh_token) {
          newToken.refresh_token = token.refresh_token;
        }
        return newToken;
      })
      .catch(err => {
        const e = errors.external.ExternalServerError(err.code);
        e.orig_error = err;
        throw e;
      });
  }

  return new Promise((resolve, reject) => {
    client.refreshToken_(token.refresh_token, (err, newToken) => {
      if (err) {
        const e = errors.external.ExternalServerError(err.code);
        e.orig_error = err;
        return reject(e);
      }
      if (!newToken.refresh_token) {
        newToken.refresh_token = token.refresh_token;
      }
      resolve(newToken);
    });
  });
};

module.exports = {
  getClient,
  genAuthUrl,
  getToken,
  getMailAddress,
  allowMailDomain,
  refreshToken,
};
