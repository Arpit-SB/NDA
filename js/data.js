const DATA={
subjects:[
{id:"math",name:"Mathematics",code:"MATH",icon:"∑",desc:"Algebra, calculus, matrices, trigonometry and geometry."},
{id:"physics",name:"Physics",code:"PHY",icon:"⚡",desc:"Mechanics, waves, optics, electricity and modern physics."},
{id:"chemistry",name:"Chemistry",code:"CHEM",icon:"◈",desc:"Physical, inorganic and organic chemistry."},
{id:"biology",name:"Biology",code:"BIO",icon:"✦",desc:"Human biology, ecology and life science."},
{id:"history",name:"History",code:"HIS",icon:"⌛",desc:"Ancient, medieval, modern India and world history."},
{id:"geography",name:"Geography",code:"GEO",icon:"◎",desc:"Physical, Indian and world geography."},
{id:"polity",name:"Polity",code:"POL",icon:"⚖",desc:"Constitution, governance and institutions."},
{id:"english",name:"English",code:"ENG",icon:"Aa",desc:"Grammar, vocabulary and comprehension."}],
chapters:[
{id:"m1",subject:"math",name:"Algebra",progress:68,items:42},{id:"m2",subject:"math",name:"Matrices & Determinants",progress:42,items:28},
{id:"m3",subject:"math",name:"Trigonometry",progress:81,items:51},{id:"m4",subject:"math",name:"Differential Calculus",progress:25,items:38},
{id:"p1",subject:"physics",name:"Mechanics",progress:54,items:64},{id:"p2",subject:"physics",name:"Work, Energy & Power",progress:71,items:31},
{id:"c1",subject:"chemistry",name:"Chemical Bonding",progress:47,items:35},{id:"b1",subject:"biology",name:"Human Physiology",progress:35,items:44},
{id:"h1",subject:"history",name:"Modern India",progress:59,items:50},{id:"g1",subject:"geography",name:"Indian Geography",progress:77,items:39},
{id:"pol1",subject:"polity",name:"Indian Constitution",progress:63,items:45},{id:"e1",subject:"english",name:"Vocabulary",progress:72,items:70}],
questions:[
{id:"q1",subject:"math",chapter:"m1",q:"If x + 1/x = 3, then x² + 1/x² is:",opts:["5","7","9","11"],ans:1,exp:"Squaring gives x² + 2 + 1/x² = 9, so the answer is 7."},
{id:"q2",subject:"physics",chapter:"p2",q:"The work done by a force perpendicular to displacement is:",opts:["Maximum","Minimum","Zero","Negative"],ans:2,exp:"W = Fs cosθ. At 90°, cosθ = 0."},
{id:"q3",subject:"chemistry",chapter:"c1",q:"The molecular shape of XeF4 is:",opts:["Tetrahedral","Square planar","Trigonal planar","Linear"],ans:1,exp:"XeF4 has six electron domains: four bond pairs and two lone pairs."},
{id:"q4",subject:"biology",chapter:"b1",q:"The functional unit of kidney is:",opts:["Neuron","Nephron","Alveolus","Villus"],ans:1,exp:"Nephron is the structural and functional unit of the kidney."}],
tests:[
{id:"t1",name:"Mathematics Mini Test",type:"Mini Test",duration:10,questions:["q1"]},
{id:"t2",name:"Physics Chapter Test",type:"Chapter Test",duration:10,questions:["q2"]},
{id:"t3",name:"Chemistry Chapter Test",type:"Chapter Test",duration:10,questions:["q3"]},
{id:"t4",name:"GAT Quick Test",type:"GAT",duration:15,questions:["q2","q3","q4"]}],
lectures:[{id:"l1",title:"Mechanics — Newton's Laws",subject:"Physics",chapter:"Mechanics",duration:"42 min",url:"#",published:true}],
notes:[{id:"n1",title:"NDA Mechanics Formula Sheet",subject:"Physics",type:"Formula Sheet",url:"#",published:true}],
books:[{id:"b1",title:"NDA Mathematics Practice PDF",subject:"Mathematics",type:"Practice PDF",url:"#",published:true}],
currentAffairs:[{id:"ca1",date:"2026-09-01",cat:"Defence",title:"Demo Defence Update",text:"Replace this sample with verified current affairs from the admin panel."}]
};