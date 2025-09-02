import { Component } from "react";
import { injectIntl } from "react-intl";
import AsMappableChallenge from "../../../interactions/Challenge/AsMappableChallenge";
import AsMappingUser from "../../../interactions/User/AsMappingUser";
import messages from "./Messages";

export default function WithLayerSources(WrappedComponent) {
  class _WithLayerSources extends Component {
    render() {
      const allLayerSources = AsMappingUser(this.props.user).allLayerSources();

      const challengeBasemapLayer = AsMappableChallenge(this.props.challenge).defaultLayerSource();

      if (challengeBasemapLayer?.isDynamic) {
        challengeBasemapLayer.name = this.props.intl.formatMessage(messages.challengeDefault);
        allLayerSources.push(challengeBasemapLayer);
      }

      return <WrappedComponent layerSources={allLayerSources} {...this.props} />;
    }
  }

  return injectIntl(_WithLayerSources);
}
