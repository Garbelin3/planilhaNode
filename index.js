const { GoogleSpreadsheet } = require('google-spreadsheet');
const credenciais = require('./credentials.json');
const arquivo = require('./arquivo.json');
const {JWT} = require('google-auth-library');
const punycode = require('punycode/');


const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function User(nome, idade, email){
    this.nome = nome;
    this.idade = idade;
    this.email = email; 
}

async function GetDoc() {
    const doc = new GoogleSpreadsheet(arquivo.id, JWT);
    await doc.loadInfo();
    return doc;
}

async function ReadWorkSheet() {
    const sheet = (await GetDoc()).sheetsByIndex[0];
    const rows = await sheet.getRows();
    let users =  rows.map(row => {
        return row.toObject()
    })
    return users
}

async function AddUser(data = {}) {
    const response = await fetch("https://apigenerator.dronahq.com/api/l9GGxGRI/users", {
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

async function TrackData() {
    let data = await ReadWorkSheet();
    data.map(async (user) => {
        let response = await AddUser(user)
        console.log(response)
    })
    return console.log("Dados copiados com sucesso")
}

(async () => {
    const newUser = new User("João Pedro", 21, "jp.garbeline@gmail.com");
    await AddUser(newUser);
})();
