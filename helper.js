const isMongoDB = model => {
  if (model.base && model.base.constructor.name === 'Mongoose') { // MongoDB
    return true;
  }
  return false;
};

const isMySQL = model => {
  return !isMongoDB(model);
};


module.exports = {
  isMongoDB,
  isMySQL,
};