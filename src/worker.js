const {frame, unframe} = require('./netstring');

const instance = process.env.SWINGSET_INSTANCE;
const log = (...args) => console.error(`SwingSet.${process.pid}[${instance}]:`, ...args);
console.log = log;
const home = process.env.SWINGSET_WORKER;
const send = (obj) => process.stdout.write(frame(JSON.stringify(obj)));
send({type: 'SWINGSET_STARTED'});
log('TODO: Would run', home);
process.exit(0);
