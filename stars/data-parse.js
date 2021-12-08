const fs = require('fs');

const code = fs.readFileSync('./readme_sample.txt', {encoding:'utf-8'});
const makeParser = require('./make-parser.js');


//console.table(fields);

const parser = makeParser(code);

const maxVmag = 6.5;

const catalog = fs.readFileSync('./catalog', {encoding:'utf-8'}).split(/[\r\n]+/g)
	.map(parser.parse)
	.filter(({Parallax, Vmag})=>(Parallax === Parallax && Parallax!=0 &&  Vmag === Vmag && Vmag<=maxVmag))
	.map((data)=>{
		data.Dist = 1/Math.abs(data.Parallax); 
		data.Mag = data.Vmag + 5 + 5 * Math.log10(Math.abs(data.Parallax));
		
		let maxD = 10**((maxVmag - data.Mag)/5 + 1); //максимальная дистанция, с которой звезду видно
		data.maxD = maxD;
		data.Lum = 2.512**(5 - data.Mag);
		
		let cubus = maxD**3;
		data.cubus = cubus;
		data.p = 1/cubus; //Встречаемость звезды 1/пк^3
		return data;
	})
	//.slice(0,100)
	;
//console.table(catalog.slice(0,100), ['Name', 'HR', 'Vmag', 'n_Vmag', 'SpType', 'B-V', 'U-B']);

const roulette = require('./roulette.js');
const  {
	bv_to_rgb
} = require('./color_table.js');

const ro = catalog.reduce((akk, data)=>(akk+data.p), 0); //Средняя плотность звёздного населения 1/пк^3
const P = catalog.map((data)=>(data.p));
const roul = roulette(P);

