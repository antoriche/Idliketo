import os from 'os';

export const getShellTerminal = ()=>{
    const shell = os.platform() === 'win32' ? 'powershell' : 'bash';
    return shell
}