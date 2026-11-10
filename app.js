(() => {
"use strict";
const STORAGE_KEY = "myFinanceAppData";
const FIRST_TRACKING_DATE = "2026-01-01";
const EXPENSE_CATEGORIES = ["Food & Dining","Transportation","Shopping","Education","Bills & Utilities","Health","Entertainment","Other"];
const INCOME_CATEGORIES = ["Salary","Freelance","Pocket Money","Investment","Gift","Other Income"];
const CATEGORY_META = {
 "Food & Dining":{icon:"🍜",color:"#87a88a"},"Transportation":{icon:"🚗",color:"#d3a16f"},"Shopping":{icon:"◇",color:"#b28dba"},"Education":{icon:"▤",color:"#7e9ebc"},"Bills & Utilities":{icon:"ϟ",color:"#cb8275"},"Health":{icon:"✚",color:"#75aaa7"},"Entertainment":{icon:"✳",color:"#c69a58"},"Other":{icon:"◈",color:"#929d94"},
 "Salary":{icon:"▣",color:"#57966b"},"Freelance":{icon:"⌘",color:"#7e9ebc"},"Pocket Money":{icon:"▱",color:"#b28dba"},"Investment":{icon:"↗",color:"#75aaa7"},"Gift":{icon:"✧",color:"#d3a16f"},"Other Income":{icon:"＋",color:"#929d94"}
};
const PAGE_INFO={dashboard:["Overview","A clearer picture of your finances."],transactions:["Transactions","Every entry, all in one place."],analytics:["Insights","Understand the patterns behind your money."],settings:["Settings","Your preferences and data controls."]};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const createId=()=>globalThis.crypto?.randomUUID?.()||"tx-"+Date.now()+"-"+Math.random().toString(36).slice(2);
function normalizeTransaction(t){
 if(!t||typeof t!=="object")return null;
 const amount=Number(t.amount),type=t.type;
 const categories=type==="income"?INCOME_CATEGORIES:EXPENSE_CATEGORIES;
 if(!["income","expense"].includes(type)||!categories.includes(t.category)||!Number.isFinite(amount)||amount<=0||!/^(\d{4})-(\d{2})-(\d{2})$/.test(String(t.date||"")))return null;
 return {id:String(t.id||createId()),title:String(t.title||"Untitled").slice(0,60),amount,type,category:t.category,date:t.date,method:String(t.method||"Other").slice(0,40),note:String(t.note||"").slice(0,200),createdAt:Number(t.createdAt)||0};
}
function normalizeProfile(p){p=p&&typeof p==="object"?p:{};const age=p.age===""||p.age==null?"":Number(p.age);return{name:String(p.name||"").trim().slice(0,60),age:Number.isInteger(age)&&age>=1&&age<=120?String(age):"",about:String(p.about||"").slice(0,300)}}
function readSaved(){
 try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return null;const d=JSON.parse(raw);if(!d||typeof d!=="object")return null;return{transactions:Array.isArray(d.transactions)?d.transactions.map(normalizeTransaction).filter(Boolean):[],theme:["light","dark","system"].includes(d.theme)?d.theme:"light",profile:normalizeProfile(d.profile)};}catch(e){console.warn("Could not read saved Money data",e);return null}
}
const saved=readSaved();
const state={transactions:saved?.transactions||[],theme:saved?.theme||"system",profile:saved?.profile||{name:"",age:"",about:""}};
let toastTimer;
function saveData(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true}catch(e){toast("Could not save. Your browser storage may be full.");return false}}
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2800)}
function escapeHTML(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function currency(n){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n)||0)}
function dateLabel(s){return new Date(s+"T12:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
const monthKey=s=>String(s).slice(0,7),currentMonth=()=>monthKey(today()),currentYear=()=>new Date().getFullYear();
const sorted=items=>[...items].sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt||b.id.localeCompare(a.id));
const total=(items,type)=>items.filter(t=>t.type===type).reduce((s,t)=>s+t.amount,0);
const monthTransactions=month=>state.transactions.filter(t=>monthKey(t.date)===month);
function setTheme(mode,save=true){
 state.theme=["light","dark","system"].includes(mode)?mode:"system";
 const actual=state.theme==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):state.theme;
 document.body.dataset.theme=actual;
 $("#themeIcon").textContent=state.theme==="light"?"☼":state.theme==="dark"?"☾":"◐";
 $$("[data-theme-choice]").forEach(b=>b.classList.toggle("active",b.dataset.themeChoice===state.theme));
 if(save)saveData();
}
function cycleTheme(){setTheme(state.theme==="system"?"light":state.theme==="light"?"dark":"system")}
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change",()=>{if(state.theme==="system")setTheme("system",false)});
function showView(name){if(!PAGE_INFO[name])return;$$(".view").forEach(v=>v.classList.toggle("active",v.id===name+"-view"));$$(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===name));$("#pageTitle").textContent=PAGE_INFO[name][0];$("#pageSubtitle").textContent=PAGE_INFO[name][1];$("#sidebar").classList.remove("open");}
function categoryOptions(type,selected=""){const cats=type==="income"?INCOME_CATEGORIES:EXPENSE_CATEGORIES;$("#transactionCategory").innerHTML=cats.map(c=>'<option value="'+escapeHTML(c)+'">'+escapeHTML(c)+'</option>').join("");$("#transactionCategory").value=cats.includes(selected)?selected:cats[0]}
function setType(type,category=""){type=type==="income"?"income":"expense";$("#transactionType").value=type;$$("[data-transaction-type]").forEach(b=>b.classList.toggle("selected",b.dataset.transactionType===type));categoryOptions(type,category)}
function openTransaction(t=null){
 $("#transactionForm").reset();$("#transactionId").value=t?.id||"";$("#transactionTitle").value=t?.title||"";$("#transactionAmount").value=t?.amount??"";$("#transactionDate").value=t?.date||today();$("#transactionDate").min=FIRST_TRACKING_DATE;$("#transactionMethod").value=t?.method||"UPI";$("#transactionNote").value=t?.note||"";$("#modalTitle").textContent=t?"Edit transaction":"Add transaction";setType(t?.type||"expense",t?.category||"");$("#transactionModal").classList.add("active");$("#transactionModal").setAttribute("aria-hidden","false");document.body.style.overflow="hidden";setTimeout(()=>$("#transactionTitle").focus(),80)
}
function closeTransaction(){$("#transactionModal").classList.remove("active");$("#transactionModal").setAttribute("aria-hidden","true");unlockScroll()}
function openProfile(){$("#profileNameInput").value=state.profile.name;$("#profileAgeInput").value=state.profile.age;$("#profileAboutInput").value=state.profile.about;$("#profileModal").classList.add("active");$("#profileModal").setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
function closeProfile(){$("#profileModal").classList.remove("active");$("#profileModal").setAttribute("aria-hidden","true");unlockScroll()}
function unlockScroll(){if(!$(".modal-backdrop.active"))document.body.style.overflow=""}
function profileRender(){const name=state.profile.name||"My account";$("#profileName").textContent=name;$("#profileSummary").textContent=state.profile.age?"Age "+state.profile.age:"Personal space";$("#avatarInitial").textContent=(state.profile.name||"M").trim().charAt(0).toUpperCase();$("#settingsProfileSummary").textContent=state.profile.about||"Name: "+(state.profile.name||"Not added")+(state.profile.age?" · Age "+state.profile.age:"")}
$("#transactionForm").addEventListener("submit",e=>{
 e.preventDefault();const id=$("#transactionId").value,type=$("#transactionType").value,title=$("#transactionTitle").value.trim(),amount=Number($("#transactionAmount").value),category=$("#transactionCategory").value,date=$("#transactionDate").value,method=$("#transactionMethod").value,note=$("#transactionNote").value.trim();
 const cats=type==="income"?INCOME_CATEGORIES:EXPENSE_CATEGORIES;
 if(!title||title.length>60||!Number.isFinite(amount)||amount<=0||amount>Number.MAX_SAFE_INTEGER||!date||date<FIRST_TRACKING_DATE||!cats.includes(category)){toast("Please check the transaction details. Dates must be January 2026 or later.");return}
 const index=state.transactions.findIndex(t=>t.id===id),old=state.transactions[index];const item={id:id||createId(),title,amount,type,category,date,method,note,createdAt:old?.createdAt||Date.now()};
 if(index>=0)state.transactions[index]=item;else state.transactions.push(item);
 if(!saveData())return;closeTransaction();renderAll();toast(index>=0?"Transaction updated.":"Transaction added.")
});
function removeTransaction(id){const t=state.transactions.find(x=>x.id===id);if(!t||!confirm('Delete "'+t.title+'"? This cannot be undone.'))return;const old=state.transactions;state.transactions=old.filter(x=>x.id!==id);if(!saveData()){state.transactions=old;return}renderAll();toast("Transaction deleted.")}
function transactionRow(t,actions=false){
 const meta=CATEGORY_META[t.category]||{icon:"◈"};return '<tr><td><div class="transaction-cell"><span class="transaction-icon">'+meta.icon+'</span><span><span class="transaction-title">'+escapeHTML(t.title)+'</span><span class="transaction-subtitle">'+escapeHTML(t.method)+(t.note?" · "+escapeHTML(t.note):"")+'</span></span></div></td><td>'+escapeHTML(t.category)+'</td><td>'+dateLabel(t.date)+'</td><td class="amount-cell '+t.type+'">'+(t.type==="income"?"+":"−")+currency(t.amount)+'</td><td><span class="type-pill '+t.type+'">'+(t.type==="income"?"Income":"Expense")+'</span></td>'+(actions?'<td><div class="row-actions"><button class="row-action" data-action="edit" data-id="'+escapeHTML(t.id)+'" aria-label="Edit">✎</button><button class="row-action delete" data-action="delete" data-id="'+escapeHTML(t.id)+'" aria-label="Delete">×</button></div></td>':"")+'</tr>'
}
function updateFilters(){
 const month=$("#monthFilter").value,type=$("#typeFilter").value,category=$("#categoryFilter").value;
 const months=[...new Set(state.transactions.map(t=>monthKey(t.date)))].sort().reverse();
 $("#monthFilter").innerHTML='<option value="all">All months</option>'+months.map(m=>'<option value="'+m+'">'+new Date(m+"-15T12:00:00").toLocaleDateString("en-IN",{month:"long",year:"numeric"})+'</option>').join("");
 $("#monthFilter").value=months.includes(month)?month:"all";
 const allCats=[...EXPENSE_CATEGORIES,...INCOME_CATEGORIES];$("#categoryFilter").innerHTML='<option value="all">All categories</option>'+allCats.map(c=>'<option value="'+escapeHTML(c)+'">'+escapeHTML(c)+'</option>').join("");$("#categoryFilter").value=allCats.includes(category)?category:"all";$("#typeFilter").value=type;
}
function filteredTransactions(){
 const q=$("#searchInput").value.trim().toLowerCase(),month=$("#monthFilter").value,type=$("#typeFilter").value,cat=$("#categoryFilter").value;
 return sorted(state.transactions.filter(t=>(!q||[t.title,t.category,t.note,t.method].some(v=>String(v||"").toLowerCase().includes(q)))&&(month==="all"||monthKey(t.date)===month)&&(type==="all"||t.type===type)&&(cat==="all"||t.category===cat)));
}
function renderTransactions(){
 const visible=state.transactions.filter(t=>t.date>=FIRST_TRACKING_DATE),recent=sorted(visible).slice(0,5);
 $("#recentTransactions").innerHTML=recent.length?recent.map(t=>transactionRow(t)).join(""):'<tr><td colspan="5" class="empty-cell">No transactions yet. Add your first entry to get started.</td></tr>';
 const filtered=filteredTransactions();$("#transactionCount").textContent=filtered.length+" entr"+(filtered.length===1?"y":"ies")+" found";
 $("#allTransactions").innerHTML=filtered.length?filtered.map(t=>transactionRow(t,true)).join(""):'<tr><td colspan="6" class="empty-cell">No matching transactions. Try another filter or add a new entry.</td></tr>';
}
function yearMonths(){const now=new Date(),out=[];for(let i=0;i<=now.getMonth();i++){const d=new Date(now.getFullYear(),i,1);out.push({key:monthKey([d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),"01"].join("-")),label:d.toLocaleDateString("en-IN",{month:"short"}),full:d.toLocaleDateString("en-IN",{month:"long"})})}return out}
function renderBars(id){
 const el=$("#"+id);if(!el)return;const months=yearMonths(),data=months.map(m=>{const ts=monthTransactions(m.key);return{...m,income:total(ts,"income"),expense:total(ts,"expense")}});
 const max=Math.max(1,...data.flatMap(x=>[x.income,x.expense]));
 el.innerHTML=data.map(m=>'<div class="bar-group"><div class="bar-pair"><div class="bar-column" title="'+m.full+' income: '+currency(m.income)+'"><div class="bar-fill income-fill" style="height:'+(m.income?Math.max(2,m.income/max*100):0)+'%"></div></div><div class="bar-column" title="'+m.full+' expenses: '+currency(m.expense)+'"><div class="bar-fill expense-fill" style="height:'+(m.expense?Math.max(2,m.expense/max*100):0)+'%"></div></div></div><span class="bar-label">'+m.label+'</span></div>').join("");
 const yr=currentYear(),range="January–"+months.at(-1).full+" "+yr;el.setAttribute("aria-label",data.map(m=>m.full+": income "+currency(m.income)+", expenses "+currency(m.expense)).join("; "));
 if(id==="monthlyChart"){$("#chartDescription").textContent=range;$("#chartYear").textContent=yr+" · YTD"}else $("#analyticsDescription").textContent=range;
}
function renderDonut(donutId,totalId,legendId){
 const expenses=monthTransactions(currentMonth()).filter(t=>t.type==="expense"),items=EXPENSE_CATEGORIES.map(c=>({category:c,amount:expenses.filter(t=>t.category===c).reduce((s,t)=>s+t.amount,0),color:CATEGORY_META[c].color})).filter(x=>x.amount>0).sort((a,b)=>b.amount-a.amount),sum=items.reduce((s,x)=>s+x.amount,0),donut=$("#"+donutId);
 $("#"+totalId).textContent=currency(sum);
 if(!sum){donut.style.background="conic-gradient(var(--line) 0 360deg)";$("#"+legendId).innerHTML='<div class="empty-inline">No spending recorded this month.</div>';return}
 let angle=0;const stops=items.map(x=>{const start=angle;angle+=x.amount/sum*360;return x.color+" "+start+"deg "+angle+"deg"});donut.style.background="conic-gradient("+stops.join(",")+")";
 $("#"+legendId).innerHTML=items.map(x=>'<div class="category-legend-item"><i class="category-legend-dot" style="background:'+x.color+'"></i><span class="category-legend-name">'+escapeHTML(x.category)+' <span class="category-legend-percent">'+(x.amount/sum*100).toFixed(0)+'%</span></span><strong class="category-legend-value">'+currency(x.amount)+'</strong></div>').join("");
}
function renderDashboard(){
 const allIncome=total(state.transactions,"income"),allExpense=total(state.transactions,"expense"),month=monthTransactions(currentMonth()),mi=total(month,"income"),me=total(month,"expense");
 $("#totalBalance").textContent=currency(allIncome-allExpense);$("#totalIncome").textContent=currency(mi);$("#totalExpense").textContent=currency(me);$("#monthlySavings").textContent=currency(mi-me);
 $("#todayLabel").textContent=new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"long",year:"numeric"});
 renderBars("monthlyChart");renderDonut("categoryDonut","categoryDonutTotal","categoryLegend");
}
function renderAnalytics(){
 renderBars("analyticsMonthlyChart");renderDonut("analyticsDonut","analyticsDonutTotal","analyticsCategoryLegend");
 const y=currentYear(),ts=state.transactions.filter(t=>t.date.startsWith(y+"-")),inc=total(ts,"income"),exp=total(ts,"expense");
 $("#financialInsights").innerHTML='<div class="insight-grid"><div class="insight-item"><span>'+y+' income</span><strong style="color:#57966b">'+currency(inc)+'</strong></div><div class="insight-item"><span>'+y+' expenses</span><strong style="color:var(--red)">'+currency(exp)+'</strong></div><div class="insight-item"><span>'+y+' net balance</span><strong>'+currency(inc-exp)+'</strong></div></div><p class="insight-description">You have recorded <strong>'+ts.length+'</strong> transaction(s) this year.</p>';
}
function renderAll(){updateFilters();renderDashboard();renderTransactions();renderAnalytics();profileRender()}
function exportCSV(){
 if(!state.transactions.length){toast("There are no transactions to export.");return}
 const headers=["Transaction Name","Amount (INR)","Type","Category","Date","Payment Method","Note"];
 const esc=v=>{let s=String(v??"");if(/^[\s]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
 const csv=[headers,...sorted(state.transactions).map(t=>[t.title,t.amount,t.type,t.category,t.date,t.method,t.note])].map(row=>row.map(esc).join(",")).join("\r\n");
 download(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"}),"money-transactions-"+today()+".csv");toast("CSV exported.");
}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200)}
function backup(){const payload={app:"Money",version:1,exportedAt:new Date().toISOString(),transactions:state.transactions,theme:state.theme,profile:state.profile};download(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),"money-backup-"+today()+".json");toast("Backup downloaded. Keep it somewhere safe.")}
function parseCSV(text){
 text=text.replace(/^\\uFEFF/,\"\");
 const rows=[];let row=[],field="",quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i],next=text[i+1];if(quoted){if(c==='"'&&next==='"'){field+='"';i++}else if(c==='"')quoted=false;else field+=c}else if(c==='"')quoted=true;else if(c===","){row.push(field);field=""}else if(c==="\n"){row.push(field);rows.push(row);row=[];field=""}else if(c!=="\r")field+=c}
 if(field.length||row.length){row.push(field);rows.push(row)}
 if(rows.length<2)return [];
 const headers=rows.shift().map(h=>h.trim().toLowerCase()),index=name=>headers.indexOf(name);
 const col={title:index("transaction name"),amount:index("amount (inr)"),type:index("type"),category:index("category"),date:index("date"),method:index("payment method"),note:index("note")};
 if(col.title<0||col.amount<0||col.type<0||col.category<0||col.date<0)throw new Error("CSV columns do not match a Money or MyFinance transaction export.");
 return rows.filter(r=>r.some(v=>v.trim())).map(r=>({id:createId(),title:r[col.title],amount:Number(r[col.amount]),type:String(r[col.type]||"").toLowerCase(),category:r[col.category],date:r[col.date],method:col.method>=0?r[col.method]:"Other",note:col.note>=0?r[col.note]:"",createdAt:Date.now()}));
}
async function importBackup(file){
 try{
  const textContent=await file.text();let incoming,profile=state.profile,theme=state.theme;
  if(file.name.toLowerCase().endsWith(".csv")||/transaction name\s*,\s*amount/i.test(textContent.slice(0,180)))incoming=parseCSV(textContent);
  else{const data=JSON.parse(textContent);if(Array.isArray(data))incoming=data;else if(data&&Array.isArray(data.transactions)){incoming=data.transactions;profile=normalizeProfile(data.profile||profile);theme=["light","dark","system"].includes(data.theme)?data.theme:theme}else throw new Error("This file does not contain a transaction list.")}
  const clean=incoming.map(normalizeTransaction).filter(Boolean);
  if(incoming.length&&!clean.length)throw new Error("No valid transactions were found. Check the file's categories and dates.");
  const invalid=incoming.length-clean.length;
  const message="Import "+clean.length+" valid transaction(s)?"+(invalid?" "+invalid+" invalid entr"+(invalid===1?"y was":"ies were")+" skipped.":"")+"\n\nThis replaces the transactions currently in Money. Continue?";
  if(!confirm(message))return;
  const old={transactions:state.transactions,profile:state.profile,theme:state.theme};state.transactions=clean;state.profile=profile;state.theme=theme;
  if(!saveData()){Object.assign(state,old);return}
  setTheme(state.theme,false);renderAll();toast("Import completed successfully.");
 }catch(e){toast(e.message||"Could not read this file.")}
}
function clearAll(){
 if(!confirm("Permanently delete all transactions and profile details from this browser? Download a backup first if you may need this data."))return;
 const old={transactions:state.transactions,profile:state.profile};state.transactions=[];state.profile={name:"",age:"",about:""};
 if(!saveData()){state.transactions=old.transactions;state.profile=old.profile;return}renderAll();showView("dashboard");toast("All local data has been cleared.");
}
$("#profileForm").addEventListener("submit",e=>{
 e.preventDefault();const name=$("#profileNameInput").value.trim(),ageValue=$("#profileAgeInput").value.trim(),age=ageValue===""?"":Number(ageValue),about=$("#profileAboutInput").value.trim();
 if(name.length>60||(age!==""&&(!Number.isInteger(age)||age<1||age>120))||about.length>300){toast("Please check your profile details.");return}
 const old=state.profile;state.profile={name,age:age===""?"":String(age),about};if(!saveData()){state.profile=old;return}profileRender();closeProfile();toast("Profile saved.")
});
document.addEventListener("click",e=>{
 const nav=e.target.closest("[data-view]");if(nav){showView(nav.dataset.view);return}
 const link=e.target.closest("[data-view-link]");if(link){showView(link.dataset.viewLink);return}
 const action=e.target.closest("[data-action]");if(action){const id=action.dataset.id;if(action.dataset.action==="add")openTransaction();if(action.dataset.action==="edit")openTransaction(state.transactions.find(t=>t.id===id));if(action.dataset.action==="delete")removeTransaction(id)}
 const theme=e.target.closest("[data-theme-choice]");if(theme)setTheme(theme.dataset.themeChoice);
});
$$("[data-transaction-type]").forEach(b=>b.addEventListener("click",()=>setType(b.dataset.transactionType)));
$("#closeModal").addEventListener("click",closeTransaction);$("#cancelModal").addEventListener("click",closeTransaction);
$("#transactionModal").addEventListener("click",e=>{if(e.target.id==="transactionModal")closeTransaction()});
$("#closeProfileModal").addEventListener("click",closeProfile);$("#cancelProfileModal").addEventListener("click",closeProfile);
$("#profileModal").addEventListener("click",e=>{if(e.target.id==="profileModal")closeProfile()});
$("#profileButton").addEventListener("click",openProfile);$("#editProfileBtn").addEventListener("click",openProfile);
$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#themeCycle").addEventListener("click",cycleTheme);
["searchInput","monthFilter","typeFilter","categoryFilter"].forEach(id=>$("#"+id).addEventListener(id==="searchInput"?"input":"change",renderTransactions));
$("#exportBtn").addEventListener("click",exportCSV);$("#backupBtn").addEventListener("click",backup);$("#importBtn").addEventListener("click",()=>$("#importFile").click());
$("#importFile").addEventListener("change",async e=>{const file=e.target.files?.[0];if(file)await importBackup(file);e.target.value=""});
$("#clearDataBtn").addEventListener("click",clearAll);
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeTransaction();closeProfile();$("#sidebar").classList.remove("open")}});
setTheme(state.theme,false);setType("expense");renderAll();showView("dashboard");
})();