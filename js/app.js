const KEY="nda_cmd_v1";
let S={user:null,role:"student",page:"home",db:load("db")||DATA,users:load("users")||[
{id:"u1",name:"Demo Student",email:"student@nda.local",password:"student123",role:"student"},
{id:"a1",name:"Command Admin",email:"admin@nda.local",password:"admin123",role:"admin"}],
mistakes:load("mistakes")||[],results:load("results")||[],tasks:load("tasks")||[],bookmarks:load("bookmarks")||[],adminType:"lecture",test:null};

function load(k){try{return JSON.parse(localStorage.getItem(KEY+"_"+k))}catch(e){return null}}
function save(){["db","users","mistakes","results","tasks","bookmarks"].forEach(k=>localStorage.setItem(KEY+"_"+k,JSON.stringify(S[k])))}
const $=s=>document.querySelector(s), esc=x=>String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function toast(x){let t=$("#toast");t.textContent=x;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function subject(id){return S.db.subjects.find(x=>x.id===id)?.name||id}
function chapter(id){return S.db.chapters.find(x=>x.id===id)?.name||id}
function initials(x){return (x||"U").split(" ").map(a=>a[0]).join("").slice(0,2).toUpperCase()}
function go(p){S.page=p;render();closeMenu()}
function head(title,kicker="COMMAND CENTER",actions=""){return `<div class="head"><div><div class="eyebrow">${esc(kicker)}</div><h1>${esc(title)}</h1></div>${actions}</div>`}
function btn(text,action,cls="ghost"){return `<button class="${cls}" data-action="${action}">${text}</button>`}

function splash(){show("splash");$("#enterBtn").onclick=()=>showAuth()}
function show(id){["splash","auth","app"].forEach(x=>$("#"+x).classList.add("hidden"));$("#"+id).classList.remove("hidden")}
function showAuth(){show("auth");setRole("student")}
function showRegister(){
  $("#loginForm").classList.add("hidden");
  $("#registerForm").classList.remove("hidden");
  $("#authToggle").classList.add("hidden");
  $("#registerBack").classList.remove("hidden");
  $("#authMsg").textContent="";
}

function showLogin(){
  $("#registerForm").classList.add("hidden");
  $("#loginForm").classList.remove("hidden");
  $("#authToggle").classList.remove("hidden");
  $("#registerBack").classList.add("hidden");
  $("#authMsg").textContent="";
}

function setRole(r){
  S.role=r;

  document.querySelectorAll(".role")
    .forEach(x=>x.classList.toggle("active",x.dataset.role===r));

  $("#authTitle").textContent=
    r==="admin" ? "Admin Login" : "Student Login";

  $("#authSub").textContent=
    r==="admin"
      ? "Command administrator access."
      : "Continue your preparation.";

  $("#authToggle").classList.toggle("hidden",r!=="student");

  $("#authMsg").textContent="";

  showLogin();
}
function setupAuth(){
  $("#enterBtn").onclick=showAuth;

  document.querySelectorAll(".role")
    .forEach(x=>x.onclick=()=>setRole(x.dataset.role));

  $("#authToggle button").onclick=showRegister;

  $("#registerBack button").onclick=showLogin;

  $("#closeRegister").onclick=showLogin;

  $("#loginForm").onsubmit=e=>{
    e.preventDefault();
    login();
  };

  $("#registerForm").onsubmit=e=>{
    e.preventDefault();
    register();
  };

  $("#forgotBtn").onclick = forgotPassword;
}
async function forgotPassword(){

  const email = prompt("Enter your registered email:");

  if(!email) return;

  const { error } =
    await supabaseClient.auth.resetPasswordForEmail(
      email,
      {
        redirectTo:
          window.location.origin +
          window.location.pathname +
          "?reset=true"
      }
    );

  if(error){
    toast(error.message);
    return;
  }

  toast("Password reset link sent to your email.");
}
async function login(){

  const email = $("#loginEmail").value.trim();
  const password = $("#loginPassword").value;

  if(!email || !password){
    toast("Enter email and password");
    return;
  }

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if(error){
    toast(error.message);
    return;
  }

  const { data: profile } =
    await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

  if(!profile){
    toast("Profile not found");
    return;
  }

  S.user = profile;
  S.role = profile.role;

  save();

  show("app");

  if (profile.role === "admin") {
    S.page = "admin";
} 
  else {
    S.page = "home";
}

  render();

  toast("Welcome back, " + profile.name);
}
async function register(){

  const name = $("#regName").value.trim();
  const email = $("#regEmail").value.trim();
  const password = $("#regPassword").value;

  if(!name || !email || !password){
    toast("Fill all fields");
    return;
  }

  const { data, error } =
    await supabaseClient.auth.signUp({
      email,
      password
    });

  if(error){
    toast(error.message);
    return;
  }

  if(!data.user){
    toast("Check your email to verify your account.");
    return;
  }

  const { error: profileError } =
    await supabaseClient
      .from("profiles")
      .insert({
        id:data.user.id,
        name:name,
        role:"student"
      });

  if(profileError){
    toast(profileError.message);
    return;
  }

  toast("Account created successfully.");

  showLogin();
}
function logout(){S.user=null;show("splash")}

function nav(){
let student=[["MAIN","home","⌂","Dashboard"],["STUDY","study","▦","Study Library"],["PRACTICE","practice","✓","Practice"],["TESTS","tests","◫","Tests"],["REVISION","revision","↻","Revision"],["CURRENT","current","◉","Current Affairs"],["PLAN","planner","□","Study Planner"],["ANALYTICS","analytics","⌁","Analytics"],["SSB","ssb","★","SSB Prep"],["ACCOUNT","profile","○","Profile"]];
let admin=[["COMMAND","admin","◆","Admin Dashboard"],["CONTENT","admin-content","＋","Upload & Manage"],["STUDENTS","admin-users","◎","Students"],["ACCOUNT","profile","○","Profile"]];
let a=S.user.role==="admin"?admin:student,last="";
$("#nav").innerHTML=a.map(x=>(x[0]!==last?`<div class="group">${x[0]}</div>`:"")+`<button class="navItem ${S.page===x[1]?"active":""}" data-page="${x[1]}">${x[2]} &nbsp; ${x[3]}</button>`).join("");
document.querySelectorAll(".navItem").forEach(x=>x.onclick=()=>go(x.dataset.page));$("#sideName").textContent=S.user.name;$("#sideEmail").textContent=S.user.email;$("#sideRole").textContent=S.user.role.toUpperCase();$("#avatar").textContent=initials(S.user.name);$("#topAvatar").textContent=initials(S.user.name);$("#topName").textContent=S.user.name.split(" ")[0]}
function shell(){nav();$("#pageTitle").textContent=S.page==="home"?"Dashboard":S.page.replace("-"," ");$("#profileBtn").onclick=()=>go("profile");$("#logoutBtn").onclick=logout}
function openMenu(){$("#sidebar").classList.add("open");$("#backdrop").classList.add("show")}
function closeMenu(){$("#sidebar").classList.remove("open");$("#backdrop").classList.remove("show")}
function setupShell(){$("#menuBtn").onclick=openMenu;$("#closeMenu").onclick=closeMenu;$("#backdrop").onclick=closeMenu;$("#searchBtn").onclick=search}

function render(){
if(!S.user)return; shell();
let fn={home:home,study:study,practice:practice,tests:tests,revision:revision,current:current,planner:planner,analytics:analytics,ssb:ssb,profile:profile,admin:admin,"admin-content":adminContent,"admin-users":adminUsers}[S.page];
if(fn)$("#content").innerHTML=fn();bind();
}
function home(){let avg=Math.round(S.db.chapters.reduce((a,x)=>a+x.progress,0)/S.db.chapters.length);return head("Command Dashboard","STUDENT • PREPARATION STATUS")+`
<div class="heroCard"><div class="eyebrow">MISSION BRIEF</div><h1>Prepare like the examination is already tomorrow.</h1><p class="muted">Your command center for study, practice, tests, mistakes and revision.</p>${btn("CONTINUE STUDY","study","primary")}</div>
<div class="grid g4 stats"><div class="card stat"><div class="label">NDA COUNTDOWN</div><div class="value">0</div><div class="muted">Update exam date in app.js</div></div><div class="card stat"><div class="label">PROGRESS</div><div class="value">${avg}%</div></div><div class="card stat"><div class="label">TESTS</div><div class="value">${S.results.length}</div></div><div class="card stat"><div class="label">MISTAKES</div><div class="value">${S.mistakes.length}</div></div></div>
<div class="section"><h2>Continue Learning</h2>${btn("VIEW ALL","study")}</div><div class="grid g4">${S.db.chapters.slice(0,4).map(c=>`<div class="card chapter"><span class="badge">${subject(c.subject)}</span><h3>${c.name}</h3><p>${c.items} practice items</p><div class="progress"><i style="width:${c.progress}%"></i></div><small>${c.progress}% complete</small></div>`).join("")}</div>`}
function study(){return head("Study Library","KNOWLEDGE BASE")+`<div class="grid g4">${S.db.subjects.map(s=>`<div class="card chapter"><span class="badge">${s.code}</span><h3>${s.icon} ${s.name}</h3><p class="muted">${s.desc}</p>${btn("OPEN","subject:"+s.id)}</div>`).join("")}</div><div class="section"><h2>Resources</h2></div><div class="grid g3"><div class="card"><h3>Video Lectures</h3><p class="muted">Admin-published lectures.</p>${btn("BROWSE","resources:lectures")}</div><div class="card"><h3>Notes & Formula</h3><p class="muted">Revision material.</p>${btn("BROWSE","resources:notes")}</div><div class="card"><h3>Books / PDFs</h3><p class="muted">Admin-published PDFs.</p>${btn("BROWSE","resources:books")}</div></div>`}
function subjectPage(id){let s=S.db.subjects.find(x=>x.id===id),cs=S.db.chapters.filter(x=>x.subject===id);return head(s.name,"STUDY • CHAPTERS",btn("← BACK","study"))+`<div class="grid g3">${cs.map(c=>`<div class="card chapter"><span class="badge">${c.items} ITEMS</span><h3>${c.name}</h3><p class="muted">Lectures • Notes • Practice • PYQs • Test</p><div class="progress"><i style="width:${c.progress}%"></i></div>${btn("OPEN","chapter:"+c.id)}</div>`).join("")||`<div class="empty">No chapters published.</div>`}</div>`}
function resources(type){let a=S.db[type].filter(x=>x.published);return head(type==="lectures"?"Lecture Library":type==="notes"?"Notes Library":"Book Library","RESOURCE LIBRARY",btn("← STUDY","study"))+`<div class="grid g3">${a.map(x=>`<div class="card"><span class="badge">${esc(x.type||x.subject)}</span><h3>${esc(x.title)}</h3><p class="muted">${esc(x.subject||"")} ${x.duration?"• "+x.duration:""}</p><a class="primary" href="${esc(x.url||"#")}" target="_blank">OPEN →</a></div>`).join("")||`<div class="empty">Nothing published yet.</div>`}</div>`}
function practice(){
  return head("Practice","QUESTION BANK")+
  `<div class="grid g3">
    ${S.db.questions
      .filter(q=>q.published!==false)
      .map(q=>`
        <div class="card">
          <span class="badge">${subject(q.subject)}</span>
          <h3>${chapter(q.chapter)}</h3>
          <p class="question">${esc(q.q)}</p>
          ${btn("SOLVE","question:"+q.id)}
        </div>
      `).join("")}
  </div>`;
}
function questionPage(id){let q=S.db.questions.find(x=>x.id===id);return head("Practice Question","QUESTION BANK",btn("← PRACTICE","practice"))+`<div class="card"><span class="badge">${subject(q.subject)}</span><p class="question">${esc(q.q)}</p><div id="opts">${q.opts.map((o,i)=>`<label class="answer"><input type="radio" name="ans" value="${i}"> ${String.fromCharCode(65+i)}. ${esc(o)}</label>`).join("")}</div>${btn("CHECK ANSWER","check:"+id,"primary")}<div id="result"></div></div>`}
function tests(){return head("Test Centre","TEST ENGINE")+`<div class="grid g3">${S.db.tests.map(t=>`<div class="card"><span class="badge">${t.type}</span><h3>${esc(t.name)}</h3><p class="muted">${t.questions.length} questions • ${t.duration} min</p>${btn("START TEST","test:"+t.id,"primary")}</div>`).join("")}</div>`}
function testPage(id){let t=S.db.tests.find(x=>x.id===id),qs=t.questions.map(id=>S.db.questions.find(q=>q.id===id)).filter(Boolean);S.test={t,qs};return head(t.name,"LIVE TEST",`<span class="badge">${t.duration} MIN</span>`)+`<div class="card">${qs.map((q,i)=>`<div style="margin-bottom:25px"><div class="eyebrow">QUESTION ${i+1}</div><p class="question">${esc(q.q)}</p>${q.opts.map((o,j)=>`<label class="answer"><input type="radio" name="t${i}" value="${j}"> ${String.fromCharCode(65+j)}. ${esc(o)}</label>`).join("")}</div>`).join("")}${btn("SUBMIT TEST","submit","primary")}</div>`}
function revision(){let qs=S.mistakes.map(id=>S.db.questions.find(q=>q.id===id)).filter(Boolean);return head("Revision","MISTAKE BOOK")+`<div class="grid g3"><div class="card stat"><div class="label">MISTAKES</div><div class="value">${qs.length}</div></div><div class="card stat"><div class="label">BOOKMARKS</div><div class="value">${S.bookmarks.length}</div></div><div class="card stat"><div class="label">MODE</div><div class="value">ACTIVE</div></div></div><div class="section"><h2>Mistake Book</h2></div>${qs.length?`<div class="grid g2">${qs.map(q=>`<div class="card"><h3>${esc(q.q)}</h3><p class="muted">${esc(q.exp)}</p>${btn("PRACTICE AGAIN","question:"+q.id)}</div>`).join("")}</div>`:`<div class="empty">Wrong answers will appear here.</div>`}`}
function current(){return head("Current Affairs","DAILY • DEFENCE • NATIONAL")+`<div class="grid g2">${S.db.currentAffairs.map(x=>`<div class="card"><span class="badge">${esc(x.cat)}</span><small class="muted">${esc(x.date)}</small><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`).join("")}</div>`}
function planner(){return head("Study Planner","PLAN YOUR PREPARATION",btn("ADD TASK","add-task","primary"))+`<div class="list">${S.tasks.map((t,i)=>`<div class="row"><button class="ghost" data-task="${i}">${t.done?"✓":"○"}</button><div class="grow">${esc(t.title)}</div><span class="badge">${t.done?"DONE":"PENDING"}</span></div>`).join("")||`<div class="empty">No tasks yet.</div>`}</div>`}
function analytics(){let total=S.results.reduce((a,x)=>a+x.total,0),score=S.results.reduce((a,x)=>a+x.score,0);return head("Analytics","PERFORMANCE INTELLIGENCE")+`<div class="grid g4"><div class="card stat"><div class="label">ATTEMPTS</div><div class="value">${S.results.length}</div></div><div class="card stat"><div class="label">QUESTIONS</div><div class="value">${total}</div></div><div class="card stat"><div class="label">CORRECT</div><div class="value">${score}</div></div><div class="card stat"><div class="label">ACCURACY</div><div class="value">${total?Math.round(score/total*100):0}%</div></div></div><div class="section"><h2>Test History</h2></div><div class="card tableWrap"><table><tr><th>TEST</th><th>SCORE</th><th>DATE</th></tr>${S.results.map(r=>`<tr><td>${esc(r.test)}</td><td>${r.score}/${r.total}</td><td>${new Date(r.date).toLocaleDateString()}</td></tr>`).join("")||"<tr><td colspan=3>No attempts.</td></tr>"}</table></div>`}
function ssb(){return head("SSB Preparation","OFFICER-LIKE QUALITIES")+`<div class="grid g3">${["OIR","PPDT","Psychology","GTO","Interview","Conference"].map(x=>`<div class="card chapter"><h3>${x}</h3><p class="muted">Practice module and preparation material.</p>${btn("OPEN","ssb:"+x)}</div>`).join("")}</div>`}
function profile(){return head("Profile","ACCOUNT")+`<div class="grid g2"><div class="card"><div class="eyebrow">IDENTITY</div><h2>${esc(S.user.name)}</h2><p class="muted">${esc(S.user.email)}</p><span class="badge">${S.user.role.toUpperCase()}</span></div><div class="card"><div class="eyebrow">SECURITY</div><p class="muted">This demo stores credentials locally. Use Supabase Auth before deploying publicly.</p>${btn("LOG OUT","logout")}</div></div>`}

function admin(){return head("Admin Dashboard","COMMAND ADMINISTRATION",btn("UPLOAD CONTENT","admin-content","primary"))+`<div class="grid g4"><div class="card stat"><div class="label">STUDENTS</div><div class="value">${S.users.filter(x=>x.role==="student").length}</div></div><div class="card stat"><div class="label">LECTURES</div><div class="value">${S.db.lectures.length}</div></div><div class="card stat"><div class="label">QUESTIONS</div><div class="value">${S.db.questions.length}</div></div><div class="card stat"><div class="label">TESTS</div><div class="value">${S.db.tests.length}</div></div></div><div class="section"><h2>Admin Controls</h2></div><div class="grid g3"><div class="card"><h3>Upload Content</h3><p class="muted">Lecture, notes, books, tests, questions and current affairs.</p>${btn("OPEN","admin-content")}</div><div class="card"><h3>Students</h3><p class="muted">View registered students.</p>${btn("VIEW","admin-users")}</div><div class="card"><h3>Publish System</h3><p class="muted">Published resources become visible to students.</p></div></div>`}
function adminUsers(){
  return head("Students","ADMIN • REGISTERED USERS")+
  `<div class="card tableWrap">
    <table>
      <tr>
        <th>NAME</th>
        <th>EMAIL</th>
        <th>ROLE</th>
        <th>ACTION</th>
      </tr>

      ${S.users.filter(x=>x.role==="student").map(x=>`
        <tr>
          <td>${esc(x.name)}</td>
          <td>${esc(x.email)}</td>
          <td>STUDENT</td>
          <td>
            ${btn("REMOVE","remove-student:"+x.id,"danger")}
          </td>
        </tr>
      `).join("") || `
        <tr>
          <td colspan="4">No students registered.</td>
        </tr>
      `}
    </table>
  </div>`;
}
function adminContent(){
  return head("Upload & Manage","ADMIN • CONTENT CONTROL")+

  `<div class="adminGrid">
    <div class="tabs">
      ${["lecture","note","book","test","question","current"]
        .map(x=>`
          <button class="tab ${S.adminType===x?"active":""}" data-type="${x}">
            ${x.toUpperCase()}
          </button>
        `).join("")}
    </div>

    <div class="card">
      ${adminForm()}
    </div>
  </div>

  <div class="section">
    <h2>Published Content</h2>
  </div>

  <div class="card tableWrap">
    <table>
      <tr>
        <th>TYPE</th>
        <th>TITLE</th>
        <th>STATUS</th>
        <th>ACTION</th>
      </tr>

      ${[
        ...S.db.lectures.map(x=>["LECTURE",x,x.title]),
        ...S.db.notes.map(x=>["NOTE",x,x.title]),
        ...S.db.books.map(x=>["BOOK",x,x.title]),
        ...S.db.questions.map(x=>["QUESTION",x,x.q])
      ].map(([type,item,title])=>`

        <tr>
          <td>${type}</td>

          <td>${esc(title)}</td>

          <td>
            ${item.published===false
              ? "UNPUBLISHED"
              : "PUBLISHED"}
          </td>

          <td>
            ${
              item.published===false
              ? btn(
                  "PUBLISH",
                  "toggle-publish:"+type+":"+item.id,
                  "success"
                )
              : btn(
                  "UNPUBLISH",
                  "toggle-publish:"+type+":"+item.id,
                  "danger"
                )
            }
          </td>
        </tr>

      `).join("") || `
        <tr>
          <td colspan="4">No content available.</td>
        </tr>
      `}
    </table>
  </div>`;
}
function field(id,label,placeholder,type="text"){return `<label class="field">${label}<input id="${id}" type="${type}" placeholder="${placeholder}"></label>`}
function adminForm(){let t=S.adminType;
if(t==="lecture")return `<div class="formGrid">${field("fTitle","Lecture title","Mechanics — Newton's Laws")}${field("fSubject","Subject","Physics")}${field("fChapter","Chapter","Mechanics")}${field("fUrl","Video URL","https://...")}<div class="wide upload"><label>Lecture file<input id="fFile" type="file" accept="video/*"></label></div><div class="wide">${btn("PUBLISH LECTURE","publish:lecture","primary")}</div></div>`;
if(t==="note"||t==="book")return `<div class="formGrid">${field("fTitle","Title",t==="book"?"NDA Book PDF":"Formula Sheet")}${field("fSubject","Subject","Physics")}${field("fType","Type",t==="book"?"PDF Book":"Formula Sheet")}${field("fUrl","File URL","https://...")}<div class="wide upload"><label>PDF/file<input id="fFile" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx"></label></div><div class="wide">${btn("PUBLISH "+t.toUpperCase(),"publish:"+t,"primary")}</div></div>`;
if(t==="test")return `<div class="formGrid">${field("fTitle","Test name","NDA Full Mock 01")}${field("fDuration","Duration","120","number")}<div class="wide">${field("fQuestions","Question IDs","q1,q2,q3,q4")}</div><div class="wide">${btn("PUBLISH TEST","publish:test","primary")}</div></div>`;
if(t==="question")return `<div class="formGrid">${field("fTitle","Question","Enter question")}${field("fSubject","Subject ID","math")}${field("fChapter","Chapter ID","m1")}<div class="wide">${field("fOptions","Options","Option A, Option B, Option C, Option D")}</div>${field("fAnswer","Correct option 0-3","0","number")}${field("fExp","Explanation","Detailed explanation")}<div class="wide">${btn("ADD QUESTION","publish:question","primary")}</div></div>`;
return `<div class="formGrid">${field("fTitle","Headline","Current affairs headline")}${field("fSubject","Category","Defence")}${field("fDate","Date","","date")}<div class="wide">${field("fText","Details","Verified summary / source note")}</div><div class="wide">${btn("PUBLISH CURRENT AFFAIR","publish:current","primary")}</div></div>`}

function bind(){document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>action(b.dataset.action));document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>go(b.dataset.page));document.querySelectorAll("[data-type]").forEach(b=>b.onclick=()=>{S.adminType=b.dataset.type;render()});document.querySelectorAll("[data-task]").forEach(b=>b.onclick=()=>{S.tasks[+b.dataset.task].done=!S.tasks[+b.dataset.task].done;save();render()})}
function action(a){
if(["home","study","practice","tests","revision","current","planner","analytics","ssb","profile","admin","admin-content","admin-users"].includes(a)){go(a);return}
if(a.startsWith("subject:")){S.page="subject";$("#content").innerHTML=subjectPage(a.split(":")[1]);bind();return}
if(a.startsWith("chapter:")){go("practice");return}
if(a.startsWith("resources:")){$("#content").innerHTML=resources(a.split(":")[1]);bind();return}
if(a.startsWith("question:")){$("#content").innerHTML=questionPage(a.split(":")[1]);bind();return}
if(a.startsWith("test:")){$("#content").innerHTML=testPage(a.split(":")[1]);bind();return}
if(a.startsWith("check:")){
  check(a.split(":")[1]);
  return;
}
if(a==="submit")submitTest();
if(a==="add-task"){let x=prompt("Task name?");if(x){S.tasks.unshift({title:x,done:false});save();render()}}
if(a==="logout")logout();
if(a.startsWith("remove-student:")){
  removeStudent(a.split(":")[1]);
  return;
}

if(a.startsWith("toggle-publish:")){
  togglePublish(a.split(":"));
  return;
}
if(a.startsWith("publish:"))publish(a.split(":")[1]);
if(a.startsWith("ssb:"))toast(a.split(":")[1]+" module selected");
}
function check(id){let q=S.db.questions.find(x=>x.id===id),v=document.querySelector('input[name="ans"]:checked'),box=$("#result");if(!v){box.innerHTML='<p class="wrong">Select an option.</p>';return}let ok=+v.value===q.ans;if(!ok&&!S.mistakes.includes(id))S.mistakes.push(id),save();box.innerHTML=`<div class="answer ${ok?"correct":"wrong"}"><b>${ok?"CORRECT":"INCORRECT"}</b><p>${esc(q.exp)}</p></div>`}
function removeStudent(id){
  const u=S.users.find(x=>x.id===id);

  if(!u)return;

  if(!confirm("Remove student "+u.name+"?"))return;

  S.users=S.users.filter(x=>x.id!==id);

  save();
  render();

  toast("Student removed");
}
function submitTest(){let t=S.test,score=0;t.qs.forEach((q,i)=>{let x=document.querySelector(`input[name="t${i}"]:checked`);if(x&&+x.value===q.ans)score++;else if(x&&!S.mistakes.includes(q.id))S.mistakes.push(q.id)});S.results.unshift({test:t.t.name,score,total:t.qs.length,date:new Date().toISOString()});save();S.page="analytics";render();toast("Test submitted")}
function publish(t){
let id=t+"_"+Date.now(),v=id=>$("#"+id).value;
if(t==="lecture")S.db.lectures.push({id,title:v("fTitle"),subject:v("fSubject"),chapter:v("fChapter"),duration:"Uploaded",url:v("fUrl")||"#",published:true});
else if(t==="note"||t==="book")S.db[t==="note"?"notes":"books"].push({id,title:v("fTitle"),subject:v("fSubject"),type:v("fType"),url:v("fUrl")||"#",published:true});
else if(t==="test")S.db.tests.push({id,name:v("fTitle"),type:"Admin Test",duration:+v("fDuration")||60,questions:v("fQuestions").split(",").map(x=>x.trim()).filter(Boolean)});
else if(t==="question")S.db.questions.push({
  id,
  q:v("fTitle"),
  subject:v("fSubject"),
  chapter:v("fChapter"),
  opts:v("fOptions").split(",").map(x=>x.trim()),
  ans:+v("fAnswer")||0,
  exp:v("fExp"),
  published:true
});
else S.db.currentAffairs.unshift({id,date:v("fDate")||new Date().toISOString().slice(0,10),cat:v("fSubject"),title:v("fTitle"),text:v("fText")});
save();render();toast("Published. Students can now see it.")}
function search(){let q=prompt("Search NDA Command");if(!q)return;let s=q.toLowerCase(),hits=[...S.db.chapters.map(x=>x.name),...S.db.lectures.map(x=>x.title),...S.db.notes.map(x=>x.title),...S.db.books.map(x=>x.title)].filter(x=>x.toLowerCase().includes(s));alert(hits.length?hits.join("\n"):"No results")}
document.addEventListener("DOMContentLoaded",()=>{setupAuth();setupShell();if(S.user){show("app");render()}else splash()})
function togglePublish(parts){
  const type=parts[1];
  const id=parts[2];

  const map={
    LECTURE:"lectures",
    NOTE:"notes",
    BOOK:"books",
    QUESTION:"questions"
  };

  const arr=S.db[map[type]];

  if(!arr)return;

  const item=arr.find(x=>x.id===id);

  if(!item)return;

  item.published=item.published===false;

  save();
  render();

  toast(item.published ? "Published" : "Unpublished");
}
document.addEventListener("click", function(e) {
  const btn = e.target.closest(".password-toggle");

  if (!btn) return;

  const input = document.getElementById(btn.dataset.target);

  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
    btn.setAttribute("aria-label", "Hide password");
  } else {
    input.type = "password";
    btn.textContent = "👁";
    btn.setAttribute("aria-label", "Show password");
  }
});
