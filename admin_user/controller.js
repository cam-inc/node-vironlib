const asyncWrapper = require('../async_wrapper');
const helperEMail = require('../auth/email/helper');
const {isMongoDB} = require('../helper');

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

    if (isMongoDB(AdminUsers)) { // MongoDB
      const options = {
        limit,
        offset,
        sort: {
          createdAt: 'desc'
        },
      };

      const projection = {
        _id: 0,
      };

      attributes.forEach(k => {
        projection[k] = 1;
      });

      const results = await AdminUsers.find({}, projection, options);
      const total = await AdminUsers.countDocuments({});
      pager.setResHeader(res, limit, offset, total);
      const json = [];

      results.forEach(k => {
        json.push(k.toJSON());
      });

      return res.json(json);


    } else { // MySQL

      const options = {
        attributes,
        limit,
        offset,
      };
      const result = await AdminUsers.findAndCountAll(options);

      pager.setResHeader(res, limit, offset, result.count);
      return res.json(result.rows);

    }
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

    let result;
    if (isMongoDB(AdminUsers)) { // MongoDB
      result = await (new AdminUsers(data)).save();
      const safeRes = result.toJSON();
      delete safeRes.password;
      delete safeRes.salt;
      return res.json(safeRes);

    } else { // MySQL
      result = await AdminUsers.create(data);
      delete result.password;
      delete result.salt;
      return res.json(data);

    }
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

    let data;
    if (isMongoDB(AdminUsers)) { // MongoDB
      const projection = {
        _id: 0,
      };
      attributes.forEach(k => {
        projection[k] = 1;
      });

      const _id = req.swagger.params._id.value;
      data = await AdminUsers.find({_id: _id}, projection);
    } else { //MySQL
      const id = req.swagger.params.id.value;
      data = await AdminUsers.findById(id, {attributes});
    }

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

    if (isMongoDB(AdminUsers)) { // MongoDB
      const _id = req.swagger.params._id.value;
      await AdminUsers.deleteOne({_id: _id});
    } else { //MySQL
      const id = req.swagger.params.id.value;
      await AdminUsers.destroy({where: {id}, force: true});
    }

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
    const roleId = req.body.role_id;

    if (!password && !roleId) {
      return res.json({});
    }

    const data = {};

    if (password) {
      // パスワードをハッシュ化
      const salt = helperEMail.genSalt();
      const hashedPassword = await helperEMail.genHash(req.body.password, salt);
      Object.assign(data, {
        password: hashedPassword,
        salt: salt,
      });
    }

    if (roleId) {
      Object.assign(data, {role_id: roleId});
    }


    let result;
    if (isMongoDB(AdminUsers)) { // MongoDB
      const _id = req.swagger.params._id.value;
      result = await AdminUsers.update({_id: _id}, data);
    } else { // MySQL
      const id = req.swagger.params.id.value;
      result = await AdminUsers.update(data, {where: {id}});
    }
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
