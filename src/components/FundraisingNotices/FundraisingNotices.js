import React from 'react'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import WithFundraisingNotices from '../HOCs/WithFundraisingNotices.js/WithFundraisingNotices'
import MarkdownContent from '../MarkdownContent/MarkdownContent'
import SvgSymbol from '../SvgSymbol/SvgSymbol'

const FundraisingNotices = function (props) {
  if (
    !props.remainingNotices ||
    props.remainingNotices.length === 0
  ) {
    return null
  }

  const notices = props.remainingNotices.map((notice) => (
    <li
      key={notice.uuid}
      className='mr-flex mr-justify-between mr-items-center mr-w-full mr-py-4 mr-px-4'
    >
      <span className='mr-flex mr-items-center'>
        <SvgSymbol
          sym='icon-donation'
          viewBox='0 0 40 50'
          className='mr-w-10 mr-w-10 mr-cursor-pointer mr-mx-4'
        />
        <MarkdownContent
          markdown={notice.message}
          className='mr-markdown--base'
        />
      </span>
      {props.user && props.user.isLoggedIn && (
        <SvgSymbol
          sym='close-outline-icon'
          viewBox='0 0 20 20'
          className='mr-fill-green-lighter mr-w-5 mr-w-5 mr-cursor-pointer'
          onClick={() => props.acknowledgeNotice(notice)}
        />
      )}
    </li>
  ))

  return (
    <ul className='mr-bg-gradient-b-blue-darker-blue-dark mr-text-white mr-w-full'>
      {notices}
    </ul>
  )
}

export default WithCurrentUser(WithFundraisingNotices(FundraisingNotices))
