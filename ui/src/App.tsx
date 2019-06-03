import React from 'react';

import {FlexColWide, FlexRow, FlexRowTall} from './Flex';
import {Launcher} from './Launcher'; 
import {ILogMessage, LogViewer, makeLogMessage} from './Log';
import {Prompt} from './Prompt';
interface IAppState {
  ws?: WebSocket,
  logs: ILogMessage[],
}

interface IAppProps {}

// TODO(mfig): Only have react-router in this file.
class App extends React.Component<IAppProps, IAppState> {
  public state: IAppState = {
    logs: [],
  };

  private socketEndpoint = '';

  private appendConsole = (msg: string) => {
    // Try parsing the message.  If it fails, it's a continuation.
    const logs = this.state.logs;
    const log = makeLogMessage(msg, logs[logs.length - 1]);
    this.setState({logs: [...logs, log]});
  }

  private sendQ: unknown[] = [];
  private lastWsInstance = 0;

  private queuingSend = (obj: unknown) => {
    this.sendQ.push(obj);
  }

  private send = this.queuingSend;

  public constructor(props: IAppProps) {
    super(props);
    const loc = window.location;
    if (loc.hostname === 'localhost' && loc.port === '3000') {
      // Debug server.
      this.socketEndpoint = `ws://${loc.hostname}:3001/api/swingset`;
    } else {
      const protocol = loc.protocol.replace(/^http/, 'ws');
      this.socketEndpoint = `${protocol}//${loc.host}/api/swingset`;
    }
  }

  public componentDidMount() {
    const wsinstance = ++this.lastWsInstance;
    const log = (...args: any[]) => {
      this.appendConsole([`WebSocket.${wsinstance}[${this.socketEndpoint}]:`, ...args].join(' ') + '\n');
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

  private onSubmit = (command: string, mode: string) => {
    switch (mode) {
      case 'json':
        window.alert('Would JSON ' + command);
        break;
      case 'eval':
        window.alert('Would eval ' + command);
        break;
      default:
        window.alert('unknown command mode ' + mode);
    }
  };

  public render() {
    const send = (obj: unknown) => this.send(obj);
    return (
      <FlexColWide className="App" style={{height: '100%', padding: '10px'}}>
        <FlexRow><Launcher send={send}/></FlexRow>
        <FlexRowTall>
          <LogViewer logs={this.state.logs}/>
        </FlexRowTall>
        <FlexRow><Prompt onSubmit={this.onSubmit}/></FlexRow>
      </FlexColWide>
    );
  }
}

export default App;
