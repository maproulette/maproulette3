import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import _get from 'lodash/get'
import WithSearch from '../../../../HOCs/WithSearch/WithSearch'
import WithTaskReview from '../../../../HOCs/WithTaskReview/WithTaskReview'
import WithTaskTags from '../../../../HOCs/WithTaskTags/WithTaskTags'
import WithSuggestedFix from '../../../../HOCs/WithSuggestedFix/WithSuggestedFix'
import WithKeyboardShortcuts
       from '../../../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import TagDiffVisualization from '../../../../TagDiffVisualization/TagDiffVisualization'
import Dropdown from '../../../../Dropdown/Dropdown'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'
import TaskFixedControl
       from '../../../../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskFixedControl/TaskFixedControl'
import TaskSkipControl
       from '../../../../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskSkipControl/TaskSkipControl'
import TaskTooHardControl
       from '../../../../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskTooHardControl/TaskTooHardControl'
import TaskFalsePositiveControl
       from '../../../../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskFalsePositiveControl/TaskFalsePositiveControl'
import TaskAlreadyFixedControl
       from '../../../../TaskPane/ActiveTaskDetails/ActiveTaskControls/TaskAlreadyFixedControl/TaskAlreadyFixedControl'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import TagDiffModal from '../../../../TagDiffVisualization/TagDiffModal'
import messages from './Messages'

export class SuggestedFixControls extends Component {
  state = {
    showDiffModal: false,
  }

  render() {
    if (!this.props.task) {
      return null
    }

    return (
      <div className="mr-pb-2">
        <div className="mr-flex mr-justify-between">
          <h4 className="mr-my-4 mr-text-base">
            <FormattedMessage {...messages.tagsHeader} />
          </h4>
          <button
            className="mr-text-green-lighter"
            onClick={() => this.setState({showDiffModal: true})}
          >
            <SvgSymbol
              sym="expand-icon"
              viewBox="0 0 32 32"
              className="mr-transition mr-fill-current mr-w-4 mr-h-4"
            />
          </button>
        </div>
        {_get(this.props, 'tagDiffs.length', 0) > 0 &&
         <TagDiffVisualization {...this.props} tagDiff={this.props.tagDiffs[0]} />
        }

        <div className="mr-mt-6 mr-mb-4">
          <p className="mr-text-lg">
            <FormattedMessage {...messages.prompt} />
          </p>

          <div className="mr-my-4 mr-grid mr-grid-columns-2 mr-grid-gap-4">
            {this.props.hasTagChanges && this.props.allowedProgressions.has(TaskStatus.fixed) &&
             <TaskFixedControl
               {...this.props}
               fixedLabel={<FormattedMessage {...messages.confirmLabel} />}
             />
            }

            {this.props.allowedProgressions.has(TaskStatus.falsePositive) &&
             <TaskFalsePositiveControl
               {...this.props}
               falsePositiveLabel={<FormattedMessage {...messages.rejectLabel} />}
             />
            }

            {this.props.allowedProgressions.has(TaskStatus.skipped) &&
              <TaskSkipControl {...this.props} />
            }

            {(this.props.allowedProgressions.has(TaskStatus.tooHard) ||
              this.props.allowedProgressions.has(TaskStatus.alreadyFixed)) &&
             <Dropdown
               className="mr-dropdown--fixed mr-w-full"
               dropdownButton={dropdown =>
                 <MoreOptionsButton toggleDropdownVisible={dropdown.toggleDropdownVisible} />
               }
               dropdownContent={dropdown => <ListMoreOptionsItems {...this.props} />}
             />
            }
          </div>
        </div>

        {this.state.showDiffModal &&
         <TagDiffModal {...this.props} onClose={() => this.setState({showDiffModal: false})} />
        }
      </div>
    )
  }
}

const MoreOptionsButton = function(props) {
  return (
    <button
      className="mr-dropdown__button mr-button mr-text-green-lighter mr-w-full"
      onClick={props.toggleDropdownVisible}
    >
      <FormattedMessage {...messages.moreOptionsLabel} />&hellip;
    </button>
  )
}

const ListMoreOptionsItems = function(props) {
  return (
    <ol className="mr-list-dropdown">
      {props.allowedProgressions.has(TaskStatus.tooHard) &&
       <li>
         <TaskTooHardControl {...props} asLink />
       </li>
      }
      {props.allowedProgressions.has(TaskStatus.alreadyFixed) &&
       <li>
         <TaskAlreadyFixedControl {...props} asLink />
       </li>
      }
    </ol>
  )
}

export default
  WithSearch(
    WithTaskTags(
      WithTaskReview(
        WithSuggestedFix(
          WithKeyboardShortcuts(
            injectIntl(SuggestedFixControls)
          )
        )
      )
    ),
    'task'
  )
