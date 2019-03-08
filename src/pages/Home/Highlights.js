import React, { Component } from 'react'
import SvgSymbol from '../../components/SvgSymbol/SvgSymbol'

class Highlights extends Component {
  render() {
    return (
      <section className="md:mr-px-4">
        <div className="mr-max-w-3xl mr-mx-auto md:mr--mt-24 lg:mr--mt-40 mr-bg-off-white md:mr-bg-white md:mr-rounded-sm md:mr-shadow-md">
          <ul className="mr-list-highlights">
            <li>
              <figure>
                <SvgSymbol sym="illustration-map" viewBox="0 0 150 122" />
              </figure>
              <h3>Find tasks that address efforts important to you</h3>
            </li>
            <li>
              <figure>
                <SvgSymbol sym="illustration-choose" viewBox="0 0 147 200" />
              </figure>
              <h3>Work at your own level, from novice to expert</h3>
            </li>
            <li>
              <figure>
                <SvgSymbol sym="illustration-tasks" viewBox="0 0 200 171" />
              </figure>
              <h3>Create tasks for others to help improve map data</h3>
            </li>
          </ul>
        </div>
      </section>
    )
  }
}

export default Highlights
