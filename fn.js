var is = require('utilise/is')

module.exports = function fn(candid){
  return is.fn(candid) ? candid
       : (new Function("return " + candid))()
}