import test from 'ava';
import hash from '.';

test('1 string hash', t => {

    let rs = hash('12345');
    t.is(rs, '1pmgnno');

});

test('2 file hash', t => {

    let file = './.npmignore';
    let rs = hash({file});
    t.is(rs, '1dqc6vo');

});

test('3 file not found', t => {

    let file = './xxx.yyy.zzz';
    t.throws(()=>hash({file}));

});

test('4 hash null', t => {

    let rs = hash(null);
    t.is(rs, '15ed');

});


test('5 file contents hash', t => {

    let contents = require('fs').readFileSync('./.npmignore');
    let rs = hash({contents});
    t.is(rs, '1dqc6vo');

});




