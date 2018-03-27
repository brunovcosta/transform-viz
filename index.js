var config = {
	zoom: 60,
	width: 640,
	height: 480,
	offsetX: 3,
	offsetY: 3,
	mode: 'move'
}

var exceptions = {}

function exceptionsContains(t){
	var lower = false;
	var higher = false;
	for(var key in exceptions){
		if(+key >= t)
			higher = true;
		if (+key <= t)
			lower = true;
	}

	return higher && lower;
}

function exceptionsEvaluate(t){
	var lower = null;
	var higher = null;
	for(var key in exceptions){
		if(+key >= t && (!higher || higher > +key))
			higher = {
				x: +key,
				y: exceptions[key]
			};
		if (+key <= t && (!lower || lower < +key))
			lower = {
				x: +key,
				y: exceptions[key]
			};
	}

	return lower.y + (higher.y - lower.y)*(t - lower.x)/(higher.x - lower.x);
}

function f(t){
	with(Math)
		if(exceptionsContains(t))
			return exceptionsEvaluate(t);
		else
			var y=eval(document.getElementById('input').value);
	return y;
}

function T(s){
	if(s<=0) return 0;
	var sum = 0;
	var max = 10;
	var dt = 1;
	for(var t=0;t<max;t+=dt)
		sum+=f(t)*Math.exp(-s*t)*dt
	return sum;
}

function yFromF(f,x){
	return config.height - (f((x/config.zoom-config.offsetX)) + config.offsetY)*config.zoom;
}

function plotF(){
	var canvas = document.getElementById('functionCanvas')
	var context = canvas.getContext("2d");
	context.clearRect(0,0,config.width,config.height);

	context.beginPath();
	for(var x=0;x<640;x++)
		context.lineTo(x,yFromF(f,x));
	context.stroke();

	context.fillStyle="red";
	context.beginPath();
	context.moveTo(config.offsetX*config.zoom,0);
	context.lineTo(config.offsetX*config.zoom,config.height);

	context.moveTo(0,config.height - config.offsetY*config.zoom);
	context.lineTo(config.width,config.height - config.offsetY*config.zoom);
	context.stroke();
}



function plotT(){
	var canvas = document.getElementById('transformCanvas')
	var context = canvas.getContext("2d");
	context.clearRect(0,0,config.width,config.height);

	context.beginPath();
	for(var x=0;x<640;x++)
		context.lineTo(x,yFromF(T,x));
	context.stroke();

	context.beginPath();
	context.moveTo(config.offsetX*config.zoom,0);
	context.lineTo(config.offsetX*config.zoom,config.height);

	context.moveTo(0,config.height - config.offsetY*config.zoom);
	context.lineTo(config.width,config.height - config.offsetY*config.zoom);
	context.stroke();
}

function plot(){
	setTimeout(plotF);
	setTimeout(plotT);
}

function refresh(){
	exceptions = {};
	plot();
}

function setMode(m){
	var canvas = document.getElementById('functionCanvas');

	config.mode = m;
	if (m === 'move'){
		camvas.style.cursor="move"
	}else{
		canvas.style.cursor="crosshair"
	}
}


function init(){
	plot();
	var canvas = document.getElementById('functionCanvas');
	canvas.addEventListener('mousemove',function(event){
		if(event.buttons){
			if(config.mode === 'move'){
				config.offsetX += event.movementX/config.zoom;
				config.offsetY -= event.movementY/config.zoom;

				plot();
			}else{
				var context = canvas.getContext('2d');
				exceptions[event.offsetX/config.zoom - config.offsetX] = (config.height - event.offsetY)/config.zoom - config.offsetY;

				plot();
				var imageData = context.getImageData(event.offsetX,event.offsetY,event.offsetX+1,event.offsetY+1);
				imageData.data[0] = 255;
				imageData.data[1] = 0;
				imageData.data[2] = 0;
				imageData.data[3] = 255;
				context.putImageData(imageData, event.offsetX, event.offsetY);

			}
		}
	});
}

init();
