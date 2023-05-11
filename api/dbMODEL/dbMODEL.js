const MongoClient  = require('mongodb').MongoClient


class dbMODEL{
    constructor(){
        const url= process.env.URL_BANCO_DE_DADOS || 'mongodb://localhost:27017'
        const dbName='instagram'
        this.client = new MongoClient(url)
        this.database = this.client.db(dbName)

    }

    async update (collectiondb,query,dados){
        let result=null
        try{
            const collection = this.database.collection(collectiondb)
            if(query==='delete'){
                result = await collection.updateMany({},dados)
            }else{
                result = await collection.updateOne(query,dados)
            }
            
        }catch(err){
            console.log(err)
        }finally{
            this.client.close()
            return result
        }
    }

    

    async insert(collectionDb,dados){
        try{
            const collection = this.database.collection(collectionDb)
            await collection.insertOne(dados)
            
        }catch(err){
            console.log(err)
        } finally{
           await this.client.close()
        }
    }

    async  find (collectionDb,query){
        let dados= null
        try{
            const collection = this.database.collection(collectionDb)
    
            dados = query ? await collection.findOne(query) : await collection.find().toArray()
    
        }catch(err){
            console.log(err)
        }finally{
            await this.client.close()
            return dados
        }
    }

    async delete (collectiondb,query){
        let response=null
        try{
            const collection = this.database.collection(collectiondb)
            response = await collection.deleteOne(query)
        }catch(err){
            console.log(err)
        }finally{
            await this.client.close()
            return response
        }
    }
}

module.exports=dbMODEL