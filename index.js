URL_Base = 'http://127.0.0.1:5000';
const searchBar = document.getElementById("searchBar");
const resultsList = document.getElementById("resultsList");
let currentSymbol = '';
searchBar.addEventListener('input', async () => {
        event.preventDefault();
        if(searchBar.value != ''){
        handleSearch(searchBar.value);}
});
async function handleSearch(querry){
    try{
    const response = await fetch(`${URL_Base}/api/stocks/symbol_search?symbol=${querry}`);
    if (!response.ok){
        throw new Error("Stock not found");
    }
    const data = await response.json();
    updateResults(data);
    }
    catch (error) {
        console.error("Fetch error:", error);
        alert("Could not find that stock symbol. Please try again.");
    }
}
function updateResults(data){
    console.log(data);
    if (data.length === 0) {
        resultsList.innerHTML = `<div class="p-3 text-slate-500 text-sm">No results found</div>`;
        } 
        else {
         resultsList.innerHTML = data.result.map(result => `
                 <div class="p-3 hover:bg-slate-700 cursor-pointer flex justify-between items-center transition" 
                        onclick="handleSelect('${result.symbol}')">
                    <div>
                         <span class="font-bold text-emerald-400">${result.symbol}</span>
                        <span class="text-slate-400 text-xs ml-2">${result.description || ''}</span>
                    </div>
                </div>
                `).join('');
            }
            resultsList.classList.remove('hidden');
        
}
function handleSelect(symbol){
    currentSymbol = symbol;
    updateCompanyInfo();
    renderNews(symbol);
    resultsList.classList.add('hidden');
    searchBar.value = '';

}
async function updateCompanyInfo(){
    const comapnySymbol = document.getElementById("stockSymbol");
    const companyName = document.getElementById("companyName");
    const companyExchange = document.getElementById("stockExchange");
    const companyPrice = document.getElementById("currentPrice");
    const companyPriceChange = document.getElementById("priceChange");
    const companyMarketCap = document.getElementById("stat-mktcap");
    const companyPE = document.getElementById("stat-pe");
    const companyHigh = document.getElementById("stat-high");
    const companyVolume = document.getElementById("stat-vol");
    const graph = document.getElementById("graph");
    graph.src = `https://jika.io/embed/area-chart?symbol=${currentSymbol}&selection=one_year&closeKey=close&boxShadow=true&graphColor=1652f0&textColor=161c2d&backgroundColor=FFFFFF&fontFamily=Nunito&`
    try{
        const response = await fetch(`${URL_Base}/api/stocks/info?symbol=${currentSymbol}`);
        if (!response.ok){
        throw new Error("Stock not found");
        
    }
    data = await response.json();
    }
    catch (error) {
        console.error("Fetch error:", error);
        alert("Could not find that stock symbol. Please try again.");
    }
    comapnySymbol.textContent = currentSymbol;
    companyName.textContent = data.name;
    companyExchange.textContent = data.exchange;
    companyPrice.textContent = data.price;
    companyPriceChange.textContent = data.change;
    companyMarketCap.textContent = data.cap;
    companyPE.textContent = data.ratio;
    companyHigh.textContent = data.high;
    companyVolume.textContent = data.volume;
    setChangeColor();
}
function setChangeColor(){
    const companyPriceChange = document.getElementById("priceChange");
    const sym = companyPriceChange.textContent.slice(0,1);
    if(sym === '+'){
        companyPriceChange.classList.replace('text-rose-400', 'text-emerald-400');
    }
    else{
        companyPriceChange.classList.replace('text-emerald-400', 'text-rose-400');
    }
}
document.addEventListener('click', (e) => {
            if (!searchBar.contains(e.target) && !resultsList.contains(e.target)) {
                resultsList.classList.add('hidden');
            }
        });
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
async function renderNews(symbol) {
    try{
    const response = await fetch(`${URL_Base}/api/stocks/news?symbol=${symbol}`);
    const articles = await response.json();
    const newsContainer = document.getElementById('newsContainer');
    
    if (!articles || articles.length === 0) {
        newsContainer.innerHTML = `<div class="p-5 text-slate-500 italic">No recent news available.</div>`;
        return;
    }

    newsContainer.innerHTML = articles.map(article => `
        <a href="${article.url}" target="_blank" class="block p-5 hover:bg-slate-700/30 transition border-b border-slate-700/50 last:border-0 group">
            <div class="flex gap-4">
                <img src="${article.image || 'https://via.placeholder.com/80'}" 
                     class="w-16 h-16 rounded-md object-cover bg-slate-900 flex-shrink-0 shadow-lg border border-slate-700" 
                     onerror="this.src='https://via.placeholder.com/80'">
                
                <div class="flex-grow overflow-hidden">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">${article.source}</span>
                        <span class="text-[9px] text-slate-500">${formatDate(article.datetime)}</span>
                    </div>
                    <h4 class="text-[13px] font-bold text-slate-100 group-hover:text-emerald-400 line-clamp-2 transition-colors duration-200">
                        ${article.headline}
                    </h4>
                </div>
            </div>
        </a>
    `).join('');}
    catch (error) {
        console.error("Fetch error:", error);
        alert("Could not find that stock symbol. Please try again.");
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const currentSymbol = "AAPL";
    
    console.log("Page loaded. Initializing dashboard for:", currentSymbol);
    
    // Call your function to fetch data and update the UI
    handleSelect(currentSymbol);
});