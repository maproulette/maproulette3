import { FormattedMessage } from "react-intl";
import { WidgetDataTarget, registerWidgetType } from "../../../services/Widget/Widget";
import SupplementalMap from "../..//SupplementalMap/SupplementalMap";
import Dropdown from "../../Dropdown/Dropdown";
import MapPane from "../../EnhancedMap/MapPane/MapPane";
import QuickWidget from "../../QuickWidget/QuickWidget";
import SvgSymbol from "../../SvgSymbol/SvgSymbol";
import messages from "./Messages";

const descriptor = {
  widgetKey: "SupplementalMapWidget",
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 4,
  defaultWidth: 4,
  minHeight: 6,
  defaultHeight: 10,
  defaultConfiguration: {
    trackTaskMap: true,
  },
};

const SupplementalMapWidget = (props) => {
  const { task, workspaceContext } = props;
  const { trackTaskMap } = props.widgetConfiguration;
  const { h, w } = props.widgetLayout;

  return (
    <QuickWidget
      {...props}
      className=""
      widgetTitle={<FormattedMessage {...messages.title} />}
      noMain
      rightHeaderControls={
        <Dropdown
          className="mr-dropdown--right"
          dropdownButton={(dropdown) => (
            <button
              onClick={dropdown.toggleDropdownVisible}
              className="mr-flex mr-items-center mr-text-green-lighter"
            >
              <SvgSymbol
                sym="cog-icon"
                viewBox="0 0 20 20"
                className="mr-fill-green-lighter mr-w-4 mr-h-4"
              />
            </button>
          )}
          dropdownContent={() => (
            <ul className="mr-list-dropdown">
              <li className="mr-my-2">
                <a
                  className="mr-normal-case mr-flex"
                  onClick={() =>
                    props.updateWidgetConfiguration({
                      trackTaskMap: !trackTaskMap,
                    })
                  }
                >
                  <div className="mr-text-white mr-w-4">{trackTaskMap && "✓"}</div>
                  <FormattedMessage {...messages.trackTaskMapLabel} />
                </a>
              </li>
            </ul>
          )}
        />
      }
    >
      <MapPane {...props}>
        <SupplementalMap
          key={task.id}
          {...props}
          h={h}
          w={w}
          trackedBounds={trackTaskMap ? workspaceContext.taskMapBounds : undefined}
          trackedZoom={trackTaskMap ? workspaceContext.taskMapZoom : undefined}
          mapType="supplemental"
        />
      </MapPane>
    </QuickWidget>
  );
};

registerWidgetType(SupplementalMapWidget, descriptor);
export default SupplementalMapWidget;
