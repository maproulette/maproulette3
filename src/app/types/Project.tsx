export interface Grantee {
  granteeType: number;
  granteeId: number;
}

export interface GrantTarget {
  objectType: number;
  objectId: number;
}

export interface ProjectGrant {
  id: number;
  name: string;
  grantee: Grantee;
  role: number;
  target: GrantTarget;
}

export interface Project {
  id: number;
  owner: number;
  name: string;
  created: string;
  modified: string;
  description: string;
  grants: ProjectGrant[];
  enabled: boolean;
  displayName: string;
  deleted: boolean;
  isVirtual: boolean;
  featured: boolean;
  isArchived: boolean;
  requireConfirmation: boolean;
}
