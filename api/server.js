require('dotenv').config()
const Express= require('express')
const bodyParser = require('body-parser')
const multiparty = require('connect-multiparty')
const fs = require('fs')

const dbMODEL = require('./dbMODEL/dbMODEL')

const ObjectId = require('mongodb').ObjectId


const app= Express()

const port = process.env.PORT || 8080

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(multiparty())

app.use((req,res,next)=>{

    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE')
    res.setHeader('Access-Control-Allow-Headers','Content-type')
    res.setHeader('Access-Control-Allow-Credentials', true)

    next()
})


//ROTAS

//retorna todos os elementos
app.get('/api',async (req,res)=>{

    const db= new dbMODEL()
    const dados =  null
    const response =await db.find('teste',dados)

    res.json(response)
})
//retorna um elemento apertir do endpoint
app.get('/api/:id',async (req,res)=>{
    res.setHeader('Access-Control-Allow-Origin','*')
    const db = new dbMODEL()
    const dados ={
        _id: new ObjectId(req.params.id)
    } 
    const response = await db.find('teste',dados)
    response ? res.status(200).json(response): res.status(404).json(response)
    
})
//recupera uploads
app.get('/uploads/:imagem',(req,res)=>{
    const img = req.params.imagem

    fs.readFile(`./uploads/${img}`,(err, file)=>{
        if(err){
            res.status(400).json(err)
            return
        }
        res.writeHead(200,{
            'Content-type':'image/jpg'
        })
        res.end(file)
    })
})
//insere dados no banco
app.post('/api',async (req,res)=>{
    const db= new dbMODEL()

    const date = new Date()
    const timeStamp = date.getTime()
    const pathOrigem= `${req.files.arquivo.path}`
    const fileName = `${timeStamp}_${req.files.arquivo.originalFilename}`
    const pathDestino = `./uploads/${fileName}`

    fs.rename(pathOrigem,pathDestino,(err)=>{
        if(err){
            res.status(500).json(err)
        }
    })

    const dados = {
        urlImagem:fileName,
        ...req.body
    } 

    await db.insert('teste',dados)
    res.json(dados)
})

//put by ID (update)
app.put('/api/:id',async (req,res)=>{
    const db = new dbMODEL()

    const query = {
            _id: new ObjectId(req.params.id)
            }
    const dados= {
        $push:{
            comentarios:{
                id_comentario: new ObjectId(),
                comentario:req.body.comentario
            }
            
        }
    }
    const result = await db.update('teste',query,dados)
    res.send(`${result.matchedCount} documento${result.modifiedCount>1||result.modifiedCount===0?'s':''} de acordo com o filtro,  ${result.modifiedCount} documento${result.modifiedCount>1||result.modifiedCount===0?'s':''} atualizado${result.modifiedCount>1||result.modifiedCount===0?'s':''}`)
})

//delete by id
app.delete('/api/:id',async (req,res)=>{
    const db = new dbMODEL()
    const query = {
        _id: new ObjectId(req.params.id)
    }



    const result = await db.delete('teste',query)
    res.send(`${result.deletedCount} documento${result.deletedCount>1||result.deletedCount===0?'s':''} deletado${result.deletedCount>1||result.deletedCount===0?'s':''}.`)

})

app.delete('/api/comentarios/:id',async (req,res)=>{
    const db = new dbMODEL()
    console.log(req.params.id)
    const dados = {
        $pull:{
            comentarios:{
                id_comentario: new ObjectId(req.params.id) 
            }
        }
    }
    const result =  await db.update('teste','delete',dados)
    res.send(`${result.deletedCount} documento${result.deletedCount>1||result.deletedCount===0?'s':''} deletado${result.deletedCount>1||result.deletedCount===0?'s':''}.`)
})


app.listen(port,()=>{
    console.log('servidor rodando na porta ' + port)
})

