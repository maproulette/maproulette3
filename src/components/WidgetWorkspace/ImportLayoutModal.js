import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Dropzone from 'react-dropzone'
import { FormattedMessage } from 'react-intl'
import External from '../External/External'
import Modal from '../Modal/Modal'
import BusySpinner from '../BusySpinner/BusySpinner'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'

export default class ImportLayoutModal extends Component {
  state = {
    importingFile: false,
  }

  render() {
    return (
      <External>
        <Modal isActive onCancel={this.props.onCancel}>
          <div className="mr-flex mr-justify-between">
            <div className="mr-pt-12">
              <SvgSymbol
                sym="illustration-choose"
                viewBox="0 0 147 200"
                className="mr-h-64 mr-mr-12 mr-max-w-40"
              />
            </div>
            <div className="mr-w-full">
              <h2 className="mr-text-white mr-text-4xl mr-mb-4">
                <FormattedMessage {...messages.importModalHeader} />
              </h2>

              <div className="mr-mt-2">
                {this.state.importingFiles ? <BusySpinner /> :
                 <Dropzone
                   className="dropzone mr-text-green-lighter mr-border-green-lighter mr-border-2 mr-rounded mr-p-4 mr-mx-auto mr-mt-12 mr-cursor-pointer"
                   acceptClassName="active"
                   multiple={false}
                   disablePreview
                   onDrop={files => {
                     this.setState({importingFiles: true})
                     this.props.onUpload(files[0]).then(() => {
                       this.setState({importingFiles: false})
                       this.props.onCancel()
                     })
                   }}
                 >
                   {({acceptedFiles}) => {
                     if (acceptedFiles.length > 0) {
                       return <p>{acceptedFiles[0].name}</p>
                     }
                     else {
                       return (
                         <div>
                           <SvgSymbol
                             viewBox='0 0 20 20'
                             sym="upload-icon"
                             className="mr-fill-current mr-w-3 mr-h-3 mr-mr-4"
                           />
                           <FormattedMessage {...messages.importModalUploadLabel} />
                         </div>
                       )
                     }
                   }}
                 </Dropzone>
                }
              </div>
            </div>
          </div>
        </Modal>
      </External>
    )
  }
}

ImportLayoutModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
}
