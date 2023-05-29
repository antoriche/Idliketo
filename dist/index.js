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
Object.defineProperty(exports, "__esModule", { value: true });
const shell_history_1 = require("shell-history");
const llm_1 = require("./llm");
console.log(process.argv);
// filter items after the one containing 'idliketo'
const command_arg = process.argv.filter((item) => item.includes('idliketo')).pop();
const command_index = command_arg ? process.argv.indexOf(command_arg) : 0;
const args = command_arg ? process.argv.filter((item, i) => i > command_index) : process.argv;
const user_request = args.join(' ');
console.log('shellHistory()', (0, shell_history_1.shellHistory)());
(() => __awaiter(void 0, void 0, void 0, function* () {
    const { command, improve } = yield (0, llm_1.getShellCommand)('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', user_request);
    console.log(command);
}));
