import React from 'react'
import Dropdown from '../../../components/Dropdown/Dropdown'
import classNames from 'classnames'
import SvgSymbol from '../../../components/SvgSymbol/SvgSymbol'

const TaskFilterMultiSelectDropdown = ({itemList, onChange, filterState}) => {
  const multiSelectItems = 
  <div className='mr-flex mr-flex-col mr-space-y-2 mr-px-1'>
    {itemList.map(item => (
      <label key={`${item.key} - ${item.value}`}>
        <input
          type="checkbox"
          className="mr-checkbox-toggle mr-mr-2"
          id={item}
          onChange={e => onChange(item)}
          checked={filterState.includes(item.value)}
          readOnly
          value={item.value}
        />
        {item.key}
      </label>
    ))}
  </div>


  return (
    <Dropdown
      className="mr-w-full mr-dropdown--flush"
      placement="bottom-start"
      dropdownButton={dropdown => (
        <button
          className={classNames(
            "mr-p-2 mr-border-none mr-placeholder-white-50 mr-w-full mr-flex mr-justify-end",
            "mr-text-white mr-rounded mr-bg-black-15 mr-shadow-inner"
          )}
          onClick={dropdown.toggleDropdownVisible}
        >
            <SvgSymbol
              sym="icon-cheveron-down"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-4 mr-h-4"
            />
        
        </button>
      )}
      dropdownContent={dropdown => (
        {...multiSelectItems}
      )}
    />

  )
}

export default TaskFilterMultiSelectDropdown
