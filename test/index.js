const http = require('http');
const dmclib = require('../');

const genRequest = swagger => {
  const req = new http.IncomingMessage();
  req.swagger = swagger;
  req.get = key => {
    return req.headers[key.toLowerCase()];
  };
  return req;
};

const genResponse = () => {
  const res = new http.OutgoingMessage();
  res.status = code => {
    res.statusCode = code;
    return res;
  };
  res.set = res.header = (k, v) => {
    res.headers = res.headers || {};
    res.headers[k.toLowerCase()] = v;
  };
  return res;
};

module.exports = {
  dmclib,
  genRequest,
  genResponse,
};
