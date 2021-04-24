const aws = require('aws-sdk');
const axios = require('axios');
const { Readable, PassThrough, Transform } = require('stream');
const s3 = new aws.S3({ region: 'ap-northeast-1' });

async function main() {
  const response = await axios.get(
    'https://jsonplaceholder.typicode.com/posts'
  );
  const readable = Readable.from(response.data);
  const { writeStream, promise } = (function () {
    const pass = new PassThrough();
    return {
      writeStream: pass,
      promise: s3
        .upload({
          Bucket: 'hi1280-example',
          Key: 'data.json',
          Body: pass,
        })
        .promise(),
    };
  })();
  const transform = new Transform({
    transform(chunk, _, done) {
      this.push(JSON.stringify(chunk) + '\n');
      done();
    },
    objectMode: true,
  });
  readable.pipe(transform).pipe(writeStream);
  await promise;
}

main();
