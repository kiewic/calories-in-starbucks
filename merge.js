'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const dirName = './products';
const sizeNames = [];
const matrix = [];

function loadJson(fileName) {
    let data = fs.readFileSync(fileName);
    data = JSON.parse(data);
    return data;
}

function merge() {
    const files = fs.readdirSync(dirName);
    for (const fileName of files) {
        const fullFileName = path.join(dirName, fileName);
        console.log(fullFileName);

        const data = loadJson(fullFileName);
        for (const product of data.products) {
            console.log('  ', product.name, product.sizes.length);

            for (const size of product.sizes) {
                if (!size.nutrition) {
                    // no nutrition information, not important for this study
                    continue;
                }

                const calories = size.nutrition.calories.displayValue;
                console.log('  ', '  ', size.name, calories);

                if (calories == null) {
                    console.log(size.nutrition);
                }

                if (matrix[product.name] === undefined) {
                    matrix[product.name] = [];
                }

                if (sizeNames.indexOf(size.name) === -1) {
                    sizeNames.push(size.name);
                }
                const index = sizeNames.indexOf(size.name);
                matrix[product.name][index] = calories;
            }
        }
    }
}

function matrixToHtml() {
    const tags = ['<table>'];
    tags.push('<tr>');
    tags.push('<td></td>');
    for (const sizeName of sizeNames) {
        tags.push(`<th>${sizeName}</th>`);
    }
    for (const product in matrix) {
        tags.push('<tr>');
        tags.push(`<td>${product}</td>`);
        for (var i = 0; i < sizeNames.length; i++) {
            const calories = matrix[product][i];
            tags.push(`<td>${ calories == null ? '' : calories }</td>`);
        }
        tags.push('</tr>');
    }
    tags.push('</tr>');
    tags.push('</table>');

    // console.log(tags.join('\n'));

    fs.writeFileSync('index.html', tags.join('\n'), { encoding: 'utf8' })
}

merge();
matrixToHtml();
