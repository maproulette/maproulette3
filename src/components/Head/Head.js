import React from 'react'
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router';
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser';
import WithCurrentProject from '../AdminPane/HOCs/WithCurrentProject/WithCurrentProject';
import WithCurrentChallenge from '../AdminPane/HOCs/WithCurrentChallenge/WithCurrentChallenge';
import { injectIntl } from 'react-intl';
import Image from '../../static/images/bg-highway.jpg'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'

export const REACT_APP_TITLE = 'MapRoulette'

const capitalize  = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const findCurrentChallengeName = (props) => {
  return props.challenge?.name
}

const findCurrentProjectName = (props) => {
  return props.project?.displayName
}

const findCurrentUserName = (props) => {
  return props.user?.osmProfile.displayName
}

const findCurrentCountryCode = (props) => {
  return _get(props, 'match.params.countryCode')
}

const findCurrentTaskId = (props) => {
  return _get(props, 'match.params.taskId')
}

const findReviewType = (props) => {
  return _get(props, 'match.params.showType')
}

/* parse names from url path into array, replace id params with names, and then concatenate with - for title */
export const formatTitle = (props) => {
  if (props?.match?.path) {
    let pathArr = props.match.path.split('/').filter(element => element)

    pathArr = pathArr.map(param => {
      if (param === ':challengeId') {
        return findCurrentChallengeName(props)
      } else if (param === ':projectId') {
        return findCurrentProjectName(props)
      } else if (param === ':countryCode') {
        return findCurrentCountryCode(props)
      } else if (param === ':userId') {
        return findCurrentUserName(props)
      } else if (param === ':taskId') {
        return findCurrentTaskId(props)
      } else if (param === ':showType') {
        return findReviewType(props)
      } else {
        return capitalize(param)
      }
    })
    const newTitle = _isEmpty(pathArr) ? REACT_APP_TITLE : REACT_APP_TITLE + ' - ' + pathArr.join(' - ')
    return newTitle
  }
}

export const HeadTitle = (props) => {
  return (
    <Helmet>
      <title>{formatTitle(props)}</title>
      <meta property="og:title" content={formatTitle(props)} />
      <meta name="description" content={props.challenge ? props.challenge?.description: "Navigate to Maproulette.org"} />
      <meta property="og:description" content={"description"} />
      <meta property="og:image" content={Image} />
      <meta
        property="og:url"
        content={window.location.pathname + window.location.search}
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image:alt" content={"maproulette image"} />
      <meta name="twitter:site" content={""} />
    </Helmet>
  )
}

export default withRouter(WithCurrentUser(WithCurrentProject(WithCurrentChallenge(injectIntl(HeadTitle)), { allowNonManagers: true })))
