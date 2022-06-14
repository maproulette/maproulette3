import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { defaultRoutes as api } from "../../../../services/Server/Server";
import Endpoint from "../../../../services/Server/Endpoint";
import { challengeSchema } from "../../../../services/Challenge/Challenge";
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import AssociatedChallengeList from './AssociatedChallengeList';

const getChallengeById = async (id) => {
  const result = await new Endpoint(api.challenge.single, { variables: { id }, schema: challengeSchema() }).execute()

  return result
}

const ChallengeIdResult = (props) => {
  const [challenge, setChallenge] = useState();

  useEffect(() => {
    if (Number.isInteger(Number(props.query)) && props.query > 0) {
      getChallengeById(props.query).then((data) => {
        setChallenge(data.entities?.challenges?.[props.query])
      })
    } else {
      setChallenge(undefined)
    }
  }, [props.query])

  if (challenge && !props.excludeChallenges.find(c => c.id === challenge.id)) {
    return (
      <AssociatedChallengeList
        {..._omit(props, 'challenges')}
        toBeAdded
        challenges={[challenge]}
        allStatuses={true}
        includeId
      />
    );
  }

  return null;
}

export const mapStateToProps = (state) => {
  return { query: _get(state, 'currentSearch.adminChallengeList.query', '') }
}

export default connect(mapStateToProps)(ChallengeIdResult)
