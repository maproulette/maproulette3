import React, { useState, useEffect } from 'react'
import { FormattedMessage, FormattedDate, injectIntl } from 'react-intl'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Link } from 'react-router-dom'
import { parseISO } from 'date-fns'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import { fetchSocialChallenges } from '../../services/Challenge/Challenge'
import WithCurrentUser
       from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import ChallengeShareControls
       from '../../components/TaskPane/ChallengeShareControls/ChallengeShareControls'
import SvgSymbol from '../../components/SvgSymbol/SvgSymbol'
import MarkdownContent from '../../components/MarkdownContent/MarkdownContent'
import BusySpinner from '../../components/BusySpinner/BusySpinner'
import SignIn from '../SignIn/SignIn'
import messages from './Messages'

export const Social = props => {
  const [challenges, setChallenges] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSocialChallenges(10).then(results => {
      setChallenges(results)
      setLoading(false)
    })
  }, [])

  if (!props.user) {
    return (
      props.checkingLoginStatus ?
      <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
        <BusySpinner />
      </div> :
      <SignIn {...props} />
    )
  }

  return (
    <div className="mr-bg-gradient-r-green-dark-blue mr-px-6 mr-py-8 md:mr-py-12">
      <div className="mr-mx-4 mr-mt-12">
        <div className="mr-mt-12 mr-cards-inverse mr-bg-black-10 mr-rounded mr-p-4 mr-pb-8 mr-relative mr-z-5">
          {loading ? <BusySpinner /> : (
           <div className="mr-flex mr-justify-between">
             <div className="mr-max-w-1/3 mr-min-w-36 mr-w-1/3">
               <ChallengeList
                 header={messages.newestChallengesHeader}
                 challenges={challenges.newest}
                 lead={props.intl.formatMessage(messages.newestLead)}
               />
             </div>
             <div className="mr-max-w-1/3 mr-min-w-36 mr-w-1/3">
               <ChallengeList
                 header={messages.featuredChallengesHeader}
                 challenges={challenges.featured}
                 lead={props.intl.formatMessage(messages.featuredLead)}
               />
             </div>
             <div className="mr-max-w-1/3 mr-min-w-36 mr-w-1/3">
               <ChallengeList
                 header={messages.popularChallengesHeader}
                 challenges={challenges.popular}
                 lead={props.intl.formatMessage(messages.popularLead)}
               />
             </div>
           </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ChallengeList = props => {
  const list =
    _isEmpty(props.challenges) ?
    <FormattedMessage {...messages.none} /> :
    <ol>
      {_map(
        props.challenges,
        challenge => <ChallengeItem challenge={challenge} lead={props.lead} />
      )}
    </ol>

  return (
    <div>
      <h3 className="mr-text-yellow mr-text-center">
        <FormattedMessage {...props.header} />
      </h3>
      {list}
    </div>
  )
}

const ChallengeItem = props => {
  const shareTitle = `${props.lead} ${props.challenge.name}`
  const shareUrl = `${process.env.REACT_APP_URL}/browse/challenges/${props.challenge.id}`

  return (
    <li
      key={props.challenge.id}
      className="mr-bg-black-10 mr-rounded mr-p-4 mr-links-green-lighter mr-my-4"
    >
      <div className="mr-flex mr-items-center mr-mb-4">
        <CopyToClipboard text={`${shareTitle} ${shareUrl}`}>
          <button type="button">
            <SvgSymbol
              sym="clipboard-icon"
              viewBox="0 0 20 20"
              className="mr-fill-green-lighter mr-w-4 mr-h-4 mr-mr-4"
            />
          </button>
        </CopyToClipboard>
        <ChallengeShareControls title={shareTitle} challenge={props.challenge} />
      </div>
      <Link to={`/browse/challenges/${props.challenge.id}`}>
        {props.challenge.name}
      </Link>
      <div className="mr-text-sm mr-text-grey-light mr-my-2">
        <FormattedDate value={parseISO(props.challenge.created)} />
      </div>
      <div className="mr-text-white mr-break-words">
        <MarkdownContent markdown={props.challenge.description} />
      </div>
    </li>
  )
}

export default WithCurrentUser(injectIntl(Social))
