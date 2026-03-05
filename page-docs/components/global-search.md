# Global Search

**Source**: `src/components/AppLayout/Header/GlobalSearch/`

A search modal accessible from the header that lets users quickly find any entity in MapRoulette. Triggered by clicking the search input in the navbar or pressing `Cmd+K` / `Ctrl+K`.

## Search Types

Users can type freely for a unified search, or prefix their query to target a specific entity type:

| Prefix | Searches |
|--------|----------|
| `c:` | Challenges |
| `t:` | Tasks |
| `p:` | Projects |
| `id:` | MapRoulette ID (direct lookup) |
| `f:` | Features by name |
| `tc:` | Task comments |
| `cc:` | Challenge comments |

Without a prefix, the unified search shows top results across projects and challenges.

## Result Views

Each search type has its own result component:

- **Challenges** (`FindChallenge`) — Up to 5 results with "Load More", shows featured challenges when no query
- **Tasks** (`FindTask`) — Single task result with status badge
- **Projects** (`FindProject`) — Up to 5 featured or search results
- **By ID** (`FindById`) — Shows matching project, challenge, and/or task for a numeric ID
- **Features** (`FindFeatureByName`) — Projects, challenges, and tasks in separate sections
- **Comments** (`FindComments`) — Recent or matching comments with author and context
- **Unified** (`UnifiedSearchList`) — Top 2 projects and 2 challenges plus search type filters

## Behavior

- 300ms debounce on search input
- Keyboard navigation with arrow keys and Enter
- Click outside or `Escape` to close
- Selecting a result navigates to that entity's page

## Future

### Smarter Search Type Suggestions

Improve the reasoning for suggesting search types based on the user's query. For example, detect numeric input and suggest ID lookup, recognize common patterns like "fix" or "false positive" to suggest task/comment searches, and surface recently used search types higher in the suggestion list.
