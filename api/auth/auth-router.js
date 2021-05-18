const router = require("express").Router();
const Users = require('../users/users-model')
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');
const tokenBuilder = require('./token-builder'); // use this secret!
const bcrypt = require('bcryptjs')

router.post("/register", validateRoleName, async (req, res, next) => {
  try {
    let user = req.body
    const rounds = process.env.ROUNDS || 8
    const hash = bcrypt.hashSync(user.password, rounds)
    user.password = hash
  
    const newUser = await Users.add(user)
    res.status(201).json(newUser)
  } catch(err) {
    next(err)
  }

  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */
});


router.post("/login", checkUsernameExists, async (req, res, next) => {
  try {
    let { username, password } = req.body

    const [user] = await Users.findBy({ username })
    if(user && bcrypt.compareSync(password, user.password)) {
      const token = tokenBuilder(user)
      res.status(200).json({ message: `${username} is back!`, token})
    } else {
      res.status(401).json({ message: 'Invalid credentials'})
    }
  } catch(err) {
    next(err)
  }
  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status 200
    {
      "message": "sue is back!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    The token must expire in one day, and must provide the following information
    in its payload:

    {
      "subject"  : 1       // the user_id of the authenticated user
      "username" : "bob"   // the username of the authenticated user
      "role_name": "admin" // the role of the authenticated user
    }
   */
});

module.exports = router;
