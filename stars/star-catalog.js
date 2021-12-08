const fs = require('fs');

const code = fs.readFileSync('./readme_sample.txt', {encoding:'utf-8'});
const makeParser = require('./make-parser.js');


const parser = makeParser(code);

const maxVmag = 6.5; //Звёздная величина, которую мы полагаем предельно видимой

const catalog = fs.readFileSync('./catalog', {encoding:'utf-8'}).split(/[\r\n]+/g)
	.map(parser.parse)
	.filter(({Parallax, Vmag})=>(!isNaN(Parallax) && Parallax!=0 &&  !isNaN(Vmag) && Vmag<=maxVmag))
	.map((data)=>{
		data.Dist = 1/Math.abs(data.Parallax); 
		data.Mag = data.Vmag + 5 + 5 * Math.log10(Math.abs(data.Parallax));
		data.Lum = 2.512**(5 - data.Mag);
		
		let maxD = 10**((maxVmag - data.Mag)/5 + 1); 
		data.maxD = maxD; //максимальная дистанция, с которой звезду видно, пк
		
		let cubus = (2*maxD)**3;
		data.cubus = cubus;
		data.p = 1/cubus; //Встречаемость звезды 1/пк^3
		return data;
	})
	
module.exports = catalog;