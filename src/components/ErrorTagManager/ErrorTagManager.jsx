import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import useErrorTagOptions from "../../hooks/UseErrorTagOptions";
import AsManager from "../../interactions/User/AsManager";
import SignIn from "../../pages/SignIn/SignIn";
import BusySpinner from "../BusySpinner/BusySpinner";
import WithCurrentUser from "../HOCs/WithCurrentUser/WithCurrentUser";
import Modal from "../Modal/Modal";
import messages from "./Messages";

const ErrorTagManager = (props) => {
  const intl = useIntl();
  const { data: errorTags, isLoading, toggleKeywordStatus, addKeyword } = useErrorTagOptions();
  const manager = AsManager(props.user);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagDescription, setNewTagDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  if (!manager.isLoggedIn()) {
    return props.checkingLoginStatus ? (
      <div className="admin mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
        <BusySpinner />
      </div>
    ) : (
      <SignIn {...props} />
    );
  }

  if (!manager.isSuperUser()) {
    return <div><FormattedMessage {...messages.notSuperAdmin} /></div>;
  }

  const filteredTags = errorTags?.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddKeyword = async () => {
    await addKeyword({ name: newTagName, description: newTagDescription });
    setShowCreateModal(false);
    setNewTagName("");
  };

  return (
    <div className="mr-bg-gradient-r-green-dark-blue mr-text-white mr-px-6 mr-py-8 mr-cards-inverse">
      <div className="mr-flex mr-justify-between mr-items-center mr-mb-6">
        <h2 className="mr-text-white mr-text-2xl mr-font-bold"><FormattedMessage {...messages.heading} /></h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mr-button mr-button--green mr-px-4 mr-py-2"
        >
          <FormattedMessage {...messages.addNewTag} />
        </button>
      </div>

      <div className="mr-mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mr-input mr-text-white mr-bg-black-10 mr-w-64"
          placeholder={intl.formatMessage(messages.searchPlaceholder)}
        />
      </div>

      {isLoading ? (
        <div className="mr-flex mr-justify-center mr-py-8 mr-w-full">
          <BusySpinner />
        </div>
      ) : (
        <div className="mr-overflow-x-auto mr-bg-black-15 mr-rounded-lg">
          <table className="mr-w-full">
            <thead>
              <tr className="mr-text-left mr-border-b mr-border-white-10 mr-bg-black-10">
                <th className="mr-p-4 mr-font-medium mr-text-white mr-w-24">ID</th>
                <th className="mr-p-4 mr-font-medium mr-text-white mr-w-48">Name</th>
                <th className="mr-p-4 mr-font-medium mr-text-white mr-flex-1">Description</th>
                <th className="mr-p-4 mr-font-medium mr-text-white mr-w-48">Status</th>
                <th className="mr-p-4 mr-font-medium mr-text-white mr-w-48">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTags?.map((tag) => (
                <tr
                  key={tag.id}
                  className="mr-border-b mr-border-white-10 hover:mr-bg-black-10 mr-transition-colors"
                >
                  <td className="mr-p-4">{tag.id}</td>
                  <td className="mr-p-4 mr-font-medium">{tag.name}</td>
                  <td className="mr-p-4">{tag.description}</td>
                  <td className="mr-p-4">
                    <span
                      className={`mr-px-2 mr-py-1 mr-rounded-full mr-text-sm ${
                        tag.active ? "mr-text-green" : "mr-text-red"
                      }`}
                    >
                      {tag.active ? <FormattedMessage {...messages.statusActive} /> : <FormattedMessage {...messages.statusDisabled} />}
                    </span>
                  </td>
                  <td className="mr-p-4">
                    <button
                      onClick={() => toggleKeywordStatus(tag.id)}
                      className={`mr-button ${
                        tag.active ? "mr-button--white" : "mr-button--green"
                      } mr-px-4 mr-py-2`}
                    >
                      {tag.active ? <FormattedMessage {...messages.actionDisable} /> : <FormattedMessage {...messages.actionEnable} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <Modal isActive={showCreateModal} onClose={() => setShowCreateModal(false)} narrow>
          <div className="mr-p-4">
            <h3 className="mr-text-white mr-text-xl mr-mb-4"><FormattedMessage {...messages.createHeading} /></h3>
            <div className="mr-mb-4">
              <label className="mr-block mr-text-white mr-mb-2"><FormattedMessage {...messages.nameLabel} /></label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="mr-input mr-text-white mr-bg-black-10 mr-w-full"
                placeholder={intl.formatMessage(messages.namePlaceholder)}
              />
            </div>
            <div className="mr-mb-4">
              <label className="mr-block mr-text-white mr-mb-2"><FormattedMessage {...messages.descriptionLabel} /></label>
              <input
                type="text"
                value={newTagDescription}
                onChange={(e) => setNewTagDescription(e.target.value)}
                className="mr-input mr-text-white mr-bg-black-10 mr-w-full"
                placeholder={intl.formatMessage(messages.descriptionPlaceholder)}
              />
            </div>
            <div className="mr-flex mr-justify-end mr-mt-6">
              <button
                className="mr-button mr-button--white mr-mr-4"
                onClick={() => setShowCreateModal(false)}
              >
                <FormattedMessage {...messages.cancel} />
              </button>
              <button
                className="mr-button mr-button--green"
                onClick={handleAddKeyword}
                disabled={!newTagName.trim()}
              >
                <FormattedMessage {...messages.createTag} />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WithCurrentUser(ErrorTagManager);
