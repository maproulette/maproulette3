import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with SearchControl
 */
export default defineMessages({
  modalTitle: {
    id: "CloneChallengeForAreaModal.modal.title",
    defaultMessage: "Clone Challenge for Selected Administrative Area"
  },

  modalDescription: {
    id: "CloneChallengeForAreaModal.modal.description",
    defaultMessage: "You are about to create a clone of this challenge."
  },

  modalExplanation: {
    id: "CloneChallengeForAreaModal.modal.explanation",
    defaultMessage:
`* Use the Nominatim search box below to find and select an area of interest
* The selection must be an administrative area that is neither smaller than a city nor larger than a country but this will be validated on selection
* A copy of this Challenge will be created with all the same settings, but for the area you are interested in. 
* The cloned challenge will have the same name with the added text \"Clone for AREA\". You can change this in the next screen. 
* You can also change other settings, for example the preferred aerial imagery to use.` 
  },

  searchLabel: {
    id: "CloneChallengeNominatimSearchbox.SearchControl.searchLabel",
    defaultMessage: "Search",
  },

  noResults: {
    id: "CloneChallengeNominatimSearchbox.SearchControl.noResults",
    defaultMessage: "No Results",
  },

  nominatimQuery: {
    id: "CloneChallengeNominatimSearchbox.SearchControl.nominatimQuery.placeholder",
    defaultMessage: "Nominatim Query",
  },

  nominatimSearchTitle: {
    id: "CloneChallengeNominatimSearchbox.SearchControl.nominatimSearchTitle",
    defaultMessage: "Nominatim Search:",
  },

  selectedNominatimArea: {
    id: "CloneChallengeNominatimSearchbox.SearchControl.selectedNominatimArea",
    defaultMessage: "Selected Nominatim Search Area:",
  },
})
