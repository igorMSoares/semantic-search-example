# Pesquisa Semântica

Um exemplo passo a passo de como utilizar [Pinecone](https://www.pinecone.io/) para pesquisa semântica.

[Aqui](https://github.com/pinecone-io/semantic-search-example) você pode ver o exemplo original criado pela equipe do Pinecone e com mais detalhes sobre a implementação.

## Base de conhecimentos

Como texto base, foi utilizado o [roteiro do vídeo do Fábio Akita](https://www.akitaonrails.com/2023/12/16/akitando-149-configurando-docker-compose-postgres-com-testes-de-carga-parte-final-da-rinha-de-backend) `"Configurando Docker Compose, Postgres, com Testes de Carga - Parte Final da Rinha de Backend"`

### Segmentação Semântica

Os trechos (`chunks`) do texto original poderão ser criados utilizando a biblioteca [semantic-chunking](https://github.com/jparkerweb/semantic-chunking), que irá segmentar o texto original em pedaços com uma quantidade máxima de tokens especificada via parâmetro.

Os _chunks_ gerados irão manter as mesmas frases do texto original, sem interpretá-las, resumí-las ou alterá-las de nenhuma forma. E é garantido que os trechos sempre irão incluir frases completas, agrupadas semanticamente utilizando similaridade de cosenos.

Na branch [main](https://github.com/igorMSoares/semantic-search-example/) os segmentos foram criados utilizando o Chat-GPT para fazer o _Semantic Chunking_ de forma a obter uma versão em markdown com o texto original resumido em seções semânticas identificadas por título e tópicos associados a essa seção.

## Setup

Requisitos:

- `Node.js` versão >=18.0.0

Clone o repositório e instale as dependências.

```sh
git clone git@github.com:igorMSoares/semantic-search-example.git
npm install
```

### Configuração

Para rodar este projeto você precisará das suas credencias do Pinecone para interagir com a API do Pinecone. Caso ainda não tenha uma conta, [acesse o site](https://www.pinecone.io/) para registrar-se (opção free-tier disponível).

Copie o template de configuração:

```sh
cp .env.example .env
```

E preencha com sua chave de API e nome do index:

```sh
PINECONE_API_KEY=<sua-chave-de-api>
PINECONE_INDEX="roteiro-akita-rinha"
PINECONE_CLOUD="gcp"
PINECONE_REGION="us-central-1"
```

O índice Pinecone criado deverá ter **384 dimensões**, que é a quantidade de dimensões utilizadas pelo modelo [all-MiniLM-L6-v2 sentence-transformer](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) o qual irá gerar os embeddings.

### Build

Para fazer o build do projecto execute o comando:

```sh
npm run build
```

## Gerando os segmentos

Para gerar os segmentos a partir de um texto base (`roteiro-akita-rinha-backend.txt`) execute o comando:

```sh
npm start -- chunk --filePath=<caminho-do-texto-base> --maxTokenSize=<quantidade-maxima-de-tokens-por-chunk>
```

_Este comando é CPU-intensive e poderá demorar alguns segundos para terminar pois irá processar todo o texto base, executando similaridade de cosenos entre as frases para segmentá-lo._

Caso o argumento `--maxTokenSize` seja omitido, serão gerados chunks contendo, no máximo, 50 tokens.

Os segmentos gerados serão salvos no arquivo `semantic-chunks.csv`. Utilize o argumento `--verbose` para exibir o logging da função de segmentação na saída padrão.

### Estrutura do CSV gerado

Possui uma única coluna (`CHUNK`) e o caracter `|` é o delimitador de coluna.

Primeiras linhas do [semantic-chunks.csv](./semantic-chunks.csv):

```csv
CHUNK
Não podia terminar o ano com pendências, então eis a parte final da Saga da Rinha de Backend.|
Neste video vou aproveitar os temas da rinha pra demonstrar em mais detalhes como configurar um Docker Compose de verdade, como funciona testes de carga com Gatling, como usar esses dados pra configurar coisas como o Postgres melhor.|
```

## Carregando os dados

Execute o comando:

```sh
npm start -- load --csvPath=semantic-chunks.csv --column=CHUNK
```

O comando `load` irá:

- Gerar os embeddings a partir do arquivo `.csv` informado em `--csvPath=`
- Salvar os embeddings no Pinecone

Para mais detalhes da implementação, leia o [README](https://github.com/pinecone-io/semantic-search-example/tree/main) do exemplo original.

Caso o csv utilizado tenha mais de uma coluna, você poderá rodar:

```sh
npm start -- load --csvPath=<caminho-do-csv> --column=coluna1
npm start -- load --csvPath=<caminho-do-csv> --column=coluna2
```

## Pesquisando no Pinecone

Com o índice populado com as _embeddings_ geradas a partir dos _chunks_ podemos começar a fazer pesquisas semânticas. Para encontrar trechos com similaridade semântica, o termo de pesquisa também será vetorizado antes da query ser enviada para o Pinecone.

```sh
npm start -- query --query="Qual o impacto da configuração da rede do docker na performance da API?" --topK=10
```

O parâmetro `--topK=n` especifica que serão retornados os `n` resultados mais similares à query.

O resultado da pesquisa será salvo em `out.json`, contendo o _chunk_ e o seu respectivo _score_ que indica o grau de similaridade com a query.

Utilize o argumento `--verbose` para exibir o resultado da query na saída padrão.

```json
// out.json
[
  {
    "text": "Title:\"Configuração do PostgreSQL no Docker Compose: Determinação do Número Ideal de Conexões\",Content:\"Pergunta crucial: quantas conexões são necessárias para suportar a carga do teste de Gatling?\",\"450 conexões é suficiente ou menos seria aceitável? Qual é o equilíbrio ideal entre uso de recursos e tempo de espera para novas conexões?\",\"Testes de carga são essenciais para validar e ajustar essas premissas na prática, garantindo uma configuração otimizada e eficiente\",\"Essas considerações mostram a importância de ajustar adequadamente a configuração do PostgreSQL para atender às demandas específicas de carga e recursos de um ambiente Docker Compose, além de destacar a necessidade de testes de carga para validar e otimizar essas configurações na prática.\"",
    "score": 0.50529635
  },
  {
    "text": "Title:\"Configuração do PostgreSQL no Docker Compose: Bulk Insert e Upserts\",Content:\"Estratégias importantes para operações eficientes de inserção em massa de dados\",\"Reduzem o tempo e os recursos necessários para inserir grandes volumes de dados de uma só vez\",\"Cada banco de dados tem suas próprias peculiaridades de sintaxe para essas operações\"",
    "score": 0.502593935
  }
]
```
