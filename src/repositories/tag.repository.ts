import {Repositories} from 'node-library';
import {Tag} from '../models';

class TagRepository extends Repositories.BaseRepository {
    constructor(){
        super(Tag);
    }

    createTags = async(tags:string[]) => {
        console.log('createTags',tags);
        let docs = await this.model.find({tag:{$in:tags}});
        for (const doc of docs) {
            console.log(doc.tag,tags);
            tags = tags.filter(t=>doc.tag!==t);
        }
        docs = [];
        for (const tag of tags) {
            docs.push({
                tag,
                queries:[]
            })
        }
        try {
            await this.model.insertMany(docs);
        } catch (error) {
            console.log(error);
        }
    }

    addQueryToTags = async(queryId:string,tags:string[]) => {
        console.log('addQueryToTags',queryId,tags);
        await this.model.updateMany({ "tag": {$in:tags}},
        {
            //@ts-ignore
            $push:{
                "queries":queryId
            },
            "$inc":{
                //@ts-ignore
                "count":1
            },
            "lastModifiedAt":Date.now()
        });
    }
    removeQueryFromTags = async(queryId:string) => {
        console.log('removeQueryFromTags',queryId);
        await this.model.updateMany({ "queries":queryId },
        { 
            //@ts-ignore
            $pull:{
                "queries":queryId
            },
            "$inc":{
                //@ts-ignore
                "count":-1
            },
            "lastModifiedAt":Date.now()
        });
    }
}

export default TagRepository;