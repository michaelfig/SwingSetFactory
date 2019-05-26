import React from 'react';

export const DEFAULT_BOOTSTRAP = 'encouragementBot';

interface ILauncherProps {
    send: (obj: unknown) => void,
}

interface ILauncherState {
    bootstrap: string,
}

export class Launcher extends React.Component<ILauncherProps> {
    public state = {
        bootstrap: DEFAULT_BOOTSTRAP,
    };

    private onLaunch = () => {
        this.props.send({"type":"SS_DEMO","name":this.state.bootstrap})
    };

    private onBootstrapChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({bootstrap: e.target.value})
    };

    public render() {
        return (
            <div>
                What kind of SwingSet would you like? <select>
                    <option>Generic Ephemeral</option>
                    <option disabled={true}>Cosmos Follower</option></select>
                <br/>
                Initial Vats: <select defaultValue={DEFAULT_BOOTSTRAP} onChange={this.onBootstrapChange}>
                    <option>encouragementBot</option>
                    <option>encouragementBotComms</option>
                    <option>contractHost</option>
                </select>
                <br/>
                <button onClick={this.onLaunch}>Try It!</button>
            </div>
        )
    }
}