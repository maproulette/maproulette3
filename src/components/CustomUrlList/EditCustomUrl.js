import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Form from '@rjsf/core'
import { FormattedMessage } from 'react-intl'
import { jsSchema, uiSchema } from './UrlSchema'
import messages from './Messages'

/**
 * Displays a form for creating or editing custom url fields
 */
export const EditCustomUrl = props => {
  const [urlFields, setUrlFields] = useState({})

  return (
    <Form
      schema={jsSchema(props.intl)}
      uiSchema={uiSchema(props.intl)}
      className="form"
      liveValidate
      noHtml5Validate
      showErrorList={false}
      formData={Object.assign({}, props.url, urlFields)}
      onChange={({formData}) => setUrlFields(formData)}
    >
      <div className="mr-flex mr-justify-between mr-items-center">
        <button
          type="button"
          className="mr-button mr-button--white"
          onClick={() => props.finish(null)}
        >
          <FormattedMessage {...messages.cancelLabel} />
        </button>

        <button
          type="button"
          className="mr-button mr-button--green-lighter mr-ml-4"
          onClick={() => props.finish(urlFields)}
        >
          <FormattedMessage {...messages.saveLabel} />
        </button>
      </div>
    </Form>
  )
}

EditCustomUrl.propTypes = {
  finish: PropTypes.func.isRequired,
}

export default EditCustomUrl
