const fs = require('fs');
const crypto = require('crypto');

const NodeRSA = require('node-rsa');

const openInEditor = require('open-in-editor');
const editor = openInEditor.configure({
  editor: 'vim'
}, function (err) {
  console.error('Something went wrong: ' + err);
});

const exp = new RegExp('#!!HEADER!!#(.*?)\/!!HEADER!!\/');

buildTransaction = function (file, owner, hash = null, user = null, time = null) {
    if (fs.existsSync(file)) {
        var header = {
            owner: owner,
            oldHash: hash,
            time: time,
            user: user === null ? owner : user
        };
    } else {
        // var header = {
        //     owner: owner,
        //     oldHash: hash,
        //     time: time,
        //     user: user === null ? owner : user
        // };
    }

    buildDocument(header, file);
};

buildDocument = function(header, file) {
    var content = '#!!HEADER!!#' + JSON.stringify(header) + '/!!HEADER!!/';

    fs.readFile(file, function(err, data) {
        if (err) throw err;
        content += data;

        var hash = crypto.createHash('md5').update(content).digest('hex');

        cryptDocument(hash, content, header, file);
    });
};

cryptDocument = (hash, document, header, file) => {
    const dir = header.user;
    const archive = './' + header.user + '/' + hash;

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    var key = new NodeRSA({b: 512});
    var privateKey = key.exportKey('pkcs1-private-prem');

    const encrypted = key.encrypt(document, 'base64');

    fs.writeFile(archive + '.txt', encrypted, function (err, data) {
        if (err) throw err;
        console.log('Saved file!');
    });

    fs.writeFile(archive + '.pem', privateKey, function (err, data) {
        if (err) throw err;
        console.log('Saved pem!');
    });

    registerTransaction(hash, header, file);
};

registerTransaction = function(hash, header, file) {
    const fileName = './ledger.json';
    const archive = './' + header.user + '/' + hash;

    let ledger = require(fileName);

    ledger[hash] = {
        hash: hash,
        owner: header.owner,
        oldHash: header.oldHash,
        time: header.time,
        user: header.user,
        key: archive + '.pem',
        file: file
    };

    transaction = JSON.stringify(ledger);

    fs.writeFile(fileName, transaction, function (err) {
        if (err) throw err;
        console.log('Saved ledger!');
        console.log('Hash: ' + hash);
    });
};

decryptDocument = (hash) => {
    fs.readFile('./ledger.json', function(err, data) {
        data = JSON.parse(data);
        const transaction = data[hash];
        const archive = './' + transaction.user + '/' + hash;

        fs.readFile(transaction.key, function(err, privateKey) {
            if (err) throw err;

            privateKey = privateKey.toString('utf8');

            const secureKey = new NodeRSA();
            secureKey.importKey(privateKey);

            fs.readFile(archive + '.txt', function(err, encrypted) {
                if (err) throw err;

                encrypted = encrypted.toString('utf8');

                const decrypted = secureKey.decrypt(encrypted, 'utf8');
                console.log(decrypted);
            });
        });
    });
}

getHeader = function(file, key = null) {
    if ( key === null ) {
        // Chamar função para tentar pegar chave
        return false;
    }

    return new Promise((resolve, reject) => {
        fs.readFile(key, function(err, privateKey) {
          if (err) throw err;

          privateKey = privateKey.toString('utf8');

          const secureKey = new NodeRSA();
          secureKey.importKey(privateKey);

          return fs.readFile(file, function(err, encrypted) {
              if (err) throw err;

              encrypted = encrypted.toString('utf8');

              try {
                  const decrypted = secureKey.decrypt(encrypted, 'utf8');
                  header = exp.exec(decrypted)[0].replace('#!!HEADER!!#', '').replace('/!!HEADER!!/', '');
                  resolve(header);
              } catch (error) {
                  privateKey = null;
                  destroyFile(key);
                  reject(false);
              }
          });
        });
    });
}

validateUser = function(file, key, user) {
  return new Promise((resolve, reject) => {
    getHeader(file, key).then(function(res){
      var header = JSON.parse(res);

      resolve(header.user === user);
    });
  });
}

readFile = function(file, key, user) {
    validateUser(file, key, user).then(function(res) {
      if ( !res ) {
        destroyFile(key);
        return false;

      } else {
        fs.readFile(key, function(err, privateKey) {
            if (err) throw err;

            privateKey = privateKey.toString('utf8');

            const secureKey = new NodeRSA();
            secureKey.importKey(privateKey);

            fs.readFile(file, function(err, encrypted) {
                if (err) throw err;

                encrypted = encrypted.toString('utf8');

                let decrypted = secureKey.decrypt(encrypted, 'utf8');
                decrypted = decrypted.replace(exp.exec(decrypted)[0], '');

                console.log(decrypted);
            });
        });
      }
    });
}

destroyFile = function(key) {
    fs.unlink(key, function (err) {
        if (err) throw err;
        console.log('Chave deletada!');
    });
}

const args = process.argv;

if ( typeof args[2] !== 'undefined' ) {
    switch(args[2]) {
        case 'build':
            buildTransaction( args[3], args[4] );
        break;
        case 'read':
            const path = args[3];
            readFile( path + '.txt', path + '.pem', args[4] );
        break;
    }
}

// buildTransaction('./livro.txt', 'Renato Pereira');
// buildTransaction('./livro.txt', 'Renato Cardoso');
// readFile('./Renato Pereira/8c5cf77b769ff3055d09c8b9e36ae7f5.txt', './Renato Pereira/8c5cf77b769ff3055d09c8b9e36ae7f5.pem', 'Renato Pereira');
// decryptDocument('8c5cf77b769ff3055d09c8b9e36ae7f5');


    // Gerar primeira transação
    // buildTransaction('./livro_01.txt', 'Usuário 01');
    // Ler arquivo
    // readFile('./Usuário 01/.txt', './Usuário 01/.pem', 'Usuário 01');
    // Gerar segunda transação
    // buildTransaction('./livro_02.txt', 'Usuário 02');
    // Gerar terceira transação
    // buildTransaction('./livro_03.txt', 'Usuário 03');
    // Gerar quarta transação
    // buildTransaction('./livro_04.txt', 'Usuário 04');
    // Gerar quinta transação
    // buildTransaction('./livro_05.txt', 'Usuário 05');
    // Ler arquivo 2
    // readFile('./Usuário 02/.txt', './Usuário 02/.pem', 'Usuário 02');
    // Ler arquivo 3 com chave errada
    // readFile('./Usuário 03/.txt', './Usuário 03/.pem', 'Usuário 03');
    // Ler arquivo 4 sem chave
    // readFile('./Usuário 04/.txt', './Usuário 04/.pem', 'Usuário 04');
    // Ler arquivo 5 com usuário errado
    // readFile('./Usuário 05/.txt', './Usuário 05/.pem', 'Usuário 05');
    // Gerar transação a partir da primeira transação
    // buildTransaction('hash', 'Usuário 01', 'Usuário 02');
    // Gerar transação de empréstimo da segunda transação
    // buildTransaction('hash', 'Usuário 02', 'Usuário 03');
    // Gerar transação de empréstimo da segunda transação
    // buildTransaction('hash', 'Usuário 03', 'Usuário 04');
    // Recuperar arquivo expirado da segunda transação
    // readFile('./Usuário 02/.txt', './Usuário 02/.pem', 'Usuário 02');
