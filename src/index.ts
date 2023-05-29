import { getOpenAIApiKey, clearOpenAIApiKey } from './apiKey';
import { getShellCommand } from './llm';
import { input } from './cli';
import { spawn, exec, execSync } from "child_process";
import { getShellTerminal } from './shell';

const command_arg = process.argv.filter((item) => item.includes('idliketo')).pop()
const command_index = command_arg ? process.argv.indexOf(command_arg) : 0
const args = command_arg ? process.argv.filter((item,i) => i > command_index) : process.argv
const user_request = args.join(' ');




if (!args?.length || process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage : idliketo <your request>')
    console.log('eg. idliketo list files in the current directory')
    console.log('Special commands :')
    console.log('\t--help, -h : display this help')
    console.log('\t--version, -v : display the version')
    console.log('\t--clear-api-key : clear the OpenAI API key')
    process.exit(0)
}
if (process.argv.includes('--version') || process.argv.includes('-v')) {
    const packageJson = require('../package.json')
    console.log(packageJson.version)
    process.exit(0)
}
if (process.argv.includes('--clear-api-key')) {
    clearOpenAIApiKey()
    process.exit(0)
}




(async () => {
const apiKey = await getOpenAIApiKey()
let {command, improve } = await getShellCommand(apiKey, user_request).catch(err=>{
    console.error('\x1b[0;31m','Retrieving command faild with error :',err.message,'\x1b[0m')
    process.exit(1)
})
while(true){
    console.log('Here is the command you are looking for')
    console.log('\t\x1b[36m'+command+'\x1b[0m')
    console.log('Enter y to execute or write a feedback to improve')
    const feedback = await input()
    if(feedback === 'y'){
        /*const [cmd, ...args] = command!.split(' ');

        const child_process = spawn(cmd, args);

        child_process.stdout.on('data', (data) => {
            console.log(data.toString());
        });
            
        child_process.stderr.on('data', (data) => {
            console.error(data.toString());
        });
            
        child_process.on('close', (code) => {
            process.exit(code ||0);
        });
        
        break;*/
        const child_process = exec(command!, {
            shell: getShellTerminal(),
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(error.message);
                process.exit(1);
            }
            console.error(stderr);
            console.log(stdout);
            process.exit(0);
        });
        await new Promise(resolve => {
            child_process.on('exit', (code) => {
                resolve(code);
            });
        });
    } else {
        command = await improve(feedback)
    }
}
})()
