'use strict';

const fs = require('fs');
const https = require('https');
const path = require('path');
const products = [];

function loadJson() {
    let data = fs.readFileSync('./menu-storeNumber-2983.json');
    data = JSON.parse(data);
    return data;
}

function cleanPieces(pieces) {
    const newPieces = [];
    for (const piece of pieces) {
        newPieces.push(piece.replace(/[^0-9a-zA-Z]/g, '-'));
    }
    return newPieces;
}

function parseProduct(product, level, pieces) {
    console.log(`${'  '.repeat(level)}name: ${product.name}`);
    const uri = product.uri;
    const fragment = uri.replace(/^\/product\//, '');
    const host = 'www.starbucks.com';
    const path = `/bff/ordering/${fragment}?storeNumber=2983`;
    pieces = cleanPieces([...pieces, fragment]);
    const fileName = `${pieces.join('-')}.json`;
    console.log(`${'  '.repeat(level)}${fileName}`);
    products.push({
        host: host,
        path: path,
        fileName: fileName,
    });
}

function parseMenu(menu, level, pieces) {
    console.log(`${'  '.repeat(level)}name: ${menu.name}`);
    pieces = [...pieces, menu.name];
    for (const child of menu.children) {
        parseMenu(child, level + 1, pieces);
    }
    for (const product of menu.products) {
        parseProduct(product, level + 1, pieces);
    }
}

function parseJson() {
    const data = loadJson();
    for (const menu of data.menus) {
        parseMenu(menu, 0, []);
    }
}

function query() {
    if (products.length > 0) {
        let product = products.shift();

        const dirName = './products';
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName);
        }

        const fullFileName = path.join(dirName, product.fileName);
        if (fs.existsSync(fullFileName)) {
            console.log(`Already downloaded: ${product.fileName}`);
            query();
            return;
        }

        const file = fs.createWriteStream(fullFileName);
        file.on('close', () => {
            query();
        })

        const request = https.get({
            host: product.host,
            path: product.path,
            port: 443,
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36' },
        }, function(response) {
            console.log(`${response.statusCode} ${response.statusMessage}: ${request.path}`);
            response.pipe(file);
        });
    }
}

parseJson();
query();
