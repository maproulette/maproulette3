const PagePickerOptions = (props) => {
  if (props.numItems > props.itemLimit) {
    let options = [];
    let numberOfPages = Math.ceil(props.numItems / props.itemLimit);

    for (let i = 0; i < numberOfPages; i++) {
      options.push(
        <option key={i} value={i}>
          Page {i + 1}
        </option>,
      );
    }

    return options;
  }

  return null;
};

const PagePicker = (props) => {
  return (
    <select
      onChange={(e) => props.changePage(e.target.value)}
      defaultValue={-1}
      className="mr-w-24 mr-select mr-text-xs mr-pr-5"
    >
      <option key="all" value="-1">
        All
      </option>
      <PagePickerOptions {...props} />
    </select>
  );
};

export default PagePicker;
