import React from 'react'
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router';
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser';
import WithProject from '../HOCs/WithProject/WithProject'
import WithChallenges from '../HOCs/WithChallenges/WithChallenges';
import WithChallenge from '../HOCs/WithChallenge/WithChallenge';
import WithBrowsedChallenge from '../HOCs/WithBrowsedChallenge/WithBrowsedChallenge';
import { injectIntl } from 'react-intl';
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'

const HeadTitle = (props) => {

  const [title, setTitle] = useState(process.env.REACT_APP_TITLE)

  useEffect(() => {
    getPath(props.match.path)
  }, [props.location.pathname, props.project, props.browsedChallenge])

  const findCurrentChallengeName = () => {
    return props.browsedChallenge && props.browsedChallenge.name
  }

  const findCurrentProjectName = () => {
    return props.project && props.project.displayName
  }

  const findCurrentUserName = () => {
    return props.osmProfile && props.osmProfile.displayName
  }

  const findCurrentCountryCode = () => {
    return _get(props, 'match.params.countryCode')
  }

  const getPath = (path) => {
    pathToTitleFormat(path)
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
      else {
        return params
      }
    })
    let newTitle = _isEmpty(pathArr) ? process.env.REACT_APP_TITLE : process.env.REACT_APP_TITLE + '-' + pathArr.join('-')
    setTitle(newTitle)
  }

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
    </>
  )
}

export default withRouter(WithCurrentUser(WithProject(
  WithChallenges(
    WithChallenge(
      WithBrowsedChallenge(injectIntl(HeadTitle))
    )
  ))))