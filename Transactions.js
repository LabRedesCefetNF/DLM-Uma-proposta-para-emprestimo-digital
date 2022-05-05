const Transaction = require('./Models/Transaction.js');

const Ledger = require('./Ledger.js');
const utils = require('./utils.js');

const Transactions = {
    validate: (hash, user) => {
        return new Promise((resolve, reject) => {
            try {
                const transaction = Ledger.find(hash);

                if ( transaction.user === user ) {
                    resolve(true);
                } else {
                    reject('Invalide user');
                }
            } catch( error ) {
                reject(error);
            }
        });
    },
    build: (file, user, time)  => {
        console.log('Iniciando uma transação')
        let header;
        let archive;

        console.log('Criando o cabeçalho');
        utils.buildHeader(file, user, time)
            .then(function(res) {
                header = res.header;
                archive = res.file;

                console.log('Lendo o objeto intelectual');
                utils.readFile(archive)
                    .then(function(res) {
                        let newContent = utils.buildHeaderData(JSON.stringify(header)) + res;

                        console.log('Cifrando o objeto intelectual');
                        utils.encrypt(newContent)
                            .then(function(res) {
                                let transaction = Transaction;

                                transaction = {
                                    hash: res.hash,
                                    oldHash: header.oldHash,
                                    owner: header.owner,
                                    user: header.user,
                                    time: header.time,
                                    date: header.date,
                                    key: res.key,
                                    file: archive
                                };

                                console.log('Registrando a transação');
                                Ledger.save(transaction)
                                    .then(function(res) {
                                        console.log(res);
                                    })
                                    .catch(function(err) {
                                        console.error(err);
                                    });
                            })
                            .catch(function(err) {
                                console.error(err);
                            });

                    })
                    .catch(function(err) {
                        console.error(err);
                    });
            });
    },
    recover: function(hash, owner) {
        console.log('Recuperando um arquivo com tempo expirado!')
        let header,
            archive,
            oldHash = hash,
            _this = this;

        function recoverLoop() {
            return Ledger.find(hash)
                    .then(function(res) {
                        if ( res.owner !== owner ) {
                            reject('Usuário não é o proprietário');
                        }

                        oldHash = hash;
                        file = res.file;
                        user = res.user;
                        time = res.time;

                        console.log('Criando o cabeçalho');
                        utils.buildHeader(file, user, time)
                            .then(function(res) {
                                header = res.header;
                                archive = res.file;

                                console.log('Lendo o objeto intelectual');
                                utils.readFile(archive)
                                    .then(function(res) {
                                        let content = utils.buildHeaderData(JSON.stringify(header)) + res;
                                        hash = Crypto.createHash('md5').update(content).digest('hex');

                                        return recoverLoop();
                                    })
                                    .catch(function(err) {
                                        console.error(err);
                                    });
                            })
                            .catch(function(err) {
                                console.error(err);
                            });
                    })
                    .catch(function(err) {
                        console.log('Hash não encontrado');
                        hash = null;
                    });
        }

        recoverLoop()
            .then(function(res) {
                _this.build(oldHash, owner);
            })
            .catch(function(err) {
                console.error(err);
            });
    }
};
module.exports = Transactions;
