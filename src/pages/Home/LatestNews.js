import React, { Component } from 'react'
import _take from 'lodash/take'
import CardNews from '../../components/CardNews/CardNews'
import featuredNewsImage from '../../static/images/fpo-news-image.jpg'
import featuredNewsImageAt2x from '../../static/images/fpo-news-image@2x.jpg'

const latestNews = [
  {
    featuredImage: {
      standard: featuredNewsImage,
      at2x: featuredNewsImageAt2x,
    },
    title: 'Latest MapRoulette Updates',
    date: 'January 7th, 2019',
    summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sagittis suscipit nisi, hendrerit tincidunt ligula convallis eget. Suspendisse potenti. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Etiam non nunc eget augue rutrum molestie.',
    link: '#news/slug-1',
  },
  {
    title: 'Privacy Policy Update',
    date: 'December 11th, 2018',
    summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sagittis suscipit nisi, hendrerit tincidunt ligula convallis eget. Suspendisse potenti. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Etiam non nunc eget augue rutrum molestie.',
    link: '#news/slug-2',
  },
  {
    title: 'MapRoulette V3 is Here!',
    date: 'August 8th, 2018',
    summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sagittis suscipit nisi, hendrerit tincidunt ligula convallis eget. Suspendisse potenti. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Etiam non nunc eget augue rutrum molestie.',
    link: '#news/slug-3',
  },
]

const featuredNews = latestNews.shift()

export default class LatestNews extends Component {
  render() {
    return (
      <section className="mr-px-4 mr-py-12 md:mr-py-24 mr-bg-green-dark mr-text-white mr-bg-cover mr-bg-road">
        <header className="mr-text-center mr-mb-12">
          <h2 className="mr-text-white">What’s new with MapRoulette</h2>
        </header>
        <div className="mr-max-w-3xl mr-mx-auto md:mr-grid md:mr-grid-columns-2 md:mr-grid-gap-8">
          {featuredNews && (
            <CardNews data={featuredNews} className="mr-mb-8 md:mr-mb-0" />
          )}
          <div className="mr-o-8">
            {_take(latestNews,2).map((entry, i) => {
              return <CardNews key={i} data={entry} />
            })}
          </div>
        </div>
      </section>
    )
  }
}
