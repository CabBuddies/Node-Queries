var count = 600;
function idGenerator(){
    count += 1;
    return count;
}

class Server{
    map = {};
    constructor(){}
    
    post(requestBody){
        requestBody.id = idGenerator();
        this.map[requestBody.id] = requestBody;
        return this.get(requestBody.id);
    }

    get(requestEntityId){
        return JSON.parse(JSON.stringify(this.map[requestEntityId] || {}));
    }

    put(requestBody){
        this.map[requestBody.id] = requestBody
        return this.get(requestBody.id)
    }

    delete(requestEntityId){
        delete this.map[requestEntityId]
    }

}

var server = new Server();

class RESTObject{
    data;
    constructor(){
      this.data={
        id:idGenerator()
      }
    }
  
    create(){
      console.log('POST',JSON.stringify(this.data));
      this.data = server.post(this.data);
    }
  
    update(){
      console.log('PUT',JSON.stringify(this.data));
      this.data = server.put(this.data);
    }

    read(){
        console.log('GET',this.data.id);
        this.data = server.get(this.data.id);
    }

    delete(){
        console.log('DELETE',this.data.id)
        server.delete(this.data.id);
        this.data = {}
    }
  }

  class Comment extends RESTObject{

    constructor(queryId=0,responseId=0,body=''){
      super()
      this.data.queryId = queryId;
      this.data.responseId = responseId;
      this.data.body = body;
    }
  
    getId(){
      return this.data.id;
    }
  
    setId(id){
        this.data.id = id;
    }
  
    getBody(){
      return this.data.body;
    }
  
    setBody(body){
        this.data.body = body;
    }
  }

  class CommentCollection {
      data;
      constructor(){
          this.data = {
            query:{},
            pageSize:5,
            pageNum:1,
            resultSize:0,
            resultTotalSize:0,
            result:[]
          }
      }

      search(query){

      }
  }

  const commentCollection = new CommentCollection();

  commentCollection.search({
      'status':'published'
  });

  commentCollection.data.result;

  //CREATE

  let comment = new Comment(101,201,'Good Response');
  
  console.log('init',comment.getId(),comment.getBody());

  comment.create()

  console.log(comment);
  console.log(server);

  let commentId = comment.getId();

  //READ

  comment = new Comment();

  comment.setId(commentId);

  console.log('plain comment obj for read purpose',comment);

  comment.read();

  console.log('plain comment obj after read op',comment);

  //UPDATE

  comment.setBody('Great Response');

  console.log('comment obj before update op',comment);
  console.log('server obj before update op',server);

  comment.update();

  console.log('server obj after update op',server);
  console.log('comment obj after update op',comment);

  //DELETE

  comment.delete();

  console.log('server obj after delete op',server);
  console.log('comment obj after delete op',comment);

  comment.setId(commentId);

  comment.read();

  console.log('plain comment obj after read op',comment);
  
  ////////////////////////////////////////////////////////

  function normalizeJson(json){
    if(json instanceof Array)
      return json
    let data = {};
    const keys = Object.keys(json);
  
    if(keys.length===0)
        return json;

    for(const k of keys){
      if(json[k] instanceof Object){
        data[k] = normalizeJson(json[k])
      }else if(json[k] !== undefined){
        data[k] = json[k];
      }
    }
    return data;
}

function throwErrorMessage(message='Invalid Request Body',status=400){
    const error:any = {};
    error.status = status;
    error.message = message;
    throw error;
}

function typeCheck({name,data,type}){
  name = name||'{property}';
  let genericError = "Invalid "+name;
  if(!data){
      throwErrorMessage(genericError+": missing")
  }
  if(type === 'array'){
    if(data.constructor.name.toLowerCase() === 'array'){
      return data;
    }
    throwErrorMessage(genericError+": actual type:"+data.constructor.name+", expected type:array")
  }
  if(typeof data !== type){
      throwErrorMessage(genericError+": actual type:"+(typeof data)+", expected type:"+type)
  }
  return data;
}

function checkEqual(data,equal,genericError){
  if(equal){
      if(data === equal){
          return data;
      }else{
          throwErrorMessage(genericError+": actual value:"+data+", expected value:"+equal)
      }
    }
}

function checkAnyOf(data,anyOf,genericError){
  if(anyOf){
    if(anyOf.indexOf(data) !== -1){
      return data;
    }else{
      throwErrorMessage(genericError+": actual value:"+data+", expected value in:"+JSON.stringify(anyOf))
    }
  }
}

function checkMinMax(data,min,max,genericError){
    if(min && max){
        if(data >= min && data <= max){
            return data;
        }else{
            throwErrorMessage(genericError+": actual value:"+data+", expected range:["+min+","+max+"]")
        }
    }
    if(min){
        if(data >= min){
            return data;
        }else{
            throwErrorMessage(genericError+": actual value:"+data+", expected range:["+min+",]")
        }
    }
    if(max){
        if(data <= max){
            return data;
        }else{
            throwErrorMessage(genericError+": actual value:"+data+", expected range:[,"+max+"]")
        }
    }
}

function numberValidator({name,data,defaultValue,equal,min,max,anyOf}){
    //console.log('numberValidator',{name,data,equal,min,max,anyOf})
    name = name||'{property}';
    let genericError = "Invalid "+name;

    if(defaultValue){
      data = data || defaultValue;
    }

    if(isNaN(parseInt(data)))
      throwErrorMessage(genericError+"["+data+"] expected number type")

    data = parseInt(data);

    data = typeCheck({name,data,type:'number'});

    if(checkEqual(data,equal,genericError)){
      return data;
    }

    if(checkAnyOf(data,anyOf,genericError)){
      return data;
    }

    if(checkMinMax(data,min,max,genericError)){
      return data;
    }

    return data;
}

function stringValidate({name,data,defaultValue,min,max,size,regex,trim,lower,upper,equal,anyOf}){
    //console.log('stringValidate',{name,data,min,max,size,regex,trim,lower,upper,equal,anyOf})
    name = name||'{property}';
    let genericError = "Invalid "+name;

    if(defaultValue){
      data = data || defaultValue;
    }

    data = typeCheck({name,data,type:'string'});

    genericError += "["+data+"]";

    if(trim){
      data = data.trim();
    }

    if(lower){
      data = data.toLowerCase();
    }else if(upper){
      data = data.toUpperCase();
    }

    if(checkEqual(data,equal,genericError)){
      return data;
    }

    if(checkAnyOf(data,anyOf,genericError)){
      return data;
    }

    if(regex){
        if(new RegExp(regex).test(data)){
            return data;
        }else{
            throwErrorMessage(genericError+": regex does not match :/"+regex+"/");
        }
    }

    if(checkEqual(data.length,size,genericError)){
      return data;
    }
    
    if(checkMinMax(data.length,min,max,genericError)){
      return data;
    }

    return data;
}

function arrayValidate({name,data,array_defaultValue,array_item_type,array_min,array_max,array_size,array_unique,array_normalize,defaultValue,min,max,size,regex,trim,lower,upper,equal,anyOf}){
  
  name = name||'{property}';
  let genericError = "Invalid "+name;

  if(array_defaultValue){
    data = data || array_defaultValue;
  }

  data = typeCheck({name,data,type:'array'});

  genericError += "["+JSON.stringify(data)+"]";
  
  if(checkEqual(data.length,array_size,genericError)){

  }else if(checkMinMax(data.length,array_min,array_max,genericError)){

  }

  if(array_item_type){
    for(let i in data){
      data[i] = validateProperty({name,data:data[i],type:array_item_type,min,max,size,regex,trim,lower,upper,equal,anyOf,defaultValue})
    }
  }

  if(array_normalize){
    data = data.filter((value, index, self) => { 
        return value !== undefined && value !== null;
    });
  }

  if(array_unique){
    data = data.filter((value, index, self) => { 
        return self.indexOf(value) === index;
    });
  }

  return data;
}

function validateProperty(i){
  let result = '';
  switch(i.type){
    case 'array':
      result = arrayValidate(i);
      break;
    case 'number':
      result = numberValidator(i);
      break;
    case 'string':
    default:
      result = stringValidate(i);
  }
  return result;
}

function getValueFromJsonPath(input,path){
  let temp = input;
  for(const p of path.split('.')){
    if(p in temp === false){
      return undefined;
    }else{
      temp = temp[p]
    }
  }
  return temp;
}

function setValueByJsonPath(output,path,value){
  let temp = output;
  const pathParts = path.split('.');
  const ppp = pathParts.pop();
  for(const p of pathParts){
    if(p in temp === false){
      temp[p] = {};
    }
    temp = temp[p];
  }
  temp[ppp] = value;
}

function checkSchema(reqBody,schemas){
  const result = {};
  for(const schema of schemas){
    let value = getValueFromJsonPath(reqBody,schema.name);
    if(value === undefined){
      if(schema.optional === true){
        continue;
      }
    }
    schema.data = value;
    value = validateProperty(schema);
    setValueByJsonPath(result,schema.name,value);
  }
  return result;
}

const reqBody = {
  draft:{
    title:'dt',
    body:'db',
    tags:['d1','d2','d3']
  },
  published:{
    title:'pt',
    body:'pb'
  },
  hack:'malicious'
};
const schemas = [
  {
    name:'draft.title',
    type:'string',
    trim:true,
    defaultValue:'',
    optional:true
  },{
    name:'draft.body',
    type:'string',
    trim:true,
    defaultValue:'',
    optional:true
  },{
    name:'draft.tags',
    type:'array',
    array_defaultValue:[],
    array_unique:true,
    array_normalize:true,
    array_item_type:'string',
    defaultValue:'',
    trim:true,
    lower:true,
    optional:true
  },
  {
    name:'published.title',
    type:'string',
    trim:true,
    defaultValue:'',
    optional:true
  },{
    name:'published.body',
    type:'string',
    trim:true,
    defaultValue:'',
    optional:true
  },{
    name:'published.tags',
    type:'array',
    array_defaultValue:[],
    array_unique:true,
    array_normalize:true,
    array_item_type:'string',
    defaultValue:'',
    trim:true,
    lower:true,
    optional:true
  },{
    name:'status',
    type:'string',
    defaultValue:'draft',
    trim:true,
    lower:true,
    anyOf:['draft','published']
  }
];

console.log(reqBody);
console.log(checkSchema(reqBody,schemas));