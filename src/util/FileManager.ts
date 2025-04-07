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

    public static async readFile(path : string) : Promise<string>{
        try{
            const data = await fs.promises.readFile(path, 'utf8');
            
            return data;
        }
        catch(error: any){
            console.log(error);
            return "";
        }
    }

    public static async writeFile(data : string, path : string){
        try{
            await fs.promises.writeFile(path, data);
        }
        catch(error: any){
            console.log(error);
        }
    }

    public static async deleteFile(path : string){
        try{
            await fs.promises.rm(path);
        }
        catch(error){
            console.log(error);
        }
    }
}