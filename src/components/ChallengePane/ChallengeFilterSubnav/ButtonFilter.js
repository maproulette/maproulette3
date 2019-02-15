import React from 'react'
import classNames from 'classnames'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'

const ButtonFilter = props => (
  <span className="mr-block mr-text-left mr-font-normal">
    <span className="mr-block mr-text-left mr-mb-1 mr-text-xs mr-uppercase mr-text-white">
      {props.type}
    </span>
    <span className="mr-flex mr-items-center mr-text-green-lighter mr-cursor-pointer" onClick={props.onClick}>
      <span className={classNames(
        "mr-w-24 mr-mr-2 mr-overflow-hidden mr-whitespace-no-wrap mr-overflow-ellipsis",
        props.selectionClassName)}
      >
        {props.selection}
      </span>
      <SvgSymbol
        sym="icon-cheveron-down"
        viewBox="0 0 20 20"
        className="mr-fill-current mr-w-5 mr-h-5"
      />
    </span>
  </span>
)

export default ButtonFilter
