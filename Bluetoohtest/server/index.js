const request = require('./request.js');
const method = require('./method.js');
const apiData=require('../server/apiData.js')

module.exports = {
  request: new request(),
  method: new method(),
  apiData: new apiData()
}


