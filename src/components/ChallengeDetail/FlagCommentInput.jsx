import { Component } from "react";
import classNames from "classnames";
import { FormattedMessage, injectIntl } from "react-intl";
import MarkdownContent from "../MarkdownContent/MarkdownContent";
import AutosuggestMentionTextArea from "../AutosuggestTextBox/AutosuggestMentionTextArea";
import { postChallengeComment } from "../../services/Challenge/ChallengeComments";
import messages from "./Messages";

export class FlagCommentInput extends Component {
  state = {
    showingPreview: false,
    characterCount: 0,
    value: '',
    checked: false,
    emailValue: this.props.user.settings.email || '',
    submittingFlag: false
  };

  handleSubmit = async () => {
    this.setState({ submittingFlag: true })

    if (this.state.characterCount < 100) {
      this.props.handleInputError()
    } else if (!this.state.checked) {
      this.props.handleCheckboxError()
    } else {
      const challenge = this.props.challenge
      const owner = import.meta.env.REACT_APP_GITHUB_ISSUES_API_OWNER
      const repo = import.meta.env.REACT_APP_GITHUB_ISSUES_API_REPO
      const body = `Challenge: [#${challenge.id} - ${challenge.name}](${import.meta.env.REACT_APP_URL}/browse/challenges/${challenge.id}) \n\n Reported by: [${this.props.user.osmProfile.displayName}](https://www.openstreetmap.org/user/${encodeURIComponent(this.props.user.osmProfile.displayName)})\n\n${this.state.value}`
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        body: JSON.stringify({
          title: `Reported Challenge #${challenge.id} - ${challenge.name}`,
          owner,
          repo,
          body,
          state: 'open'
        }),
        headers: {
          'Authorization': `token ${import.meta.env.REACT_APP_GITHUB_ISSUES_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (response.ok) {
        const responseBody = await response.json()
        this.props.onModalSubmit(responseBody)
        const issue_link = responseBody.html_url
        const comment = `This challenge, challenge [#${challenge.id} - ${challenge.name}](${import.meta.env.REACT_APP_URL}/browse/challenges/${challenge.id}) in project [#${challenge.parent.id} - ${challenge.parent.displayName}](${import.meta.env.REACT_APP_URL}/browse/projects/${challenge.parent.id}), has been reported by [${this.props.user.osmProfile.displayName}](${import.meta.env.REACT_APP_OSM_SERVER}/user/${encodeURIComponent(this.props.user.osmProfile.displayName)}). Please use [this GitHub issue](${issue_link}) to discuss. \n\n Report Content: \n ${this.state.value}`
        await postChallengeComment(challenge.id, comment)
        this.props.handleViewCommentsSubmit()
      }
    }

    this.setState({ submittingFlag: false })
  };

  handleChange = (val) => {
    if (val.length <= 1000) {
      this.setState({ ...this.state, value: val, characterCount: val.length });
    }
  };

  handleToggle = () => {
    this.setState({ checked: !this.state.checked })
  };

  render() {
    const maxCharacterCount = 1000
    const minCharacterCount = 100
    return (
      <div className="mr-mt-2">
        <label htmlFor="root_email" className="mr-text-white-50">
        <FormattedMessage {...messages.email} />
        </label>
        <input className="form-control mr-mb-4" type="email" id="root_email" label="Email address" placeholder="Enter your email" value={this.state.emailValue} onChange={(event) => this.setState({ emailValue: event.target.value })} />
        <div className="mr-flex mr-justify-between mr-mb-2 mr-leading-tight mr-text-xxs">
          <div className="mr-flex mr-items-center">
            <button
              className={classNames(
                "mr-pr-2 mr-mr-2 mr-border-r mr-border-green mr-uppercase mr-font-medium",
                this.state.showingPreview
                  ? "mr-text-green-lighter"
                  : "mr-text-white"
              )}
              onClick={() => this.setState({ showingPreview: false })}
            >
              <FormattedMessage {...messages.write} />
            </button>
            <button
              className={classNames(
                "mr-uppercase mr-font-medium",
                !this.state.showingPreview
                  ? "mr-text-green-lighter"
                  : "mr-text-white"
              )}
              onClick={() => this.setState({ showingPreview: true })}
            >
              <FormattedMessage {...messages.preview} />
            </button>
          </div>
          <div
            className={classNames({
              "mr-text-dark-yellow":
                this.state.characterCount < maxCharacterCount &&
                this.state.characterCount > maxCharacterCount * 0.9,
              "mr-text-red-light":
                this.state.characterCount >= maxCharacterCount || this.state.characterCount < minCharacterCount
            })}
          >
            {this.state.characterCount}/{maxCharacterCount}
          </div>
        </div>
        {this.state.showingPreview ? (
          <div
            className={
              this.props.previewClassName
                ? this.props.previewClassName
                : "mr-border-2 mr-rounded mr-border-black-15 mr-px-2 mr-min-h-8"
            }
          >
            <MarkdownContent markdown={this.state.value} />
          </div>
        ) : (
          <AutosuggestMentionTextArea
            inputClassName="mr-appearance-none mr-outline-none mr-input mr-text-white mr-placeholder-medium mr-bg-grey-lighter-10 mr-border-none mr-shadow-inner mr-p-3 mr-font-mono mr-text-sm"
            previewClassName="mr-border-2 mr-rounded mr-border-grey-lighter-10 mr-p-2 mr-max-h-48 mr-overflow-y-scroll"
            rows={4}
            cols="1"
            inputValue={this.state.value}
            onInputValueChange={this.handleChange}
            placeholder='Enter text here'
            disableResize={true}
            search={() => null}
            disableShowSuggestions
          />
        )}
        <div className="form mr-flex mr-items-baseline">
          <input
            id="review-label"
            type="checkbox"
            className="mr-mr-2"
            checked={this.state.checked}
            onChange={this.handleToggle}
          />
          <label htmlFor="review-label" className="mr-text-white-50">
            <FormattedMessage {...messages.review} />
          </label>
        </div>
        {this.props.displayInputError &&
          <div className="mr-text-red">
            <FormattedMessage {...messages.textInputError} />
          </div>}
        {this.props.displayCheckboxError &&
          <div className="mr-text-red">
            <FormattedMessage {...messages.checkboxError} />
          </div>}
        <div className="mr-flex mr-items-center mr-mt-6">
          <button
            className="mr-button mr-button--white mr-mr-12 mr-px-8"
            onClick={this.handleSubmit}
            disabled={this.state.submittingFlag}
          >
            <FormattedMessage {...messages.submitReport} />
          </button>
        </div>
      </div>
    );
  }
}

export default injectIntl(FlagCommentInput);
