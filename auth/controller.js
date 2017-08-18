const reduce = require('mout/object/reduce');

const logger = require('../logger');
const helperGoogle = require('./google/helper');
const helperJwt = require('./jwt/helper');
const helperEMail = require('./email/helper');

const errors = require('../errors');

const getRoles = (AdminRoles, roleId, superRole) => {
  if (roleId === superRole) {
    return new Promise(resolve => {
      resolve({
        get: ['*'],
        post: ['*'],
        put: ['*'],
        delete: ['*'],
        patch: ['*'],
      });
    });
  }

  return AdminRoles.findAll({where: {role_id: roleId}})
    .then(roles => {
      return reduce(roles, (ret, role) => {
        const method = role.method.toLowerCase();
        ret[method] = ret[method] || [];
        ret[method].push(role.resource);
        return ret;
      }, {});
    })
  ;
};

/**
 * Controller : Sing In
 * HTTP Method : POST
 * PATH : /signin
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_users
 * @param {Sequelize.model} options.admin_roles
 * @param {String} options.super_role
 * @param {Object} options.auth_jwt
 * @returns {function(*, *, *)}
 */
const registerSignIn = options => {
  const AdminUsers = options.admin_users;
  const AdminRoles = options.admin_roles;
  const superRole = options.super_role;
  const authJwt = options.auth_jwt;

  return (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // メアドでユーザ検索
    return AdminUsers.findOne({where: {email}})
      .then(adminUser => {
        if (adminUser) {
          return adminUser;
        }

        // 1人目かどうか
        return AdminUsers.count()
          .then(cnt => {
            if (cnt > 0) {
              // 1人目じゃなければエラー（管理者がユーザー作成してあげる）
              return Promise.reject(errors.frontend.AdminUserNotFound());
            }
          })
          .then(() => {
            // 1人目の場合はスーパーユーザーとして登録する
            // - パスワードソルトの生成
            return helperEMail.genSalt();
          })
          .then(salt => {
            // - パスワードのハッシュ化
            return helperEMail.genHash(password, salt)
              .then(password => {
                return {password, salt};
              })
            ;
          })
          .then(data => {
            data.email = email;
            data.role_id = superRole;
            return AdminUsers.create(data);
          })
        ;
      })
      .then(adminUser => {
        // パスワード検証
        return helperEMail.verify(password, adminUser.password, adminUser.salt)
          .then(result => {
            if (!result) {
              return Promise.reject(errors.frontend.SigninFailed());
            }
            return adminUser;
          })
        ;
      })
      .then(adminUser => {
        // ロールを取得
        return getRoles(AdminRoles, adminUser.role_id, superRole);
      })
      .then(roles => {
        // JWTを生成
        const claims = {
          sub: email,
          roles: roles,
        };
        return helperJwt.sign(claims, authJwt);
      })
      .then(token => {
        res.setHeader(authJwt.header_key, `Bearer ${token}`);
        return res.end();
      })
    ;
  };
};

/**
 * Controller : Sing Out
 * HTTP Method : POST
 * PATH : /signout
 *
 * @returns {function(*, *, *)}
 */
const registerSignOut = () => {
  return (req, res) => {
    return Promise.resolve(() => {
      return res.end();
    });
  };
};

/**
 * Controller : Sing In (Google)
 * HTTP Method : POST
 * PATH : /googlesignin
 *
 * @param {Object} options
 * @param {Object} options.google_oauth
 * @returns {function(*, *, *)}
 */
const registerGoogleSignIn = options => {
  const googleOAuth = options.google_oauth;
  if (!googleOAuth) {
    logger.info('[DMCLIB] auth /googlesignin skip.');
    return (req, res) => {
      return Promise.resolve(() => {
        logger.error('[DMCLIB] auth /googlesignin is not registered.');
        return res.json(errors.frontend.NotFound());
      });
    };
  }

  return (req, res) => {
    return Promise.resolve(() => {
      // Googleの認証画面にリダイレクト
      const authUrl = helperGoogle.genAuthUrl(googleOAuth, req.get('referer'));
      return res.redirect(authUrl); // 301
    });
  };
};

/**
 * Controller : OAuth callback (Google)
 * HTTP Method : GET
 * PATH : /googleoauth2callback
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_users
 * @param {Sequelize.model} options.admin_roles
 * @param {Object} options.google_oauth
 * @param {Object} options.auth_jwt
 * @returns {function(*, *, *)}
 */
const registerGoogleOAuth2Callback = options => {
  const AdminUsers = options.admin_users;
  const AdminRoles = options.admin_roles;
  const googleOAuth = options.google_oauth;
  const authJwt = options.auth_jwt;
  const superRole = options.super_role;
  const defaultRole = options.default_role;

  if (!googleOAuth) {
    logger.info('[DMCLIB] auth /googleoauth2callback skip.');
    return (req, res) => {
      return Promise.resolve(() => {
        logger.error('[DMCLIB] auth /googleoauth2callback is not registered.');
        return res.json(errors.frontend.NotFound());
      });
    };
  }

  return (req, res) => {
    const redirectUrl = req.query.state;

    // アクセストークンを取得
    return helperGoogle.getToken(req.query.code, googleOAuth)
      .then(token => {
        // メールアドレスを検証
        return helperGoogle.allowMailDomain(token, googleOAuth)
          .then(email => {
            if (!email) {
              return Promise.reject(errors.frontend.Forbidden());
            }
            return {token, email};
          })
        ;
      })
      .then(data => {
        // メアドでユーザ検索
        return AdminUsers.findOne({where: {email: data.email}})
          .then(adminUser => {
            if (adminUser) {
              return adminUser;
            }

            // 1人目かどうか
            return AdminUsers.count()
              .then(cnt => {
                // 1人目の場合はスーパーユーザー、2人目以降はデフォルトロールで登録する
                const roleId = cnt > 0 ? defaultRole : superRole;
                return AdminUsers.create({email: data.email, role_id: roleId});
              })
            ;
          })
          .then(adminUser => {
            // ロールを取得
            return getRoles(AdminRoles, adminUser.role_id, superRole);
          })
          .then(roles => {
            // JWTを生成
            const claims = {
              sub: data.email,
              roles: roles,
              googleOAuthToken: data.token,
            };
            return helperJwt.sign(claims, authJwt);
          })
        ;
      })
      .then(token => {
        const authToken = `Bearer ${token}`;
        res.setHeader(authJwt.header_key, authToken);
        return res.redirect(`${redirectUrl}?token=${authToken}`);
      })
      .catch(() => {
        return res.redirect(redirectUrl);
      })
    ;
  };
};

module.exports = options => {
  return {
    signIn: registerSignIn(options),
    signOut: registerSignOut(options),
    googleSignIn: registerGoogleSignIn(options),
    googleOAuth2Callback: registerGoogleOAuth2Callback(options),
  };
};
