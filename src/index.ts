import { getOpenAIApiKey } from './apiKey';
import { shellHistory } from './shell-history';
import { getShellCommand } from './llm';
import { input } from './cli';
import { spawn } from "child_process";

// filter items after the one containing 'idliketo'
const command_arg = process.argv.filter((item) => item.includes('idliketo')).pop()
const command_index = command_arg ? process.argv.indexOf(command_arg) : 0
const args = command_arg ? process.argv.filter((item,i) => i > command_index) : process.argv

const user_request = args.join(' ');

// console.log('shellHistory()', shellHistory());

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
            console.log('Executing command')
            const [cmd, ...args] = command!.split(' ');

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
            
            break;
        } else {
            command = await improve(feedback)
        }
    }
})()
