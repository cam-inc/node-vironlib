const asyncWrapper = require('../async_wrapper');
const helperEMail = require('../auth/email/helper');

/**
 * Controller : List Admin User
 * HTTP Method : GET
 * PATH : /adminuser
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_users
 * @param {Object} pager
 * @returns {function(*, *, *)}
 */
const registerList = (options, pager) => {
  const AdminUsers = options.admin_users;

  return asyncWrapper(async (req, res) => {
    const attributes = Object.keys(req.swagger.operation.responses['200'].schema.items.properties);
    const limit = Number(req.query.limit || pager.defaultLimit);
    const offset = Number(req.query.offset || 0);
    const options = {
      attributes,
      limit,
      offset,
    };
    const result = await AdminUsers.findAndCountAll(options);

    pager.setResHeader(res, limit, offset, result.count);
    return res.json(result.rows);
  });
};

/**
 * Controller : Create Admin User
 * HTTP Method : POST
 * PATH : /adminuser
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_users
 * @param {String} options.default_role;
 * @returns {function(*, *, *)}
 */
const registerCreate = options => {
  const AdminUsers = options.admin_users;
  const defaultRole = options.default_role;

  return asyncWrapper(async (req, res) => {
    // パスワードをハッシュ化
    const salt = helperEMail.genSalt();
    const hashedPassword = await helperEMail.genHash(req.body.password, salt);

    const data = {
      password: hashedPassword,
      salt: salt,
      email: req.body.email,
      role_id: defaultRole,
    };
    const result = await AdminUsers.create(data);
    delete result.password;
    delete result.salt;
    return res.json(data);
  });
};

/**
 * Controller : Get Admin User
 * HTTP Method : GET
 * PATH : /adminuser/:id
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_users
 * @returns {function(*, *, *)}
 */
const registerGet = options => {
  const AdminUsers = options.admin_users;

  return asyncWrapper(async (req, res) => {
    const attributes = Object.keys(req.swagger.operation.responses['200'].schema.items.properties);
    const id = req.swagger.params.id.value;
    const data = await AdminUsers.findById(id, {attributes});
    return res.json(data);
  });
};

/**
 * Controller : Remove Admin User
 * HTTP Method : DELETE
 * PATH : /adminuser/:id
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_users
 * @returns {function(*, *, *)}
 */
const registerRemove = options => {
  const AdminUsers = options.admin_users;

  return asyncWrapper(async (req, res) => {
    const id = req.swagger.params.id.value;
    await AdminUsers.destroy({where: {id}, force: true});
    return res.status(204).end();
  });
};

/**
 * Controller : Update Admin User
 * HTTP Method : PUT
 * PATH : /adminuser/:id
 *
 * @param {Object} options
 * @param {Sequelize.model} options.admin_users
 * @returns {function(*, *, *)}
 */
const registerUpdate = options => {
  const AdminUsers = options.admin_users;

  return asyncWrapper(async (req, res) => {
    const password = req.body.password;
    if (!password) {
      return res.json({});
    }

    // パスワードをハッシュ化
    const salt = helperEMail.genSalt();
    const hashedPassword = await helperEMail.genHash(req.body.password, salt);

    const id = req.swagger.params.id.value;
    const data = {
      password: hashedPassword,
      salt: salt,
      role_id: req.body.role_id,
    };
    const result = await AdminUsers.update(data, {where: {id}});
    return res.json(result);
  });
};

module.exports = (options, pager) => {
  return {
    list: registerList(options, pager),
    create: registerCreate(options),
    get: registerGet(options),
    remove: registerRemove(options),
    update: registerUpdate(options),
  };
};
