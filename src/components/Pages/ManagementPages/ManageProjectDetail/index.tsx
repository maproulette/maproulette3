import { ManageProjectDetailContent } from './ManageProjectDetailContent'
import { ManageProjectDetailProvider } from './ManageProjectDetailContext'

export const ManageProjectDetail = () => {
  return (
    <ManageProjectDetailProvider>
      <ManageProjectDetailContent />
    </ManageProjectDetailProvider>
  )
}
