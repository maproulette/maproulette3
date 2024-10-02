import "@testing-library/jest-dom";
import { TaskClusterMap } from "./TaskClusterMap";
import { labelOverlappingMarkers } from "./MapMarkers";

describe("TaskClusterMap", () => {
  it("renders TaskClusterMap UI", () => {
    const { getByText } = global.withProvider(
      <TaskClusterMap
        getUserAppSetting={() => null}
        taskMarkers={[]}
      />
    );
    const text = getByText("3000 km");
    expect(text).toBeInTheDocument();
  });

  it("provides an overlapping count value to markers", () => {
    const markers = labelOverlappingMarkers([{
      position: [
        "123",
        "456"
      ]
    }]);

    expect(markers[0].overlappingCount).toBe(1);
  });

  it("gives overlapping count of 2 for markers with same position", () => {
    const markers = labelOverlappingMarkers([
      {
        position: [
          "123",
          "456"
        ]
      }, {
        position: [
          "123",
          "456"
        ]
      }
    ]);

    expect(markers[0].overlappingCount).toBe(2);
  });
});