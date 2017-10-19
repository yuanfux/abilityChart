"use strict";

class abilityChart extends HTMLElement {
	
	constructor(){
		super();
	}

	createdCallback(){

	}

	initChart(){
		console.log("inside init" + this.width);
		if(this.width && this.height && this.numPoint && this.eachPoint){
			

			this.innerHTML = `
			<canvas width=${this.width} height=${this.height}></canvas>`;
			let canvas = this.querySelector('canvas');
			if(canvas.getContext){
				let ctx = canvas.getContext('2d');
				//ctx.fillRect(295, 295, 5, 5);
				//outter frame & layer
				for(let i = 0 ; i < this.numLayer ; i++){
					let tempK = [];
					let coef = 1 - (1/this.numLayer)*i;
					for(let j = 0 ; j < this.numPoint ; j++){
						tempK.push(coef);
					}
					this.drawPolygon(ctx ,this.width/2, this.height/2, this.width/2, this.numPoint, tempK);
				}
				
				

				//actual chart
				this.drawPolygon(ctx ,this.width/2, this.height/2, this.width/2, this.numPoint, this.eachVal);

				//center to vertex line
				this.drawDecorationLine(ctx ,this.width/2, this.height/2, this.width/2, this.numPoint);
			}
		}
	}

	generateAnchorPts(radius, sides){
		if(!this.anchorPts){
			this.anchorPts = [];
			let eachAngle = ((Math.PI * 2)/sides);
			this.anchorPts.push([0, -radius]);
			for(let i = 1; i < sides; i++){
				this.anchorPts.push([radius*Math.cos(-Math.PI/2 + eachAngle*i), radius*Math.sin(-Math.PI/2 + eachAngle*i)]);
			}
		}
	}

	drawPolygon(ctx, x, y, radius, sides, k){
		console.log("here");
		if (sides < 3) return;
		this.generateAnchorPts(radius, sides);
		ctx.save();
		ctx.beginPath();
		ctx.translate(x,y);
		if(!k){
			k = [];
			for(let i = 0 ; i < sides ; i++){
				k.push(1);
			}
			//ctx.moveTo(this.anchorPts[0][0], this.anchorPts[0][1]);
		}
		console.log("k: " + k);
		ctx.moveTo(k[0] * this.anchorPts[0][0],
				   k[0] * this.anchorPts[0][1])
		// else{
		// 	ctx.moveTo(this.eachPoint[0].value/100 * this.anchorPts[0][0], 
		// 			   this.eachPoint[0].value/100 * this.anchorPts[0][1]);
		// }	
		for (let i = 1 ; i < this.anchorPts.length ; i++) {
			// if(!hasPercentage){
			// 	ctx.lineTo(this.anchorPts[i][0],this.anchorPts[i][1]);
			// }
			// else{
			// 	ctx.lineTo(this.eachPoint[i].value/100 * this.anchorPts[i][0],
			// 		       this.eachPoint[i].value/100 * this.anchorPts[i][1]);
			// 	console.log(this.eachPoint[i].value/100);
			// }
			ctx.lineTo(k[i] * this.anchorPts[i][0],
				   	   k[i] * this.anchorPts[i][1]);
			console.log(this.anchorPts[i][0]+ "," + this.anchorPts[i][1]);
		}
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}

	drawDecorationLine(ctx, x, y, radius, sides){
		if (sides < 3) return;
		this.generateAnchorPts(radius, sides);
		for(let i = 0 ; i < this.anchorPts.length ; i++){
			this.drawLine(ctx, x, y, this.anchorPts[i][0], this.anchorPts[i][1]);
		}
	}

	drawLine(ctx, x0, y0, x1, y1){
		ctx.save();
		ctx.beginPath();
		ctx.translate(x0, y0);
		ctx.moveTo(0, 0);
		ctx.lineTo(x1, y1);
		ctx.stroke();
		ctx.restore();
	}

	attachedCallback(){

	}

	detachedCallback() {

	}

	set properties(prop){
		this.width = prop.dimension;
		this.height = prop.dimension;
		this.numPoint = prop.numPoint;
		this.numLayer = prop.numLayer;
		this.eachVal = [];
		this.eachPoint = prop.eachPoint.map((obj) => {
			let normalizedVal = (obj.value/100).toFixed(2);
			this.eachVal.push(normalizedVal);
			obj.value = normalizedVal;
		});
		this.initChart();
	}

	attributeChangedCallback(attr, oldVal, newVal){
	}

}

let myAc = document.registerElement("ability-chart", abilityChart);
let myA = new myAc;
myA.properties={ dimension: 300,
				 numPoint: 6,
				 numLayer:3,
				 eachPoint:[{key:"Math", value:85},
				 			{key:"Physics", value:30},
				 			{key:"English", value:55},
				 			{key:"Chemistry", value:100},
				 			{key:"Chinese", value:10},
				 			{key:"cs", value:100}]
				};

document.querySelector('#abilityChart').appendChild(myA);
