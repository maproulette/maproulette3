import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

class DashboardWidget extends Component {
  render() {
    return (
      <section
        className={classNames(
          'mr-card-widget',
          this.props.isEditing ? 'mr-card-widget--editing' : null,
          this.props.className
        )}
      >
        {this.props.isEditing && (
          <button className="mr-card-widget__delete">Delete Widget</button>
        )}
        <header className="mr-card-widget__header">
          <div className="mr-flex mr-justify-between">
            <h2 className="mr-card-widget__title">{this.props.title}</h2>
            {this.props.actions}
          </div>
        </header>
        <div className="mr-card-widget__content">{this.props.children}</div>
      </section>
    )
  }
}

DashboardWidget.propTypes = {
  className: PropTypes.string,
  isEditing: PropTypes.bool,
  title: PropTypes.string.isRequired,
  actions: PropTypes.node,
  children: PropTypes.node.isRequired,
}

export default DashboardWidget
