import React from "react";
import PropTypes from "prop-types";
import { useQuery } from 'react-query';
import { defaultRoutes as api } from "../../services/Server/Server";
import Endpoint from "../../services/Server/Endpoint";

const SelectOptions = (props) => {
  const defaultOption = [
    <option key="-1" value="-1" />
  ]

  if (props.options?.length) {
    const actualOptions = props.options.map((option) => {
      return (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      )
    })

    return defaultOption.concat(actualOptions)
  } else {
    return defaultOption
  }
}

SelectOptions.propTypes = {
  options: PropTypes.array.isRequired,
}

const useRejectReasonOptions = () => {
  const query = useQuery('rejectionTags', () =>
    new Endpoint(api.keywords.find, { params: { tagType: "reject", limit: 1000 } }).execute()
  )

  return query;
}

const RejectReasonDropdown = (props) => {
  const options = useRejectReasonOptions();

  return (
    <div className="mr-mt-4">
      <div className="mr-mb-1">Reject Reason</div>
      <select
        key="name-review-reject"
        className="form-select form-control"
        onChange={props.onChange}
        value={props.value}
      >
        <SelectOptions options={options.data}/>
      </select>
    </div>
  )
}

RejectReasonDropdown.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
}

export default RejectReasonDropdown;
