const DEFAULT_CHUNK_SIZE = 1024 * 1024 // 1 MB

/**
 * AsLineReadableFile wraps a given File and provides methods for reading
 * text content line by line
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class AsLineReadableFile {
  constructor(file, options={}) {
    Object.assign(this, {file, chunkSize: DEFAULT_CHUNK_SIZE}, options)
    this.filePos = 0
    this.buffer = ''
    this.eof = false
    this.chunkReader = new FileReader()
  }

  /**
   * Rewind back to beginning of file
   */
  rewind() {
    this.buffer = ''
    this.filePos = 0
    this.eof = false
  }

  /**
   * Load the next chunk of text from the file into the buffer
   *
   * @private
   */
  loadChunk() {
    return new Promise((resolve, reject) => {
      const nextChunk = this.file.slice(this.filePos, this.filePos + this.chunkSize)
      if (nextChunk.size < this.chunkSize) {
        this.eof = true
      }

      this.chunkReader.onloadend = () => {
        this.buffer = this.buffer + this.chunkReader.result
        this.filePos += this.chunkSize
        resolve(this.buffer)
      }
      this.chunkReader.readAsText(nextChunk)
    })
  }

  /**
   * Read the next line of the file, returning a Promise that resolves to the
   * line content. This will automatically read chunks from the file as needed
   * until a newline is reached or the file content is exhausted
   */
  async nextLine() {
    if (this.eof && this.buffer.length === 0) {
      // Nothing left to read
      return null
    }

    let lineBreakIndex = this.buffer.indexOf('\n')
    while (lineBreakIndex === -1) {
      if (this.eof) {
        // Last line doesn't end in newline, use what remains
        const line = this.buffer
        this.buffer = ''
        return line
      }

      await this.loadChunk()
      lineBreakIndex = this.buffer.indexOf('\n')
    }

    const line = this.buffer.slice(0, lineBreakIndex)
    this.buffer = this.buffer.slice(lineBreakIndex + 1)

    return line
  }


  /**
   * Read the desired number of lines, returning a promise
   * that resolves to an array of the lines. If the given count exceeds the number
   * of lines remaining in the file, the remaining array elements will be filled
   * with null values
   */
  async readLines(count) {
    const lines = []
    for (let i = 0; i < count; i++) {
      lines.push(await this.nextLine())
    }
    return lines
  }

  /**
   * Read the whole file, invoking callback with each bundle of lineCount number of
   * lines. callback receives a single argument, which is an array of lines of
   * lineCount length. If the end of file is reached then the remaining of elements
   * of the array will be filled null values
   */
  async forEach(lineCount, callback) {
    let allLinesRead = false
    while (!allLinesRead) {
      const lines = await this.readLines(lineCount)
      allLinesRead = lines[lines.length - 1] === null
      callback(lines)
    }
  }

  /**
   * Reads all lines from the file into memory and returns them as an array
   */
  async allLines() {
    const lines = []
    let line = null

    do {
      line = await this.nextLine()
      if (line !== null) {
        lines.push(line)
      }
    } while (line !== null)

    return lines
  }
}

export default (file, options) => new AsLineReadableFile(file, options)
