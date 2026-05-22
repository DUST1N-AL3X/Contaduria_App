const form =
    document.getElementById("invoiceForm");

const invoiceTable =
    document.getElementById("invoiceTable");

const monthFilter =
    document.getElementById("monthFilter");

const searchInput =
    document.getElementById("searchInput");

const exportCSVBtn =
    document.getElementById("exportCSV");

const toast =
    document.getElementById("toast");

const themeToggle =
    document.getElementById("themeToggle");

const isrRateInput =
    document.getElementById("isrRate");

let invoices =
    JSON.parse(localStorage.getItem("invoices")) || [];

let financeChart;
let doughnutChart;

/* FORM */

form.addEventListener("submit", function(e){

    e.preventDefault();

    const amount =
        parseFloat(
            document.getElementById("amount").value
        );

    const invoice = {

        id: Date.now(),

        date:
            document.getElementById("date").value,

        type:
            document.getElementById("type").value,

        category:
            document.getElementById("category").value,

        amount: amount,

        iva:
            amount * 0.16,

        total:
            amount + (amount * 0.16)

    };

    invoices.push(invoice);

    saveInvoices();

    renderInvoices();

    form.reset();

    showToast("✅ Factura guardada");

});

/* SAVE */

function saveInvoices(){

    localStorage.setItem(
        "invoices",
        JSON.stringify(invoices)
    );

}

/* RENDER */

function renderInvoices(){

    invoiceTable.innerHTML = "";

    const filtered =
        getFilteredInvoices();

    let income = 0;
    let expenses = 0;
    let ivaTransferred = 0;
    let ivaCreditable = 0;

    filtered.forEach(invoice => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${invoice.date}</td>
            <td>${invoice.type}</td>
            <td>${invoice.category}</td>
            <td>$${invoice.amount.toFixed(2)}</td>
            <td>$${invoice.iva.toFixed(2)}</td>
            <td>$${invoice.total.toFixed(2)}</td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteInvoice(${invoice.id})"
                >
                    Eliminar
                </button>

            </td>
        `;

        invoiceTable.appendChild(row);

        if(invoice.type === "ingreso"){

            income += invoice.amount;
            ivaTransferred += invoice.iva;

        }else{

            expenses += invoice.amount;
            ivaCreditable += invoice.iva;

        }

    });

    const ivaToPay =
        ivaTransferred - ivaCreditable;

    const utility =
        income - expenses;

    const isrRate =
        parseFloat(isrRateInput.value) || 0;

    const estimatedISR =
        utility * (isrRate / 100);

    const netProfit =
        utility - estimatedISR;

    /* KPIS */

    document.getElementById("totalIncome").textContent =
        `$${income.toFixed(2)}`;

    document.getElementById("totalExpenses").textContent =
        `$${expenses.toFixed(2)}`;

    document.getElementById("ivaToPay").textContent =
        `$${ivaToPay.toFixed(2)}`;

    document.getElementById("netProfit").textContent =
        `$${netProfit.toFixed(2)}`;

    renderCharts(
        income,
        expenses,
        utility
    );

}

/* CHARTS */

function renderCharts(
    income,
    expenses,
    utility
){

    const ctx1 =
        document
            .getElementById("financeChart")
            .getContext("2d");

    if(financeChart){

        financeChart.destroy();

    }

    financeChart =
        new Chart(ctx1, {

            type:"bar",

            data:{

                labels:[
                    "Ingresos",
                    "Gastos",
                    "Utilidad"
                ],

                datasets:[{

                    label:"Resumen",

                    data:[
                        income,
                        expenses,
                        utility
                    ],

                    borderRadius:10

                }]

            },

            options:{
                responsive:true
            }

        });

    const ctx2 =
        document
            .getElementById("doughnutChart")
            .getContext("2d");

    if(doughnutChart){

        doughnutChart.destroy();

    }

    doughnutChart =
        new Chart(ctx2, {

            type:"doughnut",

            data:{

                labels:[
                    "Ingresos",
                    "Gastos"
                ],

                datasets:[{

                    data:[
                        income,
                        expenses
                    ]

                }]

            },

            options:{
                responsive:true
            }

        });

}

/* DELETE */

function deleteInvoice(id){

    invoices =
        invoices.filter(
            invoice => invoice.id !== id
        );

    saveInvoices();

    renderInvoices();

    showToast("🗑 Factura eliminada");

}

/* FILTER */

function getFilteredInvoices(){

    const month =
        monthFilter.value;

    const search =
        searchInput.value.toLowerCase();

    return invoices.filter(invoice => {

        const matchMonth =
            !month ||
            invoice.date.startsWith(month);

        const matchSearch =

            invoice.type
                .toLowerCase()
                .includes(search)

            ||

            invoice.category
                .toLowerCase()
                .includes(search);

        return matchMonth && matchSearch;

    });

}

/* EVENTS */

monthFilter.addEventListener(
    "change",
    renderInvoices
);

searchInput.addEventListener(
    "input",
    renderInvoices
);

isrRateInput.addEventListener(
    "input",
    renderInvoices
);

/* EXPORT */

exportCSVBtn.addEventListener("click", () => {

    let csv =
        "Fecha,Tipo,Categoria,Monto,IVA,Total\n";

    invoices.forEach(invoice => {

        csv +=
`${invoice.date},${invoice.type},${invoice.category},${invoice.amount},${invoice.iva},${invoice.total}\n`;

    });

    const blob =
        new Blob([csv], { type:"text/csv" });

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download = "ContaFlow.csv";

    a.click();

    URL.revokeObjectURL(url);

    showToast("📁 CSV exportado");

});

/* TOAST */

function showToast(message){

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2000);

}

/* DARK MODE */

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

});

/* INIT */

renderInvoices();
