import _map from "lodash/map";
import { Role, messagesByRole, mostPrivilegedRole, rolesImply } from "../../services/Grant/Role";
import { TeamStatus, messagesByTeamStatus } from "../../services/Team/Status";

/**
 * Provides methods specific to team membership and management with regard to
 * the wrapped team user
 */
export class AsTeamMember {
  constructor(teamUser) {
    Object.assign(this, teamUser);
  }

  /**
   * Returns true if the user represented by this team member matches the given
   * user
   */
  isUser(user) {
    return this.userId === user.id;
  }

  /**
   * Returns the user's highest-privileged role on the team
   */
  highestRole() {
    const roles = _map(this.teamGrants, "role");
    return roles.length > 0 ? mostPrivilegedRole(roles) : null;
  }

  /**
   * Returns an internationalized Message object describing the member's role
   * on the team. For active team members, the message will describe the
   * member's most privileged role on the team; for merely invited members, the
   * message simply indicates they've been invited to join the team
   */
  roleDescription() {
    if (this.isInvited()) {
      return messagesByTeamStatus[TeamStatus.invited];
    }

    const role = this.highestRole();
    if (!role) {
      // This shouldn't really happen, but just in case
      return messagesByTeamStatus[TeamStatus.member];
    }

    return messagesByRole[role];
  }

  /**
   * Returns true if this team member is admin of their team, false if not
   */
  isTeamAdmin() {
    return this.isActive() && rolesImply(Role.admin, _map(this.teamGrants, "role"));
  }

  isActive() {
    return this.status === TeamStatus.member;
  }

  isInvited() {
    return this.status === TeamStatus.invited;
  }
}

export default (teamUserMember) => new AsTeamMember(teamUserMember);
