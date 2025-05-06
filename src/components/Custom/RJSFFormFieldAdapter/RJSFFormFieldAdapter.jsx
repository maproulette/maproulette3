import OriginalCheckboxWidget from "@rjsf/core/lib/components/widgets/CheckboxWidget";
import OriginalSelectWidget from "@rjsf/core/lib/components/widgets/SelectWidget";
import OriginalTextWidget from "@rjsf/core/lib/components/widgets/TextWidget";
import classNames from "classnames";
import _isEmpty from "lodash/isEmpty";
import _isObject from "lodash/isObject";
import _isString from "lodash/isString";
import _map from "lodash/map";
import _trim from "lodash/trim";
import React, { Fragment, useState, useEffect } from "react";
import Dropzone from "react-dropzone";
import { FormattedMessage } from "react-intl";
import TagsInput from "react-tagsinput";
import Dropdown from "../../Dropdown/Dropdown";
import MarkdownContent from "../../MarkdownContent/MarkdownContent";
import SvgSymbol from "../../SvgSymbol/SvgSymbol";
import CustomPriorityBoundsField from "./CustomPriorityBoundsField";
import messages from "./Messages";
import "react-tagsinput/react-tagsinput.css";
import "./RJSFFormFieldAdapter.scss";
import L from "leaflet";
import { AttributionControl, MapContainer, ScaleControl, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-lasso/dist/leaflet-lasso.esm";

const BoundsSelector = ({ selectedPolygons, setSelectedPolygons }) => {
  const map = useMap();
  const [selecting, setSelecting] = useState(false);
  const [featureGroup, setFeatureGroup] = useState(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [lassoInstance, setLassoInstance] = useState(null);

  // Initialize feature group and restore polygons
  useEffect(() => {
    if (map) {
      const fg = L.featureGroup().addTo(map);
      setFeatureGroup(fg);

      // Restore existing polygons
      if (selectedPolygons && selectedPolygons.length > 0) {
        selectedPolygons.forEach((polygon) => {
          const restoredPolygon = L.polygon(polygon.getLatLngs(), {
            color: "#3388ff",
            weight: 2,
            fillOpacity: 0.2,
          });

          // Add event listeners for hover effects
          restoredPolygon.on("mouseover", () => handlePolygonHover(restoredPolygon));
          restoredPolygon.on("mouseout", () => handlePolygonHoverOut(restoredPolygon));
          restoredPolygon.on("click", () => handlePolygonClick(restoredPolygon));

          fg.addLayer(restoredPolygon);
        });

        // Fit map to bounds of all polygons
        if (selectedPolygons.length > 0) {
          const bounds = L.latLngBounds(selectedPolygons.map((p) => p.getBounds()));
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }

      return () => {
        if (map.hasLayer(fg)) {
          fg.remove();
        }
      };
    }
  }, [map]);

  // Handle polygon click
  const handlePolygonClick = (polygon) => {
    setSelectedPolygon(polygon);
    setShowModal(true);
  };

  // Handle polygon hover
  const handlePolygonHover = (polygon) => {
    if (!selecting) {
      polygon.setStyle({ color: "red", weight: 3 });
    }
  };

  // Handle polygon hover out
  const handlePolygonHoverOut = (polygon) => {
    if (!selecting) {
      polygon.setStyle({ color: "#3388ff", weight: 2 });
    }
  };

  // Handle polygon removal
  const handleRemovePolygon = () => {
    if (selectedPolygon && featureGroup) {
      featureGroup.removeLayer(selectedPolygon);
      const updatedPolygons = selectedPolygons.filter((p) => p !== selectedPolygon);
      setSelectedPolygons(updatedPolygons);
      setShowModal(false);
      setSelectedPolygon(null);
    }
  };

  // Handle lasso selection
  const handleLassoSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setSelecting(true);
    if (map) {
      // Clean up previous lasso instance if it exists
      if (lassoInstance) {
        lassoInstance.disable();
        map.off("lasso.finished");
      }

      const newLassoInstance = L.lasso(map, {});
      newLassoInstance.enable();
      setLassoInstance(newLassoInstance);

      // Set up lasso finished event handler
      const handleLassoFinished = (e) => {
        const latlngs = e.latLngs;
        if (latlngs && latlngs.length > 0) {
          // Convert latlngs to array of [lat, lng] coordinates
          const coordinates = latlngs.map((latlng) => [latlng.lat, latlng.lng]);

          // Ensure the polygon is closed by adding the first point at the end if needed
          if (
            coordinates.length > 0 &&
            (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
              coordinates[0][1] !== coordinates[coordinates.length - 1][1])
          ) {
            coordinates.push([...coordinates[0]]);
          }

          const polygon = L.polygon(coordinates, {
            color: "#3388ff",
            weight: 2,
            fillOpacity: 0.2,
          });

          // Store the original coordinates in the polygon object for later use
          polygon.originalCoordinates = coordinates;

          // Add event listeners for hover effects
          polygon.on("mouseover", () => handlePolygonHover(polygon));
          polygon.on("mouseout", () => handlePolygonHoverOut(polygon));
          polygon.on("click", () => handlePolygonClick(polygon));

          if (featureGroup) {
            featureGroup.addLayer(polygon);
            setSelectedPolygons([...selectedPolygons, polygon]);
          }
        }
        setSelecting(false);
        newLassoInstance.disable();
      };

      map.on("lasso.finished", handleLassoFinished);
    }
  };

  // Clean up lasso instance when component unmounts
  useEffect(() => {
    return () => {
      if (map) {
        map.off("lasso.finished");
        if (lassoInstance && lassoInstance.disable) {
          lassoInstance.disable();
        }
      }
    };
  }, [map]);

  return (
    <>
      <div
        className="mr-absolute mr-top-2 mr-right-2 mr-z-[1000] mr-bg-black-50 mr-rounded mr-p-2"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="mr-flex mr-flex-col mr-gap-2">
          <button
            onClick={handleLassoSelection}
            className={`mr-p-2 mr-rounded mr-bg-white hover:mr-bg-green-lighter ${
              selecting ? "mr-bg-green-lighter" : ""
            }`}
            title={selecting ? "Cancel Lasso" : "Lasso Select"}
          >
            <SvgSymbol sym="lasso-add-icon" viewBox="0 0 512 512" className="mr-w-5 mr-h-5" />
          </button>
        </div>
      </div>

      {showModal && (
        <div className="mr-fixed mr-inset-0 mr-bg-black-50 mr-z-[2000] mr-flex mr-items-center mr-justify-center">
          <div className="mr-bg-white mr-rounded mr-p-6 mr-shadow-lg">
            <h3 className="mr-text-lg mr-font-medium mr-mb-4">Polygon Options</h3>
            <div className="mr-flex mr-justify-end mr-gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="mr-button mr-button--small mr-button--white"
              >
                Cancel
              </button>
              <button
                onClick={handleRemovePolygon}
                className="mr-button mr-button--small mr-button--danger"
              >
                Remove Polygon
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const BoundsMap = ({ selectedPolygons, setSelectedPolygons }) => {
  return (
    <div className="mr-relative" onClick={(e) => e.stopPropagation()}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "400px", width: "100%" }}
        attributionControl={false}
        minZoom={2}
        maxZoom={18}
        maxBounds={[
          [-85, -180],
          [85, 180],
        ]}
        zoomControl={false}
        onClick={(e) => e.stopPropagation()}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <AttributionControl position="bottomleft" prefix={false} />
        <ScaleControl className="mr-z-10" position="bottomleft" />

        <BoundsSelector
          selectedPolygons={selectedPolygons}
          setSelectedPolygons={setSelectedPolygons}
        />
      </MapContainer>
      <div className="mr-absolute mr-bottom-2 mr-left-2 mr-z-[1000] mr-bg-black-50 mr-rounded mr-p-2 mr-text-white mr-text-xs">
        Use the lasso tool to draw priority bounds
      </div>
    </div>
  );
};

/**
 * fieldset tags can't be styled using flexbox or grid in Chrome, so this
 * template attempts to render the fields the same way as the default but using
 * a div with class "fieldset" instead of a fieldset. To use it, set
 * `ObjectFieldTemplate={NoFieldsetObjectFieldTemplate}` in your Form
 *
 * > CAUTION: Support for expandable fields that would normally be rendered
 * > with an Add button has been removed, but it could be added back with a
 * > little work
 *
 * See: https://github.com/mozilla-services/react-jsonschema-form/issues/762
 */
export const NoFieldsetObjectFieldTemplate = function (props) {
  const { TitleField, DescriptionField } = props;
  return (
    <div className="fieldset" id={props.idSchema.$id}>
      {(props.uiSchema["ui:title"] || props.title) && (
        <TitleField
          id={`${props.idSchema.$id}__title`}
          title={props.title || props.uiSchema["ui:title"]}
          required={props.required}
          formContext={props.formContext}
        />
      )}
      {props.description && (
        <DescriptionField
          id={`${props.idSchema.$id}__description`}
          description={props.description}
          formContext={props.formContext}
        />
      )}
      {props.properties.map((prop) => prop.content)}
    </div>
  );
};

export const PriorityBoundsFieldAdapter = (props) => {
  // Get the priority level from the schema title
  const getPriorityLevel = () => {
    if (!props.schema || !props.schema.title) return null;

    const title = props.schema.title.toLowerCase();
    if (title.includes("high priority")) return "high";
    if (title.includes("medium priority")) return "medium";
    if (title.includes("low priority")) return "low";
    return null;
  };

  const priorityLevel = getPriorityLevel();
  const [showMap, setShowMap] = useState(true);

  // Determine if this is a bounds field
  const isBoundsField = () => {
    if (!props.schema || !props.schema.items) return false;
    if (props.schema.items.$ref === "#/definitions/priorityBounds") return true;
    return props.schema.items.properties?.type?.enum?.[0] === "Feature";
  };

  // Determine if this is a rules field
  const isRulesField = () => {
    if (!props.schema || !props.schema.items) return false;
    return props.schema.items.$ref === "#/definitions/tagRule";
  };

  const toggleMap = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMap(!showMap);
  };

  const addLabel = props.uiSchema["ui:addLabel"] || (
    <FormattedMessage {...messages.addPriorityRuleLabel} />
  );
  const addBoundsLabel = props.uiSchema["ui:addBoundsLabel"] || (
    <FormattedMessage {...messages.addBoundsLabel} />
  );

  const isRules = isRulesField();
  const isBounds = isBoundsField();

  const handleBoundsChange = (newData) => {
    // Force a new array to ensure React detects the change
    const cleanData = newData ? [...newData] : [];

    if (typeof props.onChange === "function") {
      props.onChange(cleanData);
    }
  };

  return (
    <div className="array-field" onClick={(e) => e.stopPropagation()}>
      {/* Show title and buttons in a row */}
      <div className="mr-flex mr-justify-between mr-items-center">
        {/* Title */}
        <label className={`mr-text-yellow ${isRules ? "mr-text-lg mr-font-bold" : "mr-text-base"}`}>
          {isRules
            ? props.title
            : `${
                priorityLevel?.charAt(0).toUpperCase() + priorityLevel?.slice(1) || ""
              } Priority Bounds`}
        </label>

        {/* Buttons */}
        {props.canAdd && (
          <div className="mr-flex mr-gap-2">
            {isRules && (
              <button className="mr-button mr-button--small" onClick={props.onAddClick}>
                {addLabel}
              </button>
            )}
            {isBounds && (
              <button
                className={`mr-button mr-button--green-lighter mr-button--small ${
                  showMap ? "mr-bg-green-lighter mr-text-black" : ""
                } mr-flex mr-items-center mr-gap-1`}
                onClick={toggleMap}
              >
                <SvgSymbol
                  sym="globe-icon"
                  viewBox="0 0 20 20"
                  className="mr-fill-current mr-w-5 mr-h-5"
                />
                {addBoundsLabel}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Show the fields */}
      {showMap && (
        <CustomPriorityBoundsField formData={props.formData} onChange={handleBoundsChange} />
      )}
    </div>
  );
};

export const CustomArrayFieldTemplate = (props) => {
  // Get the priority level from the schema title
  const getPriorityLevel = () => {
    if (!props.schema || !props.schema.title) return null;

    const title = props.schema.title.toLowerCase();
    if (title.includes("high priority")) return "high";
    if (title.includes("medium priority")) return "medium";
    if (title.includes("low priority")) return "low";
    return null;
  };

  const priorityLevel = getPriorityLevel();
  const [showMap, setShowMap] = useState(true);

  // Determine if this is a bounds field
  const isBoundsField = () => {
    if (!props.schema || !props.schema.items) return false;
    if (props.schema.items.$ref === "#/definitions/priorityBounds") return true;
    return props.schema.items.properties?.type?.enum?.[0] === "Feature";
  };

  // Determine if this is a rules field
  const isRulesField = () => {
    if (!props.schema || !props.schema.items) return false;
    return props.schema.items.$ref === "#/definitions/tagRule";
  };

  const itemFields = _map(props.items, (element) => (
    <div
      key={element.index}
      className={classNames("array-field__item", props.uiSchema?.items?.classNames)}
    >
      <div className={classNames({ inline: props.uiSchema?.items?.["ui:options"]?.inline })}>
        {element.children}
        {element.hasRemove && (
          <button
            className={classNames(
              "is-clear array-field__item__control remove-item-button",
              !props.uiSchema?.["ui:deleteLabel"]
                ? "button"
                : "mr-button mr-button mr-button--small",
            )}
            onClick={element.onDropIndexClick(element.index)}
          >
            {props.uiSchema?.["ui:deleteLabel"] || (
              <span className="icon is-danger">
                <SvgSymbol sym="trash-icon" viewBox="0 0 20 20" className="mr-w-5 mr-h-5" />
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  ));

  const toggleMap = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMap(!showMap);
  };

  const addLabel = props.uiSchema["ui:addLabel"] || (
    <FormattedMessage {...messages.addPriorityRuleLabel} />
  );
  const addBoundsLabel = props.uiSchema["ui:addBoundsLabel"] || (
    <FormattedMessage {...messages.addBoundsLabel} />
  );

  const isRules = isRulesField();
  const isBounds = isBoundsField();

  const handleBoundsChange = (newData) => {
    // Force a new array to ensure React detects the change
    const cleanData = newData ? [...newData] : [];

    if (typeof props.onChange === "function") {
      props.onChange(cleanData);
    }
  };

  return (
    <div className="array-field" onClick={(e) => e.stopPropagation()}>
      {/* Show title and buttons in a row */}
      <div className="mr-flex mr-justify-between mr-items-center">
        {/* Title */}
        <label className={`mr-text-yellow ${isRules ? "mr-text-lg mr-font-bold" : "mr-text-base"}`}>
          {isRules
            ? props.title
            : `${
                priorityLevel?.charAt(0).toUpperCase() + priorityLevel?.slice(1) || ""
              } Priority Bounds`}
        </label>

        {/* Buttons */}
        {props.canAdd && (
          <div className="mr-flex mr-gap-2">
            {isRules && (
              <button className="mr-button mr-button--small" onClick={props.onAddClick}>
                {addLabel}
              </button>
            )}
            {isBounds && (
              <button
                className={`mr-button mr-button--green-lighter mr-button--small ${
                  showMap ? "mr-bg-green-lighter mr-text-black" : ""
                } mr-flex mr-items-center mr-gap-1`}
                onClick={toggleMap}
              >
                <SvgSymbol
                  sym="globe-icon"
                  viewBox="0 0 20 20"
                  className="mr-fill-current mr-w-5 mr-h-5"
                />
                {addBoundsLabel}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Show the fields */}
      <div className="mr-ml-4">
        {itemFields}
        {showMap && isBounds && (
          <div className="mr-mt-2">
            <h4 className="mr-text-yellow mr-text-base mr-mb-2 mr-pl-2">
              Draw Priority Bounds using Lasso Tool
            </h4>
            <CustomPriorityBoundsField formData={props.formData} onChange={handleBoundsChange} />
          </div>
        )}
      </div>
    </div>
  );
};

export const CustomFieldTemplate = function (props) {
  const { classNames, children, description, uiSchema, errors } = props;
  const isCollapsed = uiSchema?.["ui:collapsed"] ?? false;
  return (
    <div className={classNames}>
      {uiSchema?.["ui:groupHeader"] && (
        <div className="mr-flex mr-justify-end mr-text-teal mr-text-lg mr-pt-4 mr-my-4 mr-border-t mr-border-teal-40">
          <span>{uiSchema["ui:groupHeader"]}</span>
          {uiSchema?.["ui:toggleCollapsed"] && (
            <button type="button" onClick={() => uiSchema["ui:toggleCollapsed"]()}>
              <SvgSymbol
                sym={isCollapsed ? "icon-cheveron-right" : "icon-cheveron-down"}
                viewBox="0 0 20 20"
                className="mr-fill-green-lighter mr-w-6 mr-h-6 mr-ml-2"
              />
            </button>
          )}
        </div>
      )}
      {uiSchema?.["ui:fieldGroupHeader"] && uiSchema["ui:toggleCollapsed"] && (
        <div
          className="mr-flex mr-text-mango mr-uppercase mr-text-md mr-mb-2 mr-cursor-pointer"
          onClick={() => uiSchema["ui:toggleCollapsed"]()}
        >
          <span>{uiSchema["ui:fieldGroupHeader"]}</span>
          <SvgSymbol
            sym={isCollapsed ? "icon-cheveron-right" : "icon-cheveron-down"}
            viewBox="0 0 20 20"
            className="mr-fill-green-lighter mr-w-6 mr-h-6 mr-ml-2"
          />
        </div>
      )}
      {!isCollapsed && (
        <Fragment>
          <LabelWithHelp {...props} />
          {children}
          {errors}
          {description}
        </Fragment>
      )}
    </div>
  );
};

export const CustomNotificationFieldTemplate = function (props) {
  const { classNames, children, description, errors } = props;
  return (
    <div className={classNames}>
      <Fragment>
        <LabelWithHelp {...props} control />
        {children}
        {errors}
        {description}
      </Fragment>
    </div>
  );
};

/**
 * A custom select widget with the new-ui styling
 */
export const CustomSelectWidget = function (props) {
  return (
    <div className={classNames("form-select", props.className)}>
      <OriginalSelectWidget {...props} />
      <div className="mr-pointer-events-none mr-absolute mr-inset-y-0 mr-right-0 mr-flex mr-items-center mr-px-2 mr-text-grey">
        <SvgSymbol
          sym="icon-cheveron-down"
          viewBox="0 0 20 20"
          className="mr-fill-current mr-w-4 mr-h-4"
        />
      </div>
    </div>
  );
};

export const CustomCheckboxField = function (props) {
  return (
    <div className="mr-space-y-4">
      <p className="mr-text-mango mr-text-md mr-uppercase">
        {props.schema.title}
        {props.required && <span className="mr-text-red-light mr-ml-1">*</span>}
      </p>
      <div className="mr-bg-blue-firefly-75 mr-pt-4 mr-px-4 mr-pb-6 mr-rounded">
        <MarkdownContent markdown={props.schema.agreementDescription} lightMode={false} />
        <div className="mr-items-center mr-flex mr-space-x-2">
          <OriginalCheckboxWidget {...props} label="" />
          <p className="mr-text-mango mr-text-sm">
            <FormattedMessage {...props.schema.checkboxLabel} />
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * A custom text widget with the new-ui styling
 */
export const CustomTextWidget = function (props) {
  const ButtonAction = props.formContext.buttonAction;

  return (
    <div>
      <OriginalTextWidget {...props} />
      {props.schema.withButton && (
        <ButtonAction
          buttonName={props.schema.withButton}
          onChange={props.onChange}
          value={props.value}
          {...props.formContext}
        />
      )}
    </div>
  );
};

export const ColumnRadioField = function (props) {
  return (
    <Fragment>
      <LabelWithHelp {...props} />
      {props.schema.enum.map((option, index) => (
        <div key={option} className="mr-flex mr-items-center mr-my-2">
          <input
            id={props.schema.enumNames ? props.schema.enumNames[index] : props.schema.enum[index]}
            type="radio"
            name={props.name}
            value={option}
            checked={props.formData === option}
            className="mr-radio mr-mr-2"
            onChange={() => props.onChange(option)}
          />
          <label
            htmlFor={
              props.schema.enumNames ? props.schema.enumNames[index] : props.schema.enum[index]
            }
            onClick={() => props.onChange(option)}
          >
            <MarkdownContent
              compact
              markdown={
                props.schema.enumNames ? props.schema.enumNames[index] : props.schema.enum[index]
              }
            />
          </label>
        </div>
      ))}
    </Fragment>
  );
};

/**
 * MarkdownEditField renders a textarea and markdown preview side-by-side.
 */
export const MarkdownEditField = (props) => {
  const [showingPreview, setShowingPreview] = useState(false);
  const [formValues, setFormValues] = useState({});

  return (
    <Fragment>
      <LabelWithHelp {...props} />
      <div className="mr-flex mr-items-center mr-mb-2 mr-leading-tight mr-text-xxs">
        <button
          type="button"
          className={classNames(
            "mr-pr-2 mr-mr-2 mr-border-r mr-border-green mr-uppercase mr-font-medium",
            showingPreview ? "mr-text-green-lighter" : "mr-text-white",
          )}
          onClick={() => setShowingPreview(false)}
        >
          <FormattedMessage {...messages.writeLabel} />
        </button>
        <button
          type="button"
          className={classNames(
            "mr-uppercase mr-font-medium",
            !showingPreview ? "mr-text-green-lighter" : "mr-text-white",
          )}
          onClick={() => setShowingPreview(true)}
        >
          <FormattedMessage {...messages.previewLabel} />
        </button>
      </div>

      {showingPreview ? (
        <Fragment>
          {props.uiSchema["ui:previewNote"] && (
            <div className="mr-text-sm mr-text-grey-light mr-italic">
              {props.uiSchema["ui:previewNote"]}
            </div>
          )}
          <div
            className={
              props.previewClassName
                ? props.previewClassName
                : "mr-rounded mr-bg-black-15 mr-px-2 mr-py-1 mr-min-h-8"
            }
          >
            <MarkdownContent
              {...props}
              markdown={props.formData || ""}
              properties={{}}
              completionResponses={formValues}
              setCompletionResponse={(name, value) => {
                setFormValues(Object.assign({}, formValues, { [name]: value }));
              }}
              allowShortCodes
              allowFormFields
              allowPropertyReplacement
            />
          </div>
        </Fragment>
      ) : (
        <textarea
          className="form-control mr-font-mono mr-text-sm"
          onChange={(e) => props.onChange(e.target.value)}
          value={props.formData}
        />
      )}
    </Fragment>
  );
};

export const TagsInputField = (props) => {
  let tags = [];
  if (Array.isArray(props.formData)) {
    tags = _map(props.formData, (tag) => (tag.name ? tag.name : tag));
  } else if (_isString(props.formData) && props.formData !== "") {
    tags = props.formData.split(",");
  }

  return (
    <div className="tags-field">
      <TagsInput
        {...props}
        inputProps={{ placeholder: "Add keyword" }}
        value={_map(tags, (tag) => (_isObject(tag) ? tag.name : tag))}
        onChange={(tags) => props.onChange(tags.join(","))}
        addOnBlur
      />
    </div>
  );
};

/**
 * Provides a custom Dropzone widget for extracting *text* content (like
 * GeoJSON) from a local file into a string field in the form. To use, this
 * function needs to be imported into the schema and passed directly as the
 * value of the uiSchema ui:widget field of the property in question (e.g.
 * `"ui:widget": DropzoneTextUpload`). The form field should be of type string,
 * and it will be set with the text content of the uploaded file.
 */
export const DropzoneTextUpload = ({ id, onChange, readonly, formContext, dropAreaClassName }) => {
  const idRequirements = id !== "root_taskWidgetLayout" && id !== "root";

  if (readonly && idRequirements) {
    return (
      <div className="readonly-file mr-text-pink">
        <FormattedMessage {...messages.readOnlyFile} />
      </div>
    );
  }

  return (
    <Dropzone
      acceptClassName="active"
      multiple={false}
      disablePreview
      onDrop={(files) => {
        formContext[id] = { file: files[0] };
        onChange(files[0] ? files[0].name : files[0]);
      }}
    >
      {({ acceptedFiles, getRootProps, getInputProps }) => {
        const [uploadErrorText, setUploadErrorText] = useState("");

        if (acceptedFiles.length > 0) {
          const fileName = acceptedFiles[0].name;
          if (!fileName.endsWith(".geojson") && !fileName.endsWith(".json")) {
            acceptedFiles.pop();
            setUploadErrorText(
              <span className="mr-mr-4 mr-text-red-light mr-ml-1">
                {idRequirements ? (
                  <FormattedMessage {...messages.uploadErrorGeoJSON} />
                ) : (
                  <FormattedMessage {...messages.uploadErrorJSON} />
                )}
              </span>,
            );
          }
        }
        const body =
          acceptedFiles.length > 0 ? (
            <p>
              {acceptedFiles[0].name}
              <input {...getInputProps()} />
            </p>
          ) : (
            <span className="mr-flex mr-items-center">
              <SvgSymbol
                viewBox="0 0 20 20"
                sym="upload-icon"
                className="mr-fill-current mr-w-3 mr-h-3 mr-mr-4"
              />
              {uploadErrorText}
              {idRequirements ? (
                <FormattedMessage {...messages.uploadFilePromptGeoJSON} />
              ) : (
                <FormattedMessage {...messages.uploadFilePromptJSON} />
              )}
              <input {...getInputProps()} />
            </span>
          );

        return (
          <div
            className={
              dropAreaClassName
                ? dropAreaClassName
                : "dropzone mr-text-grey-lighter mr-p-4 mr-border-2 mr-rounded mr-mx-auto"
            }
            {...getRootProps()}
          >
            {body}
          </div>
        );
      }}
    </Dropzone>
  );
};

/**
 * Interprets and renders the given field description as Markdown
 */
export const MarkdownDescriptionField = ({ id, description }) => {
  if (!_isString(description)) {
    return null;
  }

  return (
    <div id={id} className="mr-text-grey-light mr-my-2">
      <MarkdownContent compact markdown={description} lightMode={false} />
    </div>
  );
};

export const LabelWithHelp = (props) => {
  const { id, displayLabel, label, required, control, rawHelp, schema, uiSchema } = props;
  if (displayLabel === false || uiSchema["ui:displayLabel"] === false) {
    return null;
  }

  const normalizedLabel = label ? _trim(label) : _trim(schema.title);
  if (_isEmpty(normalizedLabel)) {
    return null;
  }

  const normalizedHelp = rawHelp ? rawHelp : uiSchema["ui:help"];

  return (
    <div className="mr-mb-2 mr-flex">
      <label
        htmlFor={id}
        className={
          control ? "mr-text-base mr-text-mango" : "mr-text-mango mr-text-md mr-uppercase mr-mb-2"
        }
      >
        {normalizedLabel}
        {required && <span className="mr-text-red-light mr-ml-1">*</span>}
      </label>
      {!_isEmpty(normalizedHelp) && (
        <Dropdown
          className="mr-dropdown--offsetright"
          innerClassName="mr-bg-blue-darker"
          dropdownButton={(dropdown) => (
            <button
              type="button"
              onClick={dropdown.toggleDropdownVisible}
              className="mr-ml-4 mr-flex"
            >
              <SvgSymbol
                sym="info-icon"
                viewBox="0 0 20 20"
                className="mr-fill-green-lighter mr-w-4 mr-h-4"
              />
            </button>
          )}
          dropdownContent={() => (
            <div className="mr-w-96 mr-max-w-screen60 mr-whitespace-normal">
              <MarkdownContent markdown={normalizedHelp} lightMode={false} />
            </div>
          )}
        />
      )}
    </div>
  );
};

export { PriorityBoundsFieldAdapter as CustomPriorityBoundsField };
