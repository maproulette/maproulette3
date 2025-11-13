/**
 * Entry point for building AnalyticsPlugin as a standalone module
 * This file exports the plugin in a format that can be loaded dynamically
 */
import { AnalyticsPlugin } from './AnalyticsPlugin'

// Export as default for dynamic imports
export default AnalyticsPlugin

// Also export as named export for flexibility
export { AnalyticsPlugin as plugin }

