const catalog = require('./star-catalog.js');
const {Vector3} = require('@grunmouse/math-vector');
const roulette = require('./roulette.js');
const  {
	bv_to_rgb
} = require('./color_table.js');


const maxD = catalog.reduce((akk, {maxD})=>(Math.max(akk, maxD)), 0);
const count_pc = (table)=>(table.reduce((akk, {p})=>(akk+p), 0)); //Штук на кубический парсек

const dist = [100, 1000, 10000];

let ret = [];
for(let i=0; i<dist.length; ++i){
	const maxDist = dist[i];
	const minDist = dist[i-1]||0;
	const table = catalog.filter(({maxD})=>(maxD>minDist && maxD<=maxDist));
	
	const by_pc = count_pc(table);
	const a = maxDist*2; // Сторона куба
	const volume = a**3; 
	const count = by_pc * volume * 6/Math.PI; //Количество звёзд с учётом отношения объёмов куба и шара
	const roul = roulette(table.map(data=>(data.p)));
	
	function randomStar(){
		let index = roul();
		return table[index];
	}
	
	const result = [];
	for(let j = 0; j<=count; ++j){
		let r = new Vector3(
			Math.random()*a - maxDist,
			Math.random()*a - maxDist,
			Math.random()*a - maxDist
		);
		let d = r.abs();
		let star = randomStar();
		if(star.maxD>=d){
			let {
				HR, 
				Mag, 
				Lum,
				SpType,
				['B-V']:BV,
				['U-B']:UB
			} = star;
			let color = bv_to_rgb(BV);
			if(!color){
				console.log(BV, SpType);
				color = bv_to_rgb(0); //Плохая заплатка, надо читать спектральный класс
			}
			result.push({
				r, 
				HR, 
				Mag, 
				Lum, 
				SpType, 
				BV, 
				UB, 
				Dist:d,
				Vmag: Mag - 5 * (1  - Math.log10(d)),
				color
			});
		}
	}
	
	ret.push(result);
	console.log(maxDist, table.length, count, result.length);
}

ret = ret.flat();

const magscale = 0.1;
const markers = ret.map((data)=>{
	let {phi, theta} = data.r.toSpheric();
	phi = phi*180/Math.PI;
	theta = 90 - (theta*180/Math.PI);
	
	let mag = (6.5 - data.Vmag) * magscale;
	return `<circle cx="${phi}" cy="${theta}" r="${mag}" stroke="none" fill="${data.color}" />`;
});

const code = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg 
    baseProfile="full"
    xmlns = "http://www.w3.org/2000/svg" 
    xmlns:xlink = "http://www.w3.org/1999/xlink"
    xmlns:ev = "http://www.w3.org/2001/xml-events"	
	height="900" width="1800"
>
<g transform="scale(5 5) translate(180 90)">
<rect x="-180" y="-90" width="360" height="180" stroke="black" fill="black" />
${markers.join('\n')}
</g>
</svg>`;

require('fs').writeFileSync("exp.svg", code);