import React, { Component } from 'react'

class Intro extends Component {
  render() {
    return (
      <section className="mr-px-4 mr-py-12 md:mr-py-24">
        <div className="mr-max-w-3xl mr-mx-auto md:mr-grid md:mr-grid-columns-12 md:mr-grid-gap-8 lg:mr-grid-gap-12">
          <div className="mr-mb-8 md:mr-mb-0 md:mr-col-span-5 mr-flex mr-items-center">
            <div className="mr-pb-12 mr-pt-6 mr-px-16 mr-bg-blue mr-text-white mr-rounded-sm mr-shadow mr-text-center">
              <div className="mr-text-yellow mr-uppercase mr-text-3xl lg:mr-text-3xl mr-text-center mr-pb-2">
                Over
              </div>
              <span className="mr-ticker mr-text-4xl lg:mr-text-5xl">
                <span>5</span>
                <span>0</span>
                <span>0</span>
                <span>0</span>
                <span>0</span>
                <span>0</span>
              </span>
              <h3 className="mr-mt-8 mr-leading-normal">
                Mapping Tasks Solved
                <br /> via MapRoulette
              </h3>
            </div>
          </div>
          <div className="mr-text-center md:mr-text-left md:mr-col-span-7">
            <h2 className="mr-text-blue-light mr-my-6 mr-font-medium">
              Thousands of people just like you edit OpenStreetMap every day
            </h2>
            <p className="md:mr-text-md mr-mb-6">
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
      </section>
    )
  }
}

export default Intro
