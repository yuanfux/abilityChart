"use strict";

class abilityChart extends HTMLElement {
	
	constructor(){
		super();
	}

	createdCallback(){

	}

	initChart(){
		console.log("inside init" + this.width);
		if(this.width && this.height && this.numPoint){
			

			this.innerHTML = `
			<canvas width=${this.width} height=${this.height}></canvas>`;
			let canvas = this.querySelector('canvas');
			if(canvas.getContext){
				var ctx = canvas.getContext('2d');
				//ctx.fillRect(295, 295, 5, 5);
				this.drawPolygon(ctx ,this.width/2, this.height/2, this.width/2, this.numPoint);
			}
		}
	}

	drawPolygon(ctx, x, y, radius, sides){
		console.log(x + " " + y + " " + radius + " "+sides);
		if (sides < 3) return;
		ctx.beginPath();
		var a = ((Math.PI * 2)/sides);
		ctx.translate(x,y);
		ctx.moveTo(0, -radius);
		for (var i = 1; i < sides; i++) {
			ctx.lineTo(radius*Math.cos(-Math.PI/2 + a*i),radius*Math.sin(-Math.PI/2 + a*i));
			//ctx.stroke();
			console.log(radius*Math.cos(a*i)+", "+radius*Math.sin(a*i));
		}
		ctx.fill();
	}

	attachedCallback(){

	}

	detachedCallback() {

	}

	set properties(prop){
		this.width = prop.width;
		this.height = prop.height;
		this.numPoint = prop.numPoint;
		this.initChart();
	}

	attributeChangedCallback(attr, oldVal, newVal){
	}

}

let myAc = document.registerElement("ability-chart", abilityChart);
let myA = new myAc;
myA.properties={ width: 300,
				 height: 300,
				 numPoint: 4};
document.querySelector('#abilityChart').appendChild(myA);
