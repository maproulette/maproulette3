import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { TaskReviewTable, setupColumnTypes, getFilterIds } from "./TasksReviewTable";

const testTableData = [
  {
      "id": 399521,
      "name": "ebe0e247-a37a-42cd-b3a7-49ec14a7f9c1",
      "created": "2022-08-12T13:11:22.389-05:00",
      "modified": "2022-11-29T13:11:17.599-05:00",
      "parent": {
          "id": 30,
          "name": "challenge 1",
          "status": 3,
          "parent": {
              "id": 4,
              "name": "bar",
              "displayName": "bar"
          }
      },
      "instruction": "",
      "location": {
          "type": "Point",
          "coordinates": [
              167.795562744141,
              -47.0467328859598
          ]
      },
      "geometries": {
          "type": "FeatureCollection",
          "features": [
              {
                  "id": "ebe0e247-a37a-42cd-b3a7-49ec14a7f9c1",
                  "type": "Feature",
                  "geometry": {
                      "type": "Point",
                      "coordinates": [
                          167.79556274414062,
                          -47.04673288595976
                      ]
                  },
                  "properties": {}
              }
          ]
      },
      "status": 2,
      "mappedOn": "2022-11-08T13:48:16.233-05:00",
      "completedTimeSpent": 5343593,
      "completedBy": 1,
      "review": {
          "reviewStatus": 0,
          "reviewRequestedBy": 1,
          "reviewStartedAt": "2022-12-10T14:03:54.959-05:00"
      },
      "priority": 0,
      "changesetId": -1,
      "errorTags": "",
      "reviewStatus": 0,
      "reviewRequestedBy": {
          "username": "Tester",
          "id": 1
      },
      "reviewStartedAt": "2022-12-10T14:03:54.959-05:00",
      "tags": [
          {
              "id": 87,
              "name": "asdf",
              "description": "",
              "created": "2022-12-11T17:44:11.018-05:00",
              "modified": "2022-12-11T17:44:11.018-05:00",
              "tagType": "tasks"
          }
      ]
  },
  {
      "id": 529974,
      "name": "fe0c8fef-7fb2-47b6-a79b-36affb1435dd",
      "created": "2022-11-02T20:53:55.198-05:00",
      "modified": "2022-11-29T13:11:17.599-05:00",
      "parent": {
          "id": 30,
          "name": "challenge 1",
          "status": 3,
          "parent": {
              "id": 4,
              "name": "bar",
              "displayName": "bar"
          }
      },
      "instruction": "",
      "location": {
          "type": "Point",
          "coordinates": [
              168.001556396484,
              -47.0738631018141
          ]
      },
      "geometries": {
          "type": "FeatureCollection",
          "features": [
              {
                  "id": "fe0c8fef-7fb2-47b6-a79b-36affb1435dd",
                  "type": "Feature",
                  "geometry": {
                      "type": "Point",
                      "coordinates": [
                          168.00155639648438,
                          -47.07386310181414
                      ]
                  },
                  "properties": {}
              }
          ]
      },
      "status": 2,
      "mappedOn": "2022-11-18T17:26:26.211-05:00",
      "completedTimeSpent": 8786,
      "completedBy": 1,
      "review": {
          "reviewStatus": 2,
          "reviewRequestedBy": 1,
          "reviewedBy": 4,
          "reviewedAt": "2022-11-18T17:27:10.435-05:00",
          "reviewStartedAt": "2022-11-18T17:26:56.818-05:00"
      },
      "priority": 0,
      "changesetId": -1,
      "errorTags": "1,3",
      "reviewStatus": 2,
      "reviewRequestedBy": {
          "username": "Tester",
          "id": 1
      },
      "reviewedBy": {
          "username": "Tester2",
          "id": 4
      },
      "reviewedAt": "2022-11-18T17:27:10.435-05:00",
      "reviewStartedAt": "2022-11-18T17:26:56.818-05:00",
      "tags": [
          {
              "id": 5,
              "name": "",
              "description": "",
              "created": "2022-12-11T17:44:11.018-05:00",
              "modified": "2022-12-11T17:44:11.018-05:00",
              "tagType": "review"
          }
      ]
  },
  {
      "id": 530026,
      "name": "6b20aa28-8dc9-4893-994e-2cbde625bfdd",
      "created": "2022-11-02T20:58:36.225-05:00",
      "modified": "2022-11-29T13:11:17.481-05:00",
      "parent": {
          "id": 31,
          "name": "alskdjfalsdjfa ioweiru",
          "status": 3,
          "parent": {
              "id": 4,
              "name": "bar",
              "displayName": "bar"
          }
      },
      "instruction": "",
      "location": {
          "type": "Point",
          "coordinates": [
              139.893035888672,
              35.0277472948706
          ]
      },
      "geometries": {
          "type": "FeatureCollection",
          "features": [
              {
                  "id": "6b20aa28-8dc9-4893-994e-2cbde625bfdd",
                  "type": "Feature",
                  "geometry": {
                      "type": "Point",
                      "coordinates": [
                          139.89303588867188,
                          35.02774729487063
                      ]
                  },
                  "properties": {}
              }
          ]
      },
      "status": 2,
      "mappedOn": "2022-11-18T17:36:54.489-05:00",
      "completedTimeSpent": 7761,
      "completedBy": 1,
      "review": {
          "reviewStatus": 2,
          "reviewRequestedBy": 1,
          "reviewedBy": 4,
          "reviewedAt": "2022-11-18T17:37:12.369-05:00",
          "reviewStartedAt": "2022-11-18T17:37:04.481-05:00"
      },
      "priority": 0,
      "changesetId": -1,
      "errorTags": "1",
      "reviewStatus": 2,
      "reviewRequestedBy": {
          "username": "Tester",
          "id": 1
      },
      "reviewedBy": {
          "username": "Tester2",
          "id": 4
      },
      "reviewedAt": "2022-11-18T17:37:12.369-05:00",
      "reviewStartedAt": "2022-11-18T17:37:04.481-05:00",
      "tags": [
          {
              "id": 5,
              "name": "",
              "description": "",
              "created": "2022-12-11T17:44:11.018-05:00",
              "modified": "2022-12-11T17:44:11.018-05:00",
              "tagType": "review"
          }
      ]
  },
  {
      "id": 531562,
      "name": "310220917",
      "created": "2022-11-26T15:36:26.351-05:00",
      "modified": "2022-12-10T14:03:35.635-05:00",
      "parent": {
          "id": 56,
          "name": "test chall 101",
          "status": 3,
          "parent": {
              "id": 10,
              "name": "a_cool_project",
              "displayName": "a cool project"
          }
      },
      "instruction": "",
      "location": {
          "type": "Point",
          "coordinates": [
              6.7471782,
              51.2314547
          ]
      },
      "geometries": {
          "type": "FeatureCollection",
          "features": [
              {
                  "id": "310220917",
                  "type": "Feature",
                  "geometry": {
                      "type": "Point",
                      "coordinates": [
                          6.7471782,
                          51.2314547
                      ]
                  },
                  "properties": {
                      "bin": "yes",
                      "lit": "yes",
                      "ref": "4",
                      "area": "yes",
                      "name": "Belsenplatz",
                      "note": "Bussteig 4 (836. 835, M3)",
                      "bench": "yes",
                      "osmid": "310220917",
                      "covered": "yes",
                      "highway": "platform",
                      "network": "VRR",
                      "shelter": "no",
                      "operator": "Rheinbahn AG",
                      "ref:IFOPT": "de:05111:18273:2:4",
                      "tactile_paving": "no",
                      "lit_by_gaslight": "no",
                      "public_transport": "platform",
                      "operator:wikidata": "Q316236"
                  }
              }
          ]
      },
      "status": 2,
      "mappedOn": "2022-12-10T14:03:35.635-05:00",
      "completedTimeSpent": 11776,
      "completedBy": 1,
      "review": {
          "reviewStatus": 2,
          "reviewRequestedBy": 1,
          "reviewedBy": 4,
          "reviewedAt": "2022-12-10T14:03:55.139-05:00",
          "reviewStartedAt": "2022-12-10T14:03:05.724-05:00"
      },
      "priority": 0,
      "changesetId": -1,
      "errorTags": "",
      "reviewStatus": 2,
      "reviewRequestedBy": {
          "username": "Tester",
          "id": 1
      },
      "reviewedBy": {
          "username": "Tester2",
          "id": 4
      },
      "reviewedAt": "2022-12-10T14:03:55.139-05:00",
      "reviewStartedAt": "2022-12-10T14:03:05.724-05:00",
      "tags": [
          {
              "id": 5,
              "name": "",
              "description": "",
              "created": "2022-12-11T17:44:11.018-05:00",
              "modified": "2022-12-11T17:44:11.018-05:00",
              "tagType": "review"
          }
      ]
  },
  {
      "id": 531589,
      "name": "fddd635a-50b4-494f-88b0-249fd349c7dd",
      "created": "2022-11-29T11:06:52.399-05:00",
      "modified": "2022-12-10T14:04:28.428-05:00",
      "parent": {
          "id": 30,
          "name": "challenge 1",
          "status": 3,
          "parent": {
              "id": 4,
              "name": "bar",
              "displayName": "bar"
          }
      },
      "instruction": "",
      "location": {
          "type": "Point",
          "coordinates": [
              167.577209472656,
              -47.207441281905
          ]
      },
      "geometries": {
          "type": "FeatureCollection",
          "features": [
              {
                  "id": "fddd635a-50b4-494f-88b0-249fd349c7dd",
                  "type": "Feature",
                  "geometry": {
                      "type": "Point",
                      "coordinates": [
                          167.57720947265625,
                          -47.20744128190499
                      ]
                  },
                  "properties": {}
              }
          ]
      },
      "status": 2,
      "mappedOn": "2022-12-10T14:04:28.428-05:00",
      "completedTimeSpent": 6861,
      "completedBy": 1,
      "review": {
          "reviewStatus": 2,
          "reviewRequestedBy": 1,
          "reviewedBy": 4,
          "reviewedAt": "2022-12-10T14:04:39.574-05:00",
          "reviewStartedAt": "2022-12-10T14:04:34.503-05:00"
      },
      "priority": 0,
      "changesetId": -1,
      "errorTags": "",
      "reviewStatus": 2,
      "reviewRequestedBy": {
          "username": "Tester",
          "id": 1
      },
      "reviewedBy": {
          "username": "Tester2",
          "id": 4
      },
      "reviewedAt": "2022-12-10T14:04:39.574-05:00",
      "reviewStartedAt": "2022-12-10T14:04:34.503-05:00",
      "tags": [
          {
              "id": 5,
              "name": "",
              "description": "",
              "created": "2022-12-11T17:44:11.019-05:00",
              "modified": "2022-12-11T17:44:11.019-05:00",
              "tagType": "review"
          }
      ]
  }
]

describe("TaskReviewTable", () => {
  it("renders My Mapped Tasks after Review", () => {
    const { getByText } = global.withProvider(
      <TaskReviewTable
        location={{ search: "" }}
        intl={{
          formatMessage: () => null,
          formatDate: () => ""
        }}
        isActive
        resetColumnChoices={() => null}
      />
    );
    const text = getByText("My Mapped Tasks after Review");
    expect(text).toBeInTheDocument();
  });
});

describe("setupColumnTypes", () => {
  it("renders a tag with the name test-tag", () => {
    const columns = setupColumnTypes({ intl: { formatMessage: () => null } })
    const Cell = columns.tags.Cell;

    const { getByText } = render(
      <Cell
        row={{
          _original: { 
            tags: [{
              "id": 5,
              "name": "test-tag",
              "description": "",
              "created": "2022-12-11T17:44:11.019-05:00",
              "modified": "2022-12-11T17:44:11.019-05:00",
              "tagType": "review"
          }]}
        }}
      />
    )

    const text = getByText("test-tag");
    expect(text).toBeInTheDocument();
  });
});

describe("getChallengeFilterIds", () => {
  it("finds and returns and array of challenge ids in the url", () => {
    const challengeIds = getFilterIds('http://127.0.0.1:3000/review/myReviewedTasks?filters.challenge=alskdjfalsdjfa+ioweiru&filters.challengeId=30%2C31&sortCriteria.sortBy=mappedOn&sortCriteria.direction=ASC&page=0&includeTags=true&excludeOtherReviewers=true&pageSize=20', 'filters.challengeId');
    expect(challengeIds[0]).toBe(30);
  });

  it("returns [-2] if there's no challenge ids", () => {
    const challengeIds = getFilterIds('http://127.0.0.1:3000/review/myReviewedTasks?sortCriteria.sortBy=mappedOn&sortCriteria.direction=ASC&page=0&includeTags=true&excludeOtherReviewers=true&pageSize=20', 'filters.challengeId');
    expect(challengeIds[0]).toBe(-2);
  });
});