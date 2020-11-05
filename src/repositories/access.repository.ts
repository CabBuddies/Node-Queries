import {Repositories} from 'node-library';
import * as mongoose from 'mongoose';
import Access from '../models/access.model';

class AccessRepository extends Repositories.AuthorRepository {
    constructor(){
        super(Access);
    }

    getAccessDocument = async(entityId:string,author:string) => {
        return await this.model.findOne({_id:entityId,author});
    }

    // updateStat = async(entityId,property:string,increase:boolean) => {
    //     const query = {}
    //     query["stats."+property] = increase ? 1 : -1;
    //     return await this.model.findOneAndUpdate({ _id:entityId },{$inc:query},{new:true})
    // }

    // addUser = async(entityId:string,userId:string) => {
    //     return await this.model.findOneAndUpdate({_id:entityId},{
    //         //@ts-ignore
    //         $push:{
    //             "access.users":userId
    //         }
    //     },{new:true});
    // }

    // removeUser = async(entityId:string,userId:string) => {
    //     return await this.model.findOneAndUpdate({_id:entityId},{
    //         //@ts-ignore
    //         $pullAll:{
    //             "access.users":userId
    //         }
    //     },{new:true});
    // }
}

export default AccessRepository;