const { exec } = require('child_process');

console.log('Pushing schema to database...');
exec('npx prisma db push', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Stderr: ${stderr}`);
    }
    console.log(`Stdout: ${stdout}`);
});
