//const utils = require()
const SQUARE_SIZE = 1;
const THRESHOLD = 450;
const LUM_THRESHOLD = -30;

let loadCounter = 0;


let canvas = [
    document.getElementById("can00"),
    document.getElementById("can01"),
    document.getElementById("can02"),
    document.getElementById("can10"),
    document.getElementById("can11"),
    document.getElementById("can12"),
]
let ctx = [];
for (let i in canvas) {
    ctx[i] = canvas[i].getContext("2d");
}

let planes = [];
let id = [];
let idc = []

for (let i = 0; i < 6; i++) {
    let image = new Image();
    
    image.src = "img/" + i + ".JPG";
    planes.push(image);
    image.onload = function () {
        loadCounter++;
        //console.log(loadCounter);
        if (loadCounter == 6) {
            step2();
        }
    }
}

function step2() {
    for (let i in ctx) {
        canvas[i].height = planes[i].naturalHeight;
        canvas[i].width = planes[i].naturalWidth;
        ctx[i].drawImage(planes[i], 0, 0);
        id[i] = ctx[i].getImageData(0, 0, canvas[i].width, canvas[i].height);
        idc[i] = ctx[i].createImageData(canvas[i].width, canvas[i].height);
    }

    //Obliczanie przebliżonej luminancji tła
    
    //przekształcenie imagedata
    for (let i in planes) {
        let lu = Math.max(id[i].data[0] ,id[i].data[1], id[i].data[2]);
        let ld = Math.max(id[i].data[canvas[i].width*4] ,id[i].data[canvas[i].width*4+1], id[i].data[canvas[i].width*4+2]);
        let avgLum = (lu + ld)/2;
        //console.log(avgLum);
        for (let j = 0; j < id[i].data.length; j += 4) {
            if (id[i].data[j] > avgLum + LUM_THRESHOLD || id[i].data[j + 1] > avgLum + LUM_THRESHOLD || id[i].data[j + 2] > avgLum + LUM_THRESHOLD) {
                id[i].data[j] = 0;
                id[i].data[j + 1] = 0;
                id[i].data[j + 2] = 0;
            } else {
                id[i].data[j] = 1;
                id[i].data[j + 1] = 1;
                id[i].data[j + 2] = 1;
            }
        }
    }
    //Wypełnianie wynikowego imageData czernią
    for(let i = 0; i < 6; i++){
       // console.log(idc[i].data.length);
        for(let j = 0; j < idc[i].data.length; j+=4){
            idc[i].data[j] = 0;
            idc[i].data[j+1] = 0;
            idc[i].data[j+2] = 0;
            idc[i].data[j+3] = 255;
        }
    }
    
    //Pobieranie próbek i wykonywanie operacji
    for (let i = 0; i < 6; i++) {
        for (let y = 0; y + SQUARE_SIZE < canvas[i].height; y++) {
            for (let x = 0; x + SQUARE_SIZE < canvas[i].width; x++) {
                let lu = {
                    x1: x * 4,
                    y1: y * 4 * canvas[i].width
                }
                let ld = {
                    x1: x * 4,
                    y1: (y + SQUARE_SIZE) * 4 * canvas[i].width
                }
                let ru = {
                    x1: (x + SQUARE_SIZE) * 4,
                    y1: y * 4 * canvas[i].width
                }
                let rd = {
                    x1: (x + SQUARE_SIZE) * 4,
                    y1: (y + SQUARE_SIZE) * 4 * canvas[i].width
                }
                let colorLU = {
                    r: id[i].data[lu.x1 + lu.y1],
                    g: id[i].data[lu.x1 + lu.y1 + 1],
                    b: id[i].data[lu.x1 + lu.y1 + 2]
                }
                let colorLD = {
                    r: id[i].data[ld.x1 + ld.y1],
                    g: id[i].data[ld.x1 + ld.y1 + 1],
                    b: id[i].data[ld.x1 + ld.y1 + 2]
                }
                let colorRD = {
                    r: id[i].data[rd.x1 + rd.y1],
                    g: id[i].data[rd.x1 + rd.y1 + 1],
                    b: id[i].data[rd.x1 + rd.y1 + 2]
                }
                let colorRU = {
                    r: id[i].data[ru.x1 + ru.y1],
                    g: id[i].data[ru.x1 + ru.y1 + 1],
                    b: id[i].data[ru.x1 + ru.y1 + 2]
                }
                let test = colorLD.r + colorLU.r + colorRD.r + colorRU.r;
                if(test > 0 && test < 4){
                    
                    for (let y2 = lu.y1; y2 <= ld.y1; y2 += (4 * canvas[i].width)) {
                        //console.log("trafienie");
                        for (let x2 = lu.x1; x2 <= ru.x1; x2 += 4) {
                            //console.log(y2);
                            idc[i].data[y2 + x2] = 255;
                            idc[i].data[y2 + x2 + 1] = 255;
                            idc[i].data[y2 + x2 + 2] = 255;
                        }
                    }
                }
            }
        }
        ctx[i].putImageData(idc[i], 0, 0);
    }


}
