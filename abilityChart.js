"use strict";

class AbilityChart extends HTMLElement {

	static get observedAttributes() {return ['prop']; }

	constructor(){
		super();
		this.buildChart();
	}

	buildChart(){
		this.initData();
		this.initChart();
	}

	initData(){
		let prop = JSON.parse(this.getAttribute("prop"));
		this.dimension = prop.dimension? prop.dimension : 300;
		this.numLayer = prop.numLayer? prop.numLayer : 1;
		this.labelFont = prop.labelFont? prop.labelFont : "12px Arial";
		this.labelFontColor = prop.labelFontColor? prop.labelFontColor : null;
		this.fillColor = prop.fillColor? prop.fillColor : null;
		this.frameBorderWidth = prop.frameBorderWidth? prop.frameBorderWidth : null;
		this.chartBorderWidth = prop.chartBorderWidth? prop.chartBorderWidth : null;
		this.borderColor = prop.borderColor? prop.borderColor : null;
		this.decorLineColor = prop.decorLineColor? prop.decorLineColor : null;
		this.chartPortion = prop.chartPortion? prop.chartPortion : 0.85;
		this.chartAlpha = prop.chartAlpha? prop.chartAlpha : null;
		this.eachVal = [];
		this.eachLabel = [];
		if(prop.eachLayerStyle){
			this.eachLayerStyle = [];
			prop.eachLayerStyle.map((obj) => {
				let tempStyle = [];
				tempStyle.push(obj.fillColor);
				tempStyle.push(obj.borderColor);
				this.eachLayerStyle.push(tempStyle);
			});
		}
		prop.eachPoint.map((obj) => {
			let normalizedVal = (obj.value/100).toFixed(2);
			this.eachVal.push(normalizedVal);
			this.eachLabel.push(obj.key);
		});
		this.numPoint = this.eachVal.length;
	}


	initChart(){
		if(this.dimension && this.dimension && this.numPoint){
			this.innerHTML = `
			<canvas width=${this.dimension} height=${this.dimension}></canvas>`;
			let canvas = this.querySelector('canvas');
			if(canvas.getContext){
				let ctx = canvas.getContext('2d');
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				this.drawChart(ctx);
			}
		}
	}

	drawChart(ctx){
		//outter frame & layer
		for(let i = 0 ; i < this.numLayer ; i++){
			let tempK = [];
			let coef = 1 - (1/this.numLayer)*i;
			for(let j = 0 ; j < this.numPoint ; j++){
				tempK.push(coef);
			}
			this.drawPolygon(ctx ,this.dimension/2, this.dimension/2, this.chartPortion*this.dimension/2, this.numPoint, tempK, this.eachLayerStyle? this.eachLayerStyle[i][0] : null, this.frameBorderWidth, this.eachLayerStyle? this.eachLayerStyle[i][1] : null);
		}
		//center to vertex line
		this.drawDecorationLine(ctx ,this.dimension/2, this.dimension/2, this.chartPortion*this.dimension/2, this.numPoint);
		//actual chart
		this.drawPolygon(ctx ,this.dimension/2, this.dimension/2, this.chartPortion*this.dimension/2, this.numPoint, this.eachVal, this.fillColor, this.chartBorderWidth, this.borderColor, this.chartAlpha);
		//recompute should've finished by this time
		this.reCompute = false;
	}

	generateAnchorPts(radius, sides){
		if(!this.anchorPts || this.reCompute){
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
		}
		ctx.moveTo(k[0] * this.anchorPts[0][0],
				   k[0] * this.anchorPts[0][1])
		for (let i = 1 ; i < this.anchorPts.length ; i++) {
			ctx.lineTo(k[i] * this.anchorPts[i][0],
				   	   k[i] * this.anchorPts[i][1]);
		}
		ctx.closePath();

		if(alpha)
			ctx.globalAlpha = alpha;

		if(fillColor){
			ctx.fillStyle = fillColor;

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
			let maxWidth = this.dimension;
			if(i == 0 || ((this.numPoint%2 == 0) && (i == (this.numPoint-2)/2 + 1))){
				alignment = "center";
			}
			else if(i > (this.numPoint-2)/2 + 1){
				alignment = "end";
				maxWidth = this.dimension/2 + this.anchorPts[i][0];
			}
			else{
				maxWidth = this.dimension/2 - this.anchorPts[i][0];
			}

			if(this.anchorPts[i][1] > 0.0000001){
				alignment += "Top";
			}
			else if(this.anchorPts[i][1] < -0.0000001){
				alignment += "Bot";
			}
			this.drawText(ctx, this.eachLabel[i], this.labelFont, this.labelFontColor, alignment, x, y, this.anchorPts[i][0], this.anchorPts[i][1], maxWidth);
		}
	}

	drawLine(ctx, x0, y0, x1, y1, decorLineWidth, decorLineColor){
		ctx.save();
		ctx.beginPath();
		ctx.translate(x0, y0);
		ctx.moveTo(0, 0);
		ctx.lineTo(x1, y1);
		if(decorLineWidth)
			ctx.lineWidth = decorLineWidth;
		if(decorLineColor)
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

		if(alignment.indexOf("Top") >= 0){
			ctx.textBaseline = "top";
		}
		else if(alignment.indexOf("Bot") >= 0){
			ctx.textBaseline = "bottom";
		}
		else{
			ctx.textBaseline = "middle";
		}

		if(alignment.indexOf("center") >= 0){
			ctx.textAlign = "center";
		}
		else if(alignment.indexOf("end") >= 0){
			ctx.textAlign = "end";
		}
		else if(alignment.indexOf("start") >= 0){
			ctx.textAlign = "start";
		}
		ctx.translate(x0, y0);
		ctx.fillText(text, x1, y1, maxWidth);
		ctx.restore();
	}

	attributeChangedCallback(attr, oldVal, newVal){
		this.reCompute = true;
		this.buildChart();
	}

}
window.customElements.define('ability-chart', AbilityChart);