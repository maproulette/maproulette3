import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import videoPoster from '../../static/images/video-poster.jpg'
import videoPosterAt2x from '../../static/images/video-poster@2x.jpg'

export default class Intro extends Component {
  render() {
    return (
      <section className="mr-px-4 mr-py-12 md:mr-py-24">
        <div className="mr-max-w-3xl mr-mx-auto o-4 lg:mr-grid lg:mr-grid-columns-2 lg:mr-grid-gap-12">
          <div>
            <h2 className="mr-text-blue-light">
              Make OpenStreet Maps better,
              <br className="mr-hidden lg:mr-inline" /> one bug at a time
            </h2>
            <div className="mr-rich-text">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Curabitur sagittis suscipit nisi, hendrerit tincidunt ligula
                convallis eget. Suspendisse potenti. Vestibulum ante ipsum
                primis in faucibus orci luctus et ultrices posuere cubilia
                Curae; Etiam non nunc eget augue rutrum molestie.
              </p>
              <p>
                Pellentesque facilisis, ipsum nec vestibulum iaculis, nibh
                augue aliquet purus, nec mattis lectus diam vel ligula.
                Maecenas nec lacus hendrerit tortor mattis iaculis quis congue
                erat.
              </p>
            </div>
            <ul className="mr-list-reset mr-inline-flex">
              <li className="mr-mr-6">
                <Link to="/challenges/" className="mr-button mr-button--green">
                  Get Started
                </Link>
              </li>
              <li>
                <Link to="/learn/" className="mr-button mr-button--green">
                  Learn More
                </Link>
              </li>
            </ul>
          </div>
          <figure>
            <Link to="#modal">
              <img
                src={videoPoster}
                srcSet={`${videoPoster} 1x, ${videoPosterAt2x} 2x`}
                alt="Overview Video"
                className="mr-block mr-mx-auto mr-my-8 mr-overflow-hidden mr-rounded-sm mr-shadow"
              />
            </Link>
          </figure>
        </div>
      </section>
    )
  }
}
