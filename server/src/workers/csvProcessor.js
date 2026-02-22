const { parentPort } = require('worker_threads');
const fs = require('fs');
const csvParse = require('csv-parse');

// Worker thread for processing CSV file
parentPort.on('message', async (message) => {
  try {
    const { filePath } = message;
    
    // Read and parse CSV file
    const records = [];
    const parser = fs.createReadStream(filePath)
      .pipe(csvParse.parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      }));

    parser.on('readable', function() {
      let record;
      while (record = parser.read()) {
        records.push(record);
      }
    });

    parser.on('end', function() {
      parentPort.postMessage({
        status: 'success',
        data: records,
        count: records.length
      });
    });

    parser.on('error', (error) => {
      parentPort.postMessage({
        status: 'error',
        error: error.message
      });
    });

  } catch (error) {
    parentPort.postMessage({
      status: 'error',
      error: error.message
    });
  }
});
