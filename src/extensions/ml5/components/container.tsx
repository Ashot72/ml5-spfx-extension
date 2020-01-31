import { BaseDialog } from "@microsoft/sp-dialog";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Ml5Modal from './ml5-modal';

export default class Container extends BaseDialog {
    public listId: string;

    public render() {
        const ml5Modal = (<Ml5Modal
            onDismiss={this.close}
            listId={this.listId}
        />);

        ReactDOM.render(ml5Modal, this.domElement);
    }

    protected onAfterClose(): void {
        ReactDOM.unmountComponentAtNode(this.domElement);
    }
}
