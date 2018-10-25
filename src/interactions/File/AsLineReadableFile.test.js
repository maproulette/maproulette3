import AsLineReadableFile from './AsLineReadableFile'

const threeLines = "abc\ndef\nghi"

describe('loadChunk', () => {
  it("it reads a chunk from the file and appends to the buffer", async () => {
    const threeLineFile = AsLineReadableFile(new Blob([threeLines]))
    await threeLineFile.loadChunk()
    expect(threeLineFile.buffer).toEqual(threeLines)
    expect(threeLineFile.eof).toBeTruthy()
  })

  it("it honors the chunkSize option", async () => {
    const threeLineFile = AsLineReadableFile(new Blob([threeLines]), {chunkSize: 2})
    await threeLineFile.loadChunk()
    expect(threeLineFile.buffer).toEqual("ab")
    expect(threeLineFile.eof).toBeFalsy()
  })

  it("appends a chunk to the existing buffer", async () => {
    const threeLineFile = AsLineReadableFile(new Blob([threeLines]), {chunkSize: 2})
    await threeLineFile.loadChunk()
    await threeLineFile.loadChunk()
    await threeLineFile.loadChunk()
    expect(threeLineFile.buffer).toEqual("abc\nde")
    expect(threeLineFile.eof).toBeFalsy()
  })
})

describe('nextLine', () => {
  it("retrieves a single line at a time from the buffer", async () => {
    const threeLineFile = AsLineReadableFile(new Blob([threeLines]))
    threeLineFile.buffer = threeLines

    await threeLineFile.nextLine().then(line => expect(line).toEqual("abc"))
    await threeLineFile.nextLine().then(line => expect(line).toEqual("def"))
  })

  it("resolves with null after all lines have been read", async () => {
    const threeLineFile = AsLineReadableFile(new Blob([threeLines]))

    await threeLineFile.nextLine().then(line => expect(line).toEqual("abc"))
    await threeLineFile.nextLine().then(line => expect(line).toEqual("def"))
    await threeLineFile.nextLine().then(line => expect(line).toEqual("ghi"))
    await threeLineFile.nextLine().then(line => expect(line).toBeNull())
    await threeLineFile.nextLine().then(line => expect(line).toBeNull())
  })

  it("loads chunks as needed to retrieve complete lines", async () => {
    const threeLineFile = AsLineReadableFile(new Blob([threeLines]), {chunkSize: 1})

    await threeLineFile.nextLine().then(line => expect(line).toEqual("abc"))
    await threeLineFile.nextLine().then(line => expect(line).toEqual("def"))
    await threeLineFile.nextLine().then(line => expect(line).toEqual("ghi"))
    await threeLineFile.nextLine().then(line => expect(line).toBeNull())
  })

  it("ignores a final newline at end of file", async () => {
    const threeLineFile = AsLineReadableFile(new Blob([threeLines + "\n"]))

    await threeLineFile.nextLine().then(line => expect(line).toEqual("abc"))
    await threeLineFile.nextLine().then(line => expect(line).toEqual("def"))
    await threeLineFile.nextLine().then(line => expect(line).toEqual("ghi"))
    await threeLineFile.nextLine().then(line => expect(line).toBeNull())
  })

  it("treats carriage returns as normal characters", async () => {
    const threeLineFile = AsLineReadableFile(new Blob(["abc\r\ndef"]))
    await threeLineFile.nextLine().then(line => expect(line).toEqual("abc\r"))
    await threeLineFile.nextLine().then(line => expect(line).toEqual("def"))
  })

  it("works with a chunk size that falls on a newline", async () => {
    const threeLineFile = AsLineReadableFile(new Blob([threeLines], {chunksize: 4}))

    await threeLineFile.nextLine().then(line => expect(line).toEqual("abc"))
    await threeLineFile.nextLine().then(line => expect(line).toEqual("def"))
    await threeLineFile.nextLine().then(line => expect(line).toEqual("ghi"))
    await threeLineFile.nextLine().then(line => expect(line).toBeNull())
  })

  it("works with a single line file", async () => {
    const threeLineFile = AsLineReadableFile(new Blob(["abc"]))

    await threeLineFile.nextLine().then(line => expect(line).toEqual("abc"))
    await threeLineFile.nextLine().then(line => expect(line).toBeNull())
  })
})

describe('readLines', () => {
  it("reads the given number of lines", async () => {
    const threeLineFile = AsLineReadableFile(new Blob([threeLines]))
    await threeLineFile.readLines(2).then(lines => {
      expect(lines.length).toBe(2)
      expect(lines[0]).toEqual("abc")
      expect(lines[1]).toEqual("def")
    })
  })

  it("can read the whole file", async () => {
    const threeLineFile = AsLineReadableFile(new Blob([threeLines]))
    await threeLineFile.readLines(5).then(lines => {
      expect(lines.length).toBe(5)
      expect(lines[0]).toEqual("abc")
      expect(lines[1]).toEqual("def")
      expect(lines[2]).toEqual("ghi")
      expect(lines[3]).toEqual(null)
      expect(lines[4]).toEqual(null)
    })
  })

  it("handles a file with just one line of text", async () => {
    const threeLineFile = AsLineReadableFile(new Blob(["abc"]))
    await threeLineFile.readLines(2).then(lines => {
      expect(lines.length).toBe(2)
      expect(lines[0]).toEqual("abc")
      expect(lines[1]).toEqual(null)
    })
  })
})

describe('forEach', () => {
  it("invokes callback for each bundle of lines", async () => {
    let allLines = []
    let callbackCount = 0
    const threeLineFile = AsLineReadableFile(new Blob([threeLines]))

    await threeLineFile.forEach(2, lines => {
      callbackCount++
      allLines = allLines.concat(lines)
    })

    expect(callbackCount).toBe(2)
    expect(allLines.length).toBe(4)
    expect(allLines[0]).toEqual("abc")
    expect(allLines[1]).toEqual("def")
    expect(allLines[2]).toEqual("ghi")
    expect(allLines[3]).toEqual(null)
  })
})

describe('rewind', () => {
  it("rewinds back to the beginning of the file", async () => {
    const threeLineFile = AsLineReadableFile(new Blob([threeLines]))

    await threeLineFile.nextLine().then(line => expect(line).toEqual("abc"))
    await threeLineFile.nextLine().then(line => expect(line).toEqual("def"))
    threeLineFile.rewind()
    await threeLineFile.nextLine().then(line => expect(line).toEqual("abc"))
    await threeLineFile.nextLine().then(line => expect(line).toEqual("def"))
  })

  it("can be called multiple times without issue", async () => {
    const threeLineFile = AsLineReadableFile(new Blob([threeLines]))

    threeLineFile.rewind()
    threeLineFile.rewind()
    threeLineFile.rewind()
    await threeLineFile.nextLine().then(line => expect(line).toEqual("abc"))
  })
});

describe('allLines', () => {
  it("reads all the lines from the file", async () => {
    const threeLineFile = AsLineReadableFile(new Blob([threeLines]))
    const lines = await threeLineFile.allLines()

    expect(lines.length).toBe(3)
    expect(lines[0]).toEqual("abc")
    expect(lines[1]).toEqual("def")
    expect(lines[2]).toEqual("ghi")
  })
})
