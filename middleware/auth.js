const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalide' });
  }
}
// console.log('JWT_SECRET =', process.env.JWT_SECRET);

module.exports = auth;
