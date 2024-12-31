/**
 * Manages animation scheduling for a map
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
class MapAnimator {
  constructor(animationDelay = 250) {
    this.animationDelay = animationDelay;
    this.animationFunction = null;
    this.animationHandle = null;
  }

  /**
   * Set the function to be invoked when animation executes
   */
  setAnimationFunction(func) {
    this.animationFunction = func;
  }

  /**
   * Reset everything, clearing the animation function and cancelling any
   * pending animations
   */
  reset() {
    this.animationFunction = null;
    this.cancelPendingAnimation();
  }

  /**
   * Schedules animation. If animation is already pending, it is first
   * cancelled prior to scheduling a new one
   */
  scheduleAnimation() {
    this.cancelPendingAnimation();
    this.animationHandle = setTimeout(() => this.executeAnimation(), this.animationDelay);
  }

  /**
   * Cancel any pending animation, clearing the timeout if it exists
   */
  cancelPendingAnimation() {
    if (this.animationHandle) {
      clearTimeout(this.animationHandle);
      this.animationHandle = null;
    }
  }

  /**
   * Execute the animation, invoking the animation function if set
   */
  executeAnimation() {
    if (this.animationFunction) {
      this.animationFunction();
    }
  }
}

export default MapAnimator;
