import classNames from "classnames";
import _merge from "lodash/merge";
import _reverse from "lodash/reverse";
import { useEffect, useState } from "react";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { Achievement } from "../../services/User/Achievement/Achievement";
import Bungee from "../Bungee/Bungee";
import BusySpinner from "../BusySpinner/BusySpinner";
import messages from "./Messages";

// Setup badge settings for each achievement. Use dynamic imports of badge SVGs
// to avoid bloat
const badgeSettings = Object.freeze({
  [Achievement.fixedTask]: {
    id: Achievement.fixedTask,
    image: () => import("../../../images/rocket.svg"),
    overlay: null,
    title: <FormattedMessage {...messages.fixedTaskTitle} />,
    description: <FormattedMessage {...messages.fixedTaskDescription} />,
  },

  [Achievement.fixedCoopTask]: {
    id: Achievement.fixedCoopTask,
    image: () => import("../../../images/high-five.svg"),
    overlay: null,
    title: <FormattedMessage {...messages.fixedCoopTaskTitle} />,
    description: <FormattedMessage {...messages.fixedCoopTaskDescription} />,
  },

  [Achievement.challengeCompleted]: {
    id: Achievement.challengeCompleted,
    image: () => import("../../../images/mountain-flag.svg"),
    overlay: null,
    title: <FormattedMessage {...messages.challengeCompletedTitle} />,
    description: <FormattedMessage {...messages.challengeCompletedDescription} />,
  },

  [Achievement.fixedFinalTask]: {
    id: Achievement.fixedFinalTask,
    image: () => import("../../../images/unicorn.svg"),
    overlay: null,
    title: <FormattedMessage {...messages.fixedFinalTaskTitle} />,
    description: <FormattedMessage {...messages.fixedFinalTaskDescription} />,
  },

  [Achievement.mappedRoads]: {
    id: Achievement.mappedRoads,
    image: () => import("../../../images/roads.svg"),
    overlay: null,
    title: <FormattedMessage {...messages.mappedRoadsTitle} />,
    description: <FormattedMessage {...messages.mappedRoadsDescription} />,
  },

  [Achievement.mappedWater]: {
    id: Achievement.mappedWater,
    image: () => import("../../../images/water.svg"),
    overlay: null,
    title: <FormattedMessage {...messages.mappedWaterTitle} />,
    description: <FormattedMessage {...messages.mappedWaterDescription} />,
  },

  [Achievement.mappedTransit]: {
    id: Achievement.mappedTransit,
    image: () => import("../../../images/transit.svg"),
    overlay: null,
    title: <FormattedMessage {...messages.mappedTransitTitle} />,
    description: <FormattedMessage {...messages.mappedTransitDescription} />,
  },

  [Achievement.mappedLanduse]: {
    id: Achievement.mappedLanduse,
    image: () => import("../../../images/landuse.svg"),
    overlay: null,
    title: <FormattedMessage {...messages.mappedLanduseTitle} />,
    description: <FormattedMessage {...messages.mappedLanduseDescription} />,
  },

  [Achievement.mappedBuildings]: {
    id: Achievement.mappedBuildings,
    image: () => import("../../../images/buildings.svg"),
    overlay: null,
    title: <FormattedMessage {...messages.mappedBuildingsTitle} />,
    description: <FormattedMessage {...messages.mappedBuildingsDescription} />,
  },

  [Achievement.mappedPoi]: {
    id: Achievement.mappedPoi,
    image: () => import("../../../images/poi.svg"),
    overlay: null,
    title: <FormattedMessage {...messages.mappedPoiTitle} />,
    description: <FormattedMessage {...messages.mappedPoiDescription} />,
  },

  [Achievement.reviewedTask]: {
    id: Achievement.reviewedTask,
    image: () => import("../../../images/nyan-cat.svg"),
    overlay: null,
    title: <FormattedMessage {...messages.reviewedTaskTitle} />,
    description: <FormattedMessage {...messages.reviewedTaskDescription} />,
  },

  [Achievement.createdChallenge]: {
    id: Achievement.createdChallenge,
    image: () => import("../../../images/godzilla.svg"),
    overlay: null,
    title: <FormattedMessage {...messages.createdChallengeTitle} />,
    description: <FormattedMessage {...messages.createdChallengeDescription} />,
  },

  [Achievement.points100]: {
    id: Achievement.points100,
    image: () => import("../../../images/points100.svg"),
    overlay: {
      text: <FormattedNumber value={100} />,
      baseColor: "yellow",
      highlightColor: "blue-cloudburst",
      className: "mr-text-5xl",
    },
    title: <FormattedMessage {...messages.pointsTitle} values={{ points: 100 }} />,
    description: <FormattedMessage {...messages.pointsDescription} values={{ points: 100 }} />,
    small: {
      overlay: {
        className: "mr-text-base",
      },
    },
    large: {
      overlay: {
        className: "mr-text-8xl",
      },
    },
  },

  [Achievement.points500]: {
    id: Achievement.points500,
    image: () => import("../../../images/points500.svg"),
    overlay: {
      text: <FormattedNumber value={500} />,
      baseColor: "green-dark",
      highlightColor: "white",
      className: "mr-text-5xl",
    },
    title: <FormattedMessage {...messages.pointsTitle} values={{ points: 500 }} />,
    description: <FormattedMessage {...messages.pointsDescription} values={{ points: 500 }} />,
    small: {
      overlay: {
        className: "mr-text-base",
      },
    },
    large: {
      overlay: {
        className: "mr-text-8xl",
      },
    },
  },

  [Achievement.points1000]: {
    id: Achievement.points1000,
    image: () => import("../../../images/points1000.svg"),
    overlay: {
      text: <FormattedNumber value={1000} />,
      baseColor: "blue-sttropaz",
      highlightColor: "white",
      className: "mr-text-4xl",
    },
    title: <FormattedMessage {...messages.pointsTitle} values={{ points: 1000 }} />,
    description: <FormattedMessage {...messages.pointsDescription} values={{ points: 1000 }} />,
    small: {
      overlay: {
        text: <FormattedMessage {...messages.pointsK} values={{ points: 1 }} />,
        className: "mr-text-base",
      },
    },
    large: {
      overlay: {
        className: "mr-text-6xl",
      },
    },
  },

  [Achievement.points5000]: {
    id: Achievement.points5000,
    image: () => import("../../../images/points5000.svg"),
    overlay: {
      text: <FormattedNumber value={5000} />,
      baseColor: "blue-rhino",
      highlightColor: "picton-blue-light",
      className: "mr-text-4xl",
    },
    title: <FormattedMessage {...messages.pointsTitle} values={{ points: 5000 }} />,
    description: <FormattedMessage {...messages.pointsDescription} values={{ points: 5000 }} />,
    small: {
      overlay: {
        text: <FormattedMessage {...messages.pointsK} values={{ points: 5 }} />,
        className: "mr-text-base",
      },
    },
    large: {
      overlay: {
        className: "mr-text-6xl",
      },
    },
  },

  [Achievement.points10000]: {
    id: Achievement.points10000,
    image: () => import("../../../images/points10000.svg"),
    overlay: {
      text: <FormattedNumber value={10000} />,
      baseColor: "cerise",
      highlightColor: "dark-yellow",
      className: "mr-text-2xl",
    },
    title: <FormattedMessage {...messages.pointsTitle} values={{ points: 10000 }} />,
    description: <FormattedMessage {...messages.pointsDescription} values={{ points: 10000 }} />,
    small: {
      overlay: {
        text: <FormattedMessage {...messages.pointsK} values={{ points: 10 }} />,
        className: "mr-text-base",
      },
    },
    large: {
      overlay: {
        className: "mr-text-5xl",
      },
    },
  },

  [Achievement.points50000]: {
    id: Achievement.points50000,
    image: () => import("../../../images/points50000.svg"),
    overlay: {
      text: <FormattedNumber value={50000} />,
      baseColor: "yellow",
      highlightColor: "black",
      className: "mr-text-2xl",
    },
    title: <FormattedMessage {...messages.pointsTitle} values={{ points: 50000 }} />,
    description: <FormattedMessage {...messages.pointsDescription} values={{ points: 50000 }} />,
    small: {
      overlay: {
        text: <FormattedMessage {...messages.pointsK} values={{ points: 50 }} />,
        className: "mr-text-base",
      },
    },
    large: {
      overlay: {
        className: "mr-text-5xl",
      },
    },
  },

  [Achievement.points100k]: {
    id: Achievement.points100k,
    image: () => import("../../../images/points100k.svg"),
    overlay: {
      text: <FormattedMessage {...messages.pointsK} values={{ points: 100 }} />,
      baseColor: "turquoise",
      highlightColor: "blue-sttropaz",
      className: "mr-text-4xl",
    },
    title: <FormattedMessage {...messages.pointsTitle} values={{ points: 100000 }} />,
    description: <FormattedMessage {...messages.pointsDescription} values={{ points: 100000 }} />,
    small: {
      overlay: {
        className: "mr-text-sm",
      },
    },
    large: {
      overlay: {
        className: "mr-text-6xl",
      },
    },
  },

  [Achievement.points500k]: {
    id: Achievement.points500k,
    image: () => import("../../../images/points500k.svg"),
    overlay: {
      text: <FormattedMessage {...messages.pointsK} values={{ points: 500 }} />,
      baseColor: "pink-light",
      highlightColor: "blue-sttropaz",
      className: "mr-text-4xl",
    },
    title: <FormattedMessage {...messages.pointsTitle} values={{ points: 500000 }} />,
    description: <FormattedMessage {...messages.pointsDescription} values={{ points: 500000 }} />,
    small: {
      overlay: {
        className: "mr-text-sm",
      },
    },
    large: {
      overlay: {
        className: "mr-text-6xl",
      },
    },
  },

  [Achievement.points1m]: {
    id: Achievement.points1m,
    image: () => import("../../../images/points1m.svg"),
    overlay: {
      text: <FormattedMessage {...messages.pointsM} values={{ points: 1 }} />,
      baseColor: "yellow",
      highlightColor: "black",
      className: "mr-text-5xl",
    },
    title: <FormattedMessage {...messages.pointsTitle} values={{ points: 1000000 }} />,
    description: <FormattedMessage {...messages.pointsDescription} values={{ points: 1000000 }} />,
    small: {
      overlay: {
        className: "mr-text-base",
      },
    },
    large: {
      overlay: {
        className: "mr-text-8xl",
      },
    },
  },
});

const AchievementBadge = (props) => {
  const [badgeInfo, setBadgeInfo] = useState(null);
  const [badgeImage, setBadgeImage] = useState(null);
  const { achievement, size } = props;

  useEffect(() => {
    let isMounted = true;

    const merged = _merge({}, badgeSettings[achievement], badgeSettings[achievement][size]);
    if (isMounted) {
      setBadgeInfo(merged);
    }

    return () => {
      isMounted = false;
    };
  }, [achievement, size]);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (badgeInfo) {
        try {
          const image = await badgeInfo.image();
          if (isMounted) {
            setBadgeImage(image.default);
          }
        } catch (error) {
          console.error("Error loading badge image", error);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [badgeInfo]);

  if (!badgeInfo) {
    return null;
  }

  return (
    <div className="mr-relative">
      {Number.isFinite(props.stackDepth) && <BadgeStack depth={props.stackDepth} />}
      <div className={classNames("mr-flex mr-flex-col mr-items-center", props.className)}>
        <div className="mr-relative">
          {badgeImage ? (
            <img
              src={badgeImage}
              alt=""
              className={classNames({
                "mr-w-12 mr-h-12": size === "small",
                "mr-w-32 mr-h-32": size === "medium",
                "mr-w-64 mr-h-64": size === "large",
              })}
              onClick={props.onClick}
            />
          ) : (
            <div
              className={classNames("mr-flex mr-justify-center mr-items-center", {
                "mr-w-12 mr-h-12": size === "small",
                "mr-w-32 mr-h-32": size === "medium",
                "mr-w-64 mr-h-64": size === "large",
              })}
            >
              <BusySpinner />
            </div>
          )}
          {badgeInfo.overlay && !props.suppressOverlay && (
            <div
              className={classNames(
                "mr-absolute mr-top-0 mr-pointer-events-none mr-flex mr-justify-center mr-items-center",
                {
                  "mr-w-12 mr-h-12": size === "small",
                  "mr-w-32 mr-h-32": size === "medium",
                  "mr-w-64 mr-h-64": size === "large",
                },
                badgeInfo.overlay.className,
              )}
            >
              <Bungee {...badgeInfo.overlay} />
            </div>
          )}
        </div>
        {size !== "small" && (
          <div
            className={classNames("mr-text-yellow", {
              "mr-text-sm mr-mt-2": size === "medium",
              "mr-text-lg mr-mt-4": size === "large",
            })}
          >
            {badgeInfo.title}
          </div>
        )}
        {props.showDescription && badgeInfo.description && (
          <p className="mr-text-center mr-text-white mr-text-base mr-mt-4">
            {badgeInfo.description}
          </p>
        )}
      </div>
    </div>
  );
};

AchievementBadge.defaultProps = {
  size: "medium",
};

/**
 * Renders the impression of a "stack" of badges behind the primary badge
 */
const BadgeStack = (props) => {
  const [stack, setStack] = useState(null);
  const { depth } = props;

  useEffect(() => {
    const elements = [];
    for (let i = 0; i < depth; i++) {
      elements.push(
        <div
          key={i}
          className="mr-bg-grey mr-absolute mr-top-0 mr-right-0 mr-h-12 mr-w-12 mr-border-2 mr-border-grey-light mr-rounded-full"
          style={{ right: `${(i + 1) * -4}px`, top: `${i + 1}px` }}
        />,
      );
    }

    setStack(_reverse(elements));
  }, [depth]);

  return stack;
};

export default AchievementBadge;
