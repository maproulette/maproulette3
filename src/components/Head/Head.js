import React from 'react'
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router';
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser';
import WithCurrentProject from '../AdminPane/HOCs/WithCurrentProject/WithCurrentProject';
import WithCurrentChallenge from '../AdminPane/HOCs/WithCurrentChallenge/WithCurrentChallenge';
import { injectIntl } from 'react-intl';
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'

export const HeadTitle = (props) => {

  const REACT_APP_TITLE = 'MapRoulette'

  useEffect(() => {
    pathToTitleFormat(props.match.path)
  }, [props.location.pathname, props.project, props.challenge, props.user])

  const findCurrentChallengeName = () => {
    return props.challenge?.name
  }

  const findCurrentProjectName = () => {
    return props.project?.displayName
  }

  const findCurrentUserName = () => {
    return props.user?.osmProfile.displayName
  }

  const findCurrentCountryCode = () => {
    return _get(props, 'match.params.countryCode')
  }

  const findCurrentTaskId = () => {
    return _get(props, 'match.params.taskId')
  }

  const findReviewType = () => {
    return _get(props, 'match.params.showType')
  }

  /* parse names from url path into array, replace id params with names, and then concatenate with - for title */
  const pathToTitleFormat = (path) => {
    let pathArr = path.split('/').filter(element => element)
    pathArr = pathArr.map(params => {
      if (params === ':challengeId') {
        return findCurrentChallengeName()
      }
      else if (params === ':projectId') {
        return findCurrentProjectName()
      }
      else if (params === ':countryCode') {
        return findCurrentCountryCode()
      }
      else if (params === ':userId') {
        return findCurrentUserName()
      }
      else if (params === ':taskId') {
        return findCurrentTaskId()
      }
      else if (params === ':showType') {
        return findReviewType()
      }
      else {
        return params
      }
    })
    let newTitle = _isEmpty(pathArr) ? REACT_APP_TITLE : REACT_APP_TITLE + '-' + pathArr.join('-')
    return newTitle
  }

  return (
    <Helmet>
      <title>{pathToTitleFormat(props.match.path)}</title>
    </Helmet>
  )
}

export default withRouter(WithCurrentUser(WithCurrentProject(
  WithCurrentChallenge(
    injectIntl(HeadTitle)))
)
)
