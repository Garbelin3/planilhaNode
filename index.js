import { GoogleSpreadsheet } from 'google-spreadsheet';
import { readFileSync } from 'fs';
import { JWT } from 'google-auth-library';

const credenciais = JSON.parse(readFileSync('./credentials.json', 'utf8'));
const arquivo = JSON.parse(readFileSync('./arquivo.json', 'utf8'));

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const jwt = new JWT({
    email: credenciais.client_email,
    key: credenciais.private_key,
    scopes: SCOPES
});

async function GetDoc() {
    const doc = new GoogleSpreadsheet(arquivo.id, jwt);
    await doc.loadInfo();
    return doc;
}

async function ReadWorkSheet() {
    const sheet = (await GetDoc()).sheetsByIndex[0];
    await sheet.loadHeaderRow();
    if (sheet.headerValues.length === 0) {
        throw new Error('No values in the header row - fill the first row with header values before trying to interact with rows');
    }
    const rows = await sheet.getRows();
    let users = rows.map(row => {
        return row.toObject();
    });
    return users;
}

async function AddUser(data = {}) {
    const response = await fetch('https://apigenerator.dronahq.com/api/hrzwOqdt/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

async function AddRowToSheet(data) {
    const sheet = (await GetDoc()).sheetsByIndex[0];
    await sheet.addRow(data);
    console.log('Linha adicionada com sucesso!');
}

async function TrackData() {
    try {
        const users = await ReadWorkSheet();
        for (const user of users) {
            await AddUser(user);
            await AddRowToSheet(user);
        }
        console.log('Dados enviados com sucesso!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function AddUserToSheet(user) {
    try {
        const sheet = (await GetDoc()).sheetsByIndex[0];
        await sheet.loadHeaderRow();
        if (sheet.headerValues.length === 0) {
            await sheet.setHeaderRow(Object.keys(user));
        }
        await AddRowToSheet(user);
        console.log('Usuário adicionado com sucesso!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

const newUser = {
    nome: 'João',
    email: 'joao@example.com',
    idade: 30
};

AddUserToSheet(newUser);

TrackData();