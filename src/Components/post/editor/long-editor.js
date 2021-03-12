import React from 'react';
import _ from 'lodash';
import AxiosHelper from '../../../Axios/axios';
import { withFirebase } from '../../../Firebase';
import SlateEditor from "./sub-components/slate-editor";


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
    }
    handleSave(editorContext, content) {
        if (this.state.isInitial) {
            if (_.isEqual(
                JSON.stringify(this.props.localDraft),
                JSON.stringify(this.props.onlineDraft))) {
                this.setState({ isInitial: false },
                    this.props.onSavePending(false));
                console.log("Catch uneccessary first save");
            }
        }
        else if (!this.props.isSavePending) {
            console.log("Catch uneccessary save");
        }
        else {
            console.log("Saving");
            AxiosHelper.saveDraft(this.props.username, content)
                .then(
                    (result) => this.handleSaveSuccess(result)
                )
                .catch(
                    (err) => this.handleSaveError(err)
                )
        }
    }

    handleSaveSuccess(result) {
        console.log("Reached", result);
        this.props.onSavePending(false);

    }
    handleSaveError(result) {
        console.log("Fail")
        this.props.onSavePending(false);
        alert(`Draft Failed to Save. Please check your
               connection or save your draft locally for now. : (`
        );
    }

    render() {
        return (
            <SlateEditor />
        );
    }
}

export default withFirebase(LongEditor);