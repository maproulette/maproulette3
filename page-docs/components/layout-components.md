# Layout Components

## ManageFormLayout (`src/components/shared/ManageFormLayout.tsx`)

A standard layout wrapper for all create/edit form pages. Provides a back link, page header with title and description, and a card container for the form content. Wraps with AuthGuard and supports loading skeleton states.

## SplitViewLayout (`src/components/shared/SplitViewLayout.tsx`)

A responsive two-panel layout. On desktop, shows left and right panels side by side. On mobile, switches to a tab interface where the user toggles between the two panels.

## DrawerPortal (`src/components/shared/DrawerPortalContext.tsx`)

A React portal system for rendering drawers into specific DOM locations. A `DrawerPortalTarget` component marks where drawers should appear, and components use the `useDrawerPortal()` hook to render into that target. Used on the Explore Challenges page to portal the TaskInfoDrawer into the left panel.
