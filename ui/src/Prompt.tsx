import {FlexRow} from './Flex';
import React from 'react';
import styled from './styled-components';


export const Input = styled.input`
    flex-grow: 1;
`;

export const Submit = styled.button`
`;

interface IPrompt {
    onSubmit: (cmd: string, mode: string) => void,
}
export class Prompt extends React.Component<IPrompt> {
    private onClick = () => {
        this.props.onSubmit('mycommand', 'json');
    };

    private onKeyUp = (ev: React.KeyboardEvent) => {
        if (ev.ctrlKey && (ev.key === 'j' || ev.key === 'J')) {
            return this.props.onSubmit('stuff', 'json');
        }
        if (ev.keyCode === 13) {
            return this.props.onSubmit('other', 'eval');
        }
    };

    public render() {
        return (
        <FlexRow style={{width: '100%'}}>
            <div>{'vat input>'} </div><Input onKeyUp={this.onKeyUp}/>
        </FlexRow>
        );
    }
}
