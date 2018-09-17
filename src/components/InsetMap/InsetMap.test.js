import React from 'react'
import InsetMap from './InsetMap'

const basicProps = {
  centerPoint: {
    lat: 0,
    lng: 0,
  },
  fixedZoom: 15,
}

test('renders an inset map at the given centerpoint and zoom', () => {
  const wrapper = shallow(
    <InsetMap {...basicProps} />
  )

  expect(wrapper.find('Map').exists()).toBe(true)
})
