import React, { useState, useEffect, useRef } from "react";
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

  const toggle = (bool) => {
    setActive(bool);
    setTimeout(() => setVisible(bool), 1);
  };

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

  const handleDocumentClick = (event) => {
    if (referenceRef.current.contains(event.target)) {
      return null;
    }

    if (popperRef.current.contains(event.target)) {
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

  const isDropdownActive = toggleVisible ? isVisible : active;
  const isDropdownVisible = toggleVisible ? true : visible;

  return (
    <div
      data-testid="mr-dropdown"
      className={classNames("mr-dropdown", className)}
      {...rootProps}
    >
      <div ref={referenceRef}>{dropdownButton(renderFuncArgs)}</div>
      <Portal>
        <div
          ref={popperRef}
          className="p-0.5 mr-z-250"
          style={styles.popper}
          {...attributes.popper}
        >
          {isDropdownActive && (
            <div
              style={{ visibility: isDropdownVisible ? "visible" : "hidden" }}
            >
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
  placement: PropTypes.string
};

export default Dropdown;
