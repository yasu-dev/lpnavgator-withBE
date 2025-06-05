const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 一時ディレクトリを作成
const tempDir = 'lambda-temp';
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true });
}
fs.mkdirSync(tempDir);

// 必要なファイルをコピー
console.log('Copying handlers...');
execSync(`xcopy /E /I src\\handlers ${tempDir}\\handlers`, { stdio: 'inherit' });

console.log('Copying lib...');
execSync(`xcopy /E /I src\\lib ${tempDir}\\lib`, { stdio: 'inherit' });

console.log('Copying node_modules...');
execSync(`xcopy /E /I node_modules ${tempDir}\\node_modules`, { stdio: 'inherit' });

// ZIPファイルを作成
console.log('Creating ZIP file...');
process.chdir(tempDir);
execSync('powershell -Command "Compress-Archive -Path * -DestinationPath ../lambda-functions.zip -Force"', { stdio: 'inherit' });
process.chdir('..');

console.log('Lambda deployment package created: lambda-functions.zip');
console.log('Cleaning up temporary directory...');
fs.rmSync(tempDir, { recursive: true });
console.log('Done!'); 