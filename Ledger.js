const fs = require('fs');

const ledgerPath = './base/ledger.json';

const Ledger = {
    find: (hash) => {
        return new Promise((resolve, reject) => {
            try {
                fs.readFile(ledgerPath, function(err, data) {
                    if (err) throw err;
                    data = JSON.parse(data);
                    const res = data[hash];

                    if ( typeof res === 'undefined' ) {
                        reject('Content not found!');
                    }

                    resolve(res);
                });
            } catch( error ) {
                console.error(error);
                reject(error);
            }
        });
    },
    save: (Transaction)  => {
        return new Promise((resolve, reject) => {
            try {
                let ledger = require(ledgerPath);

                ledger[Transaction.hash] = Transaction;
                ledger = JSON.stringify(ledger);

                fs.writeFile(ledgerPath, ledger, function (err) {
                    if (err) throw err;
                    console.log('Salvo novo registro!');
                    console.log('Hash: ', Transaction.hash);

                    resolve(true);
                });
            } catch( error ) {
                reject(false);
            }
        });
    }
};
module.exports = Ledger;
