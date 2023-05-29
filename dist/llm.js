"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShellCommand = void 0;
const openai_1 = require("openai");
const os_1 = __importDefault(require("os"));
const shell_history_1 = require("shell-history");
const SYSTEM = `
CPU architecture: ${os_1.default.arch()}
CPU endianness: ${os_1.default.endianness()}
Operating system: ${os_1.default.platform()}
Operating system release: ${os_1.default.release()}
Operating system type: ${os_1.default.type()}
Operating system version: ${os_1.default.version()}

Username: ${os_1.default.userInfo().username}
Shell: ${os_1.default.userInfo().shell}
Home directory: ${os_1.default.userInfo().homedir}

Current directory: ${process.cwd()}
`;
const getShellCommand = (apiKey, description) => __awaiter(void 0, void 0, void 0, function* () {
    const configuration = new openai_1.Configuration({
        apiKey
    });
    const openai = new openai_1.OpenAIApi(configuration);
    const conversation = [
        {
            role: openai_1.ChatCompletionResponseMessageRoleEnum.System,
            content: `You are ShellGPT, your responsability is to translate the user requirement into a shell command.`
        },
        {
            role: openai_1.ChatCompletionResponseMessageRoleEnum.System,
            content: `Here are some information about the system : ${SYSTEM}`
        },
        {
            role: openai_1.ChatCompletionResponseMessageRoleEnum.System,
            content: `Here is the user shell history : ${(0, shell_history_1.shellHistory)()}`
        },
        {
            role: openai_1.ChatCompletionResponseMessageRoleEnum.System,
            content: "Don't provide any extra explainations. Provide only the command on a single line between triple-quotes (```). If the request is not clear, try doing your best. This apply to all your responses."
        },
        {
            role: openai_1.ChatCompletionResponseMessageRoleEnum.System,
            content: 'For instance, if the user says "I would like to list all the files in the current directory", you should respond with "```\nls -l\n```".'
        },
        {
            role: openai_1.ChatCompletionResponseMessageRoleEnum.User,
            content: `I would like to ${description}`
        },
    ];
    function improve(improve_message) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            if (improve_message) {
                conversation.push({
                    role: openai_1.ChatCompletionResponseMessageRoleEnum.User,
                    content: `Improve this command based on this feedback : "${improve_message}"`
                });
            }
            const completion = yield openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                temperature: 0,
                //stop: ["```", "\n"],
                messages: conversation
            });
            const assistant_output = (_b = (_a = completion.data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
            assistant_output && conversation.push({
                role: openai_1.ChatCompletionResponseMessageRoleEnum.Assistant,
                content: assistant_output
            });
            console.log('description', description);
            console.log('assistant_output', assistant_output);
            const command = (_c = assistant_output === null || assistant_output === void 0 ? void 0 : assistant_output.split("```")[1]) === null || _c === void 0 ? void 0 : _c.split("```")[0].replace(/\n/g, '');
            if (!command)
                throw new Error(assistant_output || 'No output from GPT-3');
            return command;
        });
    }
    const command = yield improve();
    return {
        command: command,
        improve: improve
    };
});
exports.getShellCommand = getShellCommand;
