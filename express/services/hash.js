const { createHash } = require('crypto');

function hashedPW(username, password) {
    const combinedPw = username + password;
    const hashedPass = createHash('sha256').update(combinedPw).digest('hex');
    return hashedPass;
}

exports.hashedPW = hashedPW;