# 🔐 Sistema de Autenticação - Documentação

## 📋 Resumo

Foi implementado um sistema de autenticação que:
- ✅ Exibe um modal de login na **página index.html**
- ✅ Bloqueia acesso a todas as outras páginas sem autenticação
- ✅ Utiliza **sessionStorage** para manter a sessão ativa
- ✅ Design moderno e responsivo

---

## 🚀 Como Funciona

### 1. **Na Página Index (index.html)**
- Ao abrir a página, um modal de login aparece
- O usuário digita a senha
- Ao acertar a senha, o modal desaparece e a página fica acessível
- A autenticação fica ativa na aba/janela aberta

### 2. **Nas Outras Páginas**
- Se o usuário tentar acessar direto (sem estar autenticado), é redirecionado para index.html
- As páginas afetadas são:
  - estoque.html
  - caixas.html
  - camera.html
  - relatorio.html
  - materiais.html

### 3. **Persistência da Sessão**
- A autenticação é armazenada em `sessionStorage`
- Funciona enquanto a **aba/janela estiver aberta**
- Ao fechar a aba, a autenticação é perdida
- Ao reabrir, é necessário autenticar novamente

---

## 🔑 Senha Padrão

**Senha Atual:** `1234`

### ⚠️ Como Alterar a Senha

Abra o arquivo `index.html` e procure por esta linha:

```javascript
const AUTH_PASSWORD = '1234'; // Mude para a senha desejada
```

Substitua `'1234'` pela senha desejada:

```javascript
const AUTH_PASSWORD = 'senha_nova_aqui';
```

**Exemplo:**
```javascript
const AUTH_PASSWORD = 'QD@2026'; // Nova senha segura
```

---

## 📁 Arquivos Envolvidos

### Novos Arquivos Criados:
- **auth.js** - Lógica de autenticação

### Arquivos Modificados:
- **index.html** - Adicionado modal de login e script de autenticação
- **estoque.html** - Adicionado `<script src="auth.js"></script>`
- **caixas.html** - Adicionado `<script src="auth.js"></script>`
- **camera.html** - Adicionado `<script src="auth.js"></script>`
- **relatorio.html** - Adicionado `<script src="auth.js"></script>`
- **materiais.html** - Adicionado `<script src="auth.js"></script>`

---

## 🎨 Visual do Modal

O modal de login inclui:
- 🔒 Ícone de cadeado
- 📝 Campo para digitar a senha
- 🔓 Botão de acesso
- 💡 Dica de uso
- ❌ Mensagem de erro em caso de senha incorreta
- ✨ Animações suaves e design moderno

**Cores:**
- Fundo gradiente: Amarelo/Laranja (cores do tema Qdelicia)
- Botão: Amarelo (#FFCC00)
- Mensagem de erro: Vermelho (#ff6b6b)

---

## 🔓 Logout (Opcional)

Se você quiser adicionar um botão de logout em alguma página, pode usar:

```html
<button onclick="logout()">Sair</button>
```

Ou executar no console do navegador:
```javascript
logout();
```

---

## 🛡️ Segurança

### Pontos Importantes:
1. **sessionStorage** - A autenticação é perdida ao fechar a aba
2. **Não é criptografado** - Este é um sistema simples de proteção
3. **Para produção real** - Considere usar autenticação no servidor com tokens
4. **Proteção contra F12** - Não há proteção contra desenvolvedor (é JavaScript)

### Recomendações:
- ✅ Use este sistema para proteção básica de interface
- ✅ Para dados sensíveis, implemente autenticação no servidor
- ✅ Considere HTTPS para transmissão segura de senhas
- ✅ Mude a senha padrão regularmente

---

## 🧪 Teste Rápido

1. **Abra index.html**
   - Você verá o modal de login

2. **Tente acessar outra página diretamente**
   - Ex: `estoque.html`
   - Será redirecionado para `index.html`

3. **Digite a senha `1234`**
   - Modal desaparece
   - Página fica acessível

4. **Agora acesse outras páginas**
   - Você conseguirá navegar normalmente

5. **Feche a aba e abra de novo**
   - Modal aparecerá novamente

---

## 📊 Fluxo de Autenticação

```
┌─────────────────────────────┐
│  Abrir Qualquer Página      │
└──────────────┬──────────────┘
               │
        ┌──────▼──────┐
        │ Autenticado? │
        └──────┬──────┘
               │
        ┌──────┴──────┐
        │             │
     Sim│             │Não
        │             │
        ▼             ▼
    ┌───────┐    ┌──────────────┐
    │Acesso │    │ Redireciona  │
    │Granted│    │ para Index   │
    └───────┘    └──────┬───────┘
                        │
                   ┌────▼─────┐
                   │Modal Login│
                   └────┬─────┘
                        │
                  ┌─────▼─────┐
                  │Digite Senha│
                  └─────┬─────┘
                        │
                   ┌────▼────┐
                   │Correto?  │
                   └────┬────┘
                        │
                   ┌────┴────┐
                   │          │
                 Sim│          │Não
                   │          │
                   ▼          ▼
               ┌────────┐  ┌──────┐
               │Autent. │  │Erro  │
               │OK      │  │Retry │
               └────────┘  └──────┘
```

---

## 🤔 FAQ

### P: Posso usar este sistema para dados sensíveis?
**R:** Não é recomendado para produção real. É apenas uma camada de proteção de interface.

### P: O que acontece se o usuário abre DevTools?
**R:** Ele consegue ver o código e a senha. Para segurança real, use autenticação no servidor.

### P: A senha é armazenada em cookies?
**R:** Não, usamos `sessionStorage` que é por aba/janela.

### P: Posso usar múltiplas senhas?
**R:** Sim! Você pode modificar `auth.js` para verificar múltiplas senhas.

### P: Como fazer autenticação com banco de dados?
**R:** Seria necessário um servidor backend (Node.js, PHP, etc.) e APIs.

---

## 🔧 Personalização Avançada

### Adicionar Múltiplas Senhas:

**Em index.html**, altere:

```javascript
const AUTH_PASSWORDS = ['1234', 'senha2', 'senha3'];

authForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const enteredPassword = authPassword.value.trim();
    
    if (AUTH_PASSWORDS.includes(enteredPassword)) {
        // Autenticação OK
        ...
    } else {
        // Erro
        ...
    }
});
```

### Adicionar Username:

Modifique o modal para incluir um campo de usuário:

```html
<input 
    type="text" 
    class="auth-input" 
    id="authUsername" 
    placeholder="Usuário"
>
```

---

## ✅ Checklist de Implementação

- ✅ Arquivo `auth.js` criado
- ✅ Modal adicionado em `index.html`
- ✅ Script de autenticação em `index.html`
- ✅ `auth.js` adicionado em todas as páginas
- ✅ Redirecionamento funcionando
- ✅ SessionStorage configurado
- ✅ Design responsivo e acessível

---

## 📝 Histórico de Alterações

| Data | Versão | Mudança |
|------|--------|---------|
| 05/01/2026 | 1.0 | Implementação inicial do sistema de autenticação |

---

## 🆘 Suporte

Se encontrar problemas:
1. Abra o DevTools (F12)
2. Verifique a aba **Console** por erros
3. Confirme que `auth.js` está no mesmo diretório que os HTMLs
4. Verifique se todos os `<script src="auth.js"></script>` foram adicionados

---

**Sistema de Autenticação Qdelícia Frutas - v1.0**
