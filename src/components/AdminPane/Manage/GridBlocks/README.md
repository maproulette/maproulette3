# Adding New Dashboard Blocks

MapRoulette supports both first-party blocks that are included in the
MapRoulette repo, and "local" blocks developed separately that are intended to
remain local to an installation.

If you're creating a block that others might benefit from, consider
implementing it as a first-party block and submitting a pull request to have it
included with MapRoulette.

> Please note that all new first-party blocks need to be properly
> internationalized to be accepted into the project

### Preparing to create a first-party block

You should add your block into `src/components/AdminPane/Manage/GridBlocks/` (in
its own directory), and then import it into the `block_registry.js` file found
in the GridBlocks directory.

### Preparing to create a local block

If it doesn't already exist, create a
`src/components/AdminPane/Manage/GridBlocks/contrib` directory and add your
block in there. You'll then need to create a `block_registry.js` file in the
contrib directory and import your new block. MapRoulette will look for the
contrib/block_registry.js file and pull it in if it exists.

> The contrib directory is .gitignored so that it won't accidentally be
> committed to the MapRoulette repo.

### Creating your block component

##### Using QuickBlock
The majority of block components can leverage the `QuickBlock` component to
keep things simple. For example, here is what a basic Lorem Ipsum block might
render:

```
<QuickBlock {...this.props} className="lorem-block" blockTitle="Lorem Ipsum">
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
</QuickBlock>
```

> If for some reason you can't utilize QuickBlock and need to build a block
> from scratch, you can still reference its source for the full structure
> you'll need to implement.

QuickBlock expects a `blockTitle` prop with the title of the block to be
displayed in the block header. It also accepts an optional `headerControls`
prop where you can include any controls you'd like displayed in the block
header next to the title, and a `menuControls` prop for controls to display in
the block's drop-down menu. It renders the given children as the content of the
block.

##### Adding a descriptor
You'll also need to create a **descriptor** object that tells MapRoulette
about your component, and also sets up any default configuration/state your
component might need. Your descriptor object should contain the following
fields:

* `blockKey` is a string identifier for your block component that must be
unique across all block components in the system. If you're creating a local
block, you may wish to namespace your blockKey to ensure it doesn't someday
conflict with a first-party block.

* `targets` lists the data target(s) from the Dashboard service
`DataTypeTargets` (projects, challenges, etc) with which your component is
compatible.

* `label` is a human-readable name for your block that users will see in the
Add Widget menu. It can be a string or (preferably) an internationalized
message object.

* `defaultWidth` is the default width of the component in columns

* `defaultHeight` is the default height of the component in rows

* `minWidth` (optional) is the minimum allowed width of the component in
columns

* `maxWidth` (optional) is the maximum allowed width of the component in
columns

* `minHeight` (optional) is the minimum allowed height of the component in rows

* `maxHeight` (optional) is the maximum allowed height of the component in rows

* `defaultConfiguration` (optional) is an object that can contain any default
state or configuration specific to your component

Here's a basic example:

```
const descriptor = {
  blockKey: 'local.LoremBlock',
  targets: DashboardDataTarget.challenge,
  label: 'Lorem Ipsum',
  defaultWidth: 4,
  defaultHeight: 8,
  defaultConfiguration: {
    mySetting: 'foo',
    anotherSetting: 'bar',
  }
}
```

##### Preserving block configuration across sessions
If your component is configurable and you'd like the configuration to be
preserved across visits to the dashboard, then *do not* use state for
configuration fields you wish to have persisted. Instead, reference each field
from the `blockConfiguration` object prop your component is given (which is
initialized to the defaultConfiguration values from your descriptor if none
have been previously persisted) and update the configuration object using the
`updateBlockConfiguration` function prop. You only need to pass in the fields
to be updated (just like you'd use setState), E.G.
`this.props.updateBlockConfiguration({mySetting: 'baz'})`

##### Registering your component
Finally, your block component will also need to register itself with
MapRoulette using the `BlockTypes.registerBlockType` function, passing in
itself (the component class, wrapped with any needed HOCs) and the descriptor
object. E.G. `registerBlockType(LoremBlock, descriptor)`.

Don't forget to import your block into the appropriate block_registry.js
depending on whether it is first-party or local.


### Optionally add to a dashboard's default blocks

> This is for first-party blocks only.

If you think your first-party block should be included by default in a particular
dashboard, you can add it to that dashboard's `blocks` field in its default
setup object. Note that this will only apply to dashboard instances generated
from the default setup going forward -- your component will not be injected
into any previously persisted configurations of the dashboard.

If the dashboard defines a `layout` field, you need to add an entry for your
block into the layout as well (at the same index of your entry in the `blocks`
field).

Only blocks with very broad appeal that are likely suitable for all users
should be included by default on a dashboard.
