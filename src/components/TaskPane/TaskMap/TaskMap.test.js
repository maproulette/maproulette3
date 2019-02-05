import React from 'react'
import { TaskMap } from './TaskMap'
import { latLng } from 'leaflet'
import _cloneDeep from 'lodash/cloneDeep'

const propsFixture = {
  task: {
    id: 2,
    geometries: {
      features: null
    },
    parent: {
      defaultZoom: 2,
      minZoom: 1,
      maxZoom: 0,
    }
  },
  centerPoint: latLng(0, 0)
}

let basicProps = null

beforeEach(() => {
  basicProps = _cloneDeep(propsFixture)
  basicProps.setTaskMapBounds = jest.fn()
  basicProps.activateKeyboardShortcutGroup = jest.fn()
  basicProps.deactivateKeyboardShortcutGroup = jest.fn()
  basicProps.fetchOSMData = jest.fn()
})

test("renders with props as expected", () => {
  const wrapper = shallow(
    <TaskMap {...basicProps} />
  )

  expect(wrapper.find('.task-map').exists()).toBe(true)
  expect(wrapper.find('EnhancedMap').exists()).toBe(true)
  expect(wrapper.find('ZoomControl').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})
