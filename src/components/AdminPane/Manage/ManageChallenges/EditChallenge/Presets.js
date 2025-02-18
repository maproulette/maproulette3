import idPresets from "@openstreetmap/id-tagging-schema/dist/preset_categories.json";
import _each from "lodash/each";
import _find from "lodash/find";
import _isEmpty from "lodash/isEmpty";
import _reduce from "lodash/reduce";
import _toPairs from "lodash/toPairs";

/**
 * Prepares presets received from the server to the representation expected by
 * the edit form.
 *
 * We receive a `presets` field containing an array of enabled preset strings
 * (or undefined/missing if presets are not enabled).
 *
 * We need to separate any preset strings into categories, with the category
 * name/key added as a top-level field on the challenge and set to an array of
 * its preset strings. We then need to set a `presets` field to a boolean true
 * if there are presets enabled, false if not
 */
export const preparePresetsForForm = (challengeData) => {
  if (_isEmpty(challengeData.presets)) {
    challengeData.presets = false;
    return challengeData;
  }

  return Object.assign({}, challengeData, categorizePresetStrings(challengeData.presets), {
    presets: true,
  });
};

/**
 * Prepares presets on the challenge data for saving to the server. We
 * receive a `presets` boolean that determines whether presets are to be
 * applied at all, as well as top-level fields for each preset category
 * in which the challenge manager selected presets to enable, containing
 * an array of the enabled preset strings.
 *
 * We need to return just a `presets` field containing an array of all
 * enabled preset strings, or else an empty array if presets are not enabled
 * (or none were chosen)
 */
export const preparePresetsForSaving = (challengeData) => {
  const definedCategories = definedPresetCategories(challengeData);
  if (!challengeData.presets) {
    challengeData.presets = [];
  } else {
    const presets = definedPresets(challengeData, definedCategories);
    challengeData.presets = _isEmpty(presets) ? [] : presets;
  }

  prunePresetCategories(challengeData, definedCategories);
  return challengeData;
};

/**
 * Return array of names/keys of categories that exist as top-level fields on
 * the challenge data
 */
export const definedPresetCategories = (challengeData) => {
  return _reduce(
    idPresets,
    (definedCategories, presetCategory, categoryName) => {
      if (Array.isArray(challengeData[categoryName])) {
        definedCategories.push(categoryName);
      }

      return definedCategories;
    },
    [],
  );
};

/**
 * Gather up all of the preset strings from the various top-level category
 * fields on the challenge
 */
export const definedPresets = (challengeData, definedCategories) => {
  return _reduce(
    definedCategories,
    (presets, category) => {
      return presets.concat(challengeData[category]);
    },
    [],
  );
};

/**
 * Remove preset category top-level fields from the challenge
 */
export const prunePresetCategories = (challengeData, activeCategories) => {
  _each(activeCategories, (categoryName) => delete challengeData[categoryName]);
};

/**
 * Generates an object mapping category names to array of preset strings that
 * belong in that category as appropriate for each given preset string
 */
export const categorizePresetStrings = (presetStrings) => {
  const categorized = {};
  _each(presetStrings, (preset) => {
    // eslint-disable-next-line no-unused-vars
    const parentCategory = _find(_toPairs(idPresets), ([categoryName, category]) => {
      return category.members.indexOf(preset) !== -1;
    });

    if (!parentCategory) {
      return;
    }

    const categoryName = parentCategory[0];
    if (!Array.isArray(categorized[categoryName])) {
      categorized[categoryName] = [];
    }
    categorized[categoryName].push(preset);
  });

  return categorized;
};
