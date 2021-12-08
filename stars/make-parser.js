/**
 * Генерирует парсер каталога по таблице, взятой из ReadMe
 
--------------------------------------------------------------------------------
   Bytes Format  Units   Label    Explanations
--------------------------------------------------------------------------------
 * @param code - текст тела таблицы (только строки)
 */
function makeParser(code){
	const lines = code.split(/[\r\n]+/g);

	//console.log(lines);
	const fields = [];
	let lastField;

	for(let line of lines){
		let bytes = line.slice(0, 9);
		let explanations = line.slice(33);
		let substr = line.slice(9, 33);
		if(bytes.trim().length === 0){
			lastField.explanations += '\n' + explanations;
		}
		else{
			let [format, unit, label] = substr.trim().split(/\s+/g);
			bytes = bytes.split('-').map((a)=>(Number(a.trim())));
			if(bytes.length === 1){
				bytes[1] = bytes[0]
			}
			lastField = {
				bytes,
				format,
				unit,
				label,
				explanations
			};
			fields.push(lastField);
		}
	}

	const parse = function(str){
		let obj = {};
		for(let config of fields){
			let {bytes, label, format} = config;
			let substr = str.slice(bytes[0]-1, bytes[1]).trim();
			let value;
			switch(format[0]){
				case 'F':
					value = parseFloat(substr);
					break;
				case 'I':
					value = parseInt(substr);
					break;
				default:
					value = substr;
			}
			obj[label] = value;
		}
		return obj;
	}
	
	return {
		fields,
		parse
	};
}

module.exports = makeParser;