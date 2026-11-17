const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '=======================================================');
console.log('\x1b[36m%s\x1b[0m', '   Starting TheCarePal Visit Feedback & Dashboard     ');
console.log('\x1b[36m%s\x1b[0m', '=======================================================');

const server = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '../server'),
  stdio: 'inherit',
  shell: true
});

const client = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '../client'),
  stdio: 'inherit',
  shell: true
});

const cleanExit = () => {
  server.kill('SIGINT');
  client.kill('SIGINT');
  process.exit();
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
