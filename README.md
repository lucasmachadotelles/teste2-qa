# Teste Técnico - K6 Performance Testing

## Descrição do Projeto

Este repositório contém um teste de performance desenvolvido com K6 para testar APIs públicas. O teste foi criado como parte de um teste técnico para demonstrar conhecimentos em automação de testes de performance.

## Objetivos do Teste

- Testar APIs públicas de forma automatizada
- Validar respostas das APIs
- Gerar relatórios de performance
- Demonstrar boas práticas em testes de performance e carga

## API Testada

**The Dog API** - Uma API pública que fornece informações sobre raças de cães e imagens.

- **Base URL**: `https://api.thedogapi.com/v1`
- **Endpoints testados**:
  - `/breeds` - Lista todas as raças de cães
  - `/images/search` - Busca imagens de cães
  - `/breeds/{id}` - Busca uma raça específica por ID

## Como Executar o Teste

### Pré-requisitos

1. **K6 instalado**:
   ```bash
   # Windows (com chocolatey)
   choco install k6
   
   # Ou baixar diretamente de: https://k6.io/docs/getting-started/installation/
   ```

### Execução do Teste

```bash
# Executar o teste
k6 run teste-tecnico-k6.js
```

## Configuração do Teste

### Cenários de Carga

O teste está configurado com os seguintes estágios:

1. **Ramp-up inicial**: 30s para chegar a 5 usuários
2. **Aumento gradual**: 1min para chegar a 10 usuários  
3. **Carga máxima**: 2min mantendo 15 usuários
4. **Redução gradual**: 1min reduzindo para 5 usuários
5. **Finalização**: 30s para encerrar o teste

### Thresholds (Limites)

- **Response Time**: 95% das requisições devem ser menores que 2 segundos
- **Error Rate**: Taxa de erro deve ser menor que 10%

## Validações Implementadas

### API de Raças (`/breeds`)
- Status code 200
-  Response time < 2000ms
-  Content-Type é application/json
-  Retorna um array válido
-  Array contém pelo menos 1 raça

### API de Imagens (`/images/search`)
-  Status code 200
-  Response time < 2000ms
-  Content-Type é application/json
-  Retorna um array válido
-  Array contém pelo menos 1 imagem

### API de Raça Específica (`/breeds/{id}`)
-  Status code 200
-  Response time < 2000ms
-  Dados retornados correspondem ao ID solicitado

## Métricas Coletadas

- **HTTP Request Duration**: Tempo de resposta das requisições
- **HTTP Request Rate**: Taxa de requisições por segundo
- **HTTP Request Failed**: Taxa de falhas
- **Custom Error Rate**: Taxa de erro customizada
- **Custom Response Time**: Tempo de resposta customizado

##  Relatórios Gerados

Após a execução, o teste gera:

1. **relatorio-teste-tecnico.html**: Relatório HTML detalhado com gráficos e métricas
2. **Console Output**: Resumo textual no terminal

##  Análise dos Resultados

### O que o teste valida:

1. **Funcionalidade**: Verifica se as APIs retornam dados válidos
2. **Performance**: Mede tempos de resposta e throughput
3. **Confiabilidade**: Avalia taxa de erros e estabilidade
4. **Estrutura de Dados**: Valida formato JSON e estrutura das respostas

## Tecnologias Utilizadas

- **K6**: Framework de teste de performance
- **JavaScript**: Linguagem de programação
- **The Dog API**: API pública para testes
- **HTML Reporter**: Geração de relatórios visuais