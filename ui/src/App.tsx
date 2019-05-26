import React from 'react';

import {Launcher} from './Launcher'; 
interface IAppState {
  ws?: WebSocket,
  console: string,
}

interface IAppProps {}

// TODO(mfig): Only have react-router in this file.
class App extends React.Component<IAppProps, IAppState> {
  public state: IAppState = {
    console: '',
  };

  private socketEndpoint = '';

  private appendConsole = (msg: string) => {
    this.setState({console: this.state.console + msg});
  }

  private sendQ: unknown[] = [];

  private queuingSend = (obj: unknown) => {
    this.sendQ.push(obj);
  }

  private send = this.queuingSend;

  public constructor(props: IAppProps) {
    super(props);
    const loc = window.location;
    if (loc.hostname === 'localhost' && loc.port === '3000') {
      // Debug server.
      this.socketEndpoint = `ws://${loc.hostname}:8000/api/swingset`;
    } else {
      const protocol = loc.protocol.replace(/^http/, 'ws');
      this.socketEndpoint = `${protocol}://${loc.host}/api/swingset`;
    }
  }

  public componentDidMount() {
    const log = (...args: any[]) => {
      this.appendConsole([`WebSocket[${this.socketEndpoint}]:`, ...args].join(' ') + '\n');
    };
    const ws = new WebSocket(this.socketEndpoint);
    ws.addEventListener('error', (ev) => {
      log(`Error ${ev}`);
    });
    ws.addEventListener('open', (ev) => {
      log(`Connected!`);

      this.send = (obj) => {
        if (this.state.ws && this.state.ws.readyState === WebSocket.OPEN) {
          this.state.ws.send(JSON.stringify(obj));
        }
      };

      while (this.sendQ.length > 0) {
        this.send(this.sendQ.shift());
      }
    });
    ws.addEventListener('message', (ev) => {
      try {
        console.log('Received:', ev.data);
        const action = JSON.parse(ev.data);
        const logi = action.instance ?
          (...args: unknown[]) => log(`SwingSet[${action.instance}]:`, ...args) :
          log;

        switch (action.type) {
          case 'SS_LOG': {
            this.appendConsole(action.data);
            break;
          }

          case 'SS_EXIT': {
            this.appendConsole(`${action.prefix}: Exit ${action.code}\n`);
            break;
          }
          default: {
            logi(`Unrecognized message type`, JSON.stringify(action.type));
          }
        }
      } catch (e) {
        log(`Error handling message`, JSON.stringify(ev.data));
      }
    });
    ws.addEventListener('close', (ev) => {
      log('Closed!');
      this.send = this.queuingSend;
    });
    this.setState({ws});
  }

  public render() {
    const send = (obj: unknown) => this.send(obj);
    return (
      <div className="App">
        <Launcher send={send}/>
        <pre>{this.state.console}</pre>
      </div>
    );
  }
}

export default App;
