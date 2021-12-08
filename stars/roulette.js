const {
	flags,
	bigint,
	float64
} = require('@grunmouse/binary');

function toRational(number){
	const {sizedMant, sizedExp, sign} = float64.decomp(number);
	let nom = sizedMant * [1n, -1n][sign];
	let dexp = -sizedExp;
	
	return {nom, dexp};
}

function toCommonDenom(arr){
	let maxDexp = arr.reduce((akk, a)=>(a.dexp > akk ? a.dexp : akk), 0);
	
	return arr.map(({nom, dexp})=>{
		let ex = maxDexp - dexp;
		return {
			nom: nom<<ex,
			dexp: maxDexp
		};
	});
}


function locationOf(element, array, comparer, start, end) {
    if (array.length === 0){
        return -1;
	}

    start = start || 0;
    end = end || array.length;
	
    var pivot = (start + end) >> 1;  // should be faster than dividing by 2

    var c = comparer(element, array[pivot]);
    
	if (end - start <= 1){
		return c < 0 ? pivot - 1 : pivot;
	}

	if(c<0){
		return locationOf(element, array, comparer, start, pivot);
	}
	else if(c>0){
		return locationOf(element, array, comparer, pivot, end);
	}
	else{
		return pivot;
	}
};

const random = Math.random;

function dice(Z){
	return Math.floor(random()*Z);
}

function money(T){
	return +(random()>T); //1, если порог превышен
}


/**
 * Генерирует функцию рулетки
 * @param p : Array - массив масштабированных вероятностей.
 * Масштабированная вероятность может выражаться любым числом, а за вероятности 1 соответствует сумма всего массива
 */
function roulette(P){
	const Z = P.length;
	const sum = P.reduce((akk, p)=>(akk+p), 0);
	const mid = sum/P.length; // Средняя вероятность
	const F = P.map((p, i)=>(
		{
			i:i,
			p:p,
			h:p
		}
	)); //Поля для дротика, нормализованные, но пока не утрамбованные
	//Для нормализованной вероятности h единицей служит mid
	
	const A = F.slice(0); // Создаём рабочий массив, из него будут удаляться законченные поля
	const comparer = (a,b)=>(b.h - a.h);
	A.sort(comparer); //Сортируем по убыванию высоты.

	let ctrl = 0;
	while(true){
		let x = A.findIndex(f=>(f.h > mid));
		let big = A[x];
		let small = A.pop();
		small.j = big.i;
		big.h =  big.h - mid + small.h;
		A.splice(x, 1);
		if(big.h !== mid){
			A.splice(locationOf(big, A, comparer) + 1, 0, big);
		}
		if(A.length < 2){
			break;
		}
		++ctrl;
	}
	
	for(let f of F){
		f.h = f.h/mid;
	}
	
	return function(){
		let i = dice(Z);
		let f = F[i];
		if(isNaN(f.j)){
			return f.i;
		}
		else{
			let j = money(f.h);
			return [f.i, f.j][j];
		}
	}
}

module.exports = roulette;
