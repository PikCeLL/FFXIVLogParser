import * as reader from "./LogReader.js";
import * as enc from "./Encounters.js";

"use strict";

const inputElement = document.getElementById("button");
inputElement.addEventListener("click", handleFiles);

function handleFiles() {
    const inputFiles = document.getElementById('input');
    const encounter = enc.TEA;
    readNextFile(encounter, inputFiles.files, 0, []).then(result => {
        const results = new Array(encounter[3].length);
        for (let i = 0; i < results.length; i++) {
            results[i] = { label: encounter[3][i], data: [], parsing: false };
        }
        var index = 0;

        result.forEach(log => {
            log.forEach(pull => {
                results[pull[2]].data.push({ x: index, y: pull[1] / 60000, tooltip: pull[0] });
                ++index;
            });
        });

        const ctx = document.getElementById('myChart');

        new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: results
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Pull #'
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Pull duration (min)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: encounter[0] + " prog : " + index + " pulls"
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.raw.tooltip;
                            }
                        }
                    }
                }
            }
        });
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
            for (let i = results.length; i >= 0; --i) {
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
