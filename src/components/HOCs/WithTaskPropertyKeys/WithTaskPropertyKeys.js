import React, { Component } from 'react'
import _get from 'lodash/get'
import _sortBy from 'lodash/sortBy'
import { fetchPropertyKeys } from '../../../services/Challenge/Challenge'

/**
 * WithTaskPropertyKeys makes property keys available from server.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithTaskPropertyKeys = function(WrappedComponent) {
   return class extends Component {
     state = {
       taskPropertyKeys: null,
     }

     getTaskPropertyKeys = () => {
       const challengeId = _get(this.props, 'challenge.id') || this.props.challengeId

       if (challengeId && !this.state.loadingPropertyKeys){
         this.setState({loadingPropertyKeys: true})
         fetchPropertyKeys(challengeId).then( (results) => {
           console.log('task prop key results', results)
           this.setState({loadingPropertyKeys: false, taskPropertyKeys: _sortBy(results)})
           return results
         }).catch(error => {
           this.setState({loadingPropertyKeys: false, taskPropertyKeys: []})
         })
         return []
       }
       else {
         return []
       }
     }

     componentDidMount() {
       const challengeId = _get(this.props, 'challenge.id') || this.props.challengeId
       if (challengeId) {
         this.getTaskPropertyKeys()
       }
     }

     componentDidUpdate(prevProps) {
       const challengeId = _get(this.props, 'challenge.id') || this.props.challengeId
       if (!challengeId) {
         return
       }

       if (_get(this.props, 'challenge.id') !== _get(prevProps, 'challenge.id') ||
           this.props.challengeId !== prevProps.challengeId) {
         this.getTaskPropertyKeys()
       }
     }

     render() {
       return (
         <WrappedComponent {...this.props}
           taskPropertyKeys={this.state.taskPropertyKeys}
           loadingPropertyKeys={this.state.loadingPropertyKeys}
         />
       )
     }
   }
 }

export default WrappedComponent => WithTaskPropertyKeys(WrappedComponent)
