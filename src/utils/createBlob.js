const createBlob = (jsonData) => {
  const blob = new Blob([jsonData], { type: "application/json" });

  return blob;
};

export default createBlob;
