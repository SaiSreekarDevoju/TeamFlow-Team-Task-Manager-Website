const morgan = require('morgan');

// Custom token to log response time in ms
morgan.token('time', function(req, res) {
  if (!req._startTime) return '-';
  const diff = process.hrtime(req._startTime);
  return (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3) + ' ms';
});

// Middleware to record start time
const recordStartTime = (req, res, next) => {
  req._startTime = process.hrtime();
  next();
};

const format = process.env.NODE_ENV === 'production' 
  ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :time'
  : 'dev';

const logger = morgan(format);

const requestLogger = [recordStartTime, logger];

module.exports = { requestLogger };
