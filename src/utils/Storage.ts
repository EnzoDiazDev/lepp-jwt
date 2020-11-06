import User from "./User";

interface Storage {
    save_user:(user:User) => Promise<void>
    get_user_by_name:(username:string) => Promise<User>
    get_user_by_id?:(id:number) => Promise<User>
    get_next_id:() => Promise<number>
    update_user_token:(id:number, token:string) => Promise<void>
}

export default Storage;
