var util = require('util')

var AbstractError = function (msg, constr) {
  Error.captureStackTrace(this, constr || this);
  this.message = msg || 'Error';
}

util.inherits(AbstractError, Error);
AbstractError.prototype.name = 'Abstract Error';

//---------------------------------------------------------//
var DatabaseError = function (msg) {
  DatabaseError.super_.call(this, msg, this.constructor);
}

util.inherits(DatabaseError, AbstractError);
DatabaseError.prototype.name = 'Database Error';
//---------------------------------------------------------//
var ResourceNotFoundError = function (msg) {
  ResourceNotFoundError.super_.call(this, msg, this.constructor);
}

var ResourceNotFoundError = function (msg, errors, url) {
  ResourceNotFoundError.super_.call(this, msg, this.constructor);
  this.errors = errors;
  this.url = url;
}

util.inherits(ResourceNotFoundError, AbstractError);
ResourceNotFoundError.prototype.name = 'Resource Not Found Error';
//---------------------------------------------------------//

var ValidationError = function (msg, errors) {
  ValidationError.super_.call(this, msg, this.constructor);
  this.errors = errors;
}

var ValidationError = function (msg, errors, url) {
  ValidationError.super_.call(this, msg, this.constructor);
  this.errors = errors;
  this.url = url;
}


util.inherits(ValidationError, AbstractError);
ValidationError.prototype.name = 'Validation Error';
//---------------------------------------------------------//


module.exports = {
  Database: DatabaseError,
  ResourceNotFound: ResourceNotFoundError,
  Validation: ValidationError
}