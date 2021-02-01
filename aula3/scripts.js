// objeto
const Modal = {
  // metodos ou propriedades ou funcoes
  // toogle função que troca essas duas add e remove
  open() {
    // Abrir modal
    // Adicionar a class active ao modal
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    // fechar o modal
    // remover a class active do modal
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },

  set(transactions) {
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transactions)
    );
  },
};

/*
 * Eu preciso somar as entradas
 * depois eu preciso somar as saídas e
 * remover das entradas o valor das saídas
 * assim, eu terei o total
 */
const Transaction = {
  all: Storage.get(),
  add(transaction) {
    Transaction.all.push(transaction);
    //console.log(Transaction.all);
    App.reload();
  },
  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes() {
    let income = 0;

    // * Pegar todas as transações
    // * Para cada transação,
    Transaction.all.forEach((transaction) => {
      // * se for maior que zero
      if (transaction.amount > 0) {
        // somar a variavel e retornar a variavel
        income += transaction.amount;
      }
    });
    return income;
  },
  expenses() {
    let expense = 0;

    // * Pegar todas as transações
    // * Para cada transação,
    Transaction.all.forEach((transaction) => {
      // * se for menor que zero
      if (transaction.amount < 0) {
        // somar a variavel e retornar a variavel
        expense += transaction.amount;
      }
    });
    return expense;
  },
  total() {
    // entradas - saídas
    return Transaction.incomes() + Transaction.expenses();
  },
};

/*
 * Substituir os dados do HTML com os dados do JS
 * propriedade do atributo
 * criando elemento na DOM formato de objeto
 */

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    DOM.transactionsContainer.appendChild(tr);
    //console.log(tr.innerHTML)
  },

  //Funcionalidade para criação do HTML
  innerHTMLTransaction(transaction, index) {
    // Operador ternario
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    //formatação da moeda
    const amount = Utils.formatCurrency(transaction.amount);

    const html = `      
    <td class="description">${transaction.description}</td>
    <td class="${CSSclass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td>
      <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
    </td>
    `;
    return html;
  },

  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

//  DOM.addTransaction(transactions[0])
//  DOM.addTransaction(transactions[1])
//  DOM.addTransaction(transactions[2])

//estrutura de dados receber coisas uteis para formatação
const Utils = {
  formatAmount(value) {
    value = Number(value) * 100;
    //value = Number(value.replace(/\,\./g, "")) * 100; Outra opção Maikão
    return value;
  },

  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    // \D ache só numeros
    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    //console.log(signal + value)
    return signal + value;
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault();
    try {
      // verificar se todas as informações foram preenchidas
      Form.validateFields();
      // formatar os dados para salvar
      const transaction = Form.formatValues();
      // salvar e atualiza a aplicação
      Transaction.add(transaction);
      // apagar os dados do formulario
      Form.clearFields();
      // modal feche
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);
    // Transaction.all.forEach(function (transaction, index) {
    //   DOM.addTransaction(transaction, index);
    // });

    DOM.updateBalance();

    Storage.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
