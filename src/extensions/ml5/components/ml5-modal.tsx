import * as React from 'react';
import * as strings from 'Ml5CommandSetStrings';
import styles from './ml5-modal.module.scss';
import {
    MessageBar,
    MessageBarType,
    Icon,
    Modal,
} from 'office-ui-fabric-react/lib';
import IMl5ModalProps from './ml5-modal-props';
import IMl5ModalState from './ml5-modal-state';
import ListService from '../services/list-service';
import Prediction from './prediction';

export default class Ml5Modal extends React.Component<IMl5ModalProps, IMl5ModalState> {

    public state: IMl5ModalState = {
        data: [],
        fields: [],
        error: '',
    };

    private listService: ListService;

    constructor(props: IMl5ModalProps) {
        super(props);
        this.listService = new ListService();
    }

    public async componentDidMount() {
        const { listId } = this.props;

        const fields: Promise<any> = this.listService.getKnnListFields(listId);
        const data: Promise<any> = this.listService.getKnnList(listId);

        return Promise.all([fields, data])
            .then(([f, d]) => this.setState({ fields: f, data: d }))
            .catch(e => this.setState({ error: e.message }));
    }

    public render(): JSX.Element {
        const { fields, data, error } = this.state;

        return (
            <div>
                {error ?
                    <MessageBar
                        messageBarType={MessageBarType.error}
                        isMultiline={true}
                        onDismiss={this.closeMessageBar}
                        dismissButtonAriaLabel={strings.close}>
                        {error}
                    </MessageBar>
                    : <Modal
                        isOpen={true}
                        isBlocking={true}
                        onDismiss={this.closeModal}
                    > <div>
                            <div className={styles.header}>
                                <span>{strings.ml5}</span>
                                <div className={styles.close} onClick={this.closeModal}>
                                    <Icon iconName="ChromeClose" style={{ cursor: 'pointer' }} /></div>
                            </div>
                            <div style={{ height: '470px', width: '496px', padding: '5px' }}>
                                <div>
                                    <Prediction fields={fields} data={data} />
                                </div>
                            </div>
                        </div>
                    </Modal>
                }
            </div>
        );
    }

    private closeMessageBar = (): void => this.setState({ error: '' });

    private closeModal = (): void => this.props.onDismiss();
}