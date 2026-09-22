import type { Listing, ListingCompatibility, Seller } from "./types";

type SellerKey = "a" | "b" | "c" | "d";

const sellers: Record<SellerKey, Seller> = {
  a: { id: "11111111-1111-1111-1111-111111111111", display_name: "Dani Garage", location: "Telde, Gran Canaria", phone: null, whatsapp: null, avatar_url: null, seller_kind:"professional", created_at:"2025-11-10T10:00:00.000Z" },
  b: { id: "22222222-2222-2222-2222-222222222222", display_name: "Marta R.", location: "Las Palmas de Gran Canaria", phone: null, whatsapp: null, avatar_url: null, seller_kind:"private", created_at:"2026-02-03T10:00:00.000Z" },
  c: { id: "33333333-3333-3333-3333-333333333333", display_name: "Javi Parts", location: "Vecindario, Gran Canaria", phone: null, whatsapp: null, avatar_url: null, seller_kind:"professional", created_at:"2025-09-18T10:00:00.000Z" },
  d: { id: "44444444-4444-4444-4444-444444444444", display_name: "Motor Sur GC", location: "Arinaga, Gran Canaria", phone: null, whatsapp: null, avatar_url: null, seller_kind:"professional", created_at:"2025-06-02T10:00:00.000Z" }
};

const now = new Date();
function d(days: number) { return new Date(now.getTime() - days * 86400000).toISOString(); }

const images = {
  car: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
  engine: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80",
  lights: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80"
};

type CommonArgs = {
  id:number; seller:SellerKey; title:string; slug:string; description:string; brand:string; model:string;
  generation:string|null; year:number|null; engine:string|null; condition:"Como nueva"|"Buen estado"|"Usada"|"Para reparar";
  price:number|null; location:string; latitude:number; longitude:number; mileage:number|null; days:number;
  reference?:string|null; technical?:string|null; status?:"available"|"reserved"|"sold"; image?:"car"|"engine"|"lights";
  compatibilities?:ListingCompatibility[];
};

type PartArgs = CommonArgs & { category:string };
type VehicleArgs = CommonArgs & { parts:string[] };

function id(value:number){return "a0000000-0000-0000-0000-"+String(value).padStart(12,"0");}

function part(args:PartArgs):Listing{
  return {
    id:id(args.id), seller_id:sellers[args.seller].id, type:"part", title:args.title, slug:args.slug, description:args.description,
    brand:args.brand, model:args.model, generation:args.generation, year:args.year, engine:args.engine, category:args.category,
    condition:args.condition, price:args.price, location:args.location, latitude:args.latitude, longitude:args.longitude,
    mileage:args.mileage, available_parts:null, reference_code:args.reference??null, technical_notes:args.technical??null,
    shipping_available:true, pickup_available:true, status:args.status??"available", hidden:false, created_at:d(args.days), updated_at:d(Math.max(0,args.days-1)),
    listing_images:[{public_url:images[args.image??"engine"],position:0}], listing_compatibilities:args.compatibilities??[],
    seller:sellers[args.seller], is_demo:true
  };
}

function vehicle(args:VehicleArgs):Listing{
  return {
    id:id(args.id), seller_id:sellers[args.seller].id, type:"vehicle", title:args.title, slug:args.slug, description:args.description,
    brand:args.brand, model:args.model, generation:args.generation, year:args.year, engine:args.engine, category:null,
    condition:args.condition, price:args.price, location:args.location, latitude:args.latitude, longitude:args.longitude,
    mileage:args.mileage, available_parts:args.parts, reference_code:null, technical_notes:args.technical??null,
    shipping_available:false, pickup_available:true, status:args.status??"available", hidden:false, created_at:d(args.days), updated_at:d(Math.max(0,args.days-1)),
    listing_images:[{public_url:images.car,position:0}], seller:sellers[args.seller], is_demo:true
  };
}

export const demoListings: Listing[] = [
  part({id:1,seller:"a",title:"Faro LED Volkswagen Golf 7 derecho",slug:"faro-led-volkswagen-golf-7-a00001",description:"Faro delantero derecho OEM, patillas completas y sin humedad.",brand:"Volkswagen",model:"Golf",generation:"VII",year:2018,engine:"1.6 TDI",category:"Iluminación",condition:"Buen estado",price:180,location:"Telde, Gran Canaria",latitude:27.99,longitude:-15.42,mileage:null,days:0,reference:"5G1941036",technical:"LED completo, lado acompañante.",image:"lights"}),
  part({id:2,seller:"c",title:"Caja de cambios Polo AW 1.0 TSI",slug:"caja-cambios-polo-aw-10-tsi-a00002",description:"Caja manual comprobada antes del desmontaje.",brand:"Volkswagen",model:"Polo",generation:"AW",year:2020,engine:"1.0 TSI",category:"Transmisión",condition:"Usada",price:620,location:"Vecindario, Gran Canaria",latitude:27.85,longitude:-15.45,mileage:78000,days:1,technical:"Se entrega sin embrague."}),
  part({id:3,seller:"b",title:"Motor BMW E46 320d M47",slug:"motor-bmw-e46-320d-m47-a00003",description:"Motor completo. Arrancaba y circulaba antes de desmontar.",brand:"BMW",model:"Serie 3",generation:"E46",year:2003,engine:"320d M47",category:"Motor",condition:"Usada",price:950,location:"Las Palmas de Gran Canaria",latitude:28.12,longitude:-15.43,mileage:210000,days:2,reference:"M47D20",technical:"Incluye turbo e inyección.",status:"reserved"}),
  vehicle({id:4,seller:"a",title:"SEAT Ibiza 6J 1.6 TDI para despiece",slug:"seat-ibiza-6j-despiece-a00004",description:"Golpe trasero. Motor, frontal e interior aprovechables.",brand:"SEAT",model:"Ibiza",generation:"6J",year:2011,engine:"1.6 TDI",condition:"Usada",price:1500,location:"Telde, Gran Canaria",latitude:27.99,longitude:-15.42,mileage:168000,days:3,parts:["Motor","Caja de cambios","Turbo","Faros","Puertas delanteras","Interior","Centralita"]}),
  part({id:5,seller:"c",title:"Piloto trasero Audi A3 8V izquierdo",slug:"piloto-trasero-audi-a3-8v-a00005",description:"Piloto exterior izquierdo, conector intacto.",brand:"Audi",model:"A3",generation:"8V",year:2016,engine:"2.0 TDI",category:"Iluminación",condition:"Buen estado",price:95,location:"Vecindario, Gran Canaria",latitude:27.85,longitude:-15.45,mileage:null,days:7,status:"sold",image:"lights"}),
  vehicle({id:6,seller:"b",title:"Honda Civic VIII 1.8 para piezas",slug:"honda-civic-viii-18-piezas-a00006",description:"Motor averiado por calentón. Carrocería, cambio, interior y electrónica disponibles.",brand:"Honda",model:"Civic",generation:"VIII",year:2008,engine:"1.8 i-VTEC",condition:"Para reparar",price:900,location:"Las Palmas de Gran Canaria",latitude:28.12,longitude:-15.43,mileage:196000,days:4,parts:["Caja de cambios","Asientos","Puertas","Cuadro","Alternador"]}),
  part({id:7,seller:"c",title:"Alternador Volkswagen Polo AW 1.0 TSI",slug:"alternador-vw-polo-aw-10-tsi-a00007",description:"Alternador comprobado, procedente de Polo AW con 54.000 km.",brand:"Volkswagen",model:"Polo",generation:"AW",year:2021,engine:"1.0 TSI",category:"Electrónica",condition:"Buen estado",price:140,location:"Vecindario, Gran Canaria",latitude:27.85,longitude:-15.45,mileage:54000,days:5,reference:"04C903023",compatibilities:[
    {brand:"Volkswagen",model:"Polo",generation:"AW",year_from:2018,year_to:2024,engine:"1.0 TSI"},
    {brand:"SEAT",model:"Ibiza",generation:"KJ",year_from:2018,year_to:2024,engine:"1.0 TSI"}
  ]}),
  part({id:8,seller:"a",title:"Paragolpes delantero Renault Clio IV",slug:"paragolpes-delantero-renault-clio-iv-a00008",description:"Original, con marcas de uso pero sin grietas ni reparaciones.",brand:"Renault",model:"Clio",generation:"IV",year:2017,engine:"0.9 TCe",category:"Carrocería",condition:"Usada",price:120,location:"Telde, Gran Canaria",latitude:27.99,longitude:-15.42,mileage:null,days:6,image:"car"}),
  part({id:9,seller:"d",title:"Turbo SEAT Ibiza 6J 1.6 TDI",slug:"turbo-seat-ibiza-6j-16-tdi-a00009",description:"Turbo sin holgura apreciable, desmontado de vehículo en marcha.",brand:"SEAT",model:"Ibiza",generation:"6J",year:2012,engine:"1.6 TDI",category:"Motor",condition:"Buen estado",price:260,location:"Arinaga, Gran Canaria",latitude:27.86,longitude:-15.40,mileage:142000,days:1,reference:"03L253056G"}),
  part({id:10,seller:"a",title:"Centralita motor Golf 7 1.6 TDI",slug:"centralita-motor-golf-7-16-tdi-a00010",description:"ECU procedente de Golf VII 1.6 TDI. Se entrega para codificación.",brand:"Volkswagen",model:"Golf",generation:"VII",year:2015,engine:"1.6 TDI",category:"Electrónica",condition:"Usada",price:170,location:"Telde, Gran Canaria",latitude:27.99,longitude:-15.42,mileage:126000,days:2,reference:"04L907309R",technical:"Requiere adaptación al vehículo."}),
  part({id:11,seller:"c",title:"Retrovisor derecho Volkswagen Polo AW",slug:"retrovisor-derecho-polo-aw-a00011",description:"Retrovisor eléctrico derecho con carcasa negra.",brand:"Volkswagen",model:"Polo",generation:"AW",year:2020,engine:"1.0 TSI",category:"Carrocería",condition:"Buen estado",price:85,location:"Vecindario, Gran Canaria",latitude:27.85,longitude:-15.45,mileage:null,days:3,image:"car"}),
  part({id:12,seller:"b",title:"Caja de cambios BMW E46 320d",slug:"caja-cambios-bmw-e46-320d-a00012",description:"Caja manual de 5 velocidades, engranajes sin ruidos antes del desmontaje.",brand:"BMW",model:"Serie 3",generation:"E46",year:2002,engine:"320d M47",category:"Transmisión",condition:"Usada",price:390,location:"Las Palmas de Gran Canaria",latitude:28.12,longitude:-15.43,mileage:198000,days:4}),
  part({id:13,seller:"a",title:"Faro delantero SEAT Ibiza 6J izquierdo",slug:"faro-seat-ibiza-6j-izquierdo-a00013",description:"Faro halógeno izquierdo, soportes completos.",brand:"SEAT",model:"Ibiza",generation:"6J",year:2011,engine:"1.6 TDI",category:"Iluminación",condition:"Buen estado",price:75,location:"Telde, Gran Canaria",latitude:27.99,longitude:-15.42,mileage:null,days:5,reference:"6J1941005",image:"lights"}),
  part({id:14,seller:"d",title:"Alternador BMW E46 320d M47",slug:"alternador-bmw-e46-320d-a00014",description:"Alternador probado en banco antes de publicar.",brand:"BMW",model:"Serie 3",generation:"E46",year:2004,engine:"320d M47",category:"Electrónica",condition:"Buen estado",price:110,location:"Arinaga, Gran Canaria",latitude:27.86,longitude:-15.40,mileage:176000,days:6}),
  vehicle({id:15,seller:"d",title:"SEAT León 5F 2.0 TDI para despiece",slug:"seat-leon-5f-20-tdi-despiece-a00015",description:"Golpe lateral. Mecánica, frontal y parte del interior disponibles.",brand:"SEAT",model:"León",generation:"5F",year:2016,engine:"2.0 TDI",condition:"Usada",price:2400,location:"Arinaga, Gran Canaria",latitude:27.86,longitude:-15.40,mileage:154000,days:8,parts:["Motor","Caja DSG","Turbo","Faros LED","Portón","Salpicadero","Llantas"]}),
  part({id:16,seller:"c",title:"Paragolpes delantero Audi A3 8V",slug:"paragolpes-delantero-audi-a3-8v-a00016",description:"Paragolpes estándar sin parrilla. Tiene roces superficiales.",brand:"Audi",model:"A3",generation:"8V",year:2015,engine:"2.0 TDI",category:"Carrocería",condition:"Usada",price:145,location:"Vecindario, Gran Canaria",latitude:27.85,longitude:-15.45,mileage:null,days:9,image:"car"}),
  part({id:17,seller:"b",title:"Alternador Honda Civic VIII 1.8",slug:"alternador-honda-civic-viii-18-a00017",description:"Alternador original en funcionamiento antes del desmontaje.",brand:"Honda",model:"Civic",generation:"VIII",year:2008,engine:"1.8 i-VTEC",category:"Electrónica",condition:"Usada",price:105,location:"Las Palmas de Gran Canaria",latitude:28.12,longitude:-15.43,mileage:196000,days:10}),
  vehicle({id:18,seller:"a",title:"Volkswagen Golf VII 1.6 TDI para despiece",slug:"volkswagen-golf-vii-16-tdi-despiece-a00018",description:"Accidente trasero. Frontal, motor y electrónica en buen estado.",brand:"Volkswagen",model:"Golf",generation:"VII",year:2018,engine:"1.6 TDI",condition:"Usada",price:2800,location:"Telde, Gran Canaria",latitude:27.99,longitude:-15.42,mileage:132000,days:11,parts:["Motor","Caja de cambios","Faro derecho","Centralita","Puertas delanteras","Llantas","Salpicadero"]}),
  part({id:19,seller:"c",title:"Puerta delantera derecha Volkswagen Polo AW",slug:"puerta-delantera-derecha-polo-aw-a00019",description:"Puerta completa sin retrovisor. Color blanco, pequeña marca inferior.",brand:"Volkswagen",model:"Polo",generation:"AW",year:2020,engine:"1.0 TSI",category:"Carrocería",condition:"Buen estado",price:190,location:"Vecindario, Gran Canaria",latitude:27.85,longitude:-15.45,mileage:null,days:12,image:"car"}),
  part({id:20,seller:"a",title:"Piloto trasero Renault Clio IV derecho",slug:"piloto-trasero-renault-clio-iv-a00020",description:"Piloto derecho completo, sin fisuras y con portalámparas.",brand:"Renault",model:"Clio",generation:"IV",year:2017,engine:"0.9 TCe",category:"Iluminación",condition:"Buen estado",price:58,location:"Telde, Gran Canaria",latitude:27.99,longitude:-15.42,mileage:null,days:13,image:"lights"})
];
