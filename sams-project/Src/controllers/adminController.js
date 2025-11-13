const { User } = require('../models/User');
const { Class } = require('../models/Class');
const { Subject } = require('../models/Subject');

async function getUsers(req, res) {
  const users = await User.findAll();
  res.json(users);
}

async function getClasses(req, res) {
  const classes = await Class.findAll({ include: ['teacher'] });
  res.json(classes);
}

async function getSubjects(req, res) {
  const subjects = await Subject.findAll({ include: ['teacher', 'class'] });
  res.json(subjects);
}

module.exports = { getUsers, getClasses, getSubjects };
