import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export default class Hero extends Component {
  render() {
    return (
      <div className="md:mr-h-hero mr-bg-black mr-text-white mr-bg-cover mr-bg-center mr-bg-hero mr-flex mr-items-center mr-pb-10 mr-px-4 mr-min-h-xs">
        <div className="mr-flex-grow mr-max-w-lg mr-mx-auto mr-text-center">
          <h1 className="mr-text-3xl md:mr-text-6xl mr-leading-tight mr-mb-4">
            Be an instant contributor to the world’s maps
          </h1>
          <Link to="/browse/challenges" className="mr-button md:mr-mb-12">
            Get Started
          </Link>
        </div>
      </div>
    )
  }
}
