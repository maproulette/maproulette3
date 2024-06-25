import React, {useState} from 'react'
import SvgSymbol from '../SvgSymbol/SvgSymbol'

function SavedTaskPropertyFilterListEntry({applyButton, children}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div>
      <div className='mr-flex mr-space-x-1 mr-items-center'>
        {applyButton}
        <button onClick={() => setIsExpanded(prev => !prev)}>
          <SvgSymbol 
            sym='icon-cheveron-right' 
            viewBox="0 0 20 20"
            className={`mr-fill-current hover:mr-fill-green-light mr-w-5 mr-h-5 ${isExpanded ? 'mr-rotate-90' : ''}`} 
          />
        </button>
          
      </div>
      { isExpanded && 
        <div className='mr-bg-blue-firefly-75 mr-p-2'>
          {children}
        </div>
      }
    </div>
  )
}

export default SavedTaskPropertyFilterListEntry