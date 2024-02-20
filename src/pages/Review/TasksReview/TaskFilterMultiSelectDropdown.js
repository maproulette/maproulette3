import React from 'react'
import Dropdown from '../../../components/Dropdown/Dropdown'
import classNames from 'classnames'


const TaskFilterMultiSelectDropdown = ({itemList, onChange, filter}) => {
  const multiSelectItems = 
  <div className='mr-flex mr-flex-col mr-space-y-2 mr-px-1'>
    {itemList.map(item => (
      <label key={`${item.key} - ${item.value}`}>
        <input
          type="checkbox"
          className="mr-checkbox-toggle mr-mr-2"
          id={item}
          onChange={e => onChange(item)}
          checked={true}
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
            "mr-py-2 mr-px-4 mr-border-none mr-placeholder-white-50 mr-w-full",
            "mr-text-white mr-rounded mr-bg-black-15 mr-shadow-inner"
          )}
          onClick={dropdown.toggleDropdownVisible}
        >
          <span>
            test
          </span>
            {/* <SvgSymbol
              sym="icon-cheveron-down"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-5 mr-h-5"
            /> */}
        
        </button>
      )}
      dropdownContent={dropdown => (
        {...multiSelectItems}
      )}
    />

  )
}

export default TaskFilterMultiSelectDropdown
