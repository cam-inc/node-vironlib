const asyncWrapper = require('../async_wrapper');
const logger = require('../logger');
const helperEMail = require('../auth/email/helper');
const errors = require('../errors');

/**
 * Controller : List Account
 * HTTP Method : GET
 * PATH : /account
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_users
 * @returns {function(*, *, *)}
 */
const registerList = options => {
  const AdminUsers = options.admin_users;

  if (!AdminUsers) {
    return asyncWrapper(async (req, res) => {
      logger.error('[VIRONLIB] account /account is not registered.');
      return res.json(errors.frontend.NotFound());
    });
  }

  return asyncWrapper(async (req, res) => {
    const attributes = Object.keys(req.swagger.operation.responses['200'].schema.items.properties);
    const data = await AdminUsers.findOne({where: {email: req.auth.sub}, attributes});
    return res.json([data]);
  });
};

/**
 * Controller : Get Account
 * HTTP Method : GET
 * PATH : /account/:id
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_users
 * @returns {function(*, *, *)}
 */
const registerGet = options => {
  const AdminUsers = options.admin_users;

  if (!AdminUsers) {
    return asyncWrapper(async (req, res) => {
      logger.error('[VIRONLIB] account /account/:id is not registered.');
      return res.json(errors.frontend.NotFound());
    });
  }

  return asyncWrapper(async (req, res) => {
    const attributes = Object.keys(req.swagger.operation.responses['200'].schema.items.properties);
    const id = req.swagger.params.id.value;
    const data = await AdminUsers.findById(id, {attributes});
    if (data.email !== req.auth.sub) {
      // 自分以外へのアクセスは認めない
      throw errors.frontend.Forbidden();
    }
    return res.json(data);
  });
};

/**
 * Controller : Update Account
 * HTTP Method : PUT
 * PATH : /account/:id
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_users
 * @returns {function(*, *, *)}
 */
const registerUpdate = options => {
  const AdminUsers = options.admin_users;

  if (!AdminUsers) {
    return asyncWrapper(async (req, res) => {
      logger.error('[VIRONLIB] account /account/:id is not registered.');
      return res.json(errors.frontend.NotFound());
    });
  }

  return asyncWrapper(async (req, res) => {
    const id = req.swagger.params.id.value;
    const user = await AdminUsers.findById(id);
    if (user.email !== req.auth.sub) {
      // 自分以外へのアクセスは認めない
      throw errors.frontend.Forbidden();
    }

    // パスワードをハッシュ化
    const salt = helperEMail.genSalt();
    const hashedPassword = await helperEMail.genHash(req.body.password, salt);

    const result = await AdminUsers.update({
      password: hashedPassword,
      salt: salt,
    }, {where: {id}});

    return res.json(result);
  });
};

module.exports = options => {
  return {
    list: registerList(options),
    get: registerGet(options),
    update: registerUpdate(options),
  };
};
