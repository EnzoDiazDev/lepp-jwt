import {decorators} from "@enzodiazdev/lepp";
import {Request, Response} from "express";
import JWT from "./utils/JWT";
import Encrypt from "./utils/Encrypt";
import Storage from "./utils/Storage";
import Validate from "./utils/Validate";
import User from "./utils/User";

const {Controller, Post} = decorators;

@Controller("/authentication")
export default class Authentication {
    private jwt:JWT
    private storage:Storage
    private validate:Validate

    constructor(storage:Storage, token:string){
        this.validate = new Validate();
        this.jwt = new JWT(token);
        this.storage = storage;
    }

    @Post("/register")
    public async register(req:Request, res:Response):Promise<void> {
        if(!req.body) {
            res.status(401).json({message: "You must send body data"});
            return;
        }
        const is_valid = this.validate.register(res, req.body);
        if(!is_valid) return;

        const user = await this.storage.get_user_by_name(req.body.username);
        if(user) {
            res.status(409).json({message: "The username has already been taken"});
            return;
        }

        const user_id = await this.storage.get_next_id();
        const encrypted_password = await Encrypt.encrypt_password(req.body.password);

        const user_token = this.jwt.sign({
            id: user_id,
            username: req.body.username,
            timestamp: Date.now()
        });

        const new_user = {
            id: user_id,
            username: req.body.username,
            password: encrypted_password,
            token: user_token
        };

        await this.storage.save_user(new_user);

        res.set("authorization", user_token)
            .status(201)
            .json({
                message: "The user has been created",
                data: {
                    token: user_token
                }
            });

        return;
    }

    @Post("/login")
    public async login(req:Request, res:Response):Promise<void>{
        if(!req.body) {
            res.status(401).json({message: "You must send body data"});
            return;
        }
        // //Check token
        // const token = req.headers["authorization"];
        // if(token){
        //     const token_is_valid = this.jwt.verify(token);
        //     if(token_is_valid){
        //         //..
        //     }
        // }
        const req_user:User = req.body;

        const login_is_valid = this.validate.login(res, req_user);
        if(!login_is_valid) return;

        const user = await this.storage.get_user_by_name(req_user.username);
        if(!user) {
            res.status(404).json({message: "This user does not exist"});
            return;
        }

        const password_is_correct = await this.validate.password(res, req_user.password, user.password);
        if(!password_is_correct) return;

        const new_token = this.jwt.sign({
            id: user.id,
            username: user.username,
            timestamp: Date.now()
        });

        await this.storage.update_user_token(user.id, new_token);

        res.set("authorization", new_token)
            .status(201)
            .json({
                message: "Login successful",
                data: {
                    token: new_token
                }
            });

        return;
    }
}
