import React, { Component } from 'react'
import { ReactComponent as ExpertImage } from '../../static/images/expert.svg'
import { ReactComponent as FindImage } from '../../static/images/find.svg'
import { ReactComponent as TeamsImage } from '../../static/images/teams.svg'

class Intro extends Component {
  render() {
    return (
      <section className="mr-px-4 mr-py-12 md:mr-py-24 mr-bg-space">
        <div className="mr-flex mr-justify-center">
          <div className="mr-text-center mr-w-1/2">
            <h2 className="mr-text-yellow mr-mb-12 mr-font-light md:mr-text-5xl">
              Thousands of people just like you edit OpenStreetMap every day
            </h2>

            <p className="mr-text-white mr-mb-20">
              That’s why OSM is the most up to date and complete map you can
              find anywhere, and it’s why Facebook, Snapchat and many others use
              OSM to power their own maps. If you look at the richness of
              OpenStreetMap data, you may wonder what’s left to map. That is
              where MapRoulette comes in! Just log in with your OpenStreetMap
              account, find a task that is right for you, and be an instant
              contributor to the world’s maps!
            </p>
          </div>
        </div>

        <div className="mr-flex mr-justify-center">
          <div className="mr-flex mr-justify-between mr-text-white mr-font-light mr-w-3/4">
            <div className="mr-w-52 mr-mx-4">
              <div className="mr-w-full mr-h-40">
                <ExpertImage viewBox="0 0 236 172" className="mr-w-full mr-h-full" />
              </div>
              <h3 className="mr-font-light mr-mt-4">
                Work at your own level, from novice to expert
              </h3>
            </div>

            <div className="mr-w-52 mr-mx-4">
              <div className="mr-w-full mr-h-40">
                <FindImage viewBox="0 0 277 162" className="mr-w-full mr-h-full" />
              </div>
              <h3 className="mr-font-light mr-mt-4">
                Find mapping tasks that are important to you
              </h3>
            </div>

            <div className="mr-w-52 mr-mx-4">
              <div className="mr-w-full mr-h-40 mr-relative">
                <TeamsImage viewBox="0 0 687 350" className="mr-w-full mr-h-full" />
              </div>
              <h3 className="mr-font-light mr-mt-4">
                Create tasks for others to improve OSM together
              </h3>
            </div>
          </div>
        </div>
      </section>
    )
  }
}

export default Intro
