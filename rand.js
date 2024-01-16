function rizz(){
    const ones = [
        'one',
        'uno',
        'un',
        'një',
        'bat',
        'unu',
        'üks',
        'een',
        'en',
        'eins',
        'ένας',
        'viens',
        'один',
        'איינער',
        'ਇੱਕ',
        'एक',
        'واحد',
        'ʻekahi',
        'isa'
    ]
    const random = Math.floor(Math.random() * ones.length);
    document.getElementById('red').innerHTML = ones[random];
    document.getElementById('red').classList.add('red');
    console.log(ones[random]);
}
function redden(){
    document.getElementById('red').style.textShadow = '0 0 4px #000000';
    document.getElementById('red').style.cursor = 'pointer';
}
function unredden(){
    document.getElementById('red').style.textShadow = 'none';
    document.getElementById('red').style.cursor = 'default';
}
