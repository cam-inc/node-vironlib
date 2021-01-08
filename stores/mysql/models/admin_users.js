const Sequelize = require('sequelize');
const { AUTH_TYPE_GOOGLE, AUTH_TYPE_EMAIL } = require('../../../constants');

const TABLE = 'admin_users';

module.exports = sequelize => {
  const model = sequelize.define(TABLE,
    {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(1024),
        allowNull: true,
      },
      auth_type: {
        type: Sequelize.ENUM(AUTH_TYPE_GOOGLE, AUTH_TYPE_EMAIL),
        // defaultValue: 'email',
        allowNull: false,
      },
      salt: {
        type: Sequelize.STRING(256),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      // underscored: true,
      // underscoredAll: true,
      // freezeTableName: false,
      // createdAt: true,
      // updatedAt: true,
      // deletedAt: true,
      charset: 'utf8',
      indexes: [
        {unique: true, fields: ['email']},
      ]
    }
  );
  return model;
};
