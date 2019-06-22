const get = require('mout/object/get');
const helperGoogle = require('./helper');
const helperJwt = require('../jwt/helper');
const helperAdminRole = require('../../admin_role/helper');
const {isMongoDB} = require('../../helper');
const errors = require('../../errors');

/**
 * Middleware : Check Google OAuth token
 *
 * @returns {function(*, *, *)}
 */
module.exports = options => {
  const AdminUsers = options.admin_users;
  const AdminRoles = options.admin_roles;
  const authJwt = options.auth_jwt;
  const googleOAuth = options.google_oauth;
  const superRole = options.super_role;

  return (req, res, next) => {
    if (!get(req, 'swagger.operation.security')) {
      // 認証不要なリクエスト
      return next();
    }
    const token = get(req, 'auth.googleOAuthToken');
    if (!token) {
      // google認証を利用していないのでskip
      return next();
    }
    // tokenを使ってメアドが取得できれば有効
    helperGoogle.getMailAddress(token)
      .then(email => {
        if (!email) {
          throw errors.frontend.Unauthorized();
        }
        return;
      })
      .catch(err => {
        const status = get(err, 'response.status') || get(err, 'statusCode');
        if (status !== 401) {
          throw err;
        }

        // トークンリフレッシュ
        return helperGoogle.refreshToken(token, googleOAuth)
          .then(newToken => {
            // 新しいアクセストークンを使ってメアド取得
            return helperGoogle.getMailAddress(newToken)
              .then(email => {
                return {email, token: newToken};
              })
            ;
          })
          .then(data => {
            if (!data.email) {
              throw errors.frontend.Unauthorized();
            }
            // AdminUserを取得
            let p;
            if (isMongoDB(AdminUsers)) {
              p = AdminUsers.findOne({email: data.email});
            } else {
              p = AdminUsers.findOne({where: {email: data.email}});
            }
            return p.then(adminUser => {
              data.adminUser = adminUser;
              return data;
            });

          })
          .then(data => {
            return helperAdminRole.getRoles(AdminRoles, data.adminUser.role_id, superRole)
              .then(roles => {
                const claims = {
                  sub: data.adminUser.email,
                  roles: roles,
                  googleOAuthToken: data.token,
                };
                return helperJwt.sign(claims, authJwt);
              })
            ;
          })
          .then(token => {
            // レスポンスヘッダを更新
            res.setHeader(authJwt.header_key, `Bearer ${token}`);
            // 認証情報も更新
            req.auth = helperJwt.decode(token);
          })
        ;
      })
      .then(next)
      .catch(next)
    ;
  };
};
