import { useState } from 'react'
import { injectIntl, FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import _isEmpty from 'lodash/isEmpty'
import WithCurrentUser
       from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import WithErrors from '../../components/HOCs/WithErrors/WithErrors'
import MyTeams from '../../components/Teams/MyTeams/MyTeams'
import ViewTeam from '../../components/Teams/ViewTeam/ViewTeam'
import EditTeam from '../../components/Teams/EditTeam/EditTeam'
import SvgSymbol from '../../components/SvgSymbol/SvgSymbol'
import BusySpinner from '../../components/BusySpinner/BusySpinner'
import SignIn from '../SignIn/SignIn'
import teamsImage from '../../static/images/teams.svg'
import messages from '../../components/Widgets/TeamsWidget/Messages'

export const Teams = props => {
  const [editingTeam, setEditingTeam] = useState(null)
  const [viewingTeam, setViewingTeam] = useState(null)
  const [showCards, setShowCards] = useState(false)

  if (!props.user) {
    return (
      props.checkingLoginStatus ?
      <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
        <BusySpinner />
      </div> :
      <SignIn {...props} />
    )
  }

  let subheader = messages.title
  let headerControls = null
  let currentView = null

  if (editingTeam) {
    currentView = (
      <EditTeam
        {...props}
        team={editingTeam}
        finish={success => {
          setEditingTeam(null)
          if (success) {
            setViewingTeam(null)
          }
        }}
      />
    )

    subheader =
      _isEmpty(editingTeam) ?
      messages.createTeamTitle :
      messages.editTeamTitle
  }
  else if (viewingTeam) {
    currentView = <ViewTeam {...props} team={viewingTeam} />
    subheader = messages.viewTeamTitle
    headerControls = (
      <div className="mr-links-green-lighter">
        <a className="mr-mb-4" onClick={() => setViewingTeam(null)}>
          &larr; <FormattedMessage {...messages.myTeamsLabel} />
        </a>
      </div>
    )
  }
  else {
    currentView = (
      <MyTeams
        {...props}
        viewTeam={team => setViewingTeam(team)}
        editTeam={team => setEditingTeam(team)}
        createTeam={() => setEditingTeam({})}
        showCards={showCards}
      />
    )
    subheader = messages.myTeamsTitle
    headerControls = (
      <div className="mr-flex mr-justify-end mr-items-center mr-mb-4">
        <a onClick={() => setShowCards(true)}>
          <SvgSymbol
            sym="cards-icon"
            viewBox="0 0 20 20"
            className={classNames(
              "mr-h-4 mr-w-4 mr-ml-4",
              showCards ? "mr-fill-white" : "mr-fill-white-50"
            )}
          />
        </a>
        <a onClick={() => setShowCards(false)}>
          <SvgSymbol
            sym="list-icon"
            viewBox="0 0 20 20"
            className={classNames(
              "mr-h-4 mr-w-4 mr-ml-4",
              !showCards ? "mr-fill-white" : "mr-fill-white-50"
            )}
          />
        </a>
      </div>
    )
  }

  return (
    <div className="mr-bg-gradient-r-green-dark-blue mr-px-6 mr-py-8 md:mr-py-12">
      <div className="mr-mx-4 mr-mt-12">
        <div className="mr-flex mr-flex-col mr-items-center mr-bg-blue-dark mr-rounded mr-w-full">
          <div className="mr-flex mr-justify-between mr-px-4 mr-h-64 mr-w-full mr-px-20 mr-pt-8 mr--mb-8 mr-relative">
            <div className="mr-flex mr-flex-col mr-items-center mr-w-1/2">
              <h2 className="mr-text-yellow mr-font-light mr-text-4xl mr-mb-8">
                <FormattedMessage {...messages.title} />
              </h2>
              <button
                className="mr-button"
                onClick={() => setEditingTeam({})}
              >
                <FormattedMessage {...messages.createTeamLabel} />
              </button>
            </div>
            <div className="mr-w-1/2 mr-h-100 mr-absolute mr-top-0 mr-right-0 mr--mt-20">
              <img src={teamsImage} className="mr-w-full mr-h-full" />
            </div>
          </div>
        </div>
        <div className="mr-mt-12 mr-cards-inverse mr-bg-black-10 mr-rounded mr-p-4 mr-pb-8 mr-relative mr-z-5">
          <div className="mr-flex mr-justify-between mr-items-center mr-mb-4">
            <div className="mr-text-md mr-text-yellow">
              <FormattedMessage {...subheader} />
            </div>
            {headerControls}
          </div>
          {currentView}
        </div>
      </div>
    </div>
  )
}

export default WithErrors(WithCurrentUser(injectIntl(Teams)))
