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
        <Modal isActive onClose={this.props.onCancel}>
          <div className="mr-flex mr-justify-between">
            <div className="mr-pt-12">
              <SvgSymbol
                sym="illustration-tasks"
                viewBox="0 0 200 171"
                className="mr-h-40 mr-mr-12"
              />
            </div>
            <div className="mr-w-full">
              <h2 className="mr-text-white mr-text-4xl mr-mb-4">
                <FormattedMessage {...messages.importModalHeader} />
              </h2>

              <div className="mr-mt-2">
                {this.state.importingFiles ? <BusySpinner /> :
                 <div>
                   <Dropzone
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
                     {({acceptedFiles, getRootProps, getInputProps}) => {
                       const body = acceptedFiles.length > 0 ? <p>{acceptedFiles[0].name}</p> : (
                         <React.Fragment>
                           <SvgSymbol
                             viewBox='0 0 20 20'
                             sym="upload-icon"
                             className="mr-fill-current mr-w-3 mr-h-3 mr-mr-4"
                           />
                           <FormattedMessage {...messages.importModalUploadLabel} />
                           <input {...getInputProps()} />
                         </React.Fragment>
                       )

                       return (
                         <div
                           className="dropzone mr-text-green-lighter mr-border-green-lighter mr-border-2 mr-rounded mr-p-4 mr-mx-auto mr-mt-12 mr-cursor-pointer"
                           {...getRootProps()}
                         >
                           {body}
                         </div>
                       )
                     }}
                   </Dropzone>
                   <div className="mr-flex mr-justify-end mr-items-center mr-mt-8">
                     <button
                       className="mr-button mr-button--white"
                       onClick={this.props.onCancel}
                     >
                       <FormattedMessage {...messages.cancelLabel} />
                     </button>
                  </div>
                </div>
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
