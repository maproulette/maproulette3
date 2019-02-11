import React, { Component } from 'react'
import SvgSymbol from '../../components/SvgSymbol/SvgSymbol'

export default class Highlights extends Component {
  render() {
    return (
      <section className="md:mr-px-4">
        <div className="mr-max-w-3xl mr-mx-auto md:mr--mt-24 mr-bg-off-white md:mr-bg-white md:mr-rounded-sm md:mr-shadow-md">
          <ul className="mr-list-highlights">
            <li>
              <SvgSymbol
                sym="illustration-map"
                viewBox="0 0 150 122"
                className="mr-w-48 mr-h-auto"
              />
              <h3 className="mr-text-green">
                Find tasks that address efforts important to you.
              </h3>
            </li>
            <li>
              <SvgSymbol
                sym="illustration-choose"
                viewBox="0 0 147 200"
                className="mr-w-40 mr-h-auto"
              />
              <h3 className="mr-text-green">
                Work at your own level, from novice to expert.
              </h3>
            </li>
            <li>
              <SvgSymbol
                sym="illustration-tasks"
                viewBox="0 0 200 171"
                className="mr-w-48 mr-h-auto"
              />
              <h3 className="mr-text-green">
                Create tasks for others to help improve map data.
              </h3>
            </li>
          </ul>
        </div>
      </section>
    )
  }
}
