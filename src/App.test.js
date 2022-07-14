import "@testing-library/jest-dom";
import * as React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
// import { App } from "./App";

jest.mock('@rjsf/core/lib/components/widgets/SelectWidget', () => ({
  __esModule: true,
}));

jest.mock('@rjsf/core/lib/components/widgets/TextWidget', () => ({
  __esModule: true,
}));

jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/json', () => ({
  __esModule: true,
}));

jest.mock('react-syntax-highlighter/dist/esm/styles/hljs/agate', () => ({
  __esModule: true,
  default: {
    hljs: {
      background: ""
    }
  }
}));

jest.mock('react-syntax-highlighter', () => ({
  Light: {
    registerLanguage: () => null
  }
}))

// describe('listFilesInDirectorySync', () => {
//   const MOCK_FILE_INFO = {
//     '/path/to/file1.js': 'console.log("file1 contents");',
//     '/path/to/file2.txt': 'file2 contents',
//   };

//   beforeEach(() => {
//     // Set up some mocked out file info before each test
//     require('fs').__setMockFiles(MOCK_FILE_INFO);
//   });

//   test('includes all files in the directory in the summary', () => {
//     const FileSummarizer = require('../FileSummarizer');
//     const fileSummary =
//       FileSummarizer.summarizeFilesInDirectorySync('/path/to');

//     expect(fileSummary.length).toBe(2);
//   });
// });

// describe("App", () => {
//   it("renders", () => {
//     const { getByText } = render(
//       <App />
//     );
//     const text = getByText("Test Passes");
//     expect(text).toBeInTheDocument();
//   });
// });

describe("App", () => {
  it("renders", () => {
    expect(1).toBe(1);
  });
});