/**
 * AsBrowsableChallenge adds functionality to a Challenge related to browsing
 */
export class AsBrowsableChallenge {
  constructor(challenge) {
    Object.assign(this, challenge);
  }

  browseURL() {
    if (!Number.isFinite(this.id)) {
      return "/browse/challenges";
    }
    return `/browse/challenges/${this.id}`;
  }
}

export default (challenge) => new AsBrowsableChallenge(challenge);
