import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class Instructions extends Component {
  render() {
    return (
      <section className="mr-px-4 mr-py-12 md:mr-py-24 mr-bg-green-dark mr-text-white mr-bg-cover mr-bg-road">
        <div className="mr-max-w-3xl mr-mx-auto">
          <div className="mr-max-w-lg">
            <h2 className="md:mr-text-5xl mr-font-normal mr-text-white">
              Find Your Challenge
            </h2>
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

            <Link to="/browse/challenges" className="mr-button">
              Find Challenges
            </Link>
          </div>
        </div>
      </section>
    )
  }
}

export default Instructions
