import * as reader from "./LogReader.js";
import * as enc from "./Encounters.js";

"use strict";

const inputElement = document.getElementById("button");
inputElement.addEventListener("click", handleFiles);

function handleFiles() {
    const inputFiles = document.getElementById('input');
    const results = [];
    readNextFile(inputFiles.files, 0, results).then(result => console.log(result));

    var canvas = document.getElementById('tutorial');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(200, 0, 0)';
    ctx.fillRect(10, 10, 50, 50);

    ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
    ctx.fillRect(30, 30, 50, 50);
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();

        fr.onload = () => {
            resolve(reader.readLog(fr.result, new enc.PhasedPullProcessor(enc.TEA)));
        };

        fr.onerror = () => {
            reject(fr.error);
        };

        fr.readAsText(file);
    });
}

function readNextFile(files, index, results) {
    if (index >= files.length) {
        return Promise.resolve(results);
    }

    return readFile(files[index]).then(result => {
        if (result.length != 0) {
            results.push(result);
        }
        return readNextFile(files, index + 1, results);
    }).catch(error => {
        return Promise.reject(error);
    }).finally(console.log("File " + index + " read."));
}
