# 📊 Plataforma de Análise de Crédito API

![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.4-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

Aplicação Full Stack desenvolvida para simular um motor de análise de risco de crédito de ponta a ponta. O sistema recebe propostas, avalia o perfil financeiro do solicitante com base em regras de negócio predefinidas e retorna um *Score* e uma classificação de *Risco*.

🌐 **Acesso em Produção:** [https://credit-analysis-api-java.onrender.com](https://credit-analysis-api-java.onrender.com)

> ⚠️ **Aviso sobre o Deploy (Cold Start):** A API está hospedada no plano gratuito do Render. Caso o link demore cerca de **50 segundos** para carregar no primeiro acesso, aguarde. O servidor entra em modo de suspensão por inatividade e esse é o tempo necessário para a máquina "acordar". Os acessos subsequentes são instantâneos.

---

## 🎯 Objetivo e Contexto

Este projeto foi construído com foco em **boas práticas de desenvolvimento, Clean Code e Design Patterns**, demonstrando a capacidade de arquitetar uma **API REST** robusta em Java e integrá-la a uma interface front-end responsiva. 

A arquitetura foi pensada para ser escalável, de fácil manutenção e fortemente tipada, qualidades essenciais para a sustentação e evolução de sistemas críticos e **aplicações legado**.

---

## 🚀 Tecnologias e Stack

**Back-end (Motor de Regras & API):**
* **Java 17+**
* **Spring Framework** (Spring Boot, Spring MVC, Spring Data JPA)
* **Bancos de Dados:** H2 Database (Ambiente Local/Testes) e **PostgreSQL / MySQL** (Produção)
* **Qualidade:** Testes Unitários com **JUnit 5** e Mockito.
* **Documentação:** Swagger / OpenAPI 3.

**Front-end (Interface Web):**
* HTML5, CSS3, JavaScript (Vanilla)
* Bootstrap 5 (Grid system)
* Integração assíncrona com Fetch API

**DevOps & Ferramentas:**
* **Git & GitHub** para versionamento de código.
* **Docker** (Dockerfile com Multi-stage build) para containerização.
* Integração Contínua / Deploy em Nuvem (Render).

---

## ⚙️ Arquitetura e Design Patterns

A aplicação segue rigorosamente o padrão de arquitetura em camadas, separando as responsabilidades de forma clara:

* **Controller Layer:** Gerencia as requisições HTTP e roteamento.
* **Service Layer:** Isola as regras de negócio (cálculo de score, definição de risco, validações complexas).
* **Repository Layer:** Abstrai a persistência de dados (Spring Data JPA).
* **DTO Pattern (Data Transfer Object):** Desacopla as entidades de banco de dados (`CreditProposal`) dos contratos da API (`CreditProposalRequest`, `CreditProposalResponse`), evitando vazamento de dados sensíveis.
* **Global Exception Handling:** Tratamento centralizado de erros (`@RestControllerAdvice`) para retornar respostas HTTP consistentes (ex: `409 Conflict` para CPFs duplicados, `400 Bad Request` para falhas de validação).

---

## 🧠 Lógica de Negócio (Scoring)

Cada nova proposta recebe um **Score Base de 500 pontos**. O algoritmo aplica os seguintes incrementos com teto máximo de 1000 pontos:

* Renda mensal superior a R$ 5.000,00: **+200 pontos**
* Idade superior a 30 anos: **+100 pontos**
* Idade superior a 50 anos: **+50 pontos**

**Classificação de Risco:**
* 🟢 **Baixo Risco:** Score ≥ 800
* 🟡 **Médio Risco:** Score entre 600 e 799
* 🔴 **Alto Risco:** Score entre 400 e 599
* ❌ **Reprovado:** Score < 400

---

## 📖 Documentação da API (Swagger)

A API está totalmente documentada utilizando o padrão OpenAPI. Com a aplicação rodando, acesse:

👉 **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**

Principais Endpoints:
* `POST /api/v1/proposals`: Cria e avalia uma nova proposta (valida CPF, formato e regras).
* `GET /api/v1/proposals`: Retorna todas as propostas com suporte a **Paginação** e **Filtros** (por nome ou nível de risco).

---

## 💻 Como executar o projeto localmente

Pré-requisitos: `Java 17` e `Git`. (Opcional: `Docker`).

**Passo 1: Clonar o repositório**
```bash
git clone [https://github.com/Kaylan00/credit-analysis-api-java.git](https://github.com/Kaylan00/credit-analysis-api-java.git)
cd credit-analysis-api-java
