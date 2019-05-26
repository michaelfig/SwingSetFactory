function frame(str) {
    // Netstrings.
    const buf = Buffer.from(`${str.length}:${str},`);
    return buf;
}
  
const Nat = require('@agoric/nat');
function unframe(framed, maxLength) {
    const match = framed.match(/^([^:]+):/);
    if (!match) {
        // Not yet enough data.
        return [undefined, framed];
    }
    if (!match[1].match(/^(0|[1-9]\d+)$/)) {
        throw TypeError(`Invalid Netstring length code ${match[1]}`);
    }

    const length = Nat(Number(match[1]));
    if (maxLength !== undefined && length > maxLength) {
        throw RangeError(`Netstring length exceeds ${maxLength}`);
    }

    const str = framed.slice(match[0].length);
    if (str.length < length + 1) {
        // Mark this buffer as not yet ready.
        return [undefined, framed];
    }
    if (str[length] != ',') {
        throw TypeError(`Netstring terminator missing from ${str}`);
    }
    return [str.substr(0, length), str.substr(length)];
}

module.exports = {frame, unframe};
