# Adding New Admin Dashboard Widgets

MapRoulette supports both first-party widgets that are included in the
MapRoulette repo, and "local" widgets developed separately that are intended to
remain local to an installation.

If you're creating a widget that others might benefit from, consider
implementing it as a first-party widget and submitting a pull request to have
it included with MapRoulette.

> Please note that all new first-party widgets need to be properly
> internationalized to be accepted into the project

### Preparing to create a first-party widget

You should add your administrative widget into
`src/components/AdminPane/Manage/Widgets/` (in its own directory), and then
import it into the `widget_registry.js` file found in the Widgets directory.

### Preparing to create a local widget

If it doesn't already exist, create a
`src/components/AdminPane/Manage/Widgets/contrib` directory and add your widget
in there. You'll then need to create a local `widget_registry.js` file in the
contrib directory and import your new widget. MapRoulette will look for the
contrib/widget_registry.js file and pull it in if it exists.

> The contrib directory is .gitignored so that it won't accidentally be
> committed to the MapRoulette repo.

### Creating your widget

You must do four things to create a widget:

1. Build your widget component (ideally leveraging QuickWidget)
2. Create a **descriptor object** that describes your widget
3. Register your widget component and descriptor
4. Import your widget into the appropriate widget_registry

##### Build your component with QuickWidget
The majority of widgets can leverage the `QuickWidget` component to keep things
simple. For example, assuming you have a LoremIpsum component that you want to
turn into a widget:

```
<QuickWidget {...this.props} className="lorem-ipsum-widget" widgetTitle="Lorem Ipsum">
  <LoremIpsum />
</QuickWidget>
```

QuickWidget expects a `widgetTitle` prop with the title of the widget to be
displayed in the widget header. It also accepts an optional `headerControls`
prop where you can include any controls you'd like displayed in the widget
header next to the title, and a `menuControls` prop for controls to display in
the widget's drop-down menu. It renders the child as the content of the
widget.

> headerControls are rendered in the middle of the header row. If you would
> prefer your controls on the left or right side, use leftHeaderControls or
> rightHeaderControls, respectively. All three can be used in combination
> for more sophisticated layouts.

##### Add a descriptor object
You'll also need to create a **descriptor** object that tells MapRoulette
about your component and optionally sets up any default configuration/state
your component might need. These are typically setup in the same file as the
widget component.

Your descriptor object should contain the following fields:

* `widgetKey` is a string identifier for your widget component that must be
unique across all widget components in the system. If you're creating a local
widget, you may wish to namespace your widgetKey to ensure it doesn't someday
conflict with a first-party widget.

* `targets` lists the data target(s) from the Widget service
`WidgetDataTarget` with which your component is compatible (projects,
challenges, etc)

* `label` is a human-readable name for your widget that users will see in the
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
  widgetKey: 'local.LoremWidget',
  targets: WidgetDataTarget.challenge,
  label: 'Lorem Ipsum',
  defaultWidth: 4,
  defaultHeight: 8,
  defaultConfiguration: {
    mySetting: 'foo',
    anotherSetting: 'bar',
  }
}
```

##### Preserving widget configuration across sessions
If your component is configurable and you'd like the configuration to be
preserved across visits to the dashboard, then *do not* use state for
configuration fields you wish to have persisted. Instead, reference each field
from the `widgetConfiguration` object prop your component is given (which is
initialized to the defaultConfiguration values from your descriptor if none
have been previously persisted) and update the configuration object using the
`updateWidgetConfiguration` function prop. You only need to pass in the fields
to be updated (just like you'd use setState), e.g.
`this.props.updateWidgetConfiguration({mySetting: 'baz'})`

##### Register your widget with its descriptor
Finally, your widget component will also need to register itself with
MapRoulette using the `registerWidgetType` function from the Widget service
(`services/Widget/Widget`), passing in itself -- the component class,
pre-wrapped with any needed higher-order components -- and the descriptor
object. For example, `registerWidgetType(LoremWidget, descriptor)`.

Don't forget to import your widget into the appropriate widget_registry.js
depending on whether it is first-party or local.


### Optionally add to a dashboard's default widgets
> This is for first-party widgets only.

If you think your first-party widget should be included by default in a particular
dashboard, you can add it to that dashboard's `widgets` field in its default
setup object. Note that this will only apply to dashboard instances generated
from the default setup going forward -- your component will not be injected
into any previously persisted configurations of the dashboard.

If the dashboard defines a `layout` field, you need to add an entry for your
widget into the layout as well (at the same index of your entry in the `widgets`
field).

Only widgets with very broad appeal that are likely suitable for all users
should be included by default on a dashboard.
