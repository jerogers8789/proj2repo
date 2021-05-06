const router = require('express').Router();
const homepageRoutes = require('./homepage-routes');
const acctRoutes = require('./acct-routes');
const hashRoutes = require('./hash-routes');

router.use('/homepage', homepageRoutes);
router.use('/acct', acctRoutes);
router.use('/hash', hashRoutes);

module.exports = router;