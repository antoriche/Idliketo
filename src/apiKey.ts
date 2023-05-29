import { testApiKey } from './llm';
import os from 'os';
import fs from 'fs';
import dotenv from 'dotenv';
import { input } from './cli';

async function askUserForApiKey(): Promise<string> {
    console.log('Please enter your OpenAI API key');
    console.log('Visit https://platform.openai.com/account/api-keys to get one');
    let apiKey = await input('API key : ');
    let checkOk:boolean = false
    while(!checkOk){
        checkOk = await testApiKey(apiKey)
        if(!checkOk){
            console.log('The API key you entered seems not valid, please try again');
            apiKey = await input('API key : ');
        }
    }
    return apiKey;
}

let apikey = "";


export const clearOpenAIApiKey = async (): Promise<void> => {
    const apiKeyPath = os.homedir() + '/.idliketo';
    apikey = "";
    if (fs.existsSync(apiKeyPath)) {
        const file_content = fs.existsSync(apiKeyPath) ? fs.readFileSync(apiKeyPath, 'utf8') : '';
        const env = dotenv.parse(file_content)
        env.OPENAI_API_KEY = apikey
        const newEnv = Object.entries(env).map(([key, value]) => `${key}=${value}`).join('\n')
        fs.writeFileSync(apiKeyPath, newEnv);
    }
}



export const getOpenAIApiKey = async (): Promise<string> => {
    if (apikey) {
        return apikey;
    }
    const apiKeyPath = os.homedir() + '/.idliketo';

    if (fs.existsSync(apiKeyPath)) {
        const file_content = fs.readFileSync(apiKeyPath, 'utf8');
        apikey = dotenv.parse(file_content).OPENAI_API_KEY;
    }
    
    if (!apikey){
        apikey = await askUserForApiKey();
        const file_content = fs.existsSync(apiKeyPath) ? fs.readFileSync(apiKeyPath, 'utf8') : '';
        const env = dotenv.parse(file_content)
        env.OPENAI_API_KEY = apikey
        const newEnv = Object.entries(env).map(([key, value]) => `${key}=${value}`).join('\n')
        fs.writeFileSync(apiKeyPath, newEnv);
    }
    
    return apikey;
}