import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useMutation } from '@apollo/client'
import Form from '@rjsf/core'
import { FormattedMessage } from 'react-intl'
import _isFinite from 'lodash/isFinite'
import _isEmpty from 'lodash/isEmpty'
import AppErrors from '../../../services/Error/AppErrors'
import { jsSchema, uiSchema } from './TeamSchema'
import BusySpinner from '../../BusySpinner/BusySpinner'
import { CREATE_TEAM, UPDATE_TEAM } from '../TeamQueries'
import messages from './Messages'

/**
 * Displays a form for creating or editing team fields
 */
export const EditTeam = props => {
  const [teamFields, setTeamFields] = useState({})
  const [createTeam, { loading: isCreating }] = useMutation(CREATE_TEAM)
  const [updateTeam, { loading: isUpdating }] = useMutation(UPDATE_TEAM)
  const isSaving = isCreating || isUpdating

  if (isSaving) {
    return <BusySpinner />
  }

  return (
    <Form
      schema={jsSchema(props.intl)}
      uiSchema={uiSchema(props.intl)}
      className="form"
      liveValidate
      noHtml5Validate
      showErrorList={false}
      formData={Object.assign({}, props.team, teamFields)}
      onChange={({formData}) => setTeamFields(formData)}
    >
      <div className="mr-flex mr-justify-between mr-items-center mr-mt-8">
        <button
          type="button"
          className="mr-button mr-button--white"
          onClick={() => props.finish(false)}
        >
          <FormattedMessage {...messages.cancelLabel} />
        </button>

        {isSaving ?
         <BusySpinner inline /> :
         <button
           type="button"
           className="mr-button mr-button--green-lighter mr-ml-4"
           onClick={() => {
             if (!_isEmpty(teamFields)) {
               if (_isFinite(teamFields.id)) {
                 updateTeam({variables: teamFields})
               }
               else {
                 createTeam({
                   variables: teamFields,
                   refetchQueries: ['MyTeams'],
                 })
                 .catch(error => {
                     props.addErrorWithDetails(AppErrors.team.failure, error.message)
                 })
               }
             }
             props.finish(true)
           }}
         >
           <FormattedMessage {...messages.saveLabel} />
         </button>
        }
      </div>
    </Form>
  )
}

EditTeam.propTypes = {
  finish: PropTypes.func.isRequired,
}

export default EditTeam
