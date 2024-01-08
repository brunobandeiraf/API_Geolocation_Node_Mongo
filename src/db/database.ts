import mongoose from 'mongoose'

const env = {
  MONGO_URI:
    'mongodb://root:example@127.0.0.1:27021/oz-tech-test?authSource=admin',
}

const init = async function () {
  await mongoose.connect(env.MONGO_URI)

  const db = mongoose.connection

  db.on('error', console.error.bind(console, 'Erro na conexão com o MongoDB:'))
  db.once('open', () => {
    console.log('Conectado ao MongoDB!')
  })
}

export default init()
