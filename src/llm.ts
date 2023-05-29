import {
    Configuration,
    OpenAIApi,
    CreateChatCompletionRequest,
    ChatCompletionRequestMessage,
    ChatCompletionResponseMessageRoleEnum
  } from "openai";
import os from 'os';
import { input } from "./cli";
//import {shellHistory} from 'shell-history';

const SYSTEM = `
CPU architecture: ${os.arch()}
CPU endianness: ${os.endianness()}
Operating system: ${os.platform()}
Operating system release: ${os.release()}
Operating system type: ${os.type()}
Operating system version: ${os.version()}

Username: ${os.userInfo().username}
Home directory: ${os.userInfo().homedir}

Current directory: ${process.cwd()}
`

export const testApiKey = async (apiKey: string): Promise<boolean> => {
  const openai = new OpenAIApi(new Configuration({
    apiKey
  }));
  return await openai.createCompletion({
    model: "ada",
    prompt: 'This is a test, say "OK" : ',
    temperature: 0,
    max_tokens: 5,
    stop: ["\n"]
  }).then(_ =>{
    return true
  }).catch(err => {
    console.error(err)
    return false
  });
}

export const getShellCommand = async (
  apiKey: string,
  description: string,
): Promise<{
  command: string | undefined;
  improve: (improve_message?: string) => Promise<string | undefined>;
}> => {
    const configuration = new Configuration({
      apiKey
    });
    const openai = new OpenAIApi(configuration);

    const conversation:ChatCompletionRequestMessage[] = [
      {
        role: ChatCompletionResponseMessageRoleEnum.System,
        content: `You are ShellGPT, your responsability is to translate the user requirement into a valid shell command. /bin/sh is the only available shell.`
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.System,
        content: `Here are some information about the system : ${SYSTEM}`
      },
      /*{
        role: ChatCompletionResponseMessageRoleEnum.System,
        content: `Here is the user shell history : ${shellHistory()}`
      },*/
      {
        role: ChatCompletionResponseMessageRoleEnum.System,
        content: "Don't provide any extra explainations. Provide only the command on a single line between triple-quotes (```). If the request is not clear, try doing your best. This apply to all your responses."
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.System,
        content: 'For instance, if the user says "I would like to list all the files in the current directory", you should respond with "```\nls -l\n```".'
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.System,
        content: 'Your output should be a valid shell command and should fit on a single line.'
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.User,
        content: `I would like to ${description}`
      },
    ]

    async function improve(improve_message?: string):Promise<string> {
      if (improve_message) {
        conversation.push({
          role: ChatCompletionResponseMessageRoleEnum.User,
          content: `Improve this command based on this feedback : "${improve_message}"`
        })
      }
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0,
        //stop: ["```", "\n"],
        messages: conversation
      });
      const assistant_output = completion.data.choices[0]?.message?.content 
      assistant_output && conversation.push({
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content: assistant_output 
      })
      const command = assistant_output?.split("```")[1]?.split("```")[0].split('\n').filter(line => line.trim().length > 0).join(';')
      if(!command){
        // TODO: move this logic outside llm module
        console.error('\t\x1b[0;31m',assistant_output,'\x1b[0m')
        console.log('Thanks to clarify your request')
        const newPrompt = await input()
        return await improve(newPrompt)
      }
      return command
    }
  
    const command = await improve()
    return {
      command: command,
      improve: improve
    }
  };
  