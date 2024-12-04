export { randomBytes };
function randomBytes(n) {
    return crypto.getRandomValues(new Uint8Array(n));
}
//# sourceMappingURL=random.web.js.map