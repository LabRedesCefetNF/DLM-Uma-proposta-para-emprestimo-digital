const Utils = require('./utils.js');
const Transactions = require('./Transactions.js');

const args = process.argv;

if ( typeof args[2] !== 'undefined' ) {
    switch(args[2]) {
        case 'transaction':
            if( args.length > 6 || args.length < 5 ) {
                console.log('Argumentos inválidos!');
                return false;
            }

            Transactions.build(args[3], args[4], args[5]);
        break;

        case 'open':
            if( args.length !== 6 ) {
                console.log('Argumentos inválidos!');
                return false;
            }

            Utils.decrypt(args[3], args[4], args[5])
                .then(function(res) {
                    console.log(res);
                })
                .catch( function(err) {
                    console.error(err);
                });
        break;

        case 'recover':
            if( args.length !== 5 ) {
                console.log('Argumentos inválidos!');
                return false;
            }

            Transactions.recover(args[3], args[4]);
        break;
    }
}


/* ---- Build transaction ---- */

// Requires
// oldHash or file
// user
// time

/*
**** utils.validateAccount();
**** utils.validateUser();
**** utils.buildHeader();
**** utils.buildHash();
**** utils.buildKey();
**** utils.encrypt();
**** Ledger.save();
*/


/* ---- Get file ---- */

// Requires
// hash
// user

/*
**** utils.validateAccount();
**** utils.validateUser();
**** utils.getFile();
**** utils.destroyFile();
*/


/* ---- Get key ---- */

// Requires
// hash
// user

/*
**** utils.validateAccount();
**** utils.validateUser();
**** utils.getFile();
**** utils.destroyFile();
*/
