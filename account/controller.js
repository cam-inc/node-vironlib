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
    return (req, res, next) => {
      return Promise.resolve()
        .then(() => {
          logger.error('[VIRONLIB] account /account is not registered.');
          return res.json(errors.frontend.NotFound());
        })
        .catch(next)
      ;
    };
  }

  return (req, res, next) => {
    const attributes = Object.keys(req.swagger.operation.responses['200'].schema.items.properties);
    return AdminUsers.findOne({where: {email: req.auth.sub}, attributes})
      .then(data => {
        return res.json([data]);
      })
      .catch(next)
    ;
  };
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
    return (req, res, next) => {
      return Promise.resolve()
        .then(() => {
          logger.error('[VIRONLIB] account /account/:id is not registered.');
          return res.json(errors.frontend.NotFound());
        })
        .catch(next)
      ;
    };
  }

  return (req, res, next) => {
    const attributes = Object.keys(req.swagger.operation.responses['200'].schema.items.properties);
    const id = req.swagger.params.id.value;
    return AdminUsers.findById(id, {attributes})
      .then(data => {
        if (data.email !== req.auth.sub) {
          // 自分以外へのアクセスは認めない
          throw errors.frontend.Forbidden();
        }
        return res.json(data);
      })
      .catch(next)
    ;
  };
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
    return (req, res, next) => {
      return Promise.resolve()
        .then(() => {
          logger.error('[VIRONLIB] account /account/:id is not registered.');
          return res.json(errors.frontend.NotFound());
        })
        .catch(next)
      ;
    };
  }

  return (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        const id = req.swagger.params.id.value;
        return AdminUsers.findById(id)
          .then(data => {
            if (data.email !== req.auth.sub) {
              // 自分以外へのアクセスは認めない
              throw errors.frontend.Forbidden();
            }
          })
        ;
      })
      .then(() => {
        // パスワードをハッシュ化
        const salt = helperEMail.genSalt();
        return helperEMail.genHash(req.body.password, salt)
          .then(hashedPassword => {
            return {password: hashedPassword, salt};
          })
        ;
      })
      .then(data => {
        const id = req.swagger.params.id.value;
        return AdminUsers.update(data, {where: {id}});
      })
      .then(data => {
        return res.json(data);
      })
      .catch(next)
    ;
  };
};

module.exports = options => {
  return {
    list: registerList(options),
    get: registerGet(options),
    update: registerUpdate(options),
  };
};
