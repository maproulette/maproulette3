/**
 * Generates a set of MR2 server API (v2) routes organized into a logical
 * heirarchy to abstract them a bit for the various client services. Variable
 * substitution is handled by the route-matcher package, so see its docs for
 * additional syntax and possibilities.
 *
 * @param {RouteFactory} factory - a RouteFactory instance constructed with the
 *        appropriate base URL that will be used to generate the individual
 *        routes. The appropriate API version will be set here.
 *
 * @see See [route-matcher](https://github.com/cowboy/javascript-route-matcher)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const apiRoutes = factory => {
  factory.setAPIVersion('v2')

  return {
    'projects': {
      'all': factory.get('/projects'),
      'managed': factory.get('/projects/managed'),
      'search': factory.get('/projects/find'),
    },
    'project': {
      'single': factory.get('/project/:id'),
      'challenges': factory.get('/project/:id/challenges'),
      'create': factory.post('/project'),
      'edit': factory.put('/project/:id'),
      'activity': factory.get('/data/project/activity'),
      'managers': factory.get('/user/project/:projectId'),
      'setManagerPermission': factory.put('/user/:userId/project/:projectId/:groupType'),
      'removeManager': factory.delete('/user/:userId/project/:projectId/-1'),
      'delete': factory.delete('/project/:id'),
    },
    'challenges': {
      'active': factory.get('/challenges/extendedFind'),
      'featured': factory.get('/challenges/featured'),
      'withKeywords': factory.get('/challenges/extendedFind'),
      'search': factory.get('/challenges/extendedFind'),
      'withinBounds': factory.get('/challenges/extendedFind'),
      'actions': factory.get('/data/project/summary'),
      'activity': factory.get('/data/status/activity'),
      'latestActivity': factory.get('/data/status/latestActivity'),
    },
    'challenge': {
      'single': factory.get('/challenge/:id'),
      'tasks': factory.get('/challenge/:id/tasks'),
      'clusteredTasks': factory.get('/challenge/clustered/:id'),
      'randomTask': factory.get('/challenge/:id/tasks/randomTasks', {noCache: true}),
      'previousSequentialTask': factory.get('/challenge/:challengeId/previousTask/:taskId'),
      'nextSequentialTask': factory.get('/challenge/:challengeId/nextTask/:taskId'),
      'actions': factory.get('/data/challenge/:id'),
      'activity': factory.get('/data/challenge/:id/activity'),
      'comments': factory.get('/challenge/:id/comments'),
      'create': factory.post('/challenge'),
      'edit': factory.put('/challenge/:id'),
      'move': factory.post('/challenge/:challengeId/project/:projectId'),
      'rebuild': factory.put('/challenge/:id/rebuild'),
      'removeKeywords': factory.delete('/challenge/:id/tags'),
      'delete': factory.delete('/challenge/:id'),
    },
    'virtualChallenge': {
      'single': factory.get('/virtualchallenge/:id'),
      'create': factory.post('/virtualchallenge'),
      'edit': factory.put('/virtualchallenge/:id'),
      'randomTask': factory.get('/virtualchallenge/:id/task', {noCache: true}),
      'clusteredTasks': factory.get('/virtualchallenge/clustered/:id'),
    },
    'tasks': {
      'random': factory.get('/tasks/random', {noCache: true}),
      'withinBounds': factory.get('/tasks/box/:left/:bottom/:right/:top'),
      'bulkUpdate': factory.put('/tasks'),
    },
    'task': {
      'single': factory.get('/task/:id'),
      'updateStatus': factory.put('/task/:id/:status'),
      'comments': factory.get('/task/:id/comments'),
      'addComment': factory.post('/task/:id/comment'),
      'create': factory.post('/task'),
      'edit': factory.put('/task/:id'),
    },
    'tags': {
      'all': factory.get('/tags'),
    },
    'users': {
      'single': factory.get('/user/:id'),
      'leaderboard': factory.get('/data/user/leaderboard'),
      'find': factory.get('/users/find/:username'),
    },
    'user': {
      'activity': factory.get('/data/user/activity'),
      'topChallenges': factory.get('/data/user/:userId/topChallenges'),
      'savedChallenges': factory.get('/user/:userId/saved'),
      'saveChallenge': factory.post('/user/:userId/save/:challengeId'),
      'unsaveChallenge': factory.delete('/user/:userId/unsave/:challengeId'),
      'savedTasks': factory.get('/user/:userId/savedTasks'),
      'saveTask': factory.post('/user/:userId/saveTask/:taskId'),
      'unsaveTask': factory.delete('/user/:userId/unsaveTask/:taskId'),
      'updateSettings': factory.put('/user/:userId'),
    },
  }
}

export default apiRoutes
