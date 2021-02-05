import React, { Component, useRef } from 'react'
import { FormattedMessage } from 'react-intl'
import Carousel, { consts } from 'react-elastic-carousel'
import { Link } from 'react-router-dom'
import _map from 'lodash/map'
import { WidgetDataTarget, registerWidgetType }
       from '../../services/Widget/Widget'
import WithFeatured from '../HOCs/WithFeatured/WithFeatured'
import CardChallenge from '../CardChallenge/CardChallenge'
import CardProject from '../CardProject/CardProject'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import QuickWidget from '../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'FeaturedChallengesWidget',
  label: messages.header,
  targets: [
    WidgetDataTarget.user,
  ],
  minWidth: 4,
  defaultWidth: 6,
  minHeight: 12,
  defaultHeight: 12,
}

export default class FeaturedChallengesWidget extends Component {
  render() {
    return (
      <QuickWidget {...this.props} nomain className="">
        <div className="mr-bg-black-10 mr-absolute mr-left-0 mr-top-0 mr-rounded-tl mr-rounded-bl mr-flex mr-flex-col mr-items-center mr-p-4 mr-pt-12 mr-h-full mr-w-56">
          <h2 className="mr-text-yellow mr-text-md mr-font-normal mr-uppercase mr-text-center mr-leading-normal mr-w-2/3">
            <FormattedMessage {...messages.header} />
          </h2>
          <div className="mr-bg-globe mr-h-40 mr-w-40 mr-mt-12">
          </div>
        </div>

        <div className="mr-flex mr-h-full" style={{maxHeight: `${this.props.widgetLayout.h * 42}px`}}>
          <div className="mr-w-56 mr-min-w-52 mr-max-w-56"></div>
          <FeaturedList {...this.props} />
        </div>
      </QuickWidget>
    )
  }
}

const FeaturedList = props => {
  const carouselRef = useRef(null)

  const onNextStart = (currentItem, nextItem) => {
    if (currentItem.index === nextItem.index) {
      // we hit the last item, go to first item
      carouselRef.current.goTo(0);
    }
  }

  const projectCards = _map(props.featuredProjects.map, project =>
    <CardProject
      {...props}
      key={project.id}
      className="mr-card-project--featured mr-bg-transparent"
      project={project}
      isExpanded
      permanentlyExpanded
      startControl={
        <BrowseControl featuredItem={project} itemType="projects" />
      }
    />
  )

  const challengeCards = _map(props.featuredChallenges, challenge =>
    <CardChallenge
      {...props}
      key={challenge.id}
      className="mr-card-challenge--featured mr-bg-transparent mr-w-full"
      challenge={challenge}
      isExpanded
      permanentlyExpanded
      startControl={
        <BrowseControl featuredItem={challenge} itemType="challenges" />
      }
    />
  )

  const featuredItems = projectCards.concat(challengeCards)
  if (featuredItems.length === 0) {
    return (
      <div className="mr-text-grey-lighter">
        <FormattedMessage {...messages.nothingFeatured} />
      </div>
    )
  }

  return (
    <Carousel
      className="mr-max-h-full"
      renderArrow={ArrowControl}
      renderPagination={PaginationControl}
      ref={carouselRef}
      onNextStart={onNextStart}
    >
      {featuredItems}
    </Carousel>
  )
}

const BrowseControl = props => {
  return (
    <Link
      to={{
        pathname: `/browse/${props.itemType}/${props.featuredItem.id}`,
        state: { fromSearch: true },
      }}
      className="mr-button mr-button--small"
    >
      <FormattedMessage {...messages.browseFeaturedLabel} />
    </Link>
  )
}

const ArrowControl = ({ type, onClick }) => (
  <div className="mr-flex mr-flex-col mr-justify-center mr-items-center">
    <SvgSymbol
      sym={
        type === consts.PREV ?
        "icon-cheveron-left" :
        "icon-cheveron-right"
      }
      viewBox="0 0 20 20"
      className="mr-fill-green-lighter mr-w-8 mr-h-8 mr-cursor-pointer"
      onClick={onClick}
    />
  </div>
)

const PaginationControl = ({ pages, activePage, onClick }) => (
  <div className="mr-flex">
    {pages.map(page => (
      <SvgSymbol
        key={page}
        sym={page === activePage ? "circle-icon" : "circle-outline"}
        viewBox={page === activePage ? "0 0 20 20" : "0 0 472 472"}
        className="mr-fill-pink mr-w-4 mr-h-4 mr-mx-2 mr-cursor-pointer"
        onClick={() => onClick(page)}
      />
    ))}
  </div>
)

registerWidgetType(WithFeatured(FeaturedChallengesWidget), descriptor)
