# 🎰 Sistema de Cálculos Cactus Gaming

## 📊 Visão Geral

Página dedicada para calcular investimentos e retornos estimados baseados em dados dos jogos Cactus Gaming. O sistema utiliza planilhas XLSX para importar dados de jogos e gera cálculos detalhados de investimento, retorno e lucro.

## ✨ Funcionalidades

### 🔢 Cálculos Inteligentes

O sistema calcula automaticamente:

- **Investimento Sugerido**: Distribuição do saldo entre os jogos
- **Retorno Estimado**: Baseado no RTP (Return to Player) de cada jogo
- **Lucro Estimado**: Diferença entre retorno e investimento
- **Número de Rodadas**: Calculado com base no tempo disponível
- **Tempo de Jogo**: Estimativa de minutos por jogo
- **Nível de Risco**: Baixo, Médio ou Alto (baseado na volatilidade)

### 📈 Perfis de Risco

Escolha seu perfil de investimento:

- **Conservador** (70%): Menor investimento, menor risco
- **Moderado** (100%): Investimento balanceado
- **Agressivo** (130%): Maior investimento, maior potencial

### 📁 Importação de Dados

#### Formato do Arquivo XLSX

Colunas necessárias (pode usar qualquer nome):

| Coluna | Variações Aceitas | Tipo | Exemplo |
|--------|------------------|------|---------|
| Nome do Jogo | `nome`, `Nome`, `jogo`, `Jogo` | Texto | Money Mouse |
| RTP | `rtp`, `RTP` | Número | 96.5 |
| Volatilidade | `volatilidade`, `Volatilidade` | Texto | Média |
| Aposta Mínima | `apostaMinima`, `aposta_minima` | Número | 0.20 |
| Multiplicador Máx | `multiplicadorMaximo`, `multiplicador_maximo` | Número | 5000 |
| Frequência Bônus | `frequenciaBonus`, `frequencia_bonus` | Número | 180 |

#### Exemplo de Planilha

```
nome                  | rtp  | volatilidade | apostaMinima | multiplicadorMaximo | frequenciaBonus
---------------------|------|--------------|--------------|---------------------|----------------
Money Mouse          | 96.5 | Média        | 0.20         | 5000                | 180
888 Gold             | 96.0 | Baixa        | 0.10         | 1000                | 250
Gates of Olympus     | 96.5 | Alta         | 0.50         | 5000                | 150
```

### 🎮 Jogos Padrão Incluídos

O sistema já vem com 5 jogos pré-configurados:

1. **Money Mouse**
   - RTP: 96.5% | Volatilidade: Média
   - Aposta mínima: R$ 0.20
   - Multiplicador máximo: 5000x

2. **888 Gold**
   - RTP: 96.0% | Volatilidade: Baixa
   - Aposta mínima: R$ 0.10
   - Multiplicador máximo: 1000x

3. **Gates of Olympus**
   - RTP: 96.5% | Volatilidade: Alta
   - Aposta mínima: R$ 0.50
   - Multiplicador máximo: 5000x

4. **Fortune Tiger**
   - RTP: 96.8% | Volatilidade: Média-Alta
   - Aposta mínima: R$ 0.30
   - Multiplicador máximo: 2500x

5. **Tigre Sortudo 1000**
   - RTP: 96.2% | Volatilidade: Média
   - Aposta mínima: R$ 0.25
   - Multiplicador máximo: 1000x

## 🎯 Como Usar

### Passo 1: Configurar Parâmetros

1. **Saldo Inicial**: Digite o valor disponível para jogar (ex: R$ 100)
2. **Tempo Disponível**: Informe quantos minutos pretende jogar (ex: 60 min)
3. **Perfil de Risco**: Escolha conservador, moderado ou agressivo

### Passo 2: Carregar Jogos

Escolha uma opção:

#### Opção A: Importar XLSX
1. Clique em **"Importar XLSX"**
2. Selecione seu arquivo `.xlsx` ou `.xls`
3. Aguarde a confirmação de importação

#### Opção B: Usar Jogos Padrão
1. Clique em **"Usar Jogos Padrão"**
2. Os 5 jogos pré-configurados serão carregados

### Passo 3: Calcular

1. Clique no botão **"Calcular"**
2. O sistema processará os dados e exibirá:
   - **Resumo Geral**: Total de investimento, retorno e lucro
   - **Tabela Detalhada**: Resultados individuais por jogo

### Passo 4: Exportar Resultados

1. Clique em **"Exportar XLSX"**
2. O arquivo será baixado com o nome: `calculos-cactus-YYYY-MM-DD.xlsx`
3. Abra no Excel/LibreOffice para análise detalhada

## 📊 Entendendo os Resultados

### Métricas Exibidas

| Métrica | Descrição |
|---------|-----------|
| **Investimento** | Valor sugerido para apostar neste jogo |
| **Retorno Est.** | Valor esperado de retorno baseado no RTP |
| **Lucro Est.** | Diferença entre retorno e investimento |
| **Rodadas** | Número de apostas recomendadas |
| **Tempo** | Minutos estimados jogando este jogo |
| **Risco** | Classificação de risco (Baixo/Médio/Alto) |

### Cores dos Indicadores

- 🟢 **Verde**: Lucro positivo / Risco baixo
- 🟡 **Amarelo**: Risco médio
- 🔴 **Vermelho**: Lucro negativo / Risco alto

## 🎲 Fórmulas de Cálculo

### Investimento por Jogo
```
Investimento = (Saldo Total / Número de Jogos) × Multiplicador de Risco
```

### Retorno Estimado
```
Retorno = Investimento × (RTP / 100)
```

### Lucro Estimado
```
Lucro = Retorno - Investimento
```

### Número de Rodadas
```
Rodadas = (Tempo Disponível / Número de Jogos) × 10
```
*Estimativa: 10 rodadas por minuto*

## 📝 Exemplo Prático

### Cenário
- **Saldo**: R$ 100,00
- **Tempo**: 60 minutos
- **Perfil**: Moderado
- **Jogos**: 5 jogos padrão

### Resultados Esperados

| Jogo | Investimento | Retorno | Lucro | Rodadas |
|------|--------------|---------|-------|---------|
| Money Mouse | R$ 20,00 | R$ 19,30 | -R$ 0,70 | 120 |
| 888 Gold | R$ 20,00 | R$ 19,20 | -R$ 0,80 | 120 |
| Gates of Olympus | R$ 20,00 | R$ 19,30 | -R$ 0,70 | 120 |
| Fortune Tiger | R$ 20,00 | R$ 19,36 | -R$ 0,64 | 120 |
| Tigre Sortudo | R$ 20,00 | R$ 19,24 | -R$ 0,76 | 120 |

**Total**: Investimento R$ 100,00 | Retorno R$ 96,40 | Lucro -R$ 3,60

*Nota: Os cálculos são estimativas baseadas em RTP teórico. Resultados reais podem variar.*

## 🔒 Arquivo de Exemplo

Um arquivo XLSX de exemplo está disponível em: `/public/jogos-cactus-exemplo.xlsx`

Baixe este arquivo para ver o formato correto e adapte com seus próprios dados.

## 💡 Dicas

### Para Melhores Resultados

1. **Use RTP Real**: Sempre que possível, use o RTP oficial do provedor
2. **Considere a Volatilidade**: Jogos de alta volatilidade têm maior variação
3. **Gerencie o Bankroll**: Nunca invista mais do que pode perder
4. **Ajuste o Tempo**: Sessões mais longas diluem variância
5. **Teste Diferentes Perfis**: Compare conservador vs agressivo

### Interpretando RTP

- **RTP 96%+**: Bom retorno teórico
- **RTP 95-96%**: Retorno médio
- **RTP <95%**: Retorno mais baixo

### Entendendo Volatilidade

- **Baixa**: Ganhos pequenos e frequentes
- **Média**: Equilíbrio entre frequência e valor
- **Alta**: Ganhos grandes e menos frequentes

## 🛠️ Tecnologias Utilizadas

- **React + TypeScript**: Interface moderna e type-safe
- **XLSX**: Leitura e escrita de planilhas Excel
- **Lucide React**: Ícones modernos
- **Tailwind CSS**: Estilização responsiva

## 📱 Responsividade

A página é totalmente responsiva e funciona em:
- 💻 Desktop
- 📱 Tablet
- 📱 Mobile

## ⚠️ Avisos Importantes

> **Jogo Responsável**: Este é um sistema de cálculos teóricos baseado em estatísticas. Resultados reais podem variar significativamente. Jogue com responsabilidade e nunca aposte mais do que pode perder.

> **RTP Teórico**: O RTP (Return to Player) é uma média de longo prazo. Em sessões curtas, a variância pode ser significativa.

> **Não é Garantia**: Os cálculos não garantem lucro. São estimativas baseadas em probabilidades matemáticas.

## 🔄 Atualizações Futuras

Planejado para próximas versões:

- [ ] Histórico de sessões
- [ ] Gráficos de análise
- [ ] Comparação entre perfis
- [ ] Alertas de gerenciamento de banca
- [ ] Integração com API de jogos ao vivo
- [ ] Relatórios em PDF

## 📞 Suporte

Para dúvidas ou sugestões sobre os cálculos, consulte a documentação da Cactus Gaming ou entre em contato com o suporte.

---

**Desenvolvido com ❤️ para jogadores inteligentes**
