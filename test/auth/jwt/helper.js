const assert = require('assert');
const jwt = require('jsonwebtoken');

const test = require('../../');
const dmclib = test.dmclib;

describe('auth/jwt/helper', () => {

  const helper = dmclib.auth.jwt.helper;

  describe('sign', () => {

    it('RSASSAで署名できる', async() => {
      const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIBOgIBAAJBALOCFOJGP/dVfp/F27qiQ2fMPx6sGr3DNlrJmlrk7qtxetnuwJso
ueEt7PXQ/2476xfReebSPuGvbqSpP/JK5CcCAwEAAQJAfIvxr3lsYlBYVcSzCtAQ
kpEc7kwdFbK/IMimJxCWJC6jw3CGgA7zS1g42ZhB7ExEb4jOwZ2dvcR1dfZap5BL
+QIhANd1fUDAbZo2mvHnuC0yWrwHDsPUAJkaMwp28lVBSKCrAiEA1Ujdvc2go2wy
Zzl8iUQ3bkS/DNQu+qSkFM4UU1vIYnUCIExXV8L6q5sJoAr4dJynC9k1kvi2BGQ7
ETyy+phUolwzAiEArC9DNHPI96XlmwgBzh9QUKkXQ5gYxSgdft5P8mvqffECIH4R
cEkdhQHcA7hip+ovRAyv+HnrErXeBWijKiQGOGgQ
-----END RSA PRIVATE KEY-----`;

      const publicKey = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALOCFOJGP/dVfp/F27qiQ2fMPx6sGr3D
NlrJmlrk7qtxetnuwJsoueEt7PXQ/2476xfReebSPuGvbqSpP/JK5CcCAwEAAQ==
-----END PUBLIC KEY-----`;


      await helper.sign({
        sub: 'test',
      }, {
        claims: {
          iss: 'issuer',
          aud: 'audience',
        },
        token_expire: 10000,
        rsa_private_key: privateKey,
        algorithm: 'RS256',
      })
        .then(token => {
          assert(token);

          return new Promise((resolve, reject) => {
            jwt.verify(token, publicKey, (err, decoded) => {
              if (err) {
                return reject(err);
              }
              resolve(decoded);
            });
          });
        })
        .then(decoded => {
          assert(decoded);
          assert(decoded.sub === 'test');
          assert(decoded.iss === 'issuer');
          assert(decoded.aud === 'audience');
        })
      ;
    });

    it('HMACで署名できる', async() => {
      const secret = '===secret===';

      await helper.sign({
        sub: 'test',
      }, {
        claims: {
          iss: 'issuer',
          aud: 'audience',
        },
        token_expire: 10000,
        secret: secret,
        algorithm: 'HS256',
      })
        .then(token => {
          assert(token);

          return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
              if (err) {
                return reject(err);
              }
              resolve(decoded);
            });
          });
        })
        .then(decoded => {
          assert(decoded);
          assert(decoded.sub === 'test');
          assert(decoded.iss === 'issuer');
          assert(decoded.aud === 'audience');
        })
      ;
    });

  });
});
