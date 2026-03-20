import { useState, useMemo, useEffect } from "react";  

const STAGES = ["Sourced","Outreach Sent","Follow-Up Sent","Responded","Phone Screen","Submitted","HM Screen","Interviewing","Offer","Hired","Not Interested","Pass","Final Stage - Not Hired"];
const PARK_REASONS = ["Just Started New Role","Not Open Yet","Comp Mismatch - Revisit","Strong Profile - Wrong Timing","Passive - Check Back","Other"];
const DNH = ["OpenAI","NVIDIA","AMD","DPR Construction","Oracle (Senior Leadership)","Google (Senior DC Construction Leadership)"];
const DNH_NOTES = {"OpenAI":"Do not contact current OpenAI employees.","NVIDIA":"Do not contact current NVIDIA employees.","AMD":"Do not contact current AMD employees.","DPR Construction":"Do not contact current DPR Construction employees.","Oracle (Senior Leadership)":"Do not contact senior-level Oracle executives.","Google (Senior DC Construction Leadership)":"Do not contact senior Data Center Construction leadership at Google."};
const FOLLOW_UP_DAYS = 5;

const ROLES = [
  {id:"staff-estimator",title:"Staff Estimator",status:"Active",hm:"Kevin Krauss",sourcer:"Shawn Johnsen",recruiters:["Maddie Meyer"],assigned:"2026-02-15",category:"Manufacturing",comp:"$102K–$124K",link:"https://jobs.ashbyhq.com/Crusoe/9b1d8d4c-ea89-416e-ab6c-3b60474496b1",jd:"Critical link between customer request and final manufacturing proposal. Estimate project costs, ensure quotation accuracy, manage handoff to engineering and production. Calculate labor hours for fabrication, paint, assembly, and wiring. Generate formal quotations, collaborate with Sales on proposals. Maintain RFQ documentation. Experience in electrical manufacturing required; construction electrical estimating with industrial/power gen exposure strongly valued.",signals:["Electrical Manufacturing Estimating","BOM / Takeoff Experience","Labor Hour Calculation","RFQ / Quotation Generation","ERP / Acumatica","Construction Electrical Estimating","Industrial / Power Gen Exposure"],rubric:[{l:"Electrical Estimating",w:30},{l:"Industrial/Power Gen Exposure",w:25},{l:"BOM / Labor Calc",w:20},{l:"RFQ / Proposal Mgmt",w:15},{l:"ERP / Acumatica",w:10}],targetCos:["Ludvik Electric","Intermountain Electric","Faith Technologies","Rosendin Electric","Encore Electric","Powell Industries","Eaton Mfg","Schneider Electric Mfg","ABB Power Products","Myers Power Products"],benchmarks:["Patrick Deidel (internal — Ludvik Electric background)"],boolean:`("Estimator" OR "Senior Estimator" OR "Electrical Estimator" OR "Inside Sales Engineer") AND ("switchgear" OR "switchboard" OR "panel" OR "BOM" OR "RFQ") AND ("electrical manufacturing" OR "panel shop" OR "fabrication")`,notes:"Do NOT exclude construction electrical estimators. Recalibrated after Patrick Deidel benchmark."},
  {id:"ee-manager",title:"Electrical Engineering Manager",status:"Active",hm:"Cory Gautreau / Tyler Mehlman",sourcer:"Shawn Johnsen",recruiters:["Hannah"],assigned:"2026-03-01",category:"Manufacturing",comp:"TBD",link:"https://jobs.ashbyhq.com/Crusoe/e5567fef-714b-4d52-9994-05680dda5a6b",jd:"Lead and manage Crusoe's electrical engineering team supporting modular data center manufacturing. Player/coach role — hands-on technical leadership combined with people management. Oversee MV switchgear/switchboard design, NEC/NFPA compliance, EPLAN/AutoCAD Electrical documentation. Hire, mentor, and develop electrical engineers.",signals:["People Management / Team Leadership","MV Switchgear / Switchboard Design","EPLAN / AutoCAD Electrical","NEC / NFPA Compliance","Data Center / Mission-Critical Background","Hiring & Mentorship Experience"],rubric:[{l:"People Mgmt / Team Leadership",w:30},{l:"MV Switchgear / Switchboard",w:25},{l:"EPLAN / AutoCAD Electrical",w:15},{l:"NEC / NFPA Compliance",w:15},{l:"Data Center Background",w:15}],targetCos:["Equinix","Black & Veatch","Syska Hennessy","Burns & McDonnell","AECOM","Jacobs","Stantec","WSP","Arcadis","HDR"],benchmarks:["David Mar (internal)"],boolean:`("Electrical Engineering Manager" OR "Lead Electrical Engineer" OR "Principal Electrical Engineer") AND ("switchgear" OR "EPLAN" OR "AutoCAD Electrical") AND ("data center" OR "medium voltage" OR "MV") AND ("team" OR "manage" OR "mentor")`,notes:"Player/coach role. Must have genuine people management experience."},
  {id:"principal-ee",title:"Principal Electrical Engineer",status:"Active",hm:"Agustin Rayon",sourcer:"Shawn Johnsen",recruiters:["Hannah"],assigned:"2026-03-01",category:"Manufacturing",comp:"TBD",link:"https://jobs.ashbyhq.com/Crusoe/d72502c5-20ff-4c6a-bf83-b8a2d694b73f",jd:"Senior individual contributor. Lead complex electrical system design for modular data center products. Drive design standards, mentor engineers, serve as technical authority on MV/LV power distribution, switchgear, and compliance. EPLAN/AutoCAD Electrical required. NEC/NFPA 70E essential.",signals:["Principal / Staff IC Engineering","MV / LV Power Distribution","EPLAN / AutoCAD Electrical","NEC / NFPA 70E","Design Standards / Technical Authority","Data Center / Mission-Critical"],rubric:[{l:"Senior IC Technical Depth",w:30},{l:"MV/LV Power Distribution",w:25},{l:"EPLAN / AutoCAD Electrical",w:20},{l:"NEC / NFPA 70E",w:15},{l:"Mentorship / Standards Leadership",w:10}],targetCos:["Black & Veatch","Syska Hennessy","Burns & McDonnell","AECOM","Equinix DCE","Microsoft DCE","AWS DCE","HDR"],benchmarks:["David Mar (internal)"],boolean:`("Principal Electrical Engineer" OR "Staff Electrical Engineer") AND ("EPLAN" OR "AutoCAD Electrical") AND ("switchgear" OR "medium voltage") AND ("NEC" OR "NFPA 70" OR "data center")`,notes:"No direct reports required but mentorship expected."},
  {id:"tech-training-mgr",title:"Technical Training Manager",status:"Active",hm:"Annabel Kyler",sourcer:"Shawn Johnsen",recruiters:["David Schnuur"],assigned:"2026-03-10",category:"Manufacturing",comp:"$82K–$95K",link:"https://jobs.ashbyhq.com/Crusoe",jd:"Lead Crusoe workforce development. Develop and deliver technical training for manufacturing operations. Curriculum development, hands-on instruction, CI of training materials. Electrical assembly or manufacturing background essential.",signals:["Curriculum Development","Technical / Hands-on Training","Manufacturing / Electrical Assembly Background","Instructional Design","LMS / Training Systems","Continuous Improvement"],rubric:[{l:"Technical Training / Curriculum Dev",w:35},{l:"Manufacturing / Electrical Background",w:30},{l:"Instructional Design",w:20},{l:"LMS / Systems",w:15}],targetCos:["Eaton","Schneider Electric","ABB","Generac","Cummins","GE Power","Vertiv","Siemens","Rockwell Automation"],benchmarks:[],boolean:`("Technical Trainer" OR "Training Manager" OR "Manufacturing Trainer") AND ("electrical" OR "manufacturing" OR "fabrication") AND ("curriculum" OR "instructional design")`,notes:"Located in Tulsa. Role likely Arvada/Denver area — confirm on-site vs. remote."},
  {id:"sr-prod-mgr",title:"Sr. Production Manager",status:"Active",hm:"David Travis",sourcer:"Shawn Johnsen",recruiters:["David Schnuur"],assigned:"2026-01-20",category:"Manufacturing",comp:"TBD",link:"https://jobs.ashbyhq.com/Crusoe/b341c596-706f-45a8-a42e-ecfc31e58850",jd:"Lead manufacturing production operations for Crusoe's modular data center assembly in Arvada. Oversee production scheduling, team management, QC, and CI. HMLV industrial manufacturing, ERP, lean methodologies required. ISO 9001:2015.",signals:["Manufacturing Production Leadership","Lean / Six Sigma","ERP (Acumatica preferred)","HMLV Manufacturing","Quality Management / ISO 9001","Workforce Management"],rubric:[{l:"Production Leadership",w:30},{l:"Lean / CI",w:20},{l:"HMLV Manufacturing",w:20},{l:"ERP Proficiency",w:15},{l:"Team / Workforce Mgmt",w:15}],targetCos:["Generac","Caterpillar Power","Cummins","ASCO Power","Schneider Electric Mfg","Eaton Mfg","ABB Mfg","GE Power","Vertiv"],benchmarks:[],boolean:`("Production Manager" OR "Sr Production Manager" OR "Manufacturing Manager") AND ("lean" OR "Six Sigma") AND ("ERP" OR "Acumatica" OR "SAP") AND ("electrical" OR "manufacturing" OR "assembly")`,notes:"Focus on HMLV industrial/power manufacturing backgrounds."},
  {id:"sr-pm",title:"Sr. Project Manager",status:"Active",hm:"Kevin Krauss",sourcer:"Shawn Johnsen",recruiters:["Maddie Meyer"],assigned:"2026-03-05",category:"Manufacturing",comp:"$141,750–$162,000",link:"https://jobs.ashbyhq.com/Crusoe/483389b9-2012-4d69-818f-52ef8cd5bf22",jd:"Own planning and executing Modular Data Center Building projects. 7+ years PM in electrical, construction, or manufacturing. PMP preferred. MS Project/Monday.com/P6. $141,750–$162,000.",signals:["Modular Building / Data Center Construction PM","Schedule Mgmt (P6/MS Project/Monday.com)","Budget Forecasting & Cost Mgmt","Change Management / Scope Control","Cross-functional Team Leadership","ISO 9001"],rubric:[{l:"Construction / Mfg PM Experience",w:30},{l:"Modular / Data Center Background",w:25},{l:"Schedule & Budget Mgmt",w:20},{l:"Change / Scope Control",w:15},{l:"ERP / Tools Proficiency",w:10}],targetCos:["Modular building manufacturers","Data center construction firms","EPC contractors","Turner Construction","Hensel Phelps","Mortenson","Kiewit","Fluor"],benchmarks:[],boolean:`("Senior Project Manager") AND ("modular" OR "data center" OR "construction" OR "manufacturing") AND ("MS Project" OR "Primavera" OR "P6") AND ("budget" OR "schedule")`,notes:"Strong preference for modular building or data center construction PM. Note: DPR on DNH list."},
  {id:"master-scheduler",title:"Master Scheduler",status:"Active",hm:"Kevin Krauss",sourcer:"Shawn Johnsen",recruiters:["Maddie Meyer"],assigned:"2026-02-01",category:"Manufacturing",comp:"$110K–$130K",link:"https://jobs.ashbyhq.com/Crusoe/f7955ba8-7484-46e1-9826-f2d760a2c101",jd:"Establish and manage master production schedule across multiple manufacturing locations. 7+ years production planning/scheduling. MS Project/P6/Monday.com. MRP/ERP required. $110K–$130K.",signals:["Master Production Scheduling","MRP / ERP Systems","MS Project / P6 / Monday.com","Manufacturing Scheduling 7+ yrs","Resource & Capacity Planning"],rubric:[{l:"Production Scheduling Depth",w:30},{l:"MRP / ERP Proficiency",w:25},{l:"Scheduling Tools (P6/MSP)",w:20},{l:"Manufacturing Context",w:15},{l:"Reporting / Analytics",w:10}],targetCos:["Lockheed","Raytheon","Boeing","Generac","Cummins","Eaton","GE Power","Vertiv","Caterpillar"],benchmarks:[],boolean:`("Master Scheduler" OR "Production Scheduler" OR "Manufacturing Scheduler") AND ("MRP" OR "ERP" OR "SAP") AND ("MS Project" OR "Primavera" OR "P6") AND ("manufacturing" OR "production planning")`,notes:"Defense/aerospace IMS backgrounds translate well. Martin DeYoung local — excellent option."},
  {id:"pm3",title:"Project Manager III",status:"Active",hm:"Kevin Krauss",sourcer:"Shawn Johnsen",recruiters:["Maddie Meyer"],assigned:"2026-03-05",category:"Manufacturing",comp:"TBD",link:"https://jobs.ashbyhq.com/Crusoe/c0f4e502-acb0-4c50-af97-711b9861d5ba",jd:"Mid-senior PM role supporting modular data center manufacturing and deployment. Manage project lifecycle from engineering through delivery.",signals:["Project Management 5-10 yrs","Manufacturing or Construction Background","Schedule & Budget Mgmt","ERP Systems"],rubric:[{l:"PM Experience (5-10 yrs)",w:30},{l:"Mfg / Construction Background",w:25},{l:"Schedule & Budget",w:25},{l:"ERP / Tools",w:20}],targetCos:["Modular building firms","Mid-tier EPC contractors","Electrical contractors"],benchmarks:[],boolean:`("Project Manager") AND ("manufacturing" OR "construction" OR "data center") AND ("schedule" OR "budget")`,notes:"Step below Sr PM. Look for candidates who may not yet have 7+ years for Sr PM."},
];

const COMP_INTEL = {
  "Equinix":{tier:"Tier 1 Target",notes:"Strongest source for EE Manager and Principal EE. 2+ confirmed Crusoe hires.",roles:["ee-manager","principal-ee"],hire:true},
  "Black & Veatch":{tier:"Tier 1 Target",notes:"EPC firm producing excellent power distribution engineers. Thierry Lan (9/10) came from here.",roles:["ee-manager","principal-ee","sr-pm"],hire:true},
  "Syska Hennessy":{tier:"Tier 1 Target",notes:"MEP consulting firm with deep hyperscale/AI data center focus. Manjur Shuvha (9/10) from here.",roles:["ee-manager","principal-ee"],hire:true},
  "Microsoft DCE":{tier:"Tier 1 Target",notes:"Data Center Engineering org. Aarti Gurav (9/10) came from here.",roles:["ee-manager","principal-ee"],hire:true},
  "AWS DCE":{tier:"Tier 1 Target",notes:"Hyperscale power infrastructure. Strong AI/data center backgrounds.",roles:["ee-manager","principal-ee"],hire:true},
  "Ludvik Electric":{tier:"Tier 1 Target — Estimator",notes:"Patrick Deidel (internal benchmark) came from here.",roles:["staff-estimator"],hire:true},
  "Generac":{tier:"Tier 1 Target — Mfg",notes:"Power generation manufacturing. Strong HMLV and scheduling backgrounds.",roles:["sr-prod-mgr","master-scheduler"],hire:true},
  "Cummins":{tier:"Tier 1 Target — Mfg",notes:"Industrial manufacturing. Strong lean/CI and ERP backgrounds.",roles:["sr-prod-mgr","master-scheduler"],hire:true},
  "ABB":{tier:"Tier 2 Target",notes:"Ria Narayan (9/10) came from ABB. Strong EPLAN switchgear background.",roles:["ee-manager","principal-ee","staff-estimator"],hire:true},
  "Eaton":{tier:"Tier 2 Target",notes:"Power distribution manufacturing. Good for EE, Estimator, Production, Scheduler.",roles:["ee-manager","principal-ee","staff-estimator","sr-prod-mgr"],hire:true},
  "Schneider Electric":{tier:"Tier 2 Target",notes:"Electrical manufacturing. Validate manufacturing vs. sales roles.",roles:["ee-manager","principal-ee","staff-estimator"],hire:true},
  "OpenAI":{tier:"⛔ DO NOT HIRE",notes:"Do not contact current employees.",roles:[],hire:false},
  "NVIDIA":{tier:"⛔ DO NOT HIRE",notes:"Do not contact current employees.",roles:[],hire:false},
  "AMD":{tier:"⛔ DO NOT HIRE",notes:"Do not contact current employees.",roles:[],hire:false},
  "DPR Construction":{tier:"⛔ DO NOT HIRE",notes:"Do not contact current employees.",roles:[],hire:false},
  "Oracle":{tier:"⛔ DO NOT HIRE (Senior Leadership Only)",notes:"Do not contact senior-level Oracle executives.",roles:[],hire:false},
  "Google":{tier:"⛔ DO NOT HIRE (Senior DC Construction Leadership)",notes:"Do not contact senior DC Construction leadership.",roles:[],hire:false},
};

const HIST_STATS = [
  {role:"Staff Estimator",reachOuts:17,responses:7,responseRate:41.2,phoneScreens:1,screenRate:5.9},
  {role:"Sr Production Manager",reachOuts:38,responses:9,responseRate:23.7,phoneScreens:5,screenRate:13.2},
  {role:"Project Cost Analyst",reachOuts:13,responses:3,responseRate:23.1,phoneScreens:3,screenRate:23.1},
];

const CRUSOE_BIO = "Crusoe Energy is a fast-growing technology company building AI cloud infrastructure powered by stranded and renewable energy. Our modular data centers are deployed at the edge — turning wasted energy into computing power for the world's most demanding AI workloads. Backed by top-tier investors, growing rapidly, doing genuinely important work at the intersection of energy and AI.";
const TODAY = new Date("2026-03-20");
const VIEWS = ["Dashboard","Pipeline","Bulk Add","Park for Later","Roles & Intel","Comp Intel","Outreach Performance","Role History","Intake Form","Weekly Update","Score a Candidate"];
const STORAGE_KEY = "crusoe_scc_v4";

// ─── SEED DATA (used only on first load) ─────────────────────────────────────
const SEED = [
  // ── SCORED / HIGH-SIGNAL CANDIDATES ─────────────────────────────────────────
  {id:1,name:"Aarti Gurav",role:"ee-manager",company:"Microsoft / AWS",title:"Data Center EE",score:90,stage:"Phone Screen",outreach:"2026-03-05",followUp:"2026-03-10",response:"Replied",signals:["EPLAN / AutoCAD Electrical","Data Center / Mission-Critical","Hyperscale Background"],notes:"Rated 9/10. MSFT/AWS data center EE. Phone screen = No per tracker.",location:"Seattle, WA",relocation:true,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/aarti-gurav-p-e-86a38689",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:2,name:"Ria Narayan",role:"principal-ee",company:"ABB / Bloom Energy",title:"Electrical Engineer",score:90,stage:"Outreach Sent",outreach:"2026-02-10",followUp:"2026-02-15",response:"",signals:["EPLAN / AutoCAD Electrical","MV Switchgear / Switchboard"],notes:"Rated 9/10. ABB EPLAN switchgear + Bloom Energy.",location:"San Jose, CA",relocation:true,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/rianarayan",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:3,name:"Ramon Luquin",role:"principal-ee",company:"Baltimore Aircoil",title:"Electrical Engineer",score:88,stage:"Outreach Sent",outreach:"2026-03-05",followUp:"2026-03-10",response:"",signals:["EPLAN / AutoCAD Electrical","NEC / NFPA Compliance"],notes:"Rated 9/10. UL508A/AutoCAD Electrical panel design.",location:"Baltimore, MD",relocation:true,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/ramon-luquin",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:4,name:"Thierry Lan",role:"ee-manager",company:"Black & Veatch",title:"Data Center Solution Electrical Lead",score:92,stage:"Responded",outreach:"2026-03-05",followUp:"2026-03-10",response:"Replied",signals:["MV Switchgear / Switchboard","Data Center / Mission-Critical","Leadership / Mentorship"],notes:"Rated 9/10. B&V Data Center Electrical Lead.",location:"Kansas City, MO",relocation:true,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/thierrylan",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:5,name:"Manjur Ahmed Shuvha",role:"ee-manager",company:"Syska Hennessy",title:"Electrical Engineer",score:91,stage:"Outreach Sent",outreach:"2026-02-12",followUp:"2026-02-17",response:"",signals:["Hyperscale Background","Data Center / Mission-Critical","NEC / NFPA Compliance"],notes:"Rated 9/10. Syska Hennessy hyperscale AI data center EE.",location:"New York, NY",relocation:true,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/manjurshuvha",park:false,parkReason:"",parkDate:"",parkNote:""},
  // ── STAFF ESTIMATOR ──────────────────────────────────────────────────────────
  {id:9,name:"Joseph Stephenson III",role:"staff-estimator",company:"",title:"Estimator",score:0,stage:"Pass",outreach:"2026-02-19",followUp:"2026-02-24",response:"Not Interested",signals:[],notes:"Starting new role next week.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/joseph-stephenson-iii-0231985a",park:true,parkReason:"Just Started New Role",parkDate:"2026-08-01",parkNote:"Starting new role Feb 2026. Revisit Aug 2026."},
  {id:10,name:"Scott Ludvik",role:"staff-estimator",company:"",title:"Estimator",score:0,stage:"Pass",outreach:"2026-02-19",followUp:"2026-02-24",response:"Not Interested",signals:[],notes:"Comp is an issue.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/scott-ludvik-29ba5412",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:11,name:"Tara Easter",role:"staff-estimator",company:"",title:"Electrical Estimator",score:0,stage:"Sourced",outreach:"",followUp:"",response:"",signals:["Construction Electrical Estimating"],notes:"Flagged from Patrick Deidel's network.",location:"Denver, CO",relocation:false,source:"LinkedIn",linkedin:"",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:12,name:"Carly Georgen",role:"staff-estimator",company:"",title:"Estimator",score:0,stage:"Sourced",outreach:"",followUp:"",response:"",signals:["Construction Electrical Estimating"],notes:"Flagged from Patrick Deidel's network.",location:"Denver, CO",relocation:false,source:"LinkedIn",linkedin:"",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:200,name:"Willie Jones",role:"staff-estimator",company:"",title:"",score:0,stage:"Responded",outreach:"2026-02-19",followUp:"2026-02-24",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/willie-jones-6259bb175",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:207,name:"Matthew Appelhans",role:"staff-estimator",company:"",title:"",score:0,stage:"Responded",outreach:"2026-02-19",followUp:"2026-02-24",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/matthew-appelhans-5aa37b92",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:210,name:"Michael Gallagher",role:"staff-estimator",company:"",title:"",score:0,stage:"Submitted",outreach:"2026-02-19",followUp:"2026-02-24",response:"Replied",signals:[],notes:"Responded, phone screened, submitted. HM review = No.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/michael-gallagher-091b06129",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:212,name:"Anthony Drakes",role:"staff-estimator",company:"",title:"",score:0,stage:"Responded",outreach:"2026-02-19",followUp:"2026-02-24",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/anthonydrakes",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:343,name:"Scott Strasheim",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-02-24",followUp:"2026-03-01",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/scott-strasheim-6b838249",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:344,name:"Christa Stonehocker",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-02-24",followUp:"2026-03-01",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/christa-stonehocker-20a874183",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:345,name:"Gentry Muniz",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-02-24",followUp:"2026-03-01",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/gentry-muniz-43946a38",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:346,name:"James Burdick",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-02-24",followUp:"2026-03-01",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/james-burdick-09a60b24a",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:347,name:"Tony Sorasavong",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-02-24",followUp:"2026-03-01",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/tony-sorasavong-b7b418b3",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:49,name:"Daniel Romero",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/daniel-romero-8a3636109",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:50,name:"Aaron Arguello",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/aaron-arguello",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:51,name:"Larry Pfeil",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/larry-pfeil-bb1743267",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:52,name:"Kyle Whitman",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/kyle-whitham-90a88039",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:53,name:"Thomas Tribble",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/thomas-tribble-8a338387",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:54,name:"Vincent Strimel",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/vincent-strimel-0ab42136b",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:55,name:"Daryl Long",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/daryl-long-12729b104",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:56,name:"Alex Riedy",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/alex-riedy-73876461",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:57,name:"Tyler Smith",role:"staff-estimator",company:"",title:"Estimator",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/tyler-smith-estimator",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:58,name:"Matt Guthrie",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/matt-guthrie-88a689228",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:59,name:"Troy Hills",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/troy-hills-2b8384111",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:60,name:"Scott Schaus",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:["Construction Electrical Estimating"],notes:"Previously flagged from Patrick Deidel's network.",location:"Denver, CO",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/scott-schaus-3a19b163",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:61,name:"Curt Robbins",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/curt-robbins-3a1721202",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:62,name:"Dominic Mazza",role:"staff-estimator",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-09",followUp:"2026-03-14",response:"Replied",signals:[],notes:"Responded per tracker.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/dominic-mazza-0b40451b",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:63,name:"Rashee Aghi",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/reshee-aghi-518337228",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:64,name:"Eric M",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/eric-m-49b3b4a",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:65,name:"Nicholas Hollingsworth",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/nicholas-hollingsworth-46b63766",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:66,name:"Miranda Lantz",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/miranda-lantz-5ab94b148",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:67,name:"Steffano Santa Lucia",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/ssantaluciac",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:68,name:"Ron Smith",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/ronjsmith1",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:440,name:"Jeff Pelaez",role:"staff-estimator",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-03",followUp:"2026-03-08",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/jeff-pelaez-0b800536",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:444,name:"Ryan Richardson",role:"staff-estimator",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-03",followUp:"2026-03-08",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/ryan-richardson-b2a2b238",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:448,name:"Greg Damlo",role:"staff-estimator",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-03",followUp:"2026-03-08",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/greg-damlo-1a009a26",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:452,name:"Matt Bradley",role:"staff-estimator",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-03",followUp:"2026-03-08",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/matt-bradley-9a057114a",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:129,name:"Josh Pentz",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-11",followUp:"2026-03-16",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/pentzjoshuajr",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:130,name:"Max Wyman",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-11",followUp:"2026-03-16",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/mxwyman",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:131,name:"David Anaya",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-11",followUp:"2026-03-16",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/david-anaya1",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:132,name:"Randall Parsons",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-11",followUp:"2026-03-16",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/randall-parsons-282a70331",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:133,name:"Sherif Mohamed",role:"staff-estimator",company:"",title:"EIT",score:0,stage:"Outreach Sent",outreach:"2026-03-11",followUp:"2026-03-16",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/sherif-mohamed-e-i-t-115678b7",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:134,name:"Ethan Seidenberg",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-11",followUp:"2026-03-16",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/ethan-seidenberg-73a745152",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:135,name:"Drew Tobin",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-11",followUp:"2026-03-16",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/drew-tobin-73715566",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:136,name:"Joel Martinez",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-11",followUp:"2026-03-16",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/joel-martinez-ares",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:137,name:"Lucas Smith",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-11",followUp:"2026-03-16",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/lucas-smith-84b6a4228",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:138,name:"Connor Lundgren",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-11",followUp:"2026-03-16",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/connor-lundgren-8b2043241",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:139,name:"Christian Gaither",role:"staff-estimator",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-11",followUp:"2026-03-16",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/christian-v-gaither",park:false,parkReason:"",parkDate:"",parkNote:""},
  // ── EE MANAGER ───────────────────────────────────────────────────────────────
  {id:22,name:"Darick Laselle",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-16",followUp:"2026-03-21",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/daricklaselle",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:23,name:"Shawn Koch",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-16",followUp:"2026-03-21",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/shawn-koch",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:24,name:"Elbridge J Thrash",role:"ee-manager",company:"",title:"PE",score:0,stage:"Outreach Sent",outreach:"2026-03-16",followUp:"2026-03-21",response:"",signals:["PE License"],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/elbridge-j-thrash-pe-a1969b6",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:25,name:"Mark Baker",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-16",followUp:"2026-03-21",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/mark-baker-44996535",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:26,name:"Hana Jannaty Baesmat",role:"ee-manager",company:"",title:"Ph.D, P.E.",score:0,stage:"Outreach Sent",outreach:"2026-03-16",followUp:"2026-03-21",response:"",signals:["PE License"],notes:"PhD + PE credentials.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/hana-jannaty-baesmat-ph-d-p-e-1537aa157",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:27,name:"Joseph Atabe",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-16",followUp:"2026-03-21",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/joseph-atabe-96104912",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:28,name:"Max Tambling",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-16",followUp:"2026-03-21",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/mtambling17",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:29,name:"Scott Wilson",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-16",followUp:"2026-03-21",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/s1wilson",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:30,name:"Trevor Spika",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-16",followUp:"2026-03-21",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/trevorspika",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:31,name:"Lucille Banta",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-16",followUp:"2026-03-21",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/lucille-banta",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:32,name:"Art Otrogus",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-16",followUp:"2026-03-21",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/artotrogus",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:33,name:"Steve Foss",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-16",followUp:"2026-03-21",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/steve-foss-57506723",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:34,name:"Vamsi Patwari",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-16",followUp:"2026-03-21",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/vamsi-patwari",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:35,name:"Ryan Morahan",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-16",followUp:"2026-03-21",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/rmorahan",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:36,name:"Gerald Eberhardt",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-18",followUp:"2026-03-23",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/gerald-eberhardt-5ab9913",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:37,name:"Sean Tilley",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-18",followUp:"2026-03-23",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/sean-tilley-a185222a",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:38,name:"Skyler Meredith",role:"ee-manager",company:"",title:"PE",score:0,stage:"Outreach Sent",outreach:"2026-03-18",followUp:"2026-03-23",response:"",signals:["PE License"],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/skyler-meredith-pe-04077831",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:69,name:"Neil Miller",role:"ee-manager",company:"",title:"PE, PMP",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:["PE License"],notes:"PE + PMP credentials.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/neil-miller-pe-pmp",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:70,name:"David Irish",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/david-b-irish",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:71,name:"Connor Rossi",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/connor-rossi-46b87319a",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:72,name:"Ray Greco",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/ray-greco-a1273827",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:73,name:"Christian G",role:"ee-manager",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-09",followUp:"2026-03-14",response:"Replied",signals:[],notes:"Responded per tracker. Phone screen indicated.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/christian-gottschalk",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:74,name:"Murteza Ahmadi",role:"ee-manager",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-09",followUp:"2026-03-14",response:"Replied",signals:[],notes:"Responded per tracker.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/murteza-ahmadi",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:75,name:"Reggie John",role:"ee-manager",company:"",title:"",score:0,stage:"Sourced",outreach:"",followUp:"",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/reggie-john-223790211",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:140,name:"William Warnock",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-12",followUp:"2026-03-17",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/williampwarnock",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:141,name:"Donald Orbin",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-12",followUp:"2026-03-17",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/donaldorbin",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:142,name:"Jonathan K",role:"ee-manager",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-12",followUp:"2026-03-17",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/jonathan-k-29242910a",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:143,name:"Peter Van Der Hoop",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-12",followUp:"2026-03-17",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/peter-vanderhoop",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:144,name:"Derek Hewitt",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-12",followUp:"2026-03-17",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/derekthomashewitt2005",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:145,name:"Jake Beckner",role:"ee-manager",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-12",followUp:"2026-03-17",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/jakebeckner",park:false,parkReason:"",parkDate:"",parkNote:""},
  // ── PRINCIPAL EE ─────────────────────────────────────────────────────────────
  {id:76,name:"Steven Schepanski",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/steven-schepanski-621790106",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:77,name:"Roger Dodrill III",role:"principal-ee",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-09",followUp:"2026-03-14",response:"Replied",signals:[],notes:"Responded per tracker.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/roger-dodrill-iii",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:78,name:"Patrick Daley",role:"principal-ee",company:"",title:"PE",score:0,stage:"Outreach Sent",outreach:"2026-03-09",followUp:"2026-03-14",response:"",signals:["PE License"],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/patrick-daley-p-e-aa05ab6",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:146,name:"Greg Daly",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/amnesiak",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:147,name:"Kyle Rogers",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/kyle-rogers-0a921631",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:148,name:"Grace Jiang",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/gracejiang4",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:149,name:"Iheanyi Marike",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/imarike",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:150,name:"Darick Tyler",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/darick-tyler-91796558",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:151,name:"Richard St Pierre",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/richardstpierre",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:152,name:"John K",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/john-k-5b4586a",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:153,name:"David Tieben",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/davidtieben",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:154,name:"Bryan Winther",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/bryanwinther",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:155,name:"Shane Voss",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/shanevoss",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:156,name:"Jacob Worthington",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/jacob-worthington-b7877349",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:157,name:"Brian Fields",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/bfields",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:158,name:"Christopher Wells",role:"principal-ee",company:"",title:"PE",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:["PE License"],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/christopher-wells-pe",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:159,name:"Jason Kiracofe",role:"principal-ee",company:"",title:"PE",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:["PE License"],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/jason-kiracofe-pe-89203182",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:160,name:"Timothy White",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/timothy-white-1a43568a",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:161,name:"Ben Leslie",role:"principal-ee",company:"",title:"CID Adv",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/ben-leslie-cid-adv-8123b17",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:162,name:"Paul Swanson",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/swansonps",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:163,name:"Bradley Winick",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/bradley-brad-winick-2a80a517",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:164,name:"Brian Erfman",role:"principal-ee",company:"",title:"CDCMP",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/brian-erfman-cdcmp-7a067930",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:165,name:"Andrew Williams",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/williaap",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:166,name:"Matt DiPaolo",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-13",followUp:"2026-03-18",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/mattdipaolo",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:300,name:"Kevin Luong",role:"principal-ee",company:"",title:"",score:0,stage:"Responded",outreach:"2026-02-23",followUp:"2026-02-28",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/kevinluong21",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:301,name:"Justin Corneau",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-02-23",followUp:"2026-02-28",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/justin-corneau",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:302,name:"Jeff Hein",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-02-23",followUp:"2026-02-28",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/jeff-hein-15974810",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:303,name:"Nathan Houghteling",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-02-23",followUp:"2026-02-28",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/nathan-houghteling-b935b2143",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:304,name:"Logan Ostrander",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-02-23",followUp:"2026-02-28",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/logan-ostrander-a0710014a",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:305,name:"Coby White",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-02-23",followUp:"2026-02-28",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/cody-m-white",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:306,name:"Al Chehouri",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-02-23",followUp:"2026-02-28",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/al-chehouri-23963232",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:307,name:"Kathryn Fox",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-02-23",followUp:"2026-02-28",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/kathrynmfox",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:413,name:"Jonathan Snyder",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-02",followUp:"2026-03-07",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/jonathan-snyder-388419270",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:414,name:"Soo Loewen",role:"principal-ee",company:"",title:"PE",score:0,stage:"Outreach Sent",outreach:"2026-03-02",followUp:"2026-03-07",response:"",signals:["PE License"],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/soo-loewen-pe",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:415,name:"James Jeambey",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-02",followUp:"2026-03-07",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/jamesjeambey",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:416,name:"Gloria Mattson",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-02",followUp:"2026-03-07",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/gloria-mattson-940ab55",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:417,name:"Patrick Council",role:"principal-ee",company:"",title:"PE",score:0,stage:"Responded",outreach:"2026-03-02",followUp:"2026-03-07",response:"Replied",signals:["PE License"],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/patrick-council-p-e-206501b3",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:431,name:"Eric Weisgerber",role:"principal-ee",company:"",title:"PE",score:0,stage:"Outreach Sent",outreach:"2026-03-03",followUp:"2026-03-08",response:"",signals:["PE License"],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/eric-weisgerber-p-e",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:432,name:"Chris Grainger",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-03",followUp:"2026-03-08",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/chris-grainger-800a0860",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:433,name:"Josh Fults",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-03",followUp:"2026-03-08",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/joshfults",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:435,name:"Troy Neal",role:"principal-ee",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-03",followUp:"2026-03-08",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/troywneal",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:438,name:"Tory Wilson",role:"principal-ee",company:"",title:"EIT",score:0,stage:"Phone Screen",outreach:"2026-03-03",followUp:"2026-03-08",response:"Replied",signals:[],notes:"EIT credential. Phone screened.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/tory-wilson-eit-27559b145",park:false,parkReason:"",parkDate:"",parkNote:""},
  // ── SR PRODUCTION MANAGER ────────────────────────────────────────────────────
  {id:14,name:"Richard Gaylen",role:"sr-prod-mgr",company:"",title:"Production Manager",score:0,stage:"Responded",outreach:"2026-02-19",followUp:"2026-02-24",response:"Replied",signals:[],notes:"Said interested, no response since.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/richard-galyen-bba136194",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:215,name:"Eric Titlow",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Submitted",outreach:"2026-02-19",followUp:"2026-02-24",response:"Replied",signals:[],notes:"Responded, phone screened, submitted.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/eric-titlow-31178b95",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:216,name:"Joshua Sproul",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-02-19",followUp:"2026-02-24",response:"Replied",signals:[],notes:"Responded and phone screened.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/joshua-sproul-a740b6239",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:219,name:"Brian Gondles",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Responded",outreach:"2026-02-19",followUp:"2026-02-24",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/brian-gondles-40aa8480",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:227,name:"Bob Cehelnik",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-02-20",followUp:"2026-02-25",response:"Replied",signals:[],notes:"Responded and phone screened.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/bob-cehelnik-a9ba501",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:228,name:"Shane Terry",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-02-20",followUp:"2026-02-25",response:"Replied",signals:[],notes:"Responded and phone screened.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/shane-terry-ba272b246",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:232,name:"Matthew Finke",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Responded",outreach:"2026-02-20",followUp:"2026-02-25",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/matthew-finke-46544b48",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:235,name:"Tony Bella",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Submitted",outreach:"2026-02-20",followUp:"2026-02-25",response:"Replied",signals:[],notes:"Responded, phone screened, submitted.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/tony-bella-37712b16",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:237,name:"Aaron Spencer",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Responded",outreach:"2026-02-20",followUp:"2026-02-25",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/desertironwood",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:338,name:"Tim Leigh",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Not Interested",outreach:"2026-02-24",followUp:"2026-03-01",response:"Replied",signals:[],notes:"Not interested — comp too low, at much higher level.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/timothyleigh123",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:357,name:"Pawel Kurek",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Not Interested",outreach:"2026-02-25",followUp:"2026-03-02",response:"Replied",signals:[],notes:"Started new Director role a few weeks ago.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/pawel-kurek-0077b715a",park:true,parkReason:"Just Started New Role",parkDate:"2026-09-01",parkNote:"Started new Director role Feb 2026. Revisit Sept 2026."},
  {id:358,name:"Vance Washburn",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Responded",outreach:"2026-02-25",followUp:"2026-03-02",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/vance-washburn-vancewashburn",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:361,name:"Aaron Starkebaum",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Interviewing",outreach:"2026-02-25",followUp:"2026-03-02",response:"Replied",signals:[],notes:"Schnuur really liked him. Responded, screened, submitted, HM reviewed.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/aaron-starkebaum-677ba12a",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:371,name:"Thiago Pinho",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Not Interested",outreach:"2026-02-25",followUp:"2026-03-02",response:"Replied",signals:[],notes:"Looking for Director level, $200-230k base.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/thiago-pinho-3748bb21",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:377,name:"Levi Gibler",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-02-25",followUp:"2026-03-02",response:"Replied",signals:[],notes:"Responded and phone screened.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/levi-gibler",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:384,name:"Sohill Bhatt",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-02-26",followUp:"2026-03-03",response:"Replied",signals:[],notes:"Responded and phone screened.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/sohilbhatt",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:390,name:"Shivang Desai",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-02-26",followUp:"2026-03-03",response:"Replied",signals:[],notes:"Waiting for resume.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/shivang-desai-10121ab9",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:392,name:"Vijayakumar (VJ) Veeraiyan",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-02-26",followUp:"2026-03-03",response:"Replied",signals:[],notes:"Responded and phone screened.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/vveeraiyan",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:393,name:"Robert Pagan",role:"sr-prod-mgr",company:"",title:"PMC, AE1",score:0,stage:"Submitted",outreach:"2026-02-26",followUp:"2026-03-03",response:"Replied",signals:[],notes:"Responded, screened, submitted. Waiting on feedback.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/robert-pagan-pmc-ae1-u-s-navy-88204a25",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:39,name:"Derek Dougherty",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-19",followUp:"2026-03-24",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/derek-dougherty",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:40,name:"David Howell",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-19",followUp:"2026-03-24",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/david-howell-67413723",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:41,name:"Cherri Pilkington",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-19",followUp:"2026-03-24",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/cherri-pilkington",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:482,name:"Travis Cartner",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-03-04",followUp:"2026-03-09",response:"Replied",signals:[],notes:"Responded and phone screened.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/travis-cartner",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:489,name:"Rene Ruvalcaba",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-03-04",followUp:"2026-03-09",response:"Replied",signals:[],notes:"Responded and phone screened.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/rene-ruvalcaba-6b27899a",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:497,name:"James Boehmke",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-05",followUp:"2026-03-10",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/james-boehmke-b1961749",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:498,name:"Dan Patelski",role:"sr-prod-mgr",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-05",followUp:"2026-03-10",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/dan-patelski-a3a13ba5",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:499,name:"Farouk Abubakar",role:"sr-prod-mgr",company:"",title:"MSEM, CSSBB",score:0,stage:"Interviewing",outreach:"2026-03-05",followUp:"2026-03-10",response:"Replied",signals:[],notes:"Responded, screened, submitted, HM reviewed.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/farouk-abubakar-msem-cssbb-b2b10591",park:false,parkReason:"",parkDate:"",parkNote:""},
  // ── MASTER SCHEDULER ─────────────────────────────────────────────────────────
  {id:17,name:"Stella Mathenge",role:"master-scheduler",company:"",title:"Scheduler",score:0,stage:"Interviewing",outreach:"2026-02-23",followUp:"2026-02-28",response:"Replied",signals:[],notes:"Submitted and HM reviewed. Waiting on HM interview.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/stella-m-419b06333",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:18,name:"Martin DeYoung",role:"master-scheduler",company:"",title:"Scheduler",score:0,stage:"Phone Screen",outreach:"2026-03-04",followUp:"2026-03-09",response:"",signals:[],notes:"LOCAL — excellent option.",location:"Denver, CO",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/martin-deyoung-65457a25",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:19,name:"Deven Mathews",role:"master-scheduler",company:"",title:"Scheduler",score:0,stage:"Not Interested",outreach:"2026-03-04",followUp:"2026-03-09",response:"Not Interested",signals:[],notes:"Not interested, no reason.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/deven-mathews-94247912",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:20,name:"Cody Crabtree",role:"master-scheduler",company:"",title:"Scheduler",score:0,stage:"Outreach Sent",outreach:"2026-03-04",followUp:"2026-03-09",response:"",signals:["PSP","CCMP"],notes:"PSP/CCMP certified.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/cody-crabtree-psp-ccmp-430539102",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:21,name:"Eduardo Cantu",role:"master-scheduler",company:"",title:"Scheduler",score:0,stage:"Interviewing",outreach:"2026-02-23",followUp:"2026-02-28",response:"Replied",signals:[],notes:"Submitted, HM reviewed. Waiting for HM interview.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/eduardo-cantu-809b4a121",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:310,name:"Bryan Weingarten",role:"master-scheduler",company:"",title:"",score:0,stage:"Submitted",outreach:"2026-02-23",followUp:"2026-02-28",response:"Replied",signals:[],notes:"Missing P6 — dispositioned.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/bryan-weingarten-3638916a",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:453,name:"Turner Sanders",role:"master-scheduler",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-03",followUp:"2026-03-08",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/turnersanders",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:454,name:"Tim Fowler",role:"master-scheduler",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-03-03",followUp:"2026-03-08",response:"Replied",signals:[],notes:"Responded and phone screened.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/tim-fowler-a824348",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:458,name:"John C",role:"master-scheduler",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-03",followUp:"2026-03-08",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/john-c-bb350522",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:461,name:"Ayman Mahdi",role:"master-scheduler",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-03",followUp:"2026-03-08",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/aymanmahdi1",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:464,name:"Alan Page",role:"master-scheduler",company:"",title:"MSc, BSc",score:0,stage:"Responded",outreach:"2026-03-03",followUp:"2026-03-08",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/alan-page-msc-bsc-aa73072",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:465,name:"Salvan Kaptan",role:"master-scheduler",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-03-03",followUp:"2026-03-08",response:"",signals:[],notes:"Phone screened per tracker.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/salvan-kaptan-42ba3718",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:466,name:"Brandon Arnold",role:"master-scheduler",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-04",followUp:"2026-03-09",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/brandon-arnold-609796a4",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:470,name:"Edward Chavez",role:"master-scheduler",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-03-04",followUp:"2026-03-09",response:"",signals:[],notes:"Phone screened per tracker.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/edward-chavez-36556230",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:472,name:"Samuel Rochet",role:"master-scheduler",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-03-04",followUp:"2026-03-09",response:"",signals:[],notes:"Phone screened per tracker.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/samuel-rochet-4906851b",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:473,name:"Joseph Gillen",role:"master-scheduler",company:"",title:"PE",score:0,stage:"Phone Screen",outreach:"2026-03-04",followUp:"2026-03-09",response:"",signals:["PE License"],notes:"PE credential. Phone screened.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/joseph-gillen-p-e-a62001a",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:477,name:"Albert Clyde Lee",role:"master-scheduler",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-04",followUp:"2026-03-09",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/albert-clyde-lee",park:false,parkReason:"",parkDate:"",parkNote:""},
  // ── SR PROJECT MANAGER / PROJECT ENGINEER ────────────────────────────────────
  {id:350,name:"Brandon Alvarado",role:"sr-pm",company:"",title:"",score:0,stage:"Submitted",outreach:"2026-02-24",followUp:"2026-03-01",response:"Replied",signals:[],notes:"Sr Project Engineer. Submitted. In Ashby: No.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/balvarado-211602",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:351,name:"Brandon E Grant",role:"sr-pm",company:"",title:"",score:0,stage:"Interviewing",outreach:"2026-02-24",followUp:"2026-03-01",response:"Replied",signals:[],notes:"Sr Project Engineer. HM reviewed. Waiting on feedback.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/brandon-e-grant-b5772b83",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:356,name:"Neeraj Valleru",role:"sr-pm",company:"",title:"PE, PMP",score:0,stage:"Responded",outreach:"2026-02-24",followUp:"2026-03-01",response:"Replied",signals:["PE License"],notes:"Just started a new role.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/neeraj-valleru-p-e-pmp-a3593155",park:true,parkReason:"Just Started New Role",parkDate:"2026-09-01",parkNote:"Just started new role Feb 2026. PE+PMP. Revisit Sept 2026."},
  {id:401,name:"Nichola Dascher",role:"sr-pm",company:"",title:"",score:0,stage:"Submitted",outreach:"2026-03-02",followUp:"2026-03-07",response:"Not Interested",signals:[],notes:"Responded No but submitted. In Ashby.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/ndascher",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:403,name:"Jeremy Haight",role:"sr-pm",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-02",followUp:"2026-03-07",response:"Replied",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/jeremy-haight-70b281b9",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:407,name:"Aaron Willoughby",role:"sr-pm",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-03-02",followUp:"2026-03-07",response:"",signals:[],notes:"Phone screened per tracker.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/aaron-willoughby-924499220",park:false,parkReason:"",parkDate:"",parkNote:""},
  // ── TECH TRAINING MANAGER ────────────────────────────────────────────────────
  {id:80,name:"Scott Ferguson",role:"tech-training-mgr",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-09",followUp:"2026-03-14",response:"Replied",signals:[],notes:"Responded per tracker.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/scottferguson99",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:84,name:"Jennifer Knievel",role:"tech-training-mgr",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-09",followUp:"2026-03-14",response:"Replied",signals:[],notes:"Responded per tracker.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/jenniferknievel",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:85,name:"Richard Bruckner",role:"tech-training-mgr",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-09",followUp:"2026-03-14",response:"Replied",signals:[],notes:"Responded per tracker.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/richard-bruckner-20296045",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:86,name:"Isaac Hynes",role:"tech-training-mgr",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-09",followUp:"2026-03-14",response:"Replied",signals:[],notes:"Responded per tracker.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/isaachynes",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:91,name:"Jim Sparks",role:"tech-training-mgr",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-10",followUp:"2026-03-15",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/jim-sparks-b072451",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:92,name:"Andrea Gamez",role:"tech-training-mgr",company:"",title:"",score:0,stage:"Outreach Sent",outreach:"2026-03-10",followUp:"2026-03-15",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/andrea-gamez-0541a827b",park:false,parkReason:"",parkDate:"",parkNote:""},
  // ── PROJECT COST ANALYST ─────────────────────────────────────────────────────
  {id:15,name:"Obed Awaitey",role:"master-scheduler",company:"",title:"",score:0,stage:"Submitted",outreach:"2026-02-20",followUp:"2026-02-25",response:"Replied",signals:["PMP","MSIS"],notes:"Project Cost Analyst. Waiting for HM feedback. In Ashby.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/obed-awaitey-msis-pmp-b0a68976",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:16,name:"Lucas Molina",role:"master-scheduler",company:"",title:"",score:0,stage:"Submitted",outreach:"2026-02-20",followUp:"2026-02-25",response:"Replied",signals:[],notes:"Project Cost Analyst. Phone screened with Maddie. In Ashby.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/lucas-f-molina",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:116,name:"Daniel Siira",role:"master-scheduler",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-03-11",followUp:"2026-03-16",response:"Replied",signals:[],notes:"Project Cost Analyst. Responded + phone screen.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/daniel-siira-b9743376",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:118,name:"Valeria Rasquin",role:"master-scheduler",company:"",title:"",score:0,stage:"Responded",outreach:"2026-03-11",followUp:"2026-03-16",response:"Replied",signals:[],notes:"Project Cost Analyst.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/valeria-rasquin-05931754",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:124,name:"Luke Lipinski",role:"master-scheduler",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-03-11",followUp:"2026-03-16",response:"Replied",signals:[],notes:"Project Cost Analyst. Responded + phone screen.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/luke-lipinski-2a1562124",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:430,name:"Mark Sexton",role:"master-scheduler",company:"",title:"",score:0,stage:"Phone Screen",outreach:"2026-03-02",followUp:"2026-03-07",response:"Replied",signals:[],notes:"Project Cost Analyst. Responded and phone screened.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/mark-anthony-sexton",park:false,parkReason:"",parkDate:"",parkNote:""},
];

// ─── STYLE HELPERS ────────────────────────────────────────────────────────────
const sc = s => s>=85?"#22c55e":s>=70?"#f59e0b":"#ef4444";
const fmt = d => d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"2-digit"}) : "—";
const addDays = (d,n) => { const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt.toISOString().split("T")[0]; };

const S = {
  app:{minHeight:"100vh",background:"#0a0a0a",fontFamily:"'Inter',system-ui,sans-serif",color:"#e5e7eb",display:"flex",flexDirection:"column"},
  hdr:{background:"#0f0f0f",borderBottom:"1px solid #1f2937",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:48,flexShrink:0,gap:8},
  main:{flex:1,padding:"18px 20px",overflowY:"auto"},
  card:(x={})=>({background:"#111827",border:"1px solid #1f2937",borderRadius:10,padding:16,...x}),
  badge:(c)=>({background:c+"22",color:c,border:`1px solid ${c}44`,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:600,display:"inline-block"}),
  btn:(v="default")=>({background:v==="primary"?"#fff":v==="danger"?"#ef444420":v==="warn"?"#f59e0b20":v==="green"?"#22c55e20":"#1f2937",color:v==="primary"?"#000":v==="danger"?"#ef4444":v==="warn"?"#f59e0b":v==="green"?"#22c55e":"#9ca3af",border:v==="danger"?"1px solid #ef444440":v==="warn"?"1px solid #f59e0b40":v==="green"?"1px solid #22c55e40":"1px solid #374151",borderRadius:7,padding:"6px 13px",cursor:"pointer",fontSize:12,fontWeight:v==="primary"?600:400}),
  inp:{background:"#1f2937",border:"1px solid #374151",borderRadius:7,padding:"7px 11px",color:"#fff",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"},
  lbl:{fontSize:11,color:"#6b7280",display:"block",marginBottom:4},
  g2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14},
  g4:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12},
  nav:(a)=>({background:a?"#fff":"none",color:a?"#000":"#9ca3af",border:"none",borderRadius:5,padding:"4px 9px",cursor:"pointer",fontSize:11,fontWeight:a?600:400,whiteSpace:"nowrap"}),
};

function stageBadge(stage) {
  const m = {"Sourced":{bg:"#1e293b",c:"#94a3b8"},"Outreach Sent":{bg:"#172554",c:"#93c5fd"},"Follow-Up Sent":{bg:"#1e3a5f",c:"#60a5fa"},"Responded":{bg:"#2e1065",c:"#c4b5fd"},"Phone Screen":{bg:"#1e1b4b",c:"#a5b4fc"},"Submitted":{bg:"#064e3b",c:"#6ee7b7"},"HM Screen":{bg:"#065f46",c:"#34d399"},"Interviewing":{bg:"#14532d",c:"#4ade80"},"Offer":{bg:"#713f12",c:"#fde68a"},"Hired":{bg:"#166534",c:"#bbf7d0"},"Not Interested":{bg:"#7f1d1d",c:"#fca5a5"},"Pass":{bg:"#450a0a",c:"#f87171"},"Final Stage - Not Hired":{bg:"#292524",c:"#a8a29e"}};
  return m[stage]||{bg:"#1e293b",c:"#94a3b8"};
}
function stageBar(stage) {
  const m = {"Sourced":"#475569","Outreach Sent":"#3b82f6","Follow-Up Sent":"#60a5fa","Responded":"#8b5cf6","Phone Screen":"#6366f1","Submitted":"#10b981","HM Screen":"#059669","Interviewing":"#16a34a","Offer":"#eab308","Hired":"#22c55e","Not Interested":"#ef4444","Pass":"#dc2626","Final Stage - Not Hired":"#78716c"};
  return m[stage]||"#3b82f6";
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("Dashboard");
  const [candidates, setCandidates] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : SEED;
    } catch { return SEED; }
  });
  const [roleFilter, setRoleFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [selCand, setSelCand] = useState(null);
  const [selRole, setSelRole] = useState(null);
  const [showAddC, setShowAddC] = useState(false);
  const [newC, setNewC] = useState({name:"",role:"staff-estimator",company:"",title:"",location:"",notes:"",relocation:false,source:"LinkedIn",linkedin:""});
  const [compareIds, setCompareIds] = useState([]);
  const [scoreInput, setScoreInput] = useState("");
  const [scoreRole, setScoreRole] = useState("staff-estimator");
  const [scoreResult, setScoreResult] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [intakeRole, setIntakeRole] = useState("staff-estimator");
  const [intakeData, setIntakeData] = useState({mustHaves:"",niceToHaves:"",dealBreakers:"",comp:"",relocation:"Yes",timeline:"",notes:""});
  const [intakes, setIntakes] = useState({});
  const [weeklyDept, setWeeklyDept] = useState("Manufacturing");
  const [showPark, setShowPark] = useState(false);
  const [parkTarget, setParkTarget] = useState(null);
  const [parkForm, setParkForm] = useState({reason:"Just Started New Role",date:"",note:""});
  const [bulkText, setBulkText] = useState("");
  const [bulkRole, setBulkRole] = useState("staff-estimator");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState([]);
  const [bulkMsg, setBulkMsg] = useState("");
  const [msgCand, setMsgCand] = useState(null);
  const [msgType, setMsgType] = useState("inmail");
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  // ─── PERSIST TO LOCALSTORAGE ────────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
      setSaveMsg("✓ Saved");
      const t = setTimeout(()=>setSaveMsg(""),2000);
      return ()=>clearTimeout(t);
    } catch(e) { setSaveMsg("⚠ Save failed"); }
  }, [candidates]);

  const active = useMemo(()=>candidates.filter(c=>!c.park),[candidates]);
  const parked = useMemo(()=>candidates.filter(c=>c.park),[candidates]);
  const filtered = useMemo(()=>{
    let list = active;
    if(roleFilter!=="all") list=list.filter(c=>c.role===roleFilter);
    if(stageFilter!=="all") list=list.filter(c=>c.stage===stageFilter);
    if(searchQ){const q=searchQ.toLowerCase();list=list.filter(c=>c.name.toLowerCase().includes(q)||c.company.toLowerCase().includes(q)||c.title.toLowerCase().includes(q));}
    return list.sort((a,b)=>b.score-a.score);
  },[active,roleFilter,stageFilter,searchQ]);

  const getRoleById = id => ROLES.find(r=>r.id===id);
  const dnhCheck = co => {
    if(!co) return null;
    const c=co.toLowerCase();
    if(c.includes("openai")) return "OpenAI";
    if(c.includes("nvidia")) return "NVIDIA";
    if(c.includes("amd")&&!c.includes("command")) return "AMD";
    if(c.includes("dpr")) return "DPR Construction";
    if(c.includes("oracle")) return "Oracle";
    if(c.includes("google")) return "Google";
    return null;
  };

  function updateCands(fn) { setCandidates(prev=>fn(prev)); }
  function setStageF(id,s) { updateCands(cs=>cs.map(c=>c.id===id?{...c,stage:s}:c)); }
  function setResponse(id,r) { updateCands(cs=>cs.map(c=>c.id===id?{...c,response:r}:c)); }
  function delCand(id) { updateCands(cs=>cs.filter(c=>c.id!==id)); setSelCand(null); }
  function unpark(id) { updateCands(cs=>cs.map(c=>c.id===id?{...c,park:false,parkReason:"",parkDate:"",parkNote:""}:c)); }
  function doPark() {
    if(!parkTarget) return;
    updateCands(cs=>cs.map(c=>c.id===parkTarget?{...c,park:true,stage:"Pass",parkReason:parkForm.reason,parkDate:parkForm.date,parkNote:parkForm.note}:c));
    setShowPark(false); setParkTarget(null); setParkForm({reason:"Just Started New Role",date:"",note:""}); setSelCand(null);
  }
  function addManual() {
    if(!newC.name.trim()) return;
    updateCands(cs=>[...cs,{...newC,id:Date.now(),score:0,stage:"Sourced",outreach:"",followUp:"",response:"",signals:[],park:false,parkReason:"",parkDate:"",parkNote:""}]);
    setNewC({name:"",role:"staff-estimator",company:"",title:"",location:"",notes:"",relocation:false,source:"LinkedIn",linkedin:""});
    setShowAddC(false);
  }
  function resetToSeed() {
    if(!window.confirm("Reset all candidate data to seed data? This cannot be undone.")) return;
    localStorage.removeItem(STORAGE_KEY);
    setCandidates(SEED);
  }

  function exportCSV() {
    const hdr = ["Name","Role","Company","Title","Score","Stage","Response","Outreach","Follow-Up","Location","Relocation","Signals","Notes","LinkedIn","Parked","Park Reason","Park Date"];
    const rows = candidates.map(c => {
      const r = getRoleById(c.role);
      return [c.name,r?.title||c.role,c.company,c.title,c.score,c.stage,c.response||"",c.outreach||"",c.followUp||"",c.location||"",c.relocation?"Yes":"No",(c.signals||[]).join(";"),( c.notes||"").replace(/,/g," "),c.linkedin||"",c.park?"Yes":"No",c.parkReason||"",c.parkDate||""].map(x=>`"${(x||"").toString().replace(/"/g,'""')}"`).join(",");
    });
    const blob = new Blob([[hdr.join(","),...rows].join("\n")],{type:"text/csv"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`crusoe_pipeline_${new Date().toISOString().split("T")[0]}.csv`; a.click();
  }

  // ─── BULK ADD ────────────────────────────────────────────────────────────────
  async function doBulkAdd() {
    if(!bulkText.trim()){setBulkMsg("Paste some profiles first.");return;}
    setBulkLoading(true);setBulkResults([]);setBulkMsg("");
    const role=getRoleById(bulkRole)||ROLES[0];
    const prompt=`You are an expert technical recruiter at Crusoe Energy. Score each candidate against the job description.
JD for ${role.title}: ${role.jd}
KEY SIGNALS: ${role.signals.join(", ")}
RUBRIC: ${role.rubric.map(r=>`${r.l}: ${r.w}pts`).join(", ")}
PROFILES: ${bulkText}
Return ONLY a JSON array, no markdown. Each item:
{"name":"","title":"","company":"","location":"","score":0,"scoreReason":"","summary":"","signals":[],"outreach_worthy":true,"park":false,"park_reason":"","dnh_flag":false}`;
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const txt=data.content?.find(b=>b.type==="text")?.text||"[]";
      const arr=JSON.parse(txt.replace(/```json|```/g,"").trim());
      const added=[];
      arr.forEach(p=>{
        if(p.name&&!p.dnh_flag){
          const today=new Date().toISOString().split("T")[0];
          const fu=addDays(today,FOLLOW_UP_DAYS);
          updateCands(cs=>[...cs,{id:Date.now()+Math.random(),name:p.name,role:bulkRole,company:p.company||"",title:p.title||"",score:p.score||0,stage:"Sourced",outreach:"",followUp:"",response:"",signals:p.signals||[],notes:p.summary||"",location:p.location||"",relocation:false,source:"LinkedIn",linkedin:"",park:p.park||false,parkReason:p.park_reason||"",parkDate:"",parkNote:p.park_reason||""}]);
          added.push({...p,added:true});
        } else if(p.dnh_flag){added.push({...p,added:false});}
      });
      setBulkResults(added);
      setBulkMsg(`Done — ${added.filter(x=>x.added).length} candidate(s) added.`);
    }catch(e){setBulkMsg("Parsing failed. Try again.");}
    setBulkLoading(false);
  }

  // ─── SCORE ────────────────────────────────────────────────────────────────────
  async function doScore() {
    if(!scoreInput.trim()) return;
    setScoring(true);setScoreResult(null);
    const role=getRoleById(scoreRole)||ROLES[0];
    const prompt=`You are a technical sourcer at Crusoe Energy. Score this candidate for ${role.title}.
DO NOT HIRE if at: ${DNH.join(", ")}. Flag explicitly if detected.
RUBRIC: ${role.rubric.map(r=>`${r.l} (${r.w}pts)`).join(", ")}
SIGNALS: ${role.signals.join(", ")}
CANDIDATE: ${scoreInput}
Respond ONLY in JSON (no markdown):
{"name":"","score":0,"recommendation":"Strong Yes/Yes/Maybe/No","dnh_flag":false,"dnh_reason":"","summary":"","signals_matched":[],"rubric_scores":[{"label":"","score":0,"max":0}],"pros":[],"cons":[],"outreach_worthy":true,"park_suggestion":false,"park_reason":""}`;
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const text=data.content?.find(b=>b.type==="text")?.text||"{}";
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      setScoreResult(parsed);
      if(parsed.name&&parsed.score&&!parsed.dnh_flag){
        updateCands(cs=>[...cs,{id:Date.now(),name:parsed.name,role:scoreRole,company:"",title:"",score:parsed.score,stage:"Sourced",outreach:"",followUp:"",response:"",signals:parsed.signals_matched||[],notes:parsed.summary||"",location:"",relocation:false,source:"LinkedIn",linkedin:"",park:parsed.park_suggestion||false,parkReason:parsed.park_reason||"",parkDate:"",parkNote:parsed.park_reason||""}]);
      }
    }catch(e){setScoreResult({error:"Scoring failed."});}
    setScoring(false);
  }

  // ─── MESSAGE GEN ──────────────────────────────────────────────────────────────
  async function genMsg(cand,type) {
    setMsgCand(cand);setMsgType(type);setMsgLoading(true);setMsgText("");
    const role=getRoleById(cand.role);
    const isInmail=type==="inmail";
    const prompt=isInmail
      ?`You are Shawn Johnsen, Sr. Sourcer at Crusoe Energy (internal, not agency). Write a LinkedIn InMail.
RULES: 1,600–1,800 characters. Introduce as Shawn Johnsen Sr. Sourcer Crusoe Energy. Sell Crusoe and role FIRST. Explain WHY reaching out based on their background. 2–3 smart clarifying questions. Include sjohnsen@crusoe.ai and ${role?.link||"[JD LINK]"}. Ask for resume or application. If not in Denver/Arvada: note on-site in Arvada with relocation assistance. NEVER: other employee names, phone numbers, 15-min call request.
CRUSOE: ${CRUSOE_BIO}
ROLE: ${role?.title} | JD: ${role?.jd||""}
CANDIDATE: ${cand.name}, ${cand.title} at ${cand.company} (${cand.location||""}) | SIGNALS: ${cand.signals?.join(", ")||""}
Output only the message text:`
      :`You are Shawn Johnsen, Sr. Sourcer at Crusoe Energy. Write a ${FOLLOW_UP_DAYS}-day follow-up to ${cand.name} who hasn't responded.
RULES: 800–1,200 characters. Brief friendly re-intro. ONE compelling Crusoe/role reason. Low pressure. CTA: resume/apply. Include sjohnsen@crusoe.ai and ${role?.link||"[JD LINK]"}. NO employee names, phone, 15-min call ask.
ROLE: ${role?.title} | CANDIDATE: ${cand.name}, ${cand.title} at ${cand.company}
Output only the message text:`;
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      setMsgText(data.content?.find(b=>b.type==="text")?.text||"Generation failed.");
    }catch{setMsgText("Generation failed.");}
    setMsgLoading(false);
  }

  function copyAndMark(cand,type) {
    navigator.clipboard?.writeText(msgText).catch(()=>{});
    const today=new Date().toISOString().split("T")[0];
    const fu=addDays(today,FOLLOW_UP_DAYS);
    if(type==="inmail") updateCands(cs=>cs.map(c=>c.id===cand.id?{...c,stage:"Outreach Sent",outreach:today,followUp:fu}:c));
    if(type==="followup") updateCands(cs=>cs.map(c=>c.id===cand.id?{...c,stage:"Follow-Up Sent",followUp:fu}:c));
    setMsgCand(null);setMsgText("");
  }

  // ─── DASHBOARD ────────────────────────────────────────────────────────────────
  const renderDash = () => {
    const out=active.filter(c=>["Outreach Sent","Follow-Up Sent","Responded","Phone Screen","Submitted","HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
    const sub=active.filter(c=>["Submitted","HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
    const hmScreen=active.filter(c=>["HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
    const hired=active.filter(c=>c.stage==="Hired").length;
    const finalNotHired=active.filter(c=>c.stage==="Final Stage - Not Hired").length;
    const dueFU=active.filter(c=>c.followUp&&new Date(c.followUp)<=TODAY&&!["Responded","Phone Screen","Submitted","HM Screen","Interviewing","Offer","Hired","Not Interested","Pass","Final Stage - Not Hired"].includes(c.stage)).length;
    return(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
          <div><h1 style={{margin:0,fontSize:19,fontWeight:700}}>Sourcing Dashboard</h1><p style={{margin:"3px 0 0",color:"#6b7280",fontSize:12}}>Shawn Johnsen · Sr. Sourcer · Crusoe Energy · {TODAY.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p></div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {saveMsg&&<span style={{fontSize:11,color:"#22c55e"}}>{saveMsg}</span>}
            <button onClick={exportCSV} style={S.btn()}>⬇ Export CSV</button>
          </div>
        </div>
        {/* TOP STAT CARDS */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
          {[
            {l:"Total Active",v:active.length,c:"#60a5fa",s:"in pipeline"},
            {l:"Outreach Sent",v:out,c:"#a78bfa",s:"InMails + follow-ups"},
            {l:"Submitted",v:sub,c:"#34d399",s:"to hiring managers"},
            {l:"HM Screen+",v:hmScreen,c:"#fbbf24",s:"past submission"},
            {l:"Hired",v:hired,c:"#22c55e",s:"offers accepted"},
          ].map(x=>(
            <div key={x.l} style={{...S.card(),borderLeft:`3px solid ${x.c}`}}>
              <div style={{fontSize:22,fontWeight:700,color:x.c}}>{x.v}</div>
              <div style={{fontSize:11,fontWeight:600,marginTop:2}}>{x.l}</div>
              <div style={{fontSize:10,color:"#6b7280",marginTop:1}}>{x.s}</div>
            </div>
          ))}
        </div>
        {/* SECONDARY METRICS */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {[
            {l:"Parked",v:parked.length,c:"#f59e0b",s:"talent bank"},
            {l:"Phone Screens",v:active.filter(c=>["Phone Screen","Submitted","HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length,c:"#6366f1",s:"screened"},
            {l:"Interviewing",v:active.filter(c=>["Interviewing","Offer","Hired"].includes(c.stage)).length,c:"#10b981",s:"active interviews"},
            {l:"Final/Not Hired",v:finalNotHired,c:"#78716c",s:"completed process"},
          ].map(x=>(
            <div key={x.l} style={{...S.card(),padding:"10px 14px"}}>
              <div style={{fontSize:18,fontWeight:700,color:x.c}}>{x.v}</div>
              <div style={{fontSize:11,fontWeight:600,marginTop:1}}>{x.l}</div>
              <div style={{fontSize:10,color:"#6b7280"}}>{x.s}</div>
            </div>
          ))}
        </div>
        {dueFU>0&&<div style={{background:"#f59e0b11",border:"1px solid #f59e0b33",borderRadius:8,padding:"9px 14px",fontSize:13,color:"#f59e0b"}}>⚡ {dueFU} follow-up{dueFU>1?"s":""} overdue ({FOLLOW_UP_DAYS}-day window) — check Pipeline.</div>}
        <div style={S.g2}>
          <div style={S.card()}>
            <div style={{fontSize:11,color:"#6b7280",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Active Roles ({ROLES.length})</div>
            {ROLES.map(r=>{
              const rc=active.filter(c=>c.role===r.id);
              const adv=rc.filter(c=>["Submitted","HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
              return(<div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #1f2937",cursor:"pointer"}} onClick={()=>{setView("Pipeline");setRoleFilter(r.id);}}>
                <div><div style={{fontSize:12,fontWeight:500}}>{r.title}</div><div style={{fontSize:11,color:"#6b7280",marginTop:1}}>HM: {r.hm} · {r.comp}</div></div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#34d399"}}>{adv} adv</span>
                  <span style={{fontSize:11,color:"#9ca3af"}}>{rc.length} total</span>
                  <span style={S.badge("#22c55e")}>{r.status}</span>
                </div>
              </div>);
            })}
          </div>
          <div style={S.card()}>
            <div style={{fontSize:11,color:"#6b7280",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Pipeline Funnel</div>
            {STAGES.map(s=>{const n=active.filter(c=>c.stage===s).length;const pct=active.length?Math.round((n/active.length)*100):0;return n>0?(
              <div key={s} style={{marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}><span style={{color:"#d1d5db"}}>{s}</span><span style={{color:"#6b7280"}}>{n}</span></div>
                <div style={{background:"#1f2937",borderRadius:3,height:4}}><div style={{background:stageBar(s),borderRadius:3,height:4,width:pct+"%",transition:"width .4s"}}/></div>
              </div>
            ):null;})}
          </div>
        </div>
      </div>
    );
  };

  // ─── PIPELINE ─────────────────────────────────────────────────────────────────
  const renderPipeline = () => (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
        <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Candidate Pipeline</h1>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <input placeholder="Search..." value={searchQ} onChange={e=>setSearchQ(e.target.value)} style={{...S.inp,width:150}}/>
          <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} style={{...S.inp,width:"auto"}}>
            <option value="all">All Roles</option>
            {ROLES.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
          <select value={stageFilter} onChange={e=>setStageFilter(e.target.value)} style={{...S.inp,width:"auto"}}>
            <option value="all">All Stages</option>
            {STAGES.map(s=><option key={s}>{s}</option>)}
          </select>
          <button onClick={()=>setShowAddC(true)} style={S.btn("primary")}>+ Add</button>
          <button onClick={exportCSV} style={S.btn()}>⬇ CSV</button>
        </div>
      </div>
      {compareIds.length>1&&(
        <div style={{...S.card(),background:"#1a1f2e",border:"1px solid #3b4fd8"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontWeight:600,fontSize:13}}>Comparing {compareIds.length}</span><button onClick={()=>setCompareIds([])} style={S.btn()}>Clear</button></div>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${compareIds.length},1fr)`,gap:10}}>
            {compareIds.map(id=>{const c=candidates.find(x=>x.id===id);return c?(
              <div key={id} style={{background:"#111827",borderRadius:7,padding:10}}>
                <div style={{fontWeight:600,fontSize:12}}>{c.name}</div>
                <div style={{color:"#6b7280",fontSize:11}}>{c.title}</div>
                <div style={{fontSize:20,fontWeight:700,color:sc(c.score),marginTop:4}}>{c.score||"—"}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:4}}>{(c.signals||[]).map(s=><span key={s} style={{background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e44",borderRadius:20,padding:"1px 6px",fontSize:9}}>✓ {s}</span>)}</div>
              </div>
            ):null;})}
          </div>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {filtered.length===0?<div style={{textAlign:"center",padding:36,color:"#4b5563"}}>No candidates match filters.</div>:
          filtered.map((c,i)=>{
            const role=getRoleById(c.role);
            const fuDue=c.followUp&&new Date(c.followUp)<=TODAY&&!["Responded","Phone Screen","Submitted","HM Screen","Interviewing","Offer","Hired","Not Interested","Pass","Final Stage - Not Hired"].includes(c.stage);
            const dnh=dnhCheck(c.company);
            const isCmp=compareIds.includes(c.id);
            const sb=stageBadge(c.stage);
            return(
              <div key={c.id} style={{...S.card(),cursor:"pointer",border:isCmp?"1px solid #3b4fd8":dnh?"1px solid #ef444440":"1px solid #1f2937"}} onClick={()=>setSelCand(c)}>
                {fuDue&&<div style={{...S.badge("#f59e0b"),float:"right",marginBottom:4}}>⚡ Follow-up Due</div>}
                {dnh&&<div style={{...S.badge("#ef4444"),float:"right",marginRight:fuDue?120:0,marginBottom:4}}>⛔ DNH</div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:6}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <span style={{fontSize:14,fontWeight:600}}>{c.name}</span>
                      {c.score>0&&<span style={{fontSize:13,fontWeight:700,color:sc(c.score)}}>{c.score}</span>}
                      {c.relocation&&<span style={S.badge("#60a5fa")}>Relocating</span>}
                      {c.location&&<span style={{fontSize:11,color:"#6b7280"}}>📍{c.location}</span>}
                    </div>
                    <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{c.title}{c.company?` · ${c.company}`:""}</div>
                    <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{role?.title||c.role} · Out: {fmt(c.outreach)} · FU: {fmt(c.followUp)}</div>
                  </div>
                  <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}} onClick={e=>e.stopPropagation()}>
                    <select value={c.stage} onChange={e=>setStageF(c.id,e.target.value)} style={{background:sb.bg,color:sb.c,border:`1px solid ${sb.c}44`,borderRadius:6,padding:"3px 6px",fontSize:11,cursor:"pointer"}}>
                      {STAGES.map(s=><option key={s}>{s}</option>)}
                    </select>
                    <select value={c.response||""} onChange={e=>setResponse(c.id,e.target.value)} style={{...S.inp,width:"auto",fontSize:11}}>
                      <option value="">Response</option>
                      {["No Response","Replied","Interested","Not Interested","Wrong Person"].map(r=><option key={r}>{r}</option>)}
                    </select>
                    <button onClick={()=>genMsg(c,"inmail")} style={{...S.btn("green"),fontSize:11,padding:"4px 8px"}}>✉</button>
                    <button onClick={()=>setCompareIds(ids=>ids.includes(c.id)?ids.filter(x=>x!==c.id):[...ids.slice(-2),c.id])} style={{...S.btn(isCmp?"primary":""),fontSize:11,padding:"4px 8px"}}>{isCmp?"✓":"Cmp"}</button>
                    <button onClick={()=>{setParkTarget(c.id);setParkForm({reason:"Just Started New Role",date:"",note:""});setShowPark(true);}} style={{...S.btn("warn"),fontSize:11,padding:"4px 8px"}}>🅿</button>
                  </div>
                </div>
                {(c.signals||[]).length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>{c.signals.map(s=><span key={s} style={{background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e44",borderRadius:20,padding:"1px 6px",fontSize:10}}>✓ {s}</span>)}</div>}
                {c.notes&&<div style={{fontSize:11,color:"#6b7280",marginTop:4,fontStyle:"italic"}}>{c.notes}</div>}
              </div>
            );
          })}
      </div>

      {/* CANDIDATE DETAIL MODAL */}
      {selCand&&(()=>{const c=selCand;const role=getRoleById(c.role);const dnh=dnhCheck(c.company);const sb=stageBadge(c.stage);return(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}} onClick={()=>setSelCand(null)}>
          <div style={{background:"#111827",border:"1px solid #374151",borderRadius:12,padding:22,width:560,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
              <div><div style={{fontSize:17,fontWeight:700}}>{c.name}</div><div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>{c.title} · {c.company}</div><div style={{fontSize:11,color:"#6b7280",marginTop:1}}>{role?.title||c.role}</div></div>
              {c.score>0&&<div style={{fontSize:26,fontWeight:700,color:sc(c.score)}}>{c.score}</div>}
            </div>
            {dnh&&<div style={{background:"#ef444415",border:"1px solid #ef444430",borderRadius:7,padding:"8px 12px",marginBottom:10,fontSize:12,color:"#ef4444"}}>⛔ DO NOT HIRE — {dnh}. {DNH_NOTES[dnh]||""}</div>}
            <div style={{...S.g2,marginBottom:10}}>
              {[["Stage",<span style={{background:sb.bg,color:sb.c,borderRadius:4,padding:"2px 8px",fontSize:11}}>{c.stage}</span>],["Response",c.response||"—"],["Outreach",fmt(c.outreach)],["Follow-up",fmt(c.followUp)],["Location",c.location||"—"],["Source",c.source||"—"]].map(([k,v])=>(
                <div key={k}><div style={{fontSize:10,color:"#6b7280"}}>{k}</div><div style={{fontSize:12,fontWeight:500,marginTop:1}}>{v}</div></div>
              ))}
            </div>
            {c.linkedin&&<div style={{marginBottom:8}}><a href={c.linkedin} target="_blank" rel="noreferrer" style={{color:"#60a5fa",fontSize:12,textDecoration:"none"}}>🔗 View LinkedIn ↗</a></div>}
            {(c.signals||[]).length>0&&<div style={{marginBottom:10}}><div style={{fontSize:10,color:"#6b7280",marginBottom:4}}>SIGNALS</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{c.signals.map(s=><span key={s} style={{background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e44",borderRadius:20,padding:"2px 8px",fontSize:11}}>✓ {s}</span>)}</div></div>}
            {c.notes&&<div style={{marginBottom:10}}><div style={{fontSize:10,color:"#6b7280",marginBottom:3}}>NOTES</div><div style={{fontSize:12,color:"#d1d5db",lineHeight:1.6}}>{c.notes}</div></div>}
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,color:"#6b7280",marginBottom:4}}>QUICK STAGE UPDATE</div>
              <select value={c.stage} onChange={e=>{setStageF(c.id,e.target.value);setSelCand({...c,stage:e.target.value});}} style={{...S.inp,fontSize:12}}>
                {STAGES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:"#6b7280",marginBottom:4}}>HM BRIEF</div>
              <div style={{background:"#0d1117",border:"1px solid #1f2937",borderRadius:7,padding:10,fontSize:12,color:"#d1d5db",lineHeight:1.7}}>
                <strong>{c.name}</strong> — {c.title} at {c.company||"[Co]"}. Score: {c.score||"TBD"}/100 for {role?.title||c.role}. Signals: {(c.signals||[]).join(", ")||"None"}. Stage: {c.stage}.{c.relocation?" Open to relocation.":""}{c.notes?` ${c.notes}`:""}
              </div>
              <button onClick={()=>{const t=`${c.name} — ${c.title} at ${c.company}. Score: ${c.score||"TBD"}/100 for ${role?.title}. Signals: ${(c.signals||[]).join(", ")||"None"}. Stage: ${c.stage}.${c.relocation?" Open to relocation.":""}${c.notes?" "+c.notes:""}`;navigator.clipboard?.writeText(t);}} style={{...S.btn(),fontSize:11,marginTop:5}}>Copy Brief</button>
            </div>
            <div style={{display:"flex",gap:6,justifyContent:"space-between",flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>genMsg(c,"inmail")} style={S.btn("green")}>✉ InMail</button>
                <button onClick={()=>genMsg(c,"followup")} style={S.btn()}>🔁 Follow-Up</button>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>delCand(c.id)} style={S.btn("danger")}>Delete</button>
                <button onClick={()=>{setParkTarget(c.id);setParkForm({reason:"Just Started New Role",date:"",note:""});setShowPark(true);}} style={S.btn("warn")}>🅿 Park</button>
                <button onClick={()=>setSelCand(null)} style={S.btn()}>Close</button>
              </div>
            </div>
          </div>
        </div>
      );})()}

      {/* ADD MODAL */}
      {showAddC&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
        <div style={{background:"#111827",border:"1px solid #374151",borderRadius:12,padding:22,width:420,maxWidth:"95vw"}}>
          <h2 style={{margin:"0 0 14px",fontSize:15}}>Add Candidate Manually</h2>
          {[["Name *","name"],["Company","company"],["Title","title"],["Location","location"],["LinkedIn URL","linkedin"]].map(([l,k])=>(<div key={k} style={{marginBottom:9}}><label style={S.lbl}>{l}</label><input value={newC[k]} onChange={e=>setNewC(v=>({...v,[k]:e.target.value}))} style={S.inp}/></div>))}
          <div style={{marginBottom:9}}><label style={S.lbl}>Role</label><select value={newC.role} onChange={e=>setNewC(v=>({...v,role:e.target.value}))} style={S.inp}>{ROLES.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select></div>
          <div style={{marginBottom:9}}><label style={S.lbl}>Source</label><select value={newC.source} onChange={e=>setNewC(v=>({...v,source:e.target.value}))} style={S.inp}>{["LinkedIn","Referral","Indeed","Other"].map(s=><option key={s}>{s}</option>)}</select></div>
          <div style={{marginBottom:12}}><label style={S.lbl}>Notes</label><textarea value={newC.notes} onChange={e=>setNewC(v=>({...v,notes:e.target.value}))} rows={2} style={{...S.inp,resize:"vertical"}}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button onClick={()=>setShowAddC(false)} style={S.btn()}>Cancel</button><button onClick={addManual} style={S.btn("primary")}>Add</button></div>
        </div>
      </div>}

      {/* PARK MODAL */}
      {showPark&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
        <div style={{background:"#111827",border:"1px solid #f59e0b44",borderRadius:12,padding:22,width:370,maxWidth:"95vw"}}>
          <h2 style={{margin:"0 0 12px",fontSize:15,color:"#f59e0b"}}>🅿 Park for Later</h2>
          <div style={{marginBottom:9}}><label style={S.lbl}>Reason</label><select value={parkForm.reason} onChange={e=>setParkForm(v=>({...v,reason:e.target.value}))} style={S.inp}>{PARK_REASONS.map(r=><option key={r}>{r}</option>)}</select></div>
          <div style={{marginBottom:9}}><label style={S.lbl}>Re-engage Date</label><input type="date" value={parkForm.date} onChange={e=>setParkForm(v=>({...v,date:e.target.value}))} style={S.inp}/></div>
          <div style={{marginBottom:12}}><label style={S.lbl}>Note</label><textarea value={parkForm.note} onChange={e=>setParkForm(v=>({...v,note:e.target.value}))} rows={2} style={{...S.inp,resize:"vertical"}}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button onClick={()=>setShowPark(false)} style={S.btn()}>Cancel</button><button onClick={doPark} style={S.btn("warn")}>Park</button></div>
        </div>
      </div>}

      {/* MESSAGE MODAL */}
      {msgCand&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
        <div style={{background:"#111827",border:"1px solid #374151",borderRadius:12,padding:22,width:580,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div><div style={{fontSize:14,fontWeight:700}}>✉️ {msgCand.name}</div><div style={{fontSize:11,color:"#6b7280"}}>{getRoleById(msgCand.role)?.title}</div></div>
            <button onClick={()=>{setMsgCand(null);setMsgText("");}} style={S.btn()}>✕</button>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <button onClick={()=>genMsg(msgCand,"inmail")} style={{...S.btn(msgType==="inmail"?"primary":""),flex:1}}>📨 Initial InMail (1,600–1,800)</button>
            <button onClick={()=>genMsg(msgCand,"followup")} style={{...S.btn(msgType==="followup"?"primary":""),flex:1}}>🔁 {FOLLOW_UP_DAYS}-Day Follow-Up (800–1,200)</button>
          </div>
          {msgLoading&&<div style={{textAlign:"center",padding:16,color:"#6b7280"}}>⏳ Generating...</div>}
          {msgText&&<>
            <div style={{fontSize:11,color:"#6b7280",marginBottom:3}}>~{msgText.length.toLocaleString()} characters</div>
            <textarea value={msgText} onChange={e=>setMsgText(e.target.value)} rows={14} style={{...S.inp,resize:"vertical",fontSize:12,lineHeight:1.5,marginBottom:8}}/>
            <button onClick={()=>copyAndMark(msgCand,msgType)} style={{...S.btn("green"),width:"100%"}}>📋 Copy & Mark Sent (auto-sets {FOLLOW_UP_DAYS}-day follow-up)</button>
          </>}
        </div>
      </div>}
    </div>
  );

  // ─── METRICS ─────────────────────────────────────────────────────────────────
  const renderMetrics = () => {
    const total=active.length;
    const byStage=STAGES.reduce((a,s)=>{a[s]=active.filter(c=>c.stage===s).length;return a;},{});
    const responded=active.filter(c=>["Responded","Phone Screen","Submitted","HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
    const screens=active.filter(c=>["Phone Screen","Submitted","HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
    const submitted=active.filter(c=>["Submitted","HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
    const hmScreened=active.filter(c=>["HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
    const hired=active.filter(c=>c.stage==="Hired").length;
    const finalNotHired=active.filter(c=>c.stage==="Final Stage - Not Hired").length;
    const byRole=ROLES.map(r=>({...r,total:active.filter(c=>c.role===r.id).length,resp:active.filter(c=>c.role===r.id&&["Responded","Phone Screen","Submitted","HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length,sub:active.filter(c=>c.role===r.id&&["Submitted","HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length,hm:active.filter(c=>c.role===r.id&&["HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length,hired:active.filter(c=>c.role===r.id&&c.stage==="Hired").length}));
    return(
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <h2 style={{margin:0,fontSize:18,fontWeight:700}}>📊 Metrics Dashboard</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {[
            {l:"Response Rate",v:total?Math.round(responded/total*100)+"%":"—",c:"#8b5cf6"},
            {l:"Screen Rate",v:total?Math.round(screens/total*100)+"%":"—",c:"#6366f1"},
            {l:"Submit Rate",v:total?Math.round(submitted/total*100)+"%":"—",c:"#10b981"},
            {l:"HM Screen Rate",v:total?Math.round(hmScreened/total*100)+"%":"—",c:"#f59e0b"},
          ].map(s=>(
            <div key={s.l} style={{...S.card(),textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:700,color:s.c}}>{s.v}</div>
              <div style={{fontSize:11,color:"#6b7280"}}>{s.l}</div>
            </div>
          ))}
        </div>
        {/* FUNNEL */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={S.card()}>
            <div style={{fontSize:11,color:"#6b7280",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Full Funnel</div>
            {[
              {l:"Total Sourced",v:total,c:"#475569"},
              {l:"Responded",v:responded,c:"#8b5cf6"},
              {l:"Phone Screened",v:screens,c:"#6366f1"},
              {l:"Submitted",v:submitted,c:"#10b981"},
              {l:"HM Screen",v:hmScreened,c:"#f59e0b"},
              {l:"Hired",v:hired,c:"#22c55e"},
              {l:"Final Stage - Not Hired",v:finalNotHired,c:"#78716c"},
            ].map(({l,v,c})=>(
              <div key={l} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}><span style={{color:"#d1d5db"}}>{l}</span><span style={{fontWeight:600,color:c}}>{v} {total&&v>0?"("+Math.round(v/total*100)+"%)":""}</span></div>
                <div style={{background:"#1f2937",borderRadius:3,height:5}}><div style={{background:c,borderRadius:3,height:"100%",width:(total?Math.round(v/total*100):0)+"%",transition:"width .4s"}}/></div>
              </div>
            ))}
          </div>
          <div style={S.card()}>
            <div style={{fontSize:11,color:"#6b7280",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>By Role</div>
            {byRole.filter(r=>r.total>0).map(r=>(
              <div key={r.id} style={{marginBottom:10,paddingBottom:10,borderBottom:"1px solid #1f2937"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                  <span style={{fontWeight:500,color:"#f1f5f9"}}>{r.title}</span>
                  <span style={{color:"#6b7280"}}>{r.total} sourced</span>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {[["Resp",r.resp,"#8b5cf6"],["Screen",r.total&&r.resp?Math.round(r.resp/r.total*100)+"%" :"—","#6366f1"],["Submitted",r.sub,"#10b981"],["HM Screen",r.hm,"#f59e0b"],["Hired",r.hired,"#22c55e"]].map(([l,v,c])=>(
                    <div key={l} style={{background:"#0d1117",borderRadius:6,padding:"4px 8px",textAlign:"center",minWidth:52}}>
                      <div style={{fontSize:14,fontWeight:700,color:c}}>{v}</div>
                      <div style={{fontSize:9,color:"#6b7280"}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* HISTORICAL */}
        <div style={S.card()}>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Historical Outreach Stats (pre-tracker)</div>
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr>{["Role","Reach-Outs","Responses","Resp %","Screens","Screen %"].map(h=><th key={h} style={{textAlign:"left",padding:"5px 8px",color:"#6b7280",borderBottom:"1px solid #1f2937",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
            <tbody>{HIST_STATS.map(r=><tr key={r.role}>
              <td style={{padding:"6px 8px",color:"#d1d5db"}}>{r.role}</td>
              <td style={{padding:"6px 8px"}}>{r.reachOuts}</td>
              <td style={{padding:"6px 8px"}}>{r.responses}</td>
              <td style={{padding:"6px 8px",color:r.responseRate>=30?"#22c55e":r.responseRate>=20?"#f59e0b":"#ef4444",fontWeight:600}}>{r.responseRate}%</td>
              <td style={{padding:"6px 8px"}}>{r.phoneScreens}</td>
              <td style={{padding:"6px 8px",fontWeight:600}}>{r.screenRate}%</td>
            </tr>)}</tbody>
          </table></div>
        </div>
      </div>
    );
  };

  // ─── BULK ADD ──────────────────────────────────────────────────────────────────
  const renderBulk = () => (
    <div style={{display:"flex",flexDirection:"column",gap:14,maxWidth:800}}>
      <h1 style={{margin:0,fontSize:18,fontWeight:700}}>📥 Bulk Add Candidates</h1>
      <div style={{...S.card(),background:"#0d1a2e",border:"1px solid #1e3a5f",fontSize:12,color:"#93c5fd",lineHeight:1.7}}>Paste one or more LinkedIn profiles — copy the full page text, paste back to back or separated by blank lines. AI extracts, scores, and adds them all at once.</div>
      <div style={S.card()}>
        <div style={{marginBottom:10}}><label style={S.lbl}>Score against role</label><select value={bulkRole} onChange={e=>setBulkRole(e.target.value)} style={{...S.inp,width:"auto"}}>{ROLES.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select></div>
        <div style={{marginBottom:10}}><label style={S.lbl}>Paste profiles here</label><textarea value={bulkText} onChange={e=>setBulkText(e.target.value)} rows={10} style={{...S.inp,resize:"vertical",fontSize:12}} placeholder="Paste LinkedIn profile text here — multiple profiles OK."/></div>
        {bulkMsg&&<div style={{fontSize:12,color:bulkMsg.includes("Done")?"#22c55e":"#f59e0b",marginBottom:8}}>{bulkMsg}</div>}
        <button onClick={doBulkAdd} disabled={bulkLoading||!bulkText.trim()} style={{...S.btn("primary"),opacity:bulkLoading||!bulkText.trim()?0.5:1}}>
          {bulkLoading?"⏳ Processing...":"⚡ Process & Add to Pipeline"}
        </button>
      </div>
      {bulkResults.length>0&&(
        <div style={S.card()}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>Results — {bulkResults.filter(x=>x.added).length} added</div>
          {bulkResults.map((r,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #1f2937",flexWrap:"wrap",gap:6}}>
              <div><div style={{fontSize:13,fontWeight:500}}>{r.name}</div><div style={{fontSize:11,color:"#6b7280"}}>{r.title} · {r.company}</div></div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {r.score>0&&<span style={{fontSize:16,fontWeight:700,color:sc(r.score)}}>{r.score}</span>}
                {r.dnh_flag?<span style={S.badge("#ef4444")}>⛔ DNH</span>:r.added?<span style={S.badge("#22c55e")}>✓ Added</span>:<span style={S.badge("#6b7280")}>Skipped</span>}
              </div>
            </div>
          ))}
          <button onClick={()=>{setBulkText("");setBulkResults([]);setBulkMsg("");}} style={{...S.btn(),marginTop:8,fontSize:11}}>Clear & Add More</button>
        </div>
      )}
    </div>
  );

  // ─── PARK FOR LATER ───────────────────────────────────────────────────────────
  const renderParkView = () => {
    const dueToday=parked.filter(c=>c.parkDate&&new Date(c.parkDate)<=TODAY);
    return(
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <h1 style={{margin:0,fontSize:18,fontWeight:700}}>🅿 Parked — Talent Bank</h1>
        {dueToday.length>0&&<div style={{background:"#22c55e11",border:"1px solid #22c55e33",borderRadius:8,padding:"8px 14px",fontSize:13,color:"#22c55e"}}>🔔 {dueToday.length} candidate{dueToday.length>1?"s":""} ready to re-engage: {dueToday.map(c=>c.name).join(", ")}</div>}
        {parked.length===0?<div style={{textAlign:"center",padding:36,color:"#4b5563"}}>No parked candidates.</div>:
          parked.map(c=>{
            const role=getRoleById(c.role);
            const ready=c.parkDate&&new Date(c.parkDate)<=TODAY;
            return(<div key={c.id} style={{...S.card(),border:ready?"1px solid #22c55e44":"1px solid #f59e0b33"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                <div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:14,fontWeight:600}}>{c.name}</span>{ready&&<span style={S.badge("#22c55e")}>🔔 Ready</span>}</div>
                  <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{c.title}{c.company?` · ${c.company}`:""}</div>
                  <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>Role: {role?.title||c.role} · Re-engage: {fmt(c.parkDate)}</div>
                  <div style={{fontSize:11,color:"#f59e0b",marginTop:2}}>{c.parkReason}</div>
                  {c.parkNote&&<div style={{fontSize:11,color:"#6b7280",marginTop:2,fontStyle:"italic"}}>{c.parkNote}</div>}
                  {c.linkedin&&<a href={c.linkedin} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#60a5fa",textDecoration:"none",display:"block",marginTop:3}}>🔗 LinkedIn ↗</a>}
                </div>
                <button onClick={()=>unpark(c.id)} style={S.btn("primary")}>↩ Unpark</button>
              </div>
            </div>);
          })}
      </div>
    );
  };

  // ─── ROLES & INTEL ────────────────────────────────────────────────────────────
  const renderRoles = () => selRole?(()=>{const r=getRoleById(selRole);return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <button onClick={()=>setSelRole(null)} style={{...S.btn(),alignSelf:"flex-start"}}>← All Roles</button>
      <div style={S.card()}>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:10}}>
          <div><h2 style={{margin:0,fontSize:16}}>{r.title}</h2><div style={{color:"#6b7280",fontSize:12,marginTop:3}}>HM: {r.hm} · {r.sourcer} · {r.recruiters.join(", ")} · {r.comp}</div></div>
          <a href={r.link} target="_blank" rel="noreferrer" style={{...S.btn(),fontSize:12,textDecoration:"none",display:"inline-block"}}>Ashby ↗</a>
        </div>
        <div style={{marginBottom:12}}><div style={{fontSize:10,color:"#6b7280",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Job Description</div><div style={{fontSize:12,color:"#d1d5db",lineHeight:1.7,background:"#0d1117",border:"1px solid #1f2937",borderRadius:7,padding:10}}>{r.jd}</div></div>
        <div style={S.g2}>
          <div>
            <div style={{fontSize:10,color:"#6b7280",marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>Key Signals</div>
            {r.signals.map(s=><div key={s} style={{fontSize:12,color:"#22c55e",marginBottom:3}}>✓ {s}</div>)}
            {r.benchmarks.length>0&&<><div style={{fontSize:10,color:"#6b7280",marginTop:10,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>Benchmarks</div>{r.benchmarks.map(b=><div key={b} style={{fontSize:12,color:"#fbbf24"}}>⭐ {b}</div>)}</>}
          </div>
          <div>
            <div style={{fontSize:10,color:"#6b7280",marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>Scoring Rubric</div>
            {r.rubric.map(rb=>(<div key={rb.l} style={{marginBottom:7}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}><span>{rb.l}</span><span style={{color:"#60a5fa"}}>{rb.w}pts</span></div>
              <div style={{background:"#1f2937",borderRadius:3,height:4}}><div style={{background:"#60a5fa",borderRadius:3,height:4,width:`${rb.w}%`}}/></div>
            </div>))}
          </div>
        </div>
        <div style={{marginTop:10}}><div style={{fontSize:10,color:"#6b7280",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Target Companies</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{r.targetCos.map(co=><span key={co} style={{background:"#1f2937",border:"1px solid #374151",borderRadius:20,padding:"2px 8px",fontSize:11,color:"#d1d5db"}}>{co}</span>)}</div></div>
        <div style={{marginTop:10}}><div style={{fontSize:10,color:"#6b7280",marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>Boolean String</div>
          <pre style={{background:"#0d1117",border:"1px solid #1f2937",borderRadius:7,padding:9,fontSize:11,color:"#86efac",overflowX:"auto",whiteSpace:"pre-wrap",margin:0}}>{r.boolean}</pre>
          <button onClick={()=>navigator.clipboard?.writeText(r.boolean)} style={{...S.btn(),fontSize:11,marginTop:4}}>Copy</button>
        </div>
        {r.notes&&<div style={{marginTop:10,background:"#0d1117",border:"1px solid #1f2937",borderRadius:7,padding:10}}><div style={{fontSize:10,color:"#6b7280",marginBottom:3}}>SOURCING NOTES</div><div style={{fontSize:12,color:"#d1d5db",lineHeight:1.6}}>{r.notes}</div></div>}
      </div>
    </div>
  );})():(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Roles & Sourcing Intel</h1>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
        {ROLES.map(r=>{const rc=active.filter(c=>c.role===r.id);return(
          <div key={r.id} style={{...S.card(),cursor:"pointer"}} onClick={()=>setSelRole(r.id)}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:13,fontWeight:600}}>{r.title}</span><span style={S.badge("#22c55e")}>{r.status}</span></div>
            <div style={{fontSize:11,color:"#6b7280",marginBottom:6}}>HM: {r.hm} · {r.comp}</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>{r.signals.slice(0,3).map(s=><span key={s} style={{background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e44",borderRadius:20,padding:"1px 6px",fontSize:10}}>✓ {s}</span>)}{r.signals.length>3&&<span style={{fontSize:10,color:"#6b7280"}}>+{r.signals.length-3}</span>}</div>
            <div style={{fontSize:11,color:"#9ca3af"}}>{rc.length} candidates</div>
          </div>
        );})}
      </div>
    </div>
  );

  // ─── COMP INTEL ───────────────────────────────────────────────────────────────
  const renderCompIntel = () => (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Competitive Intelligence</h1>
      <div style={{...S.card(),background:"#1a0505",border:"1px solid #ef444433"}}>
        <div style={{fontSize:12,fontWeight:600,color:"#ef4444",marginBottom:8}}>⛔ DO NOT HIRE</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{DNH.map(co=>(
          <div key={co} style={{background:"#ef444415",border:"1px solid #ef444430",borderRadius:8,padding:"8px 12px"}}>
            <div style={{fontSize:12,fontWeight:600,color:"#ef4444"}}>{co}</div>
            <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{DNH_NOTES[co]}</div>
          </div>
        ))}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
        {Object.entries(COMP_INTEL).filter(([,v])=>v.hire).map(([co,v])=>(
          <div key={co} style={S.card()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
              <span style={{fontSize:13,fontWeight:600}}>{co}</span>
              <span style={S.badge(v.tier.includes("Tier 1")?"#22c55e":"#60a5fa")}>{v.tier.split("—")[0].trim()}</span>
            </div>
            <div style={{fontSize:12,color:"#9ca3af",lineHeight:1.6,marginBottom:5}}>{v.notes}</div>
            {v.roles.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{v.roles.map(r=><span key={r} style={{background:"#1f2937",border:"1px solid #374151",borderRadius:20,padding:"1px 7px",fontSize:10,color:"#9ca3af"}}>{r}</span>)}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  // ─── OUTREACH PERFORMANCE ─────────────────────────────────────────────────────
  const renderOutreach = () => {
    const live=ROLES.map(r=>{
      const rc=active.filter(c=>c.role===r.id&&c.outreach);
      const replied=rc.filter(c=>["Replied","Interested"].includes(c.response)).length;
      const screens=rc.filter(c=>["Phone Screen","Submitted","HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
      const sub=rc.filter(c=>["Submitted","HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
      const hm=rc.filter(c=>["HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
      const hired=rc.filter(c=>c.stage==="Hired").length;
      return{role:r.title,reachOuts:rc.length,responses:replied,responseRate:rc.length?Math.round((replied/rc.length)*100):0,phoneScreens:screens,screenRate:rc.length?Math.round((screens/rc.length)*100):0,submitted:sub,hmScreened:hm,hired};
    }).filter(s=>s.reachOuts>0);
    return(
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Outreach Performance</h1>
        {live.length>0&&<div style={S.card()}>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Live Session Stats</div>
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr>{["Role","Outreach","Replied","Resp %","Screen","Sub","HM Screen","Hired"].map(h=><th key={h} style={{textAlign:"left",padding:"5px 8px",color:"#6b7280",borderBottom:"1px solid #1f2937",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
            <tbody>{live.map(r=><tr key={r.role}>
              <td style={{padding:"6px 8px",color:"#d1d5db",fontSize:11}}>{r.role}</td>
              <td style={{padding:"6px 8px"}}>{r.reachOuts}</td>
              <td style={{padding:"6px 8px"}}>{r.responses}</td>
              <td style={{padding:"6px 8px",color:r.responseRate>=30?"#22c55e":r.responseRate>=20?"#f59e0b":"#ef4444",fontWeight:600}}>{r.responseRate}%</td>
              <td style={{padding:"6px 8px"}}>{r.phoneScreens}</td>
              <td style={{padding:"6px 8px",color:"#10b981",fontWeight:600}}>{r.submitted}</td>
              <td style={{padding:"6px 8px",color:"#f59e0b",fontWeight:600}}>{r.hmScreened}</td>
              <td style={{padding:"6px 8px",color:"#22c55e",fontWeight:600}}>{r.hired}</td>
            </tr>)}</tbody>
          </table></div>
        </div>}
        <div style={S.card()}>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Historical Totals (pre-tracker)</div>
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr>{["Role","Reach-Outs","Responses","Resp %","Phone Screens","Screen %"].map(h=><th key={h} style={{textAlign:"left",padding:"5px 8px",color:"#6b7280",borderBottom:"1px solid #1f2937"}}>{h}</th>)}</tr></thead>
            <tbody>{HIST_STATS.map(r=><tr key={r.role}>
              <td style={{padding:"6px 8px",color:"#d1d5db"}}>{r.role}</td>
              <td style={{padding:"6px 8px"}}>{r.reachOuts}</td>
              <td style={{padding:"6px 8px"}}>{r.responses}</td>
              <td style={{padding:"6px 8px",color:r.responseRate>=30?"#22c55e":r.responseRate>=20?"#f59e0b":"#ef4444",fontWeight:600}}>{r.responseRate}%</td>
              <td style={{padding:"6px 8px"}}>{r.phoneScreens}</td>
              <td style={{padding:"6px 8px",fontWeight:600}}>{r.screenRate}%</td>
            </tr>)}</tbody>
          </table></div>
        </div>
      </div>
    );
  };

  // ─── ROLE HISTORY ─────────────────────────────────────────────────────────────
  const renderRoleHistory = () => (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Role Assignment History</h1>
      <div style={S.card()}>
        <div style={{fontSize:11,color:"#6b7280",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Active Roles</div>
        {ROLES.map(r=><div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #1f2937",flexWrap:"wrap",gap:6}}>
          <div><div style={{fontSize:12,fontWeight:500}}>{r.title}</div><div style={{fontSize:11,color:"#6b7280",marginTop:1}}>HM: {r.hm} · Recruiter(s): {r.recruiters.join(", ")} · {r.comp}</div></div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:11,color:"#9ca3af"}}>Assigned: {fmt(r.assigned)}</span><span style={S.badge("#22c55e")}>Active</span></div>
        </div>)}
      </div>
    </div>
  );

  // ─── INTAKE FORM ──────────────────────────────────────────────────────────────
  const renderIntake = () => {
    const saved=intakes[intakeRole];
    return(
      <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:640}}>
        <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Hiring Manager Intake</h1>
        <div style={{marginBottom:4}}><label style={S.lbl}>Role</label><select value={intakeRole} onChange={e=>setIntakeRole(e.target.value)} style={{...S.inp,width:"auto"}}>{ROLES.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select></div>
        <div style={S.card()}>
          {[["Must-Haves *","mustHaves","Non-negotiable requirements"],["Nice-to-Haves","niceToHaves","What makes a candidate stand out"],["Deal-Breakers","dealBreakers","Immediate disqualifiers"],["Comp Range","comp","Salary, bonus, RSUs"],["Relocation Policy","relocation","On-site? Relocation available?"],["Hiring Timeline","timeline","When does this need to be filled?"],["Notes","notes","HM preferences, context..."]].map(([lbl,key,ph])=>(
            <div key={key} style={{marginBottom:10}}>
              <label style={S.lbl}>{lbl}</label>
              {["mustHaves","niceToHaves","dealBreakers","notes"].includes(key)?
                <textarea value={intakeData[key]} onChange={e=>setIntakeData(v=>({...v,[key]:e.target.value}))} placeholder={ph} rows={2} style={{...S.inp,resize:"vertical"}}/>:
                <input value={intakeData[key]} onChange={e=>setIntakeData(v=>({...v,[key]:e.target.value}))} placeholder={ph} style={S.inp}/>}
            </div>
          ))}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setIntakes(v=>({...v,[intakeRole]:{...intakeData,savedAt:new Date().toISOString()}}))} style={S.btn("primary")}>Save Intake</button>
            {saved&&<button onClick={()=>{const t=`INTAKE: ${getRoleById(intakeRole)?.title}\nHM: ${getRoleById(intakeRole)?.hm}\nMust-Haves: ${saved.mustHaves}\nNice-to-Haves: ${saved.niceToHaves}\nDeal-Breakers: ${saved.dealBreakers}\nComp: ${saved.comp}\nRelocation: ${saved.relocation}\nTimeline: ${saved.timeline}\nNotes: ${saved.notes}`;navigator.clipboard?.writeText(t);}} style={S.btn()}>Copy Intake</button>}
          </div>
        </div>
      </div>
    );
  };

  // ─── WEEKLY UPDATE ────────────────────────────────────────────────────────────
  const renderWeekly = () => {
    const deptRoles=ROLES.filter(r=>weeklyDept==="Manufacturing"?r.category==="Manufacturing":r.category!=="Manufacturing");
    const weekAgo=new Date(TODAY);weekAgo.setDate(weekAgo.getDate()-7);
    const thisWeek=candidates.filter(c=>c.outreach&&new Date(c.outreach)>=weekAgo);
    const lines=[
      `${weeklyDept.toUpperCase()} SOURCING UPDATE — Week of ${TODAY.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}`,
      `Sourcer: Shawn Johnsen | Sr. Sourcer, Crusoe Energy\n`,
      `ACTIVE ROLES (${deptRoles.length})`,`${"─".repeat(52)}`,
      ...deptRoles.flatMap(r=>{
        const rc=active.filter(c=>c.role===r.id);
        const out=rc.filter(c=>["Outreach Sent","Follow-Up Sent","Responded","Phone Screen","Submitted","HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
        const sub=rc.filter(c=>["Submitted","HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
        const hm=rc.filter(c=>["HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
        const rep=rc.filter(c=>["Replied","Interested"].includes(c.response)).length;
        return[`${r.title} (HM: ${r.hm} | Recruiter: ${r.recruiters.join(", ")})`,`  Sourced: ${rc.length} | Outreach: ${out} | Replies: ${rep} | Submitted: ${sub} | HM Screen: ${hm}`,``];
      }),
      `PIPELINE SUMMARY`,`${"─".repeat(52)}`,
      ...STAGES.map(s=>{const n=active.filter(c=>c.stage===s).length;return n>0?`${s}: ${n}`:""}).filter(Boolean),
      `Parked for Later: ${parked.length}\n`,
      `THIS WEEK'S ACTIVITY`,`${"─".repeat(52)}`,
      `Outreach sent this week: ${thisWeek.length}`,
      `Total active candidates: ${active.length}\n`,
      `NOTES / BLOCKERS`,`${"─".repeat(52)}`,`[Add notes here]`,
    ].join("\n");
    return(
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Weekly Update — {weeklyDept}</h1>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setWeeklyDept("Manufacturing")} style={S.btn(weeklyDept==="Manufacturing"?"primary":"")}>Manufacturing</button>
            <button onClick={()=>setWeeklyDept("Other")} style={S.btn(weeklyDept!=="Manufacturing"?"primary":"")}>Other</button>
            <button onClick={()=>navigator.clipboard?.writeText(lines)} style={S.btn()}>Copy Report</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:8}}>
          {deptRoles.map(r=>{
            const rc=active.filter(c=>c.role===r.id);
            const out=rc.filter(c=>["Outreach Sent","Follow-Up Sent","Responded","Phone Screen","Submitted","HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
            const sub=rc.filter(c=>["Submitted","HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
            const hm=rc.filter(c=>["HM Screen","Interviewing","Offer","Hired"].includes(c.stage)).length;
            return(<div key={r.id} style={S.card()}>
              <div style={{fontSize:11,fontWeight:600,marginBottom:3}}>{r.title}</div>
              <div style={{fontSize:10,color:"#6b7280",marginBottom:6}}>HM: {r.hm}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:3}}>
                {[["Src",rc.length,"#60a5fa"],["Out",out,"#a78bfa"],["Sub",sub,"#34d399"],["HM",hm,"#f59e0b"]].map(([l,v,c])=>(
                  <div key={l} style={{textAlign:"center",background:"#0d1117",borderRadius:4,padding:"4px 2px"}}>
                    <div style={{fontSize:14,fontWeight:700,color:c}}>{v}</div>
                    <div style={{fontSize:9,color:"#6b7280"}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>);
          })}
        </div>
        <div style={S.card()}><pre style={{background:"#0d1117",border:"1px solid #1f2937",borderRadius:7,padding:12,fontSize:11,color:"#d1d5db",lineHeight:1.7,overflowX:"auto",whiteSpace:"pre-wrap",margin:0}}>{lines}</pre></div>
      </div>
    );
  };

  // ─── SCORE A CANDIDATE ────────────────────────────────────────────────────────
  const renderScore = () => (
    <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:720}}>
      <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Score a Candidate</h1>
      <div style={S.card()}>
        <div style={{marginBottom:10}}><label style={S.lbl}>Score against role</label><select value={scoreRole} onChange={e=>setScoreRole(e.target.value)} style={{...S.inp,width:"auto"}}>{ROLES.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select></div>
        <div style={{marginBottom:10}}><label style={S.lbl}>Paste LinkedIn profile or resume text</label><textarea value={scoreInput} onChange={e=>setScoreInput(e.target.value)} rows={9} style={{...S.inp,resize:"vertical"}}/></div>
        <div style={{fontSize:11,color:"#ef4444",marginBottom:8}}>⛔ Auto-flags DNH companies</div>
        <button onClick={doScore} disabled={scoring||!scoreInput.trim()} style={{...S.btn("primary"),opacity:scoring||!scoreInput.trim()?0.5:1}}>{scoring?"⏳ Scoring...":"⚡ Score Candidate"}</button>
      </div>
      {scoreResult&&<div style={S.card()}>
        {scoreResult.error?<div style={{color:"#ef4444"}}>{scoreResult.error}</div>:(
          <>
            {scoreResult.dnh_flag&&<div style={{background:"#ef444415",border:"1px solid #ef444430",borderRadius:7,padding:"8px 12px",marginBottom:10,fontSize:13,color:"#ef4444",fontWeight:600}}>⛔ DO NOT HIRE — {scoreResult.dnh_reason}</div>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div><div style={{fontSize:17,fontWeight:700}}>{scoreResult.name}</div><div style={{fontSize:12,color:"#9ca3af",marginTop:3}}>{scoreResult.summary}</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:28,fontWeight:700,color:sc(scoreResult.score)}}>{scoreResult.score}</div><div style={{fontSize:10,color:"#6b7280"}}>/100</div><span style={S.badge(scoreResult.outreach_worthy?"#22c55e":"#ef4444")}>{scoreResult.recommendation}</span></div>
            </div>
            <div style={S.g2}>
              <div><div style={{fontSize:10,color:"#6b7280",marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>Rubric</div>
                {(scoreResult.rubric_scores||[]).map(rb=><div key={rb.label} style={{marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:1}}><span>{rb.label}</span><span style={{color:sc((rb.score/rb.max)*100)}}>{rb.score}/{rb.max}</span></div>
                  <div style={{background:"#1f2937",borderRadius:3,height:4}}><div style={{background:"#60a5fa",borderRadius:3,height:4,width:`${(rb.score/rb.max)*100}%`}}/></div>
                </div>)}
              </div>
              <div>
                <div style={{marginBottom:8}}><div style={{fontSize:10,color:"#22c55e",marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>Pros</div>{(scoreResult.pros||[]).map(p=><div key={p} style={{fontSize:12,color:"#d1d5db",marginBottom:2}}>✓ {p}</div>)}</div>
                <div><div style={{fontSize:10,color:"#ef4444",marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>Cons</div>{(scoreResult.cons||[]).map(c=><div key={c} style={{fontSize:12,color:"#d1d5db",marginBottom:2}}>✗ {c}</div>)}</div>
              </div>
            </div>
            {scoreResult.outreach_worthy&&!scoreResult.dnh_flag&&<div style={{marginTop:8,padding:8,background:"#22c55e11",border:"1px solid #22c55e33",borderRadius:7,fontSize:12,color:"#22c55e"}}>✓ Added to Pipeline automatically.</div>}
          </>
        )}
      </div>}
    </div>
  );

  const VIEWS_MAP = {"Dashboard":renderDash,"Pipeline":renderPipeline,"Bulk Add":renderBulk,"Park for Later":renderParkView,"Roles & Intel":renderRoles,"Comp Intel":renderCompIntel,"Outreach Performance":renderOutreach,"Role History":renderRoleHistory,"Intake Form":renderIntake,"Weekly Update":renderWeekly,"Score a Candidate":renderScore,"Metrics":renderMetrics};

  return(
    <div style={S.app}>
      <div style={S.hdr}>
        <div style={{flexShrink:0}}>
          <div style={{fontSize:9,letterSpacing:3,color:"#6b7280",textTransform:"uppercase"}}>Crusoe Energy · Internal</div>
          <div style={{fontSize:13,fontWeight:700}}>Sourcing Command Center</div>
        </div>
        <nav style={{display:"flex",gap:2,flexWrap:"wrap",justifyContent:"center"}}>
          {[...VIEWS,"Metrics"].map(v=><button key={v} onClick={()=>{setView(v);setSelCand(null);setSelRole(null);}} style={S.nav(view===v)}>{v}</button>)}
        </nav>
        <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
          {saveMsg&&<span style={{fontSize:10,color:"#22c55e"}}>{saveMsg}</span>}
          <button onClick={exportCSV} style={{...S.btn(),fontSize:10,padding:"4px 8px"}}>⬇ CSV</button>
          <button onClick={resetToSeed} style={{...S.btn("danger"),fontSize:10,padding:"4px 8px"}}>Reset</button>
        </div>
      </div>
      <div style={S.main}>{(VIEWS_MAP[view]||renderDash)()}</div>
    </div>
  );
}
