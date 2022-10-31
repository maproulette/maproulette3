import React from "react";
import { useState } from "react";

const WithMetricsState = function (WrappedComponent) {
  const [currentTab, setCurrentTab] = useState('challenge')
  
  return <WrappedComponent
        {...this.props}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />
}

export default (WrappedComponent) => WithMetricsState(WrappedComponent)