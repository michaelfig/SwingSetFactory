import React from 'react';

export interface ILogMessage {
    when: number,
    kind: string,
    id: number,
    address: string,
    message: string,
}

export const makeLogMessage = (message: string, lastLog?: ILogMessage): ILogMessage => {
    const when = Date.now();
    // Break apart standard 'Kind.Id[Address]: Message'
    const match = message.match(/^([^.\s]+)\.(\d+)\[([^\]\s]+)\]: (.*)$/s);
    if (match) {
        return {
            when,
            kind: match[1],
            id: Number(match[2]),
            address: match[3],
            message: match[4],
        };
    }

    if (lastLog) {
        // Didn't parse, but we should be the same as last.
        return {
            ...lastLog,
            when,
            message,
        };
    }
    // Coerce into a generic message.
    return {
        when,
        kind: 'Unknown',
        id: 0,
        address: '',
        message,
    };
};

interface ILogMessageListProps {
    logs: ILogMessage[],
}

interface ILogMessageProps {
    log: ILogMessage,
}

export const LogMessage: React.FC<ILogMessageProps> = ({log}) =>
    <React.Fragment>{log.kind}: {log.message}<br/></React.Fragment>;

export class LogMessageList extends React.Component<ILogMessageListProps> {
    public render() {
        const logs: React.ReactNode[] = [];
        for (let i = 0; i < this.props.logs.length; i ++) {
            const log = this.props.logs[i];
            logs.push(<LogMessage key={i} log={log}/>)
         }
        return <div>{logs}</div>
    }
}

interface ILogViewerProps {
    logs: ILogMessage[],
}

export class LogViewer extends React.Component<ILogViewerProps> {
    public render() {
        const {logs} = this.props;
        const system: ILogMessage[] = [];
        const swingsets: Record<string, ILogMessage[]> = {};
        logs.forEach(log => {
            if (log.kind === 'SwingSet') {
                if (!swingsets[log.address]) {
                    swingsets[log.address] = [];
                }
                swingsets[log.address].push(log);
            } else {
                system.push(log);
            }
        });
        return (
            <div><div>Would provide filter here</div>
                <LogMessageList logs={logs}/>
            </div>
        )
    }
}
