# Auth Guards

## AuthGuard (`src/components/shared/AuthGuard.tsx`)

Wraps protected content. Renders children if the user is authenticated, otherwise shows the SignIn component (or a custom fallback). Used on the Dashboard, settings, and all management pages.

## SuperAdminGuard (`src/components/shared/SuperAdminGuard.tsx`)

Wraps admin-only content. Checks for super admin role (`grant.role === -1`) and shows an access denied message if unauthorized. Also exports an `isSuperUser()` helper. Used on all super admin pages and for conditional features on management pages.
