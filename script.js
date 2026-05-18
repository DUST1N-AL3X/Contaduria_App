const form = document.getElementById("invoiceForm");
const invoiceTable = document.getElementById("invoiceTable");
const monthFilter = document.getElementById("monthFilter");
const exportCSVBtn = document.getElementById("exportCSV");
const searchInput = document.getElementById("searchInput");
const toast = document.getElementById("toast");
const themeToggle = document.getElementById("themeToggle");
const isrRateInput = document.getElementById("isrRate");

let invoices =
    JSON.parse(localStorage.getItem("invoices")) || [];

let chart;

form.addEventListener("submit", function(e){

    e.preventDefault();

    const date =
        document.getElementById("date").value;

    const type =
        document.getElementById("type").value;

    const category =
        document.getElementById("category").value;

    const amount =
        parseFloat(
            document.getElementById("amount").value
        );

    const iva = amount * 0.16;

    const total = amount + iva;

    const invoice = {

        id: Date.now(),
        date,
        type,
        category,
        amount,
        iva,
        total

    };

    invoices.push(invoice);

    saveInvoices();

    renderInvoices();

    showToast("✅ Factura guardada");

    form.reset();

});

function saveInvoices(){

    localStorage.setItem(
        "invoices",
        JSON.stringify(invoices)
    );

}

function renderInvoices(){

    invoiceTable.innerHTML = "";

    const filteredInvoices =
        getFilteredInvoices();

    let totalIncome = 0;
    let totalExpenses = 0;
    let ivaTransferred = 0;
    let ivaCreditable = 0;

    filteredInvoices.forEach(invoice => {

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

            totalIncome += invoice.amount;
            ivaTransferred += invoice.iva;

        }else{

            totalExpenses += invoice.amount;
            ivaCreditable += invoice.iva;

        }

    });

    const ivaToPay =
        ivaTransferred - ivaCreditable;

    const utility =
        totalIncome - totalExpenses;

    const isrRate =
        parseFloat(isrRateInput.value) || 0;

    const estimatedISR =
        utility * (isrRate / 100);

    const netProfit =
        utility - estimatedISR;

    document.getElementById("totalIncome").textContent =
        `$${totalIncome.toFixed(2)}`;

    document.getElementById("totalExpenses").textContent =
        `$${totalExpenses.toFixed(2)}`;

    document.getElementById("ivaTransferred").textContent =
        `$${ivaTransferred.toFixed(2)}`;

    document.getElementById("ivaCreditable").textContent =
        `$${ivaCreditable.toFixed(2)}`;

    document.getElementById("ivaToPay").textContent =
        `$${ivaToPay.toFixed(2)}`;

    document.getElementById("utility").textContent =
        `$${utility.toFixed(2)}`;

    document.getElementById("estimatedISR").textContent =
        `$${estimatedISR.toFixed(2)}`;

    document.getElementById("netProfit").textContent =
        `$${netProfit.toFixed(2)}`;

    renderChart(totalIncome, totalExpenses);

}

function deleteInvoice(id){

    invoices =
        invoices.filter(
            invoice => invoice.id !== id
        );

    saveInvoices();

    renderInvoices();

    showToast("🗑 Factura eliminada");

}

function getFilteredInvoices(){

    const selectedMonth =
        monthFilter.value;

    const search =
        searchInput.value.toLowerCase();

    return invoices.filter(invoice => {

        const matchesMonth =
            !selectedMonth ||
            invoice.date.startsWith(selectedMonth);

        const matchesSearch =

            invoice.type
                .toLowerCase()
                .includes(search)

            ||

            invoice.category
                .toLowerCase()
                .includes(search);

        return matchesMonth && matchesSearch;

    });

}

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

exportCSVBtn.addEventListener("click", function(){

    const filteredInvoices =
        getFilteredInvoices();

    if(filteredInvoices.length === 0){

        showToast("⚠ No hay datos");

        return;

    }

    let csv =
        "Fecha,Tipo,Categoria,Monto,IVA,Total\n";

    filteredInvoices.forEach(invoice => {

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

    a.download = "facturas.csv";

    a.click();

    URL.revokeObjectURL(url);

    showToast("📁 CSV exportado");

});

function showToast(message){

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2000);

}

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

});

function renderChart(income, expenses){

    const ctx =
        document.getElementById("financeChart");

    if(chart){

        chart.destroy();

    }

    chart = new Chart(ctx, {

        type:"bar",

        data:{

            labels:["Ingresos", "Gastos"],

            datasets:[{

                label:"Resumen",

                data:[income, expenses]

            }]

        }

    });

}