const jwt = require('jsonwebtoken')
const { JWT_TOKEN } = require('../secrets/index')

function tokenBuilder(user) {
    const payload = {
        subject: user.user_id,
        username: user.username,
        role_name: user.role_name
    };
    const options = {
        expiresIn: '1d'
    }
    return jwt.sign(payload, JWT_TOKEN, options)
}

module.exports = tokenBuilder