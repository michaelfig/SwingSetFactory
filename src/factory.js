const {frame, unframe} = require('./netstring');

const log = (...args) => console.log(`Factory[${process.pid}]:`, ...args);
log('Starting SwingSetFactory');
const PORT = Number(process.env.PORT) || 8000;
const child_process = require('child_process');

let lastWorkerID = 0;
async function runWorker(instance, home, send) {
  const workerID = ++lastWorkerID;
  const log = (...args) => console.log(`Worker.${workerID}[${instance}]:`, ...args)
  return new Promise((resolve, reject) => {
    let buf = '';
    const worker = child_process.fork(`${__dirname}/worker.js`, [], {
      env: {...process.env, SWINGSET_WORKER: home, SWINGSET_INSTANCE: instance},
      silent: true,
      });
    send({type: 'SWINGSET_STARTED', send: (obj) => {
      if (obj.type === 'WORKER_KILL') {
        // Kill off the worker unconditionally.
        worker.kill('KILL');
      } else {
        // Send to the worker.
        worker.stdin.write(frame(JSON.stringify(obj)));
      }
    }})
    worker.stdout.on('data', (data) => {
      const str = String(data);
      log('from child:', JSON.stringify(str));
      buf += str;
      let strBuf;
      while ((strBuf = unframe(buf)) && strBuf[0] !== undefined) {
        buf = strBuf[1];
        send(JSON.parse(strBuf[0]));
      }
      if (strBuf) {
        buf = strBuf[1];
      }
    });
    worker.stderr.on('data', (data) => {
      // Note, we have no framing, since anything could write to stderr.
      log('child error:', data.toString().trimRight());
      send({type: 'SWINGSET_LOG', data: data.toString()});
    });
    worker.on('close', (code) => {
      log('child exited with code', code);
      resolve([worker.pid, code]);
    });
  });
}

// Start a network service
const fs = require('fs');
const express = require('express');
const WebSocket = require('ws');
const morgan = require('morgan');

const app = express();

// Web logging.
app.use(morgan(`HTTP: :method :url :status :res[content-length] - :response-time ms`));

const server = app.listen(PORT, function listening() {
  log('Listening on', PORT);
});
const wss = new WebSocket.Server({server});

app.use(express.static(`${__dirname}/../ui/build`));

const api = express.Router();
api.get('foo', (req, res) => {
  log('got foo');
  res.sendStatus(200);
});

function newVatMachineID() {
  return `FIXME:${Math.random()}`;
}

function demoPath(name) {
  // Make sure they don't try to escape the demo.
  const s = String(name);
  if (!/^[a-z][-a-z0-9_]*$/i.test(s)) {
    throw RangeError(`Invalid demo name ${s}`);
  }
  return `${__dirname}/demo/${s}`;
}

let lastClientID = 0;
wss.on('connection', function connection(ws, req) {
  const cancels = {};
  const fwd = req.headers['x-forwarded-for'];
  const ip = fwd ? fwd.split(/\s*,\s*/)[0] : req.connection.remoteAddress;
  const clientID = `${++lastClientID}`;
  const log = (...args) => console.log(`Client.${clientID}[${ip}]:`, ...args);
  const send = (obj) => ws.send(JSON.stringify(obj));
  log('Connected');
  ws.on('close', function(code, reason) {
    log('client closed');
    for (const [instance, cancel] of Object.entries(cancels)) {
      try {
        cancel();
      } catch (e) {
        log(`Cannot cancel ${instance}`, e);
      }
    }
  });
  ws.on('error', function(err) {
    log('client error', err);
  });
  ws.on('message', function incoming(message) {
    try {
      const msg = String(message);
      log('from client', JSON.stringify(msg));
      const action = JSON.parse(msg);
      switch (action.type) {
      case 'SS_DEMO': {
        const instance = newVatMachineID();
        const demoName = action.name;
        const log = (...args) => console.log(`Client.${clientID}[${ip}][${instance}]:`, ...args);
        // Buffer messages until the worker starts.
        const startBuf = [];
        let toWorker = (obj) => {
          startBuf.push(obj);
        };
        function fromWorker(action) {
          try {
            log('from worker', action);
            switch (action.type) {
              case 'SWINGSET_STARTED': {
                toWorker = action.send;
                while (startBuf.length > 0) {
                  // Send the buffered messages.
                  toWorker(startBuf.shift());
                }
                cancels[instance] = () => {
                  toWorker({type: 'WORKER_KILL'});
                };
                break;
              }
              case 'SWINGSET_LOG': {
                send({type: 'SS_LOG', instance, data: action.data});
                break;
              }
              default: {
                send({type: 'SS_ERROR', instance, error: `Unrecognized worker message type ${JSON.stringify(action.type)}`});
              }
            }
          } catch (e) {
            log(`Internal ${instance} error`, e);
            send({type: 'SS_ERROR', instance, error: `Internal error processing worker message`});
          }
        }

        runWorker(instance, demoPath(demoName), fromWorker)
          .then(([pid, code]) => {
            delete cancels[instance];
            log('got worker exit of', code);
            send({type: 'SS_EXIT', instance, pid, code, prefix: `SwingSet.${pid}[${instance}]`});
          })
          .catch(e => {
            log('got exception', e);
            send({type: 'SS_ERROR', instance, error})
          });
        break;
      }
      case 'SS_EXIT': {
        toWorker({type: 'WORKER_EXIT'})
        break;
      }
      case 'SS_CANCEL': {
        const cancel = cancels[instance];
        if (!cancel) {
          send({type: 'SS_ERROR', instance, error: `No cancel function for ${instance}`});
          return;
        }
        cancel();
        break;
      }
      default: {
        send({type: 'SS_ERROR', error: `Unrecognized client message ${action.type}`});
      }
      }
    } catch (e) {
      log(`Error processing message ${JSON.stringify(message)}`, e);
      send({type: 'SS_ERROR', error: `Internal server error`});
    }
  });
});
