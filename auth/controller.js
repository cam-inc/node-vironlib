const asyncWrapper = require('../async_wrapper');
const logger = require('../logger');
const helperGoogle = require('./google/helper');
const helperJwt = require('./jwt/helper');
const helperEMail = require('./email/helper');
const {
  isMongoDB
} = require('../helper');

const errors = require('../errors');
const {
  AUTH_TYPE_EMAIL,
  AUTH_TYPE_GOOGLE
} = require('../constants');

/**
 * Controller : Sing In
 * HTTP Method : POST
 * PATH : /signin
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_users
 * @param {String} options.super_role
 * @param {Object} options.auth_jwt
 * @returns {function(*, *, *)}
 */
const registerSignIn = options => {
  const AdminUsers = options.admin_users;
  const superRole = options.super_role;
  const authJwt = options.auth_jwt;

  return asyncWrapper(async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // メアドでユーザ検索
    let adminUser;
    if (isMongoDB(AdminUsers)) { // MongoDB
      adminUser = await AdminUsers.findOne({
        email: email
      });
    } else { // MySQL
      adminUser = await AdminUsers.findOne({
        where: {
          email
        }
      });
    }

    if (!adminUser) {
      // 1人目かどうか
      const cnt = await AdminUsers.count();
      if (cnt > 0) {
        // 1人目じゃなければエラー（管理者がユーザー作成してあげる）
        throw errors.frontend.AdminUserNotFound();
      }
      // 1人目の場合はスーパーユーザーとして登録する
      // - パスワードソルトの生成
      const salt = await helperEMail.genSalt();
      // - パスワードのハッシュ化
      const hashedPassword = await helperEMail.genHash(password, salt);
      adminUser = await AdminUsers.create({
        salt,
        email,
        password: hashedPassword,
        role_id: superRole,
        auth_type: AUTH_TYPE_EMAIL
      });
    }

    // パスワード検証
    const verified = await helperEMail.verify(password, adminUser.password, adminUser.salt);
    if (!verified) {
      return res.json(errors.frontend.SigninFailed());
    }

    // JWTを生成
    const claims = {
      sub: email
    };
    const token = await helperJwt.sign(claims, authJwt);
    res.setHeader(authJwt.header_key, `Bearer ${token}`);
    return res.end();
  });
};

/**
 * Controller : Sing Out
 * HTTP Method : POST
 * PATH : /signout
 *
 * @returns {function(*, *, *)}
 */
const registerSignOut = () => {
  return asyncWrapper(async (req, res) => {
    return res.end();
  });
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
    logger.info('[VIRONLIB] auth /googlesignin skip.');
    return asyncWrapper(async (req, res) => {
      logger.error('[VIRONLIB] auth /googlesignin is not registered.');
      return res.json(errors.frontend.NotFound());
    });
  }

  return asyncWrapper(async (req, res) => {
    // Googleの認証画面にリダイレクト
    const authUrl = helperGoogle.genAuthUrl(googleOAuth, req.query.redirect_url || req.get('referer'));
    return res.redirect(authUrl); // 301
  });
};

/**
 * Controller : OAuth callback (Google)
 * HTTP Method : GET
 * PATH : /googleoauth2callback
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_users
 * @param {Object} options.google_oauth
 * @param {Object} options.auth_jwt
 * @returns {function(*, *, *)}
 */
const registerGoogleOAuth2Callback = options => {
  const AdminUsers = options.admin_users;
  const googleOAuth = options.google_oauth;
  const authJwt = options.auth_jwt;
  const superRole = options.super_role;
  const defaultRole = options.default_role;

  if (!googleOAuth) {
    logger.info('[VIRONLIB] auth /googleoauth2callback skip.');
    return asyncWrapper(async (req, res) => {
      logger.error('[VIRONLIB] auth /googleoauth2callback is not registered.');
      return res.json(errors.frontend.NotFound());
    });
  }

  return asyncWrapper(async (req, res) => {
    const redirectUrl = req.query.state;

    try {
      // アクセストークンを取得
      const token = await helperGoogle.getToken(req.query.code, googleOAuth);
      // メールアドレスを検証
      const email = await helperGoogle.allowMailDomain(token, googleOAuth);
      if (!email) {
        throw errors.frontend.Forbidden();
      }

      // メアドでユーザ検索
      let adminUser;
      if (isMongoDB(AdminUsers)) { // MongoDB
        adminUser = await AdminUsers.findOne({
          email: email
        });
      } else { // MySQL
        adminUser = await AdminUsers.findOne({
          where: {
            email
          }
        });
      }

      if (!adminUser) {
        // 1人目かどうか
        const cnt = await AdminUsers.count();
        // 1人目の場合はスーパーユーザー、2人目以降はデフォルトロールで登録する
        const roleId = cnt > 0 ? defaultRole : superRole;
        adminUser = await AdminUsers.create({
          email: email,
          role_id: roleId,
          auth_type: AUTH_TYPE_GOOGLE
        });
      }

      // JWTを生成
      const claims = {
        sub: email,
        googleOAuthToken: token,
      };
      const jwt = await helperJwt.sign(claims, authJwt);
      const authToken = `Bearer ${jwt}`;
      res.setHeader(authJwt.header_key, authToken);
      return res.redirect(`${redirectUrl}?token=${authToken}`);
    } catch (e) {
      logger.error(e);
      return res.redirect(redirectUrl);
    }
  });
};

module.exports = options => {
  return {
    signIn: registerSignIn(options),
    signOut: registerSignOut(options),
    googleSignIn: registerGoogleSignIn(options),
    googleOAuth2Callback: registerGoogleOAuth2Callback(options),
  };
};