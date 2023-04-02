import * as reader from "./LogReader.js";
import * as enc from "./Encounters.js";

"use strict";

const inputElement = document.getElementById("button");
inputElement.addEventListener("click", handleFiles);

function handleFiles() {
    const inputFiles = document.getElementById('input');
    const encounter = enc.TEA;
    const rawResults = [];
    readNextFile(encounter, inputFiles.files, 0, rawResults).then(result => {
        console.log(result);

        const results = new Array(encounter[3].length);
        for (let i = 0; i < results.length; i++) {
            results[i] = [];
        }
        var index = 0;

        rawResults.forEach(log => {
            log.forEach(pull => {
                results[pull[2]].push([index, pull[1]]);
                ++index;
            });
        });
        console.log(results);
    }).catch(error => console.log(error));
}

function readFile(file, encounter) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();

        fr.onload = () => {
            resolve(reader.readLog(fr.result, new enc.PhasedPullProcessor(encounter)));
        };

        fr.onerror = () => {
            reject(fr.error);
        };

        fr.readAsText(file);
    });
}

function readNextFile(encounter, files, index, results) {
    if (index >= files.length) {
        return Promise.resolve(results);
    }

    return readFile(files[index], encounter).then(result => {
        if (result.length != 0) {
            // We sort starting from the end because with the default log name the files are parsed in reverse order (at least on Firefox). Still a complete sort just in case
            for (let i = results.length ; i >= 0 ; --i) {
                if (((i === 0) || (results[i - 1][0][0] < result[0][0])) && ((i === results.length) || (results[i][0][0] >= result[0][0]))) {
                    results.splice(i, 0, result);
                    break;
                }
            }
        }
        return readNextFile(encounter, files, index + 1, results);
    }).catch(error => {
        return Promise.reject(error);
    }).finally(console.log("File " + index + " read."));
}
