"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashlink = hashlink;
function hashlink(len) {
    const options = "afesdgkjhlkdfhabwbeouf32382938922399";
    let hash = "";
    for (let i = 0; i < len; i++) {
        hash += options[Math.floor(Math.random() * options.length)];
    }
    return hash;
}
