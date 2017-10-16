"use strict";

class abilityChart extends HTMLElement {
	
	constructor(){
		super();
	}

	createdCallback(){
		this.innerHTML = `
		<canvas></canvas>`;
		var canvas = this.querySelector('canvas');
		if(canvas.getContext){
			var ctx = canvas.getContext('2d');
			ctx.fillRect(25, 25, 100, 100);
		}
	}

	attachedCallback(){

	}

	detachedCallback() {

	}

	attributeChangedCallback(attr, oldVal, newVal){

	}

}

var myAc = document.registerElement("ability-chart", abilityChart);
var myA = new myAc;
document.querySelector('#abilityChart').appendChild(myA);
