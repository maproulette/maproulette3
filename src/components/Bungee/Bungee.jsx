import "fontsource-bungee";
import "fontsource-bungee-shade";
import "fontsource-bungee-inline";
import classNames from "classnames";

/**
 * Renders text using the three chromatic layers from the Bungee font (shade,
 * regular, and inline), taking care of offsetting the layers appropriately.
 * You should provide a baseColor and highlightColor, and optionally an
 * innerColor
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const Bungee = (props) => {
  // Because the chromatic layers are positioned absolutely, we also render a
  // normally-positioned invisible layer (with opacity 0) so that the component
  // will end up with a proper width and height in the DOM
  return (
    <div className="mr-relative" style={{ left: "0.115em" }}>
      <div className="mr-font-bungeeshade" style={{ opacity: "0" }}>
        {props.text}
      </div>
      <div
        className={classNames(
          "mr-absolute mr-top-0 mr-font-bungeeshade mr-z-5",
          `mr-text-${props.baseColor}`,
        )}
        style={{ left: "-0.115em" }}
      >
        {props.text}
      </div>
      <div
        className={classNames(
          "mr-absolute mr-top-0 mr-font-bungee mr-z-10",
          `mr-text-${props.innerColor || props.baseColor}`,
        )}
        style={{ letterSpacing: "0.1em" }}
      >
        {props.text}
      </div>
      <div
        className={classNames(
          "mr-absolute mr-top-0 mr-font-bungeeinline mr-z-15",
          `mr-text-${props.highlightColor}`,
        )}
        style={{ letterSpacing: "0.1em" }}
      >
        {props.text}
      </div>
    </div>
  );
};

export default Bungee;
