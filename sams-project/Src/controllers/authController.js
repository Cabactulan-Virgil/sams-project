const jwt = require('jsonwebtoken');

// Example login function
async function login(req, res) {
  const { email, password } = req.body;

  // Here you would check your database for the user
  // Example:
  if (email === 'admin@school.com' && password === '123456') {
    const token = jwt.sign({ username: 'Admin', role: 'admin' }, 'secretkey', { expiresIn: '1h' });
    return res.json({ token });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
}

module.exports = { login };
