const assert = require('assert');
const test = require('../');

describe('body_completion/middleware', () => {
  let middlewareBodyCompletion;

  before(() => {
    const vironlib = test.vironlib;
    middlewareBodyCompletion = vironlib.bodyCompletion.middleware();
  });

  it('リクエストbody内で足りないキーを補完する', done => {
    const req = test.genRequest({
      method: 'PUT',
      url: '/example',
      connection: {
        remoteAddress: '127.0.0.1',
      },
      body: {
        id: 1,
        description: 'aaa',
        address: '',
      },
      swagger: {
        operation: {
          parameters: [
            {
              in: 'body',
              schema: {
                properties: {
                  address: {
                    type: 'string'
                  },
                  description: {
                    type: 'string'
                  },
                  id: {
                    type: 'integer'
                  },
                  name: {
                    type: 'string'
                  }
                }
              }
            },
            {
              in: 'query',
              schema: {
                properties: {
                  id: {
                    type: 'integer'
                  }
                }
              }
            }
          ]
        },
      }
    });
    const res = test.genResponse();
    middlewareBodyCompletion(req, res, () => {
      assert(req.body.name === null);
      done();
    });
  });

  it('受付制限を掛けているリクエストURLの場合', done => {
    const req = test.genRequest({
      method: 'PUT',
      url: '/ping',
      connection: {
        remoteAddress: '127.0.0.1',
      },
      body: {
        id: 1,
        description: 'aaa',
        address: '',
      },
      swagger: {
        operation: {
          parameters: [
            {
              in: 'body',
              schema: {
                properties: {
                  address: {
                    type: 'string'
                  },
                  description: {
                    type: 'string'
                  },
                  id: {
                    type: 'integer'
                  },
                  name: {
                    type: 'string'
                  }
                }
              }
            },
            {
              in: 'query',
              schema: {
                properties: {
                  id: {
                    type: 'integer'
                  }
                }
              }
            }
          ]
        },
      }
    });
    const res = test.genResponse();
    middlewareBodyCompletion(req, res, () => {
      assert(req.body.name === undefined);
      done();
    });
  });

  it('PUT,POST以外のリクエストを受けた場合', done => {
    const req = test.genRequest({
      method: 'GET',
      url: '/example',
      connection: {
        remoteAddress: '127.0.0.1',
      },
      body: {
        id: 1,
        description: 'aaa',
        address: '',
      },
      swagger: {
        operation: {
          parameters: [
            {
              in: 'body',
              schema: {
                properties: {
                  address: {
                    type: 'string'
                  },
                  description: {
                    type: 'string'
                  },
                  id: {
                    type: 'integer'
                  },
                  name: {
                    type: 'string'
                  }
                }
              }
            },
            {
              in: 'query',
              schema: {
                properties: {
                  id: {
                    type: 'integer'
                  }
                }
              }
            }
          ]
        },
      }
    });
    const res = test.genResponse();
    middlewareBodyCompletion(req, res, () => {
      assert(req.body.name === undefined);
      done();
    });
  });

  it('x-body-completionで補完する', done => {
    const req = test.genRequest({
      method: 'PUT',
      url: '/example',
      connection: {
        remoteAddress: '127.0.0.1',
      },
      body: {
        id: 1,
        description: 'aaa',
        address: '',
      },
      swagger: {
        operation: {
          parameters: [
            {
              in: 'body',
              schema: {
                properties: {
                  address: {
                    type: 'string'
                  },
                  description: {
                    type: 'string'
                  },
                  id: {
                    type: 'integer'
                  },
                  name: {
                    type: 'string',
                    'x-completion-value': '',
                  }
                }
              }
            },
            {
              in: 'query',
              schema: {
                properties: {
                  id: {
                    type: 'integer'
                  }
                }
              }
            }
          ]
        },
      }
    });
    const res = test.genResponse();
    middlewareBodyCompletion(req, res, () => {
      assert(req.body.name === '');
      done();
    });
  });

});
