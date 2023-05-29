
import readline from 'readline'

const cli = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

export function input(question?:string):Promise<string>{
    return new Promise((resolve, reject)=>{
        cli.question(question||"", (answer:string) => {
            resolve(answer)
        })
    })
}