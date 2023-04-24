import React from 'react'
import WithCurrentTask from '../AdminPane/HOCs/WithCurrentTask/WithCurrentTask'
import TaskPane from '../TaskPane/TaskPane'
import PublicTaskPane from '../TaskPane/PublicTaskPane'

function CurrentTaskPane(props) {
  const loggedIn = localStorage.getItem('isLoggedIn')
  return loggedIn ? <TaskPane {...props} /> : <PublicTaskPane {...props} />
}

export default WithCurrentTask(CurrentTaskPane)
