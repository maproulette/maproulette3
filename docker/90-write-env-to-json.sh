#!/bin/sh

# Convert env to json and write out to overrides file
jq -n 'env | with_entries(select(.key | startswith("REACT_APP_")))' > /tmp/env.overrides.json
# Merge overrides and defaults together
cp /srv/www/env.json /tmp/env.default.json
jq -s '.[0] * .[1]' /tmp/env.default.json /tmp/env.overrides.json > /srv/www/env.json
