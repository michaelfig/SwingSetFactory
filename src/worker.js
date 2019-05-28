const {frame, unframe} = require('./netstring');
const Nat = require('@agoric/nat');
const fs = require('fs');

const instance = process.env.SWINGSET_INSTANCE;
const sendFd = Nat(Number(process.env.SWINGSET_FD));
const sendStream = fs.createWriteStream(null, {fd: sendFd});
sendStream.addListener('error', (err) => {
    console.error(`Cannot write to SWINGSET_FD=${sendFd}:`, err);
    process.exit(1);
});
const send = (obj) => sendStream.write(frame(JSON.stringify(obj)));
send({type: 'SWINGSET_STARTED'});

// Parameters.
const basedir = process.env.SWINGSET_WORKER;
const withSES = true;
const vatArgv = []; // FIXME

// The rest of this is taken almost directly from SwingSet/bin/vat
const path = require('path');
require = require('esm')(module);
const util = require('util');

const { loadBasedir, buildVatController } = require('@agoric/swingset-vat/src/index');

async function main() {
    const config = await loadBasedir(basedir);
    const ldSrcPath = require.resolve('@agoric/swingset-vat/src/devices/loopbox-src');
    config.devices = [['loopbox', ldSrcPath, {}]];

    const controller = await buildVatController(config, withSES, vatArgv);
    await controller.run();
    console.log('= vat finished');
}

main()
    .then(() => process.exit(0))
    .catch((e) => log('Error running vat:', e));
