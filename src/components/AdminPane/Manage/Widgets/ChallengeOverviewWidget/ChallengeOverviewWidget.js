import React, { Component } from 'react'
import { FormattedMessage, FormattedDate } from 'react-intl'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import { parseISO } from 'date-fns'
import { ChallengeStatus, messagesByStatus }
       from  '../../../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import AsManager from '../../../../../interactions/User/AsManager'
import ChallengeKeywords from '../../ChallengeKeywords/ChallengeKeywords'
import VisibilitySwitch from '../../VisibilitySwitch/VisibilitySwitch'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import messages from './Messages'

const descriptor = {
  widgetKey: 'ChallengeOverviewWidget',
  label: messages.label,
  targets: [WidgetDataTarget.challenge],
  minWidth: 3,
  defaultWidth: 4,
  defaultHeight: 7,
}

export default class ChallengeOverviewWidget extends Component {
  render() {
    if (_isEmpty(this.props.challenge)) {
      return null
    }

    const manager = AsManager(this.props.user)
    const status = _get(this.props, 'challenge.status', ChallengeStatus.none)

    const lastTaskRefreshText = this.props.intl.formatMessage(messages.lastTaskRefresh);

    const dataOriginDateText =
      (!this.props.challenge.dataOriginDate || !this.props.challenge.lastTaskRefresh) ? null :
      this.props.intl.formatMessage(messages.dataOriginDate,
        {refreshDate: this.props.intl.formatDate(parseISO(this.props.challenge.lastTaskRefresh)),
         sourceDate: this.props.intl.formatDate(parseISO(this.props.challenge.dataOriginDate))})

    return (
      <QuickWidget {...this.props}
                  className="challenge-overview-widget"
                  widgetTitle={<FormattedMessage {...messages.title} />}>
        <div className="mr-text-base mr-mt-4">
          <div className="mr-flex mr-items-center">
            <div className="mr-text-yellow mr-mr-2">
              <FormattedMessage {...messages.status} />
            </div>

            <div>
              <FormattedMessage {...messagesByStatus[status]} />
            </div>
          </div>

          <div className="mr-flex mr-items-center">
            <div className="mr-text-yellow mr-mr-2">
              <FormattedMessage {...messages.visibleLabel} />
            </div>

            <div>
              {this.props.challenge.parent &&
               <div className="mr-mt-1">
                 <VisibilitySwitch
                   {...this.props}
                   disabled={!manager.canWriteProject(this.props.challenge.parent)}
                 />
               </div>
              }
            </div>
          </div>
          {this.props.challenge.enabled && this.props.challenge.parent && !this.props.challenge.parent.enabled &&
          <div className="mr-text-red-light mr-flex mr-items-center mr-text-base mr-uppercase mr-mt-2">
             <a
               href={`${process.env.REACT_APP_DOCS_URL}/documentation/challenge-visibility-and-discovery/`}
               className="mr-mr-2 mr-flex mr-items-center"
               target="_blank"
               rel="noopener noreferrer"
             >
               <SvgSymbol
                 sym="info-icon"
                 viewBox="0 0 40 40"
                 className="mr-fill-red mr-w-6 mr-w-6"
               />
             </a>
             <FormattedMessage {...messages.projectDisabledWarning} />
           </div>
          }

          <div className="mr-flex mr-items-baseline">
            <div className="mr-text-yellow mr-mr-2">
              <FormattedMessage {...messages.keywordsLabel} />
            </div>
            <ChallengeKeywords className="mr-py-4" challenge={this.props.challenge} />
          </div>

          <div className="mr-flex mr-items-center">
            <div className="mr-text-yellow mr-mr-2">
              <FormattedMessage {...messages.creationDate} />
            </div>

            <div>
              {this.props.challenge.created &&
              <FormattedDate value={parseISO(this.props.challenge.created)}
                              year='numeric' month='long' day='2-digit' />
              }
            </div>
          </div>

          <div className="mr-flex mr-items-center">
            <div className="mr-text-yellow mr-mr-2" title={lastTaskRefreshText}>
              <FormattedMessage {...messages.lastModifiedDate} />
            </div>

            <div>
              {this.props.challenge.lastTaskRefresh &&
              <FormattedDate value={parseISO(this.props.challenge.lastTaskRefresh)}
                              year='numeric' month='long' day='2-digit' />
              }
            </div>
          </div>

          <div className="mr-flex mr-items-center">
            <div className="mr-text-yellow mr-mr-2" title={dataOriginDateText}>
              <FormattedMessage {...messages.tasksFromDate} />
            </div>

            <div title={dataOriginDateText}>
              {this.props.challenge.dataOriginDate &&
              <FormattedDate value={parseISO(this.props.challenge.dataOriginDate)}
                              year='numeric' month='long' day='2-digit' />
              }
            </div>
          </div>
        </div>
      </QuickWidget>
    )
  }
}

registerWidgetType(ChallengeOverviewWidget, descriptor)
