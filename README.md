# DLM - Digital Left Management

DLM (*Digital Left Management*) é um projeto de sistema centralizado de distribuição de arquivo, com o objetivo de garantir a integridade e unicidade da obra intelectual, tornando único cada item inserido nesse ecossistema e protegendo os direitos autorais atribuídos a ele.

Por se tratar de um sistema com suas transações inspiradas na tecnologia Blockchain, os itens serão rastreáveis por possuir um histórico no arquivo `./base/ledger.json` ("*livro razão*").

Projeto inicialmente desenvolvido no curso Bacharelado em Sistemas de Informação, no Centro Federal de Educação Tecnológica Celso Suckow da Fonseca (CEFET/RJ), situado em Nova Friburgo, RJ - Brasil.
___ 

# Índice

* [Pré-requisitos](#pré-requisitos)
* [Instalação](#instalação)
* [Exemplos](#exemplos)
    * [Transação](#transação)
        * [Primeira transação](#primeira-transação)
        * [Transferência para outro usuário](#transferência-para-outro-usuário)
        * [Transferência para outro usuário por tempo determinado (empréstimo)](#transferência-para-outro-usuário-por-tempo-determinado-empréstimo)
    * [Abrir arquivo](#abrir-arquivo)
* [Próximos passos](#próximos-passos)
* [Contribuidores](#contribuidores)

## Pré-requisitos
- [Node.js](https://nodejs.org/) (>= 8.11.2)

## Instalação

Para instalar todas as dependências do projeto, execute o comando abaixo:

```bash
$ npm install
```

## Utilização

Como o sistema está em desenvolvimento e se trata de um protótipo, todas suas funcionalidades são realizadas através de chamadas ao arquivo `actions.js`, localizado na raiz do projeto. Esse arquivo está preparado para receber parâmetros que serão interpretados e, assim, executará a ação desejada.

Por padrão, os comandos seguiram o seguinte modelo:

```bash
$ node actions.js <função> <param1> [<param2>, <param3>, ...]
```

## Exemplos

### Transação

#### Primeira transação

```bash
$ node actions.js transaction '<nome_da_obra.extensao>' '<usuario_final>'
```

*Ex: Transferir cópia de Beowulf para usuário Wender Machado*

```bash
$ node actions.js transaction 'beowulf.txt' 'Wender Machado'
```

*Processo:*

* Um usuário requisita uma obra informando o nome da obra (com a extensão do arquivo).
* O mediador valida o usuário e, então, começa a gerar os dados do cabeçalho. Gerando uma assinatura, com todos os dados do cabeçalho, ao final cria um par de chaves para poder cifrar o arquivo resultante.
* Com o arquivo cifrado, o mediador registra a transação no *livro razão* e remove a chave usada para cifrá-la, mantendo apenas a chave para decifrar o arquivo.
* A assinatura do arquivo é entregue para o usuário destino da transação.

*Saída esperada:*
```bash
Iniciando uma transação
Criando o cabeçalho
Lendo o objeto intelectual
Executando leitura do arquivo!
Cifrando o objeto intelectual
./files/151c6ee2e4c565d8dbf2f55873acd518.txt salvo!
./keys/d1f6ba1f482c6a68f07b558c1e230195.pem salvo!
Registrando a transação
Salvo novo registro!
Hash:  02f2b214713966b148c92a58a6c81174
```


#### Transferência para outro usuário

```bash
$ node actions.js transaction '<hash>' '<usuario_receptor>'
```

*Processo:*

* Um usuário faz a requisição para o mediador, informando o usuário destino.
* O mediador valida os usuários, tanto utilizador ou proprietário (se for por prazo indeterminado) quanto o usuário destino, e então começa a gerar os dados do novo cabeçalho. Gerando uma assinatura, com todos os dados do cabeçalho, ao final cria um par de chaves para poder cifrar o arquivo resultante.
* Com o arquivo cifrado, o mediador registra a transação no *livro razão* e remove a chave usada para cifrá-la, mantendo apenas a chave para decifrar o arquivo.
* A assinatura do arquivo é entregue para o usuário destino da transação.

*Ex: Transferir cópia de Wender Machado para Renato Pereira*

```bash
$ node actions.js transaction '02f2b214713966b148c92a58a6c81174' 'Renato Pereira'
```

*Saída esperada:*
```bash
Iniciando uma transação
Criando o cabeçalho
Validando usuário
Destruindo chave do usuário
Destruindo arquivo
Lendo o objeto intelectual
Executando leitura do arquivo!
Cifrando o objeto intelectual
./files/2ec7c7785c4e593724daddbe67f289c6.txt salvo!
./keys/7b1eb88a886233dc063cc9660baf3e9c.pem salvo!
Registrando a transação
Salvo novo registro!
Hash:  5199a4c9a0722a26bc7d2171cf4b917b
```

#### Transferência para outro usuário por tempo determinado (empréstimo)

```bash
$ node actions.js transaction '<hash>' '<usuario_receptor>' '<data_vencimento>'
```

*Processo:*

* O mesmo do processo anterior, mas entregando também ao proprietário a assinatura do arquivo, para quando terminar o tempo esse conseguir recuperar o arquivo.

*Ex: Transferir cópia de Renato Pereira para Henrique Júnior até dia 01/08/2018*

```bash
$ node actions.js transaction '5199a4c9a0722a26bc7d2171cf4b917b' 'Henrique Júnior' '01/08/2018'
```

*Saída esperada:*
```bash
Iniciando uma transação
Criando o cabeçalho
Validando usuário
Destruindo chave do usuário
Destruindo arquivo
Lendo o objeto intelectual
Executando leitura do arquivo!
Cifrando o objeto intelectual
./files/72c30c6f510ae3cd3e49dda7d7584072.txt salvo!
./keys/c3c7dfaf71c712564bb7402ae5c5582e.pem salvo!
Registrando a transação
Salvo novo registro!
Hash:  ae617e3afca98ec2eb534058575dea0e
```

*Arquivo ledger.json atualizado*
```json
{
    "02f2b214713966b148c92a58a6c81174": {
        "hash": "02f2b214713966b148c92a58a6c81174",
        "oldHash": null,
        "owner": "Wender Machado",
        "user": "Wender Machado",
        "time": null,
        "date": "2018-06-24T00:03:40.715Z",
        "key": "./keys/d1f6ba1f482c6a68f07b558c1e230195.pem",
        "file": "./storage/beowulf.txt"
    },
    "5199a4c9a0722a26bc7d2171cf4b917b": {
        "hash": "5199a4c9a0722a26bc7d2171cf4b917b",
        "oldHash": "02f2b214713966b148c92a58a6c81174",
        "owner": "Renato Pereira",
        "user": "Renato Pereira",
        "time": null,
        "date": "2018-06-24T00:04:07.266Z",
        "key": "./keys/7b1eb88a886233dc063cc9660baf3e9c.pem",
        "file": "./storage/beowulf.txt"
    },
    "ae617e3afca98ec2eb534058575dea0e": {
        "hash": "ae617e3afca98ec2eb534058575dea0e",
        "oldHash": "5199a4c9a0722a26bc7d2171cf4b917b",
        "owner": "Renato Pereira",
        "user": "Henrique Júnior",
        "time": "2018-08-01T02:00:00.000Z",
        "date": "2018-06-24T00:05:13.313Z",
        "key": "./keys/c3c7dfaf71c712564bb7402ae5c5582e.pem",
        "file": "./storage/beowulf.txt"
    }
}
```
___

### Abrir arquivo

```bash
$ node actions.js open '<caminho/arquivo.extensao>' '<caminho/chave.extensao>' '<nome_usuario>'
```

*Processo:*

* O usuário faz a requisição do objeto ao mediador utilizando a assinatura do objeto para obtê-lo.
* O mediador faz uma validação de autenticidade do usuário, faz uma validação do tempo de empréstimo, e faz a validação se ele é o utilizador do arquivo.
* O mediador devolve ao requisitante o objeto.

*Ex: Abrir cópia criptografada da obra Beowulf, utilizando a chave privada do usuário Henrique Júnior*

```bash
$ node actions.js open './files/72c30c6f510ae3cd3e49dda7d7584072.txt' './keys/c3c7dfaf71c712564bb7402ae5c5582e.pem' 'Henrique Júnior'
```

*Saída esperada:*
```bash
Iniciando o processo para decifrar
Validando usuário
Obtendo objeto intelectual
Executando leitura do arquivo!
Obtendo chave
Executando leitura do arquivo!
Decifrando objeto intelectual
Obtendo cabeçalho do arquivo.
Validando utilizador
#!!HEADER!!#{"oldHash":"5199a4c9a0722a26bc7d2171cf4b917b","owner":"Renato Pereira","user":"Henrique Júnior","time":"2018-01-08T02:00:00.000Z","date":"2018-06-24T00:05:13.313Z"}/!!HEADER!!/The Project Gutenberg EBook of Beowulf

This eBook is for the use of anyone anywhere at no cost and with
almost no restrictions whatsoever.  You may copy it, give it away or
re-use it under the terms of the Project Gutenberg License included
with this eBook or online at www.gutenberg.net


Title: Beowulf
       An Anglo-Saxon Epic Poem, Translated From The Heyne-Socin
       Text by Lesslie Hall


# ... Restante do arquivo
```

## Próximos passos

- [ ] Terminar desenvolvimento da versão 1.0
- [ ] Transformar em API RESTful
- [ ] Descentralizar livro razão entre Moderadores
- [ ] Desenvolver interface gráfica para se comunicar com a futura API


## Contribuidores

- Autores:
    - [Henrique J. S. Oliveira](https://www.facebook.com/henrique.junior.7359)
    - [Renato C. Pereira](https://www.linkedin.com/in/renato-cardoso-pereira-14a99640/)
    - [Wender Machado](https://www.linkedin.com/in/wenderpmachado/)
- Coordenador:
    - [Nilson Mori Lazarin](https://www.linkedin.com/in/nilson-mori-05470335/)
