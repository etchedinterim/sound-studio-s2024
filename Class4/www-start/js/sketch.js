let device;
let context;
let note = 0;
let radius = 50;
let mouseDownX = 0;
let mouseDownY = 0;
let currentLFOValue = 1;

//load the exported RNBO Patch. It is an async function, so we are "destructuring assignments."
//The function outputs two variables. Instead of defining them after we get the output of the function
//we can assign them as part of calling the function.
async function loadRNBO() {
    [device, context] = await createRNBODevice("export/my-synth.export.json");

    //get the output of out2
    device.messageEvent.subscribe( (event) => {
        if (event.tag === "out2") {
            currentLFOValue = event.payload;
        }
    })

    console.log("RNBO Device Loaded");
}

loadRNBO();

//p5 code to define canvas and color mode
function setup() {
    colorMode(HSB, 255);
    createCanvas(600, 600);
}

//function to draw the canvas
function draw() {
    let hue = map(note, 50, 70, 0, 255); //similar to scale function in Max
    let scaledRadius = radius * currentLFOValue;
    let cornerRadius = scaledRadius / 2;
    background(10,80,255);

    //control tremolo
    if (mouseIsPressed) {
        let deltaX = Math.abs(mouseX - mouseDownX);
        let deltaXNormalized = map(deltaX, 0, width / 2, 0, 1);
        let tremolo = device.parametersById.get("tremolo");
        tremolo.normalizedValue = deltaXNormalized;
    }

    //control overdrive
    if (mouseIsPressed) {
        let deltaY = Math.abs(mouseY - mouseDownY);
        let deltaYNormalized = map(deltaY, 0, height / 2, 0, 1);
        let drive = device.parametersById.get("poly/overdrive/drive");
        drive.normalizedValue = deltaYNormalized;
        cornerRadius = map(drive.normalizedValue, 0, 1, scaledRadius / 2, 0);
    }


    //add drawing
    if (mouseIsPressed) {
       fill(hue, 128, 255);
    } else {
        fill(255);
    };

    //rectangle shape will scale with overdrive, rectangle size will scale with LFO rate
    rect(mouseX, mouseY, scaledRadius, scaledRadius, cornerRadius);
    //ellipse(mouseX, mouseY, radius, radius);
}

//play random midi note on mouse click down
function mousePressed() {
    if(device){
        context.resume(); //will start the web audio since it will wait for a user action before audio starts.
        note = random(50, 70);
        noteOn(device, context, note, 100);
    } // makes sure the audio device is loaded before resuming the context.

    mouseDownX = mouseX;
    mouseDownY = mouseY;

}

//stop midi note 
function mouseReleased() {
    noteOff(device, context, note);
}