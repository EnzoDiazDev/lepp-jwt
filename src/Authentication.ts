import {decorators} from "@enzodiazdev/lepp";
import {Request, Response} from "express";
import JWT from "./utils/JWT";
import Encrypt from "./utils/Encrypt";

const {Controller, Post} = decorators;

@Controller("/authentication")
export default class Authentication {
    private jwt:JWT

    constructor(_token:string){
        this.jwt = new JWT(_token);
    }

    /**
     * @abstract
     */
    public save_user(user:unknown):Promise<void> {
        throw new Error("save_user method must be implemented");
    }

    /**
     * @abstract
     */
    public get_user_by_name(username:string):Promise<unknown> {
        throw new Error("get_user_by method must be implemented");
    }

    /**
     * @abstract
     */
    public get_next_id():Promise<number> {
        throw new Error("get_next_id method must be implemented");
    }

    private register_validation(res:Response, body:any):boolean {
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

    private login_validation(res:Response, body:any):boolean {
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

    @Post("/register")
    public async register(req:Request, res:Response):Promise<void> {
        const is_valid = this.register_validation(res, req.body);
        if(!is_valid) return;

        const user = await this.get_user_by_name(req.body.username);
        if(user) {
            res.status(409).json({message: "The username has already been taken"});
            return;
        }

        const user_id = await this.get_next_id();
        const encrypted_password = await Encrypt.encrypt_password(req.body.password);

        const user_token = this.jwt.sign({
            id: user_id,
            name: req.body.username,
            timestamp: Date.now()
        });

        const new_user = {
            id: user_id,
            username: req.body.username,
            password: encrypted_password,
            token: user_token
        };

        await this.save_user(new_user);

        res.status(201).json({
            message: "The user has been created",
            data: {
                token: user_token
            }
        });

        return;
    }

    @Post("/login")
    public async login(req:Request, res:Response):Promise<void>{
        const is_valid = this.login_validation(res, req.body);
        if(!is_valid) return;

        const user = await this.get_user_by_name(req.body.username) as any;
        if(user) {
            const password_is_correct = Encrypt.compare_password(req.body.password, user.password);
            if(!password_is_correct) {
                res.status(401).json({message: "Wrong password"});
                return;
            }


        } else {
            res.status(404).json({message: "This user does not exist"});
            return;
        }
    }
}
