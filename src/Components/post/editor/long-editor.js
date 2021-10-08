import React from 'react';
import DanteEditor from 'Dante2';
import _ from 'lodash';
import AxiosHelper from '../../../utils/axios';
import { ImageBlockConfig } from 'Dante2/package/es/components/blocks/image.js';
import { PlaceholderBlockConfig } from 'Dante2/package/es/components/blocks/placeholder';
import { withFirebase } from '../../../store/firebase';
import { IMAGE_BASE_URL } from '../../../utils/constants/urls';

const SAVE_INTERVAL = 4000;
class LongEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: this.props.username,
            isInitial: true,
            needOnlineSync: false,
            lastBlockText: ''
        }
        this.handleSave = this.handleSave.bind(this);
        this.handleSaveSuccess = this.handleSaveSuccess.bind(this);
        this.handleSaveError = this.handleSaveError.bind(this);
        this.handleTextChange = _.debounce(() => {
            if (this.props.isSavePending) this.props.onSavePending(false)
        }, 4200);
        this.checkIsEqual = this.checkIsEqual.bind(this);
    }

    checkIsEqual() {
        return _.isEqual(
            JSON.stringify(this.props.localDraft),
            JSON.stringify(this.props.onlineDraft));
    }

    handleSave(editorContext, content) {
        if (this.state.isInitial) {
            if (this.checkIsEqual()) {
                return this.setState({ isInitial: false },
                    this.props.onSavePending(false));
            }
            this.setState({ isInitial: false });
            return AxiosHelper.saveDraft(this.props.username, content)
                .then(
                    (result) => this.handleSaveSuccess(result)
                )
                .catch(
                    (err) => this.handleSaveError(err)
                )
        }
        else if (!this.props.isSavePending) {
            console.log("Catch uneccessary save");
        }
        else {
            console.log("Saving");
            return AxiosHelper.saveDraft(this.props.username, content)
                .then((result) => this.handleSaveSuccess(result))
                .catch((err) => this.handleSaveError(err))
        }
    }

    handleSaveSuccess(result) {
        this.props.onSavePending(false);

    }
    handleSaveError(result) {
        this.props.onSavePending(false);
        alert(`Draft Failed to Save. Please check your
               connection or save your draft locally for now. : (`
        );
    }

    render() {
        return (
            < DanteEditor
                onChange={
                    (editor) => {
                        const editorState = editor.emitSerializedOutput();
                        this.props.onSavePending(true);
                        this.props.setLocalDraft(editorState);
                        this.handleTextChange();
                    }
                }
                content={this.props.onlineDraft}
                default_wrappers={[
                    { className: 'my-custom-h1', block: 'header-one' },
                    { className: 'my-custom-h2', block: 'header-two' },
                    { className: 'my-custom-h3', block: 'header-three' },
                ]}
                widgets={[
                    ImageBlockConfig({
                        options: {
                            upload_url: IMAGE_BASE_URL,
                            upload_callback: (ctx, img) => {
                                console.log(ctx);
                                console.log(img);
                                alert('file uploaded: ' +
                                    ctx.data.url);
                                this.setState({ needOnlineSync: true })
                            },
                            upload_error_callback: (ctx, img) => {
                                console.log(ctx)
                            },
                        },
                    }),
                    PlaceholderBlockConfig(),
                ]}
                data_storage={
                    {
                        save_handler: this.handleSave,
                        interval: SAVE_INTERVAL,
                        success_handler: this.handleSaveSuccess,
                        failure_handler: this.handleSaveError
                    }
                }
            />
        );
    }
}

export default withFirebase(LongEditor);