import {Response} from "express";
import User from "./User";
import Encrypt from "./Encrypt";

export default class Validate {
    public register(res:Response, body:User):boolean {
        const {username, password, repeat_password} = body;
        if(!username || password || repeat_password) {
            res.status(400).json({message: "you must fill all the fields"});
            return false;
        }

        if(password.length < 6){
            res.status(400).json({message: "The password must be longer than six characters"});
            return false;
        }

        if(password !== repeat_password) {
            res.status(400).json({message: "Passwords do not match"});
            return false;
        }

        return true;
    }

    public login(res:Response, body:User):boolean {
        const {username, password} = body;

        if(!username || password) {
            res.status(400).json({message: "you must fill all the fields"});
            return false;
        }

        if(password.length < 6){
            res.status(400).json({message: "The password must be longer than six characters"});
            return false;
        }

        return true;
    }

    public async password(res:Response, req_password:string, user_password:string):Promise<boolean> {
        const password_is_correct = await Encrypt.compare_password(req_password, user_password);
        if(!password_is_correct) {
            res.status(401).json({message: "Wrong password"});
            return false;
        }

        return true;
    }
}
