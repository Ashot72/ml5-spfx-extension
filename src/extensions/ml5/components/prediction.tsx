const ml5: any = require('ml5');
import * as React from 'react';
import * as strings from 'Ml5CommandSetStrings';
import { String } from 'typescript-string-operations';
import { find } from 'lodash';
import {
    Stack,
    PrimaryButton,
    Dropdown,
    IDropdownStyles,
    IDropdownOption,
    TextField,
    ChoiceGroup,
    MessageBar,
    MessageBarType
} from 'office-ui-fabric-react/lib';
import IPredictionProps from './prediction-props';
import IPredictionState from './prediction-state';
import { Analysis } from '../enums/analysis';
import { columns, round } from '../helpers/utils.js'

export default class Prediction extends React.Component<IPredictionProps, IPredictionState> {

    private model;

    public state: IPredictionState = {
        selectedFeatures: [],
        selectedLabel: '',
        result: '',
        confidence: 0,
        analysis: '',
        trainDisable: false,
        predictDisable: true,
        learningRate: '0.25',
        batchSize: '64',
        epochs: '32',
        inputs: [],
        errors: []
    };

    private dropdownStyles: Partial<IDropdownStyles> = { dropdown: { width: 200 } };

    public render(): JSX.Element {
        const { fields } = this.props;

        const { selectedFeatures, learningRate,
            batchSize, epochs, errors, inputs, trainDisable,
            predictDisable, result, confidence, selectedLabel
        } = this.state;

        return (
            <div>
                {errors.length > 0 &&
                    <MessageBar
                        messageBarType={MessageBarType.error}
                        isMultiline={true}
                        onDismiss={this.closeMessageBar}
                        dismissButtonAriaLabel={strings.close}>
                        <ul style={{ margin: 0 }}>
                            {errors.map(e => (<li>{e}</li>))}
                        </ul>
                    </MessageBar>
                }
                <Stack horizontal horizontalAlign="center">
                    {strings.numberOfRec} {fields.length > 0
                        ? <b>&nbsp;{this.props.data.length}</b>
                        : <b>&nbsp;{strings.wait}</b>}
                </Stack>
                <Stack horizontal horizontalAlign="space-around">
                    <Dropdown
                        placeholder={strings.selFeatures}
                        label={strings.features}
                        onChange={this.onFeatureChange}
                        selectedKeys={selectedFeatures}
                        multiSelect
                        options={fields}
                        required={true}
                        styles={this.dropdownStyles}
                    />
                    <Dropdown
                        placeholder={strings.selLabel}
                        label={strings.label}
                        onChange={this.onLabelChange}
                        options={fields}
                        required={true}
                        styles={this.dropdownStyles}
                    />
                </Stack>
                <Stack horizontal horizontalAlign="space-around">
                    <ChoiceGroup
                        options={[
                            {
                                key: Analysis.Classification,
                                text: strings.classification
                            },
                            {
                                key: Analysis.Regression,
                                text: strings.regression
                            }
                        ]}
                        onChange={this.onAnalysisChange}
                        label={strings.analysis}
                        required={true}
                    />
                </Stack>
                <Stack horizontal horizontalAlign="space-around">
                    <TextField
                        label={strings.learningRate}
                        required
                        type="number"
                        value={learningRate}
                        onChange={this.onLearningRateChange}
                        styles={{ fieldGroup: { width: 70 } }}
                    />
                    <TextField
                        label={strings.batchSize}
                        required
                        type="number"
                        value={batchSize}
                        onChange={this.onBatchSizeChange}
                        styles={{ fieldGroup: { width: 70 } }}
                    />
                    <TextField
                        label={strings.epochs}
                        required
                        type="number"
                        value={epochs}
                        onChange={this.onEpochsChange}
                        styles={{ fieldGroup: { width: 70 } }}
                    />
                </Stack>
                <Stack horizontal horizontalAlign="end">
                    <PrimaryButton
                        onClick={this.startTraining}
                        text={strings.train}
                        disabled={trainDisable}
                        style={{ marginTop: '5px', marginRight: '40px' }} />
                </Stack>
                <hr />
                <div style={{ "textAlign": "center" }}>
                    {strings.prediction}
                    <div>
                        {result && <b>{selectedLabel} is {result}</b>}
                        {confidence > 0 && <span>&nbsp;({round(confidence * 100)}% confidence).</span>}
                    </div>
                </div>
                <Stack horizontal horizontalAlign="center">
                    {inputs.map(({ key }) =>
                        <div style={{ margin: '7px' }}>
                            <TextField
                                label={`${this.text(key)}`}
                                required
                                type="number"
                                onChange={e => this.onInputChange(key, e)}
                                styles={{ fieldGroup: { width: 90 } }}
                            />
                        </div>
                    )}
                </Stack>
                <Stack horizontal horizontalAlign="end">
                    <PrimaryButton
                        onClick={this.startPrediction}
                        text={strings.predict}
                        disabled={predictDisable}
                        style={{ marginTop: '5px', marginRight: '40px' }} />
                </Stack>
            </div>
        );
    }

    private startTraining = () => {
        const errors = [];

        const { fields } = this.props;
        const { selectedFeatures, selectedLabel,
            analysis, learningRate, batchSize, epochs
        } = this.state;

        if (selectedFeatures.length === 0) { errors.push(strings.errSelFeaturePls); }

        selectedFeatures.forEach(feature => {
            if (!find(fields, (f: any) => f.key === feature).isFieldNumber) {
                errors.push(String.Format(strings.errSelFeatureType, feature));
            }
        });

        if (!selectedLabel) { errors.push(strings.errSelLabelPls); }

        if (!analysis) { errors.push(strings.errSelClassOrReg); }

        if (!learningRate) { errors.push(strings.errLearningRate); }

        if (!batchSize) { errors.push(strings.errBatchSize); }

        if (!epochs) { errors.push(strings.errEpochs); }

        if (selectedFeatures.indexOf(selectedLabel as string) !== -1) {
            errors.push(String.Format(strings.errLabelSel, selectedLabel));
        }

        if (errors.length > 0) {
            this.setState({ errors });
        } else {
            this.clearErrors();
            this.train();
        }
    }

    private train() {
        this.setState({ trainDisable: true, predictDisable: true })

        const {
            selectedFeatures, selectedLabel, analysis,
            learningRate, batchSize, epochs
        } = this.state;

        let features: number[] = columns(this.props.data, selectedFeatures);
        let labels: number[] = columns(this.props.data, selectedLabel);

        let options = {
            inputs: selectedFeatures,
            outputs: [selectedLabel],
            task: analysis,
            debug: true,
        }

        this.model = ml5.neuralNetwork(options)

        features.forEach((element, index) => {
            const inputs = {}
            for (let i = 0; i < selectedFeatures.length; i++) {
                inputs[selectedFeatures[i]] = element[i]
            }
            const target = {
                [selectedLabel]:
                    this.state.analysis === Analysis.Classification
                        ? "" + labels[index][0]
                        : labels[index][0]
            }
            this.model.addData(inputs, target)
        });

        this.model.normalizeData()

        this.openVisor();

        let trainingOptions = {
            learningRate: +learningRate,
            batchSize: +batchSize,
            epochs: +epochs,
        }

        this.model.train(trainingOptions, (epoch, loss) => {
            console.log(epoch, loss)
        }, () => {
            this.setState({ trainDisable: false, predictDisable: false })
        })
    }

    private openVisor() {
        const visor = this.model.vis.tfvis.visor();
        if (!visor.isOpen()) visor.open()
    }

    private startPrediction = () => {
        const errors = [];

        this.state.inputs.forEach(({ key, value }) => {
            if (!value) {
                errors.push(String.Format(strings.errFeatureEmpty, key));
            } else {
                if (isNaN(+value)) {
                    errors.push(String.Format(strings.errFeatureValue, key));
                }
            }
        });

        if (errors.length > 0) {
            this.setState({ errors });
        } else {
            this.clearErrors();
            this.predict();
        }
    }

    private predict() {
        this.setState({ result: '', confidence: 0 })

        const inputs = {}
        this.state.inputs.forEach(({ key, value }) => {
            inputs[key] = value
        });

        this.state.analysis === Analysis.Classification
            ? this.model.classify(inputs, this.gotResults)
            : this.model.predict(inputs, this.gotResults)
    }

    private gotResults = (error, results) => {
        if (error) {
            this.setState({ errors: [error] });
        } else {
            const result = results[0]
            this.state.analysis === Analysis.Classification
                ? this.setState({ result: result.label, confidence: result.confidence })
                : this.setState({ result: round(result.value) })
        }
    }

    private text = key => find(this.props.fields, (f: any) => f.key === key).text;

    private addTextField = key => {
        const inputs = [...this.state.inputs];
        inputs.push({ key, value: null });
        this.setState({ inputs });
    }

    private removeTextField = key => {
        const inputs = this.state.inputs.filter(i => i.key !== key);
        this.setState({ inputs });
    }

    private onFeatureChange = (ev: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
        const newSelectedFeatures = [...this.state.selectedFeatures];

        if (item.selected) {
            newSelectedFeatures.push(item.key as string);
            this.addTextField(item.key);
        } else {
            const currIndex = newSelectedFeatures.indexOf(item.key as string);
            if (currIndex > -1) {
                newSelectedFeatures.splice(currIndex, 1);
                this.removeTextField(item.key);
            }
        }

        this.setState({ selectedFeatures: newSelectedFeatures });

        newSelectedFeatures.indexOf(this.state.selectedLabel as string) !== -1
            ? this.setState({ errors: [String.Format(strings.errFeatureSel, this.state.selectedLabel)] })
            : this.clearErrors();
    }

    private onLearningRateChange = (ev: React.FormEvent<HTMLInputElement>, newValue?: string) => {
        newValue && !isNaN(+newValue) && +newValue > 0
            ? this.setState({ learningRate: newValue })
            : this.setState({ learningRate: '' });
    }

    private onBatchSizeChange = (ev: React.FormEvent<HTMLInputElement>, newValue?: string) => {
        newValue && !isNaN(+newValue) && +newValue > 0
            ? this.setState({ batchSize: newValue })
            : this.setState({ batchSize: '' });
    }

    private onEpochsChange = (ev: React.FormEvent<HTMLInputElement>, newValue?: string) => {
        newValue && !isNaN(+newValue) && +newValue > 0
            ? this.setState({ epochs: newValue })
            : this.setState({ epochs: '' });
    }

    private onInputChange = (key, e: any) => {
        const input = find(this.state.inputs, i => i.key === key);
        input.value = e.target.value;
    }

    private onLabelChange = (ev: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
        this.setState({ selectedLabel: item.key as string });

        this.state.selectedFeatures.indexOf(item.key as string) !== -1
            ? this.setState({ errors: [String.Format(strings.errLabelSel, item.key)] })
            : this.clearErrors();
    }

    private onAnalysisChange = (ev: React.FormEvent<HTMLInputElement>, option: any): void =>
        this.setState({ analysis: option.key })

    private closeMessageBar = (): void => this.clearErrors();

    private clearErrors = () => this.setState({ errors: [] });
}