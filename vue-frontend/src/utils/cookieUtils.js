function getSessionCookie() {
    return document.cookie.replace(/(?:(?:^|.*;\s*)sessionId\s*=\s*([^;]*).*$)|^.*$/, "$1");
}

function setSessionCookie(sessionId) {
    document.cookie = `sessionId=${sessionId}; path=/;`;
}

function deleteSessionCookie() {
    document.cookie = 'sessionId=; max-age=0; path=/;';
}

export default { getSessionCookie, setSessionCookie, deleteSessionCookie };