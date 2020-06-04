import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class Instructions extends Component {
  render() {
    return (
      <section className="mr-bg-gradient-b-blue-darker-blue-dark mr-relative">
        <div className="mr-flex mr-px-4 mr-py-12 md:mr-py-24 mr-text-white mr-relative mr-z-5">
          <div className="mr-w-1/2 mr-flex mr-justify-center mr-mt-8">
            <h2 className="md:mr-text-6xl mr-text-yellow mr-font-light">Find your Challenge</h2>
          </div>
          <div className="mr-w-1/2 mr-pr-8">
            <p className="md:mr-text-md mr-my-6">
              MapRoulette has dozens of mapping Challenges that are created by
              experienced mappers. Each Challenge is about improving OSM in one
              very specific way. Do you want to add pedestrian crossings? Fix
              bridges? Add opening times for shops? There’s a challenge for it.
              Each challenge has many tasks, perhaps even thousands.
            </p>

            <p className="md:mr-text-md mr-mb-8">
              Do as few or as many as you want. If a challenge is too easy or
              too hard for you, just jump into something else, knowing that
              every time you click ‘I fixed it!’, you have made a meaningful
              contribution to the world’s maps.
            </p>

            <Link to="/browse/challenges" className="mr-button mr-mt-8 mr-w-2/3">
              Find Challenges
            </Link>
          </div>
        </div>
        <div className="mr-bg-skyline mr-bg-repeat-x mr-w-full mr-h-half mr-absolute mr-bottom-0 mr-z-0"></div>
      </section>
    )
  }
}

export default Instructions
