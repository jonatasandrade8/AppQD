# Qdelícia Frutas - Área do Promotor

Este projeto é uma aplicação web desenvolvida para os promotores da **Qdelícia Frutas**, facilitando o registro de estoque, controle de caixas e documentação fotográfica das atividades em campo.

## 🚀 Funcionalidades Principais

- **Dashboard (Início)**: Painel central com timers regressivos informando os prazos de envio para o estoque (diário até as 14h) e caixas secas (periódico).
- **Registro de Estoque**: Integração com Google Apps Script para lançamentos rápidos de balanço e inventário.
- **Controle de Caixas**: Área dedicada ao registro periódico de caixas secas.
- **Câmera Inteligente**:
  - Captura de fotos com marca d'água automática.
  - Metadados inclusos na imagem: Estado, Rede, Promotor, Loja, Data e Hora.
  - Galeria local para revisão, download individual ou em lote, e compartilhamento via WhatsApp.
- **Central de Alertas**: Sistema de lembretes sonoros e notificações para garantir que os prazos de envio não sejam perdidos.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **Backend**: Google Apps Script (GAS) para processamento de dados e integração com Google Sheets.
- **Iconografia**: Font Awesome 6.4.0.
- **Design**: Focado em dispositivos móveis (Mobile First) para uso em campo.

## 📂 Estrutura do Projeto

- `index.html`: Página inicial com síntese de missão e lembretes de rotina.
- `estoque.html`: Interface para o formulário de estoque.
- `caixas.html`: Interface para o formulário de caixas.
- `camera.html` / `camera.js`: Módulo completo de captura e edição de imagens.
- `alert.js`: Gerenciamento de notificações e áudio.
- `localizacao.js`: Gerenciamento de dados geográficos e de rede (utilizado para marcas d'água).

---

## 🔮 Melhorias Futuras Recomendadas

Para elevar o nível da aplicação, seguem algumas sugestões de aprimoramentos técnicos e de experiência do usuário:

### 1. Suporte Offline (PWA)
- Implementar **Service Workers** para transformar a aplicação em um PWA (Progressive Web App). Isso permitiria que o promotor abrisse o app e tirasse fotos mesmo sem conexão de internet estável, sincronizando os dados assim que sinal fosse restaurado.

### 2. Consolidação de Dados de Configuração
- Atualmente, as listas de Redes, Promotores e Lojas estão duplicadas em `camera.js` e `localizacao.js`. Recomenda-se centralizar esses dados em uma única fonte de verdade (ex: um arquivo `config.js` ou uma API dinâmica vinda do Google Sheets).

### 3. Persistência da Galeria
- Utilizar **IndexedDB** para salvar as fotos tiradas temporariamente no navegador. Atualmente, se a página for atualizada, a galeria de fotos recentes é perdida.

### 4. Sistema de Autenticação
- Implementar um login simples ou vinculação a um ID único de promotor para personalizar a experiência e aumentar a segurança dos dados enviados.

### 5. Melhorias de UI/UX
- **Modo Escuro (Dark Mode)**: Para conforto visual em diferentes ambientes.
- **Compressão de Imagem**: Implementar compressão no cliente antes do download/compartilhamento para economizar dados móveis dos promotores.
- **Feedback de Envio**: Mostrar o status de progresso real do envio dos dados do formulário Apps Script dentro do app principal.

---

&copy; 2025 Qdelícia Frutas. Todos os direitos reservados.
