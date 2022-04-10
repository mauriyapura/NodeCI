
const {clearhash} = require('../services/cache');

module.exports= async(req, res, next) => {
    await next();  // We are waiting for execution of route handler, then we delete cache

    clearhash(req.user.id);

}
