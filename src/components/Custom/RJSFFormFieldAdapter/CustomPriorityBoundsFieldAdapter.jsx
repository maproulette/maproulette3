import React from "react";
import _get from "lodash/get";
import MarkdownContent from "../../MarkdownContent/MarkdownContent";
import { FormattedMessage } from "react-intl";
import CustomPriorityBoundsField from "./CustomPriorityBoundsField";
/**
 * Adapts the CustomPriorityBoundsField for react-jsonschema-form
 */
const CustomPriorityBoundsFieldAdapter = ({
  uiSchema,
  schema,
  formData,
  onChange,
  formContext,
  name,
  ...otherProps
}) => {
  const description = _get(uiSchema, "ui:description");
  const title = schema.title || name;
  const additionalProps = _get(formContext, `customFields.${name}`, {});

  return (
    <div className="mr-mb-6">
      {title && (
        <div className="mr-text-md mr-mb-2 mr-font-medium">
          <FormattedMessage id={`${name}.title`} defaultMessage={title} />
        </div>
      )}

      {description && (
        <div className="mr-text-sm mr-text-gray-light mr-mb-4">
          <MarkdownContent markdown={description} />
        </div>
      )}

      <CustomPriorityBoundsField
        formData={formData}
        onChange={onChange}
        name={name}
        {...additionalProps}
        {...otherProps}
      />
    </div>
  );
};

export default CustomPriorityBoundsFieldAdapter;
