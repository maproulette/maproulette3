import { Component } from "react";
import { injectIntl } from "react-intl";
import countryMessages from "../../components/CountrySelector/Messages";
import Leaderboard from "./Leaderboard";

export class CountryLeaderboard extends Component {
  render() {
    const countryCode = this.props.match?.params?.countryCode;
    const displayName = this.props.intl.formatMessage(countryMessages[countryCode]) || countryCode;

    return (
      <Leaderboard
        leaderboardOptions={{ onlyEnabled: true, filterCountry: true }}
        countryCode={countryCode}
        displayName={displayName}
        {...this.props}
      />
    );
  }
}

export default injectIntl(CountryLeaderboard);
