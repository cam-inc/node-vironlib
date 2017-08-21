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

  return (req, res) => {
    const attributes = Object.keys(req.swagger.operation.responses['200'].schema.items.properties);
    const limit = Number(req.query.limit || pager.defaultLimit);
    const offset = Number(req.query.offset || 0);
    return Promise.resolve()
      .then(() => {
        return AdminUsers.count();
      })
      .then(count => {
        pager.setResHeader(res, limit, offset, count);
        const options = {
          attributes,
          limit,
          offset,
        };
        return AdminUsers.findAll(options);
      })
      .then(list => {
        return res.json(list);
      })
    ;
  };
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

  return (req, res) => {
    return Promise.resolve()
      .then(() => {
        // パスワードをハッシュ化
        const salt = helperEMail.genSalt();
        return helperEMail.genHash(req.body.password, salt)
          .then(hashedPassword => {
            return {password: hashedPassword, salt};
          });
      })
      .then(data => {
        data.email = req.body.email;
        data.role_id = defaultRole;
        return AdminUsers.create(data);
      })
      .then(data => {
        delete data.password;
        delete data.salt;
        return res.json(data);
      })
    ;
  };
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

  return (req, res) => {
    const attributes = Object.keys(req.swagger.operation.responses['200'].schema.items.properties);
    const id = req.swagger.params.id.value;
    return AdminUsers.findById(id, {attributes})
      .then(data => {
        return res.json(data);
      })
    ;
  };
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

  return (req, res) => {
    const id = req.swagger.params.id.value;
    return AdminUsers.destroy({where: {id}, force: true})
      .then(() => {
        return res.status(204).end();
      })
    ;
  };
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

  return (req, res) => {
    return Promise.resolve()
      .then(() => {
        const password = req.body.password;
        if (!password) {
          return {};
        }

        // パスワードをハッシュ化
        const salt = helperEMail.genSalt();
        return helperEMail.genHash(req.body.password, salt)
          .then(hashedPassword => {
            return {password: hashedPassword, salt};
          })
        ;
      })
      .then(data => {
        data.role_id = req.body.role_id;
        const id = req.swagger.params.id.value;
        return AdminUsers.update(data, {where: {id}});
      })
      .then(data => {
        return res.json(data);
      })
    ;
  };
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
