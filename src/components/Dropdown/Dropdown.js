import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import classNames from "classnames";
import { usePopper } from "react-popper";
import UseEventListener from "../../hooks/UseEventListener";

const Portal = ({ children, querySelector = "#dropdown" }) => {
  return ReactDOM.createPortal(children, document.querySelector(querySelector));
};

const Dropdown = ({
  dropdownButton,
  dropdownContent,
  className,
  rootProps,
  innerClassName,
  fixedMenu,
  toggleVisible,
  isVisible,
  placement,
}) => {
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const referenceRef = useRef();
  const popperRef = useRef();

  const toggle = useCallback(
    (bool) => {
      setActive(bool);
      toggleVisible();
      setTimeout(() => setVisible(bool), 1);
    },
    [toggleVisible]
  );

  const { styles, attributes, forceUpdate } = usePopper(
    referenceRef.current,
    popperRef.current,
    {
      placement: placement || "bottom-end",
      modifiers: [
        {
          name: "preventOverflow",
          options: {
            rootBoundary: "viewport",
            offset: [0, 10],
          },
        },
      ],
    }
  );

  useEffect(() => {
    if (active && forceUpdate) {
      forceUpdate();
    }
  }, [active, forceUpdate]);

  useEffect(() => {
    if (isVisible !== undefined) {
      if (isVisible && !active) {
        toggle(true);
      }

      if (!isVisible && active) {
        toggle(false);
      }
    }
  }, [isVisible, active, toggle]);

  const handleDocumentClick = (event) => {
    if (referenceRef.current.contains(event.target)) {
      return null;
    }

    if (popperRef.current.contains(event.target)) {
      return null;
    }

    if (
      document.getElementById("confirm-action-modal")?.contains(event.target)
    ) {
      return null;
    }

    toggle(false);
  };

  UseEventListener("mousedown", handleDocumentClick);

  const renderFuncArgs = {
    isDropdownVisible: active,
    toggleDropdownVisible: () => toggle(!active),
    closeDropdown: () => toggle(false),
  };

  return (
    <div data-testid="mr-dropdown" {...rootProps}>
      <div ref={referenceRef} className={classNames("mr-dropdown", className)}>
        {dropdownButton(renderFuncArgs)}
      </div>
      <Portal>
        <div
          ref={popperRef}
          className="p-0.5 mr-z-250"
          style={styles.popper}
          {...attributes.popper}
        >
          {active && (
            <div style={{ visibility: visible ? "visible" : "hidden" }}>
              <div className="mr-dropdown__main">
                <div
                  className={classNames("mr-dropdown__inner", innerClassName, {
                    "mr-fixed": fixedMenu,
                  })}
                >
                  <div className="mr-dropdown__content">
                    {dropdownContent(renderFuncArgs)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Portal>
    </div>
  );
};

Dropdown.propTypes = {
  dropdownButton: PropTypes.func.isRequired,
  dropdownContent: PropTypes.func.isRequired,
  className: PropTypes.string,
  rootProps: PropTypes.object,
  innerClassName: PropTypes.string,
  fixedMenu: PropTypes.bool,
  suppressControls: PropTypes.bool,
  arrowClassName: PropTypes.string,
  toggleVisible: PropTypes.func,
  isVisible: PropTypes.bool,
  placement: PropTypes.string,
};

Dropdown.defaultProps = {
  toggleVisible: () => null,
};

export default Dropdown;
