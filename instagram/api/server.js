let express = require('express')
let mysql = require('mysql')
let bodyParser = require('body-parser')
let multiparty = require('connect-multiparty')
let fileSystem = require('fs-extra')
let cors = require('cors')

let app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(multiparty())
app.use(cors())

app.use((req, res, next) => {                         // Preflight
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', true);
  next();
})

let port = 3000

let connectMySQL = () => {
  return mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'instagram',
  })
}
let connection = connectMySQL()

app.listen(port, () => console.log('SERVIDOR RODANDO....'))

app.get('/', (req, res) => {
  let resposta = { mgs: 'Olá'}
  res.send(resposta)  
})

app.post('/users', (req, res) => {                  // insere um registro no banco
  let dados = req.body
  res.send(dados)

  connection.query('insert into usuarios set ?', dados, (err, result, fields) => {
    if(err) throw err
    console.log('RESULTS: ', result)
  })
})

app.get('/users', (req, res) => {                   // busca todos registros no banco
  connection.query('select * from usuarios', (err, result) => {
    if(err) throw err
    res.send(result)
  })
})

app.get('/users/:nome/:senha', (req, res) => {      // busca um registro no banco
  let user = req.params                             // pelo nome e pela senha (login)

  connection.query(`select * from usuarios where nome = "${user.nome}" and senha = "${user.senha}"`, (err, result) => {
    if(err) throw err
    console.log(result)
    res.send(result)
  })
})

app.get('/users/:id', (req, res) => {               // busca um registro no banco
  let id = req.params

  connection.query(`select * from postagens where id = "${id.id}"`, (err, result) => {
    if(err) throw err
    if(result.length > 0) res.status(200).send(result)
    if(result.length == 0) res.status(400).send('BAD Request :(')
  })
})

app.put('/users/:id', (req, res) => {               // atualiza um campo no banco
  let id = req.params
  let dados = req.body

  connection.query(`update postagens set titulo = "${dados.titulo}" where id = "${id.id}"`, (err, result) => {
    if(err) throw err
    res.send(result)
  })
})

app.delete('/users/:id', (req, res) => {            // deleta um registro no banco
  let id = req.params

  connection.query(`delete from postagens where id = "${id.id}"`, (err, result) => {
    if(err) throw err
    res.send(result)
  })
})

/*========
POSTAGENS |
=========*/

/* Exemplo de inserção de postagem */
app.post('/post', (req, res) => {
  let arquivo = req.files
  let date = new Date()
  time_stamp = date.getTime()

  let url_imagem = `${time_stamp}_${arquivo.arqs.name}`

  let path_orig = req.files.arqs.path
  let path_dest = `./uploads/${url_imagem}` 

  let posts = {
    url_imagem: url_imagem,
    descricao: req.body.desc
  }

  res.setHeader('Access-Control-Allow-Origin', '*')

  connection.query('insert into postagens set ?', posts, (err, result, fields) => {
    if(err) {
      console.log(err)
      return
    }

    fileSystem.move(path_orig, path_dest, function (err) {
      if (err) return console.error(err)
      console.log("success!")
    })
    console.log('RESULTS: ', result)
  })
})

/* Exemplo de listagem de postagens */
app.get('/posts', (req, res) => {
  connection.query(`select * from postagens`, (err, result) => {
    if(err) res.status(400).send(err)
    if(result.length > 0) res.status(200).send(result)
    if(result.length == 0) res.status(200).send(result)
  })
})

/* Exemplo de listagem de imagens */
app.get('/uploads/:imagem', (req, res) => {
  let img = req.params

  fileSystem.readFile(`./uploads/${img.imagem}`, (err, content) => {
    if(err) res.status(400).send(err)
    else {
      res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Type': 'image/jpg' })
      res.end(content)
    }
  })
})

/* Exemplo de atualização de postagens */
app.put('/post/:id/:descricao', (req, res) => {
  let dados = req.params

  connection.query(`update postagens set descricao = "${dados.descricao}" where id = "${dados.id}"`, (err, result) => {
    if(err) res.status(400).send(err)
    else res.status(200).send(result)
  })
})

/* Exemplo de exclusão de postagens */
app.delete('/post/:id/:url_image', (req, res) => {
  let dados = req.params
  console.log('params => ', dados)

  let filePath = `./uploads/${dados.url_image}` 
  fileSystem.unlinkSync(filePath)                     // deleta a imagem da pasta uploads

  connection.query(`delete from postagens where id = "${dados.id}"`, (err, result) => {
    if(err) res.status(400).send(err)
    else res.status(200).send(result)
  })
})