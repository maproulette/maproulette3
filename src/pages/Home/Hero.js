import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export default class Hero extends Component {
  render() {
    return (
      <div className="md:mr-h-hero mr-bg-black mr-text-white mr-bg-cover mr-bg-center mr-bg-hero mr-flex mr-items-center mr-py-10 mr-px-4">
        <div className="mr-flex-grow mr-max-w-lg mr-mx-auto mr-text-center">
          <h1 className="mr-text-3xl mr-font-medium md:mr-text-5xl lg:mr-text-6xl lg:mr--mt-40 mr-leading-tight">
            Be an instant contributor to the world’s maps
          </h1>
          <Link to="/browse/challenges" className="mr-button mr-mt-8">
            Get Started
          </Link>
        </div>
      </div>
    )
  }
}
