import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/Resizable'
import { useManageProjectDetailContext } from './ManageProjectDetailContext'
import { ProjectChallengesPanel } from './ProjectChallengesPanel'
import { ProjectDetailDialogs } from './ProjectDetailDialogs'
import { ProjectDetailSidebar } from './ProjectDetailSidebar'

export const ManageProjectDetailContent = () => {
  const {
    projectId,
    project,
    projectData,
    isLoadingProject,
    isLoadingChallenges,
    filteredChallenges,
    challengeSummary,
    pinnedChallengeIds,
    searchQuery,
    setSearchQuery,
    onlyDiscoverable,
    setOnlyDiscoverable,
    onlyArchived,
    setOnlyArchived,
    onlyPinned,
    setOnlyPinned,
    viewMode,
    setViewMode,
    cloneModalChallenge,
    setCloneModalChallenge,
    rebuildModalChallenge,
    setRebuildModalChallenge,
    deleteChallengeId,
    setDeleteChallengeId,
    deleteProjectConfirm,
    setDeleteProjectConfirm,
    handleArchiveProject,
    handleToggleEnabled,
    confirmDeleteProject,
    confirmDeleteChallenge,
    toggleChallengePin,
    toggleChallengeEnabled,
    archiveChallenge,
    rebuildChallenge,
  } = useManageProjectDetailContext()

  return (
    <div className="h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={30} minSize={20} maxSize={45}>
          <aside className="h-full min-h-0 overflow-hidden pr-2">
            <ProjectDetailSidebar
              projectId={projectId}
              project={project}
              projectData={projectData}
              isLoadingProject={isLoadingProject}
              isLoadingChallenges={isLoadingChallenges}
              filteredChallengesCount={filteredChallenges.length}
              challengeSummary={challengeSummary}
              onArchiveProject={handleArchiveProject}
              onToggleEnabled={handleToggleEnabled}
              onDeleteProject={() => setDeleteProjectConfirm(true)}
            />
          </aside>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={70} minSize={40}>
          <ProjectChallengesPanel
            projectId={projectId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onlyDiscoverable={onlyDiscoverable}
            setOnlyDiscoverable={setOnlyDiscoverable}
            onlyArchived={onlyArchived}
            setOnlyArchived={setOnlyArchived}
            onlyPinned={onlyPinned}
            setOnlyPinned={setOnlyPinned}
            viewMode={viewMode}
            setViewMode={setViewMode}
            filteredChallenges={filteredChallenges}
            pinnedChallengeIds={pinnedChallengeIds}
            onTogglePin={toggleChallengePin}
            onToggleEnabled={toggleChallengeEnabled}
            onClone={(c) => setCloneModalChallenge(c)}
            onArchive={(id, isArchived) => archiveChallenge(id, isArchived)}
            onRebuild={(id) => rebuildChallenge(id)}
            onDelete={(id) => setDeleteChallengeId(id)}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <ProjectDetailDialogs
        projectId={projectId}
        cloneModalChallenge={cloneModalChallenge}
        setCloneModalChallenge={setCloneModalChallenge}
        rebuildModalChallenge={rebuildModalChallenge}
        setRebuildModalChallenge={setRebuildModalChallenge}
        deleteChallengeId={deleteChallengeId}
        setDeleteChallengeId={setDeleteChallengeId}
        confirmDeleteChallenge={confirmDeleteChallenge}
        deleteProjectConfirm={deleteProjectConfirm}
        setDeleteProjectConfirm={setDeleteProjectConfirm}
        confirmDeleteProject={confirmDeleteProject}
      />
    </div>
  )
}
