# FatFood

API REST para gerenciamento de lanchonete — produtos, pedidos e usuários com autenticação JWT.

## Requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Docker](https://www.docker.com/) (para o SQL Server)
- `dotnet-ef` CLI: `dotnet tool install --global dotnet-ef`

## Subindo o banco de dados

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Senha123!" \
  -p 15433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
```

## Rodando o projeto

```bash
# Clone e entre na pasta
git clone <repo-url>
cd FatFood

# Aplique as migrations (ou deixe o app aplicar automaticamente ao iniciar)
dotnet ef database update

# Inicie
dotnet run
```

A API sobe em `https://localhost:5001`. O Swagger fica em `/swagger`.

> As migrations e o seed rodam automaticamente na primeira inicialização.

## Usuários padrão

| Role  | E-mail               | Senha      |
|-------|----------------------|------------|
| Admin | admin@fatfood.com    | Admin@123  |
| User  | user@fatfood.com     | User@123   |

## Dados de seed

Ao iniciar pela primeira vez o sistema cria automaticamente:

- **Roles:** `Admin` e `User`
- **Produtos:** Hambúrguer Clássico, Batata Frita G, Refrigerante Lata
- **Usuários:** admin e user (tabela acima)
- **Pedido de exemplo:** 1 pedido concluído vinculado ao usuário padrão

## Endpoints principais

| Método | Rota                  | Acesso       |
|--------|-----------------------|--------------|
| POST   | `/auth/login`         | Público      |
| POST   | `/auth/register`      | Público      |
| GET    | `/product`            | Autenticado  |
| POST   | `/product`            | Admin        |
| GET    | `/order`              | Autenticado  |
| POST   | `/order`              | Autenticado  |

Use o token retornado no login como `Bearer <token>` no header `Authorization`.
