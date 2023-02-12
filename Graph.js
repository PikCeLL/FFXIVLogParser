import * as reader from "./LogReader.js";

"use strict";

const inputElement = document.getElementById("button");
inputElement.addEventListener("click", handleFiles);

function handleFiles() {
  const files = document.getElementById('input');
  for (const file of files.files) {
    console.log(reader.readFile(file, true));
  }

  var canvas = document.getElementById('tutorial');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgb(200, 0, 0)';
  ctx.fillRect(10, 10, 50, 50);

  ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
  ctx.fillRect(30, 30, 50, 50);
}
