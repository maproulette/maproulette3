import React, { Component } from 'react'

export default class Hero extends Component {
  render() {
    return (
      <div className="md:mr-h-hero mr-bg-black mr-text-white mr-bg-cover mr-bg-center mr-bg-hero mr-flex mr-items-center mr-py-10 mr-px-4">
        <div className="mr-flex-grow mr-max-w-md mr-mx-auto mr-text-center">
          <h1 className="mr-text-3xl md:mr-text-5xl mr-leading-tight mr-mb-4">
            Be an instant contributor to the world’s maps
          </h1>
          <div className="mr-rich-text mr-mb-8">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Curabitur sagittis suscipit nisi, hendrerit tincidunt ligula
              convallis eget. Suspendisse potenti. Vestibulum ante ipsum primis
              in faucibus orci luctus et ultrices posuere cubilia Curae; Etiam
              non nunc eget augue rutrum molestie.
            </p>
          </div>
          <a href="#create" className="mr-button">
            Get Started
          </a>
        </div>
      </div>
    )
  }
}
