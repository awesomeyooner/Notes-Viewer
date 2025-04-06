import * as fs from 'fs';
import * as path from 'path';

export class FileManager{
    file: string;

    constructor(){
        this.file = "";
    }   

    public getFile(): string{
        return this.file;
    }

    public async loadFile(path : string){
        try{
            const data = await fs.promises.readFile(path, 'utf8');
            
            this.file = data;
        }
        catch(error: any){
            console.log("Failed to load file!");
        }
    }
}