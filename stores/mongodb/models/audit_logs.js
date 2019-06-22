const COLLECTION_NAME = 'audit_logs';

module.exports = ({Schema, SchemaTypes}) => {
  const schema = new Schema(
    {
      // id: {
      //   type: Sequelize.INTEGER.UNSIGNED,
      //   allowNull: false,
      //   primaryKey: true,
      //   autoIncrement: true
      // },
      request_method: {
        type: SchemaTypes.String,
        required: false
      },
      request_uri: {
        type: SchemaTypes.String,
        required: false
      },
      source_ip: {
        type: SchemaTypes.String,
        required: false
      },
      user_id: {
        type: SchemaTypes.String,
        required: false
      },
      request_body: {
        type: SchemaTypes.String,
        required: false
      },
      status_code: {
        type: SchemaTypes.Number,
        required: false
      },
      createdAt: {
        type: SchemaTypes.Number
      },
      updatedAt: {
        type: SchemaTypes.Number
      }
    },
    {
      // @see https://mongoosejs.com/docs/guide.html#options
      autoIndex: true,
      bufferCommands: true,
      //capped: 1024, // bytes
      collection: COLLECTION_NAME,
      // @see https://mongoosejs.com/docs/api.html#query_Query-read
      read: 'secondaryPreferred', // `primary` `primaryPreferred` `secondary` `secondaryPreferred` `nearest`
      // @see https://docs.mongodb.com/manual/reference/write-concern/
      // writeConcern: {
      //   w: 1,
      //   j: true,
      //   wtimeout: 1000, // msec
      // }
      strict: true,
      timestamps: true,
      // timestamps: { createdAt: 'created_at' }
      //id: false,
      versionKey: false
    }
  );


  return {
    name: COLLECTION_NAME,
    schema
  };
};
