"use strict";

class AbilityChart extends HTMLElement {
	
	constructor(){
		super();
		this.initData();
	}

	initChart(){
		if(this.width && this.height && this.numPoint){

			this.innerHTML = `
			<canvas width=${this.width} height=${this.height}></canvas>`;
			let canvas = this.querySelector('canvas');
			//this.canvas = canvas;
			canvas.addEventListener("mousemove", (e) => {
				this.handleEvent(e, canvas)});
			if(canvas.getContext){
				let ctx = canvas.getContext('2d');

				//outter frame & layer
				for(let i = 0 ; i < this.numLayer ; i++){
					let tempK = [];
					let coef = 1 - (1/this.numLayer)*i;
					for(let j = 0 ; j < this.numPoint ; j++){
						tempK.push(coef);
					}
					this.drawPolygon(ctx ,this.width/2, this.height/2, this.chartPortion*this.width/2, this.numPoint, tempK, this.eachLayerStyle[i][0], this.frameBorderWidth, this.eachLayerStyle[i][1]);
				}

				//center to vertex line
				this.drawDecorationLine(ctx ,this.width/2, this.height/2, this.chartPortion*this.width/2, this.numPoint);

				//actual chart
				this.drawPolygon(ctx ,this.width/2, this.height/2, this.chartPortion*this.width/2, this.numPoint, this.eachVal, this.fillColor, this.chartBorderWidth, this.borderColor, this.chartAlpha);

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

	drawPolygon(ctx, x, y, radius, sides, k, fillColor, borderWidth, borderColor, alpha){
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
		console.log("--------");
		ctx.closePath();

		if(fillColor){
			ctx.fillStyle = fillColor;

			if(alpha)
			ctx.globalAlpha = alpha;

			ctx.fill();
		}

		if(borderWidth)
		ctx.lineWidth = borderWidth;

		if(borderColor)
		ctx.strokeStyle = borderColor;

		ctx.stroke();
		ctx.restore();
	}

	drawDecorationLine(ctx, x, y, radius, sides){
		if (sides < 3) return;
		this.generateAnchorPts(radius, sides);
		for(let i = 0 ; i < this.anchorPts.length ; i++){
			this.drawLine(ctx, x, y, this.anchorPts[i][0], this.anchorPts[i][1], this.frameBorderWidth, this.decorLineColor);
			let alignment = "start";
			let maxWidth = this.width;
			if(i == 0 || ((this.numPoint%2 == 0) && (i == (this.numPoint-2)/2 + 1))){
				alignment = "center";
			}
			else if(i > (this.numPoint-2)/2 + 1){
				alignment = "end";
				maxWidth = this.width/2 + this.anchorPts[i][0];
			}
			else{
				maxWidth = this.width/2 - this.anchorPts[i][0];
			}

			if(this.anchorPts[i][1] > 0.0000001){
				alignment += "Top";
			}
			else if(this.anchorPts[i][1] < -0.0000001){
				alignment += "Bot";
			}
			this.drawText(ctx, this.eachLabel[i], this.labelFont, this.eachLabelColor[i], alignment, x, y, this.anchorPts[i][0], this.anchorPts[i][1], maxWidth);
		}
	}

	drawLine(ctx, x0, y0, x1, y1, decorLineWidth, decorLineColor){
		ctx.save();
		ctx.beginPath();
		ctx.translate(x0, y0);
		ctx.moveTo(0, 0);
		ctx.lineTo(x1, y1);
		ctx.lineWidth = decorLineWidth;
		ctx.strokeStyle = decorLineColor;
		ctx.stroke();
		ctx.restore();
	}

	drawText(ctx, text, font, fillStyle, alignment, x0, y0, x1, y1,maxWidth){
		ctx.save();
		if(font)
		ctx.font = font;

		if(fillStyle)
		ctx.fillStyle = fillStyle;

		let rectWidth = Math.min(maxWidth, ctx.measureText(text).width);
		let rectHeight = ctx.measureText('gM').width;//hack here
		let upperLeft = [x1, y1];
		if(alignment.indexOf("Top") >= 0){
			ctx.textBaseline = "top";
		}
		else if(alignment.indexOf("Bot") >= 0){
			ctx.textBaseline = "bottom";
			upperLeft[1] -= rectHeight;
		}
		else{
			ctx.textBaseline = "middle";
			upperLeft[1] += rectHeight/2;
		}

		if(alignment.indexOf("center") >= 0){
			ctx.textAlign = "center";
			upperLeft[0] -= rectWidth/2;
		}
		else if(alignment.indexOf("end") >= 0){
			ctx.textAlign = "end";
			upperLeft[0] -= rectWidth;
		}
		else if(alignment.indexOf("start") >= 0){
			ctx.textAlign = "start";
		}
		ctx.translate(x0, y0);
		//ctx.fillRect(upperLeft[0], upperLeft[1], rectWidth, rectHeight);
		if(!this.rectAreas){
			this.rectAreas = [];
		}
		let curRect = {};
		curRect.upperLeft = upperLeft;
		curRect.width = rectWidth;
		curRect.height = rectHeight;
		curRect.label = text;
		this.rectAreas.push(curRect);
		ctx.fillText(text, x1, y1, maxWidth);
		ctx.restore();
	}

	connectedCallback(){
		console.log("wtf");
	}

	initData(){
		let prop = JSON.parse(this.getAttribute("prop"));
		console.log("prop: "+prop);
		this.width = prop.dimension;
		this.height = prop.dimension;
		this.numLayer = prop.numLayer;
		this.labelFont = prop.font;
		this.fillColor = prop.fillColor;
		this.frameBorderWidth = prop.frameBorderWidth;
		this.chartBorderWidth = prop.chartBorderWidth;
		this.borderColor = prop.borderColor;
		this.decorLineColor = prop.decorLineColor;
		this.chartPortion = prop.chartPortion;
		this.chartAlpha = prop.chartAlpha;
		this.eachVal = [];
		this.eachLabel = [];
		this.eachLabelColor = [];
		this.eachLayerStyle = [];
		prop.eachLayerStyle.map((obj) => {
			let tempStyle = [];
			tempStyle.push(obj.fillColor);
			tempStyle.push(obj.borderColor);
			this.eachLayerStyle.push(tempStyle);
		});

		prop.eachPoint.map((obj) => {
			let normalizedVal = (obj.value/100).toFixed(2);
			this.eachVal.push(normalizedVal);
			this.eachLabel.push(obj.key);
			this.eachLabelColor.push(obj.labelColor);
		});
		this.numPoint = this.eachVal.length;
		this.initChart();	
	}

	attributeChangedCallback(attr, oldVal, newVal){

	}

	handleEvent(e, canvas){

		//get relative coordinates
		let x = e.pageX - canvas.offsetLeft;
    	let y = e.pageY - canvas.offsetTop;
    	//normalize the coordinates
    	x -= this.width/2;
    	y -= this.height/2;

    	//console.log("x:" + x +", y:" + y);


    	for(let i = 0 ; i < this.rectAreas.length ; i++){
    		let curRect = this.rectAreas[i];
    		let xStart = curRect.upperLeft[0];
    		let xEnd = curRect.upperLeft[0] + curRect.width;
    		let yStart = curRect.upperLeft[1];
    		let yEnd = curRect.upperLeft[1] + curRect.height;
    		if( xStart <= x && x <= xEnd && yStart <= y && y <= yEnd){
    			console.log(curRect.label);
    		}
    	}
	}

}

// let myAc = document.registerElement("ability-chart", abilityChart);
// let myA = new myAc;
// myA.properties={ dimension: 300,
// 				 numPoint: 6,
// 				 numLayer:3,
// 				 eachPoint:[{key:"Math", value:85},
// 				 			{key:"Physics", value:30},
// 				 			{key:"English", value:55},
// 				 			{key:"Chemistry", value:100},
// 				 			{key:"Chinese", value:10},
// 				 			{key:"CS", value:100}
// 				 			]
// 				};

// document.querySelector('#abilityChart').appendChild(myA);
customElements.define('ability-chart', AbilityChart);