const Btf = require('@gotoeasy/btf');

let txt = `d:/ssss.btf`;


    let btf = new Btf(txt);
    let docs = btf.getDocuments();


docs.forEach(doc => {
    console.info(doc.getText('ssss'))
});
