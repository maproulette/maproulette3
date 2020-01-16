import React, { Component } from 'react'
import _omit from 'lodash/omit'
import _clone from 'lodash/clone'
import _each from 'lodash/each'
import _pull from 'lodash/pull'
import _get from 'lodash/get'
import _keys from 'lodash/keys'
import _find from 'lodash/find'
import _startsWith from 'lodash/startsWith'

/**
 * WithConfigurableColumns keeps track of columns the user has selected to
 * show in a table.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default function(WrappedComponent, defaultAllColumns, defaultShowColumns=[], columnMessages,
                        appSettingName="adminChallengeColumns", idPath="challenge.id",
                        includeTaskPropertyKeys=true) {
  class WithConfigurableColumns extends Component {
    state = {
      availableColumns: null,   // Columns not being shown.
      addedColumns: null,       // Columns to be shown.
    }

    componentWillMount() {
      this.resetColumnChoices(defaultAllColumns, defaultShowColumns)
    }

    // This will save the column settings to the user's app settings.
    saveColumnSettings = () => {
      const settings =
        this.props.getUserAppSetting(this.props.user, appSettingName) || {}
      settings[_get(this.props, idPath)] = _keys(this.state.addedColumns)
      this.props.updateUserAppSetting(this.props.user.id,
        {[appSettingName]: settings})
    }

    // This will (re)set the availableColumns and addedColumns lists.
    // TasksReviewTable uses this to switch between tabs as the columns are
    // tab dependent.
    resetColumnChoices = (allColumns, defaultColumns) => {
      if (!allColumns || _keys(allColumns).length === 0) return
      let addedColumnsKeys = defaultColumns

      // If the added columns are in the user's settings then use those
      // otherwise use the defaultColumns.
      if (this.props.getUserAppSetting(this.props.user, appSettingName)) {
        const id = _get(this.props, idPath)
        addedColumnsKeys =
          this.props.getUserAppSetting(this.props.user, appSettingName)[id]

        if (!addedColumnsKeys || addedColumnsKeys.length === 0) {
          addedColumnsKeys = defaultColumns
        }
      }

      // Setup the availableColumns. First we add any column from the
      // allColumns that is not already in the addedColumn list.
      const availableColumns = {}
      let availableColumnsKeys = _pull(_keys(allColumns), ...addedColumnsKeys)
      _each(availableColumnsKeys, (column) => {
        availableColumns[column] = allColumns[column]
        let message = column

        // Fetch the internationalized column key labels '<<myColumn>>Label'
        if (columnMessages[`${column}Label`]) {
          message = this.props.intl.formatMessage(columnMessages[`${column}Label`])
        }

        availableColumns[column].message = message
      })

      // Next if we are including task properties as columns we need to add those
      if (includeTaskPropertyKeys && this.props.taskPropertyKeys) {
        // For all the task property keys we want to add them to the
        // availableColumns if they are not already in the addedColumns.
        // As we add them, we indicate they are a task property with a : in
        // front (this lets us treat them as strings when necessary, such as in
        // the user settings, but still lets us identify them as task properties).
        _each(this.props.taskPropertyKeys, (propKey) => {
          if (!_find(addedColumnsKeys, (k) => k === `:${propKey}`)) {
            // Task Properties get italicized to visually distinguish them
            availableColumns[`:${propKey}`] =
              {message: <span className="mr-italic">{propKey}</span>}
          }
        })
      }

      // Now we need to internalize the addedColumns as well.
      const addedColumns = {}
      _each(addedColumnsKeys, (column) => {
        addedColumns[column] = allColumns[column]
        if (columnMessages[`${column}Label`]) {
          addedColumns[column].message =
            this.props.intl.formatMessage(columnMessages[`${column}Label`])
        }
        // Task Properties get italicized
        else if (column.startsWith(":")) {
          addedColumns[column] =
            {message: <span className="mr-italic">{column.slice(1)}</span>}
        }
        else {
          // No internationalized label found for this column
          addedColumns[column] = {message: column}
        }
      })

      // Store our newly setup columns.
      this.setState({availableColumns, addedColumns})
    }

    // addColumn moves the columnKey from the availableColumns to the addedColumns
    addColumn = (columnKey) => {
      const newColumns = _clone(this.state.addedColumns)
      newColumns[columnKey] = this.state.availableColumns[columnKey]
      this.setState({availableColumns: _omit(this.state.availableColumns, columnKey),
                     addedColumns: newColumns})
    }

    removeColumn = (columnKey) => {
      // We need to remove the key from the addedColumns and insert it into the
      // availableColumns. If it's not a task property column (task properties
      // are identified by a : in front) then it should be added to the end of
      // the standard coluns but before the task property columns, like so:
      // [a, b, <<columnKey>>, :prop1, :prop2]
      // If it's another task property column we will stick it at the very end,
      // like so:
      // [a, b, :prop1, :prop2, <<:columnKey>>]

      // To do this we create a new columns mapping and copy over the existing
      // availableColumns. If we run across a column that's a task property column
      // (has a `:`) then we will insert our new columnKey first and continue copying,
      // unless it's a task property column itself and then it'll get stuck at
      // the end.
      const newColumns = {}

      // Flag to let us know if the key was added to our newColumns already while
      // we are copying over each value. At the end, if we ended up not adding
      // our key, then we will stick the columnKey on the end.
      let keyAdded = false

      _each(this.state.availableColumns, (value, key) => {
        // If our columnKey to add is not a task property column and we are
        // starting to copy over the :taskPropertyColumns in the list then
        // we insert our new columnKey first before continuing on.
        if (_startsWith(key, ':') && !_startsWith(columnKey, ':')) {
          newColumns[columnKey] = this.state.addedColumns[columnKey]
          keyAdded = true
        }
        newColumns[key] = value
      })

      // if !keyAdded then the columnKey didn't get added in the list yet, either
      // because it's a task property column itself or the list doesn't contain
      // any task properties columns. Add it now.
      if (!keyAdded) {
        newColumns[columnKey] = this.state.addedColumns[columnKey]
      }
      this.setState({availableColumns: newColumns,
                     addedColumns: _omit(this.state.addedColumns, columnKey)})
    }


    // This is for drag-and-dropping. Our library will give us an originalIndex
    // and we need to move that item to the newIndex.
    reorderAddedColumn = (originalIndex, newIndex) => {
      let index = 0

      // Fetch the item from the originalIndex
      let savedItem = null
      _each(this.state.addedColumns, (column, key) => {
        if (index === originalIndex) {
          savedItem = {key: key, column: column}
        }
        index += 1
      })

      // Insert item at new index. To do this we will run through our column
      // list and copy each one to the newColumnMap. If we run across the
      // item (at the originalIndex) we will ignore it and not add it.
      // When we get to our newIndex we will insert the item either before or
      // after the current item in the list depending on whether our
      // moving item is being moved up or down.
      const newColumnMap = {}
      index = 0
      _each(this.state.addedColumns, (column, key) => {
        if (index === newIndex) {
          // Our item is being moved up in the list.
          if (newIndex < originalIndex) {
            newColumnMap[savedItem.key] = savedItem.column
            newColumnMap[key] = column
          }
          // Our item is being moved down in the list.
          else {
            newColumnMap[key] = column
            newColumnMap[savedItem.key] = savedItem.column
          }
        }
        else if (index !== originalIndex) {
          newColumnMap[key] = column
        }
        index += 1
      })

      this.setState({addedColumns: newColumnMap})
    }

    render() {
      return <WrappedComponent
               availableColumns={this.state.availableColumns}
               addedColumns={this.state.addedColumns}
               addColumn={this.addColumn}
               removeColumn={this.removeColumn}
               saveColumnSettings={this.saveColumnSettings}
               reorderAddedColumn={this.reorderAddedColumn}
               resetColumnChoices={this.resetColumnChoices}
               {...this.props} />
    }
  }

  return WithConfigurableColumns
}
