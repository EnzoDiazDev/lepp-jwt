import {decorators} from "@enzodiazdev/lepp";
import {Request, Response} from "express";

const {Controller, Post} = decorators;

@Controller("/authentication")
export default class Authentication {
    /**
     * @abstract
     */
    public save_user(user:unknown):void {
        throw new Error("save_user method must be implemented");
    }

    /**
     * @abstract
     */
    public get_user_by(identificator:any):unknown {
        throw new Error("get_user_by method must be implemented");
    }

    @Post("/register")
    public register(req:Request, res:Response):void {
        const {username, password, repeat_password} = req.body;
        if(!username || password || repeat_password) {
            res.status(400).json({message: "you must fill all the fields"});
            return;
        }
    }
}
