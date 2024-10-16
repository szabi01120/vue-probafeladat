const express = require('express');
const { createHash } = require('crypto');

function hashedPW(username, password) {
    const compinedPw = username + password;
    const hashedPass = createHash('sha256').update(compinedPw).digest('hex');
    return hashedPass;
}

exports.hashedPW = hashedPW;