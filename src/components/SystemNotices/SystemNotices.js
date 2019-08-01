import React from 'react'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import WithSystemNotices from '../HOCs/WithSystemNotices/WithSystemNotices'
import MarkdownContent from '../MarkdownContent/MarkdownContent'
import SvgSymbol from '../SvgSymbol/SvgSymbol'

const SystemNotices = function(props) {
  if (!props.newSystemNotices || props.newSystemNotices.length === 0) {
    return null
  }

  const notices = props.newSystemNotices.map(notice => (
    <li
      key={notice.uuid}
      className="mr-flex mr-justify-between mr-items-center mr-w-full mr-border-white mr-py-2 mr-bg-blue-dark mr-px-4"
    >
      <MarkdownContent markdown={notice.message} />
      <SvgSymbol
        sym="close-outline-icon"
        viewBox="0 0 20 20"
        className="mr-fill-current mr-w-4 mr-w-4 mr-cursor-pointer"
        onClick={() => props.acknowledgeNotice(notice)}
      />
    </li>
  ))

  return (
    <ul
      className="mr-text-white mr-text-base mr-w-full"
    >
      {notices}
    </ul>
  )
}

export default WithCurrentUser(WithSystemNotices(SystemNotices))
