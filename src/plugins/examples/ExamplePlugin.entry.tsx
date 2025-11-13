/**
 * Entry point for building ExamplePlugin as a standalone module
 * This file exports the plugin in a format that can be loaded dynamically
 */
import { ExamplePlugin } from './ExamplePlugin'

// Export as default for dynamic imports
export default ExamplePlugin

// Also export as named export for flexibility
export { ExamplePlugin as plugin }
