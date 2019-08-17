import React from 'react'
import PropTypes from 'prop-types'
import External from '../External/External'
import Modal from '../Modal/Modal'
import TagDiffVisualization from './TagDiffVisualization'

/**
 * TagDiffModal renders a TagDiffVisualization in a modal for potentially
 * easier inspection by users
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const TagDiffModal = props => {
  return (
    <External>
      <Modal isActive wide onClose={props.onClose}>
        <div className="mr-overflow-y-auto mr-max-h-screen80">
          <TagDiffVisualization {...props} tagDiff={props.tagDiffs[0]} />
        </div>
      </Modal>
    </External>
  )
}

TagDiffModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  tagDiffs: PropTypes.array.isRequired,
}

export default TagDiffModal
