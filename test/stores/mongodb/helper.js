const assert = require('assert');
const bson = require('bson');

describe('stores/mongodb/helper', () => {
  let mongodbHelper;

  before(() => {
    mongodbHelper = require('../../../stores/mongodb/helper');
  });

  describe('isObjectId', () => {
    it('bson.ObjectIdのインスタンスであればtrue', () => {
      const objectId = new bson.ObjectId();
      const result = mongodbHelper.isObjectId(objectId);
      assert.strictEqual(result, true);
    });

    it('ObjectIdライクな文字列であればtrue', () => {
      const objectId = '5ce217c3b733d1b9e5a87437';
      const result = mongodbHelper.isObjectId(objectId);
      assert.strictEqual(result, true);
    });

    it('ObjectIdライクな文字列でなければfalse', () => {
      const objectId = 'hogefuga';
      const result = mongodbHelper.isObjectId(objectId);
      assert.strictEqual(result, false);
    });
  });
});
