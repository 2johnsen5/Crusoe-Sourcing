import { useState, useMemo } from "react";

const STAGES = ["Sourced","Outreach Sent","Responded","Phone Screen","Submitted","Interviewing","Offer","Hired","Not Interested","Pass"];
const PARK_REASONS = ["Just Started New Role","Not Open Yet","Comp Mismatch - Revisit","Strong Profile - Wrong Timing","Passive - Check Back","Other"];
const DNH = ["OpenAI","NVIDIA","AMD","DPR Construction","Oracle (Senior Leadership)","Google (Senior DC Construction Leadership)"];
const DNH_NOTES = {
  "OpenAI":"Do not contact current OpenAI employees.",
  "NVIDIA":"Do not contact current NVIDIA employees.",
  "AMD":"Do not contact current AMD employees.",
  "DPR Construction":"Do not contact current DPR Construction employees.",
  "Oracle (Senior Leadership)":"Do not contact senior-level Oracle executives.",
  "Google (Senior DC Construction Leadership)":"Do not contact senior Data Center Construction leadership at Google."
};

const ROLES = [
  {id:"staff-estimator",title:"Staff Estimator",status:"Active",hm:"Kevin Krauss",sourcer:"Shawn Johnsen",recruiters:["Maddie Meyer"],assigned:"2026-02-15",category:"Manufacturing",comp:"$102K–$124K",
    link:"https://jobs.ashbyhq.com/Crusoe/9b1d8d4c-ea89-416e-ab6c-3b60474496b1",
    jd:"Critical link between customer request and final manufacturing proposal. Estimate project costs, ensure quotation accuracy, manage handoff to engineering and production. Calculate labor hours for fabrication, paint, assembly, and wiring. Generate formal quotations, collaborate with Sales on proposals. Maintain RFQ documentation. Experience in electrical manufacturing required; construction electrical estimating with industrial/power gen exposure strongly valued.",
    signals:["Electrical Manufacturing Estimating","BOM / Takeoff Experience","Labor Hour Calculation","RFQ / Quotation Generation","ERP / Acumatica","Construction Electrical Estimating","Industrial / Power Gen Exposure"],
    rubric:[{l:"Electrical Estimating",w:30},{l:"Industrial/Power Gen Exposure",w:25},{l:"BOM / Labor Calc",w:20},{l:"RFQ / Proposal Mgmt",w:15},{l:"ERP / Acumatica",w:10}],
    targetCos:["Ludvik Electric","Intermountain Electric","Faith Technologies","Rosendin Electric","Encore Electric","Powell Industries","Eaton Mfg","Schneider Electric Mfg","ABB Power Products","Myers Power Products"],
    benchmarks:["Patrick Deidel (internal — Ludvik Electric background)"],
    boolean:`("Estimator" OR "Senior Estimator" OR "Electrical Estimator" OR "Inside Sales Engineer" OR "Applications Engineer" OR "Proposal Engineer") AND ("switchgear" OR "switchboard" OR "panel" OR "power distribution" OR "BOM" OR "RFQ") AND ("electrical manufacturing" OR "panel shop" OR "fabrication")`,
    notes:"Do NOT exclude construction electrical estimators — recalibrated after Patrick Deidel benchmark. Target construction electrical estimators with industrial/power gen exposure. Titles to try: Inside Sales Engineer, Applications Engineer, Proposal Engineer at panel shops/switchgear manufacturers."},
  {id:"ee-manager",title:"Electrical Engineering Manager",status:"Active",hm:"Cory Gautreau / Tyler Mehlman",sourcer:"Shawn Johnsen",recruiters:["Hannah"],assigned:"2026-03-01",category:"Manufacturing",comp:"TBD",
    link:"https://jobs.ashbyhq.com/Crusoe/e5567fef-714b-4d52-9994-05680dda5a6b",
    jd:"Lead and manage Crusoe's electrical engineering team supporting modular data center manufacturing. Player/coach role — hands-on technical leadership combined with people management. Oversee MV switchgear/switchboard design, NEC/NFPA compliance, EPLAN/AutoCAD Electrical documentation. Hire, mentor, and develop electrical engineers. Drive design standards, review processes, and cross-functional collaboration with manufacturing and project teams.",
    signals:["People Management / Team Leadership","MV Switchgear / Switchboard Design","EPLAN / AutoCAD Electrical","NEC / NFPA Compliance","Data Center / Mission-Critical Background","Hiring & Mentorship Experience","Cross-functional Collaboration"],
    rubric:[{l:"People Mgmt / Team Leadership",w:30},{l:"MV Switchgear / Switchboard",w:25},{l:"EPLAN / AutoCAD Electrical",w:15},{l:"NEC / NFPA Compliance",w:15},{l:"Data Center Background",w:15}],
    targetCos:["Equinix","Black & Veatch","Syska Hennessy","Burns & McDonnell","AECOM","Jacobs","Stantec","WSP","Arcadis","HDR"],
    benchmarks:["David Mar (internal Staff EE benchmark)"],
    boolean:`("Electrical Engineering Manager" OR "Manager, Electrical Engineering" OR "Lead Electrical Engineer" OR "Principal Electrical Engineer") AND ("switchgear" OR "switchboard" OR "EPLAN" OR "AutoCAD Electrical") AND ("data center" OR "mission critical" OR "medium voltage" OR "MV") AND ("team" OR "manage" OR "mentor")`,
    notes:"Player/coach role. Must have genuine people management experience — not just technical seniority. Data center or mission-critical infrastructure background strongly preferred."},
  {id:"principal-ee",title:"Principal Electrical Engineer",status:"Active",hm:"Agustin Rayon",sourcer:"Shawn Johnsen",recruiters:["Hannah"],assigned:"2026-03-01",category:"Manufacturing",comp:"TBD",
    link:"https://jobs.ashbyhq.com/Crusoe/d72502c5-20ff-4c6a-bf83-b8a2d694b73f",
    jd:"Senior individual contributor technical role. Lead complex electrical system design for Crusoe's modular data center products. Drive design standards, mentor engineers, and serve as the technical authority on MV/LV power distribution, switchgear, and compliance. EPLAN/AutoCAD Electrical proficiency required. NEC/NFPA 70E expertise essential.",
    signals:["Principal / Staff IC Engineering","MV / LV Power Distribution","EPLAN / AutoCAD Electrical","NEC / NFPA 70E","Design Standards / Technical Authority","Mentorship without Direct Reports","Data Center / Mission-Critical"],
    rubric:[{l:"Senior IC Technical Depth",w:30},{l:"MV/LV Power Distribution",w:25},{l:"EPLAN / AutoCAD Electrical",w:20},{l:"NEC / NFPA 70E",w:15},{l:"Mentorship / Standards Leadership",w:10}],
    targetCos:["Black & Veatch","Syska Hennessy","Burns & McDonnell","AECOM","Jacobs","Stantec","Equinix DCE","Microsoft DCE","AWS DCE","HDR"],
    benchmarks:["David Mar (internal)"],
    boolean:`("Principal Electrical Engineer" OR "Staff Electrical Engineer" OR "Lead Electrical Engineer") AND ("EPLAN" OR "AutoCAD Electrical") AND ("switchgear" OR "switchboard" OR "medium voltage" OR "power distribution") AND ("NEC" OR "NFPA 70" OR "data center" OR "mission critical")`,
    notes:"Similar profile to Staff EE but with greater design authority and seniority. No direct reports required but mentorship expected."},
  {id:"tech-training-mgr",title:"Technical Training Manager",status:"Active",hm:"Annabel Kyler",sourcer:"Shawn Johnsen",recruiters:["David Schnuur"],assigned:"2026-03-10",category:"Manufacturing",comp:"$82K–$95K",
    link:"https://jobs.ashbyhq.com/Crusoe",
    jd:"Lead Crusoe's workforce development initiatives. Develop and deliver technical training programs for manufacturing operations. Curriculum development, hands-on instruction, and continuous improvement of training materials. Experience in electrical assembly, fabrication, or related manufacturing field essential.",
    signals:["Curriculum Development","Technical / Hands-on Training","Manufacturing / Electrical Assembly Background","Instructional Design","LMS / Training Systems","Continuous Improvement"],
    rubric:[{l:"Technical Training / Curriculum Dev",w:35},{l:"Manufacturing / Electrical Background",w:30},{l:"Instructional Design",w:20},{l:"LMS / Systems",w:15}],
    targetCos:["Eaton","Schneider Electric","ABB","Generac","Cummins","GE Power","Vertiv","Siemens","Rockwell Automation","Danaher"],
    benchmarks:[],
    boolean:`("Technical Trainer" OR "Training Manager" OR "Manufacturing Trainer" OR "Workforce Development Manager") AND ("electrical" OR "manufacturing" OR "fabrication" OR "assembly") AND ("curriculum" OR "instructional design" OR "training program")`,
    notes:"JD pending from Annabel Kyler. Located in Tulsa. Role likely Arvada/Denver area — confirm on-site vs. remote."},
  {id:"sr-prod-mgr",title:"Sr. Production Manager",status:"Active",hm:"David Travis",sourcer:"Shawn Johnsen",recruiters:["David Schnuur"],assigned:"2026-01-20",category:"Manufacturing",comp:"TBD",
    link:"https://jobs.ashbyhq.com/Crusoe/b341c596-706f-45a8-a42e-ecfc31e58850",
    jd:"Lead manufacturing production operations for Crusoe's modular data center assembly in Arvada. Oversee production scheduling, team management, QC, and continuous improvement. HMLV industrial manufacturing, ERP systems, and lean methodologies required. ISO 9001:2015 compliance.",
    signals:["Manufacturing Production Leadership","Lean / Six Sigma","ERP (Acumatica preferred)","HMLV Manufacturing","Quality Management / ISO 9001","Workforce Management","P&L / Budget Ownership"],
    rubric:[{l:"Production Leadership",w:30},{l:"Lean / CI",w:20},{l:"HMLV Manufacturing",w:20},{l:"ERP Proficiency",w:15},{l:"Team / Workforce Mgmt",w:15}],
    targetCos:["Generac","Caterpillar Power","Cummins","ASCO Power","Schneider Electric Mfg","Eaton Mfg","ABB Mfg","GE Power","Vertiv","nVent"],
    benchmarks:[],
    boolean:`("Production Manager" OR "Sr Production Manager" OR "Manufacturing Manager" OR "Plant Manager") AND ("lean" OR "Six Sigma" OR "continuous improvement") AND ("ERP" OR "Acumatica" OR "SAP") AND ("electrical" OR "manufacturing" OR "modular" OR "assembly")`,
    notes:"Focus on HMLV industrial/power manufacturing backgrounds."},
  {id:"sr-pm",title:"Sr. Project Manager",status:"Active",hm:"Kevin Krauss",sourcer:"Shawn Johnsen",recruiters:["Maddie Meyer"],assigned:"2026-03-05",category:"Manufacturing",comp:"$141,750–$162,000",
    link:"https://jobs.ashbyhq.com/Crusoe/483389b9-2012-4d69-818f-52ef8cd5bf22",
    jd:"Own planning, organizing, and executing Modular Data Center Building projects (Crusoe Spark). Convert complex customer requirements to actionable scope collaborating with engineering and manufacturing. Manage customer expectations. 7+ years PM experience in electrical equipment, construction, engineering, or manufacturing. PMP preferred. MS Project/Monday.com/P6. $141,750–$162,000.",
    signals:["Modular Building / Data Center Construction PM","Electrical / Construction PM Background","Schedule Mgmt (P6/MS Project/Monday.com)","Budget Forecasting & Cost Mgmt","Change Management / Scope Control","Cross-functional Team Leadership","ISO 9001 / Safety Compliance","ERP (Acumatica preferred)"],
    rubric:[{l:"Construction / Mfg PM Experience",w:30},{l:"Modular / Data Center Background",w:25},{l:"Schedule & Budget Mgmt",w:20},{l:"Change / Scope Control",w:15},{l:"ERP / Tools Proficiency",w:10}],
    targetCos:["Modular building manufacturers","Data center construction firms","EPC contractors","Turner Construction","Hensel Phelps","Mortenson","Kiewit","Fluor","JE Dunn"],
    benchmarks:[],
    boolean:`("Senior Project Manager" OR "Sr Project Manager") AND ("modular" OR "data center" OR "electrical" OR "construction" OR "manufacturing") AND ("MS Project" OR "Primavera" OR "P6" OR "Monday.com") AND ("budget" OR "schedule" OR "scope")`,
    notes:"Strong preference for modular building manufacturing or data center construction PM background. Note: DPR Construction is on do-not-hire list."},
  {id:"pm3",title:"Project Manager III",status:"Active",hm:"Kevin Krauss",sourcer:"Shawn Johnsen",recruiters:["Maddie Meyer"],assigned:"2026-03-05",category:"Manufacturing",comp:"TBD",
    link:"https://jobs.ashbyhq.com/Crusoe/c0f4e502-acb0-4c50-af97-711b9861d5ba",
    jd:"Mid-senior project management role supporting modular data center manufacturing and deployment. Manage project lifecycle from engineering through delivery. Collaborate with estimating, engineering, procurement, and production.",
    signals:["Project Management 5-10 yrs","Manufacturing or Construction Background","Schedule & Budget Mgmt","Electrical / Modular Building Exposure","ERP Systems","Cross-functional Coordination"],
    rubric:[{l:"PM Experience (5-10 yrs)",w:30},{l:"Mfg / Construction Background",w:25},{l:"Schedule & Budget",w:25},{l:"ERP / Tools",w:20}],
    targetCos:["Modular building firms","Mid-tier EPC contractors","Electrical contractors","Data center construction firms"],
    benchmarks:[],
    boolean:`("Project Manager" OR "Project Manager III" OR "Senior Project Manager") AND ("manufacturing" OR "construction" OR "electrical" OR "modular" OR "data center") AND ("schedule" OR "budget" OR "scope")`,
    notes:"Step below Sr PM in seniority. Look for candidates who may not yet have 7+ years for Sr PM but have right industry exposure."},
  {id:"master-scheduler",title:"Master Scheduler",status:"Active",hm:"Kevin Krauss",sourcer:"Shawn Johnsen",recruiters:["Maddie Meyer"],assigned:"2026-02-01",category:"Manufacturing",comp:"$110K–$130K",
    link:"https://jobs.ashbyhq.com/Crusoe/f7955ba8-7484-46e1-9826-f2d760a2c101",
    jd:"Establish and manage master production schedule across multiple manufacturing locations. Analyze resources, production rates, and data for accurate scheduling. 7+ years production planning/scheduling. BS engineering/manufacturing/business. MS Project/P6/Monday.com. MRP/ERP required. Metal or electrical manufacturing experience preferred. $110K–$130K.",
    signals:["Master Production Scheduling","MRP / ERP Systems","MS Project / P6 / Monday.com","Manufacturing Scheduling 7+ yrs","3-week / 12-week Schedule Cadence","Resource & Capacity Planning","Cross-dept Coordination"],
    rubric:[{l:"Production Scheduling Depth",w:30},{l:"MRP / ERP Proficiency",w:25},{l:"Scheduling Tools (P6/MSP)",w:20},{l:"Manufacturing Context",w:15},{l:"Reporting / Analytics",w:10}],
    targetCos:["Lockheed","Raytheon","Boeing","Generac","Cummins","Eaton","GE Power","Vertiv","Caterpillar","Honeywell Mfg"],
    benchmarks:[],
    boolean:`("Master Scheduler" OR "Production Scheduler" OR "Manufacturing Scheduler" OR "Master Production Scheduler") AND ("MRP" OR "ERP" OR "SAP" OR "Oracle" OR "Acumatica") AND ("MS Project" OR "Primavera" OR "P6" OR "Monday.com") AND ("manufacturing" OR "production planning")`,
    notes:"Defense/aerospace IMS backgrounds translate well. Stella Mathenge advanced to HM interview. Martin DeYoung local — excellent option."},
];

const COMP_INTEL = {
  "Equinix":{tier:"Tier 1 Target",notes:"Strongest source for Staff EE and Principal EE. MV/LV power distribution background, hyperscale data center ops. 2+ confirmed Crusoe hires.",roles:["ee-manager","principal-ee"],hire:true},
  "Black & Veatch":{tier:"Tier 1 Target",notes:"EPC firm producing excellent power distribution engineers. Strong NEC/NFPA compliance background. Thierry L. (rated 9/10) came from here.",roles:["ee-manager","principal-ee","sr-pm"],hire:true},
  "Syska Hennessy":{tier:"Tier 1 Target",notes:"MEP consulting firm with deep hyperscale/AI data center focus. Manjur Ahmed Shuvha (rated 9/10) came from here.",roles:["ee-manager","principal-ee"],hire:true},
  "Microsoft DCE":{tier:"Tier 1 Target",notes:"Data Center Engineering org. Aarti Gurav (rated 9/10) came from here. Strong AI/hyperscale infrastructure experience.",roles:["ee-manager","principal-ee"],hire:true},
  "AWS DCE":{tier:"Tier 1 Target",notes:"Similar profile to Microsoft DCE. Hyperscale power infrastructure.",roles:["ee-manager","principal-ee"],hire:true},
  "Burns & McDonnell":{tier:"Tier 1 Target",notes:"Major EPC firm. Strong mission-critical electrical background. Good source for Sr PM and EE roles.",roles:["ee-manager","principal-ee","sr-pm"],hire:true},
  "Ludvik Electric":{tier:"Tier 1 Target — Estimator",notes:"Patrick Deidel (internal benchmark for Staff Estimator) came from here. Direct benchmark company.",roles:["staff-estimator"],hire:true},
  "Generac":{tier:"Tier 1 Target — Mfg",notes:"Power generation manufacturing. Strong HMLV production management and scheduling background.",roles:["sr-prod-mgr","master-scheduler"],hire:true},
  "Cummins":{tier:"Tier 1 Target — Mfg",notes:"Power generation / industrial manufacturing. Strong lean/CI and ERP backgrounds.",roles:["sr-prod-mgr","master-scheduler"],hire:true},
  "ABB":{tier:"Tier 2 Target",notes:"Ria Narayan (rated 9/10) came from ABB. Strong EPLAN switchgear background. Distinguish manufacturing vs. corporate IT roles.",roles:["ee-manager","principal-ee","staff-estimator"],hire:true},
  "Eaton":{tier:"Tier 2 Target",notes:"Power distribution manufacturing. Good for EE, Estimator, Production Manager, and Scheduler roles.",roles:["ee-manager","principal-ee","staff-estimator","sr-prod-mgr"],hire:true},
  "Schneider Electric":{tier:"Tier 2 Target",notes:"Similar to Eaton. Electrical manufacturing and power distribution. Validate manufacturing vs. sales/software roles.",roles:["ee-manager","principal-ee","staff-estimator"],hire:true},
  "AECOM":{tier:"Tier 2 Target",notes:"Large EPC/consulting firm. Good for PM and EE roles.",roles:["ee-manager","principal-ee","sr-pm","pm3"],hire:true},
  "Jacobs":{tier:"Tier 2 Target",notes:"Engineering and construction management. Good for PM and senior EE roles.",roles:["sr-pm","pm3","ee-manager"],hire:true},
  "Faith Technologies":{tier:"Tier 2 Target — Estimator",notes:"Major electrical contractor. Good source for construction electrical estimators.",roles:["staff-estimator"],hire:true},
  "Encore Electric":{tier:"Tier 2 Target — Estimator",notes:"Colorado-based electrical contractor. Good local source for estimating talent.",roles:["staff-estimator"],hire:true},
  "OpenAI":{tier:"⛔ DO NOT HIRE",notes:"Do not contact current OpenAI employees under any circumstances.",roles:[],hire:false},
  "NVIDIA":{tier:"⛔ DO NOT HIRE",notes:"Do not contact current NVIDIA employees under any circumstances.",roles:[],hire:false},
  "AMD":{tier:"⛔ DO NOT HIRE",notes:"Do not contact current AMD employees under any circumstances.",roles:[],hire:false},
  "DPR Construction":{tier:"⛔ DO NOT HIRE",notes:"Do not contact current DPR Construction employees.",roles:[],hire:false},
  "Oracle":{tier:"⛔ DO NOT HIRE (Senior Leadership Only)",notes:"Do not contact senior-level Oracle executives. Mid-level/IC roles may be acceptable.",roles:[],hire:false},
  "Google":{tier:"⛔ DO NOT HIRE (Senior DC Construction Leadership)",notes:"Do not contact senior Data Center Construction leadership at Google.",roles:[],hire:false},
};

const SEED = [
  {id:1,name:"Aarti Gurav",role:"ee-manager",company:"Microsoft / AWS",title:"Data Center Electrical Engineer",score:90,stage:"Outreach Sent",outreach:"2026-02-10",followUp:"2026-02-17",response:"No Response",signals:["EPLAN / AutoCAD Electrical","Data Center / Mission-Critical","Hyperscale Background"],notes:"Rated 9/10. MSFT/AWS data center EE.",location:"Seattle, WA",relocation:true,source:"LinkedIn",linkedin:"",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:2,name:"Ria Narayan",role:"principal-ee",company:"ABB / Bloom Energy",title:"Electrical Engineer",score:90,stage:"Outreach Sent",outreach:"2026-02-10",followUp:"2026-02-17",response:"No Response",signals:["EPLAN / AutoCAD Electrical","MV Switchgear / Switchboard"],notes:"Rated 9/10. ABB EPLAN switchgear + Bloom Energy.",location:"San Jose, CA",relocation:true,source:"LinkedIn",linkedin:"",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:3,name:"Ramon Luquin",role:"principal-ee",company:"Baltimore Aircoil",title:"Electrical Engineer",score:88,stage:"Outreach Sent",outreach:"2026-02-11",followUp:"2026-02-18",response:"No Response",signals:["EPLAN / AutoCAD Electrical","NEC / NFPA Compliance"],notes:"Rated 9/10. UL508A/AutoCAD Electrical panel design.",location:"Baltimore, MD",relocation:true,source:"LinkedIn",linkedin:"",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:4,name:"Thierry L.",role:"ee-manager",company:"Black & Veatch",title:"Data Center Solution Electrical Lead",score:92,stage:"Outreach Sent",outreach:"2026-02-11",followUp:"2026-02-18",response:"No Response",signals:["MV Switchgear / Switchboard","Data Center / Mission-Critical","Leadership / Mentorship"],notes:"Rated 9/10. B&V Data Center Electrical Lead.",location:"Kansas City, MO",relocation:true,source:"LinkedIn",linkedin:"",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:5,name:"Manjur Ahmed Shuvha",role:"ee-manager",company:"Syska Hennessy",title:"Electrical Engineer",score:91,stage:"Outreach Sent",outreach:"2026-02-12",followUp:"2026-02-19",response:"No Response",signals:["Hyperscale Background","Data Center / Mission-Critical","NEC / NFPA Compliance"],notes:"Rated 9/10. Syska Hennessy hyperscale AI data center EE.",location:"New York, NY",relocation:true,source:"LinkedIn",linkedin:"",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:6,name:"Salam Mustafa",role:"principal-ee",company:"",title:"Electrical Engineer",score:0,stage:"Outreach Sent",outreach:"2026-03-02",followUp:"2026-03-09",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/salam-mustafa-18b63310",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:7,name:"Eric Harden",role:"principal-ee",company:"",title:"Electrical Engineer",score:0,stage:"Outreach Sent",outreach:"2026-03-02",followUp:"2026-03-09",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/eric-harden-504a9524",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:8,name:"Jon Anderson",role:"principal-ee",company:"",title:"Electrical Engineer",score:0,stage:"Outreach Sent",outreach:"2026-03-02",followUp:"2026-03-09",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/jon-anderson-8707ab",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:9,name:"Joseph Stephenson III",role:"staff-estimator",company:"",title:"Estimator",score:0,stage:"Pass",outreach:"2026-02-19",followUp:"",response:"Not Interested",signals:[],notes:"Starting new role next week.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/joseph-stephenson-iii-0231985a",park:true,parkReason:"Just Started New Role",parkDate:"2026-08-01",parkNote:"Starting new role Feb 2026. Revisit Aug 2026."},
  {id:10,name:"Scott Ludvik",role:"staff-estimator",company:"",title:"Estimator",score:0,stage:"Pass",outreach:"2026-02-19",followUp:"",response:"Not Interested",signals:[],notes:"Comp is an issue.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/scott-ludvik-29ba5412",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:11,name:"Tara Easter",role:"staff-estimator",company:"",title:"Electrical Estimator",score:0,stage:"Sourced",outreach:"",followUp:"",response:"",signals:["Construction Electrical Estimating"],notes:"Flagged from Patrick Deidel's network.",location:"Denver, CO",relocation:false,source:"LinkedIn",linkedin:"",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:12,name:"Carly Georgen",role:"staff-estimator",company:"",title:"Estimator",score:0,stage:"Sourced",outreach:"",followUp:"",response:"",signals:["Construction Electrical Estimating"],notes:"Flagged from Patrick Deidel's network.",location:"Denver, CO",relocation:false,source:"LinkedIn",linkedin:"",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:13,name:"Scott Schaus",role:"staff-estimator",company:"",title:"Electrical Estimator",score:0,stage:"Sourced",outreach:"",followUp:"",response:"",signals:["Construction Electrical Estimating"],notes:"Flagged from Patrick Deidel's network.",location:"Denver, CO",relocation:false,source:"LinkedIn",linkedin:"",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:14,name:"Richard Gaylen",role:"sr-prod-mgr",company:"",title:"Production Manager",score:0,stage:"Responded",outreach:"2026-02-19",followUp:"2026-02-26",response:"Replied",signals:[],notes:"Said was interested, has not responded since.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/richard-galyen-bba136194",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:15,name:"Obed Awaitey",role:"master-scheduler",company:"",title:"Project Cost Analyst",score:0,stage:"Submitted",outreach:"2026-02-20",followUp:"",response:"Replied",signals:["PMP","MSIS"],notes:"Waiting for HM feedback. In Ashby.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/obed-awaitey-msis-pmp-b0a68976",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:16,name:"Lucas Molina",role:"master-scheduler",company:"",title:"Project Cost Analyst",score:0,stage:"Submitted",outreach:"2026-02-20",followUp:"",response:"Replied",signals:[],notes:"Phone screened with Maddie. In Ashby.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/lucas-f-molina",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:17,name:"Stella Mathenge",role:"master-scheduler",company:"",title:"Scheduler",score:0,stage:"Interviewing",outreach:"2026-02-23",followUp:"",response:"Replied",signals:[],notes:"Submitted and HM reviewed. Waiting on HM interview.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/stella-m-419b06333",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:18,name:"Martin DeYoung",role:"master-scheduler",company:"",title:"Scheduler",score:0,stage:"Sourced",outreach:"2026-03-04",followUp:"",response:"",signals:[],notes:"LOCAL — excellent option per notes.",location:"Denver, CO",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/martin-deyoung-65457a25",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:19,name:"Deven Mathews",role:"master-scheduler",company:"",title:"Scheduler",score:0,stage:"Not Interested",outreach:"2026-03-04",followUp:"",response:"Not Interested",signals:[],notes:"Not interested, no reason given.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/deven-mathews-94247912",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:20,name:"Cody Crabtree",role:"master-scheduler",company:"",title:"Scheduler",score:0,stage:"Outreach Sent",outreach:"2026-03-04",followUp:"2026-03-11",response:"",signals:["PSP","CCMP"],notes:"PSP/CCMP certified.",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/cody-crabtree-psp-ccmp-430539102",park:false,parkReason:"",parkDate:"",parkNote:""},
  {id:21,name:"Eduardo Cantu",role:"master-scheduler",company:"",title:"Scheduler",score:0,stage:"Outreach Sent",outreach:"2026-02-23",followUp:"2026-03-02",response:"",signals:[],notes:"",location:"",relocation:false,source:"LinkedIn",linkedin:"https://www.linkedin.com/in/eduardo-cantu-809b4a121",park:false,parkReason:"",parkDate:"",parkNote:""},
];

const HIST_STATS = [
  {role:"Staff Estimator",reachOuts:17,responses:7,responseRate:41.2,phoneScreens:1,screenRate:5.9},
  {role:"Sr Production Manager",reachOuts:38,responses:9,responseRate:23.7,phoneScreens:5,screenRate:13.2},
  {role:"Project Cost Analyst",reachOuts:13,responses:3,responseRate:23.1,phoneScreens:3,screenRate:23.1},
];

const ROLE_HISTORY = [
  {role:"Staff Electrical Engineer (historical)",assigned:"2026-02-01",status:"Closed",hm:"Kevin Krauss",recruiter:"Hannah",notes:"Recalibrated from panel shop to hyperscale/data center backgrounds. Benchmark: David Mar."},
  {role:"Project Cost Analyst (historical)",assigned:"2026-01-25",status:"Closed",hm:"Alex Alkatab",recruiter:"Maddie Meyer",notes:"Obed Awaitey and Lucas Molina both submitted."},
  {role:"Sr. Integrated Master Scheduler (historical)",assigned:"2026-01-20",status:"Closed",hm:"Alex Alkatab",recruiter:"Maddie",notes:"Stella Mathenge advanced to HM interview stage."},
  {role:"Sr. Project Engineer (historical)",assigned:"2026-01-20",status:"Closed",hm:"Agustin Rayon",recruiter:"Maddie",notes:"Tim Mohre and Albert Cabatic sourced."},
  {role:"Manufacturing Engineer (historical)",assigned:"2026-02-10",status:"Closed",hm:"David Travis",recruiter:"Maddie Meyer",notes:""},
  {role:"Executive Assistant (historical)",assigned:"2026-02-20",status:"Closed",hm:"Alex Alkatab",recruiter:"Hannah",notes:""},
];

const CRUSOE_BIO = "Crusoe Energy is a fast-growing technology company building AI cloud infrastructure powered by stranded and renewable energy. Our modular data centers are deployed at the edge — at wellsites, power plants, and remote locations — turning wasted energy into computing power that serves the world's most demanding AI workloads. We're backed by top-tier investors, growing rapidly, and building a team that wants to do genuinely important work at the intersection of energy and AI.";

const TODAY = new Date("2026-03-20");
const VIEWS = ["Dashboard","Pipeline","Bulk Add","Park for Later","Roles & Intel","Comp Intel","Outreach Performance","Role History","Intake Form","Weekly Update","Score a Candidate"];

// ─── STYLE HELPERS ───────────────────────────────────────────────────────────
const sc = s => s>=85?"#22c55e":s>=70?"#f59e0b":"#ef4444";
const fmt = d => d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"2-digit"}) : "—";

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

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("Dashboard");
  const [candidates, setCandidates] = useState(SEED);
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
    const c = co.toLowerCase();
    if(c.includes("openai")) return "OpenAI";
    if(c.includes("nvidia")) return "NVIDIA";
    if(c.includes("amd")&&!c.includes("command")) return "AMD";
    if(c.includes("dpr")) return "DPR Construction";
    if(c.includes("oracle")) return "Oracle";
    if(c.includes("google")) return "Google";
    return null;
  };

  function setStageF(id,s){setCandidates(cs=>cs.map(c=>c.id===id?{...c,stage:s}:c));}
  function setResponse(id,r){setCandidates(cs=>cs.map(c=>c.id===id?{...c,response:r}:c));}
  function delCand(id){setCandidates(cs=>cs.filter(c=>c.id!==id));setSelCand(null);}
  function unpark(id){setCandidates(cs=>cs.map(c=>c.id===id?{...c,park:false,parkReason:"",parkDate:"",parkNote:""}:c));}

  function addManual(){
    if(!newC.name.trim()) return;
    setCandidates(cs=>[...cs,{...newC,id:Date.now(),score:0,stage:"Sourced",outreach:"",followUp:"",response:"",signals:[],park:false,parkReason:"",parkDate:"",parkNote:""}]);
    setNewC({name:"",role:"staff-estimator",company:"",title:"",location:"",notes:"",relocation:false,source:"LinkedIn",linkedin:""});
    setShowAddC(false);
  }

  function doPark(){
    if(!parkTarget) return;
    setCandidates(cs=>cs.map(c=>c.id===parkTarget?{...c,park:true,stage:"Pass",parkReason:parkForm.reason,parkDate:parkForm.date,parkNote:parkForm.note}:c));
    setShowPark(false); setParkTarget(null); setParkForm({reason:"Just Started New Role",date:"",note:""});
    setSelCand(null);
  }

  function exportCSV(){
    const rows=[["Name","Role","Company","Title","Score","Stage","Response","Outreach","Follow-up","Location","Signals","Notes","LinkedIn"].join(","),...candidates.map(c=>[c.name,getRoleById(c.role)?.title||c.role,c.company,c.title,c.score,c.stage,c.response,c.outreach,c.followUp,c.location,(c.signals||[]).join(";"),c.notes,c.linkedin].map(x=>`"${(x||"").toString().replace(/"/g,'""')}"`).join(","))].join("\n");
    const b=new Blob([rows],{type:"text/csv"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="crusoe_pipeline.csv";a.click();
  }

  // ─── BULK ADD ───────────────────────────────────────────────────────────────
  async function doBulkAdd(){
    if(!bulkText.trim()){setBulkMsg("Paste some profiles first.");return;}
    setBulkLoading(true);setBulkResults([]);setBulkMsg("");
    const role = getRoleById(bulkRole)||ROLES[0];
    const prompt = `You are an expert technical recruiter at Crusoe Energy. The user has pasted one or more LinkedIn profiles below. For EACH distinct candidate, extract their info and score them against the job description.

JD for ${role.title}:
${role.jd}

KEY SIGNALS: ${role.signals.join(", ")}

SCORING RUBRIC:
${role.rubric.map(r=>`- ${r.l}: ${r.w} pts`).join("\n")}

PROFILES PASTED:
${bulkText}

Return ONLY a JSON array (no markdown). Each item:
{"name":"","title":"","company":"","location":"","score":0,"scoreReason":"","summary":"","signals":[],"outreach_worthy":true,"park":false,"park_reason":"","dnh_flag":false}

Score 0-100. outreach_worthy = score >= 75. park = true if strong profile but wrong timing/just started new role.`;
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const txt=data.content?.find(b=>b.type==="text")?.text||"[]";
      const arr=JSON.parse(txt.replace(/```json|```/g,"").trim());
      const added=[];
      arr.forEach(p=>{
        if(p.name&&!p.dnh_flag){
          const nc={id:Date.now()+Math.random(),name:p.name,role:bulkRole,company:p.company||"",title:p.title||"",score:p.score||0,stage:"Sourced",outreach:"",followUp:"",response:"",signals:p.signals||[],notes:p.summary||"",location:p.location||"",relocation:false,source:"LinkedIn",linkedin:"",park:p.park||false,parkReason:p.park_reason||"",parkDate:"",parkNote:p.park_reason||""};
          setCandidates(cs=>[...cs,nc]);
          added.push({...p,added:true});
        } else if(p.dnh_flag){
          added.push({...p,added:false});
        }
      });
      setBulkResults(added);
      setBulkMsg(`Done — ${added.filter(x=>x.added).length} candidate(s) added to pipeline.`);
    }catch(e){setBulkMsg("Parsing failed. Try again or add candidates one at a time.");}
    setBulkLoading(false);
  }

  // ─── SCORE ──────────────────────────────────────────────────────────────────
  async function doScore(){
    if(!scoreInput.trim()) return;
    setScoring(true);setScoreResult(null);
    const role=getRoleById(scoreRole)||ROLES[0];
    const prompt=`You are a technical sourcer at Crusoe Energy. Score this candidate for ${role.title}.
DO NOT HIRE if currently employed at: ${DNH.join(", ")}. Flag explicitly if detected.
RUBRIC (100 pts):
${role.rubric.map(r=>`- ${r.l} (${r.w} pts)`).join("\n")}
SIGNALS: ${role.signals.join(", ")}
CANDIDATE:
${scoreInput}
Respond ONLY in JSON (no markdown):
{"name":"","score":0,"recommendation":"Strong Yes/Yes/Maybe/No","dnh_flag":false,"dnh_reason":"","summary":"","signals_matched":[],"rubric_scores":[{"label":"","score":0,"max":0}],"pros":[],"cons":[],"outreach_worthy":true,"park_suggestion":false,"park_reason":""}`;
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const text=data.content?.find(b=>b.type==="text")?.text||"{}";
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      setScoreResult(parsed);
      if(parsed.name&&parsed.score&&!parsed.dnh_flag){
        setCandidates(cs=>[...cs,{id:Date.now(),name:parsed.name,role:scoreRole,company:"",title:"",score:parsed.score,stage:"Sourced",outreach:"",followUp:"",response:"",signals:parsed.signals_matched||[],notes:parsed.summary||"",location:"",relocation:false,source:"LinkedIn",linkedin:"",park:parsed.park_suggestion||false,parkReason:parsed.park_reason||"",parkDate:"",parkNote:parsed.park_reason||""}]);
      }
    }catch(e){setScoreResult({error:"Scoring failed."});}
    setScoring(false);
  }

  // ─── MESSAGE GEN ─────────────────────────────────────────────────────────────
  async function genMsg(cand,type){
    setMsgCand(cand);setMsgType(type);setMsgLoading(true);setMsgText("");
    const role=getRoleById(cand.role);
    const isInmail=type==="inmail";
    const prompt=isInmail
      ?`You are Shawn Johnsen, Sr. Sourcer at Crusoe Energy (internal, not agency). Write a LinkedIn InMail to this candidate.
RULES:
- Length: 1,600–1,800 characters (count carefully)
- Introduce as Shawn Johnsen, Sr. Sourcer at Crusoe Energy
- Sell Crusoe and the role FIRST — most critical element
- Explain specifically WHY reaching out based on their background
- 2–3 smart clarifying questions based on their specific experience
- Always include: sjohnsen@crusoe.ai and job link: ${role?.link||"[INSERT JD LINK]"}
- Ask for resume or application
- If not in Denver/Arvada: note on-site role in Arvada with relocation assistance
- NEVER include: other employee names, phone numbers, request for 15-min call
CRUSOE: ${CRUSOE_BIO}
ROLE: ${role?.title||"the role"}
JD: ${role?.jd||""}
CANDIDATE: ${cand.name}, ${cand.title} at ${cand.company} (${cand.location||""})
SIGNALS: ${cand.signals?.join(", ")||""}
Write the InMail now, output only message text:`
      :`You are Shawn Johnsen, Sr. Sourcer at Crusoe Energy. Write a 7-day follow-up to ${cand.name} who hasn't responded.
RULES: 800–1,200 characters. Brief re-intro. ONE compelling Crusoe/role reason. Low pressure. CTA: resume/apply. Include sjohnsen@crusoe.ai and ${role?.link||"[JD LINK]"}. NO employee names, phone, or 15-min call ask.
ROLE: ${role?.title} | CANDIDATE: ${cand.name}, ${cand.title} at ${cand.company}
Write follow-up, output only message text:`;
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      setMsgText(data.content?.find(b=>b.type==="text")?.text||"Generation failed.");
    }catch{setMsgText("Generation failed.");}
    setMsgLoading(false);
  }

  // ─── DASHBOARD ──────────────────────────────────────────────────────────────
  const renderDash = () => {
    const out=active.filter(c=>["Outreach Sent","Responded","Phone Screen","Submitted","Interviewing","Offer","Hired"].includes(c.stage)).length;
    const sub=active.filter(c=>["Submitted","Interviewing","Offer","Hired"].includes(c.stage)).length;
    const dueFU=active.filter(c=>c.followUp&&new Date(c.followUp)<=TODAY&&c.response!=="Replied"&&c.response!=="Not Interested").length;
    return(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
          <div><h1 style={{margin:0,fontSize:19,fontWeight:700}}>Sourcing Dashboard</h1><p style={{margin:"3px 0 0",color:"#6b7280",fontSize:12}}>Shawn Johnsen · Sr. Sourcer · Crusoe Energy · {TODAY.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p></div>
          <div style={{display:"flex",gap:8}}><button onClick={exportCSV} style={S.btn()}>↓ CSV</button></div>
        </div>
        <div style={S.g4}>
          {[{l:"Active Candidates",v:active.length,c:"#60a5fa",s:"in pipeline"},{l:"Outreach Sent",v:out,c:"#a78bfa",s:"InMails sent"},{l:"Submitted",v:sub,c:"#34d399",s:"to hiring managers"},{l:"Parked",v:parked.length,c:"#f59e0b",s:"revisit later"}].map(x=>(
            <div key={x.l} style={{...S.card(),borderLeft:`3px solid ${x.c}`}}>
              <div style={{fontSize:24,fontWeight:700,color:x.c}}>{x.v}</div>
              <div style={{fontSize:12,fontWeight:600,marginTop:2}}>{x.l}</div>
              <div style={{fontSize:11,color:"#6b7280",marginTop:1}}>{x.s}</div>
            </div>
          ))}
        </div>
        {dueFU>0&&<div style={{background:"#f59e0b11",border:"1px solid #f59e0b33",borderRadius:8,padding:"9px 14px",fontSize:13,color:"#f59e0b"}}>⚡ {dueFU} follow-up{dueFU>1?"s":""} overdue — check Pipeline.</div>}
        <div style={S.g2}>
          <div style={S.card()}>
            <div style={{fontSize:11,color:"#6b7280",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Active Roles ({ROLES.length})</div>
            {ROLES.map(r=>{
              const rc=active.filter(c=>c.role===r.id);
              return(<div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #1f2937",cursor:"pointer"}} onClick={()=>{setView("Pipeline");setRoleFilter(r.id);}}>
                <div><div style={{fontSize:12,fontWeight:500}}>{r.title}</div><div style={{fontSize:11,color:"#6b7280",marginTop:1}}>HM: {r.hm} · {r.recruiters.join(", ")}</div></div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#9ca3af"}}>{rc.length} cands</span>
                  <span style={S.badge("#22c55e")}>{r.status}</span>
                </div>
              </div>);
            })}
          </div>
          <div style={S.card()}>
            <div style={{fontSize:11,color:"#6b7280",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Pipeline by Stage</div>
            {STAGES.map(s=>{const n=active.filter(c=>c.stage===s).length;const pct=active.length?Math.round((n/active.length)*100):0;return n>0?(
              <div key={s} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}><span style={{color:"#d1d5db"}}>{s}</span><span style={{color:"#6b7280"}}>{n}</span></div>
                <div style={{background:"#1f2937",borderRadius:3,height:4}}><div style={{background:"#60a5fa",borderRadius:3,height:4,width:`${pct}%`}}/></div>
              </div>
            ):null;})}
            <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid #1f2937"}}>
              <div style={{fontSize:11,color:"#6b7280",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Historical Response Rates</div>
              {HIST_STATS.map(o=>(
                <div key={o.role} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
                  <span style={{color:"#9ca3af"}}>{o.role}</span>
                  <span style={{color:o.responseRate>=30?"#22c55e":o.responseRate>=20?"#f59e0b":"#ef4444",fontWeight:600}}>{o.responseRate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── PIPELINE ───────────────────────────────────────────────────────────────
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
          <button onClick={exportCSV} style={S.btn()}>↓ CSV</button>
        </div>
      </div>
      {compareIds.length>1&&(
        <div style={{...S.card(),background:"#1a1f2e",border:"1px solid #3b4fd8"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontWeight:600,fontSize:13}}>Comparing {compareIds.length} candidates</span><button onClick={()=>setCompareIds([])} style={S.btn()}>Clear</button></div>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${compareIds.length},1fr)`,gap:10}}>
            {compareIds.map(id=>{const c=candidates.find(x=>x.id===id);return c?(
              <div key={id} style={{background:"#111827",borderRadius:7,padding:12}}>
                <div style={{fontWeight:600,fontSize:13}}>{c.name}</div>
                <div style={{color:"#6b7280",fontSize:11,marginTop:2}}>{c.title} · {c.company}</div>
                <div style={{fontSize:24,fontWeight:700,color:sc(c.score),marginTop:6}}>{c.score||"—"}<span style={{fontSize:11,color:"#6b7280"}}>/100</span></div>
                <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:3}}>{(c.signals||[]).map(s=><span key={s} style={{background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e44",borderRadius:20,padding:"1px 7px",fontSize:10}}>✓ {s}</span>)}</div>
              </div>
            ):null;})}
          </div>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {filtered.length===0?<div style={{textAlign:"center",padding:36,color:"#4b5563"}}>No candidates match filters.</div>:
          filtered.map(c=>{
            const role=getRoleById(c.role);
            const fuDue=c.followUp&&new Date(c.followUp)<=TODAY&&c.response!=="Replied"&&c.response!=="Not Interested";
            const dnh=dnhCheck(c.company);
            const isCmp=compareIds.includes(c.id);
            return(
              <div key={c.id} style={{...S.card(),cursor:"pointer",border:isCmp?"1px solid #3b4fd8":dnh?"1px solid #ef444440":"1px solid #1f2937",position:"relative"}} onClick={()=>setSelCand(c)}>
                {fuDue&&<div style={{position:"absolute",top:10,right:10,...S.badge("#f59e0b")}}>⚡ Follow-up Due</div>}
                {dnh&&<div style={{position:"absolute",top:10,right:fuDue?140:10,...S.badge("#ef4444")}}>⛔ DNH: {dnh}</div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <div style={{fontSize:14,fontWeight:600}}>{c.name}</div>
                      {c.score>0&&<div style={{fontSize:13,fontWeight:700,color:sc(c.score)}}>{c.score}</div>}
                      {c.relocation&&<span style={S.badge("#60a5fa")}>Relocating</span>}
                      {c.location&&<span style={{fontSize:11,color:"#6b7280"}}>📍{c.location}</span>}
                    </div>
                    <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{c.title}{c.company?` · ${c.company}`:""}</div>
                    <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{role?.title||c.role} · Out: {fmt(c.outreach)} · FU: {fmt(c.followUp)}</div>
                  </div>
                  <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}} onClick={e=>e.stopPropagation()}>
                    <select value={c.stage} onChange={e=>setStageF(c.id,e.target.value)} style={{...S.inp,width:"auto",fontSize:11}}>
                      {STAGES.map(s=><option key={s}>{s}</option>)}
                    </select>
                    <select value={c.response||""} onChange={e=>setResponse(c.id,e.target.value)} style={{...S.inp,width:"auto",fontSize:11}}>
                      <option value="">Response</option>
                      {["No Response","Replied","Interested","Not Interested","Wrong Person"].map(r=><option key={r}>{r}</option>)}
                    </select>
                    <button onClick={()=>genMsg(c,"inmail")} style={{...S.btn("green"),fontSize:11,padding:"5px 8px"}}>✉ InMail</button>
                    <button onClick={()=>setCompareIds(ids=>ids.includes(c.id)?ids.filter(x=>x!==c.id):[...ids.slice(-2),c.id])} style={{...S.btn(isCmp?"primary":""),fontSize:11,padding:"5px 8px"}}>{isCmp?"✓":"Cmp"}</button>
                    <button onClick={()=>{setParkTarget(c.id);setParkForm({reason:"Just Started New Role",date:"",note:""});setShowPark(true);}} style={{...S.btn("warn"),fontSize:11,padding:"5px 8px"}}>🅿</button>
                  </div>
                </div>
                {(c.signals||[]).length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:7}}>{c.signals.map(s=><span key={s} style={{background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e44",borderRadius:20,padding:"1px 7px",fontSize:10}}>✓ {s}</span>)}</div>}
                {c.notes&&<div style={{fontSize:11,color:"#6b7280",marginTop:5,fontStyle:"italic"}}>{c.notes}</div>}
              </div>
            );
          })}
      </div>

      {/* CANDIDATE DETAIL MODAL */}
      {selCand&&(()=>{const c=selCand;const role=getRoleById(c.role);const dnh=dnhCheck(c.company);return(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}} onClick={()=>setSelCand(null)}>
          <div style={{background:"#111827",border:"1px solid #374151",borderRadius:12,padding:22,width:540,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
              <div><div style={{fontSize:17,fontWeight:700}}>{c.name}</div><div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>{c.title} · {c.company}</div><div style={{fontSize:11,color:"#6b7280",marginTop:1}}>{role?.title||c.role}</div></div>
              <div style={{fontSize:26,fontWeight:700,color:sc(c.score)}}>{c.score||"—"}</div>
            </div>
            {dnh&&<div style={{background:"#ef444415",border:"1px solid #ef444430",borderRadius:7,padding:"8px 12px",marginBottom:10,fontSize:12,color:"#ef4444"}}>⛔ DO NOT HIRE — {dnh}. {DNH_NOTES[dnh]||""}</div>}
            <div style={{...S.g2,marginBottom:12}}>{[["Stage",c.stage],["Response",c.response||"—"],["Outreach",fmt(c.outreach)],["Follow-up",fmt(c.followUp)],["Location",c.location||"—"],["Source",c.source||"—"]].map(([k,v])=>(
              <div key={k}><div style={{fontSize:10,color:"#6b7280"}}>{k}</div><div style={{fontSize:12,fontWeight:500,marginTop:1}}>{v}</div></div>
            ))}</div>
            {c.linkedin&&<div style={{marginBottom:8}}><a href={c.linkedin} target="_blank" rel="noreferrer" style={{color:"#60a5fa",fontSize:12,textDecoration:"none"}}>🔗 View on LinkedIn ↗</a></div>}
            {(c.signals||[]).length>0&&<div style={{marginBottom:10}}><div style={{fontSize:10,color:"#6b7280",marginBottom:4}}>SIGNALS</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{c.signals.map(s=><span key={s} style={{background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e44",borderRadius:20,padding:"2px 8px",fontSize:11}}>✓ {s}</span>)}</div></div>}
            {c.notes&&<div style={{marginBottom:10}}><div style={{fontSize:10,color:"#6b7280",marginBottom:3}}>NOTES</div><div style={{fontSize:12,color:"#d1d5db",lineHeight:1.6}}>{c.notes}</div></div>}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:"#6b7280",marginBottom:5}}>HM BRIEF</div>
              <div style={{background:"#0d1117",border:"1px solid #1f2937",borderRadius:7,padding:11,fontSize:12,color:"#d1d5db",lineHeight:1.7}}>
                <strong>{c.name}</strong> — {c.title} at {c.company||"[Co]"}. Score: {c.score||"TBD"}/100 for {role?.title||c.role}.<br/>
                Signals: {(c.signals||[]).join(", ")||"None"}. Stage: {c.stage}.{c.relocation?" Open to relocation to Arvada/Denver.":""}
                {c.notes?` ${c.notes}`:""}
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
        <div style={{background:"#111827",border:"1px solid #374151",borderRadius:12,padding:22,width:430,maxWidth:"95vw"}}>
          <h2 style={{margin:"0 0 14px",fontSize:15}}>Add Candidate Manually</h2>
          {[["Name *","name"],["Company","company"],["Title","title"],["Location","location"],["LinkedIn URL","linkedin"]].map(([l,k])=>(<div key={k} style={{marginBottom:10}}><label style={S.lbl}>{l}</label><input value={newC[k]} onChange={e=>setNewC(v=>({...v,[k]:e.target.value}))} style={S.inp}/></div>))}
          <div style={{marginBottom:10}}><label style={S.lbl}>Role</label><select value={newC.role} onChange={e=>setNewC(v=>({...v,role:e.target.value}))} style={S.inp}>{ROLES.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select></div>
          <div style={{marginBottom:10}}><label style={S.lbl}>Source</label><select value={newC.source} onChange={e=>setNewC(v=>({...v,source:e.target.value}))} style={S.inp}>{["LinkedIn","Referral","Indeed","Other"].map(s=><option key={s}>{s}</option>)}</select></div>
          <div style={{marginBottom:12}}><label style={S.lbl}>Notes</label><textarea value={newC.notes} onChange={e=>setNewC(v=>({...v,notes:e.target.value}))} rows={2} style={{...S.inp,resize:"vertical"}}/></div>
          <label style={{display:"flex",gap:8,alignItems:"center",fontSize:12,color:"#9ca3af",marginBottom:12,cursor:"pointer"}}><input type="checkbox" checked={newC.relocation} onChange={e=>setNewC(v=>({...v,relocation:e.target.checked}))}/>Open to relocation</label>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button onClick={()=>setShowAddC(false)} style={S.btn()}>Cancel</button><button onClick={addManual} style={S.btn("primary")}>Add</button></div>
        </div>
      </div>}

      {/* PARK MODAL */}
      {showPark&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
        <div style={{background:"#111827",border:"1px solid #f59e0b44",borderRadius:12,padding:22,width:380,maxWidth:"95vw"}}>
          <h2 style={{margin:"0 0 12px",fontSize:15,color:"#f59e0b"}}>🅿 Park for Later</h2>
          <div style={{marginBottom:10}}><label style={S.lbl}>Reason</label><select value={parkForm.reason} onChange={e=>setParkForm(v=>({...v,reason:e.target.value}))} style={S.inp}>{PARK_REASONS.map(r=><option key={r}>{r}</option>)}</select></div>
          <div style={{marginBottom:10}}><label style={S.lbl}>Re-engage Date</label><input type="date" value={parkForm.date} onChange={e=>setParkForm(v=>({...v,date:e.target.value}))} style={S.inp}/></div>
          <div style={{marginBottom:14}}><label style={S.lbl}>Note</label><textarea value={parkForm.note} onChange={e=>setParkForm(v=>({...v,note:e.target.value}))} rows={2} style={{...S.inp,resize:"vertical"}}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button onClick={()=>setShowPark(false)} style={S.btn()}>Cancel</button><button onClick={doPark} style={S.btn("warn")}>Park</button></div>
        </div>
      </div>}

      {/* MESSAGE MODAL */}
      {msgCand&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
        <div style={{background:"#111827",border:"1px solid #374151",borderRadius:12,padding:22,width:580,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div><div style={{fontSize:14,fontWeight:700}}>✉️ Message — {msgCand.name}</div><div style={{fontSize:11,color:"#6b7280"}}>{getRoleById(msgCand.role)?.title}</div></div>
            <button onClick={()=>{setMsgCand(null);setMsgText("");}} style={S.btn()}>✕</button>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <button onClick={()=>genMsg(msgCand,"inmail")} style={{...S.btn(msgType==="inmail"?"primary":""),flex:1}}>📨 Initial InMail (1,600–1,800)</button>
            <button onClick={()=>genMsg(msgCand,"followup")} style={{...S.btn(msgType==="followup"?"primary":""),flex:1}}>🔁 7-Day Follow-Up (800–1,200)</button>
          </div>
          {msgLoading&&<div style={{textAlign:"center",padding:20,color:"#6b7280"}}>⏳ Generating...</div>}
          {msgText&&<>
            <div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>~{msgText.length.toLocaleString()} characters</div>
            <textarea value={msgText} onChange={e=>setMsgText(e.target.value)} rows={14} style={{...S.inp,resize:"vertical",fontSize:12,lineHeight:1.5,marginBottom:10}}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{navigator.clipboard?.writeText(msgText);if(msgType==="inmail")setStageF(msgCand.id,"Outreach Sent");else setStageF(msgCand.id,"Outreach Sent");setMsgCand(null);setMsgText("");}} style={{...S.btn("green"),flex:1}}>📋 Copy & Mark Sent</button>
            </div>
          </>}
        </div>
      </div>}
    </div>
  );

  // ─── BULK ADD ────────────────────────────────────────────────────────────────
  const renderBulk = () => (
    <div style={{display:"flex",flexDirection:"column",gap:14,maxWidth:800}}>
      <h1 style={{margin:0,fontSize:18,fontWeight:700}}>📥 Bulk Add Candidates</h1>
      <div style={{...S.card(),background:"#0d1a2e",border:"1px solid #1e3a5f"}}>
        <div style={{fontSize:13,color:"#93c5fd",marginBottom:4,fontWeight:500}}>How to use this</div>
        <div style={{fontSize:12,color:"#6b7280",lineHeight:1.7}}>Paste one or more LinkedIn profiles (copy from the page — name, title, company, experience, skills, education). Separate multiple profiles with a blank line or just paste them back to back. AI will extract each candidate, score them against the selected role, and add them to the pipeline automatically.</div>
      </div>
      <div style={S.card()}>
        <div style={{marginBottom:12}}><label style={S.lbl}>Score against role</label>
          <select value={bulkRole} onChange={e=>setBulkRole(e.target.value)} style={{...S.inp,width:"auto"}}>
            {ROLES.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
        </div>
        <div style={{marginBottom:12}}><label style={S.lbl}>Paste profiles here (one or many)</label>
          <textarea value={bulkText} onChange={e=>setBulkText(e.target.value)} rows={12} style={{...S.inp,resize:"vertical",fontSize:12}} placeholder="Paste LinkedIn profile text here — name, title, company, experience, skills, education. Multiple profiles OK."/>
        </div>
        {bulkMsg&&<div style={{fontSize:12,color:bulkMsg.includes("Done")?"#22c55e":"#f59e0b",marginBottom:10}}>{bulkMsg}</div>}
        <button onClick={doBulkAdd} disabled={bulkLoading||!bulkText.trim()} style={{...S.btn("primary"),opacity:bulkLoading||!bulkText.trim()?0.5:1}}>
          {bulkLoading?"⏳ Processing...":"⚡ Process & Add to Pipeline"}
        </button>
      </div>
      {bulkResults.length>0&&(
        <div style={S.card()}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:10}}>Results — {bulkResults.filter(x=>x.added).length} added</div>
          {bulkResults.map((r,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #1f2937",flexWrap:"wrap",gap:6}}>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>{r.name}</div>
                <div style={{fontSize:11,color:"#6b7280"}}>{r.title} · {r.company}</div>
                {r.scoreReason&&<div style={{fontSize:11,color:"#9ca3af",marginTop:2,fontStyle:"italic"}}>{r.scoreReason}</div>}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {r.score>0&&<span style={{fontSize:16,fontWeight:700,color:sc(r.score)}}>{r.score}</span>}
                {r.dnh_flag?<span style={S.badge("#ef4444")}>⛔ DNH</span>:r.added?<span style={S.badge("#22c55e")}>✓ Added</span>:<span style={S.badge("#6b7280")}>Skipped</span>}
              </div>
            </div>
          ))}
          <button onClick={()=>{setBulkText("");setBulkResults([]);setBulkMsg("");}} style={{...S.btn(),marginTop:10,fontSize:11}}>Clear & Add More</button>
        </div>
      )}
    </div>
  );

  // ─── PARK FOR LATER ──────────────────────────────────────────────────────────
  const renderPark = () => {
    const dueToday=parked.filter(c=>c.parkDate&&new Date(c.parkDate)<=TODAY);
    return(
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <h1 style={{margin:0,fontSize:18,fontWeight:700}}>🅿 Parked — Talent Bank</h1>
        {dueToday.length>0&&<div style={{background:"#22c55e11",border:"1px solid #22c55e33",borderRadius:8,padding:"9px 14px",fontSize:13,color:"#22c55e"}}>🔔 {dueToday.length} candidate{dueToday.length>1?"s":""} ready to re-engage: {dueToday.map(c=>c.name).join(", ")}</div>}
        {parked.length===0?<div style={{textAlign:"center",padding:40,color:"#4b5563"}}>No parked candidates. Use 🅿 on any pipeline card.</div>:
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {parked.map(c=>{
              const role=getRoleById(c.role);
              const ready=c.parkDate&&new Date(c.parkDate)<=TODAY;
              return(
                <div key={c.id} style={{...S.card(),border:ready?"1px solid #22c55e44":"1px solid #f59e0b33"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                    <div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <div style={{fontSize:14,fontWeight:600}}>{c.name}</div>
                        {ready&&<span style={S.badge("#22c55e")}>🔔 Ready</span>}
                      </div>
                      <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{c.title}{c.company?` · ${c.company}`:""}</div>
                      <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>Role: <strong style={{color:"#d1d5db"}}>{role?.title||c.role}</strong> · Re-engage: {fmt(c.parkDate)}</div>
                      <div style={{fontSize:11,color:"#f59e0b",marginTop:2}}>{c.parkReason}</div>
                      {c.parkNote&&<div style={{fontSize:11,color:"#6b7280",marginTop:2,fontStyle:"italic"}}>{c.parkNote}</div>}
                      {c.linkedin&&<a href={c.linkedin} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#60a5fa",textDecoration:"none",display:"block",marginTop:3}}>🔗 LinkedIn ↗</a>}
                    </div>
                    <button onClick={()=>unpark(c.id)} style={S.btn("primary")}>↩ Unpark</button>
                  </div>
                </div>
              );
            })}
          </div>
        }
      </div>
    );
  };

  // ─── ROLES & INTEL ──────────────────────────────────────────────────────────
  const renderRoles = () => selRole?(()=>{const r=getRoleById(selRole);return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <button onClick={()=>setSelRole(null)} style={{...S.btn(),alignSelf:"flex-start"}}>← All Roles</button>
      <div style={S.card()}>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:12}}>
          <div><h2 style={{margin:0,fontSize:17}}>{r.title}</h2><div style={{color:"#6b7280",fontSize:12,marginTop:3}}>HM: {r.hm} · Sourcer: {r.sourcer} · Recruiter(s): {r.recruiters.join(", ")} · Assigned: {fmt(r.assigned)} · {r.comp}</div></div>
          <a href={r.link} target="_blank" rel="noreferrer" style={{...S.btn(),fontSize:12,textDecoration:"none",display:"inline-block"}}>Ashby ↗</a>
        </div>
        <div style={{marginBottom:12}}><div style={{fontSize:10,color:"#6b7280",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Job Description</div><div style={{fontSize:12,color:"#d1d5db",lineHeight:1.7,background:"#0d1117",border:"1px solid #1f2937",borderRadius:7,padding:11}}>{r.jd}</div></div>
        <div style={S.g2}>
          <div>
            <div style={{fontSize:10,color:"#6b7280",marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>Key Signals</div>
            {r.signals.map(s=><div key={s} style={{fontSize:12,color:"#22c55e",marginBottom:3}}>✓ {s}</div>)}
            {r.benchmarks.length>0&&<><div style={{fontSize:10,color:"#6b7280",marginTop:10,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>Benchmarks</div>{r.benchmarks.map(b=><div key={b} style={{fontSize:12,color:"#fbbf24"}}>⭐ {b}</div>)}</>}
          </div>
          <div>
            <div style={{fontSize:10,color:"#6b7280",marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>Scoring Rubric</div>
            {r.rubric.map(rb=>(
              <div key={rb.l} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}><span>{rb.l}</span><span style={{color:"#60a5fa"}}>{rb.w}pts</span></div>
                <div style={{background:"#1f2937",borderRadius:3,height:4}}><div style={{background:"#60a5fa",borderRadius:3,height:4,width:`${rb.w}%`}}/></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{marginTop:12}}><div style={{fontSize:10,color:"#6b7280",marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>Target Companies</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{r.targetCos.map(co=><span key={co} style={{background:"#1f2937",border:"1px solid #374151",borderRadius:20,padding:"2px 9px",fontSize:11,color:"#d1d5db"}}>{co}</span>)}</div></div>
        <div style={{marginTop:12}}><div style={{fontSize:10,color:"#6b7280",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Boolean String</div>
          <pre style={{background:"#0d1117",border:"1px solid #1f2937",borderRadius:7,padding:10,fontSize:11,color:"#86efac",overflowX:"auto",whiteSpace:"pre-wrap",margin:0}}>{r.boolean}</pre>
          <button onClick={()=>navigator.clipboard?.writeText(r.boolean)} style={{...S.btn(),fontSize:11,marginTop:5}}>Copy</button>
        </div>
        {r.notes&&<div style={{marginTop:10,background:"#0d1117",border:"1px solid #1f2937",borderRadius:7,padding:11}}><div style={{fontSize:10,color:"#6b7280",marginBottom:3}}>SOURCING NOTES</div><div style={{fontSize:12,color:"#d1d5db",lineHeight:1.6}}>{r.notes}</div></div>}
      </div>
    </div>
  );})():(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Roles & Sourcing Intel</h1>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:12}}>
        {ROLES.map(r=>{const rc=active.filter(c=>c.role===r.id);return(
          <div key={r.id} style={{...S.card(),cursor:"pointer"}} onClick={()=>setSelRole(r.id)}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontSize:13,fontWeight:600}}>{r.title}</div>
              <span style={S.badge("#22c55e")}>{r.status}</span>
            </div>
            <div style={{fontSize:11,color:"#6b7280",marginBottom:7}}>HM: {r.hm} · {r.comp}<br/>Assigned: {fmt(r.assigned)}</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:7}}>
              {r.signals.slice(0,3).map(s=><span key={s} style={{background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e44",borderRadius:20,padding:"1px 7px",fontSize:10}}>✓ {s}</span>)}
              {r.signals.length>3&&<span style={{fontSize:10,color:"#6b7280"}}>+{r.signals.length-3}</span>}
            </div>
            <div style={{fontSize:11,color:"#9ca3af"}}>{rc.length} candidates</div>
          </div>
        );})}
      </div>
    </div>
  );

  // ─── COMP INTEL ─────────────────────────────────────────────────────────────
  const renderCompIntel = () => (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Competitive Intelligence</h1>
      <div style={{...S.card(),background:"#1a0505",border:"1px solid #ef444433"}}>
        <div style={{fontSize:12,fontWeight:600,color:"#ef4444",marginBottom:8}}>⛔ DO NOT HIRE — Current Employees</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{DNH.map(co=>(
          <div key={co} style={{background:"#ef444415",border:"1px solid #ef444430",borderRadius:8,padding:"8px 12px"}}>
            <div style={{fontSize:12,fontWeight:600,color:"#ef4444"}}>{co}</div>
            <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{DNH_NOTES[co]}</div>
          </div>
        ))}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:10}}>
        {Object.entries(COMP_INTEL).filter(([,v])=>v.hire).map(([co,v])=>(
          <div key={co} style={S.card()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
              <div style={{fontSize:13,fontWeight:600}}>{co}</div>
              <span style={S.badge(v.tier.includes("Tier 1")?"#22c55e":"#60a5fa")}>{v.tier.split(" ")[0]+" "+v.tier.split(" ")[1]}</span>
            </div>
            <div style={{fontSize:12,color:"#9ca3af",lineHeight:1.6,marginBottom:6}}>{v.notes}</div>
            {v.roles.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{v.roles.map(r=><span key={r} style={{background:"#1f2937",border:"1px solid #374151",borderRadius:20,padding:"1px 7px",fontSize:10,color:"#9ca3af"}}>{r}</span>)}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  // ─── OUTREACH PERFORMANCE ────────────────────────────────────────────────────
  const renderOutreach = () => {
    const live=ROLES.map(r=>{
      const rc=active.filter(c=>c.role===r.id&&c.outreach);
      const replied=rc.filter(c=>["Replied","Interested"].includes(c.response)).length;
      const screens=rc.filter(c=>["Phone Screen","Submitted","Interviewing","Offer","Hired"].includes(c.stage)).length;
      const sub=rc.filter(c=>["Submitted","Interviewing","Offer","Hired"].includes(c.stage)).length;
      return{role:r.title,reachOuts:rc.length,responses:replied,responseRate:rc.length?Math.round((replied/rc.length)*100):0,phoneScreens:screens,screenRate:rc.length?Math.round((screens/rc.length)*100):0,submitted:sub};
    }).filter(s=>s.reachOuts>0);
    return(
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Outreach Performance</h1>
        <div style={S.card()}>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Historical Totals</div>
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr>{["Role","Reach-Outs","Responses","Resp %","Phone Screens","Screen %"].map(h=><th key={h} style={{textAlign:"left",padding:"5px 8px",color:"#6b7280",borderBottom:"1px solid #1f2937",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
            <tbody>{HIST_STATS.map(r=><tr key={r.role}>
              <td style={{padding:"6px 8px",color:"#d1d5db"}}>{r.role}</td>
              <td style={{padding:"6px 8px"}}>{r.reachOuts}</td>
              <td style={{padding:"6px 8px"}}>{r.responses}</td>
              <td style={{padding:"6px 8px",color:r.responseRate>=30?"#22c55e":r.responseRate>=20?"#f59e0b":"#ef4444",fontWeight:600}}>{r.responseRate}%</td>
              <td style={{padding:"6px 8px"}}>{r.phoneScreens}</td>
              <td style={{padding:"6px 8px",color:r.screenRate>=15?"#22c55e":r.screenRate>=8?"#f59e0b":"#ef4444",fontWeight:600}}>{r.screenRate}%</td>
            </tr>)}</tbody>
          </table></div>
          <div style={{marginTop:8,padding:"7px 9px",background:"#0d1117",borderRadius:6,fontSize:12,color:"#6b7280"}}>Overall: 68 reach-outs · 19 responses (27.9%) · 9 phone screens (13.2%) · 5 submits (7.4%)</div>
        </div>
        {live.length>0&&<div style={S.card()}>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Live Session Stats</div>
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr>{["Role","Outreach","Replied","Resp %","Screens","Submitted"].map(h=><th key={h} style={{textAlign:"left",padding:"5px 8px",color:"#6b7280",borderBottom:"1px solid #1f2937"}}>{h}</th>)}</tr></thead>
            <tbody>{live.map(r=><tr key={r.role}>
              <td style={{padding:"6px 8px",color:"#d1d5db"}}>{r.role}</td>
              <td style={{padding:"6px 8px"}}>{r.reachOuts}</td>
              <td style={{padding:"6px 8px"}}>{r.responses}</td>
              <td style={{padding:"6px 8px",color:r.responseRate>=30?"#22c55e":r.responseRate>=20?"#f59e0b":"#ef4444",fontWeight:600}}>{r.responseRate}%</td>
              <td style={{padding:"6px 8px"}}>{r.phoneScreens}</td>
              <td style={{padding:"6px 8px"}}>{r.submitted}</td>
            </tr>)}</tbody>
          </table></div>
        </div>}
      </div>
    );
  };

  // ─── ROLE HISTORY ─────────────────────────────────────────────────────────────
  const renderRoleHistory = () => (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Role Assignment History</h1>
      <div style={S.card()}>
        <div style={{fontSize:11,color:"#6b7280",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Active Roles</div>
        {ROLES.map(r=><div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #1f2937",flexWrap:"wrap",gap:6}}>
          <div><div style={{fontSize:13,fontWeight:500}}>{r.title}</div><div style={{fontSize:11,color:"#6b7280",marginTop:1}}>HM: {r.hm} · Recruiter(s): {r.recruiters.join(", ")} · Comp: {r.comp}</div></div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:12,color:"#9ca3af"}}>Assigned: {fmt(r.assigned)}</span><span style={S.badge("#22c55e")}>Active</span></div>
        </div>)}
      </div>
      <div style={S.card()}>
        <div style={{fontSize:11,color:"#6b7280",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Historical / Closed</div>
        {ROLE_HISTORY.map(r=><div key={r.role} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #1f2937",flexWrap:"wrap",gap:6}}>
          <div><div style={{fontSize:13,fontWeight:500}}>{r.role}</div><div style={{fontSize:11,color:"#6b7280",marginTop:1}}>HM: {r.hm} · Recruiter: {r.recruiter}{r.notes?` · ${r.notes}`:""}</div></div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:12,color:"#9ca3af"}}>Assigned: {fmt(r.assigned)}</span><span style={S.badge("#6b7280")}>{r.status}</span></div>
        </div>)}
      </div>
    </div>
  );

  // ─── INTAKE FORM ─────────────────────────────────────────────────────────────
  const renderIntake = () => {
    const saved=intakes[intakeRole];
    return(
      <div style={{display:"flex",flexDirection:"column",gap:14,maxWidth:660}}>
        <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Hiring Manager Intake</h1>
        <div style={{marginBottom:4}}><label style={S.lbl}>Role</label><select value={intakeRole} onChange={e=>setIntakeRole(e.target.value)} style={{...S.inp,width:"auto"}}>{ROLES.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select></div>
        {saved&&<div style={{background:"#22c55e11",border:"1px solid #22c55e33",borderRadius:7,padding:"7px 11px",fontSize:12,color:"#22c55e"}}>✓ Saved intake exists for this role.</div>}
        <div style={S.card()}>
          {[["Must-Haves (non-negotiable)","mustHaves","Absolute requirements?"],["Nice-to-Haves","niceToHaves","What makes a candidate stand out?"],["Deal-Breakers","dealBreakers","What immediately disqualifies?"],["Comp Range","comp","Salary, bonus, RSUs?"],["Relocation Policy","relocation","Available? On-site required?"],["Hiring Timeline","timeline","When does this need to be filled?"],["Additional Notes","notes","HM preferences, context..."]].map(([lbl,key,ph])=>(
            <div key={key} style={{marginBottom:12}}>
              <label style={S.lbl}>{lbl}</label>
              {["mustHaves","niceToHaves","dealBreakers","notes"].includes(key)?
                <textarea value={intakeData[key]} onChange={e=>setIntakeData(v=>({...v,[key]:e.target.value}))} placeholder={ph} rows={2} style={{...S.inp,resize:"vertical"}}/>:
                <input value={intakeData[key]} onChange={e=>setIntakeData(v=>({...v,[key]:e.target.value}))} placeholder={ph} style={S.inp}/>
              }
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
      `Sourcer: Shawn Johnsen | Sr. Sourcer, Crusoe Energy`,``,
      `ACTIVE ROLES (${deptRoles.length})`,`${"─".repeat(52)}`,
      ...deptRoles.flatMap(r=>{
        const rc=active.filter(c=>c.role===r.id);
        const out=rc.filter(c=>["Outreach Sent","Responded","Phone Screen","Submitted","Interviewing","Offer","Hired"].includes(c.stage)).length;
        const sub=rc.filter(c=>["Submitted","Interviewing","Offer","Hired"].includes(c.stage)).length;
        const rep=rc.filter(c=>["Replied","Interested"].includes(c.response)).length;
        return[`${r.title} (HM: ${r.hm} | Recruiter: ${r.recruiters.join(", ")})`,`  Assigned: ${fmt(r.assigned)} | Sourced: ${rc.length} | Outreach: ${out} | Replies: ${rep} | Submitted: ${sub}`,``];
      }),
      `PIPELINE SUMMARY`,`${"─".repeat(52)}`,
      ...STAGES.map(s=>{const n=active.filter(c=>c.stage===s).length;return n>0?`${s}: ${n}`:""}).filter(Boolean),
      `Parked for Later: ${parked.length}`,``,
      `THIS WEEK'S ACTIVITY`,`${"─".repeat(52)}`,
      `Outreach sent this week: ${thisWeek.length}`,
      `Total active candidates: ${active.length}`,``,
      `NOTES / BLOCKERS`,`${"─".repeat(52)}`,`[Add notes here]`,
    ].join("\n");
    return(
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Weekly Update — {weeklyDept}</h1>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setWeeklyDept("Manufacturing")} style={S.btn(weeklyDept==="Manufacturing"?"primary":"")}>Manufacturing</button>
            <button onClick={()=>setWeeklyDept("Other")} style={S.btn(weeklyDept!=="Manufacturing"?"primary":"")}>Other</button>
            <button onClick={()=>navigator.clipboard?.writeText(lines)} style={S.btn()}>Copy Report</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10}}>
          {deptRoles.map(r=>{
            const rc=active.filter(c=>c.role===r.id);
            const out=rc.filter(c=>["Outreach Sent","Responded","Phone Screen","Submitted","Interviewing","Offer","Hired"].includes(c.stage)).length;
            const sub=rc.filter(c=>["Submitted","Interviewing","Offer","Hired"].includes(c.stage)).length;
            return(
              <div key={r.id} style={S.card()}>
                <div style={{fontSize:12,fontWeight:600,marginBottom:4}}>{r.title}</div>
                <div style={{fontSize:10,color:"#6b7280",marginBottom:8}}>HM: {r.hm}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>
                  {[["Sourced",rc.length,"#60a5fa"],["Outreach",out,"#a78bfa"],["Submitted",sub,"#34d399"]].map(([l,v,c])=>(
                    <div key={l} style={{textAlign:"center",background:"#0d1117",borderRadius:5,padding:"5px 2px"}}>
                      <div style={{fontSize:15,fontWeight:700,color:c}}>{v}</div>
                      <div style={{fontSize:9,color:"#6b7280"}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div style={S.card()}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>Report Preview</div>
          <pre style={{background:"#0d1117",border:"1px solid #1f2937",borderRadius:7,padding:12,fontSize:11,color:"#d1d5db",lineHeight:1.7,overflowX:"auto",whiteSpace:"pre-wrap",margin:0}}>{lines}</pre>
        </div>
      </div>
    );
  };

  // ─── SCORE A CANDIDATE ───────────────────────────────────────────────────────
  const renderScore = () => (
    <div style={{display:"flex",flexDirection:"column",gap:14,maxWidth:740}}>
      <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Score a Candidate</h1>
      <div style={S.card()}>
        <div style={{marginBottom:10}}><label style={S.lbl}>Score against role</label><select value={scoreRole} onChange={e=>setScoreRole(e.target.value)} style={{...S.inp,width:"auto"}}>{ROLES.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select></div>
        <div style={{marginBottom:10}}><label style={S.lbl}>Paste LinkedIn profile or resume text</label><textarea value={scoreInput} onChange={e=>setScoreInput(e.target.value)} placeholder="Paste full profile content here..." rows={9} style={{...S.inp,resize:"vertical"}}/></div>
        <div style={{fontSize:11,color:"#ef4444",marginBottom:8}}>⛔ Auto-flags: {DNH.join(", ")}</div>
        <button onClick={doScore} disabled={scoring||!scoreInput.trim()} style={{...S.btn("primary"),opacity:scoring||!scoreInput.trim()?0.5:1}}>{scoring?"⏳ Scoring...":"⚡ Score Candidate"}</button>
      </div>
      {scoreResult&&<div style={S.card()}>
        {scoreResult.error?<div style={{color:"#ef4444"}}>{scoreResult.error}</div>:(
          <>
            {scoreResult.dnh_flag&&<div style={{background:"#ef444415",border:"1px solid #ef444430",borderRadius:7,padding:"9px 12px",marginBottom:10,fontSize:13,color:"#ef4444",fontWeight:600}}>⛔ DO NOT HIRE — {scoreResult.dnh_reason}</div>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div><div style={{fontSize:17,fontWeight:700}}>{scoreResult.name}</div><div style={{fontSize:12,color:"#9ca3af",marginTop:3}}>{scoreResult.summary}</div></div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:30,fontWeight:700,color:sc(scoreResult.score)}}>{scoreResult.score}</div>
                <div style={{fontSize:11,color:"#6b7280"}}>/100</div>
                <span style={S.badge(scoreResult.outreach_worthy?"#22c55e":"#ef4444")}>{scoreResult.recommendation}</span>
              </div>
            </div>
            <div style={S.g2}>
              <div><div style={{fontSize:10,color:"#6b7280",marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>Rubric Breakdown</div>
                {(scoreResult.rubric_scores||[]).map(rb=>(
                  <div key={rb.label} style={{marginBottom:7}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}><span>{rb.label}</span><span style={{color:sc((rb.score/rb.max)*100)}}>{rb.score}/{rb.max}</span></div>
                    <div style={{background:"#1f2937",borderRadius:3,height:4}}><div style={{background:"#60a5fa",borderRadius:3,height:4,width:`${(rb.score/rb.max)*100}%`}}/></div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{marginBottom:8}}><div style={{fontSize:10,color:"#22c55e",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Pros</div>{(scoreResult.pros||[]).map(p=><div key={p} style={{fontSize:12,color:"#d1d5db",marginBottom:2}}>✓ {p}</div>)}</div>
                <div><div style={{fontSize:10,color:"#ef4444",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Cons</div>{(scoreResult.cons||[]).map(c=><div key={c} style={{fontSize:12,color:"#d1d5db",marginBottom:2}}>✗ {c}</div>)}</div>
              </div>
            </div>
            {(scoreResult.signals_matched||[]).length>0&&<div style={{marginTop:8}}><div style={{fontSize:10,color:"#6b7280",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Matched Signals</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{scoreResult.signals_matched.map(s=><span key={s} style={{background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e44",borderRadius:20,padding:"2px 8px",fontSize:11}}>✓ {s}</span>)}</div></div>}
            {scoreResult.outreach_worthy&&!scoreResult.dnh_flag&&<div style={{marginTop:10,padding:9,background:"#22c55e11",border:"1px solid #22c55e33",borderRadius:7,fontSize:12,color:"#22c55e"}}>✓ Added to Pipeline. Go to Pipeline to generate outreach.</div>}
            {scoreResult.park_suggestion&&<div style={{marginTop:6,padding:9,background:"#f59e0b11",border:"1px solid #f59e0b33",borderRadius:7,fontSize:12,color:"#f59e0b"}}>🅿 Park suggestion: {scoreResult.park_reason}</div>}
          </>
        )}
      </div>}
    </div>
  );

  return(
    <div style={S.app}>
      <div style={S.hdr}>
        <div style={{flexShrink:0}}><div style={{fontSize:9,letterSpacing:3,color:"#6b7280",textTransform:"uppercase"}}>Crusoe Energy · Internal</div><div style={{fontSize:13,fontWeight:700}}>Sourcing Command Center</div></div>
        <nav style={{display:"flex",gap:2,flexWrap:"wrap",justifyContent:"center"}}>{VIEWS.map(v=><button key={v} onClick={()=>{setView(v);setSelCand(null);setSelRole(null);}} style={S.nav(view===v)}>{v}</button>)}</nav>
        <div style={{fontSize:11,color:"#6b7280",flexShrink:0}}>Shawn · Sr. Sourcer</div>
      </div>
      <div style={S.main}>
        {view==="Dashboard"&&renderDash()}
        {view==="Pipeline"&&renderPipeline()}
        {view==="Bulk Add"&&renderBulk()}
        {view==="Park for Later"&&renderPark()}
        {view==="Roles & Intel"&&renderRoles()}
        {view==="Comp Intel"&&renderCompIntel()}
        {view==="Outreach Performance"&&renderOutreach()}
        {view==="Role History"&&renderRoleHistory()}
        {view==="Intake Form"&&renderIntake()}
        {view==="Weekly Update"&&renderWeekly()}
        {view==="Score a Candidate"&&renderScore()}
      </div>
    </div>
  );
}
