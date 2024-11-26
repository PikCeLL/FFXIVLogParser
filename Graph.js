import * as reader from "./LogReader.js";
import * as enc from "./Encounters.js";
import 'https://cdn.jsdelivr.net/npm/chart.js';

"use strict";

const inputElement = document.getElementById("button");
inputElement.addEventListener("click", handleFiles);

// Code fron the Colors Chart.js plugin, just with different colors for better readability. 7 colors generated wth https://mokole.com/palette.html
const BORDER_COLORS = [
    'rgb(128, 128, 0)', // olive
    'rgb(0, 0, 255)', // blue
    'rgb(255, 0, 0)', // red
    'rgb(0, 255, 255)', // aqua
    'rgb(199, 21, 133)', // mediumvioletred
    'rgb(0, 255, 0)', // lime
    'rgb(30, 144, 255)' // dodgerblue
  ];
  
  // Border colors with 50% transparency
  const BACKGROUND_COLORS = /* #__PURE__ */ BORDER_COLORS.map(color => color.replace('rgb(', 'rgba(').replace(')', ', 0.5)'));
  
  function getBorderColor(i) {
    return BORDER_COLORS[i % BORDER_COLORS.length];
  }
  
  function getBackgroundColor(i) {
    return BACKGROUND_COLORS[i % BACKGROUND_COLORS.length];
  }

const ctx = document.getElementById('myChart');
const chart = new Chart(ctx, {
    type: 'scatter',
    data: [],
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
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return context.raw.tooltip;
                    }
                }
            }
        }
    }
});

function handleFiles() {
    const inputFiles = document.getElementById('input');
    const fightValue = document.getElementById('fights').value;
    let encounter = enc.UCoB;
    switch (fightValue) {
        case "ucob":
            encounter = enc.UCoB;
            break;
        case "uwu":
            encounter = enc.UwU;
            break;
        case "tea":
            encounter = enc.TEA;
            break;
        case "dsr":
            encounter = enc.DSR;
            break;
        case "top":
            encounter = enc.TOP;
            break;
        case "fru":
            encounter = enc.FRU;
            break;
        default:
            console.log(`${fightValue} doesn't exist! (yet?)`);
    }

    document.getElementById('progressBar').max = inputFiles.files.length;
    document.getElementById('progressBar').value = 0;

    readNextFile(encounter, inputFiles.files, 0, []).then(result => {
        const results = new Array(encounter[3].length);
        for (let i = 0; i < results.length; i++) {
            results[i] = {
                label: encounter[3][i],
                data: [],
                parsing: false,
                borderColor: getBorderColor(i),
                backgroundColor: getBackgroundColor(i)
            };
        }

        let index = 0;
        let combatTime = 0;
        result.forEach(log => {
            log.forEach(pull => {
                results[pull[2]].data.push({ x: index + 1, y: pull[1] / 60000, tooltip: pull[0] });
                combatTime += pull[1];
                ++index;
            });
        });

        chart.data = { datasets: results };
        chart.options.plugins.title = {
            display: true,
            text: encounter[0] + " prog : " + index + " pulls for " + parseMillisecondsIntoReadableTime(combatTime) + " combat time"
        };
        chart.update();
    }).catch(error => console.log(error));
}

function parseMillisecondsIntoReadableTime(milliseconds) {
    //Get hours from milliseconds
    var hours = milliseconds / (1000 * 60 * 60);
    var absoluteHours = Math.floor(hours);
    var h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;

    //Get remainder from hours and convert to minutes
    var minutes = (hours - absoluteHours) * 60;
    var absoluteMinutes = Math.floor(minutes);
    var m = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes;

    //Get remainder from minutes and convert to seconds
    var seconds = (minutes - absoluteMinutes) * 60;
    var absoluteSeconds = Math.floor(seconds);
    var s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;


    return h + ':' + m + ':' + s;
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
    }).finally(document.getElementById('progressBar').value = index + 1);
}
