<<<<<<< HEAD
const mongoose = require('mongoose')

async function main() {
    await mongoose.connect(process.env.MONGO_KEY)
}

=======
const mongoose = require('mongoose')

async function main() {
    await mongoose.connect(process.env.MONGO_KEY)
}

>>>>>>> 30ea685db39b1b2116ee9fc384c4ddde97c47a7f
module.exports = main;