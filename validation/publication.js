const Validator = require('validator');
const _ = require('lodash');

module.exports = function validatePublicationInput(data) {
  const errors = {};

  if (_.isEmpty(data.title) || !Validator.isLength(data.title, { min: 3, max: 30 })) {
    errors.title = 'Title must be between 3 and 30 chars';
  }

  return { errors };
};
