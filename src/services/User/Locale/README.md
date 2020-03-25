# Managing Locales and Translation Files

Internationalization and localization in MapRoulette occurs via
[react-intl](https://github.com/yahoo/react-intl/wiki). There are two pieces
needed to support a specific locale: the react-intl locale data (which includes
things like date and number formatting rules) and a translation file that
contains (at least some) translated versions of strings used in the app.
Updates to existing translation files -- and the addition of new community
translations -- are managed through our
[Transifex project](https://www.transifex.com/osmlab/maproulette3).


### Transifex client setup
Before interacting with Transifex, the `tx` [Transifex command line
client](https://docs.transifex.com/client/installing-the-client) must be
installed on your machine.

The client references the `.tx/config` file at the root of the project during
execution of commands. If you have questions about how the client makes the
decisions it does, the config file is a good place to start.


### Pulling the latest translation files from Transifex
Updated and new translation files will be pulled into the `src/lang/`
directory. They should then be added and committed to the source repo like
normal.

```
tx pull -a
```

[Detailed docs](https://docs.transifex.com/client/pull)


### Pushing the latest en-US.json message strings to Transifex
Transifex translations are based on the en-US.json file. When new messages are
added to the app (and included in en-US.json via `yarn build-intl`), those need
to be pushed to Transifex before they'll be visible to the community for
translation.

```
tx push -s
```

[Detailed docs](https://docs.transifex.com/client/push)


### Adding a new locale
In MapRoulette, it's the job of the `src/services/User/Locale/Locale` module to
manage loading of the locale data and translation file for a desired locale.
When a new locale is to be supported, this module will need to be updated to
(1) indicate that the locale is supported and (2) be capable of loading the
locale data and translation file for the new locale. Loading occurs dynamically
when the locale is selected by the user.

Within the Locale module:

1. Add the new locale to the `Locale` object
2. Add the proper imports to the `LocaleImports` object
