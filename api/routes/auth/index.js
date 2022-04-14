const { handlers } = require('../../libs/auth');
const authHandler = require('./auth');

module.exports = {
  init(app) {
    handlers.attach({ app, ...authHandler });
  },
};
