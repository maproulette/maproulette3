// Different challenge endpoints disagree on the shape of a challenge's
// `parent` field: some return the plain project id, while others (backend
// endpoints that run `ParentMixin.insertProjectJSON`, e.g. saved challenges)
// embed the full project object instead. Normalize either shape into a
// display-ready { id, name }.
export const getParentInfo = (parent: unknown) => {
  if (typeof parent === 'object' && parent !== null) {
    const parentObj = parent as { id?: number; name?: string }
    return { id: parentObj.id ?? null, name: parentObj.name || 'Unknown Project' }
  }
  if (typeof parent === 'number' || typeof parent === 'string') {
    return { id: parent, name: 'Unknown Project' }
  }
  return { id: null, name: 'Unknown Project' }
}
