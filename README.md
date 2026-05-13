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

A API sobe em `https://localhost:5090`. O Swagger fica em `/swagger` e a pagina web em `/index.html`.

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

| Método | Rota                                    | Acesso      |
|--------|-----------------------------------------|-------------|
| POST   | `v1/api/auth/login`                     | Público     |
| POST   | `v1/api/auth/register`                  | Público     |
| GET    | `v1/api/products`                       | Autenticado |
| POST   | `v1/api/products`                       | Admin       |
| GET    | `v1/api/categories`                     | Autenticado |
| POST   | `v1/api/categories`                     | Admin       |
| GET    | `v1/api/orders`                         | Admin       |
| GET    | `v1/api/orders/my`                      | Autenticado |
| POST   | `v1/api/orders`                         | Autenticado |
| PUT    | `v1/api/orders/{id}/status`             | Admin       |
| GET    | `v1/api/dashboard/overview`             | Admin       |

Use o token retornado no login como `Bearer <token>` no header `Authorization`.
 ##aviso
Caso o projeto esteja pedindo para instalar o arquivo base rode -> dotnet restore