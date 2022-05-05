const fs = require('fs');
const Crypto = require('crypto');
const NodeRSA = require('node-rsa');

const accountsPath = './base/accounts.json';

const Header = require('./Models/Header.js');

const Ledger = require('./Ledger.js');

const extensions = {
    file: '.txt',
    key: '.pem'
};

const path = {
    keys: './keys/',
    files: './files/',
    storage: './storage/'
};

const Utils = {
    buildFile: function(file, fileName = null, isKey = false) {
        return new Promise((resolve, reject) => {
            if ( fileName === null ) {
                fileName = Crypto.createHash('md5').update(file).digest('hex');
            }

            fileName = isKey ? path.keys + fileName + extensions.key : path.files + fileName + extensions.file;

            try {
                fs.writeFile( fileName, file, function (err) {
                    if (err) throw err;

                    console.log(fileName, 'salvo!');
                    resolve(fileName);
                });
            } catch( err ) {
                reject(err)
            }
        });
    },
    buildHeader: function(file, user, time = null) {
        let _this = this;

        return new Promise((resolve, reject) => {
            let result = {
                header: Header,
                file: path.storage + file
            };

            if (fs.existsSync(path.storage + file)) {
                result.header.owner = user;
                result.header.oldHash = null;
                result.header.time = null;
                result.header.user = user;
                result.header.date = new Date();

                resolve(result);
            } else {
                Ledger.find(file)
                    .then( function(res) {
                        let oldTransaction = res;

                        if ( !_this.validateAccount(user) ) {
                            return false;
                        }

                        console.log('Destruindo chave do usuário');
                        _this.destroyFile(res.key)
                            .then(function(res) {
                                result.header.owner = time === null ? user : oldTransaction.owner;
                                result.header.oldHash = oldTransaction.hash;
                                result.header.time = (oldTransaction.time !== null ? oldTransaction.time : (time === null ? null : new Date(time)));
                                result.header.user = user;
                                result.header.date = new Date();

                                result.file = oldTransaction.file;

                                resolve(result);
                            })
                            .catch(function(err) {
                                console.error(err);
                            });
                    })
                    .catch(function(err) {
                        console.error(err);
                    });
            }

        });
    },
    buildHeaderData: function(content) {
        return ('#!!HEADER!!#' + content + '/!!HEADER!!/');
    },
    decrypt: function(file, key, user) {
        const _this = this;

        console.log('Iniciando o processo para decifrar');

        return new Promise((resolve, reject) => {
            if( !_this.validateAccount(user) ) {
                reject('Usuário inválido');

                return false;
            }

            console.log('Obtendo objeto intelectual');
            _this.readFile(file)
                .then(function(res) {
                    const encrypted = res.toString('utf8');

                    console.log('Obtendo chave');
                    _this.readFile(key)
                        .then(function(res) {
                            const secureKey = res.toString('utf8');

                            try {
                                const newKey = new NodeRSA();
                                newKey.importKey(secureKey);

                                console.log('Decifrando objeto intelectual');
                                const decrypted = newKey.decrypt(encrypted, 'utf8');
                                const header = _this.readHeader(decrypted);

                                if ( _this.validateUser(header, user) ) {
                                    resolve(decrypted);
                                } else {
                                    _this.destroyFile(key)
                                        .then(function(res) {
                                            console.log(res);
                                        })
                                        .catch(function(err){
                                            console.error(err);
                                        });
                                    reject('Usuário inválido');
                                }
                            } catch( err ) {
                                reject(err);
                            }
                        })
                        .catch(function(err) {
                            reject(err);
                        });
                })
                .catch(function(err) {
                    reject(err);
                });
        })
    },
    destroyFile: function(file) {
        return new Promise((resolve, reject) => {
            try {
                console.log('Destruindo arquivo');
                fs.unlink(file, function (err) {
                    if (err) throw err;
                    resolve('Arquivo deletado!');
                });
            } catch( err ) {
                reject(err);
            }
        });
    },
    encrypt: function(content) {
        const _this = this;

        return new Promise((resolve, reject) => {
            const key = new NodeRSA({b: 2048});

            const privateKey = key.exportKey('pkcs1-private-prem');
            const encrypted = key.encrypt(content, 'base64');

            _this.buildFile(encrypted)
                .then(function(res) {
                    const encryptedFileName = res;

                    _this.buildFile(privateKey, null, true)
                        .then(function(res) {
                            const result = {
                                key: res,
                                file: encryptedFileName,
                                hash: Crypto.createHash('md5').update(content).digest('hex')
                            };

                            resolve(result);
                        })
                        .catch(function(err) {
                            console.error(err);
                            reject(err);
                        });
                })
                .catch(function(err) {
                    console.error(err);
                    reject(err);
                });
        });
    },
    readFile: function(file) {
        console.log('Executando leitura do arquivo!');
        return new Promise((resolve, reject) => {
            fs.readFile(file, function(err, data) {
                if (err) reject(err);

                data = data.toString('utf8');
                resolve(data);
            });
        });
    },
    readHeader: function(content) {
        console.log('Obtendo cabeçalho do arquivo.');
        const regex = new RegExp('#!!HEADER!!#(.*?)\/!!HEADER!!\/');

        if ( regex.test(content) ) {
            header = regex.exec(content)[0].replace('#!!HEADER!!#', '').replace('/!!HEADER!!/', '');
            return JSON.parse(header);
        } else {
            console.error('Header not found');
        }
    },
    validateAccount: function(account) {
        console.log('Validando usuário');
        let accounts = require(accountsPath);

        return accounts.find((element) => (element === account));
    },
    validateUser: function(header, user) {
        console.log('Validando utilizador');
        return header.user === user;
    },
    validateOwner: function(header, user) {
        console.log('Validando utilizador');
        return header.owner === user;
    }
};

module.exports = Utils;
